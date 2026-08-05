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
    requestHistory: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  };
  return { prisma: mockPrisma };
});

import { app } from '../app.js';
import { prisma } from '@nuvro/database';

describe('Request History API Endpoint Integrations', () => {
  const mockUserId = 'cjld2cyuq0000t31027dxwz5u';
  const mockHistoryId = 'cjld2cyuq0000t31027dxwz5h';

  const mockUser = { id: mockUserId, email: 'developer@nuvro.dev', username: 'dev' };
  const mockSession = {
    id: 'cjld2cyuq0000t31027dxwz5f',
    token: 'valid-session-token',
    userId: mockUserId,
    expiresAt: new Date(Date.now() + 100000),
    user: mockUser,
  };

  describe('GET /api/v1/history', () => {
    it('returns history items for authenticated user', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.requestHistory.findMany).mockResolvedValue([
        { id: mockHistoryId, method: 'GET', url: 'https://api.com/health', status: 'SUCCESS', userId: mockUserId },
      ] as any);

      const res = await request(app)
        .get('/api/v1/history')
        .set('Cookie', ['sid=valid-session-token'])
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data[0].url).toBe('https://api.com/health');
    });

    it('rejects unauthenticated requests', async () => {
      await request(app)
        .get('/api/v1/history')
        .expect(401);
    });
  });

  describe('DELETE /api/v1/history/:id', () => {
    it('deletes history item if user is the owner', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.requestHistory.findUnique).mockResolvedValue({
        id: mockHistoryId,
        userId: mockUserId,
      } as any);
      vi.mocked(prisma.requestHistory.delete).mockResolvedValue({ id: mockHistoryId } as any);

      const res = await request(app)
        .delete(`/api/v1/history/${mockHistoryId}`)
        .set('Cookie', ['sid=valid-session-token'])
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('rejects if user does not own the history item', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.requestHistory.findUnique).mockResolvedValue({
        id: mockHistoryId,
        userId: 'other-user-id',
      } as any);

      const res = await request(app)
        .delete(`/api/v1/history/${mockHistoryId}`)
        .set('Cookie', ['sid=valid-session-token'])
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/history', () => {
    it('clears all history items for the user', async () => {
      vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue(mockSession as any);
      vi.mocked(prisma.requestHistory.deleteMany).mockResolvedValue({ count: 5 } as any);

      const res = await request(app)
        .delete('/api/v1/history')
        .set('Cookie', ['sid=valid-session-token'])
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(5);
    });
  });
});
