import type {
  Collection,
  CollectionDetail,
  FolderDto,
  ApiRequest,
  CreateCollectionInput,
  UpdateCollectionInput,
  UpdateFolderInput,
  UpdateApiRequestInput,
} from '@nuvro/types';

/** Minimal shape needed to create a folder */
export interface CreateFolderPayload {
  name: string;
  description?: string;
  parentId?: string;
}

/** Minimal shape needed to create a request */
export interface CreateRequestPayload {
  name: string;
  method?: string;
  url?: string;
  folderId?: string;
  headers?: Array<{ key: string; value: string; enabled: boolean }>;
  queryParams?: Array<{ key: string; value: string; enabled: boolean }>;
  authType?: string;
  authConfig?: Record<string, unknown>;
  bodyType?: string;
  bodyContent?: string;
}

export class CollectionsClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = '/api/v1') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API error ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch {
        // use fallback if not JSON
      }
      throw new Error(errorMessage);
    }

    const payload = await response.json();
    return payload.data as T;
  }

  // --- Collection Endpoints ---

  async getCollections(workspaceId: string): Promise<CollectionDetail[]> {
    return this.request<CollectionDetail[]>(`/collections?workspaceId=${workspaceId}`);
  }

  async createCollection(input: CreateCollectionInput): Promise<Collection> {
    return this.request<Collection>('/collections', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getCollection(id: string): Promise<Collection> {
    return this.request<Collection>(`/collections/${id}`);
  }

  async updateCollection(id: string, input: UpdateCollectionInput): Promise<Collection> {
    return this.request<Collection>(`/collections/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  async deleteCollection(id: string): Promise<Collection> {
    return this.request<Collection>(`/collections/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Folder Endpoints ---

  async createFolder(collectionId: string, input: CreateFolderPayload): Promise<FolderDto> {
    return this.request<FolderDto>(`/collections/${collectionId}/folders`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateFolder(id: string, input: UpdateFolderInput): Promise<FolderDto> {
    return this.request<FolderDto>(`/folders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  async deleteFolder(id: string): Promise<FolderDto> {
    return this.request<FolderDto>(`/folders/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Request Endpoints ---

  async getRequests(collectionId: string): Promise<ApiRequest[]> {
    return this.request<ApiRequest[]>(`/collections/${collectionId}/requests`);
  }

  async getRequest(id: string): Promise<ApiRequest> {
    return this.request<ApiRequest>(`/requests/${id}`);
  }

  async createRequest(collectionId: string, input: CreateRequestPayload): Promise<ApiRequest> {
    return this.request<ApiRequest>(`/collections/${collectionId}/requests`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateRequest(id: string, input: Partial<UpdateApiRequestInput> | Record<string, unknown>): Promise<ApiRequest> {
    return this.request<ApiRequest>(`/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  async deleteRequest(id: string): Promise<ApiRequest> {
    return this.request<ApiRequest>(`/requests/${id}`, {
      method: 'DELETE',
    });
  }
}
