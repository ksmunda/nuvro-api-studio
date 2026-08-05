import { prisma } from '@nuvro/database';
import type { ApiRequest, RequestHistory, HttpMethod, AuthType, BodyType, RequestStatus } from '@nuvro/database';
import { handleDatabaseError } from '../errors/db-error-handler.js';

export class RequestRepository {
  /**
   * Find a saved request by ID, optionally scoped to a collection for isolation.
   */
  async findById(id: string, collectionId?: string): Promise<ApiRequest | null> {
    try {
      return await prisma.apiRequest.findFirst({
        where: {
          id,
          ...(collectionId ? { collectionId } : {}),
        },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async findByCollection(collectionId: string): Promise<ApiRequest[]> {
    try {
      return await prisma.apiRequest.findMany({
        where: { collectionId },
        orderBy: { sortOrder: 'asc' },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async create(data: {
    name: string;
    description?: string;
    method: HttpMethod;
    url: string;
    collectionId: string;
    folderId?: string | null;
    headers?: string; // serialized JSON array
    queryParams?: string; // serialized JSON array
    authType?: AuthType;
    authConfig?: string; // serialized JSON object
    bodyType?: BodyType;
    bodyContent?: string;
    sortOrder?: number;
    preScript?: string;
    postScript?: string;
  }): Promise<ApiRequest> {
    try {
      return await prisma.apiRequest.create({
        data: {
          name: data.name,
          description: data.description,
          method: data.method,
          url: data.url,
          collectionId: data.collectionId,
          folderId: data.folderId,
          headers: data.headers ? JSON.parse(data.headers) : undefined,
          queryParams: data.queryParams ? JSON.parse(data.queryParams) : undefined,
          authType: data.authType,
          authConfig: data.authConfig ? JSON.parse(data.authConfig) : undefined,
          bodyType: data.bodyType,
          bodyContent: data.bodyContent,
          sortOrder: data.sortOrder,
          preScript: data.preScript,
          postScript: data.postScript,
        },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      method?: HttpMethod;
      url?: string;
      folderId?: string | null;
      headers?: string;
      queryParams?: string;
      authType?: AuthType;
      authConfig?: string;
      bodyType?: BodyType;
      bodyContent?: string | null;
      sortOrder?: number;
      preScript?: string | null;
      postScript?: string | null;
    },
    collectionId?: string,
  ): Promise<ApiRequest> {
    try {
      const request = await this.findById(id, collectionId);
      if (!request) {
        throw new Error('Record to update not found');
      }

      return await prisma.apiRequest.update({
        where: { id },
        data: {
          ...data,
          headers: data.headers ? JSON.parse(data.headers) : undefined,
          queryParams: data.queryParams ? JSON.parse(data.queryParams) : undefined,
          authConfig: data.authConfig ? JSON.parse(data.authConfig) : undefined,
        },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async delete(id: string, collectionId?: string): Promise<ApiRequest> {
    try {
      const request = await this.findById(id, collectionId);
      if (!request) {
        throw new Error('Record to delete not found');
      }

      return await prisma.apiRequest.delete({
        where: { id },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // --- Request History operations ---

  async findHistoryById(id: string): Promise<RequestHistory | null> {
    try {
      return await prisma.requestHistory.findUnique({
        where: { id },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async findHistoryByUser(userId: string): Promise<RequestHistory[]> {
    try {
      return await prisma.requestHistory.findMany({
        where: { userId },
        orderBy: { executedAt: 'desc' },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async createHistory(data: {
    requestId?: string | null;
    userId: string;
    method: HttpMethod;
    url: string;
    requestHeaders?: string;
    requestBody?: string | null;
    status: RequestStatus;
    statusCode?: number | null;
    responseHeaders?: string;
    responseBody?: string | null;
    responseSize?: number | null;
    durationMs?: number | null;
    errorMessage?: string | null;
  }): Promise<RequestHistory> {
    try {
      return await prisma.requestHistory.create({
        data: {
          requestId: data.requestId,
          userId: data.userId,
          method: data.method,
          url: data.url,
          requestHeaders: data.requestHeaders ? JSON.parse(data.requestHeaders) : undefined,
          requestBody: data.requestBody,
          status: data.status,
          statusCode: data.statusCode,
          responseHeaders: data.responseHeaders ? JSON.parse(data.responseHeaders) : undefined,
          responseBody: data.responseBody,
          responseSize: data.responseSize,
          durationMs: data.durationMs,
          errorMessage: data.errorMessage,
        },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async deleteHistoryItem(id: string): Promise<RequestHistory> {
    try {
      return await prisma.requestHistory.delete({
        where: { id },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async clearHistory(userId: string): Promise<{ count: number }> {
    try {
      return await prisma.requestHistory.deleteMany({
        where: { userId },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

export const requestRepository = new RequestRepository();
