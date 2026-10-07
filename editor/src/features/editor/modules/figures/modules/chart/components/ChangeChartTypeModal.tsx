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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex flex-col w-full max-w-2xl bg-card rounded-xl shadow-2xl border border-secondary overflow-hidden text-foreground dark:bg-[#111D29] dark:border-muted dark:text-muted animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-secondary dark:border-muted">
          <div>
            <h2 className="text-base font-semibold text-foreground dark:text-primary-foreground">
              Change Chart Type
            </h2>
            <p className="text-xs text-muted0 dark:text-muted-foreground">
              Select a new visualization. Your existing data will be preserved.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-secondary-foreground hover:bg-muted"
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
                        ? 'border-primary bg-primary/50 shadow-sm ring-2 ring-primary/100/20'
                        : 'border-secondary bg-card hover:border-border hover:bg-muted'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}

                  <div className="flex items-center justify-center w-full h-16 mb-1.5 p-1 rounded bg-muted overflow-hidden">
                    <ChartPreview type={chart.type} className="w-full h-full" />
                  </div>

                  <span
                    className={`text-xs font-semibold ${
                      isSelected ? 'text-primary/90' : 'text-secondary-foreground'
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
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-muted border-t border-secondary">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-secondary-foreground bg-card border border-border rounded-lg hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectType(selectedType);
              onClose();
            }}
            className="px-5 py-2 text-xs font-semibold text-primary-foreground bg-[#0078d4] rounded-lg shadow-sm hover:bg-[#005a9e]"
          >
            Change Type
          </button>
        </div>
      </div>
    </div>
  );
};
