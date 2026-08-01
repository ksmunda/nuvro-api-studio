import type { CollectionDetail, ApiRequest, HttpMethod, KeyValuePair, AuthType, BodyType } from '@nuvro/types';
export interface SavedRequestState {
    collections: CollectionDetail[];
    activeRequest: ApiRequest | null;
    initialRequestState: {
        method: HttpMethod;
        url: string;
        headers: KeyValuePair[];
        queryParams: KeyValuePair[];
        authType: AuthType;
        authConfig: Record<string, unknown>;
        bodyType: BodyType;
        bodyContent: string;
    } | null;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    loadCollections: (workspaceId: string) => Promise<void>;
    setActiveRequest: (request: ApiRequest | null) => void;
    createCollection: (name: string, workspaceId: string, description?: string) => Promise<void>;
    updateCollection: (id: string, name: string, description?: string) => Promise<void>;
    deleteCollection: (id: string) => Promise<void>;
    createFolder: (collectionId: string, name: string, parentId?: string | null) => Promise<void>;
    updateFolder: (id: string, name: string) => Promise<void>;
    deleteFolder: (id: string) => Promise<void>;
    createRequest: (collectionId: string, name: string, method: HttpMethod, url: string, folderId?: string | null) => Promise<ApiRequest>;
    updateRequest: (id: string, updates: Partial<ApiRequest>) => Promise<void>;
    deleteRequest: (id: string) => Promise<void>;
    duplicateRequest: (request: ApiRequest) => Promise<void>;
    moveRequest: (requestId: string, targetCollectionId: string, targetFolderId: string | null) => Promise<void>;
    isDirty: () => boolean;
    resetDirtyState: () => void;
}
export declare const useCollectionStore: import("zustand").UseBoundStore<import("zustand").StoreApi<SavedRequestState>>;
//# sourceMappingURL=collection-store.d.ts.map