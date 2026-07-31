import type { Request, Response, NextFunction } from 'express';
import type { WorkspaceRole } from '@nuvro/database';
import { workspaceRepository } from '../repositories/workspace.js';
import { ForbiddenError, NotFoundError } from '../errors/app-error.js';

/**
 * Middleware factory guaranteeing that the requesting user is a member of the workspace.
 * Resolves workspaceId from route params (`req.params.workspaceId`).
 */
export function requireWorkspaceMember(req: Request, res: Response, next: NextFunction): void {
  const userId = req.user?.id;
  const workspaceId = req.params['workspaceId'] as string;

  if (!userId) {
    return next(new ForbiddenError('Authentication required'));
  }

  if (!workspaceId) {
    return next(new NotFoundError('Workspace parameter is missing from route'));
  }

  workspaceRepository
    .findMembership(workspaceId, userId)
    .then((membership) => {
      if (!membership) {
        return next(new ForbiddenError('You are not a member of this workspace'));
      }
      next();
    })
    .catch((error) => next(error));
}

/**
 * Middleware factory guaranteeing that the requesting user has one of the allowed roles.
 */
export function requireWorkspaceRole(allowedRoles: WorkspaceRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userId = req.user?.id;
    const workspaceId = req.params['workspaceId'] as string;

    if (!userId) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (!workspaceId) {
      return next(new NotFoundError('Workspace parameter is missing from route'));
    }

    workspaceRepository
      .findMembership(workspaceId, userId)
      .then((membership) => {
        if (!membership) {
          return next(new ForbiddenError('You are not a member of this workspace'));
        }

        if (!allowedRoles.includes(membership.role)) {
          return next(new ForbiddenError('You do not have the required permissions in this workspace'));
        }
        next();
      })
      .catch((error) => next(error));
  };
}
