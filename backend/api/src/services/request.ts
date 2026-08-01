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

  async getRequestsByCollection(collectionId: string, userId: string): Promise<ApiRequest[]> {
    const collection = await collectionRepository.findById(collectionId);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }

    const membership = await workspaceRepository.findMembership(collection.workspaceId, userId);
    if (!membership) {
      throw new ForbiddenError('You do not have access to this collection');
    }

    return await requestRepository.findByCollection(collectionId);
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

    // Verify folder is within the same collection if folderId is provided
    if (data.folderId) {
      const folder = await collectionRepository.findFolderById(data.folderId);
      if (!folder || folder.collectionId !== data.collectionId) {
        throw new NotFoundError('Folder not found in this collection');
      }
    }

    return await requestRepository.create(data);
  }

  async updateRequest(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      method?: HttpMethod;
      url?: string;
      collectionId?: string;
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
    userId: string,
  ): Promise<ApiRequest> {
    const request = await requestRepository.findById(id);
    if (!request) {
      throw new NotFoundError('Request not found');
    }

    // If changing collection, check permission on original and target collection
    const currentCollection = await collectionRepository.findById(request.collectionId);
    if (!currentCollection) {
      throw new NotFoundError('Current collection not found');
    }

    const currentMembership = await workspaceRepository.findMembership(currentCollection.workspaceId, userId);
    if (!currentMembership || currentMembership.role === 'VIEWER') {
      throw new ForbiddenError('You do not have permission to update requests in this collection');
    }

    if (data.collectionId && data.collectionId !== request.collectionId) {
      const targetCollection = await collectionRepository.findById(data.collectionId);
      if (!targetCollection) {
        throw new NotFoundError('Target collection not found');
      }

      // Do NOT allow moving requests across workspaces
      if (targetCollection.workspaceId !== currentCollection.workspaceId) {
        throw new ForbiddenError('Cannot move requests across different workspaces');
      }

      const targetMembership = await workspaceRepository.findMembership(targetCollection.workspaceId, userId);
      if (!targetMembership || targetMembership.role === 'VIEWER') {
        throw new ForbiddenError('You do not have permission to add requests to the target collection');
      }
    }

    // Verify folder belongs to the collection
    const checkCollectionId = data.collectionId || request.collectionId;
    if (data.folderId) {
      const folder = await collectionRepository.findFolderById(data.folderId);
      if (!folder || folder.collectionId !== checkCollectionId) {
        throw new NotFoundError('Folder not found in this collection');
      }
    }

    return await requestRepository.update(id, data);
  }

  async deleteRequest(id: string, userId: string): Promise<ApiRequest> {
    const request = await requestRepository.findById(id);
    if (!request) {
      throw new NotFoundError('Request not found');
    }

    const collection = await collectionRepository.findById(request.collectionId);
    if (!collection) {
      throw new NotFoundError('Parent collection not found');
    }

    const membership = await workspaceRepository.findMembership(collection.workspaceId, userId);
    if (!membership || membership.role === 'VIEWER') {
      throw new ForbiddenError('You do not have permission to delete requests from this collection');
    }

    return await requestRepository.delete(id);
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
    return await requestRepository.createHistory(data);
  }
}

export const requestService = new RequestService();
