import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useCollectionStore } from './collection-store.js';
import { useRequestStore } from './request-store.js';

// Mock CollectionsClient to isolate store unit test behavior
vi.mock('@nuvro/api-client', () => {
  const getCollectionsMock = vi.fn();
  const createCollectionMock = vi.fn();
  const updateCollectionMock = vi.fn();
  const deleteCollectionMock = vi.fn();
  const createFolderMock = vi.fn();
  const updateFolderMock = vi.fn();
  const deleteFolderMock = vi.fn();
  const createRequestMock = vi.fn();
  const updateRequestMock = vi.fn();
  const deleteRequestMock = vi.fn();

  const CollectionsClientClass = vi.fn().mockImplementation(() => ({
    getCollections: getCollectionsMock,
    createCollection: createCollectionMock,
    updateCollection: updateCollectionMock,
    deleteCollection: deleteCollectionMock,
    createFolder: createFolderMock,
    updateFolder: updateFolderMock,
    deleteFolder: deleteFolderMock,
    createRequest: createRequestMock,
    updateRequest: updateRequestMock,
    deleteRequest: deleteRequestMock,
  }));

  const ApiClientClass = vi.fn();
  const FetchTransportClass = vi.fn();
  const EnvironmentsClientClass = vi.fn().mockImplementation(() => ({
    getEnvironments: vi.fn().mockResolvedValue([]),
    getEnvironmentDetail: vi.fn().mockResolvedValue({ id: 'env_123', variables: [] }),
  }));

  return {
    CollectionsClient: CollectionsClientClass,
    ApiClient: ApiClientClass,
    FetchTransport: FetchTransportClass,
    EnvironmentsClient: EnvironmentsClientClass,
  };
});

describe('useCollectionStore & Dirty State Tracking', () => {
  const mockRequest = {
    id: 'req_123',
    name: 'GET Users',
    description: null,
    method: 'GET' as const,
    url: 'https://api.example.com/users',
    collectionId: 'col_123',
    folderId: null,
    headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
    queryParams: [],
    authType: 'NONE' as const,
    authConfig: {},
    bodyType: 'NONE' as const,
    bodyContent: null,
    sortOrder: 0,
    preScript: null,
    postScript: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    // Reset collection store
    const colStore = useCollectionStore.getState();
    colStore.setActiveRequest(null);
    colStore.resetDirtyState();

    // Reset request store
    const reqStore = useRequestStore.getState();
    reqStore.setMethod('GET');
    reqStore.setUrl('');
    reqStore.setHeaders([{ key: '', value: '', enabled: true }]);
    reqStore.setQueryParams([{ key: '', value: '', enabled: true }]);
    reqStore.setAuthType('NONE');
    reqStore.setAuthConfig({});
    reqStore.setBodyType('NONE');
    reqStore.setBodyContent('');
    reqStore.resetResponse();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty collections and null active request', () => {
    const state = useCollectionStore.getState();
    expect(state.collections).toEqual([]);
    expect(state.activeRequest).toBeNull();
    expect(state.isDirty()).toBe(false);
  });

  it('should populate request builder state and snapshot when setActiveRequest is called', () => {
    useCollectionStore.getState().setActiveRequest(mockRequest);

    const colState = useCollectionStore.getState();
    const reqState = useRequestStore.getState();

    expect(colState.activeRequest).toEqual(mockRequest);
    expect(colState.isDirty()).toBe(false);

    expect(reqState.method).toBe('GET');
    expect(reqState.url).toBe('https://api.example.com/users');
    expect(reqState.headers).toEqual([{ key: 'Accept', value: 'application/json', enabled: true }]);
  });

  it('should detect dirty state when URL is modified', () => {
    useCollectionStore.getState().setActiveRequest(mockRequest);
    expect(useCollectionStore.getState().isDirty()).toBe(false);

    // Modify url in request-store
    useRequestStore.getState().setUrl('https://api.example.com/users/1');

    expect(useCollectionStore.getState().isDirty()).toBe(true);
  });

  it('should detect dirty state when headers are modified', () => {
    useCollectionStore.getState().setActiveRequest(mockRequest);
    expect(useCollectionStore.getState().isDirty()).toBe(false);

    // Modify headers in request-store
    useRequestStore.getState().setHeaders([
      { key: 'Accept', value: 'application/json', enabled: true },
      { key: 'Content-Type', value: 'application/json', enabled: true }
    ]);

    expect(useCollectionStore.getState().isDirty()).toBe(true);
  });
});
