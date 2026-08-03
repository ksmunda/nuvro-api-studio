import { Router } from 'express';
import { authRouter } from './auth.js';
import { requestsRouter } from './requests.js';
import { collectionsRouter } from './collections.js';
import { foldersRouter } from './folders.js';
import { workspacesRouter } from './workspaces.js';

import { environmentsRouter } from './environments.js';

export const router: Router = Router();

// Versioned health endpoint: GET /api/v1/health
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
    },
  });
});

// Database health check: GET /api/v1/health/database
router.get('/health/database', async (_req, res, next) => {
  try {
    const { prisma } = await import('@nuvro/database');
    // Fast test query ($queryRaw) checking database connectivity
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      data: {
        status: 'ok',
        database: 'connected',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Authentication routes: /api/v1/auth
router.use('/auth', authRouter);

router.use('/workspaces', workspacesRouter);

router.use('/collections', collectionsRouter);

router.use('/folders', foldersRouter);

// Request execution routes: /api/v1/requests
router.use('/requests', requestsRouter);

router.use('/environments', environmentsRouter);

router.use('/history', (_req, res) => {
  res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'History routes not yet implemented' } });
});
