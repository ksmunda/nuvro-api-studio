import { Router } from 'express';
import {
  createEnvironmentSchema,
  updateEnvironmentSchema,
  createVariableSchema,
  updateVariableSchema,
  cuidSchema,
} from '@nuvro/validation';
import { environmentService } from '../services/environment.js';
import { validate } from '../middleware/validation.js';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';

export const environmentsRouter: Router = Router();

// GET /api/v1/environments?workspaceId=...
environmentsRouter.get(
  '/',
  requireAuth,
  validate({
    query: z.object({
      workspaceId: cuidSchema,
    }),
  }),
  async (req, res, next) => {
    try {
      const workspaceId = req.query['workspaceId'] as string;
      const environments = await environmentService.getEnvironments(workspaceId, req.user!.id);
      res.status(200).json({
        success: true,
        data: environments,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/environments
environmentsRouter.post(
  '/',
  requireAuth,
  validate({ body: createEnvironmentSchema }),
  async (req, res, next) => {
    try {
      const environment = await environmentService.createEnvironment(req.body, req.user!.id);
      res.status(201).json({
        success: true,
        data: environment,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/environments/:id
environmentsRouter.get(
  '/:id',
  requireAuth,
  validate({ params: z.object({ id: cuidSchema }) }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const environment = await environmentService.getEnvironmentById(id, req.user!.id);
      res.status(200).json({
        success: true,
        data: environment,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/environments/:id
environmentsRouter.patch(
  '/:id',
  requireAuth,
  validate({
    params: z.object({ id: cuidSchema }),
    body: updateEnvironmentSchema,
  }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const environment = await environmentService.updateEnvironment(id, req.body, req.user!.id);
      res.status(200).json({
        success: true,
        data: environment,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/environments/:id
environmentsRouter.delete(
  '/:id',
  requireAuth,
  validate({ params: z.object({ id: cuidSchema }) }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const environment = await environmentService.deleteEnvironment(id, req.user!.id);
      res.status(200).json({
        success: true,
        data: environment,
      });
    } catch (error) {
      next(error);
    }
  }
);

// --- Variables Endpoint Router ---

// GET /api/v1/environments/:id/variables
environmentsRouter.get(
  '/:id/variables',
  requireAuth,
  validate({ params: z.object({ id: cuidSchema }) }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const variables = await environmentService.getVariables(id, req.user!.id);
      res.status(200).json({
        success: true,
        data: variables,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/environments/:id/variables
environmentsRouter.post(
  '/:id/variables',
  requireAuth,
  validate({
    params: z.object({ id: cuidSchema }),
    body: createVariableSchema.omit({ environmentId: true }),
  }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const variable = await environmentService.createVariable(
        {
          ...req.body,
          environmentId: id,
        },
        req.user!.id
      );
      res.status(201).json({
        success: true,
        data: variable,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/variables/:id
environmentsRouter.patch(
  '/variables/:id',
  requireAuth,
  validate({
    params: z.object({ id: cuidSchema }),
    body: updateVariableSchema,
  }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const variable = await environmentService.updateVariable(id, req.body, req.user!.id);
      res.status(200).json({
        success: true,
        data: variable,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/variables/:id
environmentsRouter.delete(
  '/variables/:id',
  requireAuth,
  validate({ params: z.object({ id: cuidSchema }) }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const variable = await environmentService.deleteVariable(id, req.user!.id);
      res.status(200).json({
        success: true,
        data: variable,
      });
    } catch (error) {
      next(error);
    }
  }
);
