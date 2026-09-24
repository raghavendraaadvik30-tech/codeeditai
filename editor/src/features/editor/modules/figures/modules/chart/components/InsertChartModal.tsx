import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Check } from 'lucide-react';
import { CHART_TYPES } from '@/features/editor/modules/figures/modules/chart/constants';
import type { ChartType } from '@/features/editor/modules/figures/modules/chart/types';
import { ChartPreview } from './ChartPreviews';

interface InsertChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertChart: (type: ChartType) => void;
}

export const InsertChartModal: React.FC<InsertChartModalProps> = ({
  isOpen,
  onClose,
  onInsertChart,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ChartType>('column');

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter chart types based on search
  const filteredCharts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return CHART_TYPES;

    return CHART_TYPES.filter((chart) => {
      // 1. Direct name match (e.g. "line" -> "Line", "bar" -> "Bar" and "Horizontal Bar")
      if (chart.name.toLowerCase().includes(q)) return true;

      // 2. Keyword match (e.g. "bar" matches "Stacked Column" which has "bar" keyword)
      if (chart.keywords.some((k) => k.toLowerCase().includes(q))) return true;

      return false;
    });
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleConfirmInsert = () => {
    if (selectedType) {
      onInsertChart(selectedType);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="insert-chart-title"
    >
      {/* Centered Compact Modal Container */}
      <div
        className="relative flex flex-col w-full max-w-[850px] max-w-[calc(100vw-32px)] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden text-slate-800 dark:bg-[#111D29] dark:border-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2
            id="insert-chart-title"
            className="text-[20px] font-semibold text-slate-900 dark:text-white leading-tight"
          >
            Insert Chart
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="px-5 py-3 bg-white dark:bg-[#111D29] shrink-0 border-b border-slate-100/60 dark:border-slate-800/60">
          <div className="relative flex items-center w-full">
            <Search className="absolute left-3.5 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search charts..."
              className="w-full h-[44px] pl-10 pr-9 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:border-[#0078d4] focus:ring-2 focus:ring-[#0078d4]/15 dark:bg-[#0c1622] dark:border-slate-700 dark:text-white dark:focus:border-blue-400"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* CHART CARDS GRID (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0 bg-slate-50/40 dark:bg-[#0d1723]/40">
          {filteredCharts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-3 mb-2.5 bg-slate-100 rounded-full dark:bg-slate-800 text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-[15px] font-semibold text-slate-700 dark:text-slate-200">
                No charts found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for "column", "bar", "line", "pie", or "area".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {filteredCharts.map((chart) => {
                const isSelected = selectedType === chart.type;

                return (
                  <div
                    key={chart.type}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={0}
                    onClick={() => setSelectedType(chart.type)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedType(chart.type);
                      }
                    }}
                    className={`
                      group relative flex flex-col justify-between items-center rounded-xl p-3 min-h-[140px] max-h-[155px] border transition-all duration-200 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#0078d4]
                      ${isSelected
                        ? 'border-2 border-[#0078d4] bg-blue-50/50 shadow-xs dark:border-[#0078d4] dark:bg-blue-950/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs dark:border-slate-800 dark:bg-[#111D29] dark:hover:border-slate-700'
                      }
                    `}
                  >
                    {/* Selected Badge Checkmark */}
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 flex items-center justify-center w-4.5 h-4.5 rounded-full bg-[#0078d4] text-white shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}

                    {/* Chart Preview Container (Visually Centered) */}
                    <div className="flex-1 flex items-center justify-center w-full py-1 overflow-hidden">
                      <ChartPreview type={chart.type} className="w-full h-20 max-h-20 object-contain transition-transform duration-200" />
                    </div>

                    {/* Chart Name */}
                    <span
                      className={`mt-1.5 text-[14px] font-semibold text-center leading-tight transition-colors ${isSelected
                          ? 'text-[#0078d4] dark:text-blue-400'
                          : 'text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                        }`}
                    >
                      {chart.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3 bg-white border-t border-slate-100 dark:bg-[#111D29] dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleConfirmInsert}
            disabled={!selectedType}
            className="px-5 py-2 text-sm font-semibold text-white bg-[#0078d4] rounded-lg shadow-xs hover:bg-[#005a9e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
};
