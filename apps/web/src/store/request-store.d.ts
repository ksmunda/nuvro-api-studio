import type { HttpMethod, AuthType, BodyType, KeyValuePair, ExecuteResponse } from '@nuvro/types';
export interface RequestState {
    method: HttpMethod;
    url: string;
    headers: KeyValuePair[];
    queryParams: KeyValuePair[];
    authType: AuthType;
    authConfig: Record<string, any>;
    bodyType: BodyType;
    bodyContent: string;
    variables: Record<string, string>;
    timeoutMs: number;
    isLoading: boolean;
    error: string | null;
    response: ExecuteResponse | null;
    activeTab: 'params' | 'auth' | 'headers' | 'body';
    responseActiveTab: 'body' | 'headers';
    setMethod: (method: HttpMethod) => void;
    setUrl: (url: string) => void;
    setHeaders: (headers: KeyValuePair[]) => void;
    setQueryParams: (queryParams: KeyValuePair[]) => void;
    setAuthType: (authType: AuthType) => void;
    setAuthConfig: (authConfig: Record<string, any>) => void;
    setBodyType: (bodyType: BodyType) => void;
    setBodyContent: (bodyContent: string) => void;
    setVariables: (variables: Record<string, string>) => void;
    setTimeoutMs: (timeoutMs: number) => void;
    setActiveTab: (tab: 'params' | 'auth' | 'headers' | 'body') => void;
    setResponseActiveTab: (tab: 'body' | 'headers') => void;
    sendRequest: () => Promise<void>;
    cancelRequest: () => void;
    resetResponse: () => void;
}
export declare const useRequestStore: import("zustand").UseBoundStore<import("zustand").StoreApi<RequestState>>;
//# sourceMappingURL=request-store.d.ts.map