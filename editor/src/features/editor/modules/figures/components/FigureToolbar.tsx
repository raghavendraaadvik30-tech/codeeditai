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
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-[#111D29]/95">
      {/* Alignment Group */}
      <div className="flex items-center rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => onAlignChange('left')}
          className={`rounded-md p-1.5 text-xs transition ${
            figure.alignment === 'left'
              ? 'bg-white font-semibold text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
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
              ? 'bg-white font-semibold text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
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
              ? 'bg-white font-semibold text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </button>
      </div>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />

      {/* Resize presets */}
      <button
        type="button"
        onClick={() => onResize(Math.max(200, figure.width - 100))}
        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        title="Decrease Width"
      >
        <Minimize2 className="h-4 w-4" />
      </button>
      <span className="text-xs font-medium text-slate-500 min-w-[45px] text-center">
        {figure.width}px
      </span>
      <button
        type="button"
        onClick={() => onResize(Math.min(1200, figure.width + 100))}
        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        title="Increase Width"
      >
        <Maximize2 className="h-4 w-4" />
      </button>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />

      {/* Caption Button */}
      <button
        type="button"
        onClick={onEditCaption}
        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Type className="h-3.5 w-3.5" />
        <span>Caption</span>
      </button>

      {/* Quick Insert into Document */}
      {onInsertIntoDoc && (
        <button
          type="button"
          onClick={onInsertIntoDoc}
          className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Insert</span>
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
          title="Delete Figure"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
