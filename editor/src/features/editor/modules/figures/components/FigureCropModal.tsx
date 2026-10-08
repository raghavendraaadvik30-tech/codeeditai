/**
 * --------------------------------------------------------
 * Module: Figures / Figure
 * Feature: Figure Image Cropping & Scaling Modal
 * Description:
 * Modal container allowing interactive cropping, scale adjustment, and aspect ratio locks.
 * --------------------------------------------------------
 */

import React, { useState } from 'react';
import { X, Crop, Check, RotateCcw } from 'lucide-react';
import type { FigureModel } from '../types';

interface FigureCropModalProps {
  figure: FigureModel;
  isOpen: boolean;
  onClose: () => void;
  onApplyCrop: (croppedWidth: number, croppedHeight?: number) => void;
}

export const FigureCropModal: React.FC<FigureCropModalProps> = ({
  figure,
  isOpen,
  onClose,
  onApplyCrop,
}) => {
  const [scale, setScale] = useState(100);
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');

  if (!isOpen) return null;

  const handleApply = () => {
    const newWidth = Math.round((figure.width * scale) / 100);
    onApplyCrop(newWidth);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-secondary bg-card p-6 shadow-2xl dark:border-muted dark:bg-[#111D29]">
        <div className="flex items-center justify-between pb-4 border-b border-muted dark:border-muted">
          <div className="flex items-center gap-2">
            <Crop className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground dark:text-primary-foreground">
              Crop & Scale Figure
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted dark:hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Image Preview Box */}
        <div className="mt-4 flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted p-2 dark:border-secondary-foreground dark:bg-secondary">
          <img
            src={figure.src}
            alt={figure.altText || figure.title}
            className="h-full max-w-full object-contain transition-all"
            style={{ transform: `scale(${scale / 100})` }}
          />
        </div>

        {/* Adjustments */}
        <div className="mt-4 space-y-3">
          <div>
            <div className="flex justify-between text-xs font-medium text-secondary-foreground dark:text-muted-foreground">
              <span>Scale Zoom</span>
              <span>{scale}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={200}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="mt-1.5 w-full accent-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary-foreground dark:text-muted-foreground">
              Aspect Ratio Preset
            </label>
            <div className="mt-1 flex gap-2">
              {['16:9', '4:3', '1:1', 'Free'].map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-medium transition ${
                    aspectRatio === ratio
                      ? 'border-primary bg-primary/10 text-primary dark:bg-blue-950/50 dark:text-primary'
                      : 'border-secondary text-secondary-foreground hover:bg-muted dark:border-secondary-foreground dark:text-muted-foreground dark:hover:bg-muted'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-6">
          <button
            type="button"
            onClick={() => setScale(100)}
            className="flex items-center gap-1 text-xs text-muted0 hover:text-foreground dark:hover:text-primary-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-secondary px-4 py-2 text-xs font-medium text-secondary-foreground hover:bg-muted dark:border-secondary-foreground dark:text-muted-foreground dark:hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
            >
              <Check className="h-4 w-4" />
              <span>Apply Crop</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
