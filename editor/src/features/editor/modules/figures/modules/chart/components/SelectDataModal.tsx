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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative flex flex-col w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Select Data Source</h2>
            <p className="text-xs text-slate-500">Configure chart legend series and categories</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
          {/* Legend Entries (Series) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-700">Legend Entries (Series)</span>
              <button
                type="button"
                onClick={handleAddSeries}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-3 h-3" />
                <span>Add Series</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-36 overflow-y-auto">
              {seriesList.map((s, idx) => (
                <div key={s.id} className="flex items-center justify-between p-2 hover:bg-slate-50">
                  <div className="flex items-center gap-2 flex-1">
                    <span
                      className="w-3 h-3 rounded-xs shrink-0"
                      style={{ backgroundColor: s.color || '#2563eb' }}
                    />
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => handleRenameSeries(idx, e.target.value)}
                      className="w-full h-6 px-1.5 border border-slate-200 rounded text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                  {seriesList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSeries(idx)}
                      className="ml-2 text-slate-400 hover:text-red-500"
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
            <span className="block font-semibold text-slate-700 mb-1.5">
              Horizontal (Category) Axis Labels
            </span>
            <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 max-h-32 overflow-y-auto">
              <div className="grid grid-cols-2 gap-1.5">
                {categoriesList.map((cat, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={cat}
                    onChange={(e) => handleRenameCategory(idx, e.target.value)}
                    className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 text-xs font-medium outline-none focus:border-blue-500"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1 px-4 py-1.5 text-xs font-semibold text-white bg-[#0078d4] rounded hover:bg-[#005a9e]"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
};
