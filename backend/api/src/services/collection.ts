import { prisma } from '@nuvro/database';
import type { Collection, Folder } from '@nuvro/database';
import { collectionRepository } from '../repositories/collection.js';
import { workspaceRepository } from '../repositories/workspace.js';
import { NotFoundError, ForbiddenError } from '../errors/app-error.js';

export class CollectionService {
  async getCollections(workspaceId: string, userId: string): Promise<unknown[]> {
    const membership = await workspaceRepository.findMembership(workspaceId, userId);
    if (!membership) {
      throw new ForbiddenError('You do not have access to this workspace');
    }

    // Fetch collections including folders and requests to prevent N+1 queries
    return await prisma.collection.findMany({
      where: { workspaceId },
      include: {
        folders: {
          orderBy: { sortOrder: 'asc' },
        },
        requests: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getCollectionById(id: string, userId: string): Promise<Collection> {
    const collection = await collectionRepository.findById(id);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }

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

  async updateCollection(
    id: string,
    data: { name?: string; description?: string | null },
    userId: string,
  ): Promise<Collection> {
    const collection = await collectionRepository.findById(id);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }

    const membership = await workspaceRepository.findMembership(collection.workspaceId, userId);
    if (!membership || membership.role === 'VIEWER') {
      throw new ForbiddenError('You do not have permission to update this collection');
    }

    return await collectionRepository.update(id, data);
  }

  async deleteCollection(id: string, userId: string): Promise<Collection> {
    const collection = await collectionRepository.findById(id);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }

    const membership = await workspaceRepository.findMembership(collection.workspaceId, userId);
    if (!membership || membership.role === 'VIEWER') {
      throw new ForbiddenError('You do not have permission to delete this collection');
    }

    return await collectionRepository.delete(id);
  }

  // --- Folder operations ---

  async getFolders(collectionId: string, userId: string): Promise<Folder[]> {
    const collection = await collectionRepository.findById(collectionId);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }

    const membership = await workspaceRepository.findMembership(collection.workspaceId, userId);
    if (!membership) {
      throw new ForbiddenError('You do not have access to this collection');
    }

    return await collectionRepository.findFoldersByCollection(collectionId);
  }

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

    // Verify parent folder exists and is in the same collection
    if (data.parentId) {
      const parentFolder = await collectionRepository.findFolderById(data.parentId);
      if (!parentFolder || parentFolder.collectionId !== data.collectionId) {
        throw new NotFoundError('Parent folder not found in this collection');
      }
    }

    return await collectionRepository.createFolder(data);
  }

  async updateFolder(
    id: string,
    data: { name?: string; description?: string | null; sortOrder?: number; parentId?: string | null },
    userId: string,
  ): Promise<Folder> {
    const folder = await collectionRepository.findFolderById(id);
    if (!folder) {
      throw new NotFoundError('Folder not found');
    }

    const collection = await collectionRepository.findById(folder.collectionId);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }

    const membership = await workspaceRepository.findMembership(collection.workspaceId, userId);
    if (!membership || membership.role === 'VIEWER') {
      throw new ForbiddenError('You do not have permission to update this folder');
    }

    if (data.parentId) {
      const parentFolder = await collectionRepository.findFolderById(data.parentId);
      if (!parentFolder || parentFolder.collectionId !== folder.collectionId) {
        throw new NotFoundError('Parent folder not found in this collection');
      }
    }

    return await collectionRepository.updateFolder(id, data);
  }

  async deleteFolder(id: string, userId: string): Promise<Folder> {
    const folder = await collectionRepository.findFolderById(id);
    if (!folder) {
      throw new NotFoundError('Folder not found');
    }

    const collection = await collectionRepository.findById(folder.collectionId);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }

    const membership = await workspaceRepository.findMembership(collection.workspaceId, userId);
    if (!membership || membership.role === 'VIEWER') {
      throw new ForbiddenError('You do not have permission to delete this folder');
    }

    return await collectionRepository.deleteFolder(id);
  }
}

export const collectionService = new CollectionService();
