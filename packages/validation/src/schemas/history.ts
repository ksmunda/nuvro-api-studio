import { z } from 'zod';
import { cuidSchema, paginationSchema } from './common.js';
import { httpMethodSchema } from './request.js';

export const requestStatusSchema = z.enum([
  'PENDING',
  'SUCCESS',
  'ERROR',
  'CANCELLED',
  'TIMEOUT',
]);

export const historyQuerySchema = paginationSchema.extend({
  workspaceId: cuidSchema,
  method: httpMethodSchema.optional(),
  status: requestStatusSchema.optional(),
  search: z.string().max(256).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const requestHistoryItemSchema = z.object({
  id: cuidSchema,
  requestId: cuidSchema.nullable(),
  userId: cuidSchema,
  method: httpMethodSchema,
  url: z.string(),
  requestHeaders: z.array(z.object({ key: z.string(), value: z.string() })),
  requestBody: z.string().nullable(),
  status: requestStatusSchema,
  statusCode: z.number().int().nullable(),
  responseHeaders: z.array(z.object({ key: z.string(), value: z.string() })),
  responseBody: z.string().nullable(),
  responseSize: z.number().int().nullable(),
  durationMs: z.number().int().nullable(),
  errorMessage: z.string().nullable(),
  executedAt: z.string().datetime(),
});

export type RequestStatus = z.infer<typeof requestStatusSchema>;
export type HistoryQuery = z.infer<typeof historyQuerySchema>;
export type RequestHistoryItem = z.infer<typeof requestHistoryItemSchema>;
