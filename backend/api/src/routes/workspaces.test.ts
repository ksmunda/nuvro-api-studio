/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
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

describe('Workspaces API Endpoint Integrations', () => {
  const mockUserIdA = 'user-a-id';
  const mockWorkspaceId = 'workspace-id-1';

  const mockUserA = { id: mockUserIdA, email: 'user-a@nuvro.dev', username: 'usera' };
  const mockSessionA = {
    id: 'session-a-id',
    token: 'valid-session-token-a',
    userId: mockUserIdA,
    expiresAt: new Date(Date.now() + 100000),
    user: mockUserA,
  };

  describe('GET /api/v1/workspaces', () => {
    it('returns list of workspaces where the authenticated user is a member', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSessionA as any);
      vi.mocked(prisma.workspace.findMany).mockResolvedValue([
        {
          id: mockWorkspaceId,
          name: 'Workspace A',
          slug: 'workspace-a',
          description: 'Main workspace',
          ownerId: mockUserIdA,
        },
      ] as any);

      const res = await request(app)
        .get('/api/v1/workspaces')
        .set('Cookie', ['sid=valid-session-token-a'])
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe(mockWorkspaceId);
      expect(res.body.data[0].name).toBe('Workspace A');
    });

    it('rejects listing workspaces for unauthenticated requests', async () => {
      const res = await request(app)
        .get('/api/v1/workspaces')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/workspaces', () => {
    it('creates a workspace and assigns owner membership', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSessionA as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUserA as any);
      vi.mocked(prisma.workspace.findFirst).mockResolvedValue(null); // slug is unique
      vi.mocked(prisma.workspace.create).mockResolvedValue({
        id: 'new-workspace-id',
        name: 'New Workspace',
        slug: 'new-workspace',
        description: 'Testing',
        ownerId: mockUserIdA,
      } as any);
      vi.mocked(prisma.workspaceMember.create).mockResolvedValue({
        id: 'new-member-id',
        workspaceId: 'new-workspace-id',
        userId: mockUserIdA,
        role: 'OWNER',
      } as any);

      const res = await request(app)
        .post('/api/v1/workspaces')
        .send({ name: 'New Workspace', slug: 'new-workspace', description: 'Testing' })
        .set('Cookie', ['sid=valid-session-token-a'])
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('new-workspace-id');
      expect(res.body.data.name).toBe('New Workspace');
    });

    it('rejects workspace creation with invalid schema', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSessionA as any);

      const res = await request(app)
        .post('/api/v1/workspaces')
        .send({ name: '' }) // blank name is invalid
        .set('Cookie', ['sid=valid-session-token-a'])
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('Security & Isolation', () => {
    it('User A cannot view resources of User B workspace if User A has no membership', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSessionA as any);
      // Mock membership lookup as null (meaning User A is not in User B's workspace)
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue(null);

      // use a valid CUID format workspaceId
      const res = await request(app)
        .get(`/api/v1/environments?workspaceId=cjld2cyuq0000t31027dxwz5b`)
        .set('Cookie', ['sid=valid-session-token-a'])
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });
});
