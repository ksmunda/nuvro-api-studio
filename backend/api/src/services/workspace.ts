import type { Workspace, WorkspaceMember, WorkspaceRole } from '@nuvro/database';
import { workspaceRepository } from '../repositories/workspace.js';
import { userRepository } from '../repositories/user.js';
import { NotFoundError, ForbiddenError } from '../errors/app-error.js';

export class WorkspaceService {
  async getWorkspaceById(id: string, userId: string): Promise<Workspace> {
    // Enforce workspace isolation at the service layer
    const membership = await workspaceRepository.findMembership(id, userId);
    if (!membership) {
      throw new ForbiddenError('You do not have access to this workspace');
    }

    const workspace = await workspaceRepository.findById(id);
    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }
    return workspace;
  }

  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    return await workspaceRepository.findUserWorkspaces(userId);
  }

  async createWorkspace(data: { name: string; slug: string; description?: string; ownerId: string }): Promise<Workspace> {
    const owner = await userRepository.findById(data.ownerId);
    if (!owner) {
      throw new NotFoundError('Owner user not found');
    }
    return await workspaceRepository.create(data);
  }

  async addWorkspaceMember(
    workspaceId: string,
    currentUserId: string,
    targetUserId: string,
    role: WorkspaceRole,
  ): Promise<WorkspaceMember> {
    // Verify current user has admin rights
    const currentMember = await workspaceRepository.findMembership(workspaceId, currentUserId);
    if (!currentMember || (currentMember.role !== 'OWNER' && currentMember.role !== 'ADMIN')) {
      throw new ForbiddenError('Only workspace owners or administrators can add members');
    }

    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundError('Target user to invite not found');
    }

    return await workspaceRepository.addMember(workspaceId, targetUserId, role);
  }
}

export const workspaceService = new WorkspaceService();
