/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HttpMethod, AuthType, BodyType, KeyValuePair, ExecuteResponse } from '@nuvro/types';
import { useRequestStore } from './request-store.js';
import { useCollectionStore } from './collection-store.js';

export interface RequestTab {
  id: string; // Local unique ID (e.g. random or requestId)
  requestId: string | null; // Saved request ID (if any)
  collectionId: string | null;
  folderId: string | null;
  workspaceId: string;
  title: string;

  // Request Builder State
  method: HttpMethod;
  url: string;
  headers: KeyValuePair[];
  queryParams: KeyValuePair[];
  authType: AuthType;
  authConfig: Record<string, any>;
  bodyType: BodyType;
  bodyContent: string;

  // Execution/Response State
  response: ExecuteResponse | null;
  isLoading: boolean;
  error: string | null;
  activeTab: 'params' | 'auth' | 'headers' | 'body';
  responseActiveTab: 'body' | 'headers';

  // Timestamps
  createdAt: number;
  lastAccessedAt: number;

  // Snapshot for dirty checking
  initialState: {
    method: HttpMethod;
    url: string;
    headers: KeyValuePair[];
    queryParams: KeyValuePair[];
    authType: AuthType;
    authConfig: Record<string, any>;
    bodyType: BodyType;
    bodyContent: string;
  };
}

const defaultKeyValuePair = (): KeyValuePair => ({ key: '', value: '', enabled: true });

const createDefaultTabState = () => {
  const method: HttpMethod = 'GET';
  const url = '';
  const headers = [defaultKeyValuePair()];
  const queryParams = [defaultKeyValuePair()];
  const authType: AuthType = 'NONE';
  const authConfig = {};
  const bodyType: BodyType = 'NONE';
  const bodyContent = '';

  return {
    method,
    url,
    headers,
    queryParams,
    authType,
    authConfig,
    bodyType,
    bodyContent,
    response: null,
    isLoading: false,
    error: null,
    activeTab: 'params' as const,
    responseActiveTab: 'body' as const,
    createdAt: Date.now(),
    lastAccessedAt: Date.now(),
    initialState: {
      method,
      url,
      headers,
      queryParams,
      authType,
      authConfig,
      bodyType,
      bodyContent,
    },
  };
};

const cleanKeyValuePair = (pairs: KeyValuePair[]): KeyValuePair[] => {
  return (pairs || [])
    .map((p) => ({ key: p.key.trim(), value: p.value.trim(), enabled: p.enabled }))
    .filter((p) => p.key !== '');
};


const scrubTab = (t: RequestTab): any => {
  return {
    id: t.id,
    requestId: t.requestId,
    collectionId: t.collectionId,
    folderId: t.folderId,
    workspaceId: t.workspaceId,
    title: t.title,
    method: t.method,
    url: t.url,
    headers: t.headers.map((h) => {
      const lower = h.key.toLowerCase();
      if (lower.includes('auth') || lower.includes('key') || lower.includes('token') || lower.includes('secret') || lower.includes('cookie')) {
        return { key: h.key, value: '••••••••', enabled: h.enabled };
      }
      return h;
    }),
    queryParams: t.queryParams.map((q) => {
      const lower = q.key.toLowerCase();
      if (lower.includes('key') || lower.includes('token') || lower.includes('secret') || lower.includes('pass')) {
        return { key: q.key, value: '••••••••', enabled: q.enabled };
      }
      return q;
    }),
    authType: t.authType,
    authConfig: {},
    bodyType: t.bodyType,
    bodyContent: t.bodyType === 'NONE' ? '' : t.bodyContent,
    response: null,
    isLoading: false,
    error: null,
    activeTab: t.activeTab,
    responseActiveTab: t.responseActiveTab,
    createdAt: t.createdAt || Date.now(),
    lastAccessedAt: t.lastAccessedAt || Date.now(),
    initialState: t.initialState ? {
      method: t.initialState.method,
      url: t.initialState.url,
      headers: t.initialState.headers.map((h) => {
        const lower = h.key.toLowerCase();
        if (lower.includes('auth') || lower.includes('key') || lower.includes('token') || lower.includes('secret') || lower.includes('cookie')) {
          return { key: h.key, value: '••••••••', enabled: h.enabled };
        }
        return h;
      }),
      queryParams: t.initialState.queryParams.map((q) => {
        const lower = q.key.toLowerCase();
        if (lower.includes('key') || lower.includes('token') || lower.includes('secret') || lower.includes('pass')) {
          return { key: q.key, value: '••••••••', enabled: q.enabled };
        }
        return q;
      }),
      authType: t.initialState.authType,
      authConfig: {},
      bodyType: t.initialState.bodyType,
      bodyContent: t.initialState.bodyType === 'NONE' ? '' : t.initialState.bodyContent,
    } : null,
  };
};

