import type { Request, Response, NextFunction } from 'express';
import type { User } from '@nuvro/database';
import { authService } from '../services/auth.js';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../errors/app-error.js';

// Extend Express Request interface to hold the authenticated user
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Global authentication parser middleware.
 * Reads the secure cookie and populates req.user if active, otherwise continues.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sessionToken = req.cookies[env.AUTH_COOKIE_NAME];

  if (!sessionToken) {
    return next();
  }

  try {
    const user = await authService.verifySession(sessionToken);
    req.user = user;
    next();
  } catch {
    // Silently continue for parser; requireAuth will catch permissions later
    next();
  }
}

/**
 * Route protection guard middleware.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new UnauthorizedError('Authentication is required to access this resource', 'UNAUTHENTICATED');
  }
  next();
}
