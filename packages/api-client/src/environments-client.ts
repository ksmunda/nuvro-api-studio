import type {
  Environment,
  EnvironmentDetail,
  Variable,
  CreateEnvironmentInput,
  UpdateEnvironmentInput,
  UpdateVariableInput,
} from '@nuvro/types';

export interface CreateVariablePayload {
  key: string;
  value: string;
  description?: string;
  isSecret?: boolean;
  enabled?: boolean;
}

export class EnvironmentsClient {
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

  // --- Environment Endpoints ---

  async getEnvironments(workspaceId: string): Promise<Environment[]> {
    return this.request<Environment[]>(`/environments?workspaceId=${workspaceId}`);
  }

  async createEnvironment(input: CreateEnvironmentInput): Promise<Environment> {
    return this.request<Environment>('/environments', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getEnvironment(id: string): Promise<EnvironmentDetail> {
    return this.request<EnvironmentDetail>(`/environments/${id}`);
  }

  async updateEnvironment(id: string, input: UpdateEnvironmentInput): Promise<Environment> {
    return this.request<Environment>(`/environments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  async deleteEnvironment(id: string): Promise<Environment> {
    return this.request<Environment>(`/environments/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Variable Endpoints ---

  async getVariables(environmentId: string): Promise<Variable[]> {
    return this.request<Variable[]>(`/environments/${environmentId}/variables`);
  }

  async createVariable(environmentId: string, input: CreateVariablePayload): Promise<Variable> {
    return this.request<Variable>(`/environments/${environmentId}/variables`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async updateVariable(id: string, input: UpdateVariableInput): Promise<Variable> {
    return this.request<Variable>(`/environments/variables/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  async deleteVariable(id: string): Promise<Variable> {
    return this.request<Variable>(`/environments/variables/${id}`, {
      method: 'DELETE',
    });
  }
}
