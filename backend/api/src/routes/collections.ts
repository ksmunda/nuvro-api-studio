import { Router } from 'express';
import {
  createCollectionSchema,
  updateCollectionSchema,
  createFolderSchema,
  createApiRequestSchema,
  cuidSchema,
} from '@nuvro/validation';
import { collectionService } from '../services/collection.js';
import { requestService } from '../services/request.js';
import { validate } from '../middleware/validation.js';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';

export const collectionsRouter: Router = Router();

// GET /api/v1/collections?workspaceId=...
collectionsRouter.get(
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
      const collections = await collectionService.getCollections(workspaceId, req.user!.id);
      res.status(200).json({
        success: true,
        data: collections,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/collections
collectionsRouter.post(
  '/',
  requireAuth,
  validate({ body: createCollectionSchema }),
  async (req, res, next) => {
    try {
      const collection = await collectionService.createCollection(req.body, req.user!.id);
      res.status(201).json({
        success: true,
        data: collection,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/collections/:id
collectionsRouter.get(
  '/:id',
  requireAuth,
  validate({ params: z.object({ id: cuidSchema }) }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const collection = await collectionService.getCollectionById(id, req.user!.id);
      res.status(200).json({
        success: true,
        data: collection,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/collections/:id
collectionsRouter.patch(
  '/:id',
  requireAuth,
  validate({
    params: z.object({ id: cuidSchema }),
    body: updateCollectionSchema,
  }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const collection = await collectionService.updateCollection(id, req.body, req.user!.id);
      res.status(200).json({
        success: true,
        data: collection,
      });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/collections/:id
collectionsRouter.delete(
  '/:id',
  requireAuth,
  validate({ params: z.object({ id: cuidSchema }) }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const collection = await collectionService.deleteCollection(id, req.user!.id);
      res.status(200).json({
        success: true,
        data: collection,
      });
    } catch (error) {
      next(error);
    }
  }
);

// --- Folders under Collection ---

// GET /api/v1/collections/:id/folders
collectionsRouter.get(
  '/:id/folders',
  requireAuth,
  validate({ params: z.object({ id: cuidSchema }) }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const folders = await collectionService.getFolders(id, req.user!.id);
      res.status(200).json({
        success: true,
        data: folders,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/collections/:id/folders
collectionsRouter.post(
  '/:id/folders',
  requireAuth,
  validate({
    params: z.object({ id: cuidSchema }),
    body: createFolderSchema.omit({ collectionId: true }),
  }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const folder = await collectionService.createFolder(
        {
          ...req.body,
          collectionId: id,
        },
        req.user!.id
      );
      res.status(201).json({
        success: true,
        data: folder,
      });
    } catch (error) {
      next(error);
    }
  }
);

// --- Requests under Collection ---

// GET /api/v1/collections/:id/requests
collectionsRouter.get(
  '/:id/requests',
  requireAuth,
  validate({ params: z.object({ id: cuidSchema }) }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const requests = await requestService.getRequestsByCollection(id, req.user!.id);
      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/collections/:id/requests
collectionsRouter.post(
  '/:id/requests',
  requireAuth,
  validate({
    params: z.object({ id: cuidSchema }),
    body: createApiRequestSchema.omit({ collectionId: true }),
  }),
  async (req, res, next) => {
    try {
      const id = req.params['id'] as string;
      const requestInput = {
        ...req.body,
        collectionId: id,
        // Serialize structures to match repository signature
        headers: req.body.headers ? JSON.stringify(req.body.headers) : undefined,
        queryParams: req.body.queryParams ? JSON.stringify(req.body.queryParams) : undefined,
        authConfig: req.body.authConfig ? JSON.stringify(req.body.authConfig) : undefined,
      };

      const request = await requestService.createRequest(requestInput, req.user!.id);
      res.status(201).json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }
);
