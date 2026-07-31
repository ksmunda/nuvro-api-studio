/**
 * @nuvro/core
 *
 * Framework-agnostic business logic for NUVRO API Studio.
 *
 * Rules (enforced by ESLint architectural boundaries):
 * - NO React imports
 * - NO Express imports
 * - NO browser-only APIs (window, document, fetch)
 * - NO Prisma / database imports
 * - NO Tauri imports
 *
 * This package runs identically in:
 * - Browser (apps/web via Vite)
 * - Desktop WebView (apps/desktop via Tauri) — future
 * - Node.js tests (Vitest)
 */

// Environment variable interpolation engine
export { interpolateVariables, interpolateVariablesStrict, extractVariableNames } from './interpolation/index.js';

// Request lifecycle state machine
export {
  RequestStatus,
  createInitialLifecycleState,
  transitionToPending,
  transitionToSuccess,
  transitionToError,
  transitionToCancelled,
} from './request/lifecycle.js';
export type { RequestLifecycleState, RequestStatusValue } from './request/lifecycle.js';
