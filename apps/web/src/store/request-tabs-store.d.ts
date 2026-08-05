import type { HttpMethod, AuthType, BodyType, KeyValuePair, ExecuteResponse } from '@nuvro/types';
export interface RequestTab {
    id: string;
    requestId: string | null;
    collectionId: string | null;
    folderId: string | null;
    workspaceId: string;
    title: string;
    method: HttpMethod;
    url: string;
    headers: KeyValuePair[];
    queryParams: KeyValuePair[];
    authType: AuthType;
    authConfig: Record<string, any>;
    bodyType: BodyType;
    bodyContent: string;
    response: ExecuteResponse | null;
    isLoading: boolean;
    error: string | null;
    activeTab: 'params' | 'auth' | 'headers' | 'body';
    responseActiveTab: 'body' | 'headers';
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
export declare const checkTabDirty: (tab: RequestTab) => boolean;
interface RequestTabsState {
    tabs: RequestTab[];
    activeTabId: string | null;
    openNewRequest: (workspaceId: string, collectionId?: string | null, folderId?: string | null) => string;
    openSavedRequest: (request: any, workspaceId: string) => void;
    activateTab: (tabId: string) => void;
    closeTab: (tabId: string, force?: boolean) => boolean;
    closeOtherTabs: (tabId: string) => void;
    closeAllTabs: () => void;
    updateActiveTab: (updates: Partial<RequestTab>) => void;
    saveActiveTab: (savedRequest: any) => void;
    syncFromRequestStore: (storeState: any) => void;
}
export declare const useRequestTabsStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<RequestTabsState>, "setState" | "persist"> & {
    setState(partial: RequestTabsState | Partial<RequestTabsState> | ((state: RequestTabsState) => RequestTabsState | Partial<RequestTabsState>), replace?: false | undefined): unknown;
    setState(state: RequestTabsState | ((state: RequestTabsState) => RequestTabsState), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<RequestTabsState, {
            tabs: {
                id: string;
                requestId: string | null;
                collectionId: string | null;
                folderId: string | null;
                workspaceId: string;
                title: string;
                method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS" | "TRACE" | "CONNECT";
                url: string;
                headers: {
                    key: string;
                    value: string;
                    enabled: boolean;
                    description?: string | undefined;
                    filename?: string | undefined;
                    fileContent?: string | undefined;
                }[];
                queryParams: {
                    key: string;
                    value: string;
                    enabled: boolean;
                    description?: string | undefined;
                    filename?: string | undefined;
                    fileContent?: string | undefined;
                }[];
                authType: "NONE" | "BASIC" | "BEARER" | "API_KEY" | "OAUTH2" | "DIGEST";
                authConfig: {};
                bodyType: "NONE" | "JSON" | "FORM_DATA" | "FORM_URL_ENCODED" | "RAW" | "BINARY" | "GRAPHQL";
                bodyContent: string;
                response: null;
                isLoading: boolean;
                error: null;
                activeTab: "params" | "auth" | "headers" | "body";
                responseActiveTab: "headers" | "body";
                initialState: {
                    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS" | "TRACE" | "CONNECT";
                    url: string;
                    headers: {
                        key: string;
                        value: string;
                        enabled: boolean;
                        description?: string | undefined;
                        filename?: string | undefined;
                        fileContent?: string | undefined;
                    }[];
                    queryParams: {
                        key: string;
                        value: string;
                        enabled: boolean;
                        description?: string | undefined;
                        filename?: string | undefined;
                        fileContent?: string | undefined;
                    }[];
                    authType: "NONE" | "BASIC" | "BEARER" | "API_KEY" | "OAUTH2" | "DIGEST";
                    authConfig: {};
                    bodyType: "NONE" | "JSON" | "FORM_DATA" | "FORM_URL_ENCODED" | "RAW" | "BINARY" | "GRAPHQL";
                    bodyContent: string;
                } | null;
            }[];
            activeTabId: string | null;
        }, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: RequestTabsState) => void) => () => void;
        onFinishHydration: (fn: (state: RequestTabsState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<RequestTabsState, {
            tabs: {
                id: string;
                requestId: string | null;
                collectionId: string | null;
                folderId: string | null;
                workspaceId: string;
                title: string;
                method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS" | "TRACE" | "CONNECT";
                url: string;
                headers: {
                    key: string;
                    value: string;
                    enabled: boolean;
                    description?: string | undefined;
                    filename?: string | undefined;
                    fileContent?: string | undefined;
                }[];
                queryParams: {
                    key: string;
                    value: string;
                    enabled: boolean;
                    description?: string | undefined;
                    filename?: string | undefined;
                    fileContent?: string | undefined;
                }[];
                authType: "NONE" | "BASIC" | "BEARER" | "API_KEY" | "OAUTH2" | "DIGEST";
                authConfig: {};
                bodyType: "NONE" | "JSON" | "FORM_DATA" | "FORM_URL_ENCODED" | "RAW" | "BINARY" | "GRAPHQL";
                bodyContent: string;
                response: null;
                isLoading: boolean;
                error: null;
                activeTab: "params" | "auth" | "headers" | "body";
                responseActiveTab: "headers" | "body";
                initialState: {
                    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS" | "TRACE" | "CONNECT";
                    url: string;
                    headers: {
                        key: string;
                        value: string;
                        enabled: boolean;
                        description?: string | undefined;
                        filename?: string | undefined;
                        fileContent?: string | undefined;
                    }[];
                    queryParams: {
                        key: string;
                        value: string;
                        enabled: boolean;
                        description?: string | undefined;
                        filename?: string | undefined;
                        fileContent?: string | undefined;
                    }[];
                    authType: "NONE" | "BASIC" | "BEARER" | "API_KEY" | "OAUTH2" | "DIGEST";
                    authConfig: {};
                    bodyType: "NONE" | "JSON" | "FORM_DATA" | "FORM_URL_ENCODED" | "RAW" | "BINARY" | "GRAPHQL";
                    bodyContent: string;
                } | null;
            }[];
            activeTabId: string | null;
        }, unknown>>;
    };
}>;
export {};
//# sourceMappingURL=request-tabs-store.d.ts.map