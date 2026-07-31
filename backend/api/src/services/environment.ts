import type { Environment, Variable } from '@nuvro/database';
import { environmentRepository } from '../repositories/environment.js';
import { workspaceRepository } from '../repositories/workspace.js';
import { NotFoundError, ForbiddenError } from '../errors/app-error.js';

export class EnvironmentService {
  async getEnvironmentById(id: string, userId: string): Promise<Environment> {
    const environment = await environmentRepository.findById(id);
    if (!environment) {
      throw new NotFoundError('Environment not found');
    }

    const membership = await workspaceRepository.findMembership(environment.workspaceId, userId);
    if (!membership) {
      throw new ForbiddenError('You do not have access to this environment');
    }

    return environment;
  }

  async createEnvironment(
    data: { name: string; workspaceId: string; isDefault?: boolean },
    userId: string,
  ): Promise<Environment> {
    const membership = await workspaceRepository.findMembership(data.workspaceId, userId);
    if (!membership || membership.role === 'VIEWER') {
      throw new ForbiddenError('You do not have permission to create environments');
    }

    return await environmentRepository.create(data);
  }

  /**
   * Retrieves variables for an environment, redacting secret values to prevent exposure.
   */
  async getVariables(environmentId: string, userId: string): Promise<Variable[]> {
    const environment = await environmentRepository.findById(environmentId);
    if (!environment) {
      throw new NotFoundError('Environment not found');
    }

    const membership = await workspaceRepository.findMembership(environment.workspaceId, userId);
    if (!membership) {
      throw new ForbiddenError('You do not have access to this environment');
    }

    const variables = await environmentRepository.findVariablesByEnvironment(environmentId);
    
    // Sanitize secrets dynamically
    return variables.map((variable) => ({
      ...variable,
      value: variable.isSecret ? '[SECRET_MASKED]' : variable.value,
    }));
  }
}

export const environmentService = new EnvironmentService();
