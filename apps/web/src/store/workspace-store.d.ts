import type { Workspace, WorkspaceDetail, WorkspaceMember, WorkspaceRole } from '@nuvro/types';
interface WorkspaceState {
    workspaces: Workspace[];
    activeWorkspaceId: string | null;
    activeWorkspace: Workspace | null;
    activeWorkspaceDetail: WorkspaceDetail | null;
    members: WorkspaceMember[];
    currentUserRole: WorkspaceRole | null;
    isLoading: boolean;
    membersLoading: boolean;
    error: string | null;
    membersError: string | null;
    initialize: () => Promise<void>;
    switchWorkspace: (id: string) => Promise<void>;
    refreshWorkspaces: () => Promise<void>;
    createWorkspace: (input: {
        name: string;
        slug?: string;
        description?: string;
    }) => Promise<Workspace>;
    loadActiveWorkspaceDetail: () => Promise<void>;
    refreshMembers: () => Promise<void>;
    addMember: (email: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER') => Promise<void>;
    updateRole: (userId: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER') => Promise<void>;
    removeMember: (userId: string) => Promise<void>;
}
export declare const useWorkspaceStore: import("zustand").UseBoundStore<import("zustand").StoreApi<WorkspaceState>>;
export {};
//# sourceMappingURL=workspace-store.d.ts.map