import { Router } from 'express';
import { workspaceService } from '../services/workspace.js';
import { requireAuth } from '../middleware/auth.js';

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
