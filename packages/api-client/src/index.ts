/**
 * @nuvro/api-client
 *
 * Pluggable HTTP execution engine.
 *
 * Usage (web):
 *   import { ApiClient, FetchTransport } from '@nuvro/api-client';
 *   const client = new ApiClient({
 *     transport: new FetchTransport('/api/proxy/execute'),
 *   });
 *   const result = await client.execute(request);
 *
 * Future (desktop/Tauri):
 *   import { ApiClient } from '@nuvro/api-client';
 *   import { TauriTransport } from '@nuvro/desktop'; // implemented in Phase 8
 */

export { ApiClient } from './client.js';
export { FetchTransport } from './transports/fetch.js';
export type { ApiTransport, ApiClientOptions, RequestResult } from './types.js';
