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
    environment: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    variable: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  return { prisma: mockPrisma };
});

import { app } from '../app.js';
import { prisma } from '@nuvro/database';

describe('Environments & Variables API Endpoint Integrations', () => {
  const mockUserId = 'cjld2cyuq0000t31027dxwz5u';
  const mockWorkspaceId = 'cjld2cyuq0000t31027dxwz5a';
  const mockEnvironmentId = 'cjld2cyuq0000t31027dxwz5b';
  const mockVariableId = 'cjld2cyuq0000t31027dxwz5c';

  const mockUser = { id: mockUserId, email: 'developer@nuvro.dev', username: 'dev' };
  const mockSession = {
    id: 'cjld2cyuq0000t31027dxwz5f',
    token: 'valid-session-token',
    userId: mockUserId,
    expiresAt: new Date(Date.now() + 100000),
    user: mockUser,
  };

  describe('GET /api/v1/environments', () => {
    it('lists environments for a workspace if user has membership', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({ workspaceId: mockWorkspaceId, userId: mockUserId, role: 'MEMBER' } as any);
      vi.mocked(prisma.environment.findMany).mockResolvedValue([
        { id: mockEnvironmentId, name: 'Local', workspaceId: mockWorkspaceId, isDefault: true },
      ] as any);

      const res = await request(app)
        .get(`/api/v1/environments?workspaceId=${mockWorkspaceId}`)
        .set('Cookie', ['sid=valid-session-token'])
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data[0].name).toBe('Local');
    });

    it('rejects if workspace membership check fails', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue(null);

      const res = await request(app)
        .get(`/api/v1/environments?workspaceId=${mockWorkspaceId}`)
        .set('Cookie', ['sid=valid-session-token'])
        .expect(403);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('POST /api/v1/environments', () => {
    it('creates an environment if user is OWNER or MEMBER', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({ workspaceId: mockWorkspaceId, userId: mockUserId, role: 'MEMBER' } as any);
      vi.mocked(prisma.environment.create).mockResolvedValue({
        id: mockEnvironmentId,
        name: 'Staging',
        workspaceId: mockWorkspaceId,
        isDefault: false,
      } as any);

      const res = await request(app)
        .post('/api/v1/environments')
        .send({ name: 'Staging', workspaceId: mockWorkspaceId })
        .set('Cookie', ['sid=valid-session-token'])
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Staging');
    });

    it('rejects if user role is VIEWER', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({ workspaceId: mockWorkspaceId, userId: mockUserId, role: 'VIEWER' } as any);

      const res = await request(app)
        .post('/api/v1/environments')
        .send({ name: 'Staging', workspaceId: mockWorkspaceId })
        .set('Cookie', ['sid=valid-session-token'])
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/environments/:id', () => {
    it('returns environment detail and masks secret variables', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.environment.findFirst).mockResolvedValue({
        id: mockEnvironmentId,
        name: 'Production',
        workspaceId: mockWorkspaceId,
      } as any);
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({ workspaceId: mockWorkspaceId, userId: mockUserId, role: 'MEMBER' } as any);
      vi.mocked(prisma.variable.findMany).mockResolvedValue([
        { id: '1', key: 'API_URL', value: 'https://api.com', isSecret: false, enabled: true },
        { id: '2', key: 'API_KEY', value: 'supersecretvalue', isSecret: true, enabled: true },
      ] as any);

      const res = await request(app)
        .get(`/api/v1/environments/${mockEnvironmentId}`)
        .set('Cookie', ['sid=valid-session-token'])
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.variables[0].value).toBe('https://api.com');
      expect(res.body.data.variables[1].value).toBe('[SECRET_MASKED]');
    });
  });

  describe('PATCH /api/v1/variables/:id', () => {
    it('preserves existing secret variable value if masked value sent in update', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.variable.findUnique).mockResolvedValue({
        id: mockVariableId,
        key: 'API_KEY',
        value: 'true_database_secret',
        isSecret: true,
        environment: { workspaceId: mockWorkspaceId },
      } as any);
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue({ workspaceId: mockWorkspaceId, userId: mockUserId, role: 'MEMBER' } as any);
      
      const updateMock = vi.mocked(prisma.variable.update).mockResolvedValue({
        id: mockVariableId,
        key: 'API_KEY',
        value: 'true_database_secret',
        isSecret: true,
      } as any);

      await request(app)
        .patch(`/api/v1/environments/variables/${mockVariableId}`)
        .send({ value: '[SECRET_MASKED]', enabled: false })
        .set('Cookie', ['sid=valid-session-token'])
        .expect(200);

      // Verify that prisma.variable.update was NOT sent '[SECRET_MASKED]' as value (it preserves secret)
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { enabled: false }, // value should be stripped out of data object
        })
      );
    });
  });
});