export const checkTabDirty = (tab: RequestTab): boolean => {
  if (!tab.initialState) return false;

  const cleanHeaders = cleanKeyValuePair(tab.headers);
  const cleanParams = cleanKeyValuePair(tab.queryParams);
  const cleanInitialHeaders = cleanKeyValuePair(tab.initialState.headers);
  const cleanInitialParams = cleanKeyValuePair(tab.initialState.queryParams);

  const matchMethod = tab.method === tab.initialState.method;
  const matchUrl = tab.url === tab.initialState.url;
  const matchHeaders = JSON.stringify(cleanHeaders) === JSON.stringify(cleanInitialHeaders);
  const matchParams = JSON.stringify(cleanParams) === JSON.stringify(cleanInitialParams);
  const matchAuthType = tab.authType === tab.initialState.authType;
  const matchAuthConfig = JSON.stringify(tab.authConfig) === JSON.stringify(tab.initialState.authConfig);
  const matchBodyType = tab.bodyType === tab.initialState.bodyType;
  const matchBodyContent = (tab.bodyContent || '') === (tab.initialState.bodyContent || '');

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
};

interface RequestTabsState {
  tabs: RequestTab[];
  closedTabs: RequestTab[];
  activeTabId: string | null;

  // Actions
  reopenClosedTab: (workspaceId: string) => void;
  openNewRequest: (workspaceId: string, collectionId?: string | null, folderId?: string | null) => string;
  openSavedRequest: (request: any, workspaceId: string) => void;
  activateTab: (tabId: string) => void;
  closeTab: (tabId: string, force?: boolean) => boolean; // returns true if closed, false if cancelled
  closeOtherTabs: (tabId: string) => void;
  closeAllTabs: () => void;
  updateActiveTab: (updates: Partial<RequestTab>) => void;
  saveActiveTab: (savedRequest: any) => void;
  syncFromRequestStore: (storeState: any) => void;
  validateWorkspaceTabs: (workspaceId: string, collections: any[]) => void;
  duplicateTab: (tabId: string) => string | null;
}

