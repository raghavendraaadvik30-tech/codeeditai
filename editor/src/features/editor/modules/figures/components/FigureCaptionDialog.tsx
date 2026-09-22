/**
 * --------------------------------------------------------
 * Module: Figures / Figure
 * Feature: Figure Caption & Alt Text Dialog
 * Description:
 * Modal dialog component for editing figure caption labels, descriptive alt text,
 * and accessibility metadata.
 * --------------------------------------------------------
 */

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { FigureModel } from '../types';

interface FigureCaptionDialogProps {
  figure: FigureModel;
  isOpen: boolean;
  onClose: () => void;
  onSave: (caption: string, altText: string) => void;
}

export const FigureCaptionDialog: React.FC<FigureCaptionDialogProps> = ({
  figure,
  isOpen,
  onClose,
  onSave,
}) => {
  const [caption, setCaption] = useState(figure.caption || '');
  const [altText, setAltText] = useState(figure.altText || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(caption, altText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#111D29]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Edit Figure Caption & Accessibility
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Figure Caption
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Figure 1: System Architecture Diagram overviewing the backend pipeline."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Alt Text (Screen Readers)
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Brief description of the image content for accessibility"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-700"
            >
              <Check className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
