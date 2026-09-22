/**
 * --------------------------------------------------------
 * Module: Figures / Figure
 * Feature: Figure Validation Schemas
 * Description:
 * Zod validation schemas for runtime validation of figure creation,
 * updates, URL insertion, and caption styling parameters.
 * --------------------------------------------------------
 */

import { z } from 'zod';

export const CreateFigureSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters long').max(200, 'Title is too long'),
  caption: z.string().optional(),
  altText: z.string().optional(),
  src: z.string().min(1, 'Image URL or source payload is required'),
  width: z.number().min(50).max(2400).optional(),
  height: z.number().min(50).max(2400).optional(),
  alignment: z.enum(['left', 'center', 'right', 'inline', 'wrap']).optional(),
  fitMode: z.enum(['contain', 'cover', 'fill', 'none']).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
});

export const UpdateFigureSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  caption: z.string().optional(),
  altText: z.string().optional(),
  src: z.string().optional(),
  width: z.number().min(50).max(2400).optional(),
  height: z.number().min(50).max(2400).optional(),
  alignment: z.enum(['left', 'center', 'right', 'inline', 'wrap']).optional(),
  fitMode: z.enum(['contain', 'cover', 'fill', 'none']).optional(),
  aspectRatioLock: z.boolean().optional(),
  borderWidth: z.number().min(0).max(20).optional(),
  borderColor: z.string().optional(),
  borderRadius: z.number().min(0).max(50).optional(),
  shadow: z.boolean().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateFigureFormValues = z.infer<typeof CreateFigureSchema>;
export type UpdateFigureFormValues = z.infer<typeof UpdateFigureSchema>;
