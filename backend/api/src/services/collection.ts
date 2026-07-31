import type { Collection, Folder } from '@nuvro/database';
import { collectionRepository } from '../repositories/collection.js';
import { workspaceRepository } from '../repositories/workspace.js';
import { NotFoundError, ForbiddenError } from '../errors/app-error.js';

export class CollectionService {
  async getCollectionById(id: string, userId: string): Promise<Collection> {
    const collection = await collectionRepository.findById(id);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }

    // Workspace authorization check
    const membership = await workspaceRepository.findMembership(collection.workspaceId, userId);
    if (!membership) {
      throw new ForbiddenError('You do not have access to this collection');
    }

    return collection;
  }

  async createCollection(
    data: { name: string; description?: string; workspaceId: string },
    userId: string,
  ): Promise<Collection> {
    const membership = await workspaceRepository.findMembership(data.workspaceId, userId);
    if (!membership || membership.role === 'VIEWER') {
      throw new ForbiddenError('You do not have permission to create collections in this workspace');
    }

    return await collectionRepository.create(data);
  }

  // --- Folder operations ---

  async createFolder(
    data: { name: string; description?: string; collectionId: string; parentId?: string | null; sortOrder?: number },
    userId: string,
  ): Promise<Folder> {
    const collection = await collectionRepository.findById(data.collectionId);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }

    const membership = await workspaceRepository.findMembership(collection.workspaceId, userId);
    if (!membership || membership.role === 'VIEWER') {
      throw new ForbiddenError('You do not have permission to create folders in this collection');
    }

    return await collectionRepository.createFolder(data);
  }
}

export const collectionService = new CollectionService();
