/**
 * --------------------------------------------------------
 * Module: Figures / Figure
 * Feature: Figure Toolbar Component
 * Description:
 * Floating action bar providing quick controls for alignment, captioning,
 * resizing presets, border options, and insertion into the active document.
 * --------------------------------------------------------
 */

import React from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Minimize2,
  Type,
  Trash2,
  PlusCircle,
} from 'lucide-react';
import type { FigureModel, FigureAlignment } from '../types';

interface FigureToolbarProps {
  figure: FigureModel;
  onAlignChange: (align: FigureAlignment) => void;
  onResize: (newWidth: number) => void;
  onEditCaption: () => void;
  onInsertIntoDoc?: () => void;
  onDelete?: () => void;
}

export const FigureToolbar: React.FC<FigureToolbarProps> = ({
  figure,
  onAlignChange,
  onResize,
  onEditCaption,
  onInsertIntoDoc,
  onDelete,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-secondary bg-card/95 p-1.5 shadow-lg backdrop-blur-md dark:border-muted dark:bg-[#111D29]/95">
      {/* Alignment Group */}
      <div className="flex items-center rounded-lg bg-muted p-0.5 dark:bg-muted">
        <button
          type="button"
          onClick={() => onAlignChange('left')}
          className={`rounded-md p-1.5 text-xs transition ${
            figure.alignment === 'left'
              ? 'bg-card font-semibold text-primary shadow-sm dark:bg-secondary-foreground dark:text-primary'
              : 'text-secondary-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-primary-foreground'
          }`}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onAlignChange('center')}
          className={`rounded-md p-1.5 text-xs transition ${
            figure.alignment === 'center'
              ? 'bg-card font-semibold text-primary shadow-sm dark:bg-secondary-foreground dark:text-primary'
              : 'text-secondary-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-primary-foreground'
          }`}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onAlignChange('right')}
          className={`rounded-md p-1.5 text-xs transition ${
            figure.alignment === 'right'
              ? 'bg-card font-semibold text-primary shadow-sm dark:bg-secondary-foreground dark:text-primary'
              : 'text-secondary-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-primary-foreground'
          }`}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </button>
      </div>

      <div className="h-4 w-[1px] bg-secondary dark:bg-secondary-foreground" />

      {/* Resize presets */}
      <button
        type="button"
        onClick={() => onResize(Math.max(200, figure.width - 100))}
        className="rounded-lg p-1.5 text-secondary-foreground hover:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
        title="Decrease Width"
      >
        <Minimize2 className="h-4 w-4" />
      </button>
      <span className="text-xs font-medium text-muted0 min-w-[45px] text-center">
        {figure.width}px
      </span>
      <button
        type="button"
        onClick={() => onResize(Math.min(1200, figure.width + 100))}
        className="rounded-lg p-1.5 text-secondary-foreground hover:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
        title="Increase Width"
      >
        <Maximize2 className="h-4 w-4" />
      </button>

      <div className="h-4 w-[1px] bg-secondary dark:bg-secondary-foreground" />

      {/* Caption Button */}
      <button
        type="button"
        onClick={onEditCaption}
        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
      >
        <Type className="h-3.5 w-3.5" />
        <span>Caption</span>
      </button>

      {/* Quick Insert into Document */}
      {onInsertIntoDoc && (
        <button
          type="button"
          onClick={onInsertIntoDoc}
          className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Insert</span>
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-1.5 text-destructive/100 hover:bg-destructive/10 dark:hover:bg-red-950/40"
          title="Delete Figure"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
