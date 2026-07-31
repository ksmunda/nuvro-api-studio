import type { ExecuteRequestInput, ExecuteResponse, KeyValuePair } from '@nuvro/types';
import type { ApiTransport } from '../types.js';

/**
 * FetchTransport — browser implementation of ApiTransport.
 *
 * Routes all outbound requests through the backend proxy endpoint.
 * SSRF protection is enforced by the backend; this transport is unaware of
 * the actual target URL — it only POSTs the request config to the proxy.
 *
 * Used by: apps/web
 */
export class FetchTransport implements ApiTransport {
  private readonly proxyEndpoint: string;
  private abortController: AbortController | null = null;

  constructor(proxyEndpoint: string) {
    this.proxyEndpoint = proxyEndpoint;
  }

  async execute(request: ExecuteRequestInput): Promise<ExecuteResponse> {
    this.abortController = new AbortController();

    const timeoutId = setTimeout(() => {
      this.abortController?.abort();
    }, request.timeoutMs);

    try {
      const response = await fetch(this.proxyEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Proxy error ${response.status}: ${errorBody}`);
      }

      const data = (await response.json()) as ExecuteResponse;
      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled or timed out');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
      this.abortController = null;
    }
  }

  cancel(): void {
    this.abortController?.abort();
  }

  /** Serialise enabled key-value pairs to a plain headers object. */
  static toHeadersObject(pairs: KeyValuePair[]): Record<string, string> {
    return Object.fromEntries(
      pairs.filter((p) => p.enabled).map((p) => [p.key, p.value] as [string, string]),
    );
  }
}
