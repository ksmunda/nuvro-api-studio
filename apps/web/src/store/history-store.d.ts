import type { RequestHistoryItem } from '@nuvro/types';
interface HistoryState {
    history: RequestHistoryItem[];
    isLoading: boolean;
    error: string | null;
    loadHistory: () => Promise<void>;
    deleteHistoryItem: (id: string) => Promise<void>;
    clearHistory: () => Promise<void>;
    selectHistoryItem: (item: RequestHistoryItem) => void;
}
export declare const useHistoryStore: import("zustand").UseBoundStore<import("zustand").StoreApi<HistoryState>>;
export {};
//# sourceMappingURL=history-store.d.ts.map