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
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const cellWasAlreadyActiveRef = useRef<boolean>(false);

  const [contextMenuPos, setContextMenuPos] = useState<{
    x: number;
    y: number;
    catIdx?: number;
    seriesIdx?: number;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Navigate to target cell by grid coordinates (row, col)
  const navigateToCell = (targetRow: number, targetCol: number) => {
    const targetInput = tableContainerRef.current?.querySelector<HTMLInputElement>(
      `input[data-row="${targetRow}"][data-col="${targetCol}"]`
    );

    if (targetInput) {
      setActiveCell({ row: targetRow, col: targetCol });
      setIsEditing(false);
      targetInput.focus({ preventScroll: true });
      targetInput.select();
      targetInput.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  };

  const handleCellMouseDown = (row: number, col: number) => {
    cellWasAlreadyActiveRef.current =
      activeCell?.row === row && activeCell?.col === col;
  };

  const handleCellClick = (
    e: React.MouseEvent<HTMLInputElement>,
    row: number,
    col: number
  ) => {
    if (cellWasAlreadyActiveRef.current) {
      setIsEditing(true);
    } else {
      setActiveCell({ row, col });
      setIsEditing(false);
      e.currentTarget.select();
    }
  };

  const handleCellKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: number,
    col: number
  ) => {
    // STATE 2 — CELL IS ACTIVELY BEING EDITED
    if (isEditing) {
      // Preserve normal text-editing behavior: caret movement, home, end, selection
      if (
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'Home' ||
        e.key === 'End'
      ) {
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        setIsEditing(false);
        navigateToCell(row + 1, col);
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        setIsEditing(false);
        navigateToCell(row, e.shiftKey ? col - 1 : col + 1);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsEditing(false);
        e.currentTarget.select();
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsEditing(false);
        navigateToCell(e.key === 'ArrowUp' ? row - 1 : row + 1, col);
        return;
      }
      return;
    }

    // STATE 1 — CELL IS NOT BEING TEXT-EDITED (Navigation mode)
    if (
      e.key === 'ArrowUp' ||
      e.key === 'ArrowDown' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight'
    ) {
      e.preventDefault();
      e.stopPropagation();

      let targetRow = row;
      let targetCol = col;

      if (e.key === 'ArrowUp') targetRow -= 1;
      if (e.key === 'ArrowDown') targetRow += 1;
      if (e.key === 'ArrowLeft') targetCol -= 1;
      if (e.key === 'ArrowRight') targetCol += 1;

      navigateToCell(targetRow, targetCol);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        navigateToCell(row - 1, col);
      } else {
        navigateToCell(row + 1, col);
      }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        navigateToCell(row, col - 1);
      } else {
        navigateToCell(row, col + 1);
      }
      return;
    }

    if (e.key === 'F2') {
      e.preventDefault();
      setIsEditing(true);
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
      return;
    }

    // Any typing key puts the cell into active text-edit mode
    if (
      !e.ctrlKey &&
      !e.altKey &&
      !e.metaKey &&
      (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete')
    ) {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        if (col === 0) {
          handleCategoryChange(row - 1, '');
        } else {
          handleValueChange(row - 1, col - 1, '');
        }
        return;
      }
      setIsEditing(true);
    }
  };

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
    let valToStore: number | string = '';
    const trimmed = rawVal.trim();
    if (trimmed === '') {
      valToStore = '';
    } else {
      const num = parseFloat(trimmed);
      // Keep valid numbers; if in the middle of typing a decimal point like "2.", preserve string
      if (!isNaN(num) && !trimmed.endsWith('.')) {
        valToStore = num;
      } else {
        valToStore = trimmed;
      }
    }

    const nextSeries = chart.series.map((s, i) => {
      if (i === seriesIdx) {
        const nextVals = [...s.values];
        nextVals[catIdx] = valToStore;
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
        nextVals[catIdx] = '';
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
      className="chart-data-editor-container w-full rounded-lg border border-emerald-600/40 bg-card shadow-md overflow-hidden select-none animate-in fade-in slide-in-from-top-1 duration-150"
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenuPos({ x: e.clientX, y: e.clientY });
      }}
    >
      {/* SCOPED STYLES TO HIDE NATIVE NUMBER INPUT SPINNER ARROWS (▲/▼) */}
      <style>{`
        .chart-data-editor-container input[type="number"]::-webkit-outer-spin-button,
        .chart-data-editor-container input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none !important;
          margin: 0 !important;
        }
        .chart-data-editor-container input[type="number"] {
          -moz-appearance: textfield !important;
          appearance: textfield !important;
        }
      `}</style>

      {/* 1. COMPACT EXCEL WINDOW HEADER */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#107c41] text-primary-foreground">
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
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-emerald-700/80 hover:bg-emerald-700 text-primary-foreground rounded transition-colors cursor-pointer"
              title="Change chart type"
            >
              <BarChart2 className="w-3 h-3 text-emerald-100" />
              <span>Type</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-800 hover:bg-emerald-900 text-primary-foreground rounded transition-colors shadow-xs cursor-pointer"
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
      <div ref={tableContainerRef} className="data-editor-table-container max-h-[190px] overflow-x-auto overflow-y-auto border-b border-secondary">
        <table className="w-full border-collapse text-xs font-mono">
          {/* COLUMN LETTERS ROW (A, B, C, D...) */}
          <thead>
            <tr className="bg-muted text-muted0 border-b border-secondary text-center text-[10px] font-semibold">
              <th className="w-9 border-r border-secondary p-1 bg-secondary/60 font-sans">#</th>
              <th className="min-w-[110px] border-r border-secondary p-1">A</th>
              {chart.series.map((_, sIdx) => (
                <th key={sIdx} className="min-w-[90px] border-r border-secondary p-1">
                  {getColLetter(sIdx + 1)}
                </th>
              ))}
              <th className="w-8 p-1"></th>
            </tr>

            {/* HEADER ROW WITH SERIES NAMES */}
            <tr className="bg-muted border-b border-secondary">
              <td className="w-9 text-center p-1 bg-muted font-sans text-[10px] text-muted-foreground border-r border-secondary font-semibold">
                1
              </td>
              {/* Category label header */}
              <td className="p-1 border-r border-secondary bg-muted/70 font-sans text-[11px] font-semibold text-secondary-foreground px-2">
                Category
              </td>
              {/* Editable series headers */}
              {chart.series.map((series, sIdx) => (
                <td
                  key={series.id}
                  onContextMenu={(e) => handleCellContextMenu(e, undefined, sIdx)}
                  className={`relative p-0 border-r border-secondary group ${
                    activeCell?.row === 0 && activeCell?.col === sIdx + 1
                      ? 'ring-2 ring-emerald-500 z-10'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between w-full h-full px-1.5 py-1">
                    <input
                      data-row={0}
                      data-col={sIdx + 1}
                      type="text"
                      value={series.name}
                      onChange={(e) => handleSeriesNameChange(sIdx, e.target.value)}
                      onMouseDown={() => handleCellMouseDown(0, sIdx + 1)}
                      onClick={(e) => handleCellClick(e, 0, sIdx + 1)}
                      onDoubleClick={() => setIsEditing(true)}
                      onFocus={() => setActiveCell({ row: 0, col: sIdx + 1 })}
                      onKeyDown={(e) => handleCellKeyDown(e, 0, sIdx + 1)}
                      className="w-full h-6 text-xs font-semibold text-primary/90 bg-transparent outline-none font-sans"
                    />
                    {chart.series.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSeries(sIdx)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive transition-opacity"
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
          <tbody className="divide-y divide-muted">
            {chart.categories.map((cat, catIdx) => (
              <tr key={catIdx} className="hover:bg-muted/60 group">
                {/* Row Number */}
                <td
                  onContextMenu={(e) => handleCellContextMenu(e, catIdx, undefined)}
                  className="w-9 text-center p-1 bg-muted font-sans text-[10px] text-muted0 border-r border-secondary font-semibold cursor-default"
                >
                  {catIdx + 2}
                </td>

                {/* Editable Category Name (Column A) */}
                <td
                  onContextMenu={(e) => handleCellContextMenu(e, catIdx, 0)}
                  className={`p-0 border-r border-secondary ${
                    activeCell?.row === catIdx + 1 && activeCell?.col === 0
                      ? 'ring-2 ring-emerald-500 z-10'
                      : ''
                  }`}
                >
                  <input
                    data-row={catIdx + 1}
                    data-col={0}
                    type="text"
                    value={cat}
                    onChange={(e) => handleCategoryChange(catIdx, e.target.value)}
                    onMouseDown={() => handleCellMouseDown(catIdx + 1, 0)}
                    onClick={(e) => handleCellClick(e, catIdx + 1, 0)}
                    onDoubleClick={() => setIsEditing(true)}
                    onFocus={() => setActiveCell({ row: catIdx + 1, col: 0 })}
                    onKeyDown={(e) => handleCellKeyDown(e, catIdx + 1, 0)}
                    className="w-full h-7 px-2 text-xs font-medium text-foreground bg-transparent outline-none font-sans"
                  />
                </td>

                {/* Editable Series Values (Columns B, C, D...) */}
                {chart.series.map((s, sIdx) => {
                  const rawVal = s.values[catIdx];
                  const displayVal = (rawVal === '' || rawVal === null || rawVal === undefined) ? '' : rawVal;
                  const isSelected =
                    activeCell?.row === catIdx + 1 && activeCell?.col === sIdx + 1;

                  return (
                    <td
                      key={s.id}
                      onContextMenu={(e) => handleCellContextMenu(e, catIdx, sIdx)}
                      className={`p-0 border-r border-secondary ${
                        isSelected ? 'ring-2 ring-emerald-500 z-10 bg-emerald-50/30' : ''
                      }`}
                    >
                      <input
                        data-row={catIdx + 1}
                        data-col={sIdx + 1}
                        type="text"
                        inputMode="decimal"
                        value={displayVal}
                        onChange={(e) => handleValueChange(catIdx, sIdx, e.target.value)}
                        onMouseDown={() => handleCellMouseDown(catIdx + 1, sIdx + 1)}
                        onClick={(e) => handleCellClick(e, catIdx + 1, sIdx + 1)}
                        onDoubleClick={() => setIsEditing(true)}
                        onFocus={() => setActiveCell({ row: catIdx + 1, col: sIdx + 1 })}
                        onKeyDown={(e) => handleCellKeyDown(e, catIdx + 1, sIdx + 1)}
                        className="w-full h-7 px-2 text-xs text-right text-foreground bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive transition-opacity"
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
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted text-xs font-sans border-t border-secondary">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddCategory}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-secondary-foreground bg-card border border-border hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-400 rounded transition-colors shadow-2xs cursor-pointer select-none"
            title="Add a new category row with default 0 values"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
            <span>+ Row</span>
          </button>

          <button
            type="button"
            onClick={handleAddSeries}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-secondary-foreground bg-card border border-border hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-400 rounded transition-colors shadow-2xs cursor-pointer select-none"
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
            className="fixed z-[99999] w-[210px] rounded-lg border border-secondary bg-card/98 backdrop-blur-md p-1 shadow-xl text-foreground animate-in fade-in zoom-in-95 duration-100 select-none dark:bg-[#111D29] dark:border-muted dark:text-muted-foreground"
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
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-left text-secondary-foreground hover:bg-muted dark:text-muted-foreground dark:hover:bg-muted cursor-pointer"
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
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-left text-secondary-foreground hover:bg-muted dark:text-muted-foreground dark:hover:bg-muted cursor-pointer"
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
                  ? 'text-muted-foreground cursor-not-allowed'
                  : 'text-destructive hover:bg-destructive/10 dark:hover:bg-red-950/40 cursor-pointer'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Row</span>
            </button>

            <div className="my-1 h-px bg-muted dark:bg-muted" />

            <button
              type="button"
              onClick={() => {
                handleAddSeries();
                setContextMenuPos(null);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-left text-secondary-foreground hover:bg-muted dark:text-muted-foreground dark:hover:bg-muted cursor-pointer"
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
                  ? 'text-muted-foreground cursor-not-allowed'
                  : 'text-destructive hover:bg-destructive/10 dark:hover:bg-red-950/40 cursor-pointer'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Series</span>
            </button>

            {contextMenuPos.catIdx !== undefined && contextMenuPos.seriesIdx !== undefined && (
              <>
                <div className="my-1 h-px bg-muted dark:bg-muted" />
                <button
                  type="button"
                  onClick={() => {
                    handleClearCell(contextMenuPos.catIdx!, contextMenuPos.seriesIdx!);
                    setContextMenuPos(null);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-left text-secondary-foreground hover:bg-muted dark:text-muted-foreground dark:hover:bg-muted cursor-pointer"
                >
                  <Eraser className="w-3.5 h-3.5 text-amber-500" />
                  <span>Clear Cell Value</span>
                </button>
              </>
            )}

            <div className="my-1 h-px bg-muted dark:bg-muted" />

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
