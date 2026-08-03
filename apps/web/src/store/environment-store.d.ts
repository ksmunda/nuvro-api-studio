import type { Environment, EnvironmentDetail, Variable } from '@nuvro/types';
interface EnvironmentState {
    environments: Environment[];
    activeEnvironmentId: string | null;
    activeEnvironmentDetail: EnvironmentDetail | null;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    loadEnvironments: (workspaceId: string) => Promise<void>;
    selectEnvironment: (id: string | null, workspaceId: string) => Promise<void>;
    createEnvironment: (workspaceId: string, name: string) => Promise<Environment>;
    updateEnvironment: (id: string, name: string) => Promise<void>;
    deleteEnvironment: (id: string, workspaceId: string) => Promise<void>;
    duplicateEnvironment: (id: string, newName: string) => Promise<Environment>;
    addVariable: (environmentId: string, variable: {
        key: string;
        value: string;
        isSecret?: boolean;
        enabled?: boolean;
        description?: string;
    }) => Promise<void>;
    updateVariable: (environmentId: string, variableId: string, updates: Partial<Variable>) => Promise<void>;
    deleteVariable: (environmentId: string, variableId: string) => Promise<void>;
}
export declare const useEnvironmentStore: import("zustand").UseBoundStore<import("zustand").StoreApi<EnvironmentState>>;
export {};
//# sourceMappingURL=environment-store.d.ts.map