import { create } from 'zustand';
import { CollectionsClient } from '@nuvro/api-client';
import { useRequestStore } from './request-store.js';
import type {
  CollectionDetail,
  ApiRequest,
  HttpMethod,
  KeyValuePair,
  AuthType,
  BodyType,
} from '@nuvro/types';

const collectionsClient = new CollectionsClient();

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

  // Actions
  loadCollections: (workspaceId: string) => Promise<void>;
  setActiveRequest: (request: ApiRequest | null) => void;
  createCollection: (name: string, workspaceId: string, description?: string) => Promise<void>;
  updateCollection: (id: string, name: string, description?: string) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  
  createFolder: (collectionId: string, name: string, parentId?: string | null) => Promise<void>;
  updateFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;

  createRequest: (
    collectionId: string,
    name: string,
    method: HttpMethod,
    url: string,
    folderId?: string | null
  ) => Promise<ApiRequest>;
  updateRequest: (id: string, updates: Partial<ApiRequest>) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  duplicateRequest: (request: ApiRequest) => Promise<void>;
  moveRequest: (requestId: string, targetCollectionId: string, targetFolderId: string | null) => Promise<void>;

  isDirty: () => boolean;
  resetDirtyState: () => void;
}

const cleanKeyValuePair = (pairs: KeyValuePair[]): KeyValuePair[] => {
  return pairs
    .map((p) => ({ key: p.key.trim(), value: p.value.trim(), enabled: p.enabled }))
    .filter((p) => p.key !== '');
};

