import { Router } from 'express';
import { executeRequestSchema, updateApiRequestSchema, cuidSchema } from '@nuvro/validation';
import { requestExecutionService } from '../services/request-execution.js';
import { requestService } from '../services/request.js';
import { validate } from '../middleware/validation.js';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';

export const requestsRouter: Router = Router();

// Outbound request executor proxy: POST /api/v1/requests/execute
requestsRouter.post(
  '/execute',
  requireAuth,
  validate({ body: executeRequestSchema }),
  async (req, res, next) => {
    try {
      const response = await requestExecutionService.execute(req.body, req.user!.id);
      
      // Sanitize request headers
      const rawHeaders = req.body.headers || [];
      const sanitizedHeaders = rawHeaders.map((h: { key?: string; value?: string }) => {
        const lowerKey = (h.key || '').toLowerCase();
        if (['authorization', 'cookie', 'api-key', 'apikey', 'x-api-key', 'token', 'secret'].includes(lowerKey)) {
          return { ...h, value: '[REDACTED]' };
        }
        return h;
      });

      // Log successful request execution to history
      await requestService.logHistory({
        userId: req.user!.id,
        method: req.body.method,
        url: req.body.url,
        requestHeaders: JSON.stringify(sanitizedHeaders),
        requestBody: req.body.bodyContent || null,
        status: 'SUCCESS',
        statusCode: response.statusCode,
        responseHeaders: JSON.stringify(response.headers),
        responseBody: typeof response.body === 'string' ? response.body : JSON.stringify(response.body),
        responseSize: response.sizeBytes,
        durationMs: response.durationMs,
      });

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      // Sanitize request headers
      const rawHeaders = req.body.headers || [];
      const sanitizedHeaders = rawHeaders.map((h: { key?: string; value?: string }) => {
        const lowerKey = (h.key || '').toLowerCase();
        if (['authorization', 'cookie', 'api-key', 'apikey', 'x-api-key', 'token', 'secret'].includes(lowerKey)) {
          return { ...h, value: '[REDACTED]' };
        }
        return h;
      });

      const errMessage = error instanceof Error ? error.message : String(error);
      const isTimeout = errMessage.toLowerCase().includes('timeout') || errMessage.toLowerCase().includes('aborted');

      // Log failed request execution to history
      await requestService.logHistory({
        userId: req.user!.id,
        method: req.body.method,
        url: req.body.url,
        requestHeaders: JSON.stringify(sanitizedHeaders),
        requestBody: req.body.bodyContent || null,
        status: isTimeout ? 'TIMEOUT' : 'ERROR',
        errorMessage: errMessage,
      });

      next(error);
    }
  },
);

// GET /api/v1/requests/:id
requestsRouter.get(
  '/:id',
  requireAuth,
  validate({ params: z.object({ id: cuidSchema }) }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const request = await requestService.getRequestById(id, req.user!.id);
      res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/requests/:id
requestsRouter.patch(
  '/:id',
  requireAuth,
  validate({
    params: z.object({ id: cuidSchema }),
    body: updateApiRequestSchema,
  }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const requestInput = {
        ...req.body,
        headers: req.body.headers ? JSON.stringify(req.body.headers) : undefined,
        queryParams: req.body.queryParams ? JSON.stringify(req.body.queryParams) : undefined,
        authConfig: req.body.authConfig ? JSON.stringify(req.body.authConfig) : undefined,
      };

      const request = await requestService.updateRequest(id, requestInput, req.user!.id);
      res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/requests/:id
requestsRouter.delete(
  '/:id',
  requireAuth,
  validate({ params: z.object({ id: cuidSchema }) }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const request = await requestService.deleteRequest(id, req.user!.id);
      res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }
);
