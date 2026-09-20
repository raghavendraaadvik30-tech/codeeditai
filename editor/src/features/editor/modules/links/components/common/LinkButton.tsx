/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: LinkButton Common Component
 * Description:
 * Reusable action button styled with Paraxel design tokens.
 * --------------------------------------------------------
 */

import React from 'react';
import { cn } from '@/lib/utils';

export interface LinkButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export function LinkButton({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  className,
  ...props
}: LinkButtonProps) {
  const variantStyles = {
    primary: 'bg-[#0078d4] text-white hover:bg-[#005a9e] dark:bg-[#0078d4] dark:hover:bg-[#005a9e]',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
    outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-[#111D29] dark:text-slate-200 dark:hover:bg-slate-800',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60',
    ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  };

  const sizeStyles = {
    sm: 'h-7 px-2.5 text-xs gap-1.5 rounded-md font-medium',
    md: 'h-8.5 px-3 text-xs gap-2 rounded-lg font-semibold',
    lg: 'h-10 px-4 text-sm gap-2.5 rounded-lg font-semibold',
  };

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
