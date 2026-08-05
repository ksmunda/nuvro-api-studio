import type { Workspace, WorkspaceMember, WorkspaceRole } from '@nuvro/database';
import { workspaceRepository } from '../repositories/workspace.js';
import { userRepository } from '../repositories/user.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../errors/app-error.js';

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

  async getWorkspaceDetail(id: string, userId: string) {
    const membership = await workspaceRepository.findMembership(id, userId);
    if (!membership) {
      throw new ForbiddenError('You do not have access to this workspace');
    }

    const workspace = await workspaceRepository.findById(id);
    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    const members = await this.getWorkspaceMembers(id, userId);

    return {
      ...workspace,
      members,
      currentUserRole: membership.role,
      memberCount: members.length,
    };
  }

  async getWorkspaceMembers(workspaceId: string, currentUserId: string): Promise<unknown[]> {
    const membership = await workspaceRepository.findMembership(workspaceId, currentUserId);
    if (!membership) {
      throw new ForbiddenError('You do not have access to this workspace');
    }

    const rawMembers = await workspaceRepository.findMembers(workspaceId);
    if (!rawMembers) {
      return [];
    }

    return (rawMembers as Array<{
      id: string;
      workspaceId: string;
      userId: string;
      role: WorkspaceRole;
      joinedAt: Date;
      user: {
        id: string;
        username: string;
        email: string;
        displayName: string | null;
        avatarUrl: string | null;
      };
    }>).map((m) => ({
      id: m.id,
      workspaceId: m.workspaceId,
      userId: m.userId,
      username: m.user.username,
      displayName: m.user.displayName,
      avatarUrl: m.user.avatarUrl,
      email: m.user.email,
      role: m.role,
      joinedAt: m.joinedAt,
    }));
  }

  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    return await workspaceRepository.findUserWorkspaces(userId);
  }

  async createWorkspace(data: { name: string; slug?: string; description?: string; ownerId: string }): Promise<Workspace> {
    const owner = await userRepository.findById(data.ownerId);
    if (!owner) {
      throw new NotFoundError('Owner user not found');
    }

    const slugify = (text: string): string => {
      return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    const baseSlug = data.slug || slugify(data.name) || 'workspace';
    let slug = baseSlug;
    let count = 1;
    while (true) {
      const existing = await workspaceRepository.findBySlug(slug);
      if (!existing) {
        break;
      }
      slug = `${baseSlug}-${count}`;
      count++;
    }

    return await workspaceRepository.create({
      name: data.name,
      slug,
      description: data.description,
      ownerId: data.ownerId,
    });
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

    const existingMember = await workspaceRepository.findMembership(workspaceId, targetUserId);
    if (existingMember) {
      throw new ConflictError('User is already a member of this workspace');
    }

    if (role === 'OWNER') {
      throw new ForbiddenError('Cannot add a member with OWNER role');
    }

    return await workspaceRepository.addMember(workspaceId, targetUserId, role);
  }

  async addWorkspaceMemberByEmail(
    workspaceId: string,
    currentUserId: string,
    email: string,
    role: WorkspaceRole,
  ): Promise<WorkspaceMember> {
    const currentMember = await workspaceRepository.findMembership(workspaceId, currentUserId);
    if (!currentMember || (currentMember.role !== 'OWNER' && currentMember.role !== 'ADMIN')) {
      throw new ForbiddenError('Only workspace owners or administrators can add members');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const targetUser = await userRepository.findByEmail(normalizedEmail);
    if (!targetUser) {
      throw new NotFoundError('User with this email not found');
    }

    const existingMember = await workspaceRepository.findMembership(workspaceId, targetUser.id);
    if (existingMember) {
      throw new ConflictError('User is already a member of this workspace');
    }

    if (role === 'OWNER') {
      throw new ForbiddenError('Cannot add a member with OWNER role');
    }

    return await workspaceRepository.addMember(workspaceId, targetUser.id, role);
  }

  async updateWorkspaceMemberRole(
    workspaceId: string,
    currentUserId: string,
    targetUserId: string,
    newRole: WorkspaceRole,
  ): Promise<WorkspaceMember> {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    const currentMember = await workspaceRepository.findMembership(workspaceId, currentUserId);
    if (!currentMember) {
      throw new ForbiddenError('You are not a member of this workspace');
    }

    const targetMember = await workspaceRepository.findMembership(workspaceId, targetUserId);
    if (!targetMember) {
      throw new NotFoundError('Target user is not a member of this workspace');
    }

    if (currentMember.role !== 'OWNER' && currentMember.role !== 'ADMIN') {
      throw new ForbiddenError('Only workspace owners or administrators can change roles');
    }

    if (targetUserId === workspace.ownerId || targetMember.role === 'OWNER') {
      throw new ForbiddenError('The workspace owner role cannot be changed');
    }

    if (newRole === 'OWNER') {
      throw new ForbiddenError('Cannot promote a member to OWNER');
    }

    if (currentUserId === targetUserId) {
      throw new ForbiddenError('You cannot change your own role');
    }

    return await workspaceRepository.updateMemberRole(workspaceId, targetUserId, newRole);
  }

  async removeWorkspaceMember(
    workspaceId: string,
    currentUserId: string,
    targetUserId: string,
  ): Promise<WorkspaceMember> {
    const workspace = await workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    const currentMember = await workspaceRepository.findMembership(workspaceId, currentUserId);
    if (!currentMember) {
      throw new ForbiddenError('You are not a member of this workspace');
    }

    const targetMember = await workspaceRepository.findMembership(workspaceId, targetUserId);
    if (!targetMember) {
      throw new NotFoundError('Target user is not a member of this workspace');
    }

    if (currentUserId === targetUserId) {
      if (targetUserId === workspace.ownerId || targetMember.role === 'OWNER') {
        throw new ForbiddenError('The workspace owner cannot leave the workspace');
      }
    } else {
      if (currentMember.role !== 'OWNER' && currentMember.role !== 'ADMIN') {
        throw new ForbiddenError('Only workspace owners or administrators can remove members');
      }

      if (targetUserId === workspace.ownerId || targetMember.role === 'OWNER') {
        throw new ForbiddenError('The workspace owner cannot be removed');
      }
    }

    return await workspaceRepository.removeMember(workspaceId, targetUserId);
  }
}

export const workspaceService = new WorkspaceService();
