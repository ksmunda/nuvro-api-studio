/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Phase 5: API Request Engine Test Suite
 *
 * Tests cover:
 *   - SSRF protection (IPv4/IPv6 private ranges, link-local, metadata endpoints)
 *   - Redirect-chain SSRF (open-redirect attacks)
 *   - Variable interpolation (strict mode — missing variables throw)
 *   - Response size limiting
 *   - Timeout enforcement via AbortSignal
 *   - Authentication injection (Bearer, Basic, API Key header/query)
 *   - Sensitive header redaction in responses
 *   - DNS resolver IP passthrough
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isPrivateIp, validateUrlForSsrf } from '../services/ssrf-validator.js';
import { interpolateVariables, interpolateVariablesStrict } from '@nuvro/core';
import { RequestExecutionService } from '../services/request-execution.js';

// ---------------------------------------------------------------------------
// Mock env config so MAX_RESPONSE_SIZE_MB can be controlled per-test
// ---------------------------------------------------------------------------
const { mockEnv } = vi.hoisted(() => {
  const mockEnv = {
    REQUEST_TIMEOUT_MS: 30000,
    MAX_RESPONSE_SIZE_MB: 10,
  };
  return { mockEnv };
});

vi.mock('../config/env.js', () => ({
  env: mockEnv,
}));

// ---------------------------------------------------------------------------
// DNS mock — use a module-level spy so it is properly typed
// ---------------------------------------------------------------------------
const mockDnsLookupFn = vi.fn<(hostname: string) => Promise<string[]>>();

vi.mock('../services/dns-resolver.js', () => ({
  dnsLookup: (hostname: string) => mockDnsLookupFn(hostname),
}));

// ---------------------------------------------------------------------------
// Mock global fetch to avoid real network calls
// ---------------------------------------------------------------------------
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Builds a minimal valid ExecuteRequestInput */
function buildRequest(overrides: Record<string, any> = {}): any {
  return {
    method: 'GET',
    url: 'https://api.example.com/data',
    headers: [],
    queryParams: [],
    bodyType: 'NONE',
    bodyContent: null,
    authType: 'NONE',
    authConfig: null,
    variables: {},
    timeoutMs: 5000,
    ...overrides,
  };
}

/** Creates a mock fetch Response with a streaming body */
function buildFetchResponse(
  status: number,
  body: string,
  headers: Record<string, string> = {},
): Response {
  const headerMap = new Headers({ 'content-type': 'application/json', ...headers });
  const encoded = new TextEncoder().encode(body);
  const bodyStream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoded);
      controller.close();
    },
  });
  return {
    status,
    statusText: status === 200 ? 'OK' : String(status),
    headers: headerMap,
    body: bodyStream,
    ok: status >= 200 && status < 300,
  } as unknown as Response;
}

// ===========================================================================
// 1. isPrivateIp — pure unit tests (no DNS, no fetch)
// ===========================================================================
describe('isPrivateIp()', () => {
  // Loopback
  it('blocks 127.0.0.1', () => expect(isPrivateIp('127.0.0.1')).toBe(true));
  it('blocks 127.255.255.255', () => expect(isPrivateIp('127.255.255.255')).toBe(true));

  // RFC 1918
  it('blocks 10.0.0.1', () => expect(isPrivateIp('10.0.0.1')).toBe(true));
  it('blocks 10.255.255.255', () => expect(isPrivateIp('10.255.255.255')).toBe(true));
  it('blocks 172.16.0.1', () => expect(isPrivateIp('172.16.0.1')).toBe(true));
  it('blocks 172.31.255.255', () => expect(isPrivateIp('172.31.255.255')).toBe(true));
  it('allows 172.15.255.255 (not in 172.16–31)', () => expect(isPrivateIp('172.15.255.255')).toBe(false));
  it('allows 172.32.0.1 (not in 172.16–31)', () => expect(isPrivateIp('172.32.0.1')).toBe(false));
  it('blocks 192.168.1.1', () => expect(isPrivateIp('192.168.1.1')).toBe(true));
  it('blocks 192.168.255.255', () => expect(isPrivateIp('192.168.255.255')).toBe(true));

  // Link-local / cloud metadata
  it('blocks 169.254.0.1 (link-local / AWS metadata)', () => expect(isPrivateIp('169.254.0.1')).toBe(true));
  it('blocks 169.254.169.254 (AWS IMDS)', () => expect(isPrivateIp('169.254.169.254')).toBe(true));

  // Unspecified
  it('blocks 0.0.0.0', () => expect(isPrivateIp('0.0.0.0')).toBe(true));

  // IPv4-mapped IPv6 loopback
  it('blocks ::ffff:127.0.0.1', () => expect(isPrivateIp('::ffff:127.0.0.1')).toBe(true));
  it('blocks ::ffff:10.0.0.1', () => expect(isPrivateIp('::ffff:10.0.0.1')).toBe(true));

  // IPv6 loopback
  it('blocks ::1', () => expect(isPrivateIp('::1')).toBe(true));

  // IPv6 link-local
  it('blocks fe80::1', () => expect(isPrivateIp('fe80::1')).toBe(true));

  // IPv6 unique-local
  it('blocks fc00::1', () => expect(isPrivateIp('fc00::1')).toBe(true));
  it('blocks fd00::1', () => expect(isPrivateIp('fd00::1')).toBe(true));

  // Public addresses should be allowed
  it('allows 8.8.8.8', () => expect(isPrivateIp('8.8.8.8')).toBe(false));
  it('allows 1.1.1.1', () => expect(isPrivateIp('1.1.1.1')).toBe(false));
  it('allows 93.184.216.34 (example.com)', () => expect(isPrivateIp('93.184.216.34')).toBe(false));
});

