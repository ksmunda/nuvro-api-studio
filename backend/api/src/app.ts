import express from 'express';
import type { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { requestLogger } from './middleware/logger.js';
import { router as apiV1Router } from './routes/index.js';
import { notFoundHandler } from './middleware/not-found.js';
import { errorHandler } from './middleware/error-handler.js';

export const app: Express = express();

// 1. Security Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
  }),
);

// 2. CORS configuration via validated env.ts
app.use(
  cors({
    origin: env.WEB_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
  }),
);

// 3. Rate Limiting (configured softly to not block development)
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'test' ? 10_000 : 1_000, // high limit for dev, higher for testing
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(rateLimiter);

// 4. Request IDs & Logging
app.use(requestIdMiddleware);
app.use(requestLogger);

// 5. Payload size restrictions (safe parsing)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// 6. Base /api/v1 routes
app.use('/api/v1', apiV1Router);

// 7. Route not found fallback
app.use(notFoundHandler);

// 8. Centralized error handling
app.use(errorHandler);
