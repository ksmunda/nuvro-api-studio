/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';

// Mock repositories
vi.mock('../repositories/user.js', () => {
  return {
    userRepository: {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      findByUsername: vi.fn(),
      create: vi.fn(),
    },
  };
});

vi.mock('../repositories/workspace.js', () => {
  return {
    workspaceRepository: {
      findById: vi.fn(),
      findMembership: vi.fn(),
      create: vi.fn(),
    },
  };
});

vi.mock('../repositories/environment.js', () => {
  return {
    environmentRepository: {
      findById: vi.fn(),
      findVariablesByEnvironment: vi.fn(),
    },
  };
});

import { userRepository } from '../repositories/user.js';
import { workspaceRepository } from '../repositories/workspace.js';
import { environmentRepository } from '../repositories/environment.js';
import { userService } from './user.js';
import { workspaceService } from './workspace.js';
import { environmentService } from './environment.js';

describe('Business Service Layers with Isolation Scoping', () => {
  describe('UserService', () => {
    it('registers user checking for email conflict', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue({ id: 'u1' } as any);
      
      await expect(
        userService.registerUser({
          email: 'test@nuvro.dev',
          username: 'test',
          passwordHash: 'pwd',
        }),
      ).rejects.toThrow('already exists');
    });
  });

  describe('WorkspaceService', () => {
    it('enforces membership check when retrieving workspaces', async () => {
      vi.mocked(workspaceRepository.findMembership).mockResolvedValue(null); // No membership

      await expect(workspaceService.getWorkspaceById('w1', 'u1')).rejects.toThrow(
        'do not have access',
      );
    });
  });

  describe('EnvironmentService', () => {
    it('masks secret environment variables when retrieved', async () => {
      vi.mocked(environmentRepository.findById).mockResolvedValue({ id: 'env1', workspaceId: 'w1' } as any);
      vi.mocked(workspaceRepository.findMembership).mockResolvedValue({ userId: 'u1' } as any);
      vi.mocked(environmentRepository.findVariablesByEnvironment).mockResolvedValue([
        { id: 'v1', key: 'baseUrl', value: 'http://api', isSecret: false },
        { id: 'v2', key: 'apiKey', value: 'sensitive-token-xyz', isSecret: true },
      ] as any);

      const variables = await environmentService.getVariables('env1', 'u1');
      expect(variables).toEqual([
        { id: 'v1', key: 'baseUrl', value: 'http://api', isSecret: false },
        { id: 'v2', key: 'apiKey', value: '[SECRET_MASKED]', isSecret: true },
      ]);
    });
  });
});