export const useRequestTabsStore = create<RequestTabsState>()(
  persist(
    (set, get) => {
      // Helper to load tab state into the main request store
      const loadTabIntoRequestStore = (tab: RequestTab) => {
        const reqStore = useRequestStore.getState();
        const colStore = useCollectionStore.getState();

        reqStore.setMethod(tab.method);
        reqStore.setUrl(tab.url);
        reqStore.setHeaders(tab.headers.length > 0 ? tab.headers : [defaultKeyValuePair()]);
        reqStore.setQueryParams(tab.queryParams.length > 0 ? tab.queryParams : [defaultKeyValuePair()]);
        reqStore.setAuthType(tab.authType);
        reqStore.setAuthConfig(tab.authConfig);
        reqStore.setBodyType(tab.bodyType);
        reqStore.setBodyContent(tab.bodyContent);
        reqStore.setActiveTab(tab.activeTab);
        reqStore.setResponseActiveTab(tab.responseActiveTab);
        
        // Update request-store response fields directly
        useRequestStore.setState({
          response: tab.response,
          isLoading: tab.isLoading,
          error: tab.error,
        });

        // Set active saved request in collection store for save/rename/delete integration
        if (tab.requestId) {
          // Find matching request object from workspace collections
          let matchedReq = null;
          for (const col of colStore.collections) {
            const found = col.requests?.find((r) => r.id === tab.requestId);
            if (found) {
              matchedReq = found;
              break;
            }
          }
          if (matchedReq) {
            useCollectionStore.setState({
              activeRequest: matchedReq,
              initialRequestState: tab.initialState,
            });
          }
        } else {
          useCollectionStore.setState({
            activeRequest: null,
            initialRequestState: null,
          });
        }
      };

      return {
        tabs: [],
        closedTabs: [],
        activeTabId: null,


        reopenClosedTab: (workspaceId) => {
          set((state) => {
            const index = state.closedTabs.findIndex(t => t.workspaceId === workspaceId);
            if (index === -1) return state; // No closed tabs for this workspace

            const tabToReopen = state.closedTabs[index];
            if (!tabToReopen) return state;
            
            const newClosedTabs = [...state.closedTabs];
            newClosedTabs.splice(index, 1);

            const newId = `new_${Math.random().toString(36).substr(2, 9)}`;
            const reopenedTab: RequestTab = {
              ...tabToReopen,
              id: newId,
              lastAccessedAt: Date.now(),
            };

            loadTabIntoRequestStore(reopenedTab);

            return {
              tabs: [...state.tabs, reopenedTab],
              activeTabId: newId,
              closedTabs: newClosedTabs,
            };
          });
        },

        openNewRequest: (workspaceId, collectionId = null, folderId = null) => {
          const id = `new_${Math.random().toString(36).substr(2, 9)}`;
          const newTab: RequestTab = {
            id,
            requestId: null,
            collectionId,
            folderId,
            workspaceId,
            title: 'New Request',
            ...createDefaultTabState(),
          };

          set((state) => ({
            tabs: [...state.tabs, newTab],
            activeTabId: id,
          }));

          loadTabIntoRequestStore(newTab);
          return id;
        },

        openSavedRequest: (request, workspaceId) => {
          const existing = get().tabs.find((t) => t.requestId === request.id && t.workspaceId === workspaceId);
          if (existing) {
            get().activateTab(existing.id);
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
            return [defaultKeyValuePair()];
          };

          const headers = mapPairs(request.headers);
          const queryParams = mapPairs(request.queryParams);
          const authConfig = (request.authConfig as Record<string, unknown>) || {};
          const bodyContent = request.bodyContent || '';

          const newTab: RequestTab = {
            id: request.id,
            requestId: request.id,
            collectionId: request.collectionId || null,
            folderId: request.folderId || null,
            workspaceId,
            title: request.name,
            method: request.method as HttpMethod,
            url: request.url,
            headers: headers.length > 0 ? headers : [defaultKeyValuePair()],
            queryParams: queryParams.length > 0 ? queryParams : [defaultKeyValuePair()],
            authType: request.authType as AuthType,
            authConfig,
            bodyType: request.bodyType as BodyType,
            bodyContent,
            response: null,
            isLoading: false,
            error: null,
            activeTab: 'params',
            responseActiveTab: 'body',
            createdAt: Date.now(),
            lastAccessedAt: Date.now(),
            initialState: {
              method: request.method as HttpMethod,
              url: request.url,
              headers,
              queryParams,
              authType: request.authType as AuthType,
              authConfig,
              bodyType: request.bodyType as BodyType,
              bodyContent,
            },
          };

          set((state) => ({
            tabs: [...state.tabs, newTab],
            activeTabId: newTab.id,
          }));

          loadTabIntoRequestStore(newTab);
        },

        activateTab: (tabId) => {
          const tab = get().tabs.find((t) => t.id === tabId);
          if (tab) {
            set((state) => ({
              activeTabId: tabId,
              tabs: state.tabs.map((t) =>
                t.id === tabId ? { ...t, lastAccessedAt: Date.now() } : t
              ),
            }));
            loadTabIntoRequestStore(tab);
          }
        },

        closeTab: (tabId, force = false) => {
          const tab = get().tabs.find((t) => t.id === tabId);
          if (!tab) return true;

          const dirty = checkTabDirty(tab);
          if (dirty && !force) {
            const confirm = window.confirm(`Request "${tab.title}" has unsaved changes. Are you sure you want to close it?`);
            if (!confirm) return false;
          }

          const filtered = get().tabs.filter((t) => t.id !== tabId);
          let nextActiveId = get().activeTabId;

          if (get().activeTabId === tabId) {
            const lastTab = filtered[filtered.length - 1];
            nextActiveId = lastTab ? lastTab.id : null;
          }

          set((state) => ({
            tabs: filtered,
            activeTabId: nextActiveId,
            closedTabs: [tab, ...state.closedTabs].slice(0, 10),
          }));

          if (nextActiveId) {
            const nextTab = filtered.find((t) => t.id === nextActiveId);
            if (nextTab) loadTabIntoRequestStore(nextTab);
          } else {
            // Reset request store to empty default
            const reqStore = useRequestStore.getState();
            reqStore.setMethod('GET');
            reqStore.setUrl('');
            reqStore.setHeaders([defaultKeyValuePair()]);
            reqStore.setQueryParams([defaultKeyValuePair()]);
            reqStore.setAuthType('NONE');
            reqStore.setAuthConfig({});
            reqStore.setBodyType('NONE');
            reqStore.setBodyContent('');
            reqStore.resetResponse();
            useCollectionStore.setState({ activeRequest: null, initialRequestState: null });
          }

          return true;
        },

        closeOtherTabs: (tabId) => {
          const currentTab = get().tabs.find((t) => t.id === tabId);
          if (!currentTab) return;

          // Check if any other tabs are dirty
          const otherTabs = get().tabs.filter((t) => t.id !== tabId);
          const hasDirty = otherTabs.some((t) => checkTabDirty(t));

          if (hasDirty) {
            const confirm = window.confirm('Some tabs have unsaved changes. Close all other tabs anyway?');
            if (!confirm) return;
          }

          set((state) => ({
            tabs: [currentTab],
            activeTabId: tabId,
            closedTabs: [...state.tabs.filter((t) => t.id !== tabId).reverse(), ...state.closedTabs].slice(0, 10),
          }));
          loadTabIntoRequestStore(currentTab);
        },

        closeAllTabs: () => {
          const hasDirty = get().tabs.some((t) => checkTabDirty(t));
          if (hasDirty) {
            const confirm = window.confirm('Some tabs have unsaved changes. Close all tabs anyway?');
            if (!confirm) return;
          }

          set((state) => ({
            tabs: [],
            activeTabId: null,
            closedTabs: [...state.tabs.reverse(), ...state.closedTabs].slice(0, 10),
          }));

          // Reset request store
          const reqStore = useRequestStore.getState();
          reqStore.setMethod('GET');
          reqStore.setUrl('');
          reqStore.setHeaders([defaultKeyValuePair()]);
          reqStore.setQueryParams([defaultKeyValuePair()]);
          reqStore.setAuthType('NONE');
          reqStore.setAuthConfig({});
          reqStore.setBodyType('NONE');
          reqStore.setBodyContent('');
          reqStore.resetResponse();
          useCollectionStore.setState({ activeRequest: null, initialRequestState: null });
        },

        updateActiveTab: (updates) => {
          const activeId = get().activeTabId;
          if (!activeId) return;

          set((state) => ({
            tabs: state.tabs.map((t) => (t.id === activeId ? { ...t, ...updates } : t)),
          }));
        },

        saveActiveTab: (savedRequest) => {
          const activeId = get().activeTabId;
          if (!activeId) return;

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
            return [defaultKeyValuePair()];
          };

          const headers = mapPairs(savedRequest.headers);
          const queryParams = mapPairs(savedRequest.queryParams);
          const authConfig = (savedRequest.authConfig as Record<string, unknown>) || {};
          const bodyContent = savedRequest.bodyContent || '';

          set((state) => ({
            tabs: state.tabs.map((t) => {
              if (t.id === activeId) {
                return {
                  ...t,
                  id: savedRequest.id, // Update local tab ID to matching request ID
                  requestId: savedRequest.id,
                  title: savedRequest.name,
                  collectionId: savedRequest.collectionId || null,
                  folderId: savedRequest.folderId || null,
                  initialState: {
                    method: savedRequest.method as HttpMethod,
                    url: savedRequest.url,
                    headers,
                    queryParams,
                    authType: savedRequest.authType as AuthType,
                    authConfig,
                    bodyType: savedRequest.bodyType as BodyType,
                    bodyContent,
                  },
                };
              }
              return t;
            }),
            activeTabId: savedRequest.id, // Keep active state pointing to matching request ID
          }));

          // Sync workspace collections with updated tabs
          const activeTab = get().tabs.find((t) => t.id === savedRequest.id);
          if (activeTab) loadTabIntoRequestStore(activeTab);
        },

        syncFromRequestStore: (storeState) => {
          const activeId = get().activeTabId;
          if (!activeId) return;

          set((state) => ({
            tabs: state.tabs.map((t) => {
              if (t.id === activeId) {
                return {
                  ...t,
                  method: storeState.method !== undefined ? storeState.method : t.method,
                  url: storeState.url !== undefined ? storeState.url : t.url,
                  headers: storeState.headers !== undefined ? storeState.headers : t.headers,
                  queryParams: storeState.queryParams !== undefined ? storeState.queryParams : t.queryParams,
                  authType: storeState.authType !== undefined ? storeState.authType : t.authType,
                  authConfig: storeState.authConfig !== undefined ? storeState.authConfig : t.authConfig,
                  bodyType: storeState.bodyType !== undefined ? storeState.bodyType : t.bodyType,
                  bodyContent: storeState.bodyContent !== undefined ? storeState.bodyContent : t.bodyContent,
                  response: storeState.response !== undefined ? storeState.response : t.response,
                  isLoading: storeState.isLoading !== undefined ? storeState.isLoading : t.isLoading,
                  error: storeState.error !== undefined ? storeState.error : t.error,
                  activeTab: storeState.activeTab !== undefined ? storeState.activeTab : t.activeTab,
                  responseActiveTab: storeState.responseActiveTab !== undefined ? storeState.responseActiveTab : t.responseActiveTab,
                };
              }
              return t;
            }),
          }));
        },

        validateWorkspaceTabs: (workspaceId, collections) => {
          const allRequestIds = new Set(
            (collections || []).flatMap((c) => c.requests || []).map((r: any) => r.id)
          );

          set((state) => {
            const validatedTabs = state.tabs.map((t) => {
              if (t.workspaceId === workspaceId && t.requestId && !allRequestIds.has(t.requestId)) {
                return {
                  ...t,
                  requestId: null,
                  title: `${t.title} (Recovered)`,
                };
              }
              return t;
            });

            return { tabs: validatedTabs };
          });
        },

        duplicateTab: (tabId) => {
          const source = get().tabs.find((t) => t.id === tabId);
          if (!source) return null;

          const newId = `new_${Math.random().toString(36).substr(2, 9)}`;
          const now = Date.now();
          const duplicated: RequestTab = {
            ...source,
            id: newId,
            requestId: null, // Duplicate is always unsaved/draft
            title: `${source.title} (Copy)`,
            response: null,
            isLoading: false,
            error: null,
            createdAt: now,
            lastAccessedAt: now,
            initialState: {
              method: source.method,
              url: source.url,
              headers: JSON.parse(JSON.stringify(source.headers)),
              queryParams: JSON.parse(JSON.stringify(source.queryParams)),
              authType: source.authType,
              authConfig: JSON.parse(JSON.stringify(source.authConfig)),
              bodyType: source.bodyType,
              bodyContent: source.bodyContent,
            },
          };

          set((state) => ({
            tabs: [...state.tabs, duplicated],
            activeTabId: newId,
          }));

          loadTabIntoRequestStore(duplicated);
          return newId;
        },
      };
    },
    {
      name: 'nuvro:request-tabs-session',
      partialize: (state) => {
        return {
          tabs: state.tabs.map(scrubTab),
          closedTabs: (state.closedTabs || []).map(scrubTab),
          activeTabId: state.activeTabId,
        };
      },
      version: 1, // Incremented from 0 to support createdAt/lastAccessedAt migration
      migrate: (persisted: any, version: number) => {
        if (version === 0) {
          // Migrate v0 → v1: add timestamps
          const state = persisted as any;
          if (state && state.tabs) {
            const now = Date.now();
            state.tabs = state.tabs.map((t: any) => ({
              ...t,
              createdAt: t.createdAt || now,
              lastAccessedAt: t.lastAccessedAt || now,
            }));
          }
          return state;
        }
        return persisted;
      },
      storage: {
        getItem: (name: string) => {
          try {
            const raw = globalThis.localStorage.getItem(name);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            // Validate basic structure
            if (!parsed || !parsed.state || !Array.isArray(parsed.state.tabs)) {
              globalThis.localStorage.removeItem(name);
              return null;
            }
            return parsed;
          } catch {
            // Corrupted JSON — remove and start fresh
            try { globalThis.localStorage.removeItem(name); } catch { /* noop */ }
            return null;
          }
        },
        setItem: (name: string, value: unknown) => {
          try {
            globalThis.localStorage.setItem(name, JSON.stringify(value));
          } catch {
            // QuotaExceededError or SecurityError — silently fail
            // Tab state will not persist but the app continues working
          }
        },
        removeItem: (name: string) => {
          try { globalThis.localStorage.removeItem(name); } catch { /* noop */ }
        },
      },
    }
  )
);
