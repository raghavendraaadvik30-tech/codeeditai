/**
 * --------------------------------------------------------
 * Module: Figures / Figure
 * Feature: Figure Settings & Styling Panel Component
 * Description:
 * Detailed sidebar/accordion settings panel for adjusting figure borders,
 * shadows, aspect ratios, fit modes, and dimensions.
 * --------------------------------------------------------
 */

import React from 'react';
import type { FigureModel, FigureFitMode, FigureAlignment } from '../types';

interface FigureSettingsProps {
  figure: FigureModel;
  onUpdate: (updates: Partial<FigureModel>) => void;
}

export const FigureSettings: React.FC<FigureSettingsProps> = ({
  figure,
  onUpdate,
}) => {
  return (
    <div className="space-y-4 rounded-xl border border-secondary bg-card p-4 dark:border-muted dark:bg-[#111D29]">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Figure Appearance Settings
      </h4>

      {/* Alignment */}
      <div>
        <label className="block text-xs font-medium text-secondary-foreground dark:text-muted-foreground">
          Alignment Mode
        </label>
        <select
          value={figure.alignment}
          onChange={(e) => onUpdate({ alignment: e.target.value as FigureAlignment })}
          className="mt-1 w-full rounded-lg border border-secondary bg-muted p-2 text-xs outline-none focus:border-primary dark:border-secondary-foreground dark:bg-secondary dark:text-primary-foreground"
        >
          <option value="left">Left Aligned</option>
          <option value="center">Center Aligned</option>
          <option value="right">Right Aligned</option>
          <option value="inline">Inline with Text</option>
          <option value="wrap">Wrap Text Around</option>
        </select>
      </div>

      {/* Image Fit Mode */}
      <div>
        <label className="block text-xs font-medium text-secondary-foreground dark:text-muted-foreground">
          Object Fit Mode
        </label>
        <select
          value={figure.fitMode}
          onChange={(e) => onUpdate({ fitMode: e.target.value as FigureFitMode })}
          className="mt-1 w-full rounded-lg border border-secondary bg-muted p-2 text-xs outline-none focus:border-primary dark:border-secondary-foreground dark:bg-secondary dark:text-primary-foreground"
        >
          <option value="contain">Contain (Keep Proportion)</option>
          <option value="cover">Cover (Fill Container)</option>
          <option value="fill">Fill (Stretch)</option>
          <option value="none">None (Original Size)</option>
        </select>
      </div>

      {/* Width Slider */}
      <div>
        <div className="flex justify-between text-xs font-medium text-secondary-foreground dark:text-muted-foreground">
          <span>Display Width</span>
          <span>{figure.width}px</span>
        </div>
        <input
          type="range"
          min={100}
          max={1200}
          step={10}
          value={figure.width}
          onChange={(e) => onUpdate({ width: Number(e.target.value) })}
          className="mt-1.5 w-full accent-primary"
        />
      </div>

      {/* Border Radius Slider */}
      <div>
        <div className="flex justify-between text-xs font-medium text-secondary-foreground dark:text-muted-foreground">
          <span>Border Radius</span>
          <span>{figure.borderRadius}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={32}
          value={figure.borderRadius}
          onChange={(e) => onUpdate({ borderRadius: Number(e.target.value) })}
          className="mt-1.5 w-full accent-primary"
        />
      </div>

      {/* Border Width Slider */}
      <div>
        <div className="flex justify-between text-xs font-medium text-secondary-foreground dark:text-muted-foreground">
          <span>Border Width</span>
          <span>{figure.borderWidth}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          value={figure.borderWidth}
          onChange={(e) => onUpdate({ borderWidth: Number(e.target.value) })}
          className="mt-1.5 w-full accent-primary"
        />
      </div>

      {/* Border Color */}
      {figure.borderWidth > 0 && (
        <div>
          <label className="block text-xs font-medium text-secondary-foreground dark:text-muted-foreground">
            Border Color
          </label>
          <input
            type="color"
            value={figure.borderColor}
            onChange={(e) => onUpdate({ borderColor: e.target.value })}
            className="mt-1 h-8 w-full cursor-pointer rounded-lg border border-secondary bg-muted p-1 dark:border-secondary-foreground dark:bg-secondary"
          />
        </div>
      )}

      {/* Drop Shadow Toggle */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-medium text-secondary-foreground dark:text-muted-foreground">
          Enable Drop Shadow
        </span>
        <button
          type="button"
          onClick={() => onUpdate({ shadow: !figure.shadow })}
          className={`h-5 w-9 rounded-full transition ${
            figure.shadow ? 'bg-primary' : 'bg-secondary dark:bg-secondary-foreground'
          }`}
        >
          <span
            className={`block h-4 w-4 rounded-full bg-card transition-transform ${
              figure.shadow ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
