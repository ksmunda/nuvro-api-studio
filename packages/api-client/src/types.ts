/**
 * Core interfaces for the pluggable HTTP transport layer.
 *
 * ApiTransport is the seam between platforms:
 * - Web:     FetchTransport  → backend proxy (avoids CORS, backend enforces SSRF protection)
 * - Desktop: TauriTransport  → native HTTP via @tauri-apps/api/http (future, Phase 8)
 */

import type { ExecuteRequestInput, ExecuteResponse } from '@nuvro/types';

/**
 * Transport interface — implement this for each platform target.
 */
export interface ApiTransport {
  /** Execute an HTTP request and return the response. */
  execute(request: ExecuteRequestInput): Promise<ExecuteResponse>;
  /** Optional: cancel an in-flight request. */
  cancel?(): void;
}

export interface ApiClientOptions {
  transport: ApiTransport;
  /** Default timeout in milliseconds. Defaults to 10000. */
  defaultTimeoutMs?: number;
}

export interface RequestResult {
  response: ExecuteResponse;
  executedAt: Date;
}
