/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Hyperlink Parser Utility
 * Description:
 * Extracts structured metadata from HTML anchor elements or raw URL strings,
 * determining link categories (external, internal, bookmark, email, citation).
 * --------------------------------------------------------
 */

import type { LinkModel, LinkType } from '../types';
import { validateUrl } from './validateUrl';

export const parseAnchorElement = (anchor: HTMLAnchorElement): LinkModel => {
  const href = anchor.getAttribute('href') || '';
  const text = anchor.innerText || anchor.textContent || '';
  const title = anchor.getAttribute('title') || '';
  const targetAttr = anchor.getAttribute('target');
  const bookmarkName = anchor.getAttribute('data-bookmark');
  const crossRefType = anchor.getAttribute('data-cross-ref');
  const citationKey = anchor.getAttribute('data-citation-key');

  let type: LinkType = 'external';
  if (bookmarkName) {
    type = 'bookmark';
  } else if (crossRefType) {
    type = 'cross_ref';
  } else if (citationKey) {
    type = 'citation';
  } else if (href.startsWith('mailto:')) {
    type = 'email';
  } else if (href.startsWith('#')) {
    type = 'internal';
  }

  const urlValidation = validateUrl(href);

  return {
    id: anchor.id || `link_${Math.random().toString(36).substring(2, 9)}`,
    type,
    displayText: text.trim() || href,
    target: href,
    protocol: urlValidation.protocol,
    tooltip: title,
    openInNewTab: targetAttr === '_blank',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const createHyperlinkHtml = (params: {
  url: string;
  displayText: string;
  tooltip?: string;
  openInNewTab?: boolean;
  type?: LinkType;
  id?: string;
}): string => {
  const { url, displayText, tooltip, openInNewTab = true, type = 'external', id } = params;
  const targetAttr = openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ' target="_self"';
  const titleAttr = ` title="${escapeHtml(tooltip || url)}"`;

  const idAttr = id ? ` id="${escapeHtml(id)}"` : '';
  const typeAttr = type !== 'external' ? ` data-link-type="${type}"` : '';

  return `<a href="${escapeHtml(url)}"${idAttr}${targetAttr}${titleAttr}${typeAttr} class="paraxel-editor-link text-blue-600 underline hover:text-blue-800 font-medium cursor-pointer">${escapeHtml(
    displayText || url
  )}</a>`;
};


function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[char] ?? char;
  });
}
