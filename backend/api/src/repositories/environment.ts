import { prisma } from '@nuvro/database';
import type { Environment, Variable } from '@nuvro/database';
import { handleDatabaseError } from '../errors/db-error-handler.js';

export class EnvironmentRepository {
  /**
   * Find an environment by ID, optionally scoped to a workspace for isolation.
   */
  async findById(id: string, workspaceId?: string): Promise<Environment | null> {
    try {
      return await prisma.environment.findFirst({
        where: {
          id,
          ...(workspaceId ? { workspaceId } : {}),
        },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async findByWorkspace(workspaceId: string): Promise<Environment[]> {
    try {
      return await prisma.environment.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async create(data: { name: string; workspaceId: string; isDefault?: boolean }): Promise<Environment> {
    try {
      return await prisma.environment.create({
        data,
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async update(id: string, data: { name?: string; isDefault?: boolean }, workspaceId?: string): Promise<Environment> {
    try {
      const environment = await this.findById(id, workspaceId);
      if (!environment) {
        throw new Error('Record to update not found');
      }

      return await prisma.environment.update({
        where: { id },
        data,
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async delete(id: string, workspaceId?: string): Promise<Environment> {
    try {
      const environment = await this.findById(id, workspaceId);
      if (!environment) {
        throw new Error('Record to delete not found');
      }

      return await prisma.environment.delete({
        where: { id },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // --- Variable operations ---

  async findVariablesByEnvironment(environmentId: string): Promise<Variable[]> {
    try {
      return await prisma.variable.findMany({
        where: { environmentId },
        orderBy: { key: 'asc' },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async createVariable(data: {
    key: string;
    value: string;
    description?: string;
    isSecret?: boolean;
    enabled?: boolean;
    environmentId: string;
  }): Promise<Variable> {
    try {
      return await prisma.variable.create({
        data,
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async updateVariable(
    id: string,
    data: { key?: string; value?: string; description?: string | null; isSecret?: boolean; enabled?: boolean },
  ): Promise<Variable> {
    try {
      return await prisma.variable.update({
        where: { id },
        data,
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async deleteVariable(id: string): Promise<Variable> {
    try {
      return await prisma.variable.delete({
        where: { id },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

export const environmentRepository = new EnvironmentRepository();
