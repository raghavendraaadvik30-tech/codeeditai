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
    primary: 'bg-[#0078d4] text-primary-foreground hover:bg-[#005a9e] dark:bg-[#0078d4] dark:hover:bg-[#005a9e]',
    secondary: 'bg-muted text-secondary-foreground hover:bg-secondary dark:bg-muted dark:text-muted-foreground dark:hover:bg-secondary-foreground',
    outline: 'border border-secondary bg-card text-secondary-foreground hover:bg-muted dark:border-secondary-foreground dark:bg-[#111D29] dark:text-muted-foreground dark:hover:bg-muted',
    danger: 'bg-destructive/10 text-destructive hover:bg-destructive/10 dark:bg-destructive/40 dark:text-destructive dark:hover:bg-destructive/60',
    ghost: 'text-secondary-foreground hover:bg-muted dark:text-muted-foreground dark:hover:bg-muted',
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
