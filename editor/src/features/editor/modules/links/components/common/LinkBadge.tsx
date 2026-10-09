/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: LinkBadge Common Component
 * Description:
 * Color-coded visual status or category badge for link types and validation status.
 * --------------------------------------------------------
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { LinkType, ValidationSeverity } from '../../types';

export interface LinkBadgeProps {
  type?: LinkType;
  severity?: ValidationSeverity;
  label?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function LinkBadge({ type, severity, label, className, icon }: LinkBadgeProps) {
  let badgeStyles = 'bg-muted text-secondary-foreground dark:bg-muted dark:text-muted-foreground';
  let defaultLabel = label;

  if (severity === 'error') {
    badgeStyles = 'bg-destructive/10 text-destructive dark:bg-destructive/60 dark:text-destructive border border-destructive/20 dark:border-destructive/50';
    defaultLabel = defaultLabel || 'Error';
  } else if (severity === 'warning') {
    badgeStyles = 'bg-warning-100 text-warning-800 dark:bg-warning-950/60 dark:text-warning-400 border border-warning-200 dark:border-warning-900/50';
    defaultLabel = defaultLabel || 'Warning';
  } else if (severity === 'info') {
    badgeStyles = 'bg-primary/15 text-primary/90 dark:bg-navy-950/60 dark:text-primary border border-primary/30 dark:border-navy-900/50';
    defaultLabel = defaultLabel || 'Info';
  } else if (type === 'external') {
    badgeStyles = 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400 border border-sky-200/60';
    defaultLabel = defaultLabel || 'Web Link';
  } else if (type === 'internal') {
    badgeStyles = 'bg-primary/10 text-primary/90 dark:bg-primary/50 dark:text-primary border border-primary/60';
    defaultLabel = defaultLabel || 'Internal Ref';
  } else if (type === 'bookmark') {
    badgeStyles = 'bg-warning-50 text-warning-700 dark:bg-warning-950/50 dark:text-warning-400 border border-warning-200/60';
    defaultLabel = defaultLabel || 'Bookmark';
  } else if (type === 'cross_ref') {
    badgeStyles = 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400 border border-purple-200/60';
    defaultLabel = defaultLabel || 'Cross-Ref';
  } else if (type === 'email') {
    badgeStyles = 'bg-success-50 text-success-700 dark:bg-success-950/50 dark:text-success-400 border border-success-200/60';
    defaultLabel = defaultLabel || 'Email';
  } else if (type === 'citation') {
    badgeStyles = 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400 border border-teal-200/60';
    defaultLabel = defaultLabel || 'Citation';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-10px font-semibold select-none',
        badgeStyles,
        className
      )}
    >
      {icon && <span className="h-3 w-3 shrink-0">{icon}</span>}
      {defaultLabel}
    </span>
  );
}
