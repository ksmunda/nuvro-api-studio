import { z } from 'zod';
import { cuidSchema, slugSchema } from './common.js';

export const workspaceRoleSchema = z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, 'Workspace name is required')
    .max(64, 'Workspace name must be at most 64 characters')
    .trim(),
  slug: slugSchema.optional(),
  description: z.string().max(256, 'Description must be at most 256 characters').optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(64).trim().optional(),
  description: z.string().max(256).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: workspaceRoleSchema.exclude(['OWNER']).default('MEMBER'),
});

export const updateMemberRoleSchema = z.object({
  role: workspaceRoleSchema.exclude(['OWNER']),
});

export const workspaceMemberSchema = z.object({
  id: cuidSchema,
  userId: cuidSchema,
  username: z.string(),
  displayName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  email: z.string().email(),
  role: workspaceRoleSchema,
  joinedAt: z.string().datetime(),
});

export const workspaceSchema = z.object({
  id: cuidSchema,
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  ownerId: cuidSchema,
  memberCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const workspaceDetailSchema = workspaceSchema.extend({
  members: z.array(workspaceMemberSchema),
  currentUserRole: workspaceRoleSchema,
});

export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>;
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type WorkspaceMember = z.infer<typeof workspaceMemberSchema>;
export type Workspace = z.infer<typeof workspaceSchema>;
export type WorkspaceDetail = z.infer<typeof workspaceDetailSchema>;
