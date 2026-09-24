/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Reference Validation Service
 * Description:
 * Scans document DOM to detect broken internal anchors, insecure HTTP schemes,
 * malformed URLs, empty targets, and protocol typos, providing automated repair actions.
 * --------------------------------------------------------
 */

import type { ValidationIssue, BrokenLinksReportData } from '../types';
import { validateUrl } from '../utils/validateUrl';

export class ReferenceValidationService {
  /**
   * Scans container for all link validation issues.
   */
  validateAllReferences(container: HTMLElement | null): BrokenLinksReportData {
    if (!container) {
      return {
        totalLinks: 0,
        validLinks: 0,
        issues: [],
        scannedAt: new Date().toISOString(),
      };
    }

    const anchors = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href], a[data-cross-ref], a[data-bookmark]'));
    const issues: ValidationIssue[] = [];
    const allPages = Array.from(container.querySelectorAll('[data-page-id]'));

    const getPageNumber = (el: Element): number => {
      const pageEl = el.closest('[data-page-id], section[data-page-id]');
      if (pageEl) {
        const idx = allPages.indexOf(pageEl);
        if (idx !== -1) return idx + 1;
      }
      return 1;
    };

    anchors.forEach((anchor, index) => {
      const href = anchor.getAttribute('href') || '';
      const text = (anchor.innerText || anchor.textContent || '').trim();
      const pageNumber = getPageNumber(anchor);
      const issueId = `val_${index}_${Math.random().toString(36).substring(2, 6)}`;

      // 1. Empty target check
      if (!href || href === '#' || href.trim() === '') {
        issues.push({
          id: issueId,
          type: 'empty_target',
          severity: 'error',
          message: 'Link has an empty target destination',
          target: href || '(empty)',
          elementText: text || '(no text)',
          pageNumber,
          fixSuggestion: 'Provide a valid URL or remove link anchor',
          element: anchor,
        });
        return;
      }

      // 2. Internal anchor verification
      if (href.startsWith('#')) {
        const targetId = href.substring(1);
        if (!targetId) {
          issues.push({
            id: issueId,
            type: 'empty_target',
            severity: 'error',
            message: 'Internal anchor reference is missing target ID',
            target: href,
            elementText: text,
            pageNumber,
            fixSuggestion: 'Specify the target section ID',
            element: anchor,
          });
          return;
        }

        const targetEl = container.querySelector(`#${CSS.escape(targetId)}`);
        if (!targetEl) {
          issues.push({
            id: issueId,
            type: 'broken_internal',
            severity: 'error',
            message: `Target element "#${targetId}" does not exist in the document`,
            target: href,
            elementText: text,
            pageNumber,
            fixSuggestion: 'Update link to point to an existing heading or bookmark',
            element: anchor,
          });
        }
        return;
      }

      // 3. External / Email URL validation
      const validation = validateUrl(href);

      if (!validation.isValid) {
        issues.push({
          id: issueId,
          type: validation.error?.includes('Typo') ? 'typo' : 'invalid_url',
          severity: 'error',
          message: validation.error || 'Invalid or malformed URL',
          target: href,
          elementText: text,
          pageNumber,
          fixSuggestion: validation.error?.includes('htps') ? 'Replace "htps://" with "https://"' : 'Correct URL format',
          element: anchor,
        });
      } else if (validation.warning && validation.warning.includes('Insecure')) {
        issues.push({
          id: issueId,
          type: 'insecure_http',
          severity: 'warning',
          message: 'Insecure HTTP link detected (HTTPS recommended)',
          target: href,
          elementText: text,
          pageNumber,
          fixSuggestion: 'Upgrade link scheme to https://',
          element: anchor,
        });
      }
    });

    const totalLinks = anchors.length;
    const validLinks = totalLinks - issues.filter((i) => i.severity === 'error').length;

    return {
      totalLinks,
      validLinks: Math.max(0, validLinks),
      issues,
      scannedAt: new Date().toISOString(),
    };
  }

  /**
   * Automatically repairs an issue (e.g. upgrades HTTP to HTTPS or fixes protocol typos).
   */
  autoFixIssue(issue: ValidationIssue): boolean {
    if (!issue.element) return false;

    const anchor = issue.element as HTMLAnchorElement;

    if (issue.type === 'insecure_http') {
      const currentHref = anchor.getAttribute('href') || '';
      anchor.href = currentHref.replace(/^http:\/\//i, 'https://');
      return true;
    }

    if (issue.type === 'typo') {
      const currentHref = anchor.getAttribute('href') || '';
      anchor.href = currentHref.replace(/^htps?:\/\//i, 'https://');
      return true;
    }

    if (issue.type === 'empty_target' || issue.type === 'broken_internal') {
      // Unwrap anchor without deleting text
      const parent = anchor.parentNode;
      if (parent) {
        while (anchor.firstChild) {
          parent.insertBefore(anchor.firstChild, anchor);
        }
        parent.removeChild(anchor);
        parent.normalize();
        return true;
      }
    }

    return false;
  }
}

export const referenceValidationService = new ReferenceValidationService();
