/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';

// Mock the database client singleton
vi.mock('@nuvro/database', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    workspace: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    workspaceMember: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
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
    environment: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    variable: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    requestHistory: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
  };
  return { prisma: mockPrisma };
});

import { prisma } from '@nuvro/database';
import { userRepository } from './user.js';
import { workspaceRepository } from './workspace.js';
import { collectionRepository } from './collection.js';
import { environmentRepository } from './environment.js';
import { requestRepository } from './request.js';

describe('Database Repositories with Isolation Scoping', () => {
  describe('UserRepository', () => {
    it('creates and finds users by email', async () => {
      const mockUser = { id: 'u1', email: 'test@nuvro.dev', username: 'testuser' };
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const created = await userRepository.create({
        email: 'test@nuvro.dev',
        username: 'testuser',
        passwordHash: 'hashed',
      });
      expect(created).toEqual(mockUser);

      const found = await userRepository.findByEmail('test@nuvro.dev');
      expect(found).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@nuvro.dev' } });
    });
  });

  describe('WorkspaceRepository', () => {
    it('creates workspaces and manages members', async () => {
      const mockWorkspace = { id: 'w1', name: 'Dev Workspace', slug: 'dev' };
      const mockMember = { workspaceId: 'w1', userId: 'u1', role: 'OWNER' };
      vi.mocked(prisma.workspace.create).mockResolvedValue(mockWorkspace as any);
      vi.mocked(prisma.workspaceMember.findUnique).mockResolvedValue(mockMember as any);

      const created = await workspaceRepository.create({
        name: 'Dev Workspace',
        slug: 'dev',
        ownerId: 'u1',
      });
      expect(created).toEqual(mockWorkspace);

      const membership = await workspaceRepository.findMembership('w1', 'u1');
      expect(membership).toEqual(mockMember);
    });
  });

  describe('CollectionRepository', () => {
    it('enforces workspace isolation constraints on collection queries', async () => {
      const mockCollection = { id: 'c1', name: 'API Collection', workspaceId: 'w1' };
      vi.mocked(prisma.collection.findFirst).mockResolvedValue(mockCollection as any);

      const found = await collectionRepository.findById('c1', 'w1');
      expect(found).toEqual(mockCollection);
      expect(prisma.collection.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'c1',
          workspaceId: 'w1',
        },
      });
    });
  });

  describe('EnvironmentRepository', () => {
    it('handles environment variables CRUD', async () => {
      const mockVariable = { id: 'v1', key: 'baseUrl', value: 'http://localhost' };
      vi.mocked(prisma.variable.create).mockResolvedValue(mockVariable as any);

      const created = await environmentRepository.createVariable({
        key: 'baseUrl',
        value: 'http://localhost',
        environmentId: 'env1',
      });
      expect(created).toEqual(mockVariable);
    });
  });

  describe('RequestRepository & Auditing', () => {
    it('logs request history events', async () => {
      const mockHistory = { id: 'h1', method: 'GET', url: '/posts', status: 'SUCCESS' };
      vi.mocked(prisma.requestHistory.create).mockResolvedValue(mockHistory as any);

      const logged = await requestRepository.createHistory({
        userId: 'u1',
        method: 'GET',
        url: '/posts',
        status: 'SUCCESS',
      });
      expect(logged).toEqual(mockHistory);
    });
  });
});
