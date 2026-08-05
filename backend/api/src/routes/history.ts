import { Router } from 'express';
import { requestService } from '../services/request.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { cuidSchema } from '@nuvro/validation';
import { z } from 'zod';

export const historyRouter: Router = Router();

// GET /api/v1/history
historyRouter.get(
  '/',
  requireAuth,
  async (req, res, next) => {
    try {
      const history = await requestService.getHistoryByUser(req.user!.id);
      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/history
historyRouter.delete(
  '/',
  requireAuth,
  async (req, res, next) => {
    try {
      const result = await requestService.clearHistory(req.user!.id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/history/:id
historyRouter.delete(
  '/:id',
  requireAuth,
  validate({
    params: z.object({
      id: cuidSchema,
    }),
  }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const deleted = await requestService.deleteHistoryItem(id, req.user!.id);
      res.status(200).json({
        success: true,
        data: deleted,
      });
    } catch (error) {
      next(error);
    }
  }
);
