/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: useReferenceValidation Hook
 * Description:
 * React hook for triggering document-wide link health checks,
 * tracking broken links, empty targets, and automated repairs.
 * --------------------------------------------------------
 */

import { useState, useCallback } from 'react';
import type { BrokenLinksReportData, ValidationIssue } from '../types';
import { referenceValidationService } from '../services/ReferenceValidationService';

export function useReferenceValidation() {
  const [report, setReport] = useState<BrokenLinksReportData>({
    totalLinks: 0,
    validLinks: 0,
    issues: [],
    scannedAt: new Date().toISOString(),
  });
  const [isValidating, setIsValidating] = useState(false);

  const runValidation = useCallback((container: HTMLElement | null): BrokenLinksReportData => {
    setIsValidating(true);
    try {
      const results = referenceValidationService.validateAllReferences(container);
      setReport(results);
      return results;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const autoFixIssue = useCallback((issue: ValidationIssue, container: HTMLElement | null): boolean => {
    const success = referenceValidationService.autoFixIssue(issue);
    if (success && container) {
      const refreshed = referenceValidationService.validateAllReferences(container);
      setReport(refreshed);
    }
    return success;
  }, []);

  return {
    report,
    isValidating,
    runValidation,
    autoFixIssue,
  };
}
