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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex flex-col w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 dark:bg-[#111D29] dark:border-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Color Palette
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a color theme for the active chart.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:bg-[#162534] dark:border-slate-700 dark:hover:bg-slate-800'
                  }
                `}
              >
                <div className="space-y-1.5 flex-1 mr-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {scheme.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {scheme.colors.map((color, idx) => (
                      <span
                        key={idx}
                        className="w-5 h-5 rounded-full border border-black/10 shadow-2xs shrink-0"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {isSelected && (
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white shrink-0 shadow-xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200 dark:bg-[#0d1620] dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
