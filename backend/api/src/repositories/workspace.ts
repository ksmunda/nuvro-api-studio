import { prisma } from '@nuvro/database';
import type { Workspace, WorkspaceMember, WorkspaceRole } from '@nuvro/database';
import { handleDatabaseError } from '../errors/db-error-handler.js';

export class WorkspaceRepository {
  async findById(id: string): Promise<Workspace | null> {
    try {
      return await prisma.workspace.findUnique({
        where: { id },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async findBySlug(slug: string): Promise<Workspace | null> {
    try {
      return await prisma.workspace.findUnique({
        where: { slug },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  /**
   * Retrieves all workspaces where a user has membership.
   */
  async findUserWorkspaces(userId: string): Promise<Workspace[]> {
    try {
      return await prisma.workspace.findMany({
        where: {
          members: {
            some: { userId },
          },
        },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    ownerId: string;
  }): Promise<Workspace> {
    try {
      return await prisma.workspace.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          ownerId: data.ownerId,
          members: {
            create: {
              userId: data.ownerId,
              role: 'OWNER',
            },
          },
        },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async update(id: string, data: { name?: string; description?: string | null }): Promise<Workspace> {
    try {
      return await prisma.workspace.update({
        where: { id },
        data,
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // --- Membership queries ---

  async findMembership(workspaceId: string, userId: string): Promise<WorkspaceMember | null> {
    try {
      return await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId, userId },
        },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async findMembers(workspaceId: string): Promise<unknown[]> {
    try {
      return await prisma.workspaceMember.findMany({
        where: { workspaceId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async addMember(workspaceId: string, userId: string, role: WorkspaceRole): Promise<WorkspaceMember> {
    try {
      return await prisma.workspaceMember.create({
        data: {
          workspaceId,
          userId,
          role,
        },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async updateMemberRole(workspaceId: string, userId: string, role: WorkspaceRole): Promise<WorkspaceMember> {
    try {
      return await prisma.workspaceMember.update({
        where: {
          workspaceId_userId: { workspaceId, userId },
        },
        data: { role },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async removeMember(workspaceId: string, userId: string): Promise<WorkspaceMember> {
    try {
      return await prisma.workspaceMember.delete({
        where: {
          workspaceId_userId: { workspaceId, userId },
        },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}

export const workspaceRepository = new WorkspaceRepository();
