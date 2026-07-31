import { z } from 'zod';
import { cuidSchema } from './common.js';

export const createEnvironmentSchema = z.object({
  name: z
    .string()
    .min(1, 'Environment name is required')
    .max(64, 'Environment name must be at most 64 characters')
    .trim(),
  workspaceId: cuidSchema,
  isDefault: z.boolean().default(false),
});

export const updateEnvironmentSchema = z.object({
  name: z.string().min(1).max(64).trim().optional(),
  isDefault: z.boolean().optional(),
});

export const createVariableSchema = z.object({
  key: z
    .string()
    .min(1, 'Variable key is required')
    .max(128, 'Variable key must be at most 128 characters')
    .regex(
      /^[a-zA-Z_][a-zA-Z0-9_]*$/,
      'Variable key must start with a letter or underscore and contain only letters, numbers, and underscores',
    ),
  value: z.string().max(4096, 'Variable value must be at most 4096 characters'),
  description: z.string().max(256).optional(),
  isSecret: z.boolean().default(false),
  enabled: z.boolean().default(true),
  environmentId: cuidSchema,
});

export const updateVariableSchema = createVariableSchema.omit({ environmentId: true }).partial();

export const bulkUpsertVariablesSchema = z.object({
  environmentId: cuidSchema,
  variables: z
    .array(
      z.object({
        key: z.string().min(1).max(128),
        value: z.string().max(4096),
        description: z.string().max(256).optional(),
        isSecret: z.boolean().default(false),
        enabled: z.boolean().default(true),
      }),
    )
    .min(1, 'At least one variable is required')
    .max(500, 'Cannot upsert more than 500 variables at once'),
});

export const variableSchema = z.object({
  id: cuidSchema,
  key: z.string(),
  value: z.string(),
  description: z.string().nullable(),
  isSecret: z.boolean(),
  enabled: z.boolean(),
  environmentId: cuidSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const variableResponseSchema = variableSchema.extend({
  value: z.string().transform((val, ctx) => {
    void ctx;
    return val;
  }),
});

export const environmentSchema = z.object({
  id: cuidSchema,
  name: z.string(),
  workspaceId: cuidSchema,
  isDefault: z.boolean(),
  variableCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const environmentDetailSchema = environmentSchema.extend({
  variables: z.array(variableSchema),
});

export const resolvedEnvironmentSchema = z.object({
  environmentId: cuidSchema,
  environmentName: z.string(),
  variables: z.record(z.string()),
});

export type CreateEnvironmentInput = z.infer<typeof createEnvironmentSchema>;
export type UpdateEnvironmentInput = z.infer<typeof updateEnvironmentSchema>;
export type CreateVariableInput = z.infer<typeof createVariableSchema>;
export type UpdateVariableInput = z.infer<typeof updateVariableSchema>;
export type BulkUpsertVariablesInput = z.infer<typeof bulkUpsertVariablesSchema>;
export type Variable = z.infer<typeof variableSchema>;
export type Environment = z.infer<typeof environmentSchema>;
export type EnvironmentDetail = z.infer<typeof environmentDetailSchema>;
export type ResolvedEnvironment = z.infer<typeof resolvedEnvironmentSchema>;
