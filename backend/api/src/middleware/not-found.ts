import type { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors/app-error.js';

export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  next(new NotFoundError(`The requested path ${req.method} ${req.path} does not exist`));
}
