/**
 * Request lifecycle state machine.
 * Pure TypeScript — no framework dependencies.
 */

export const RequestStatus = {
  IDLE: 'idle',
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error',
  CANCELLED: 'cancelled',
  TIMEOUT: 'timeout',
} as const;

export type RequestStatusValue = (typeof RequestStatus)[keyof typeof RequestStatus];

export interface RequestLifecycleState {
  status: RequestStatusValue;
  startedAt: number | null;
  completedAt: number | null;
  durationMs: number | null;
  errorMessage: string | null;
}

export function createInitialLifecycleState(): RequestLifecycleState {
  return {
    status: RequestStatus.IDLE,
    startedAt: null,
    completedAt: null,
    durationMs: null,
    errorMessage: null,
  };
}

export function transitionToPending(state: RequestLifecycleState): RequestLifecycleState {
  return {
    ...state,
    status: RequestStatus.PENDING,
    startedAt: Date.now(),
    completedAt: null,
    durationMs: null,
    errorMessage: null,
  };
}

export function transitionToSuccess(state: RequestLifecycleState): RequestLifecycleState {
  const completedAt = Date.now();
  return {
    ...state,
    status: RequestStatus.SUCCESS,
    completedAt,
    durationMs: state.startedAt !== null ? completedAt - state.startedAt : null,
    errorMessage: null,
  };
}

export function transitionToError(
  state: RequestLifecycleState,
  errorMessage: string,
): RequestLifecycleState {
  const completedAt = Date.now();
  return {
    ...state,
    status: RequestStatus.ERROR,
    completedAt,
    durationMs: state.startedAt !== null ? completedAt - state.startedAt : null,
    errorMessage,
  };
}

export function transitionToCancelled(state: RequestLifecycleState): RequestLifecycleState {
  const completedAt = Date.now();
  return {
    ...state,
    status: RequestStatus.CANCELLED,
    completedAt,
    durationMs: state.startedAt !== null ? completedAt - state.startedAt : null,
    errorMessage: null,
  };
}
