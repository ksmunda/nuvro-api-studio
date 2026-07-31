import type { ApiRequest, RequestHistory, HttpMethod, AuthType, BodyType, RequestStatus } from '@nuvro/database';
import { requestRepository } from '../repositories/request.js';
import { collectionRepository } from '../repositories/collection.js';
import { workspaceRepository } from '../repositories/workspace.js';
import { NotFoundError, ForbiddenError } from '../errors/app-error.js';

export class RequestService {
  async getRequestById(id: string, userId: string): Promise<ApiRequest> {
    const request = await requestRepository.findById(id);
    if (!request) {
      throw new NotFoundError('Request not found');
    }

    const collection = await collectionRepository.findById(request.collectionId);
    if (!collection) {
      throw new NotFoundError('Parent collection not found');
    }

    const membership = await workspaceRepository.findMembership(collection.workspaceId, userId);
    if (!membership) {
      throw new ForbiddenError('You do not have access to this request');
    }

    return request;
  }

  async createRequest(
    data: {
      name: string;
      description?: string;
      method: HttpMethod;
      url: string;
      collectionId: string;
      folderId?: string | null;
      headers?: string;
      queryParams?: string;
      authType?: AuthType;
      authConfig?: string;
      bodyType?: BodyType;
      bodyContent?: string;
      sortOrder?: number;
      preScript?: string;
      postScript?: string;
    },
    userId: string,
  ): Promise<ApiRequest> {
    const collection = await collectionRepository.findById(data.collectionId);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }

    const membership = await workspaceRepository.findMembership(collection.workspaceId, userId);
    if (!membership || membership.role === 'VIEWER') {
      throw new ForbiddenError('You do not have permission to save requests to this collection');
    }

    return await requestRepository.create(data);
  }

  async logHistory(
    data: {
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
    },
  ): Promise<RequestHistory> {
    // Audit logs focus strictly on logging execution metadata safely
    return await requestRepository.createHistory(data);
  }
}

export const requestService = new RequestService();