// ===========================================================================
// 2. validateUrlForSsrf — integration with mocked DNS
// ===========================================================================
describe('validateUrlForSsrf()', () => {
  beforeEach(() => {
    mockDnsLookupFn.mockReset();
  });

  it('passes for a public hostname resolving to a public IP', async () => {
    mockDnsLookupFn.mockResolvedValue(['93.184.216.34']);
    await expect(validateUrlForSsrf('https://example.com/path')).resolves.toBe('https://example.com/path');
  });

  it('blocks when hostname resolves to loopback', async () => {
    mockDnsLookupFn.mockResolvedValue(['127.0.0.1']);
    await expect(validateUrlForSsrf('https://evil.com')).rejects.toThrow('Unsafe destination');
  });

  it('blocks when hostname resolves to private RFC 1918 IP', async () => {
    mockDnsLookupFn.mockResolvedValue(['192.168.1.100']);
    await expect(validateUrlForSsrf('https://internal.corp')).rejects.toThrow('private IP range');
  });

  it('blocks AWS metadata service via direct IP in URL', async () => {
    // Direct IP — dns-resolver returns it directly
    mockDnsLookupFn.mockResolvedValue(['169.254.169.254']);
    await expect(validateUrlForSsrf('http://169.254.169.254/latest/meta-data/')).rejects.toThrow('private IP range');
  });

  it('blocks if ANY resolved IP is private (multi-address host)', async () => {
    mockDnsLookupFn.mockResolvedValue(['93.184.216.34', '10.0.0.1']); // one public, one private
    await expect(validateUrlForSsrf('https://mixed-dns.example.com')).rejects.toThrow('private IP range');
  });

  it('rejects non-http/https protocols (file://)', async () => {
    await expect(validateUrlForSsrf('file:///etc/passwd')).rejects.toThrow('not supported');
  });

  it('rejects non-http/https protocols (ftp://)', async () => {
    await expect(validateUrlForSsrf('ftp://example.com/file')).rejects.toThrow('not supported');
  });

  it('throws for malformed URLs', async () => {
    await expect(validateUrlForSsrf('not-a-url')).rejects.toThrow('Invalid');
  });

  it('throws when DNS lookup fails', async () => {
    mockDnsLookupFn.mockRejectedValue(new Error('ENOTFOUND nonexistent.invalid'));
    await expect(validateUrlForSsrf('https://nonexistent.invalid')).rejects.toThrow('DNS resolution failed');
  });
});

