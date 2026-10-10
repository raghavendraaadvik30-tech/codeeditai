import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import type { ChartModel, ChartSeries } from '@/features/editor/modules/figures/modules/chart/types';

interface SelectDataModalProps {
  isOpen: boolean;
  chart: ChartModel;
  onClose: () => void;
  onUpdateChart: (updated: ChartModel) => void;
}

export const SelectDataModal: React.FC<SelectDataModalProps> = ({
  isOpen,
  chart,
  onClose,
  onUpdateChart,
}) => {
  const [seriesList, setSeriesList] = useState<ChartSeries[]>(chart.series);
  const [categoriesList, setCategoriesList] = useState<string[]>(chart.categories);

  if (!isOpen) return null;

  const handleRenameSeries = (idx: number, name: string) => {
    const next = [...seriesList];
    next[idx] = { ...next[idx], name };
    setSeriesList(next);
  };

  const handleAddSeries = () => {
    const newIdx = seriesList.length + 1;
    const newS: ChartSeries = {
      id: `s-${Date.now()}`,
      name: `Series ${newIdx}`,
      color: '#3b82f6',
      values: categoriesList.map(() => 3.0),
    };
    setSeriesList([...seriesList, newS]);
  };

  const handleRemoveSeries = (idx: number) => {
    if (seriesList.length <= 1) return;
    setSeriesList(seriesList.filter((_, i) => i !== idx));
  };

  const handleRenameCategory = (idx: number, name: string) => {
    const next = [...categoriesList];
    next[idx] = name;
    setCategoriesList(next);
  };

  const handleSave = () => {
    onUpdateChart({
      ...chart,
      series: seriesList,
      categories: categoriesList,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

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
        className="relative flex flex-col w-full max-w-md bg-card rounded-xl shadow-2xl border border-secondary overflow-hidden text-foreground animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-secondary">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Select Data Source</h2>
            <p className="text-xs text-muted-foreground">Configure chart legend series and categories</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-secondary-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
          {/* Legend Entries (Series) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-secondary-foreground">Legend Entries (Series)</span>
              <button
                type="button"
                onClick={handleAddSeries}
                className="flex items-center gap-1 text-11px font-semibold text-primary hover:text-primary/90"
              >
                <Plus className="w-3 h-3" />
                <span>Add Series</span>
              </button>
            </div>

            <div className="border border-secondary rounded-lg divide-y divide-muted max-h-36 overflow-y-auto">
              {seriesList.map((s, idx) => (
                <div key={s.id} className="flex items-center justify-between p-2 hover:bg-muted">
                  <div className="flex items-center gap-2 flex-1">
                    <span
                      className="w-3 h-3 rounded-xs shrink-0"
                      style={{ backgroundColor: s.color || '#2563eb' }}
                    />
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => handleRenameSeries(idx, e.target.value)}
                      className="w-full h-6 px-1.5 border border-secondary rounded text-xs outline-none focus:border-primary"
                    />
                  </div>
                  {seriesList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSeries(idx)}
                      className="ml-2 text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Horizontal Axis Labels (Categories) */}
          <div>
            <span className="block font-semibold text-secondary-foreground mb-1.5">
              Horizontal (Category) Axis Labels
            </span>
            <div className="border border-secondary rounded-lg p-2 bg-muted max-h-32 overflow-y-auto">
              <div className="grid grid-cols-2 gap-1.5">
                {categoriesList.map((cat, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={cat}
                    onChange={(e) => handleRenameCategory(idx, e.target.value)}
                    className="px-2 py-1 bg-card border border-secondary rounded text-secondary-foreground text-xs font-medium outline-none focus:border-primary"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 bg-muted border-t border-secondary">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-secondary-foreground bg-card border border-border rounded hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1 px-4 py-1.5 text-xs font-semibold text-button-primary-foreground bg-button-primary rounded hover:bg-button-primary-hover active:bg-button-primary-active"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
};
