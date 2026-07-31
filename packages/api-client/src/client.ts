import type { ExecuteRequestInput } from '@nuvro/types';
import { executeRequestSchema } from '@nuvro/validation';
import type { ApiClientOptions, ApiTransport, RequestResult } from './types.js';

/**
 * ApiClient — the central HTTP execution engine.
 *
 * Platform-specific behaviour is injected via ApiTransport.
 * This class has no knowledge of fetch, Tauri, or Node.js HTTP.
 */
export class ApiClient {
  private readonly transport: ApiTransport;
  private readonly defaultTimeoutMs: number;

  constructor(options: ApiClientOptions) {
    this.transport = options.transport;
    this.defaultTimeoutMs = options.defaultTimeoutMs ?? 10_000;
  }

  /**
   * Execute an HTTP request through the configured transport.
   * Validates the request shape before dispatch.
   */
  async execute(rawRequest: unknown): Promise<RequestResult> {
    const request = executeRequestSchema.parse(rawRequest) as ExecuteRequestInput;

    const requestWithTimeout: ExecuteRequestInput = {
      ...request,
      timeoutMs: request.timeoutMs ?? this.defaultTimeoutMs,
    };

    const executedAt = new Date();
    const response = await this.transport.execute(requestWithTimeout);

    return { response, executedAt };
  }
}
