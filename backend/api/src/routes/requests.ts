import { Router } from 'express';
import { executeRequestSchema } from '@nuvro/validation';
import { requestExecutionService } from '../services/request-execution.js';
import { validate } from '../middleware/validation.js';
import { requireAuth } from '../middleware/auth.js';

export const requestsRouter: Router = Router();

// Outbound request executor proxy: POST /api/v1/requests/execute
requestsRouter.post(
  '/execute',
  requireAuth,
  validate({ body: executeRequestSchema }),
  async (req, res, next) => {
    try {
      const response = await requestExecutionService.execute(req.body);
      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      next(error);
    }
  },
);
