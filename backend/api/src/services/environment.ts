import type { Environment, Variable } from '@nuvro/database';
import { prisma } from '@nuvro/database';
import { environmentRepository } from '../repositories/environment.js';
import { workspaceRepository } from '../repositories/workspace.js';
import { NotFoundError, ForbiddenError } from '../errors/app-error.js';

export class EnvironmentService {
  async getEnvironments(workspaceId: string, userId: string): Promise<Environment[]> {
    const membership = await workspaceRepository.findMembership(workspaceId, userId);
    if (!membership) {
      throw new ForbiddenError('You do not have access to this workspace');
    }
    return await environmentRepository.findByWorkspace(workspaceId);
  }

  async getEnvironmentById(id: string, userId: string): Promise<Environment & { variables: Variable[] }> {
    const environment = await environmentRepository.findById(id);
    if (!environment) {
      throw new NotFoundError('Environment not found');
    }

    const membership = await workspaceRepository.findMembership(environment.workspaceId, userId);
    if (!membership) {
      throw new ForbiddenError('You do not have access to this environment');
    }

    const variables = await environmentRepository.findVariablesByEnvironment(id);
    const sanitizedVariables = variables.map((variable) => ({
      ...variable,
      value: variable.isSecret ? '[SECRET_MASKED]' : variable.value,
    }));

    return {
      ...environment,
      variables: sanitizedVariables,
    };
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

  async updateEnvironment(
    id: string,
    data: { name?: string; isDefault?: boolean },
    userId: string,
  ): Promise<Environment> {
    const environment = await environmentRepository.findById(id);
    if (!environment) {
      throw new NotFoundError('Environment not found');
    }

    const membership = await workspaceRepository.findMembership(environment.workspaceId, userId);
    if (!membership || membership.role === 'VIEWER') {
      throw new ForbiddenError('You do not have permission to update this environment');
    }

    return await environmentRepository.update(id, data);
  }

  async deleteEnvironment(id: string, userId: string): Promise<Environment> {
    const environment = await environmentRepository.findById(id);
    if (!environment) {
      throw new NotFoundError('Environment not found');
    }

    const membership = await workspaceRepository.findMembership(environment.workspaceId, userId);
    if (!membership || membership.role === 'VIEWER') {
      throw new ForbiddenError('You do not have permission to delete this environment');
    }

    return await environmentRepository.delete(id);
  }

  // --- Variable operations ---

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

  async createVariable(
    data: {
      key: string;
      value: string;
      description?: string;
      isSecret?: boolean;
      enabled?: boolean;
      environmentId: string;
    },
    userId: string,
  ): Promise<Variable> {
    const environment = await environmentRepository.findById(data.environmentId);
    if (!environment) {
      throw new NotFoundError('Environment not found');
    }

    const membership = await workspaceRepository.findMembership(environment.workspaceId, userId);
    if (!membership || membership.role === 'VIEWER') {
      throw new ForbiddenError('You do not have permission to add variables to this environment');
    }

    return await environmentRepository.createVariable(data);
  }

  async updateVariable(
    id: string,
    data: { key?: string; value?: string; description?: string | null; isSecret?: boolean; enabled?: boolean },
    userId: string,
  ): Promise<Variable> {
    const variable = await prisma.variable.findUnique({
      where: { id },
      include: { environment: true },
    });

    if (!variable) {
      throw new NotFoundError('Variable not found');
    }

    const membership = await workspaceRepository.findMembership(variable.environment.workspaceId, userId);
    if (!membership || membership.role === 'VIEWER') {
      throw new ForbiddenError('You do not have permission to update this variable');
    }

    // Secret handling: If the variable isSecret, and the frontend sent '[SECRET_MASKED]' or '••••••••••••' or null as value,
    // we MUST preserve the existing value in database.
    const updates = { ...data };
    if (variable.isSecret && (updates.value === '[SECRET_MASKED]' || updates.value?.includes('••') || updates.value === null || updates.value === undefined)) {
      delete updates.value;
    }

    return await environmentRepository.updateVariable(id, updates);
  }

  async deleteVariable(id: string, userId: string): Promise<Variable> {
    const variable = await prisma.variable.findUnique({
      where: { id },
      include: { environment: true },
    });

    if (!variable) {
      throw new NotFoundError('Variable not found');
    }

    const membership = await workspaceRepository.findMembership(variable.environment.workspaceId, userId);
    if (!membership || membership.role === 'VIEWER') {
      throw new ForbiddenError('You do not have permission to delete this variable');
    }

    return await environmentRepository.deleteVariable(id);
  }

  /**
   * Internal helper to load raw variables map for the request execution engine.
   * This retrieves real secret values safely inside the backend context.
   */
  async getRawVariablesMap(environmentId: string, userId: string): Promise<Record<string, string>> {
    const environment = await environmentRepository.findById(environmentId);
    if (!environment) {
      throw new NotFoundError('Environment not found');
    }

    const membership = await workspaceRepository.findMembership(environment.workspaceId, userId);
    if (!membership) {
      throw new ForbiddenError('You do not have access to this environment');
    }

    const variables = await environmentRepository.findVariablesByEnvironment(environmentId);
    const map: Record<string, string> = {};
    for (const v of variables) {
      if (v.enabled) {
        map[v.key] = v.value;
      }
    }
    return map;
  }
}

export const environmentService = new EnvironmentService();
