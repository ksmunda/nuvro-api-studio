/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // 1. Centralised console log (uses req.id for tracing)
  console.error(`[Error] Request ID: ${req.id ?? 'N/A'} - ${err instanceof Error ? err.stack : String(err)}`);

  // 2. Handle Zod validation errors
  if (err instanceof ZodError || (err instanceof Error && err.name === 'ZodError')) {
    const zodErr = err as any;
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: typeof zodErr.flatten === 'function' ? zodErr.flatten().fieldErrors : zodErr.message,
        requestId: req.id,
      },
    });
    return;
  }

  // 3. Handle custom Application Errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId: req.id,
      },
    });
    return;
  }

  // 4. Handle Express body parser JSON syntax errors
  if (err instanceof SyntaxError && 'status' in err && 'body' in err) {
    res.status(400).json({
      success: false,
      error: {
        code: 'MALFORMED_JSON',
        message: 'Malformed JSON payload',
        requestId: req.id,
      },
    });
    return;
  }

  // 5. Handle unknown/generic errors (safety envelope)
  const isDev = env.NODE_ENV === 'development' || env.NODE_ENV === 'test';
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isDev && err instanceof Error ? err.message : 'An unexpected error occurred',
      stack: isDev && err instanceof Error ? err.stack : undefined,
      requestId: req.id,
    },
  });
}
