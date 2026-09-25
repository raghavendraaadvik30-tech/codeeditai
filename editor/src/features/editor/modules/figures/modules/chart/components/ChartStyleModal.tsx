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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex flex-col w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 dark:bg-[#111D29] dark:border-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Chart Styles
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a visual layout style for your chart.
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
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 shadow-sm ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:bg-[#162534] dark:border-slate-700 dark:hover:bg-slate-800'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white shadow-xs z-10">
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
                      <div className="w-3 h-8 bg-blue-500 rounded-t-xs" />
                      <div className="w-3 h-11 bg-emerald-500 rounded-t-xs" />
                      <div className="w-3 h-6 bg-amber-500 rounded-t-xs" />
                      <div className="w-3 h-9 bg-indigo-500 rounded-t-xs" />
                    </div>
                  </div>

                  <span
                    className={`text-xs font-semibold ${
                      isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {style.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {style.description}
                  </span>
                </button>
              );
            })}
          </div>
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