// ===========================================================================
// 3. interpolateVariables — non-strict mode (core package)
// ===========================================================================
describe('interpolateVariables()', () => {
  it('substitutes single variable', () => {
    expect(interpolateVariables('{{baseUrl}}/api', { baseUrl: 'https://api.example.com' }))
      .toBe('https://api.example.com/api');
  });

  it('substitutes multiple distinct variables', () => {
    expect(
      interpolateVariables('{{scheme}}://{{host}}/{{version}}', {
        scheme: 'https',
        host: 'api.example.com',
        version: 'v1',
      }),
    ).toBe('https://api.example.com/v1');
  });

  it('leaves unresolved tokens intact (non-strict mode)', () => {
    expect(interpolateVariables('{{missing}}/path', {})).toBe('{{missing}}/path');
  });

  it('handles whitespace inside token names', () => {
    expect(interpolateVariables('{{ apiKey }}', { apiKey: 'secret' })).toBe('secret');
  });

  it('handles repeated tokens', () => {
    expect(interpolateVariables('{{x}}-{{x}}-{{x}}', { x: 'A' })).toBe('A-A-A');
  });
});

// ===========================================================================
// 4. interpolateVariablesStrict — throws on missing variables
// ===========================================================================
describe('interpolateVariablesStrict()', () => {
  it('substitutes variables when all are provided', () => {
    expect(interpolateVariablesStrict('Bearer {{token}}', { token: 'abc123' }))
      .toBe('Bearer abc123');
  });

  it('throws descriptive error for missing variable', () => {
    expect(() => interpolateVariablesStrict('{{missing}}', {}))
      .toThrow('"missing" was not found');
  });

  it('throws for the first missing variable in a multi-token string', () => {
    expect(() => interpolateVariablesStrict('{{a}}:{{b}}', { a: 'present' }))
      .toThrow('"b" was not found');
  });

  it('does not throw when all tokens are resolved', () => {
    expect(() =>
      interpolateVariablesStrict('{{a}}-{{b}}-{{c}}', { a: '1', b: '2', c: '3' }),
    ).not.toThrow();
  });
});

