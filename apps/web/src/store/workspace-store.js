import { create } from 'zustand';
import { WorkspacesClient } from '@nuvro/api-client';
import { useCollectionStore } from './collection-store.js';
import { useEnvironmentStore } from './environment-store.js';
import { useHistoryStore } from './history-store.js';
import { API_BASE } from '../config/api.js';
const client = new WorkspacesClient(`${API_BASE}/api/v1`);
export const useWorkspaceStore = create((set, get) => ({
    workspaces: [],
    activeWorkspaceId: null,
    activeWorkspace: null,
    activeWorkspaceDetail: null,
    members: [],
    currentUserRole: null,
    isLoading: false,
    membersLoading: false,
    error: null,
    membersError: null,
    initialize: async () => {
        set({ isLoading: true, error: null });
        try {
            const list = await client.getWorkspaces();
            set({ workspaces: list });
            let activeId = typeof window !== 'undefined' ? window.localStorage.getItem('nuvro_active_workspace_id') : null;
            if (!activeId || !list.some((w) => w.id === activeId)) {
                activeId = list[0]?.id || null;
            }
            if (activeId) {
                const active = list.find((w) => w.id === activeId) || null;
                set({ activeWorkspaceId: activeId, activeWorkspace: active });
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem('nuvro_active_workspace_id', activeId);
                }
                // Trigger loading dependents
                await Promise.all([
                    useCollectionStore.getState().loadCollections(activeId),
                    useEnvironmentStore.getState().loadEnvironments(activeId),
                    useHistoryStore.getState().loadHistory(),
                    get().loadActiveWorkspaceDetail(),
                ]);
            }
            else {
                set({ activeWorkspaceId: null, activeWorkspace: null, activeWorkspaceDetail: null, members: [], currentUserRole: null });
            }
            set({ isLoading: false });
        }
        catch (err) {
            set({ error: err instanceof Error ? err.message : String(err), isLoading: false });
        }
    },
    switchWorkspace: async (id) => {
        const { workspaces, activeWorkspaceId } = get();
        if (activeWorkspaceId === id)
            return;
        const active = workspaces.find((w) => w.id === id) || null;
        if (!active)
            return;
        set({ activeWorkspaceId: id, activeWorkspace: active });
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('nuvro_active_workspace_id', id);
        }
        // Refresh collection/request state to avoid stale data
        const collectionStore = useCollectionStore.getState();
        collectionStore.setActiveRequest(null);
        // Reload dependents
        await Promise.all([
            collectionStore.loadCollections(id),
            useEnvironmentStore.getState().loadEnvironments(id),
            useHistoryStore.getState().loadHistory(),
            get().loadActiveWorkspaceDetail(),
        ]);
    },
    refreshWorkspaces: async () => {
        try {
            const list = await client.getWorkspaces();
            const currentActiveId = get().activeWorkspaceId;
            set({ workspaces: list });
            const active = list.find((w) => w.id === currentActiveId) || list[0] || null;
            set({
                activeWorkspaceId: active?.id || null,
                activeWorkspace: active,
            });
            if (active && typeof window !== 'undefined') {
                window.localStorage.setItem('nuvro_active_workspace_id', active.id);
            }
        }
        catch (err) {
            set({ error: err instanceof Error ? err.message : String(err) });
        }
    },
    createWorkspace: async (input) => {
        set({ isLoading: true, error: null });
        try {
            const ws = await client.createWorkspace(input);
            const list = await client.getWorkspaces();
            set({ workspaces: list, activeWorkspaceId: ws.id, activeWorkspace: ws, isLoading: false });
            if (typeof window !== 'undefined') {
                window.localStorage.setItem('nuvro_active_workspace_id', ws.id);
            }
            // Refresh collections/environments for the new workspace
            const collectionStore = useCollectionStore.getState();
            collectionStore.setActiveRequest(null);
            await Promise.all([
                collectionStore.loadCollections(ws.id),
                useEnvironmentStore.getState().loadEnvironments(ws.id),
                useHistoryStore.getState().loadHistory(),
                get().loadActiveWorkspaceDetail(),
            ]);
            return ws;
        }
        catch (err) {
            set({ error: err instanceof Error ? err.message : String(err), isLoading: false });
            throw err;
        }
    },
    loadActiveWorkspaceDetail: async () => {
        const { activeWorkspaceId } = get();
        if (!activeWorkspaceId)
            return;
        set({ membersLoading: true, membersError: null });
        try {
            const detail = await client.getWorkspace(activeWorkspaceId);
            set({
                activeWorkspaceDetail: detail,
                members: detail.members,
                currentUserRole: detail.currentUserRole,
                membersLoading: false,
            });
        }
        catch (err) {
            set({
                membersError: err instanceof Error ? err.message : String(err),
                membersLoading: false,
            });
        }
    },
    refreshMembers: async () => {
        const { activeWorkspaceId } = get();
        if (!activeWorkspaceId)
            return;
        set({ membersLoading: true, membersError: null });
        try {
            const membersList = await client.getWorkspaceMembers(activeWorkspaceId);
            set({ members: membersList, membersLoading: false });
        }
        catch (err) {
            set({
                membersError: err instanceof Error ? err.message : String(err),
                membersLoading: false,
            });
        }
    },
    addMember: async (email, role) => {
        const { activeWorkspaceId } = get();
        if (!activeWorkspaceId)
            return;
        set({ membersLoading: true, membersError: null });
        try {
            await client.addWorkspaceMember(activeWorkspaceId, { email, role });
            set({ membersLoading: false });
            await get().refreshMembers();
        }
        catch (err) {
            set({
                membersError: err instanceof Error ? err.message : String(err),
                membersLoading: false,
            });
            throw err;
        }
    },
    updateRole: async (userId, role) => {
        const { activeWorkspaceId } = get();
        if (!activeWorkspaceId)
            return;
        set({ membersLoading: true, membersError: null });
        try {
            await client.updateWorkspaceMemberRole(activeWorkspaceId, userId, role);
            set({ membersLoading: false });
            await get().refreshMembers();
            await get().loadActiveWorkspaceDetail();
        }
        catch (err) {
            set({
                membersError: err instanceof Error ? err.message : String(err),
                membersLoading: false,
            });
            throw err;
        }
    },
    removeMember: async (userId) => {
        const { activeWorkspaceId } = get();
        if (!activeWorkspaceId)
            return;
        set({ membersLoading: true, membersError: null });
        try {
            await client.removeWorkspaceMember(activeWorkspaceId, userId);
            set({ membersLoading: false });
            await get().refreshMembers();
            await get().loadActiveWorkspaceDetail();
        }
        catch (err) {
            set({
                membersError: err instanceof Error ? err.message : String(err),
                membersLoading: false,
            });
            throw err;
        }
    },
}));
//# sourceMappingURL=workspace-store.js.map