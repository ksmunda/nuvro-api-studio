import { Router } from 'express';
import { workspaceService } from '../services/workspace.js';
import { requireAuth } from '../middleware/auth.js';
import { createWorkspaceSchema, inviteMemberSchema, updateMemberRoleSchema, cuidSchema } from '@nuvro/validation';
import { validate } from '../middleware/validation.js';
import { z } from 'zod';

export const workspacesRouter: Router = Router();

// GET /api/v1/workspaces
workspacesRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const workspaces = await workspaceService.getUserWorkspaces(req.user!.id);
    res.status(200).json({
      success: true,
      data: workspaces,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/workspaces
workspacesRouter.post(
  '/',
  requireAuth,
  validate({ body: createWorkspaceSchema }),
  async (req, res, next) => {
    try {
      const workspace = await workspaceService.createWorkspace({
        ...req.body,
        ownerId: req.user!.id,
      });
      res.status(201).json({
        success: true,
        data: workspace,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/workspaces/:id
workspacesRouter.get(
  '/:id',
  requireAuth,
  validate({ params: z.object({ id: cuidSchema }) }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const workspace = await workspaceService.getWorkspaceDetail(id, req.user!.id);
      res.status(200).json({
        success: true,
        data: workspace,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/workspaces/:id/members
workspacesRouter.get(
  '/:id/members',
  requireAuth,
  validate({ params: z.object({ id: cuidSchema }) }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const members = await workspaceService.getWorkspaceMembers(id, req.user!.id);
      res.status(200).json({
        success: true,
        data: members,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/workspaces/:id/members
workspacesRouter.post(
  '/:id/members',
  requireAuth,
  validate({
    params: z.object({ id: cuidSchema }),
    body: inviteMemberSchema,
  }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const { email, role } = req.body;
      const member = await workspaceService.addWorkspaceMemberByEmail(id, req.user!.id, email, role);
      res.status(201).json({
        success: true,
        data: member,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/workspaces/:id/members/:userId
workspacesRouter.patch(
  '/:id/members/:userId',
  requireAuth,
  validate({
    params: z.object({
      id: cuidSchema,
      userId: cuidSchema,
    }),
    body: updateMemberRoleSchema,
  }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const userId = req.params['userId'] as string;
      const { role } = req.body;
      const member = await workspaceService.updateWorkspaceMemberRole(id, req.user!.id, userId, role);
      res.status(200).json({
        success: true,
        data: member,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/workspaces/:id/members/:userId
workspacesRouter.delete(
  '/:id/members/:userId',
  requireAuth,
  validate({
    params: z.object({
      id: cuidSchema,
      userId: cuidSchema,
    }),
  }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const userId = req.params['userId'] as string;
      const member = await workspaceService.removeWorkspaceMember(id, req.user!.id, userId);
      res.status(200).json({
        success: true,
        data: member,
      });
    } catch (error) {
      next(error);
    }
  }
);
