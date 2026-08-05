import { create } from 'zustand';
import { EnvironmentsClient } from '@nuvro/api-client';
import type { Environment, EnvironmentDetail, Variable } from '@nuvro/types';
import { API_BASE } from '../config/api.js';

const client = new EnvironmentsClient(`${API_BASE}/api/v1`);

interface EnvironmentState {
  environments: Environment[];
  activeEnvironmentId: string | null;
  activeEnvironmentDetail: EnvironmentDetail | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  loadEnvironments: (workspaceId: string) => Promise<void>;
  selectEnvironment: (id: string | null, workspaceId: string) => Promise<void>;
  createEnvironment: (workspaceId: string, name: string) => Promise<Environment>;
  updateEnvironment: (id: string, name: string) => Promise<void>;
  deleteEnvironment: (id: string, workspaceId: string) => Promise<void>;
  duplicateEnvironment: (id: string, newName: string) => Promise<Environment>;

  // Variables Actions
  addVariable: (environmentId: string, variable: { key: string; value: string; isSecret?: boolean; enabled?: boolean; description?: string }) => Promise<void>;
  updateVariable: (environmentId: string, variableId: string, updates: Partial<Variable>) => Promise<void>;
  deleteVariable: (environmentId: string, variableId: string) => Promise<void>;
}

export const useEnvironmentStore = create<EnvironmentState>((set, get) => ({
  environments: [],
  activeEnvironmentId: null,
  activeEnvironmentDetail: null,
  isLoading: false,
  isSaving: false,
  error: null,

  loadEnvironments: async (workspaceId) => {
    set({ isLoading: true, error: null });
    try {
      const list = await client.getEnvironments(workspaceId);
      set({ environments: list, isLoading: false });

      // Try load from localStorage
      const savedId = typeof window !== 'undefined' ? window.localStorage.getItem(`nuvro_active_env_${workspaceId}`) : null;
      if (savedId && list.some((e) => e.id === savedId)) {
        await get().selectEnvironment(savedId, workspaceId);
      } else {
        set({ activeEnvironmentId: null, activeEnvironmentDetail: null });
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), isLoading: false });
    }
  },

  selectEnvironment: async (id, workspaceId) => {
    if (!id) {
      set({ activeEnvironmentId: null, activeEnvironmentDetail: null });
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(`nuvro_active_env_${workspaceId}`);
      }
      return;
    }

    set({ activeEnvironmentId: id, isLoading: true, error: null });
    try {
      const detail = await client.getEnvironment(id);
      set({ activeEnvironmentDetail: detail, isLoading: false });
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`nuvro_active_env_${workspaceId}`, id);
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), isLoading: false });
    }
  },

  createEnvironment: async (workspaceId, name) => {
    set({ isSaving: true, error: null });
    try {
      const env = await client.createEnvironment({ name, workspaceId, isDefault: false });
      const list = await client.getEnvironments(workspaceId);
      set({ environments: list, isSaving: false });
      return env;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), isSaving: false });
      throw err;
    }
  },

  updateEnvironment: async (id, name) => {
    set({ isSaving: true, error: null });
    try {
      await client.updateEnvironment(id, { name });
      const active = get().activeEnvironmentDetail;
      if (active?.id === id) {
        set({ activeEnvironmentDetail: { ...active, name } });
      }
      // Refresh list
      const firstEnv = get().environments[0];
      if (firstEnv) {
        const list = await client.getEnvironments(firstEnv.workspaceId);
        set({ environments: list });
      }
      set({ isSaving: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), isSaving: false });
      throw err;
    }
  },

  deleteEnvironment: async (id, workspaceId) => {
    set({ isSaving: true, error: null });
    try {
      await client.deleteEnvironment(id);
      if (get().activeEnvironmentId === id) {
        set({ activeEnvironmentId: null, activeEnvironmentDetail: null });
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(`nuvro_active_env_${workspaceId}`);
        }
      }
      const list = await client.getEnvironments(workspaceId);
      set({ environments: list, isSaving: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), isSaving: false });
      throw err;
    }
  },

  duplicateEnvironment: async (id, newName) => {
    set({ isSaving: true, error: null });
    try {
      const sourceDetail = await client.getEnvironment(id);
      const firstEnv = get().environments[0];
      if (!firstEnv) throw new Error('No active workspace environment found');
      
      const newEnv = await client.createEnvironment({ name: newName, workspaceId: firstEnv.workspaceId, isDefault: false });
      
      // Duplicate all variables (note: secrets will need to be re-entered since value is masked)
      for (const variable of sourceDetail.variables) {
        const valueToSave = variable.isSecret ? '' : variable.value;
        await client.createVariable(newEnv.id, {
          key: variable.key,
          value: valueToSave,
          isSecret: variable.isSecret,
          enabled: variable.enabled,
          description: variable.description ?? undefined,
        });
      }

      const list = await client.getEnvironments(firstEnv.workspaceId);
      set({ environments: list, isSaving: false });
      return newEnv;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), isSaving: false });
      throw err;
    }
  },

  addVariable: async (environmentId, variable) => {
    set({ isSaving: true, error: null });
    try {
      await client.createVariable(environmentId, variable);
      // Reload environment detail if active
      if (get().activeEnvironmentId === environmentId) {
        const detail = await client.getEnvironment(environmentId);
        set({ activeEnvironmentDetail: detail });
      }
      set({ isSaving: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), isSaving: false });
      throw err;
    }
  },

  updateVariable: async (environmentId, variableId, updates) => {
    set({ isSaving: true, error: null });
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await client.updateVariable(variableId, updates as any);
      // Reload environment detail if active
      if (get().activeEnvironmentId === environmentId) {
        const detail = await client.getEnvironment(environmentId);
        set({ activeEnvironmentDetail: detail });
      }
      set({ isSaving: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), isSaving: false });
      throw err;
    }
  },

  deleteVariable: async (environmentId, variableId) => {
    set({ isSaving: true, error: null });
    try {
      await client.deleteVariable(variableId);
      // Reload environment detail if active
      if (get().activeEnvironmentId === environmentId) {
        const detail = await client.getEnvironment(environmentId);
        set({ activeEnvironmentDetail: detail });
      }
      set({ isSaving: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err), isSaving: false });
      throw err;
    }
  },
}));
