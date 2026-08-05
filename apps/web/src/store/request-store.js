import { create } from 'zustand';
import { ApiClient, FetchTransport } from '@nuvro/api-client';
import { useEnvironmentStore } from './environment-store.js';
import { useRequestTabsStore } from './request-tabs-store.js';
import { API_BASE } from '../config/api.js';
// Centralised API client instance using the FetchTransport proxy endpoint
const transport = new FetchTransport(`${API_BASE}/api/v1/requests/execute`);
const apiClient = new ApiClient({ transport, defaultTimeoutMs: 10000 });
const defaultKeyValuePair = () => ({ key: '', value: '', enabled: true });
export const useRequestStore = create((set, get) => ({
    method: 'GET',
    url: '',
    headers: [defaultKeyValuePair()],
    queryParams: [defaultKeyValuePair()],
    authType: 'NONE',
    authConfig: {},
    bodyType: 'NONE',
    bodyContent: '',
    variables: {},
    timeoutMs: 10000,
    isLoading: false,
    error: null,
    response: null,
    activeTab: 'params',
    responseActiveTab: 'body',
    setMethod: (method) => {
        set({ method });
        useRequestTabsStore.getState().syncFromRequestStore({ method });
    },
    setUrl: (url) => {
        set({ url });
        useRequestTabsStore.getState().syncFromRequestStore({ url });
    },
    setHeaders: (headers) => {
        set({ headers });
        useRequestTabsStore.getState().syncFromRequestStore({ headers });
    },
    setQueryParams: (queryParams) => {
        set({ queryParams });
        useRequestTabsStore.getState().syncFromRequestStore({ queryParams });
    },
    setAuthType: (authType) => {
        set({ authType });
        useRequestTabsStore.getState().syncFromRequestStore({ authType });
    },
    setAuthConfig: (authConfig) => {
        set({ authConfig });
        useRequestTabsStore.getState().syncFromRequestStore({ authConfig });
    },
    setBodyType: (bodyType) => {
        set({ bodyType });
        useRequestTabsStore.getState().syncFromRequestStore({ bodyType });
    },
    setBodyContent: (bodyContent) => {
        set({ bodyContent });
        useRequestTabsStore.getState().syncFromRequestStore({ bodyContent });
    },
    setVariables: (variables) => set({ variables }),
    setTimeoutMs: (timeoutMs) => set({ timeoutMs }),
    setActiveTab: (activeTab) => {
        set({ activeTab });
        useRequestTabsStore.getState().syncFromRequestStore({ activeTab });
    },
    setResponseActiveTab: (responseActiveTab) => {
        set({ responseActiveTab });
        useRequestTabsStore.getState().syncFromRequestStore({ responseActiveTab });
    },
    resetResponse: () => {
        set({ response: null, error: null });
        useRequestTabsStore.getState().syncFromRequestStore({ response: null, error: null });
    },
    sendRequest: async () => {
        const state = get();
        if (state.isLoading)
            return;
        set({ isLoading: true, error: null, response: null });
        useRequestTabsStore.getState().syncFromRequestStore({ isLoading: true, error: null, response: null });
        // Clean query parameters and headers: filter out those without keys or disabled
        const cleanQueryParams = state.queryParams.filter((q) => q.key.trim() !== '');
        const cleanHeaders = state.headers.filter((h) => h.key.trim() !== '');
        // Formulate ExecuteRequestInput payload
        const environmentId = useEnvironmentStore.getState().activeEnvironmentId;
        const requestInput = {
            method: state.method,
            url: state.url,
            headers: cleanHeaders,
            queryParams: cleanQueryParams,
            authType: state.authType,
            authConfig: state.authConfig,
            bodyType: state.bodyType,
            bodyContent: state.bodyContent || undefined,
            variables: state.variables,
            environmentId: environmentId || undefined,
            timeoutMs: state.timeoutMs,
        };
        try {
            const result = await apiClient.execute(requestInput);
            set({ response: result.response, isLoading: false });
            useRequestTabsStore.getState().syncFromRequestStore({ response: result.response, isLoading: false });
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            set({
                error: message || 'An unexpected error occurred during request execution',
                isLoading: false,
            });
            useRequestTabsStore.getState().syncFromRequestStore({
                error: message || 'An unexpected error occurred during request execution',
                isLoading: false,
            });
        }
    },
    cancelRequest: () => {
        transport.cancel();
        set({ isLoading: false, error: 'Request cancelled by user' });
        useRequestTabsStore.getState().syncFromRequestStore({ isLoading: false, error: 'Request cancelled by user' });
    },
}));
//# sourceMappingURL=request-store.js.map