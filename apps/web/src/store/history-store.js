/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { HistoryClient } from '@nuvro/api-client';
import { useRequestStore } from './request-store.js';
import { useCollectionStore } from './collection-store.js';
import { API_BASE } from '../config/api.js';
const client = new HistoryClient(`${API_BASE}/api/v1`);
export const useHistoryStore = create((set, get) => ({
    history: [],
    isLoading: false,
    error: null,
    loadHistory: async () => {
        set({ isLoading: true, error: null });
        try {
            const list = await client.getHistory();
            set({ history: list, isLoading: false });
        }
        catch (err) {
            set({ error: err instanceof Error ? err.message : String(err), isLoading: false });
        }
    },
    deleteHistoryItem: async (id) => {
        try {
            await client.deleteHistoryItem(id);
            set({ history: get().history.filter(h => h.id !== id) });
        }
        catch (err) {
            set({ error: err instanceof Error ? err.message : String(err) });
        }
    },
    clearHistory: async () => {
        try {
            await client.clearHistory();
            set({ history: [] });
        }
        catch (err) {
            set({ error: err instanceof Error ? err.message : String(err) });
        }
    },
    selectHistoryItem: (item) => {
        // 1. Deactivate collection request
        useCollectionStore.getState().setActiveRequest(null);
        // 2. Restore request parameters
        const headers = item.requestHeaders && item.requestHeaders.length > 0
            ? item.requestHeaders.map((h) => ({ key: h.key, value: h.value, enabled: true }))
            : [{ key: '', value: '', enabled: true }];
        const queryParams = [];
        try {
            const urlToParse = item.url.startsWith('http') ? item.url : `http://localhost/${item.url.replace(/^\//, '')}`;
            const parsedUrl = new URL(urlToParse);
            parsedUrl.searchParams.forEach((value, key) => {
                queryParams.push({ key, value, enabled: true });
            });
        }
        catch {
            // ignore
        }
        const finalQueryParams = queryParams.length > 0 ? queryParams : [{ key: '', value: '', enabled: true }];
        let bodyType = 'NONE';
        if (item.requestBody) {
            const hasJsonHeader = item.requestHeaders?.some((h) => h.key.toLowerCase() === 'content-type' && h.value.toLowerCase().includes('application/json'));
            bodyType = hasJsonHeader ? 'JSON' : 'RAW';
        }
        useRequestStore.setState({
            method: item.method,
            url: item.url,
            headers: headers,
            queryParams: finalQueryParams,
            authType: 'NONE',
            authConfig: {},
            bodyType: bodyType,
            bodyContent: item.requestBody || '',
            response: null,
            error: null,
        });
    },
}));
//# sourceMappingURL=history-store.js.map