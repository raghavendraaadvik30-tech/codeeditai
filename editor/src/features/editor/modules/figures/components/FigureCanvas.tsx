/**
 * --------------------------------------------------------
 * Module: Figures / Figure
 * Feature: Figure Canvas Preview Component
 * Description:
 * Rendering canvas displaying active figure preview with border, aspect ratios,
 * box-shadow, alignment containers, and interactive caption overlay.
 * --------------------------------------------------------
 */

import React from 'react';
import type { FigureModel } from '../types';
import { cn } from '@/lib/utils';

interface FigureCanvasProps {
  figure: FigureModel;
  onSelect?: () => void;
  isSelected?: boolean;
}

export const FigureCanvas: React.FC<FigureCanvasProps> = ({
  figure,
  onSelect,
  isSelected = false,
}) => {
  const alignmentClass =
    figure.alignment === 'center'
      ? 'flex flex-col items-center justify-center text-center'
      : figure.alignment === 'right'
      ? 'flex flex-col items-end text-right'
      : 'flex flex-col items-start text-left';

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group relative my-4 w-full cursor-pointer rounded-xl p-4 transition-all duration-200',
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50',
        alignmentClass
      )}
    >
      <div
        className="relative overflow-hidden transition-all duration-300"
        style={{
          width: `${figure.width}px`,
          maxWidth: '100%',
          height: figure.height ? `${figure.height}px` : 'auto',
          borderWidth: `${figure.borderWidth}px`,
          borderColor: figure.borderColor,
          borderRadius: `${figure.borderRadius}px`,
          boxShadow: figure.shadow ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' : 'none',
        }}
      >
        <img
          src={figure.src}
          alt={figure.altText || figure.title}
          className="h-full w-full object-contain"
          style={{ objectFit: figure.fitMode }}
        />
      </div>

      {figure.caption && (
        <figcaption className="mt-3 max-w-lg text-xs font-medium italic text-slate-600 dark:text-slate-400">
          {figure.caption}
        </figcaption>
      )}
    </div>
  );
};
