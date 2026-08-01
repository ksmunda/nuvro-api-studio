import { Router } from 'express';
import { updateFolderSchema, cuidSchema } from '@nuvro/validation';
import { collectionService } from '../services/collection.js';
import { validate } from '../middleware/validation.js';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';

export const foldersRouter: Router = Router();

// PATCH /api/v1/folders/:id
foldersRouter.patch(
  '/:id',
  requireAuth,
  validate({
    params: z.object({ id: cuidSchema }),
    body: updateFolderSchema,
  }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const folder = await collectionService.updateFolder(id, req.body, req.user!.id);
      res.status(200).json({
        success: true,
        data: folder,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/folders/:id
foldersRouter.delete(
  '/:id',
  requireAuth,
  validate({ params: z.object({ id: cuidSchema }) }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const folder = await collectionService.deleteFolder(id, req.user!.id);
      res.status(200).json({
        success: true,
        data: folder,
      });
    } catch (error) {
      next(error);
    }
  }
);