export const useCollectionStore = create<SavedRequestState>((set, get) => ({
  collections: [],
  activeRequest: null,
  initialRequestState: null,
  isLoading: false,
  isSaving: false,
  error: null,

  loadCollections: async (workspaceId) => {
    set({ isLoading: true, error: null });
    try {
      const collections = await collectionsClient.getCollections(workspaceId);
      set({ collections, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), isLoading: false });
    }
  },

  setActiveRequest: (request) => {
    const requestStore = useRequestStore.getState();
    if (!request) {
      set({ activeRequest: null, initialRequestState: null });
      return;
    }

    // Map helper to format raw database json structure to KeyValuePair array
    const mapPairs = (raw: unknown): KeyValuePair[] => {
      if (Array.isArray(raw)) return raw as KeyValuePair[];
      if (typeof raw === 'object' && raw !== null) {
        return Object.entries(raw).map(([key, value]) => ({
          key,
          value: String(value),
          enabled: true,
        }));
      }
      return [{ key: '', value: '', enabled: true }];
    };

    const headers = mapPairs(request.headers);
    const queryParams = mapPairs(request.queryParams);
    const authConfig = (request.authConfig as Record<string, unknown>) || {};
    const bodyContent = request.bodyContent || '';

    // Populate request builder state
    requestStore.setMethod(request.method);
    requestStore.setUrl(request.url);
    requestStore.setHeaders(headers.length > 0 ? headers : [{ key: '', value: '', enabled: true }]);
    requestStore.setQueryParams(queryParams.length > 0 ? queryParams : [{ key: '', value: '', enabled: true }]);
    requestStore.setAuthType(request.authType);
    requestStore.setAuthConfig(authConfig);
    requestStore.setBodyType(request.bodyType);
    requestStore.setBodyContent(bodyContent);
    requestStore.resetResponse();

    // Snapshot for dirty checking
    set({
      activeRequest: request,
      initialRequestState: {
        method: request.method,
        url: request.url,
        headers,
        queryParams,
        authType: request.authType,
        authConfig,
        bodyType: request.bodyType,
        bodyContent,
      },
    });
  },

  createCollection: async (name, workspaceId, description) => {
    set({ isSaving: true, error: null });
    try {
      await collectionsClient.createCollection({ name, workspaceId, description });
      const collections = await collectionsClient.getCollections(workspaceId);
      set({ collections, isSaving: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), isSaving: false });
    }
  },

  updateCollection: async (id, name, description) => {
    set({ isSaving: true, error: null });
    try {
      const active = get().activeRequest;
      const workspaceId = active?.collectionId ? get().collections.find(c => c.id === active.collectionId)?.workspaceId : get().collections[0]?.workspaceId;
      await collectionsClient.updateCollection(id, { name, description });
      if (workspaceId) {
        const collections = await collectionsClient.getCollections(workspaceId);
        set({ collections });
      }
      set({ isSaving: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), isSaving: false });
    }
  },

  deleteCollection: async (id) => {
    set({ isSaving: true, error: null });
    try {
      const active = get().activeRequest;
      const workspaceId = get().collections.find(c => c.id === id)?.workspaceId;
      await collectionsClient.deleteCollection(id);
      
      if (active?.collectionId === id) {
        get().setActiveRequest(null);
      }

      if (workspaceId) {
        const collections = await collectionsClient.getCollections(workspaceId);
        set({ collections });
      }
      set({ isSaving: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), isSaving: false });
    }
  },

  createFolder: async (collectionId, name, parentId) => {
    set({ isSaving: true, error: null });
    try {
      const workspaceId = get().collections.find(c => c.id === collectionId)?.workspaceId;
      await collectionsClient.createFolder(collectionId, { name, parentId: parentId ?? undefined });
      if (workspaceId) {
        const collections = await collectionsClient.getCollections(workspaceId);
        set({ collections });
      }
      set({ isSaving: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), isSaving: false });
    }
  },

  updateFolder: async (id, name) => {
    set({ isSaving: true, error: null });
    try {
      await collectionsClient.updateFolder(id, { name });
      const active = get().activeRequest;
      const workspaceId = active?.collectionId ? get().collections.find(c => c.id === active.collectionId)?.workspaceId : get().collections[0]?.workspaceId;
      if (workspaceId) {
        const collections = await collectionsClient.getCollections(workspaceId);
        set({ collections });
      }
      set({ isSaving: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), isSaving: false });
    }
  },

  deleteFolder: async (id) => {
    set({ isSaving: true, error: null });
    try {
      const active = get().activeRequest;
      let workspaceId = '';
      for (const col of get().collections) {
        if (col.folders.some(f => f.id === id)) {
          workspaceId = col.workspaceId;
          break;
        }
      }

      await collectionsClient.deleteFolder(id);

      if (active?.folderId === id) {
        get().setActiveRequest(null);
      }

      if (workspaceId) {
        const collections = await collectionsClient.getCollections(workspaceId);
        set({ collections });
      }
      set({ isSaving: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), isSaving: false });
    }
  },

  createRequest: async (collectionId, name, method, url, folderId) => {
    set({ isSaving: true, error: null });
    try {
      const request = await collectionsClient.createRequest(collectionId, {
        name,
        method,
        url,
        folderId: folderId ?? undefined,
      });

      const workspaceId = get().collections.find(c => c.id === collectionId)?.workspaceId;
      if (workspaceId) {
        const collections = await collectionsClient.getCollections(workspaceId);
        set({ collections });
      }
      set({ isSaving: false });
      return request;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), isSaving: false });
      throw err;
    }
  },

  updateRequest: async (id, updates) => {
    set({ isSaving: true, error: null });
    try {
      const updated = await collectionsClient.updateRequest(id, updates as Record<string, unknown>);
      
      const active = get().activeRequest;
      const workspaceId = active?.collectionId ? get().collections.find(c => c.id === active.collectionId)?.workspaceId : get().collections[0]?.workspaceId;
      
      if (workspaceId) {
        const collections = await collectionsClient.getCollections(workspaceId);
        set({ collections });
      }

      if (active?.id === id) {
        // Sync active state and snapshot
        get().setActiveRequest(updated);
      }
      set({ isSaving: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), isSaving: false });
    }
  },

  deleteRequest: async (id) => {
    set({ isSaving: true, error: null });
    try {
      const active = get().activeRequest;
      let workspaceId = '';
      for (const col of get().collections) {
        if (col.requests?.some((r: ApiRequest) => r.id === id)) {
          workspaceId = col.workspaceId;
          break;
        }
      }

      await collectionsClient.deleteRequest(id);

      if (active?.id === id) {
        get().setActiveRequest(null);
      }

      if (workspaceId) {
        const collections = await collectionsClient.getCollections(workspaceId);
        set({ collections });
      }
      set({ isSaving: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), isSaving: false });
    }
  },

  duplicateRequest: async (request) => {
    set({ isSaving: true, error: null });
    try {
      const name = `${request.name} Copy`;
      const duplicated = await collectionsClient.createRequest(request.collectionId, {
        name,
        method: request.method,
        url: request.url,
        folderId: request.folderId ?? undefined,
        headers: request.headers as Array<{ key: string; value: string; enabled: boolean }>,
        queryParams: request.queryParams as Array<{ key: string; value: string; enabled: boolean }>,
        authType: request.authType,
        authConfig: request.authConfig as Record<string, unknown>,
        bodyType: request.bodyType,
        bodyContent: request.bodyContent || undefined,
      });

      const workspaceId = get().collections.find(c => c.id === request.collectionId)?.workspaceId;
      if (workspaceId) {
        const collections = await collectionsClient.getCollections(workspaceId);
        set({ collections });
      }

      // Automatically select duplicated request
      get().setActiveRequest(duplicated);
      set({ isSaving: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), isSaving: false });
    }
  },

  moveRequest: async (requestId, targetCollectionId, targetFolderId) => {
    set({ isSaving: true, error: null });
    try {
      await collectionsClient.updateRequest(requestId, {
        collectionId: targetCollectionId,
        folderId: targetFolderId ?? undefined,
      });
      const active = get().activeRequest;
      const workspaceId = active?.collectionId ? get().collections.find(c => c.id === active.collectionId)?.workspaceId : get().collections[0]?.workspaceId;
      if (workspaceId) {
        const collections = await collectionsClient.getCollections(workspaceId);
        set({ collections });
      }
      set({ isSaving: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), isSaving: false });
    }
  },

  isDirty: () => {
    const { activeRequest, initialRequestState } = get();
    if (!activeRequest || !initialRequestState) return false;

    const requestStore = useRequestStore.getState();

    const cleanHeaders = cleanKeyValuePair(requestStore.headers);
    const cleanParams = cleanKeyValuePair(requestStore.queryParams);
    const cleanInitialHeaders = cleanKeyValuePair(initialRequestState.headers);
    const cleanInitialParams = cleanKeyValuePair(initialRequestState.queryParams);

    const matchMethod = requestStore.method === initialRequestState.method;
    const matchUrl = requestStore.url === initialRequestState.url;
    const matchHeaders = JSON.stringify(cleanHeaders) === JSON.stringify(cleanInitialHeaders);
    const matchParams = JSON.stringify(cleanParams) === JSON.stringify(cleanInitialParams);
    const matchAuthType = requestStore.authType === initialRequestState.authType;
    const matchAuthConfig = JSON.stringify(requestStore.authConfig) === JSON.stringify(initialRequestState.authConfig);
    const matchBodyType = requestStore.bodyType === initialRequestState.bodyType;
    const matchBodyContent = (requestStore.bodyContent || '') === (initialRequestState.bodyContent || '');

    return !(
      matchMethod &&
      matchUrl &&
      matchHeaders &&
      matchParams &&
      matchAuthType &&
      matchAuthConfig &&
      matchBodyType &&
      matchBodyContent
    );
  },

  resetDirtyState: () => {
    const active = get().activeRequest;
    if (active) {
      get().setActiveRequest(active);
    }
  },
}));
