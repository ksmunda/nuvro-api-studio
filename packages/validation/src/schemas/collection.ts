import { z } from 'zod';
import { cuidSchema } from './common.js';

export const createCollectionSchema = z.object({
  name: z
    .string()
    .min(1, 'Collection name is required')
    .max(128, 'Collection name must be at most 128 characters')
    .trim(),
  description: z.string().max(512).optional(),
  workspaceId: cuidSchema,
});

export const updateCollectionSchema = z.object({
  name: z.string().min(1).max(128).trim().optional(),
  description: z.string().max(512).optional(),
});

export const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, 'Folder name is required')
    .max(128, 'Folder name must be at most 128 characters')
    .trim(),
  description: z.string().max(512).optional(),
  collectionId: cuidSchema,
  parentId: cuidSchema.optional(),
  sortOrder: z.number().int().nonnegative().default(0),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1).max(128).trim().optional(),
  description: z.string().max(512).optional(),
  parentId: cuidSchema.nullable().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});

export interface FolderDto {
  id: string;
  name: string;
  description: string | null;
  collectionId: string;
  parentId: string | null;
  children: FolderDto[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const folderSchema: z.ZodType<FolderDto> = z.lazy(() =>
  z.object({
    id: cuidSchema,
    name: z.string(),
    description: z.string().nullable(),
    collectionId: cuidSchema,
    parentId: cuidSchema.nullable(),
    children: z.array(folderSchema),
    sortOrder: z.number().int(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
);

export const collectionSchema = z.object({
  id: cuidSchema,
  name: z.string(),
  description: z.string().nullable(),
  workspaceId: cuidSchema,
  requestCount: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const collectionDetailSchema = collectionSchema.extend({
  folders: z.array(folderSchema),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
export type Collection = z.infer<typeof collectionSchema>;
export type CollectionDetail = z.infer<typeof collectionDetailSchema>;
