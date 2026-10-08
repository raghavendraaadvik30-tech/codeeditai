import React from 'react';
import { X, Check } from 'lucide-react';
import { COLOR_SCHEMES } from '@/features/editor/modules/figures/modules/chart/constants';

interface ChangeChartColorModalProps {
  isOpen: boolean;
  activeSchemeId?: string;
  onClose: () => void;
  onSelectScheme: (schemeId: string) => void;
}

export const ChangeChartColorModal: React.FC<ChangeChartColorModalProps> = ({
  isOpen,
  activeSchemeId,
  onClose,
  onSelectScheme,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex flex-col w-full max-w-md bg-card rounded-xl shadow-2xl border border-secondary overflow-hidden text-foreground dark:bg-[#111D29] dark:border-muted dark:text-muted animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-secondary dark:border-muted">
          <div>
            <h2 className="text-base font-semibold text-foreground dark:text-primary-foreground">
              Color Palette
            </h2>
            <p className="text-xs text-muted0 dark:text-muted-foreground">
              Select a color theme for the active chart.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-secondary-foreground hover:bg-muted dark:hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Color Palette List */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
          {COLOR_SCHEMES.map((scheme) => {
            const isSelected = activeSchemeId === scheme.id;

            return (
              <button
                key={scheme.id}
                type="button"
                onClick={() => {
                  onSelectScheme(scheme.id);
                  onClose();
                }}
                className={`
                  flex w-full items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer select-none
                  ${
                    isSelected
                      ? 'border-primary bg-primary/50 dark:bg-navy-950/30 shadow-xs ring-2 ring-primary/20'
                      : 'border-secondary bg-card hover:border-border hover:bg-muted dark:bg-[#162534] dark:border-secondary-foreground dark:hover:bg-muted'
                  }
                `}
              >
                <div className="space-y-1.5 flex-1 mr-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground dark:text-muted-foreground">
                      {scheme.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {scheme.colors.map((color, idx) => (
                      <span
                        key={idx}
                        className="w-5 h-5 rounded-full border border-foreground/10 shadow-2xs shrink-0"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {isSelected && (
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground shrink-0 shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 bg-muted border-t border-secondary dark:bg-[#0d1620] dark:border-muted">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-secondary-foreground bg-card border border-border rounded-lg hover:bg-muted dark:bg-muted dark:text-muted-foreground dark:border-secondary-foreground cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
