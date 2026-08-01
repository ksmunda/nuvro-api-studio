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
    },
    workspaceMember: {
      findUnique: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    collection: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    folder: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    apiRequest: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  return { prisma: mockPrisma };
});

import { app } from '../app.js';
import { prisma } from '@nuvro/database';

describe('Collections, Folders, & Saved Requests Endpoint Integrations', () => {
  const mockUserId = 'cjld2cyuq0000t31027dxwz5u';
  const mockWorkspaceId = 'cjld2cyuq0000t31027dxwz5a';
  const mockCollectionId = 'cjld2cyuq0000t31027dxwz5b';
  const mockFolderId = 'cjld2cyuq0000t31027dxwz5c';
  const mockRequestId = 'cjld2cyuq0000t31027dxwz5d';

  const mockUser = { id: mockUserId, email: 'developer@nuvro.dev', username: 'dev' };
  const mockSession = {
    id: 'cjld2cyuq0000t31027dxwz5f',
    token: 'valid-session-token',
    userId: mockUserId,
    expiresAt: new Date(Date.now() + 100000),
    user: mockUser,
  };

  describe('GET /api/v1/collections', () => {
    it('returns collections for a workspace if user has access', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({ workspaceId: mockWorkspaceId, userId: mockUserId, role: 'MEMBER' } as any);
      vi.mocked(prisma.collection.findMany).mockResolvedValue([
        { id: mockCollectionId, name: 'Auth API', workspaceId: mockWorkspaceId, folders: [], requests: [] },
      ] as any);

      const res = await request(app)
        .get(`/api/v1/collections?workspaceId=${mockWorkspaceId}`)
        .set('Cookie', ['sid=valid-session-token'])
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data[0].name).toBe('Auth API');
    });

    it('rejects if user does not belong to workspace', async () => {
      const otherWorkspaceId = 'cjld2cyuq0000t31027dxwz5z';
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/v1/collections?workspaceId=${otherWorkspaceId}`)
        .set('Cookie', ['sid=valid-session-token'])
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('POST /api/v1/collections', () => {
    it('creates a collection if user is not a VIEWER', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({ workspaceId: mockWorkspaceId, userId: mockUserId, role: 'MEMBER' } as any);
      vi.mocked(prisma.collection.create).mockResolvedValue({ id: mockCollectionId, name: 'New Col', workspaceId: mockWorkspaceId } as any);

      const res = await request(app)
        .post('/api/v1/collections')
        .set('Cookie', ['sid=valid-session-token'])
        .send({ name: 'New Col', workspaceId: mockWorkspaceId })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('New Col');
    });

    it('rejects creation if user is a VIEWER', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({ workspaceId: mockWorkspaceId, userId: mockUserId, role: 'VIEWER' } as any);

      await request(app)
        .post('/api/v1/collections')
        .set('Cookie', ['sid=valid-session-token'])
        .send({ name: 'New Col', workspaceId: mockWorkspaceId })
        .expect(403);
    });
  });

  describe('POST /api/v1/collections/:id/folders', () => {
    it('creates a folder in a collection', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.collection.findFirst).mockResolvedValue({ id: mockCollectionId, workspaceId: mockWorkspaceId } as any);
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({ workspaceId: mockWorkspaceId, userId: mockUserId, role: 'MEMBER' } as any);
      vi.mocked(prisma.folder.create).mockResolvedValue({ id: mockFolderId, name: 'Folder 1', collectionId: mockCollectionId } as any);

      const res = await request(app)
        .post(`/api/v1/collections/${mockCollectionId}/folders`)
        .set('Cookie', ['sid=valid-session-token'])
        .send({ name: 'Folder 1' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Folder 1');
    });
  });

  describe('POST /api/v1/collections/:id/requests', () => {
    it('saves a request under collection', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.collection.findFirst).mockResolvedValue({ id: mockCollectionId, workspaceId: mockWorkspaceId } as any);
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({ workspaceId: mockWorkspaceId, userId: mockUserId, role: 'MEMBER' } as any);
      vi.mocked(prisma.apiRequest.create).mockResolvedValue({ id: mockRequestId, name: 'GET Users', collectionId: mockCollectionId, method: 'GET', url: 'http://localhost/users' } as any);

      const res = await request(app)
        .post(`/api/v1/collections/${mockCollectionId}/requests`)
        .set('Cookie', ['sid=valid-session-token'])
        .send({
          name: 'GET Users',
          method: 'GET',
          url: 'http://localhost/users',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('GET Users');
    });
  });
});
