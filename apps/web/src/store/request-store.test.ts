import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRequestStore } from './request-store.js';
import { ApiClient } from '@nuvro/api-client';

// Mock ApiClient to isolate store unit test behavior
vi.mock('@nuvro/api-client', () => {
  const mockExecute = vi.fn();
  const mockCancel = vi.fn();
  
  const ApiClientClass = vi.fn().mockImplementation(() => ({
    execute: mockExecute,
  }));
  
  const FetchTransportClass = vi.fn().mockImplementation(() => ({
    cancel: mockCancel,
  }));

  return {
    ApiClient: ApiClientClass,
    FetchTransport: FetchTransportClass,
  };
});

describe('useRequestStore', () => {
  beforeEach(() => {
    // Reset state before each test
    const { setMethod, setUrl, setHeaders, setQueryParams, setAuthType, setAuthConfig, setBodyType, setBodyContent, setVariables, resetResponse } = useRequestStore.getState();
    setMethod('GET');
    setUrl('');
    setHeaders([{ key: '', value: '', enabled: true }]);
    setQueryParams([{ key: '', value: '', enabled: true }]);
    setAuthType('NONE');
    setAuthConfig({});
    setBodyType('NONE');
    setBodyContent('');
    setVariables({});
    resetResponse();

    const mocked = vi.mocked(ApiClient);
    new mocked({ transport: {} as never } as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const state = useRequestStore.getState();
    expect(state.method).toBe('GET');
    expect(state.url).toBe('');
    expect(state.headers).toEqual([{ key: '', value: '', enabled: true }]);
    expect(state.queryParams).toEqual([{ key: '', value: '', enabled: true }]);
    expect(state.authType).toBe('NONE');
    expect(state.bodyType).toBe('NONE');
    expect(state.isLoading).toBe(false);
    expect(state.response).toBeNull();
    expect(state.error).toBeNull();
  });

  it('should update HTTP method', () => {
    useRequestStore.getState().setMethod('POST');
    expect(useRequestStore.getState().method).toBe('POST');
  });

  it('should update URL', () => {
    useRequestStore.getState().setUrl('https://api.example.com/data');
    expect(useRequestStore.getState().url).toBe('https://api.example.com/data');
  });

  it('should update query parameters and headers', () => {
    const newParams = [{ key: 'page', value: '2', enabled: true }];
    const newHeaders = [{ key: 'Authorization', value: 'Bearer token', enabled: true }];

    useRequestStore.getState().setQueryParams(newParams);
    useRequestStore.getState().setHeaders(newHeaders);

    expect(useRequestStore.getState().queryParams).toEqual(newParams);
    expect(useRequestStore.getState().headers).toEqual(newHeaders);
  });

  it('should update authorization settings', () => {
    useRequestStore.getState().setAuthType('BEARER');
    useRequestStore.getState().setAuthConfig({ token: 'abc-123' });

    expect(useRequestStore.getState().authType).toBe('BEARER');
    expect(useRequestStore.getState().authConfig).toEqual({ token: 'abc-123' });
  });

  it('should update body content and type', () => {
    useRequestStore.getState().setBodyType('JSON');
    useRequestStore.getState().setBodyContent('{"user": "Alice"}');

    expect(useRequestStore.getState().bodyType).toBe('JSON');
    expect(useRequestStore.getState().bodyContent).toBe('{"user": "Alice"}');
  });

  it('should handle request cancellation', () => {
    useRequestStore.getState().cancelRequest();
    expect(useRequestStore.getState().isLoading).toBe(false);
    expect(useRequestStore.getState().error).toBe('Request cancelled by user');
  });
});
