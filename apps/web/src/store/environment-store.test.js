import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEnvironmentStore } from './environment-store.js';
// Setup browser globals mock
const mockStorage = {};
const mockLocalStorage = {
    getItem: vi.fn((key) => mockStorage[key] || null),
    setItem: vi.fn((key, value) => {
        mockStorage[key] = value;
    }),
    removeItem: vi.fn((key) => {
        delete mockStorage[key];
    }),
    clear: vi.fn(() => {
        Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    }),
};
global.window = {
    localStorage: mockLocalStorage,
};
// Mock EnvironmentsClient
vi.mock('@nuvro/api-client', () => {
    const getEnvironmentsMock = vi.fn();
    const createEnvironmentMock = vi.fn();
    const getEnvironmentMock = vi.fn();
    const updateEnvironmentMock = vi.fn();
    const deleteEnvironmentMock = vi.fn();
    const createVariableMock = vi.fn();
    const updateVariableMock = vi.fn();
    const deleteVariableMock = vi.fn();
    const EnvironmentsClientClass = vi.fn().mockImplementation(() => ({
        getEnvironments: getEnvironmentsMock,
        createEnvironment: createEnvironmentMock,
        getEnvironment: getEnvironmentMock,
        updateEnvironment: updateEnvironmentMock,
        deleteEnvironment: deleteEnvironmentMock,
        createVariable: createVariableMock,
        updateVariable: updateVariableMock,
        deleteVariable: deleteVariableMock,
    }));
    return {
        EnvironmentsClient: EnvironmentsClientClass,
    };
});
import { EnvironmentsClient } from '@nuvro/api-client';
describe('useEnvironmentStore Unit Tests', () => {
    const mockWorkspaceId = 'ws_123';
    const mockEnvId = 'env_123';
    const clientInstance = new EnvironmentsClient();
    beforeEach(() => {
        // Reset Zustand store state
        useEnvironmentStore.setState({
            environments: [],
            activeEnvironmentId: null,
            activeEnvironmentDetail: null,
            isLoading: false,
            isSaving: false,
            error: null,
        });
        mockLocalStorage.clear();
        vi.clearAllMocks();
    });
    it('initializes with default empty values', () => {
        const state = useEnvironmentStore.getState();
        expect(state.environments).toEqual([]);
        expect(state.activeEnvironmentId).toBeNull();
        expect(state.activeEnvironmentDetail).toBeNull();
    });
    it('loads environments and selects persisted active environment ID from localStorage', async () => {
        mockLocalStorage.setItem(`nuvro_active_env_${mockWorkspaceId}`, mockEnvId);
        vi.mocked(clientInstance.getEnvironments).mockResolvedValue([
            { id: mockEnvId, name: 'Local', workspaceId: mockWorkspaceId, isDefault: true, createdAt: '', updatedAt: '', variableCount: 0 },
        ]);
        vi.mocked(clientInstance.getEnvironment).mockResolvedValue({
            id: mockEnvId,
            name: 'Local',
            workspaceId: mockWorkspaceId,
            isDefault: true,
            createdAt: '',
            updatedAt: '',
            variables: [],
        });
        const store = useEnvironmentStore.getState();
        await store.loadEnvironments(mockWorkspaceId);
        const updatedState = useEnvironmentStore.getState();
        expect(updatedState.environments[0]?.name).toBe('Local');
        expect(updatedState.activeEnvironmentId).toBe(mockEnvId);
        expect(updatedState.activeEnvironmentDetail?.id).toBe(mockEnvId);
    });
    it('selects active environment and persists ID in localStorage', async () => {
        vi.mocked(clientInstance.getEnvironment).mockResolvedValue({
            id: mockEnvId,
            name: 'Local',
            workspaceId: mockWorkspaceId,
            isDefault: true,
            createdAt: '',
            updatedAt: '',
            variables: [{ id: 'v1', key: 'API_KEY', value: '[SECRET_MASKED]', isSecret: true, enabled: true, environmentId: mockEnvId, createdAt: '', updatedAt: '', description: null }],
        });
        const store = useEnvironmentStore.getState();
        await store.selectEnvironment(mockEnvId, mockWorkspaceId);
        expect(useEnvironmentStore.getState().activeEnvironmentId).toBe(mockEnvId);
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(`nuvro_active_env_${mockWorkspaceId}`, mockEnvId);
        expect(useEnvironmentStore.getState().activeEnvironmentDetail?.variables[0]?.value).toBe('[SECRET_MASKED]');
    });
});
//# sourceMappingURL=environment-store.test.js.map