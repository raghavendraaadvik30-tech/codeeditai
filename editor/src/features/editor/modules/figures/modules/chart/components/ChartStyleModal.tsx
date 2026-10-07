import React from 'react';
import { X, Check } from 'lucide-react';
import { CHART_STYLES } from '@/features/editor/modules/figures/modules/chart/constants';

interface ChartStyleModalProps {
  isOpen: boolean;
  activeStyleId?: string;
  onClose: () => void;
  onSelectStyle: (styleId: string) => void;
}

export const ChartStyleModal: React.FC<ChartStyleModalProps> = ({
  isOpen,
  activeStyleId,
  onClose,
  onSelectStyle,
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
        className="relative flex flex-col w-full max-w-lg bg-card rounded-xl shadow-2xl border border-secondary overflow-hidden text-foreground dark:bg-[#111D29] dark:border-muted dark:text-muted animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-secondary dark:border-muted">
          <div>
            <h2 className="text-base font-semibold text-foreground dark:text-primary-foreground">
              Chart Styles
            </h2>
            <p className="text-xs text-muted0 dark:text-muted-foreground">
              Select a visual layout style for your chart.
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

        {/* Styles Grid */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {CHART_STYLES.map((style) => {
              const isSelected = activeStyleId === style.id;

              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => {
                    onSelectStyle(style.id);
                    onClose();
                  }}
                  className={`
                    group relative flex flex-col items-center rounded-xl p-3 border transition-all text-center cursor-pointer select-none
                    ${
                      isSelected
                        ? 'border-primary bg-primary/50 dark:bg-blue-950/30 shadow-sm ring-2 ring-primary/100/20'
                        : 'border-secondary bg-card hover:border-border hover:bg-muted dark:bg-[#162534] dark:border-secondary-foreground dark:hover:bg-muted'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground shadow-xs z-10">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}

                  {/* Visual Preview Box */}
                  <div
                    className="flex flex-col items-center justify-center w-full h-24 mb-2 rounded-lg border p-2 overflow-hidden transition-transform group-hover:scale-[1.02]"
                    style={{
                      backgroundColor: style.previewBg,
                      borderColor: style.borderColor,
                    }}
                  >
                    <div className="flex items-end gap-1.5 h-12 w-full justify-center px-2">
                      <div className="w-3 h-8 bg-primary/100 rounded-t-xs" />
                      <div className="w-3 h-11 bg-emerald-500 rounded-t-xs" />
                      <div className="w-3 h-6 bg-amber-500 rounded-t-xs" />
                      <div className="w-3 h-9 bg-primary/100 rounded-t-xs" />
                    </div>
                  </div>

                  <span
                    className={`text-xs font-semibold ${
                      isSelected ? 'text-primary/90 dark:text-primary' : 'text-secondary-foreground dark:text-muted-foreground'
                    }`}
                  >
                    {style.name}
                  </span>
                  <span className="text-[10px] text-muted0 dark:text-muted-foreground line-clamp-1 mt-0.5">
                    {style.description}
                  </span>
                </button>
              );
            })}
          </div>
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
