import type { RequestHistoryItem } from '@nuvro/types';

export class HistoryClient {
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

  async getHistory(): Promise<RequestHistoryItem[]> {
    return this.request<RequestHistoryItem[]>('/history');
  }

  async deleteHistoryItem(id: string): Promise<RequestHistoryItem> {
    return this.request<RequestHistoryItem>(`/history/${id}`, {
      method: 'DELETE',
    });
  }

  async clearHistory(): Promise<{ count: number }> {
    return this.request<{ count: number }>('/history', {
      method: 'DELETE',
    });
  }
}
