/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Link Types Constants
 * Description:
 * Static definitions for supported link categories, cross reference targets,
 * storage keys, and default link configurations.
 * --------------------------------------------------------
 */

import type { LinkType, CrossReferenceTarget } from '../types';

export const LINK_TYPES: Record<LinkType, { label: string; description: string; icon: string }> = {
  external: {
    label: 'External Web Link',
    description: 'Hyperlink pointing to an external website or URL',
    icon: 'Globe',
  },
  internal: {
    label: 'Internal Document Link',
    description: 'Jump to a section, bookmark, or element inside this document',
    icon: 'FileText',
  },
  bookmark: {
    label: 'Bookmark Anchor',
    description: 'Named reference point inside the document text',
    icon: 'Bookmark',
  },
  cross_ref: {
    label: 'Cross Reference',
    description: 'Dynamic reference to a page, heading, figure, or table',
    icon: 'BookOpen',
  },
  email: {
    label: 'Email Address',
    description: 'Mailto link for opening default email client or draft',
    icon: 'Mail',
  },
  citation: {
    label: 'Citation',
    description: 'Scholarly citation reference',
    icon: 'Quote',
  },
};

export const CROSS_REFERENCE_TARGET_TYPES: Record<CrossReferenceTarget, { label: string; prefix: string; selector: string }> = {
  heading: {
    label: 'Headings',
    prefix: 'Section',
    selector: 'h1, h2, h3, h4, h5, h6',
  },
  figure: {
    label: 'Figures & Images',
    prefix: 'Figure',
    selector: 'figure, img, [data-figure]',
  },
  table: {
    label: 'Tables',
    prefix: 'Table',
    selector: 'table, [data-table]',
  },
  bookmark: {
    label: 'Bookmarks',
    prefix: 'Bookmark',
    selector: 'a[data-bookmark], [data-bookmark-id]',
  },
};

export const STORAGE_KEYS = {
  BOOKMARKS: 'paraxel_editor_bookmarks',
  CITATIONS: 'paraxel_editor_citations',
  VALIDATION_HISTORY: 'paraxel_editor_validation_history',
  LINKS_HISTORY: 'paraxel_editor_links_history',
  REGISTERED_TARGETS: 'paraxel_editor_registered_targets',
};

export const DEFAULT_LINK_PROTOCOL = 'https://';

