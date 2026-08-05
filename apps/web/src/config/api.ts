/* eslint-disable @typescript-eslint/no-explicit-any */
const isTauri = typeof window !== 'undefined' && (
  (window as any).__TAURI_INTERNALS__ !== undefined ||
  window.location.protocol === 'tauri:' ||
  (window.location.protocol === 'https:' && window.location.hostname === 'tauri.localhost') ||
  (window.location.protocol === 'http:' && window.location.hostname === 'tauri.localhost')
);

export const API_BASE = isTauri ? 'http://127.0.0.1:4000' : '';

export const getApiUrl = (path: string) => {
  return `${API_BASE}${path}`;
};
