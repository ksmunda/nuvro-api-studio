/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Mock database prisma engine
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
  };
  return { prisma: mockPrisma };
});

import { app } from '../app.js';
import { prisma } from '@nuvro/database';
import bcrypt from 'bcrypt';

describe('Authentication API Endpoint Integrations', () => {
  describe('POST /api/v1/auth/register', () => {
    it('creates a user, hashes password, and issues an auth session cookie', async () => {
      const passwordPlain = 'SecurePass123!';
      const mockUser = {
        id: 'u1',
        email: 'developer@nuvro.dev',
        username: 'dev',
        displayName: 'Dev User',
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.workspace.create).mockResolvedValue({ id: 'w1' } as any);
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({ id: 's1' } as any);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'developer@nuvro.dev',
          username: 'dev',
          password: passwordPlain,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.user.email).toBe('developer@nuvro.dev');
      
      // Verify session cookie was set
      const cookieHeader = res.headers['set-cookie']?.[0];
      expect(cookieHeader).toContain('sid=');
      expect(cookieHeader).toContain('HttpOnly');

      // Verify password hashing was called
      expect(vi.mocked(prisma.user.create)).toHaveBeenCalled();
      const createArgs = vi.mocked(prisma.user.create).mock.calls[0]?.[0];
      expect(createArgs?.data.passwordHash).toBeDefined();
      const isHashValid = await bcrypt.compare(passwordPlain, createArgs?.data.passwordHash || '');
      expect(isHashValid).toBe(true);
    });

    it('rejects invalid email formats', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          username: 'dev',
          password: 'pass',
        })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('logs in user with correct credentials and returns cookie', async () => {
      const passwordPlain = 'MySecretWord1!';
      const passwordHash = await bcrypt.hash(passwordPlain, 10);
      const mockUser = {
        id: 'u2',
        email: 'user@nuvro.dev',
        username: 'user',
        passwordHash,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({ id: 's2' } as any);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@nuvro.dev',
          password: passwordPlain,
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.headers['set-cookie']?.[0]).toContain('sid=');
    });

    it('rejects incorrect passwords with generic error', async () => {
      const passwordHash = await bcrypt.hash('real-password', 10);
      const mockUser = {
        id: 'u2',
        email: 'user@nuvro.dev',
        username: 'user',
        passwordHash,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@nuvro.dev',
          password: 'wrong-password',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('rejects unauthenticated requests', async () => {
      await request(app)
        .get('/api/v1/auth/me')
        .expect(401);
    });
  });
});