// ===========================================================================
// 5. RequestExecutionService — unit tests with mocked fetch & DNS
// ===========================================================================
describe('RequestExecutionService', () => {
  let service: RequestExecutionService;

  beforeEach(() => {
    mockFetch.mockReset();
    mockDnsLookupFn.mockReset();
    service = new RequestExecutionService();
    // Default: all DNS queries resolve to a public IP
    mockDnsLookupFn.mockResolvedValue(['93.184.216.34']);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Happy path
  // -------------------------------------------------------------------------
  describe('successful requests', () => {
    it('executes a simple GET and returns a normalized response', async () => {
      mockFetch.mockResolvedValueOnce(
        buildFetchResponse(200, '{"ok":true}', { 'x-request-id': 'abc' }),
      );

      const result = await service.execute(buildRequest());

      expect(result.statusCode).toBe(200);
      expect(result.body).toBe('{"ok":true}');
      expect(result.durationMs).toBeGreaterThanOrEqual(0);
      expect(result.sizeBytes).toBe(11); // '{"ok":true}' = 11 bytes
    });

    it('attaches query parameters to the outgoing URL', async () => {
      mockFetch.mockResolvedValueOnce(buildFetchResponse(200, 'ok'));

      await service.execute(
        buildRequest({
          queryParams: [
            { key: 'foo', value: 'bar', enabled: true },
            { key: 'page', value: '1', enabled: true },
          ],
        }),
      );

      const calledUrl = mockFetch.mock.calls[0]?.[0] as string;
      expect(calledUrl).toContain('foo=bar');
      expect(calledUrl).toContain('page=1');
    });

    it('interpolates variables in the URL before sending', async () => {
      mockFetch.mockResolvedValueOnce(buildFetchResponse(200, 'done'));

      await service.execute(
        buildRequest({
          url: 'https://{{host}}/{{version}}/users',
          variables: { host: 'api.example.com', version: 'v2' },
        }),
      );

      const calledUrl = mockFetch.mock.calls[0]?.[0] as string;
      expect(calledUrl).toContain('api.example.com');
      expect(calledUrl).toContain('v2');
    });

    it('forwards enabled custom headers and skips disabled ones', async () => {
      mockFetch.mockResolvedValueOnce(buildFetchResponse(200, '{}'));

      await service.execute(
        buildRequest({
          headers: [
            { key: 'X-Custom', value: 'nuvro', enabled: true },
            { key: 'Accept', value: 'application/json', enabled: true },
            { key: 'X-Disabled', value: 'no', enabled: false },
          ],
        }),
      );

      const opts = mockFetch.mock.calls[0]?.[1] as RequestInit;
      const sentHeaders = opts.headers as Record<string, string>;
      expect(sentHeaders['X-Custom']).toBe('nuvro');
      expect(sentHeaders['Accept']).toBe('application/json');
      expect(sentHeaders['X-Disabled']).toBeUndefined();
    });

    it('omits body for GET requests even if bodyContent is present', async () => {
      mockFetch.mockResolvedValueOnce(buildFetchResponse(200, '{}'));

      await service.execute(buildRequest({ method: 'GET', bodyContent: '{"hello":"world"}', bodyType: 'JSON' }));

      const opts = mockFetch.mock.calls[0]?.[1] as RequestInit;
      expect(opts.body).toBeUndefined();
    });

    it('includes body for POST requests', async () => {
      mockFetch.mockResolvedValueOnce(buildFetchResponse(201, '{"id":"1"}'));

      await service.execute(
        buildRequest({ method: 'POST', bodyType: 'JSON', bodyContent: '{"name":"test"}' }),
      );

      const opts = mockFetch.mock.calls[0]?.[1] as RequestInit;
      expect(opts.body).toBe('{"name":"test"}');
    });
  });

  // -------------------------------------------------------------------------
  // Authentication injection
  // -------------------------------------------------------------------------
  describe('authentication injection', () => {
    it('injects Bearer token into Authorization header', async () => {
      mockFetch.mockResolvedValueOnce(buildFetchResponse(200, '{}'));

      await service.execute(
        buildRequest({ authType: 'BEARER', authConfig: { token: 'my-bearer-token' } }),
      );

      const opts = mockFetch.mock.calls[0]?.[1] as RequestInit;
      const headers = opts.headers as Record<string, string>;
      expect(headers['Authorization']).toBe('Bearer my-bearer-token');
    });

    it('injects Basic auth as base64-encoded Authorization header', async () => {
      mockFetch.mockResolvedValueOnce(buildFetchResponse(200, '{}'));

      await service.execute(
        buildRequest({ authType: 'BASIC', authConfig: { username: 'admin', password: 'secret' } }),
      );

      const opts = mockFetch.mock.calls[0]?.[1] as RequestInit;
      const headers = opts.headers as Record<string, string>;
      const expectedBase64 = Buffer.from('admin:secret').toString('base64');
      expect(headers['Authorization']).toBe(`Basic ${expectedBase64}`);
    });

    it('injects API key into request header', async () => {
      mockFetch.mockResolvedValueOnce(buildFetchResponse(200, '{}'));

      await service.execute(
        buildRequest({
          authType: 'API_KEY',
          authConfig: { key: 'X-Api-Key', headerName: 'X-Api-Key', value: 'tok_123', location: 'header' },
        }),
      );

      const opts = mockFetch.mock.calls[0]?.[1] as RequestInit;
      const headers = opts.headers as Record<string, string>;
      expect(headers['X-Api-Key']).toBe('tok_123');
    });

    it('injects API key as a query parameter', async () => {
      mockFetch.mockResolvedValueOnce(buildFetchResponse(200, '{}'));

      await service.execute(
        buildRequest({
          authType: 'API_KEY',
          authConfig: { key: 'apiKey', headerName: 'apiKey', value: 'tok_456', location: 'query' },
        }),
      );

      const calledUrl = mockFetch.mock.calls[0]?.[0] as string;
      expect(calledUrl).toContain('apiKey=tok_456');
    });
  });

  // -------------------------------------------------------------------------
  // Interpolation errors
  // -------------------------------------------------------------------------
  describe('interpolation errors', () => {
    it('throws when URL contains an unresolved variable', async () => {
      await expect(
        service.execute(buildRequest({ url: 'https://{{missingHost}}/api', variables: {} })),
      ).rejects.toThrow('interpolation failed');
    });

    it('throws when a header value contains an unresolved variable', async () => {
      await expect(
        service.execute(
          buildRequest({
            headers: [{ key: 'X-Key', value: '{{missingToken}}', enabled: true }],
            variables: {},
          }),
        ),
      ).rejects.toThrow('interpolation failed');
    });

    it('throws when the request body contains an unresolved variable', async () => {
      await expect(
        service.execute(
          buildRequest({
            method: 'POST',
            bodyType: 'JSON',
            bodyContent: '{"userId":"{{userId}}"}',
            variables: {},
          }),
        ),
      ).rejects.toThrow('interpolation failed');
    });
  });

  // -------------------------------------------------------------------------
  // SSRF protection
  // -------------------------------------------------------------------------
  describe('SSRF protection', () => {
    it('blocks requests to loopback addresses', async () => {
      mockDnsLookupFn.mockResolvedValue(['127.0.0.1']);
      await expect(service.execute(buildRequest({ url: 'http://localhost/api' }))).rejects.toThrow('private IP range');
    });

    it('blocks requests to AWS IMDS (169.254.169.254)', async () => {
      mockDnsLookupFn.mockResolvedValue(['169.254.169.254']);
      await expect(
        service.execute(buildRequest({ url: 'http://169.254.169.254/latest/meta-data/' })),
      ).rejects.toThrow('private IP range');
    });

    it('blocks requests to internal RFC-1918 ranges', async () => {
      mockDnsLookupFn.mockResolvedValue(['10.0.0.5']);
      await expect(
        service.execute(buildRequest({ url: 'https://internal.corp/secret' })),
      ).rejects.toThrow('private IP range');
    });

    it('blocks file:// protocol before DNS resolution', async () => {
      await expect(
        service.execute(buildRequest({ url: 'file:///etc/passwd' })),
      ).rejects.toThrow('not supported');
    });
  });

  // -------------------------------------------------------------------------
  // Redirect-chain SSRF
  // -------------------------------------------------------------------------
  describe('redirect-chain SSRF', () => {
    it('validates each redirect hop against SSRF rules and blocks private targets', async () => {
      mockFetch.mockResolvedValueOnce({
        status: 301,
        statusText: 'Moved',
        headers: new Headers({ location: 'http://internal.corp/secret' }),
        body: null,
        ok: false,
      } as unknown as Response);

      mockDnsLookupFn
        .mockResolvedValueOnce(['93.184.216.34']) // initial URL — public
        .mockResolvedValueOnce(['192.168.1.50']); // redirect target — private

      await expect(
        service.execute(buildRequest({ url: 'https://api.example.com/redirect' })),
      ).rejects.toThrow('private IP range');
    });

    it('throws after exceeding the maximum redirect limit', async () => {
      const redirectResponse = {
        status: 302,
        statusText: 'Found',
        headers: new Headers({ location: 'https://api.example.com/next' }),
        body: null,
        ok: false,
      } as unknown as Response;

      mockDnsLookupFn.mockResolvedValue(['93.184.216.34']); // always public
      mockFetch.mockResolvedValue(redirectResponse); // infinite redirect loop

      await expect(
        service.execute(buildRequest({ url: 'https://api.example.com/loop' })),
      ).rejects.toThrow('Max redirect limit exceeded');
    });
  });

  // -------------------------------------------------------------------------
  // Timeout
  // -------------------------------------------------------------------------
  describe('timeout enforcement', () => {
    it('throws a timeout error when the request exceeds the allotted time', async () => {
      mockFetch.mockImplementationOnce((_url: string, opts: RequestInit) => {
        return new Promise((_resolve, reject) => {
          const signal = opts.signal as AbortSignal;
          if (signal) {
            signal.addEventListener('abort', () => {
              const abortError = new Error('The operation was aborted.');
              abortError.name = 'AbortError';
              reject(abortError);
            });
          }
          // Never resolves naturally — simulates a hung server
        });
      });

      await expect(service.execute(buildRequest({ timeoutMs: 1 }))).rejects.toThrow('timed out');
    });
  });

  // -------------------------------------------------------------------------
  // Response size limiting
  // -------------------------------------------------------------------------
  describe('response size limit', () => {
    it('throws when the streaming response exceeds MAX_RESPONSE_SIZE_MB', async () => {
      // Lower the limit to 1 MB for this test via the mocked env
      mockEnv.MAX_RESPONSE_SIZE_MB = 1;

      // Produce 3 × 512 KB = 1.5 MB — exceeds the 1 MB limit
      const chunk = new Uint8Array(512 * 1024).fill(65);
      const largeBodyStream = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(chunk);
          controller.enqueue(chunk);
          controller.enqueue(chunk);
          controller.close();
        },
      });

      mockFetch.mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'text/plain' }),
        body: largeBodyStream,
        ok: true,
      } as unknown as Response);

      await expect(service.execute(buildRequest())).rejects.toThrow('Response size limit');

      // Restore default for subsequent tests
      mockEnv.MAX_RESPONSE_SIZE_MB = 10;
    });
  });

  // -------------------------------------------------------------------------
  // Sensitive header redaction
  // -------------------------------------------------------------------------
  describe('response header redaction', () => {
    it('strips set-cookie from forwarded response headers', async () => {
      mockFetch.mockResolvedValueOnce(
        buildFetchResponse(200, '{}', {
          'set-cookie': 'sessionId=abc123; HttpOnly; Secure',
          'x-request-id': 'req-xyz',
        }),
      );

      const result = await service.execute(buildRequest());

      expect(result.headers['set-cookie']).toBeUndefined();
      expect(result.headers['x-request-id']).toBe('req-xyz');
    });

    it('strips authorization from forwarded response headers', async () => {
      mockFetch.mockResolvedValueOnce(
        buildFetchResponse(200, '{}', {
          authorization: 'Bearer token-leaked',
          'content-type': 'application/json',
        }),
      );

      const result = await service.execute(buildRequest());

      expect(result.headers['authorization']).toBeUndefined();
      expect(result.headers['content-type']).toBe('application/json');
    });

    it('strips proxy-authorization from forwarded response headers', async () => {
      mockFetch.mockResolvedValueOnce(
        buildFetchResponse(200, '{}', {
          'proxy-authorization': 'Basic leaked',
          'x-trace-id': 'trace-001',
        }),
      );

      const result = await service.execute(buildRequest());

      expect(result.headers['proxy-authorization']).toBeUndefined();
      expect(result.headers['x-trace-id']).toBe('trace-001');
    });
  });

  // -------------------------------------------------------------------------
  // Response metadata
  // -------------------------------------------------------------------------
  describe('response metadata', () => {
    it('reports correct sizeBytes matching the response body byte length', async () => {
      const body = JSON.stringify({ hello: 'world', count: 42 });
      mockFetch.mockResolvedValueOnce(buildFetchResponse(200, body));

      const result = await service.execute(buildRequest());

      expect(result.sizeBytes).toBe(Buffer.byteLength(body, 'utf8'));
    });

    it('reports redirectCount of 0 when no redirects occurred', async () => {
      mockFetch.mockResolvedValueOnce(buildFetchResponse(200, '{}'));

      const result = await service.execute(buildRequest());

      expect(result.redirectCount).toBe(0);
    });

    it('increments redirectCount once for each followed redirect', async () => {
      const redirect = {
        status: 302,
        statusText: 'Found',
        headers: new Headers({ location: 'https://api.example.com/final' }),
        body: null,
        ok: false,
      } as unknown as Response;

      mockFetch
        .mockResolvedValueOnce(redirect)
        .mockResolvedValueOnce(buildFetchResponse(200, '{"redirected":true}'));

      const result = await service.execute(buildRequest({ url: 'https://api.example.com/start' }));

      expect(result.redirectCount).toBe(1);
      expect(result.statusCode).toBe(200);
    });
  });

  // -------------------------------------------------------------------------
  // Body Types and Formats Serialization Tests
  // -------------------------------------------------------------------------
  describe('body types serialization', () => {
    it('serializes JSON bodies with default content-type', async () => {
      mockFetch.mockResolvedValueOnce(buildFetchResponse(200, '{}'));
      const req = buildRequest({
        method: 'POST',
        bodyType: 'JSON',
        bodyContent: '{"a": 1}',
      });

      await service.execute(req);
      const [, opts] = mockFetch.mock.calls[mockFetch.mock.calls.length - 1] as [any, any];
      expect(opts.body).toBe('{"a": 1}');
      expect(opts.headers['Content-Type']).toBe('application/json');
    });

    it('serializes RAW text bodies with default content-type', async () => {
      mockFetch.mockResolvedValueOnce(buildFetchResponse(200, '{}'));
      const req = buildRequest({
        method: 'POST',
        bodyType: 'RAW',
        bodyContent: 'hello world',
      });

      await service.execute(req);
      const [, opts] = mockFetch.mock.calls[mockFetch.mock.calls.length - 1] as [any, any];
      expect(opts.body).toBe('hello world');
      expect(opts.headers['Content-Type']).toBe('text/plain');
    });

    it('serializes FORM_URL_ENCODED bodies from KeyValuePair arrays', async () => {
      mockFetch.mockResolvedValueOnce(buildFetchResponse(200, '{}'));
      const req = buildRequest({
        method: 'POST',
        bodyType: 'FORM_URL_ENCODED',
        bodyContent: JSON.stringify([
          { key: 'foo', value: 'bar', enabled: true },
          { key: 'baz', value: 'qux', enabled: true },
          { key: 'ignored', value: 'val', enabled: false },
        ]),
      });

      await service.execute(req);
      const [, opts] = mockFetch.mock.calls[mockFetch.mock.calls.length - 1] as [any, any];
      expect(opts.body).toBe('foo=bar&baz=qux');
      expect(opts.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    });

    it('serializes FORM_DATA multipart bodies and omits content-type for boundary generation', async () => {
      mockFetch.mockResolvedValueOnce(buildFetchResponse(200, '{}'));
      const req = buildRequest({
        method: 'POST',
        bodyType: 'FORM_DATA',
        bodyContent: JSON.stringify([
          { key: 'name', value: 'John', enabled: true },
          { key: 'file', filename: 'test.txt', fileContent: Buffer.from('file-text').toString('base64'), enabled: true },
        ]),
        headers: [{ key: 'Content-Type', value: 'multipart/form-data', enabled: true }],
      });

      await service.execute(req);
      const [, opts] = mockFetch.mock.calls[mockFetch.mock.calls.length - 1] as [any, any];
      expect(opts.body).toBeInstanceOf(FormData);
      expect(opts.headers['Content-Type']).toBeUndefined();
      expect(opts.headers['content-type']).toBeUndefined();
    });

    it('serializes BINARY bodies from base64 content', async () => {
      mockFetch.mockResolvedValueOnce(buildFetchResponse(200, '{}'));
      const binaryContent = JSON.stringify({
        filename: 'data.bin',
        fileContent: Buffer.from('binary-data').toString('base64'),
      });
      const req = buildRequest({
        method: 'POST',
        bodyType: 'BINARY',
        bodyContent: binaryContent,
      });

      await service.execute(req);
      const [, opts] = mockFetch.mock.calls[mockFetch.mock.calls.length - 1] as [any, any];
      expect(opts.body).toBeInstanceOf(Buffer);
      expect(opts.body.toString()).toBe('binary-data');
      expect(opts.headers['Content-Type']).toBe('application/octet-stream');
    });

    it('serializes GRAPHQL queries and parsed variables object', async () => {
      mockFetch.mockResolvedValueOnce(buildFetchResponse(200, '{}'));
      const req = buildRequest({
        method: 'POST',
        bodyType: 'GRAPHQL',
        bodyContent: JSON.stringify({
          query: 'query GetUser($id: ID!) { user(id: $id) { name } }',
          variables: '{"id": "123"}',
          operationName: 'GetUser',
        }),
      });

      await service.execute(req);
      const [, opts] = mockFetch.mock.calls[mockFetch.mock.calls.length - 1] as [any, any];
      const parsedBody = JSON.parse(opts.body);
      expect(parsedBody.query).toContain('GetUser');
      expect(parsedBody.variables).toEqual({ id: '123' });
      expect(parsedBody.operationName).toBe('GetUser');
      expect(opts.headers['Content-Type']).toBe('application/json');
    });
  });

  // -------------------------------------------------------------------------
  // Expanded Authentication Injection Tests
  // -------------------------------------------------------------------------
  describe('authentication types expansion', () => {
    it('injects API_KEY in cookies when location is cookie', async () => {
      mockFetch.mockResolvedValueOnce(buildFetchResponse(200, '{}'));
      const req = buildRequest({
        authType: 'API_KEY',
        authConfig: {
          key: 'session',
          value: 'secret123',
          location: 'cookie',
        },
      });

      await service.execute(req);
      const [, opts] = mockFetch.mock.calls[mockFetch.mock.calls.length - 1] as [any, any];
      expect(opts.headers['Cookie']).toBe('session=secret123');
    });

    it('injects OAUTH2 access token as a Bearer authorization header', async () => {
      mockFetch.mockResolvedValueOnce(buildFetchResponse(200, '{}'));
      const req = buildRequest({
        authType: 'OAUTH2',
        authConfig: {
          accessToken: 'oauth-token-xyz',
        },
      });

      await service.execute(req);
      const [, opts] = mockFetch.mock.calls[mockFetch.mock.calls.length - 1] as [any, any];
      expect(opts.headers['Authorization']).toBe('Bearer oauth-token-xyz');
    });
  });
});
