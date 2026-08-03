import type { ExecuteRequestInput, ExecuteResponse } from '@nuvro/validation';
import { validateUrlForSsrf } from './ssrf-validator.js';
import { interpolateVariablesStrict } from '@nuvro/core';
import { env } from '../config/env.js';
import { BadRequestError } from '../errors/app-error.js';
import { environmentService } from './environment.js';

/** Safely extracts a message string from an unknown thrown value. */
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export class RequestExecutionService {
  /**
   * Orchestrates the variable interpolation, safety validation, and execution of outbound HTTP requests.
   */
  async execute(requestInput: ExecuteRequestInput, userId?: string): Promise<ExecuteResponse> {
    let vars = { ...(requestInput.variables || {}) };

    if (requestInput.environmentId) {
      if (!userId) {
        throw new BadRequestError('User ID is required when environmentId is specified', 'ENVIRONMENT_ERROR');
      }
      try {
        const envVars = await environmentService.getRawVariablesMap(requestInput.environmentId, userId);
        vars = { ...envVars, ...vars };
      } catch (err) {
        throw new BadRequestError(`Failed to load environment: ${getErrorMessage(err)}`, 'ENVIRONMENT_ERROR');
      }
    }

    // 1. Variable Interpolation
    let interpolatedUrl = '';
    try {
      interpolatedUrl = interpolateVariablesStrict(requestInput.url, vars);
    } catch (err) {
      throw new BadRequestError(`Url interpolation failed: ${getErrorMessage(err)}`, 'INTERPOLATION_ERROR');
    }

    // Interpolate Headers
    const headers: Record<string, string> = {};
    for (const header of requestInput.headers) {
      if (header.enabled !== false) {
        try {
          const key = interpolateVariablesStrict(header.key, vars);
          const value = interpolateVariablesStrict(header.value, vars);
          headers[key] = value;
        } catch (err) {
          throw new BadRequestError(`Header interpolation failed: ${getErrorMessage(err)}`, 'INTERPOLATION_ERROR');
        }
      }
    }

    // Interpolate Query Parameters
    const queryParams: Record<string, string> = {};
    for (const param of requestInput.queryParams) {
      if (param.enabled !== false) {
        try {
          const key = interpolateVariablesStrict(param.key, vars);
          const value = interpolateVariablesStrict(param.value, vars);
          queryParams[key] = value;
        } catch (err) {
          throw new BadRequestError(`Query parameter interpolation failed: ${getErrorMessage(err)}`, 'INTERPOLATION_ERROR');
        }
      }
    }

    // Interpolate Body Content
    let bodyContent = requestInput.bodyContent || '';
    if (bodyContent && requestInput.bodyType !== 'NONE') {
      try {
        bodyContent = interpolateVariablesStrict(bodyContent, vars);
      } catch (err) {
        throw new BadRequestError(`Body interpolation failed: ${getErrorMessage(err)}`, 'INTERPOLATION_ERROR');
      }
    }

    // 2. Authentication Injection
    this.injectAuthentication(requestInput, headers, queryParams);

    // 3. Assemble Target URL (incorporating query params)
    const finalUrl = this.buildFinalUrl(interpolatedUrl, queryParams);

    // 4. Validate SSRF on Target URL
    await validateUrlForSsrf(finalUrl);

    // 5. Execute HTTP Request with SSRF, size limits and redirect controls
    return await this.fetchWithRedirectAndSizeControl(
      finalUrl,
      requestInput.method,
      headers,
      bodyContent,
      requestInput.bodyType,
      requestInput.timeoutMs || env.REQUEST_TIMEOUT_MS,
    );
  }

  // --- Internals ---

  private injectAuthentication(
    requestInput: ExecuteRequestInput,
    headers: Record<string, string>,
    queryParams: Record<string, string>,
  ): void {
    const authType = requestInput.authType;
    const config = requestInput.authConfig as Record<string, string>;

    if (!authType || authType === 'NONE' || !config) {
      return;
    }

    // Normalise casing of configuration keys
    const getConf = (k: string) => config[k] || '';

    switch (authType) {
      case 'BEARER': {
        const token = getConf('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        break;
      }
      case 'BASIC': {
        const username = getConf('username');
        const password = getConf('password');
        const encoded = Buffer.from(`${username}:${password}`).toString('base64');
        headers['Authorization'] = `Basic ${encoded}`;
        break;
      }
      case 'API_KEY': {
        const key = getConf('key');
        const value = getConf('value');
        const location = getConf('location') || 'header';
        const name = getConf('headerName') || key;

        if (name && value) {
          if (location === 'header') {
            headers[name] = value;
          } else if (location === 'query') {
            queryParams[name] = value;
          } else if (location === 'cookie') {
            const existing = headers['Cookie'] || headers['cookie'] || '';
            headers['Cookie'] = existing ? `${existing}; ${name}=${value}` : `${name}=${value}`;
          }
        }
        break;
      }
      case 'OAUTH2': {
        const token = getConf('accessToken');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        break;
      }
      case 'DIGEST': {
        // Marked as not supported yet / placeholder configuration model
        break;
      }
      default:
        break;
    }
  }

  private buildFinalUrl(baseUrl: string, queryParams: Record<string, string>): string {
    const urlObj = new URL(baseUrl);
    for (const [key, value] of Object.entries(queryParams)) {
      urlObj.searchParams.append(key, value);
    }
    return urlObj.toString();
  }

  private async fetchWithRedirectAndSizeControl(
    initialUrl: string,
    method: string,
    headers: Record<string, string>,
    bodyContent: string,
    bodyType: string,
    timeoutMs: number,
  ): Promise<ExecuteResponse> {
    const maxRedirects = 5;
    const maxResponseBytes = env.MAX_RESPONSE_SIZE_MB * 1024 * 1024;
    
    let currentUrl = initialUrl;
    let redirectCount = 0;

    const startTime = Date.now();

    while (redirectCount <= maxRedirects) {
      // Setup Timeout Controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Prepare body and headers dynamically
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let finalBody: any = undefined;
      const lowerCaseHeaders = Object.keys(headers).reduce<Record<string, string>>((acc, key) => {
        acc[key.toLowerCase()] = headers[key] || '';
        return acc;
      }, {});

      const hasBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && bodyType !== 'NONE';

      if (hasBody) {
        if (bodyType === 'JSON') {
          finalBody = bodyContent;
          if (!lowerCaseHeaders['content-type']) {
            headers['Content-Type'] = 'application/json';
          }
        } else if (bodyType === 'RAW') {
          finalBody = bodyContent;
          if (!lowerCaseHeaders['content-type']) {
            headers['Content-Type'] = 'text/plain';
          }
        } else if (bodyType === 'FORM_URL_ENCODED') {
          try {
            const parsed = JSON.parse(bodyContent) as Array<{ key: string; value: string; enabled?: boolean }>;
            const params = new globalThis.URLSearchParams();
            for (const item of parsed) {
              if (item.enabled !== false && item.key.trim()) {
                params.append(item.key, item.value);
              }
            }
            finalBody = params.toString();
          } catch {
            finalBody = bodyContent;
          }
          if (!lowerCaseHeaders['content-type']) {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
          }
        } else if (bodyType === 'FORM_DATA') {
          // Multipart form data
          const formData = new FormData();
          try {
            const parsed = JSON.parse(bodyContent) as Array<{ key: string; value: string; enabled?: boolean; filename?: string; fileContent?: string }>;
            for (const item of parsed) {
              if (item.enabled !== false && item.key.trim()) {
                if (item.fileContent && item.filename) {
                  const buffer = Buffer.from(item.fileContent, 'base64');
                  const blob = new globalThis.Blob([buffer]);
                  formData.append(item.key, blob, item.filename);
                } else {
                  formData.append(item.key, item.value);
                }
              }
            }
          } catch {
            // fallback
          }
          finalBody = formData;
          // Delete Content-Type header to allow fetch to automatically compute multipart boundary
          for (const key of Object.keys(headers)) {
            if (key.toLowerCase() === 'content-type') {
              delete headers[key];
            }
          }
        } else if (bodyType === 'BINARY') {
          try {
            const parsed = JSON.parse(bodyContent) as { filename?: string; fileContent?: string };
            if (parsed.fileContent) {
              finalBody = Buffer.from(parsed.fileContent, 'base64');
            } else {
              finalBody = Buffer.alloc(0);
            }
          } catch {
            finalBody = Buffer.from(bodyContent, 'utf8');
          }
          if (!lowerCaseHeaders['content-type']) {
            headers['Content-Type'] = 'application/octet-stream';
          }
        } else if (bodyType === 'GRAPHQL') {
          try {
            const parsed = JSON.parse(bodyContent) as { query: string; variables?: string; operationName?: string };
            let variablesObj = {};
            if (parsed.variables) {
              try {
                variablesObj = typeof parsed.variables === 'string' ? JSON.parse(parsed.variables) : parsed.variables;
              } catch {
                variablesObj = {};
              }
            }
            finalBody = JSON.stringify({
              query: parsed.query,
              variables: variablesObj,
              operationName: parsed.operationName || undefined,
            });
          } catch {
            finalBody = bodyContent;
          }
          if (!lowerCaseHeaders['content-type']) {
            headers['Content-Type'] = 'application/json';
          }
        }
      }

      const fetchOpts: RequestInit = {
        method,
        headers,
        signal: controller.signal,
        redirect: 'manual', // Manual handling to enforce redirect SSRF checks
        body: finalBody,
      };

      try {
        const response = await fetch(currentUrl, fetchOpts);
        clearTimeout(timeoutId);

        // Handle Redirects
        if ([301, 302, 307, 308].includes(response.status)) {
          const location = response.headers.get('location');
          if (!location) {
            throw new Error('Redirect status returned but location header is missing');
          }

          // Resolve relative redirect locations
          const targetUrl = new URL(location, currentUrl).toString();
          redirectCount++;

          if (redirectCount > maxRedirects) {
            throw new BadRequestError('Max redirect limit exceeded', 'MAX_REDIRECTS_EXCEEDED');
          }

          // Security check on redirected address
          await validateUrlForSsrf(targetUrl);
          currentUrl = targetUrl;
          continue;
        }

        // Limit response stream size
        const reader = response.body?.getReader();
        let totalBytes = 0;
        const chunks: Uint8Array[] = [];

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            if (value) {
              totalBytes += value.length;
              if (totalBytes > maxResponseBytes) {
                throw new BadRequestError(`Response size limit of ${env.MAX_RESPONSE_SIZE_MB}MB exceeded`, 'RESPONSE_TOO_LARGE');
              }
              chunks.push(value);
            }
          }
        }

        const durationMs = Date.now() - startTime;
        const completeBuffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));
        const rawBody = completeBuffer.toString('utf8');

        // Extract Normalized Headers
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((val, key) => {
          // Redact highly sensitive system tokens from browser propagation
          if (!['set-cookie', 'authorization', 'proxy-authorization'].includes(key.toLowerCase())) {
            responseHeaders[key] = val;
          }
        });

        return {
          statusCode: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          body: rawBody,
          durationMs,
          sizeBytes: totalBytes,
          redirectCount,
        };
      } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof Error && err.name === 'AbortError') {
          throw new BadRequestError(`Request timed out after ${timeoutMs}ms`, 'TIMEOUT');
        }
        throw err;
      }
    }

    throw new BadRequestError('Infinite loop redirects', 'REDIRECT_LOOP');
  }
}

export const requestExecutionService = new RequestExecutionService();
