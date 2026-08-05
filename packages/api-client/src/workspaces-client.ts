import type {
  Workspace,
  CreateWorkspaceInput,
  WorkspaceDetail,
  WorkspaceMember,
  InviteMemberInput,
} from '@nuvro/types';

export class WorkspacesClient {
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
        // ignore
      }
      throw new Error(errorMessage);
    }

    const payload = await response.json();
    return payload.data as T;
  }

  async getWorkspaces(): Promise<Workspace[]> {
    return this.request<Workspace[]>('/workspaces');
  }

  async getWorkspace(id: string): Promise<WorkspaceDetail> {
    return this.request<WorkspaceDetail>(`/workspaces/${id}`);
  }

  async createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
    return this.request<Workspace>('/workspaces', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return this.request<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);
  }

  async addWorkspaceMember(workspaceId: string, input: InviteMemberInput): Promise<WorkspaceMember> {
    return this.request<WorkspaceMember>(`/workspaces/${workspaceId}/members`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateWorkspaceMemberRole(workspaceId: string, userId: string, role: string): Promise<WorkspaceMember> {
    return this.request<WorkspaceMember>(`/workspaces/${workspaceId}/members/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async removeWorkspaceMember(workspaceId: string, userId: string): Promise<WorkspaceMember> {
    return this.request<WorkspaceMember>(`/workspaces/${workspaceId}/members/${userId}`, {
      method: 'DELETE',
    });
  }
}
