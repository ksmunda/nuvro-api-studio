import { Router } from 'express';

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

// Stubs for future Phase 3+ feature endpoints under /api/v1/...
router.use('/auth', (_req, res) => {
  res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Auth routes not yet implemented' } });
});

router.use('/workspaces', (_req, res) => {
  res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Workspace routes not yet implemented' } });
});

router.use('/collections', (_req, res) => {
  res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Collection routes not yet implemented' } });
});

router.use('/requests', (_req, res) => {
  res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Request execution routes not yet implemented' } });
});

router.use('/environments', (_req, res) => {
  res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Environment routes not yet implemented' } });
});

router.use('/history', (_req, res) => {
  res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'History routes not yet implemented' } });
});
