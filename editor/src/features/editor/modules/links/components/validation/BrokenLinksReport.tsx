/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: BrokenLinksReport Component
 * Description:
 * Detailed inspection report of broken references, protocol typos,
 * and empty targets with one-click repair actions.
 * --------------------------------------------------------
 */

import { AlertTriangle, AlertCircle, Info, Wrench, ExternalLink } from 'lucide-react';
import type { ValidationIssue } from '../../types';
import { LinkBadge } from '../common/LinkBadge';

export interface BrokenLinksReportProps {
  issues: ValidationIssue[];
  onAutoFix?: (issue: ValidationIssue) => void;
  onNavigate?: (issue: ValidationIssue) => void;
}

export function BrokenLinksReport({ issues, onAutoFix, onNavigate }: BrokenLinksReportProps) {
  if (issues.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-center dark:border-emerald-950/60 dark:bg-emerald-950/20">
        <div className="flex h-8 w-8 mx-auto items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 mb-2">
          ✓
        </div>
        <h4 className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          All References Valid
        </h4>
        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
          No broken links, invalid targets, or protocol security issues found.
        </p>
      </div>
    );
  }

  const getSeverityIcon = (severity: string) => {
    if (severity === 'error') return <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />;
    if (severity === 'warning') return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
    return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
  };

  return (
    <div className="space-y-2 max-h-[340px] overflow-y-auto pr-0.5">
      {issues.map((issue) => (
        <div
          key={issue.id}
          className="rounded-lg border border-slate-200 bg-white p-2.5 space-y-1.5 dark:border-slate-800 dark:bg-[#091524]"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              {getSeverityIcon(issue.severity)}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                  {issue.message}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  Target: {issue.target} {issue.pageNumber && `· Page ${issue.pageNumber}`}
                </p>
              </div>
            </div>
            <LinkBadge severity={issue.severity} />
          </div>

          {issue.fixSuggestion && (
            <div className="rounded bg-slate-50 p-1.5 text-[10px] text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 flex items-center justify-between gap-2">
              <span className="truncate">💡 {issue.fixSuggestion}</span>
              {onAutoFix && (
                <button
                  type="button"
                  onClick={() => onAutoFix(issue)}
                  className="flex items-center gap-1 rounded bg-[#0078d4] px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-[#005a9e] shrink-0"
                >
                  <Wrench className="h-2.5 w-2.5" /> Fix
                </button>
              )}
            </div>
          )}

          {onNavigate && issue.element && (
            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={() => onNavigate(issue)}
                className="flex items-center gap-1 text-[10px] font-semibold text-[#0078d4] hover:underline"
              >
                <ExternalLink className="h-2.5 w-2.5" /> Locate in document
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
