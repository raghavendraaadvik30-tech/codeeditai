/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Link Validation Schemas
 * Description:
 * Zod validation schemas for runtime validation of hyperlinks,
 * bookmarks, cross references, emails, and citations.
 * --------------------------------------------------------
 */

import { z } from 'zod';

export const HyperlinkSchema = z.object({
  displayText: z.string().min(1, 'Display text is required').max(300, 'Display text is too long'),
  target: z.string().min(1, 'Target URL or anchor is required'),
  protocol: z.string().optional(),
  tooltip: z.string().max(200).optional(),
  openInNewTab: z.boolean().default(true),
});

export const BookmarkSchema = z.object({
  name: z
    .string()
    .min(1, 'Bookmark name is required')
    .max(100, 'Bookmark name is too long')
    .regex(/^[a-zA-Z0-9_\-\s]+$/, 'Bookmark name can only contain letters, numbers, spaces, underscores, and hyphens'),
  text: z.string().optional(),
});

export const CrossReferenceSchema = z.object({
  targetId: z.string().min(1, 'Target reference identifier is required'),
  targetType: z.enum(['heading', 'figure', 'table', 'bookmark']),
  label: z.string().min(1, 'Reference label is required'),
  includePageNumber: z.boolean().default(true),
});

export const EmailLinkSchema = z.object({
  to: z.string().email('Please enter a valid email address'),
  subject: z.string().max(200, 'Subject is too long').optional(),
  body: z.string().max(2000, 'Body text is too long').optional(),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  displayText: z.string().min(1, 'Display text is required'),
});

export const CitationSchema = z.object({
  key: z.string().min(1, 'Citation key is required'),
  title: z.string().min(1, 'Title is required'),
  authors: z.array(z.string()).min(1, 'At least one author is required'),
  year: z.number().int().min(1800).max(new Date().getFullYear() + 10),
  journal: z.string().optional(),
  doi: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
});

export type HyperlinkFormValues = z.infer<typeof HyperlinkSchema>;
export type BookmarkFormValues = z.infer<typeof BookmarkSchema>;
export type CrossReferenceFormValues = z.infer<typeof CrossReferenceSchema>;
export type EmailLinkFormValues = z.infer<typeof EmailLinkSchema>;
export type CitationFormValues = z.infer<typeof CitationSchema>;
