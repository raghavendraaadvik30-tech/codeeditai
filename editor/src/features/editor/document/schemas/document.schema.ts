/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Document Validation Schemas
 * Description:
 * Zod validation schemas for runtime validation of document creation,
 * updates, and editing payload parameters.
 * --------------------------------------------------------
 */

import { z } from 'zod';

export const CreateDocumentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').max(200, 'Title is too long'),
  content: z.string().min(1, 'Document content cannot be empty'),
  author: z.string().min(2, 'Author name is required'),
});

export const UpdateDocumentSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  content: z.string().optional(),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED']).optional(),
});

export type CreateDocumentFormValues = z.infer<typeof CreateDocumentSchema>;
export type UpdateDocumentFormValues = z.infer<typeof UpdateDocumentSchema>;
