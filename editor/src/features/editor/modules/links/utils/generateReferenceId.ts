/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Reference ID Generator Utility
 * Description:
 * Generates unique, URL-safe reference anchor IDs with prefix tags
 * for figures, tables, headings, bookmarks, and cross-references.
 * --------------------------------------------------------
 */

import type { CrossReferenceTarget } from '../types';

export const generateReferenceId = (type: CrossReferenceTarget | 'bookmark' | 'link' | 'custom' = 'heading', label = ''): string => {
  const sanitizedLabel = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .substring(0, 20)
    .replace(/^_+|_+$/g, '');

  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const prefixMap: Record<string, string> = {
    figure: 'fig',
    table: 'tbl',
    heading: 'sec',
    bookmark: 'bm',
    page: 'pg',
    numbered_list: 'item',
    citation: 'cite',
    custom: 'ref',
    link: 'lnk',
  };

  const prefix = prefixMap[type] || 'ref';
  return sanitizedLabel ? `${prefix}_${sanitizedLabel}_${randomSuffix}` : `${prefix}_${Date.now().toString(36)}_${randomSuffix}`;
};
