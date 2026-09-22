import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, Plus, Trash2, FileSpreadsheet, Check, BarChart2, Eraser } from 'lucide-react';
import type { ChartModel, ChartSeries } from '@/features/editor/modules/figures/modules/chart/types';
import { COLOR_SCHEMES } from '@/features/editor/modules/figures/modules/chart/constants';

interface ChartSpreadsheetEditorProps {
  chart: ChartModel;
  onUpdateChart: (updated: ChartModel) => void;
  onClose: () => void;
  onOpenChangeType?: () => void;
}

export const ChartSpreadsheetEditor: React.FC<ChartSpreadsheetEditorProps> = ({
  chart,
  onUpdateChart,
  onClose,
  onOpenChangeType,
}) => {
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{
    x: number;
    y: number;
    catIdx?: number;
    seriesIdx?: number;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Close context menu on outside click or ESC
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenuPos(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenuPos(null);
      }
    };
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getColLetter = (index: number) => {
    return String.fromCharCode(65 + index); // 0 -> A, 1 -> B, etc.
  };

  // Handle Category Name Change
  const handleCategoryChange = (catIdx: number, newName: string) => {
    const nextCategories = [...chart.categories];
    nextCategories[catIdx] = newName;

    onUpdateChart({
      ...chart,
      categories: nextCategories,
      updatedAt: new Date().toISOString(),
    });
  };

  // Handle Series Name Change
  const handleSeriesNameChange = (seriesIdx: number, newName: string) => {
    const nextSeries = chart.series.map((s, i) =>
      i === seriesIdx ? { ...s, name: newName } : s
    );

    onUpdateChart({
      ...chart,
      series: nextSeries,
      updatedAt: new Date().toISOString(),
    });
  };

  // Handle Value Change
  const handleValueChange = (catIdx: number, seriesIdx: number, rawVal: string) => {
    const num = parseFloat(rawVal);
    const validNum = isNaN(num) ? 0 : num;

    const nextSeries = chart.series.map((s, i) => {
      if (i === seriesIdx) {
        const nextVals = [...s.values];
        nextVals[catIdx] = validNum;
        return { ...s, values: nextVals };
      }
      return s;
    });

    onUpdateChart({
      ...chart,
      series: nextSeries,
      updatedAt: new Date().toISOString(),
    });
  };

  // Helper to find the next unused category name: Category 1, Category 2, ...
  const getNextCategoryName = (existingCategories: string[]): string => {
    let num = existingCategories.length + 1;
    while (existingCategories.includes(`Category ${num}`)) {
      num++;
    }
    return `Category ${num}`;
  };

  // Helper to find the next unused series name: Series 1, Series 2, ...
  const getNextSeriesName = (existingSeries: ChartSeries[]): string => {
    const existingNames = existingSeries.map((s) => s.name);
    let num = existingSeries.length + 1;
    while (existingNames.includes(`Series ${num}`)) {
      num++;
    }
    return `Series ${num}`;
  };

  // Add new Category (Row)
  const handleAddCategory = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newCategoryName = getNextCategoryName(chart.categories);
    const nextCategories = [...chart.categories, newCategoryName];

    // Append safe default 0 for EVERY series (guaranteeing exact length match)
    const nextSeries = chart.series.map((s) => ({
      ...s,
      values: [...s.values, 0],
    }));

    onUpdateChart({
      ...chart,
      categories: nextCategories,
      series: nextSeries,
      updatedAt: new Date().toISOString(),
    });
  };

  // Remove Category (Row)
  const handleRemoveCategory = (catIdx: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (chart.categories.length <= 1) return;

    const nextCategories = chart.categories.filter((_, idx) => idx !== catIdx);
    const nextSeries = chart.series.map((s) => ({
      ...s,
      values: s.values.filter((_, idx) => idx !== catIdx),
    }));

    onUpdateChart({
      ...chart,
      categories: nextCategories,
      series: nextSeries,
      updatedAt: new Date().toISOString(),
    });
  };

  // Add new Series (Column)
  const handleAddSeries = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newSeriesName = getNextSeriesName(chart.series);
    const activePalette =
      COLOR_SCHEMES.find((s) => s.id === chart.colorScheme)?.colors ||
      COLOR_SCHEMES[0].colors;
    const seriesColor = activePalette[chart.series.length % activePalette.length];

    const newSeries: ChartSeries = {
      id: `s-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newSeriesName,
      color: seriesColor,
      // Create one 0 value for EVERY existing category
      values: chart.categories.map(() => 0),
    };

    onUpdateChart({
      ...chart,
      series: [...chart.series, newSeries],
      updatedAt: new Date().toISOString(),
    });
  };

  // Remove Series (Column)
  const handleRemoveSeries = (seriesIdx: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (chart.series.length <= 1) return;

    const nextSeries = chart.series.filter((_, idx) => idx !== seriesIdx);

    onUpdateChart({
      ...chart,
      series: nextSeries,
      updatedAt: new Date().toISOString(),
    });
  };

  // Insert row at specific index
  const handleInsertRowAt = (insertIdx: number) => {
    const newCategoryName = getNextCategoryName(chart.categories);
    const nextCategories = [...chart.categories];
    nextCategories.splice(insertIdx, 0, newCategoryName);
    const nextSeries = chart.series.map((s) => {
      const nextVals = [...s.values];
      nextVals.splice(insertIdx, 0, 0);
      return { ...s, values: nextVals };
    });
    onUpdateChart({
      ...chart,
      categories: nextCategories,
      series: nextSeries,
      updatedAt: new Date().toISOString(),
    });
  };

  // Clear specific cell value
  const handleClearCell = (catIdx: number, seriesIdx: number) => {
    const nextSeries = chart.series.map((s, i) => {
      if (i === seriesIdx) {
        const nextVals = [...s.values];
        nextVals[catIdx] = 0;
        return { ...s, values: nextVals };
      }
      return s;
    });
    onUpdateChart({
      ...chart,
      series: nextSeries,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCellContextMenu = (
    e: React.MouseEvent,
    catIdx?: number,
    seriesIdx?: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPos({
      x: e.clientX,
      y: e.clientY,
      catIdx,
      seriesIdx,
    });
  };

  return (
    <div
      className="chart-data-editor-container w-full rounded-lg border border-emerald-600/40 bg-white shadow-md overflow-hidden select-none animate-in fade-in slide-in-from-top-1 duration-150"
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenuPos({ x: e.clientX, y: e.clientY });
      }}
    >
      {/* 1. COMPACT EXCEL WINDOW HEADER */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#107c41] text-white">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-100 shrink-0" />
          <span className="text-xs font-semibold tracking-wide">
            📊 Chart in Document — Data Editor
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenChangeType && (
            <button
              type="button"
              onClick={onOpenChangeType}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-emerald-700/80 hover:bg-emerald-700 text-white rounded transition-colors cursor-pointer"
              title="Change chart type"
            >
              <BarChart2 className="w-3 h-3 text-emerald-100" />
              <span>Type</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded transition-colors shadow-xs cursor-pointer"
            title="Close spreadsheet data editor"
          >
            <X className="w-3 h-3" />
            <span>Close Data</span>
          </button>
        </div>
      </div>

      {/* 2. COMPACT LIVE SYNC NOTIFICATION BAR */}
      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[11px] text-emerald-800 font-medium border-b border-emerald-100">
        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5] shrink-0" />
        <span>Live sync active — changes apply instantly to the chart below</span>
      </div>

      {/* SPREADSHEET GRID CONTAINER (Horizontal & Vertical Scrollable, Controlled Height) */}
      <div className="data-editor-table-container max-h-[190px] overflow-x-auto overflow-y-auto border-b border-slate-200">
        <table className="w-full border-collapse text-xs font-mono">
          {/* COLUMN LETTERS ROW (A, B, C, D...) */}
          <thead>
            <tr className="bg-slate-100 text-slate-500 border-b border-slate-200 text-center text-[10px] font-semibold">
              <th className="w-9 border-r border-slate-200 p-1 bg-slate-200/60 font-sans">#</th>
              <th className="min-w-[110px] border-r border-slate-200 p-1">A</th>
              {chart.series.map((_, sIdx) => (
                <th key={sIdx} className="min-w-[90px] border-r border-slate-200 p-1">
                  {getColLetter(sIdx + 1)}
                </th>
              ))}
              <th className="w-8 p-1"></th>
            </tr>

            {/* HEADER ROW WITH SERIES NAMES */}
            <tr className="bg-slate-50 border-b border-slate-200">
              <td className="w-9 text-center p-1 bg-slate-100 font-sans text-[10px] text-slate-400 border-r border-slate-200 font-semibold">
                1
              </td>
              {/* Category label header */}
              <td className="p-1 border-r border-slate-200 bg-slate-100/70 font-sans text-[11px] font-semibold text-slate-600 px-2">
                Category
              </td>
              {/* Editable series headers */}
              {chart.series.map((series, sIdx) => (
                <td
                  key={series.id}
                  onContextMenu={(e) => handleCellContextMenu(e, undefined, sIdx)}
                  className={`relative p-0 border-r border-slate-200 group ${
                    activeCell?.row === 0 && activeCell?.col === sIdx + 1
                      ? 'ring-2 ring-emerald-500 z-10'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between w-full h-full px-1.5 py-1">
                    <input
                      type="text"
                      value={series.name}
                      onChange={(e) => handleSeriesNameChange(sIdx, e.target.value)}
                      onFocus={() => setActiveCell({ row: 0, col: sIdx + 1 })}
                      className="w-full h-6 text-xs font-semibold text-blue-700 bg-transparent outline-none font-sans"
                    />
                    {chart.series.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSeries(sIdx)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-500 transition-opacity"
                        title="Delete series"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </td>
              ))}
              <td className="w-8"></td>
            </tr>
          </thead>

          {/* DATA ROWS */}
          <tbody className="divide-y divide-slate-100">
            {chart.categories.map((cat, catIdx) => (
              <tr key={catIdx} className="hover:bg-slate-50/60 group">
                {/* Row Number */}
                <td
                  onContextMenu={(e) => handleCellContextMenu(e, catIdx, undefined)}
                  className="w-9 text-center p-1 bg-slate-100 font-sans text-[10px] text-slate-500 border-r border-slate-200 font-semibold cursor-default"
                >
                  {catIdx + 2}
                </td>

                {/* Editable Category Name (Column A) */}
                <td
                  onContextMenu={(e) => handleCellContextMenu(e, catIdx, 0)}
                  className={`p-0 border-r border-slate-200 ${
                    activeCell?.row === catIdx + 1 && activeCell?.col === 0
                      ? 'ring-2 ring-emerald-500 z-10'
                      : ''
                  }`}
                >
                  <input
                    type="text"
                    value={cat}
                    onChange={(e) => handleCategoryChange(catIdx, e.target.value)}
                    onFocus={() => setActiveCell({ row: catIdx + 1, col: 0 })}
                    className="w-full h-7 px-2 text-xs font-medium text-slate-800 bg-transparent outline-none font-sans"
                  />
                </td>

                {/* Editable Series Values (Columns B, C, D...) */}
                {chart.series.map((s, sIdx) => {
                  const val = s.values[catIdx] ?? 0;
                  const isSelected =
                    activeCell?.row === catIdx + 1 && activeCell?.col === sIdx + 1;

                  return (
                    <td
                      key={s.id}
                      onContextMenu={(e) => handleCellContextMenu(e, catIdx, sIdx)}
                      className={`p-0 border-r border-slate-200 ${
                        isSelected ? 'ring-2 ring-emerald-500 z-10 bg-emerald-50/30' : ''
                      }`}
                    >
                      <input
                        type="number"
                        step="any"
                        value={val}
                        onChange={(e) => handleValueChange(catIdx, sIdx, e.target.value)}
                        onFocus={() => setActiveCell({ row: catIdx + 1, col: sIdx + 1 })}
                        className="w-full h-7 px-2 text-xs text-right text-slate-900 bg-transparent outline-none"
                      />
                    </td>
                  );
                })}

                {/* Delete Row Button */}
                <td className="w-8 text-center p-1">
                  {chart.categories.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(catIdx)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-500 transition-opacity"
                      title="Delete row"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SPREADSHEET FOOTER ACTION BAR */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 text-xs font-sans border-t border-slate-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddCategory}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-400 rounded transition-colors shadow-2xs cursor-pointer select-none"
            title="Add a new category row with default 0 values"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
            <span>+ Row</span>
          </button>

          <button
            type="button"
            onClick={handleAddSeries}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-400 rounded transition-colors shadow-2xs cursor-pointer select-none"
            title="Add a new series column with default 0 values"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
            <span>+ Series</span>
          </button>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/90 rounded transition-colors cursor-pointer select-none"
          title="Finish editing data"
        >
          <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
          <span>Done Editing</span>
        </button>
      </div>

      {/* SPREADSHEET CELL CONTEXT MENU */}
      {contextMenuPos &&
        ReactDOM.createPortal(
          <div
            ref={contextMenuRef}
            className="fixed z-[99999] w-[210px] rounded-lg border border-slate-200 bg-white/98 backdrop-blur-md p-1 shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-100 select-none dark:bg-[#111D29] dark:border-slate-800 dark:text-slate-200"
            style={{
              top: `${Math.min(contextMenuPos.y, window.innerHeight - 230)}px`,
              left: `${Math.min(contextMenuPos.x, window.innerWidth - 220)}px`,
            }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <button
              type="button"
              onClick={() => {
                if (contextMenuPos.catIdx !== undefined) {
                  handleInsertRowAt(contextMenuPos.catIdx);
                } else {
                  handleAddCategory();
                }
                setContextMenuPos(null);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Insert Row Above</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (contextMenuPos.catIdx !== undefined) {
                  handleInsertRowAt(contextMenuPos.catIdx + 1);
                } else {
                  handleAddCategory();
                }
                setContextMenuPos(null);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Insert Row Below</span>
            </button>

            <button
              type="button"
              disabled={chart.categories.length <= 1}
              onClick={() => {
                if (contextMenuPos.catIdx !== undefined) {
                  handleRemoveCategory(contextMenuPos.catIdx);
                }
                setContextMenuPos(null);
              }}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-left ${
                chart.categories.length <= 1
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Row</span>
            </button>

            <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />

            <button
              type="button"
              onClick={() => {
                handleAddSeries();
                setContextMenuPos(null);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Insert Series (Column)</span>
            </button>

            <button
              type="button"
              disabled={chart.series.length <= 1 || contextMenuPos.seriesIdx === undefined}
              onClick={() => {
                if (contextMenuPos.seriesIdx !== undefined) {
                  handleRemoveSeries(contextMenuPos.seriesIdx);
                }
                setContextMenuPos(null);
              }}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-left ${
                chart.series.length <= 1 || contextMenuPos.seriesIdx === undefined
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Series</span>
            </button>

            {contextMenuPos.catIdx !== undefined && contextMenuPos.seriesIdx !== undefined && (
              <>
                <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
                <button
                  type="button"
                  onClick={() => {
                    handleClearCell(contextMenuPos.catIdx!, contextMenuPos.seriesIdx!);
                    setContextMenuPos(null);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Eraser className="w-3.5 h-3.5 text-amber-500" />
                  <span>Clear Cell Value</span>
                </button>
              </>
            )}

            <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />

            <button
              type="button"
              onClick={() => {
                setContextMenuPos(null);
                onClose();
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-left font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Done Editing</span>
            </button>
          </div>,
          document.body
        )}
    </div>
  );
};
