import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { CHART_TYPES } from '@/features/editor/modules/figures/modules/chart/constants';
import type { ChartType } from '@/features/editor/modules/figures/modules/chart/types';
import { ChartPreview } from './ChartPreviews';

interface ChangeChartTypeModalProps {
  isOpen: boolean;
  currentType: ChartType;
  onClose: () => void;
  onSelectType: (type: ChartType) => void;
}

export const ChangeChartTypeModal: React.FC<ChangeChartTypeModalProps> = ({
  isOpen,
  currentType,
  onClose,
  onSelectType,
}) => {
  const [selectedType, setSelectedType] = useState<ChartType>(currentType);

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
        className="relative flex flex-col w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 dark:bg-[#111D29] dark:border-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Change Chart Type
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a new visualization. Your existing data will be preserved.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chart Cards */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {CHART_TYPES.map((chart) => {
              const isSelected = selectedType === chart.type;

              return (
                <button
                  key={chart.type}
                  type="button"
                  onClick={() => setSelectedType(chart.type)}
                  className={`
                    group relative flex flex-col items-center rounded-xl p-2.5 border transition-all text-center cursor-pointer select-none
                    ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}

                  <div className="flex items-center justify-center w-full h-16 mb-1.5 p-1 rounded bg-slate-50 overflow-hidden">
                    <ChartPreview type={chart.type} className="w-full h-full" />
                  </div>

                  <span
                    className={`text-xs font-semibold ${
                      isSelected ? 'text-blue-700' : 'text-slate-700'
                    }`}
                  >
                    {chart.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectType(selectedType);
              onClose();
            }}
            className="px-5 py-2 text-xs font-semibold text-white bg-[#0078d4] rounded-lg shadow-sm hover:bg-[#005a9e]"
          >
            Change Type
          </button>
        </div>
      </div>
    </div>
  );
};
