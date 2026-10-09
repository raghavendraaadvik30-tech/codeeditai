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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-secondary bg-card p-6 shadow-2xl dark:border-muted dark:bg-[#111D29]">
        <div className="flex items-center justify-between pb-4 border-b border-muted dark:border-muted">
          <h3 className="text-base font-semibold text-foreground dark:text-primary-foreground">
            Edit Figure Caption & Accessibility
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-secondary-foreground dark:hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary-foreground dark:text-muted-foreground">
              Figure Caption
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Figure 1: System Architecture Diagram overviewing the backend pipeline."
              className="mt-1 w-full rounded-xl border border-secondary bg-muted p-3 text-xs outline-none focus:border-primary focus:bg-card dark:border-secondary-foreground dark:bg-secondary dark:text-primary-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary-foreground dark:text-muted-foreground">
              Alt Text (Screen Readers)
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Brief description of the image content for accessibility"
              className="mt-1 w-full rounded-xl border border-secondary bg-muted p-2.5 text-xs outline-none focus:border-primary focus:bg-card dark:border-secondary-foreground dark:bg-secondary dark:text-primary-foreground"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-secondary px-4 py-2 text-xs font-medium text-secondary-foreground hover:bg-muted dark:border-secondary-foreground dark:text-muted-foreground dark:hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
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
