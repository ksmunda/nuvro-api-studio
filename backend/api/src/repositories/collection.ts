import { prisma } from '@nuvro/database';
import type { Collection, Folder } from '@nuvro/database';
import { handleDatabaseError } from '../errors/db-error-handler.js';

export class CollectionRepository {
  /**
   * Find a collection by ID, optionally scoped to a workspaceId for isolation.
   */
  async findById(id: string, workspaceId?: string): Promise<Collection | null> {
    try {
      return await prisma.collection.findFirst({
        where: {
          id,
          ...(workspaceId ? { workspaceId } : {}),
        },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async findByWorkspace(workspaceId: string): Promise<Collection[]> {
    try {
      return await prisma.collection.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async create(data: { name: string; description?: string; workspaceId: string }): Promise<Collection> {
    try {
      return await prisma.collection.create({
        data,
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async update(
    id: string,
    data: { name?: string; description?: string | null },
    workspaceId?: string,
  ): Promise<Collection> {
    try {
      // Scoping update to workspace for isolation
      const collection = await this.findById(id, workspaceId);
      if (!collection) {
        throw new Error('Record to update not found');
      }

      return await prisma.collection.update({
        where: { id },
        data,
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async delete(id: string, workspaceId?: string): Promise<Collection> {
    try {
      const collection = await this.findById(id, workspaceId);
      if (!collection) {
        throw new Error('Record to delete not found');
      }

      return await prisma.collection.delete({
        where: { id },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // --- Folder operations ---

  async findFolderById(id: string): Promise<Folder | null> {
    try {
      return await prisma.folder.findUnique({
        where: { id },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async findFoldersByCollection(collectionId: string): Promise<Folder[]> {
    try {
      return await prisma.folder.findMany({
        where: { collectionId },
        orderBy: { sortOrder: 'asc' },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async createFolder(data: {
    name: string;
    description?: string;
    collectionId: string;
    parentId?: string | null;
    sortOrder?: number;
  }): Promise<Folder> {
    try {
      return await prisma.folder.create({
        data,
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async updateFolder(
    id: string,
    data: { name?: string; description?: string | null; sortOrder?: number; parentId?: string | null },
  ): Promise<Folder> {
    try {
      return await prisma.folder.update({
        where: { id },
        data,
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async deleteFolder(id: string): Promise<Folder> {
    try {
      return await prisma.folder.delete({
        where: { id },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

export const collectionRepository = new CollectionRepository();
