import type { Request, Response, NextFunction } from 'express';

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'key', 'authorization'];

function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body;
  
  const sanitized = { ...(body as Record<string, unknown>) };
  for (const key of Object.keys(sanitized)) {
    if (SENSITIVE_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeBody(sanitized[key]);
    }
  }
  return sanitized;
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationMs = Math.round((diff[0] * 1e9 + diff[1]) / 1e6);
    
    const logInfo = {
      requestId: req.id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs,
      ip: req.ip,
      userAgent: req.header('user-agent'),
      body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
    };
    
    // Structured console log
    console.info(`[HTTP] ${logInfo.method} ${logInfo.path} ${logInfo.status} - ${logInfo.durationMs}ms (ID: ${logInfo.requestId})`);
  });
  
  next();
}
