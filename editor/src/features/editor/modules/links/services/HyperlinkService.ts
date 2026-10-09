/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Hyperlink Service
 * Description:
 * Core business logic for creating, parsing, updating, and removing
 * external and internal hyperlinks within the active editor DOM container.
 * --------------------------------------------------------
 */

import type { LinkModel, CreateLinkPayload, UpdateLinkPayload } from '../types';
import { parseAnchorElement, createHyperlinkHtml } from '../utils/parseHyperlink';
import { validateUrl } from '../utils/validateUrl';

export class HyperlinkService {
  /**
   * Scans the editor DOM and returns all existing hyperlinks with metadata.
   */
  listHyperlinks(container: HTMLElement | null): LinkModel[] {
    if (!container) return [];
    const anchors = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href]'));

    return anchors.map((anchor) => {
      const link = parseAnchorElement(anchor);
      // Determine page number
      const pageEl = anchor.closest('[data-page-id], section[data-page-id]');
      if (pageEl) {
        const allPages = Array.from(container.querySelectorAll('[data-page-id]'));
        const pageIdx = allPages.indexOf(pageEl);
        if (pageIdx !== -1) {
          link.pageNumber = pageIdx + 1;
        }
      }
      return link;
    });
  }

  /**
   * Inserts or wraps selection with a hyperlink in the active editor.
   */
  insertHyperlink(
    editor: HTMLElement | null,
    payload: CreateLinkPayload
  ): boolean {
    if (!editor) return false;

    const validation = validateUrl(payload.target);
    const targetUrl = validation.isValid ? validation.normalizedUrl : payload.target;

    editor.focus();
    const selection = window.getSelection();

    // If selection exists and is within editor
    if (selection && selection.rangeCount > 0 && editor.contains(selection.getRangeAt(0).commonAncestorContainer)) {
      const range = selection.getRangeAt(0);

      if (!range.collapsed) {
        // Selection is not empty - wrap existing text
        const selectedText = range.toString();
        const displayText = payload.displayText || selectedText;

        const anchor = document.createElement('a');
        anchor.href = targetUrl;
        anchor.innerText = displayText;
        anchor.className = 'paraxel-editor-link text-blue-600 underline hover:text-blue-800 font-medium cursor-pointer';
        if (payload.openInNewTab !== false) {
          anchor.target = '_blank';
          anchor.rel = 'noopener noreferrer';
        } else {
          anchor.target = '_self';
          anchor.removeAttribute('rel');
        }

        if (payload.tooltip) {
          anchor.title = payload.tooltip;
        }
        if (payload.type !== 'external') {
          anchor.setAttribute('data-link-type', payload.type);
        }

        try {
          range.deleteContents();
          range.insertNode(anchor);
        } catch {
          document.execCommand('createLink', false, targetUrl);
        }
        return true;
      }
    }

    // Otherwise insert HTML snippet at cursor / execCommand
    const html = createHyperlinkHtml({
      url: targetUrl,
      displayText: payload.displayText || payload.target,
      tooltip: payload.tooltip,
      openInNewTab: payload.openInNewTab,
      type: payload.type,
    });

    document.execCommand('insertHTML', false, html);
    return true;
  }

  /**
   * Updates an existing anchor element's attributes.
   */
  updateHyperlink(
    anchor: HTMLAnchorElement | null,
    payload: UpdateLinkPayload
  ): boolean {
    if (!anchor) return false;

    if (payload.target !== undefined) {
      const validation = validateUrl(payload.target);
      anchor.href = validation.isValid ? validation.normalizedUrl : payload.target;
    }

    if (payload.displayText !== undefined) {
      anchor.innerText = payload.displayText;
    }

    if (payload.tooltip !== undefined) {
      if (payload.tooltip) {
        anchor.title = payload.tooltip;
      } else {
        anchor.removeAttribute('title');
      }
    }

    if (payload.openInNewTab !== undefined) {
      if (payload.openInNewTab) {
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
      } else {
        anchor.removeAttribute('target');
        anchor.removeAttribute('rel');
      }
    }

    return true;
  }

  /**
   * Removes hyperlink tag while preserving the inner text.
   */
  removeHyperlink(anchor: HTMLAnchorElement | null): boolean {
    if (!anchor || !anchor.parentNode) return false;

    const parent = anchor.parentNode;
    while (anchor.firstChild) {
      parent.insertBefore(anchor.firstChild, anchor);
    }
    parent.removeChild(anchor);
    parent.normalize();
    return true;
  }

  /**
   * Inserts a link from history into the active document editor / sheet.
   * Can be clicked repeatedly to insert multiple times at cursor position or active page.
   */
  insertLinkFromHistory(item: { displayText: string; target: string; targetId?: string; type?: string }): boolean {
    if (typeof document === 'undefined') return false;

    const target = item.target?.trim() || '';
    const displayText = item.displayText?.trim() || target;

    const activeEditor =
      (document.querySelector('[contenteditable="true"]:focus') as HTMLElement) ||
      (document.querySelector('[data-page-id] [contenteditable="true"]') as HTMLElement) ||
      (document.querySelector('[contenteditable="true"]') as HTMLElement);

    if (!activeEditor) return false;

    activeEditor.focus();

    const uniqueId = `link_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    let anchorHtml: string;

    if (item.type === 'Cross Reference' || target.startsWith('#')) {
      const cleanTargetId = item.targetId || target.replace(/^#/, '');
      anchorHtml = `<a id="${uniqueId}" href="#${cleanTargetId}" data-cross-ref="custom" data-target-id="${cleanTargetId}" class="cross-reference-link text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer" title="Jump to ${escapeHtml(displayText)}">${escapeHtml(displayText)}</a>`;
    } else {
      let targetUrl = target;
      if (!/^https?:\/\//i.test(targetUrl) && !targetUrl.startsWith('/') && !targetUrl.startsWith('mailto:')) {
        targetUrl = `https://${targetUrl}`;
      }
      anchorHtml = `<a id="${uniqueId}" href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="paraxel-editor-link text-blue-600 underline hover:text-blue-800 font-medium cursor-pointer" title="${escapeHtml(displayText)}">${escapeHtml(displayText)}</a>`;
    }

    try {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && activeEditor.contains(sel.anchorNode)) {
        document.execCommand('insertHTML', false, ` ${anchorHtml} `);
      } else {
        const p = activeEditor.querySelector('p') || activeEditor;
        p.insertAdjacentHTML('beforeend', ` ${anchorHtml} `);
      }

      activeEditor.dispatchEvent(new Event('input', { bubbles: true }));

      // Highlight the newly inserted anchor
      setTimeout(() => {
        const insertedEl = activeEditor.querySelector<HTMLElement>(`#${uniqueId}`);
        if (insertedEl) {
          this.highlightElement(insertedEl);
        }
      }, 50);

      return true;
    } catch (err) {
      console.error('[HyperlinkService] insertLinkFromHistory failed:', err);
      return false;
    }
  }

  /**
   * Smoothly scrolls and flashes a visual highlight on the element in the sheet.
   */
  highlightElement(el: HTMLElement) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const originalTransition = el.style.transition;
    const originalBg = el.style.backgroundColor;
    const originalOutline = el.style.outline;
    const originalBoxShadow = el.style.boxShadow;
    const originalBorderRadius = el.style.borderRadius;

    el.style.transition = 'all 0.3s ease';
    el.style.backgroundColor = '#dbeafe'; // Light blue tint
    el.style.outline = '2px solid #2563eb'; // Blue ring
    el.style.borderRadius = '4px';
    el.style.boxShadow = '0 0 16px rgba(37, 99, 235, 0.6)';

    setTimeout(() => {
      el.style.transition = 'all 0.8s ease';
      el.style.backgroundColor = originalBg;
      el.style.outline = originalOutline;
      el.style.boxShadow = originalBoxShadow;
      el.style.borderRadius = originalBorderRadius;
      setTimeout(() => {
        el.style.transition = originalTransition;
      }, 800);
    }, 2200);
  }
}

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

export const hyperlinkService = new HyperlinkService();
