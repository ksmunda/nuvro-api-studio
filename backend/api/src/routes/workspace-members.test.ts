/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock the database client singleton
vi.mock('@nuvro/database', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    workspace: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    workspaceMember: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  };
  return { prisma: mockPrisma };
});

import { app } from '../app.js';
import { prisma } from '@nuvro/database';

describe('Workspace Members API Endpoint Integrations', () => {
  const mockUserIdOwner = 'cowner123450000t31027dxwz5b';
  const mockUserIdAdmin = 'cadmin123450000t31027dxwz5b';
  const mockUserIdMember = 'cmember123450000t31027dxwz5b';
  const mockUserIdViewer = 'cviewer123450000t31027dxwz5b';
  const mockUserIdExternal = 'cextern123450000t31027dxwz5b';
  const mockUserIdNew = 'cnewusr123450000t31027dxwz5b';

  const mockWorkspaceId = 'clhq123450000t31027dxwz5b';

  const mockSessionOwner = {
    id: 'session-owner',
    token: 'token-owner',
    userId: mockUserIdOwner,
    expiresAt: new Date(Date.now() + 100000),
    user: { id: mockUserIdOwner, email: 'owner@nuvro.dev', username: 'owner' },
  };

  const mockSessionAdmin = {
    id: 'session-admin',
    token: 'token-admin',
    userId: mockUserIdAdmin,
    expiresAt: new Date(Date.now() + 100000),
    user: { id: mockUserIdAdmin, email: 'admin@nuvro.dev', username: 'admin' },
  };

  const mockSessionMember = {
    id: 'session-member',
    token: 'token-member',
    userId: mockUserIdMember,
    expiresAt: new Date(Date.now() + 100000),
    user: { id: mockUserIdMember, email: 'member@nuvro.dev', username: 'member' },
  };

  const mockSessionViewer = {
    id: 'session-viewer',
    token: 'token-viewer',
    userId: mockUserIdViewer,
    expiresAt: new Date(Date.now() + 100000),
    user: { id: mockUserIdViewer, email: 'viewer@nuvro.dev', username: 'viewer' },
  };

  const mockSessionExternal = {
    id: 'session-external',
    token: 'token-external',
    userId: mockUserIdExternal,
    expiresAt: new Date(Date.now() + 100000),
    user: { id: mockUserIdExternal, email: 'external@nuvro.dev', username: 'external' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/workspaces/:id/members', () => {
    it('OWNER can view members', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSessionOwner as any);
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({
        workspaceId: mockWorkspaceId,
        userId: mockUserIdOwner,
        role: 'OWNER',
      } as any);
      vi.mocked(prisma.workspaceMember.findMany).mockResolvedValue([
        {
          id: 'member-row-1',
          workspaceId: mockWorkspaceId,
          userId: mockUserIdOwner,
          role: 'OWNER',
          joinedAt: new Date(),
          user: { id: mockUserIdOwner, username: 'owner', email: 'owner@nuvro.dev', displayName: 'Owner User', avatarUrl: null },
        },
      ] as any);

      const res = await request(app)
        .get(`/api/v1/workspaces/${mockWorkspaceId}/members`)
        .set('Cookie', ['sid=token-owner'])
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].role).toBe('OWNER');
    });

    it('ADMIN can view members', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSessionAdmin as any);
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({
        workspaceId: mockWorkspaceId,
        userId: mockUserIdAdmin,
        role: 'ADMIN',
      } as any);
      vi.mocked(prisma.workspaceMember.findMany).mockResolvedValue([] as any);

      const res = await request(app)
        .get(`/api/v1/workspaces/${mockWorkspaceId}/members`)
        .set('Cookie', ['sid=token-admin'])
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('MEMBER can view members', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSessionMember as any);
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({
        workspaceId: mockWorkspaceId,
        userId: mockUserIdMember,
        role: 'MEMBER',
      } as any);
      vi.mocked(prisma.workspaceMember.findMany).mockResolvedValue([] as any);

      const res = await request(app)
        .get(`/api/v1/workspaces/${mockWorkspaceId}/members`)
        .set('Cookie', ['sid=token-member'])
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('VIEWER can view members', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSessionViewer as any);
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({
        workspaceId: mockWorkspaceId,
        userId: mockUserIdViewer,
        role: 'VIEWER',
      } as any);
      vi.mocked(prisma.workspaceMember.findMany).mockResolvedValue([] as any);

      const res = await request(app)
        .get(`/api/v1/workspaces/${mockWorkspaceId}/members`)
        .set('Cookie', ['sid=token-viewer'])
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('Non-member cannot view members (returns 403 Forbidden)', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSessionExternal as any);
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/v1/workspaces/${mockWorkspaceId}/members`)
        .set('Cookie', ['sid=token-external'])
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('POST /api/v1/workspaces/:id/members', () => {
    it('OWNER can add member', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSessionOwner as any);
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({
        workspaceId: mockWorkspaceId,
        userId: mockUserIdOwner,
        role: 'OWNER',
      } as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserIdNew,
        email: 'new@nuvro.dev',
        username: 'newuser',
      } as any);
      vi.mocked(prisma.workspaceMember.findUnique)
        .mockResolvedValueOnce({ workspaceId: mockWorkspaceId, userId: mockUserIdOwner, role: 'OWNER' } as any)
        .mockResolvedValueOnce(null);
      
      vi.mocked(prisma.workspaceMember.create).mockResolvedValue({
        id: 'new-member-row',
        workspaceId: mockWorkspaceId,
        userId: mockUserIdNew,
        role: 'MEMBER',
      } as any);

      const res = await request(app)
        .post(`/api/v1/workspaces/${mockWorkspaceId}/members`)
        .send({ email: 'new@nuvro.dev', role: 'MEMBER' })
        .set('Cookie', ['sid=token-owner'])
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('MEMBER');
    });

    it('ADMIN can add member', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSessionAdmin as any);
      vi.mocked(prisma.workspaceMember.findUnique)
        .mockResolvedValueOnce({ workspaceId: mockWorkspaceId, userId: mockUserIdAdmin, role: 'ADMIN' } as any)
        .mockResolvedValueOnce(null);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserIdNew,
        email: 'new@nuvro.dev',
      } as any);
      vi.mocked(prisma.workspaceMember.create).mockResolvedValue({
        id: 'new-member-row',
        workspaceId: mockWorkspaceId,
        userId: mockUserIdNew,
        role: 'VIEWER',
      } as any);

      const res = await request(app)
        .post(`/api/v1/workspaces/${mockWorkspaceId}/members`)
        .send({ email: 'new@nuvro.dev', role: 'VIEWER' })
        .set('Cookie', ['sid=token-admin'])
        .expect(201);

      expect(res.body.success).toBe(true);
    });

    it('MEMBER cannot add member (returns 403 Forbidden)', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSessionMember as any);
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({
        workspaceId: mockWorkspaceId,
        userId: mockUserIdMember,
        role: 'MEMBER',
      } as any);

      const res = await request(app)
        .post(`/api/v1/workspaces/${mockWorkspaceId}/members`)
        .send({ email: 'new@nuvro.dev', role: 'MEMBER' })
        .set('Cookie', ['sid=token-member'])
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('Cannot add the same user twice (returns 409 Conflict)', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSessionOwner as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: mockUserIdMember,
        email: 'member@nuvro.dev',
      } as any);
      vi.mocked(prisma.workspaceMember.findUnique)
        .mockResolvedValueOnce({ workspaceId: mockWorkspaceId, userId: mockUserIdOwner, role: 'OWNER' } as any)
        .mockResolvedValueOnce({ workspaceId: mockWorkspaceId, userId: mockUserIdMember, role: 'MEMBER' } as any);

      const res = await request(app)
        .post(`/api/v1/workspaces/${mockWorkspaceId}/members`)
        .send({ email: 'member@nuvro.dev', role: 'MEMBER' })
        .set('Cookie', ['sid=token-owner'])
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('Rejects invalid roles (returns 400 Bad Request)', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSessionOwner as any);

      const res = await request(app)
        .post(`/api/v1/workspaces/${mockWorkspaceId}/members`)
        .send({ email: 'new@nuvro.dev', role: 'INVALID_ROLE' })
        .set('Cookie', ['sid=token-owner'])
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /api/v1/workspaces/:id/members/:userId', () => {
    it('OWNER can change roles', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSessionOwner as any);
      vi.mocked(prisma.workspace.findUnique).mockResolvedValue({
        id: mockWorkspaceId,
        ownerId: mockUserIdOwner,
      } as any);

      vi.mocked(prisma.workspaceMember.findUnique)
        .mockResolvedValueOnce({ workspaceId: mockWorkspaceId, userId: mockUserIdOwner, role: 'OWNER' } as any)
        .mockResolvedValueOnce({ workspaceId: mockWorkspaceId, userId: mockUserIdMember, role: 'MEMBER' } as any);

      vi.mocked(prisma.workspaceMember.update).mockResolvedValue({
        workspaceId: mockWorkspaceId,
        userId: mockUserIdMember,
        role: 'ADMIN',
      } as any);

      const res = await request(app)
        .patch(`/api/v1/workspaces/${mockWorkspaceId}/members/${mockUserIdMember}`)
        .send({ role: 'ADMIN' })
        .set('Cookie', ['sid=token-owner'])
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('ADMIN');
    });

    it('MEMBER cannot escalate themselves or others (returns 403)', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSessionMember as any);
      vi.mocked(prisma.workspace.findUnique).mockResolvedValue({
        id: mockWorkspaceId,
        ownerId: mockUserIdOwner,
      } as any);

      vi.mocked(prisma.workspaceMember.findUnique)
        .mockResolvedValueOnce({ workspaceId: mockWorkspaceId, userId: mockUserIdMember, role: 'MEMBER' } as any)
        .mockResolvedValueOnce({ workspaceId: mockWorkspaceId, userId: mockUserIdViewer, role: 'VIEWER' } as any);

      const res = await request(app)
        .patch(`/api/v1/workspaces/${mockWorkspaceId}/members/${mockUserIdViewer}`)
        .send({ role: 'ADMIN' })
        .set('Cookie', ['sid=token-member'])
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('Cannot demote/change role of the workspace Owner', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSessionOwner as any);
      vi.mocked(prisma.workspace.findUnique).mockResolvedValue({
        id: mockWorkspaceId,
        ownerId: mockUserIdOwner,
      } as any);

      vi.mocked(prisma.workspaceMember.findUnique)
        .mockResolvedValueOnce({ workspaceId: mockWorkspaceId, userId: mockUserIdOwner, role: 'OWNER' } as any)
        .mockResolvedValueOnce({ workspaceId: mockWorkspaceId, userId: mockUserIdOwner, role: 'OWNER' } as any);

      const res = await request(app)
        .patch(`/api/v1/workspaces/${mockWorkspaceId}/members/${mockUserIdOwner}`)
        .send({ role: 'ADMIN' })
        .set('Cookie', ['sid=token-owner'])
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('owner role cannot be changed');
    });
  });

  describe('DELETE /api/v1/workspaces/:id/members/:userId', () => {
    it('OWNER can remove member', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSessionOwner as any);
      vi.mocked(prisma.workspace.findUnique).mockResolvedValue({
        id: mockWorkspaceId,
        ownerId: mockUserIdOwner,
      } as any);

      vi.mocked(prisma.workspaceMember.findUnique)
        .mockResolvedValueOnce({ workspaceId: mockWorkspaceId, userId: mockUserIdOwner, role: 'OWNER' } as any)
        .mockResolvedValueOnce({ workspaceId: mockWorkspaceId, userId: mockUserIdMember, role: 'MEMBER' } as any);

      vi.mocked(prisma.workspaceMember.delete).mockResolvedValue({
        workspaceId: mockWorkspaceId,
        userId: mockUserIdMember,
      } as any);

      const res = await request(app)
        .delete(`/api/v1/workspaces/${mockWorkspaceId}/members/${mockUserIdMember}`)
        .set('Cookie', ['sid=token-owner'])
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('Cannot remove the final OWNER', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSessionOwner as any);
      vi.mocked(prisma.workspace.findUnique).mockResolvedValue({
        id: mockWorkspaceId,
        ownerId: mockUserIdOwner,
      } as any);

      vi.mocked(prisma.workspaceMember.findUnique)
        .mockResolvedValueOnce({ workspaceId: mockWorkspaceId, userId: mockUserIdOwner, role: 'OWNER' } as any)
        .mockResolvedValueOnce({ workspaceId: mockWorkspaceId, userId: mockUserIdOwner, role: 'OWNER' } as any);

      const res = await request(app)
        .delete(`/api/v1/workspaces/${mockWorkspaceId}/members/${mockUserIdOwner}`)
        .set('Cookie', ['sid=token-owner'])
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });
});
