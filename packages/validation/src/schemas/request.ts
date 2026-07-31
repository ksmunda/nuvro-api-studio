import { z } from 'zod';
import { cuidSchema, templateUrlSchema } from './common.js';

export const httpMethodSchema = z.enum([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
  'TRACE',
  'CONNECT',
]);

export const authTypeSchema = z.enum([
  'NONE',
  'BASIC',
  'BEARER',
  'API_KEY',
  'OAUTH2',
  'DIGEST',
]);

export const bodyTypeSchema = z.enum([
  'NONE',
  'JSON',
  'FORM_DATA',
  'FORM_URL_ENCODED',
  'RAW',
  'BINARY',
  'GRAPHQL',
]);

export const apiKeyLocationSchema = z.enum(['header', 'query', 'cookie']);

export const keyValuePairSchema = z.object({
  key: z.string(),
  value: z.string(),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
});

export const basicAuthConfigSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const bearerAuthConfigSchema = z.object({
  token: z.string(),
});

export const apiKeyAuthConfigSchema = z.object({
  key: z.string(),
  value: z.string(),
  location: apiKeyLocationSchema.default('header'),
  headerName: z.string().optional(),
});

export const oauth2AuthConfigSchema = z.object({
  grantType: z.enum(['authorization_code', 'client_credentials', 'password']),
  clientId: z.string(),
  clientSecret: z.string().optional(),
  tokenUrl: z.string().optional(),
  authorizationUrl: z.string().optional(),
  scope: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
});

export const authConfigSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('NONE') }),
  z.object({ type: z.literal('BASIC'), config: basicAuthConfigSchema }),
  z.object({ type: z.literal('BEARER'), config: bearerAuthConfigSchema }),
  z.object({ type: z.literal('API_KEY'), config: apiKeyAuthConfigSchema }),
  z.object({ type: z.literal('OAUTH2'), config: oauth2AuthConfigSchema }),
  z.object({ type: z.literal('DIGEST'), config: basicAuthConfigSchema }),
]);

export const graphqlBodySchema = z.object({
  query: z.string(),
  variables: z.string().optional(),
  operationName: z.string().optional(),
});

export const createApiRequestSchema = z.object({
  name: z
    .string()
    .min(1, 'Request name is required')
    .max(128, 'Request name must be at most 128 characters')
    .trim(),
  description: z.string().max(512).optional(),
  method: httpMethodSchema.default('GET'),
  url: templateUrlSchema,
  collectionId: cuidSchema,
  folderId: cuidSchema.optional(),
  headers: z.array(keyValuePairSchema).default([]),
  queryParams: z.array(keyValuePairSchema).default([]),
  authType: authTypeSchema.default('NONE'),
  authConfig: z.record(z.unknown()).default({}),
  bodyType: bodyTypeSchema.default('NONE'),
  bodyContent: z.string().optional(),
  sortOrder: z.number().int().nonnegative().default(0),
  preScript: z.string().max(10_000).optional(),
  postScript: z.string().max(10_000).optional(),
});

export const updateApiRequestSchema = createApiRequestSchema
  .omit({ collectionId: true })
  .partial();

export const executeRequestSchema = z.object({
  method: httpMethodSchema,
  url: templateUrlSchema,
  headers: z.array(keyValuePairSchema).default([]),
  queryParams: z.array(keyValuePairSchema).default([]),
  authType: authTypeSchema.default('NONE'),
  authConfig: z.record(z.unknown()).default({}),
  bodyType: bodyTypeSchema.default('NONE'),
  bodyContent: z.string().optional(),
  variables: z.record(z.string()).default({}),
  timeoutMs: z.number().int().positive().max(30_000).default(10_000),
});

export const apiRequestSchema = z.object({
  id: cuidSchema,
  name: z.string(),
  description: z.string().nullable(),
  method: httpMethodSchema,
  url: z.string(),
  collectionId: cuidSchema,
  folderId: cuidSchema.nullable(),
  headers: z.array(keyValuePairSchema),
  queryParams: z.array(keyValuePairSchema),
  authType: authTypeSchema,
  authConfig: z.record(z.unknown()),
  bodyType: bodyTypeSchema,
  bodyContent: z.string().nullable(),
  sortOrder: z.number().int(),
  preScript: z.string().nullable(),
  postScript: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const executeResponseSchema = z.object({
  statusCode: z.number().int(),
  statusText: z.string(),
  headers: z.record(z.string()),
  body: z.string(),
  durationMs: z.number().int().nonnegative(),
  sizeBytes: z.number().int().nonnegative(),
  redirectCount: z.number().int().nonnegative(),
});

export type HttpMethod = z.infer<typeof httpMethodSchema>;
export type AuthType = z.infer<typeof authTypeSchema>;
export type BodyType = z.infer<typeof bodyTypeSchema>;
export type ApiKeyLocation = z.infer<typeof apiKeyLocationSchema>;
export type KeyValuePair = z.infer<typeof keyValuePairSchema>;
export type AuthConfig = z.infer<typeof authConfigSchema>;
export type BasicAuthConfig = z.infer<typeof basicAuthConfigSchema>;
export type BearerAuthConfig = z.infer<typeof bearerAuthConfigSchema>;
export type ApiKeyAuthConfig = z.infer<typeof apiKeyAuthConfigSchema>;
export type OAuth2AuthConfig = z.infer<typeof oauth2AuthConfigSchema>;
export type GraphqlBody = z.infer<typeof graphqlBodySchema>;
export type CreateApiRequestInput = z.infer<typeof createApiRequestSchema>;
export type UpdateApiRequestInput = z.infer<typeof updateApiRequestSchema>;
export type ExecuteRequestInput = z.infer<typeof executeRequestSchema>;
export type ApiRequest = z.infer<typeof apiRequestSchema>;
export type ExecuteResponse = z.infer<typeof executeResponseSchema>;
