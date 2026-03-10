import { z } from 'zod';
import { productSchema, updateProductSchema } from '@repo/types/product-schemas';

// Request validation schemas for Express middleware
// The validate middleware expects schemas that wrap req.body, req.query, req.params

export const createProductSchema = z.object({
  body: productSchema,
});

export const updateProductRequestSchema = z.object({
  body: updateProductSchema,
  params: z.object({
    id: z.string(),
  }),
});

export const statusChangeSchema = z.object({
  body: z.object({
    status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const bulkStatusSchema = z.object({
  body: z.object({
    ids: z.array(z.string()).min(1, 'At least one product ID is required'),
    status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']),
  }),
});

export const bulkDeleteSchema = z.object({
  body: z.object({
    ids: z.array(z.string()).min(1, 'At least one product ID is required'),
  }),
});

// Export shared schemas for direct use
export { productSchema, updateProductSchema };
