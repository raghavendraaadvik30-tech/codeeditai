/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: ReferenceValidation Component
 * Description:
 * Document integrity validation panel scanning hyperlinks, internal anchors,
 * and cross-references for broken destinations and insecure protocols.
 * --------------------------------------------------------
 */

import { useEffect } from 'react';
import { RefreshCw, CheckCircle2, AlertOctagon } from 'lucide-react';
import { useReferenceValidation } from '../../hooks/useReferenceValidation';

import { useEditor } from '@/features/editor/context/EditorContext';
import { BrokenLinksReport } from './BrokenLinksReport';
import type { ValidationIssue } from '../../types';

export function ReferenceValidation() {
  const { editorRef } = useEditor();
  const { report, isValidating, runValidation, autoFixIssue } = useReferenceValidation();

  useEffect(() => {
    if (editorRef.current) {
      runValidation(editorRef.current);
    }
  }, [editorRef, runValidation]);

  const handleScan = () => {
    if (editorRef.current) {
      runValidation(editorRef.current);
    }
  };

  const handleFix = (issue: ValidationIssue) => {
    autoFixIssue(issue, editorRef.current);
  };

  const handleNavigate = (issue: ValidationIssue) => {
    if (issue.element) {
      issue.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      issue.element.style.transition = 'all 0.3s ease';
      issue.element.style.backgroundColor = '#fecaca'; // Red-200
      issue.element.style.outline = '2px solid #ef4444';
      setTimeout(() => {
        issue.element!.style.transition = 'all 0.8s ease';
        issue.element!.style.backgroundColor = '';
        issue.element!.style.outline = '';
      }, 2000);
    }
  };

  const errorCount = report.issues.filter((i) => i.severity === 'error').length;
  const warningCount = report.issues.filter((i) => i.severity === 'warning').length;

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider dark:text-muted-foreground">
          Reference Health & Validation
        </span>
        <button
          type="button"
          onClick={handleScan}
          disabled={isValidating}
          title="Run health check"
          className="flex h-6 items-center gap-1 rounded bg-brand px-2 text-[11px] font-semibold text-primary-foreground hover:bg-brand-deep disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-3 w-3 ${isValidating ? 'animate-spin' : ''}`} />
          {isValidating ? 'Scanning...' : 'Scan Now'}
        </button>
      </div>

      {/* Summary Score Card */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-secondary bg-card p-2 text-center dark:border-muted dark:bg-[#091524]">
          <p className="text-[10px] text-muted-foreground font-medium">Total Links</p>
          <p className="text-sm font-bold text-foreground dark:text-primary-foreground mt-0.5">
            {report.totalLinks}
          </p>
        </div>

        <div className="rounded-lg border border-secondary bg-card p-2 text-center dark:border-muted dark:bg-[#091524]">
          <p className="text-[10px] text-success-500 font-medium flex items-center justify-center gap-0.5">
            <CheckCircle2 className="h-3 w-3" /> Valid
          </p>
          <p className="text-sm font-bold text-success-600 dark:text-success-400 mt-0.5">
            {report.validLinks}
          </p>
        </div>

        <div className="rounded-lg border border-secondary bg-card p-2 text-center dark:border-muted dark:bg-[#091524]">
          <p className="text-[10px] text-destructive font-medium flex items-center justify-center gap-0.5">
            <AlertOctagon className="h-3 w-3" /> Issues
          </p>
          <p className="text-sm font-bold text-destructive dark:text-destructive mt-0.5">
            {errorCount + warningCount}
          </p>
        </div>
      </div>

      {/* Issues Report */}
      <BrokenLinksReport
        issues={report.issues}
        onAutoFix={handleFix}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
