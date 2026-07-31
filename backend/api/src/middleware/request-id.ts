import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Extend Express Request type inline to support requestId
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.header('X-Request-ID');
  
  // Validate incoming UUID structure safely
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const requestId = incomingId && uuidRegex.test(incomingId) ? incomingId : crypto.randomUUID();
  
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  next();
}
