/**
 * --------------------------------------------------------
 * Module: Tables
 * Feature: TableActionsToolbar Component
 * Description:
 * Quick table manipulation toolbar providing row/column additions,
 * deletions, cell merge/split, table split/merge, and table cleanup.
 * --------------------------------------------------------
 */

import {
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  Trash2,
  Rows,
  Columns,
  Merge,
  Split,
  Scissors,
  Combine,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown,
  MoveVertical,
  RotateCw,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useTable } from "../hooks";
import { cn } from "@/lib/utils";

export function TableActionsToolbar() {
  const {
    insertRowAbove,
    insertRowBelow,
    insertColLeft,
    insertColRight,
    deleteCurrentRow,
    deleteCurrentCol,
    deleteCurrentTable,
    mergeCells,
    splitCell,
    splitCurrentTable,
    mergeWithNextTable,
    setCellHorizontalAlign,
    setCellVerticalAlign,
    toggleCellTextDirection,
    activeCellFormat,
    autoFitWindow,
    autoFitContent,
    distributeColumns,
    distributeRows,
  } = useTable();

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-800/80 dark:bg-[#091524] space-y-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Table Actions (Active Selection)
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertRowAbove}
          className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 transition-colors"
        >
          <ArrowUpToLine className="h-3.5 w-3.5 text-blue-500" />
          <span>Row Above</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertRowBelow}
          className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 transition-colors"
        >
          <ArrowDownToLine className="h-3.5 w-3.5 text-blue-500" />
          <span>Row Below</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertColLeft}
          className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 transition-colors"
        >
          <ArrowLeftToLine className="h-3.5 w-3.5 text-indigo-500" />
          <span>Col Left</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertColRight}
          className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 transition-colors"
        >
          <ArrowRightToLine className="h-3.5 w-3.5 text-indigo-500" />
          <span>Col Right</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={deleteCurrentRow}
          className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-red-400 transition-colors"
        >
          <Rows className="h-3.5 w-3.5" />
          <span>Delete Row</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={deleteCurrentCol}
          className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-red-400 transition-colors"
        >
          <Columns className="h-3.5 w-3.5" />
          <span>Delete Col</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={mergeCells}
          className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 transition-colors"
        >
          <Merge className="h-3.5 w-3.5 text-emerald-500" />
          <span>Merge Cells</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={splitCell}
          className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 transition-colors"
        >
          <Split className="h-3.5 w-3.5 text-amber-500" />
          <span>Split Cell</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={splitCurrentTable}
          className="flex items-center gap-2 rounded-lg border border-purple-200/70 bg-purple-50/50 px-2.5 py-1.5 text-xs text-purple-700 hover:bg-purple-100 dark:border-purple-900/60 dark:bg-purple-950/30 dark:text-purple-300 transition-colors"
        >
          <Scissors className="h-3.5 w-3.5 text-purple-500" />
          <span>Split Table</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={mergeWithNextTable}
          className="flex items-center gap-2 rounded-lg border border-indigo-200/70 bg-indigo-50/50 px-2.5 py-1.5 text-xs text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/30 dark:text-indigo-300 transition-colors"
        >
          <Combine className="h-3.5 w-3.5 text-indigo-500" />
          <span>Merge Table</span>
        </button>
      </div>

      {/* -----------------------------------------------------------
          CELL ALIGNMENT & ORIENTATION CONTROLS (Word-style)
          ----------------------------------------------------------- */}
      <div className="border-t border-slate-100 pt-2.5 dark:border-slate-800 space-y-2.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Cell Alignment & Orientation
        </div>

        {/* Horizontal Alignment */}
        <div className="space-y-1">
          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Horizontal Align</div>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setCellHorizontalAlign("left")}
              className={cn(
                "flex h-8 items-center justify-center gap-1 rounded-md border text-xs font-medium transition-colors",
                activeCellFormat?.horizontalAlign === "left"
                  ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300 shadow-xs"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              )}
              title="Align Left"
            >
              <AlignLeft className="h-3.5 w-3.5" />
              <span>Left</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setCellHorizontalAlign("center")}
              className={cn(
                "flex h-8 items-center justify-center gap-1 rounded-md border text-xs font-medium transition-colors",
                activeCellFormat?.horizontalAlign === "center"
                  ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300 shadow-xs"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              )}
              title="Align Center"
            >
              <AlignCenter className="h-3.5 w-3.5" />
              <span>Center</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setCellHorizontalAlign("right")}
              className={cn(
                "flex h-8 items-center justify-center gap-1 rounded-md border text-xs font-medium transition-colors",
                activeCellFormat?.horizontalAlign === "right"
                  ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300 shadow-xs"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              )}
              title="Align Right"
            >
              <AlignRight className="h-3.5 w-3.5" />
              <span>Right</span>
            </button>
          </div>
        </div>

        {/* Vertical Alignment */}
        <div className="space-y-1">
          <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Vertical Align</div>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setCellVerticalAlign("top")}
              className={cn(
                "flex h-8 items-center justify-center gap-1 rounded-md border text-xs font-medium transition-colors",
                activeCellFormat?.verticalAlign === "top"
                  ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300 shadow-xs"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              )}
              title="Align Top"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              <span>Top</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setCellVerticalAlign("middle")}
              className={cn(
                "flex h-8 items-center justify-center gap-1 rounded-md border text-xs font-medium transition-colors",
                activeCellFormat?.verticalAlign === "middle"
                  ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300 shadow-xs"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              )}
              title="Align Middle (Center)"
            >
              <MoveVertical className="h-3.5 w-3.5" />
              <span>Middle</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setCellVerticalAlign("bottom")}
              className={cn(
                "flex h-8 items-center justify-center gap-1 rounded-md border text-xs font-medium transition-colors",
                activeCellFormat?.verticalAlign === "bottom"
                  ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300 shadow-xs"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              )}
              title="Align Bottom"
            >
              <ArrowDown className="h-3.5 w-3.5" />
              <span>Bottom</span>
            </button>
          </div>
        </div>

        {/* Text Direction */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggleCellTextDirection}
          className={cn(
            "flex h-8 w-full items-center justify-center gap-2 rounded-md border text-xs font-medium transition-colors",
            activeCellFormat?.isVerticalText
              ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300 shadow-xs"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          )}
          title={
            activeCellFormat?.isVerticalText
              ? "Current: Vertical (Click to switch to Horizontal)"
              : "Toggle Text Direction (Horizontal / Vertical)"
          }
        >
          <RotateCw
            className={cn(
              "h-3.5 w-3.5 text-blue-500 transition-transform duration-200",
              activeCellFormat?.isVerticalText && "rotate-90 text-blue-600 dark:text-blue-400"
            )}
          />
          <span>{activeCellFormat?.isVerticalText ? "Vertical Text (Active)" : "Toggle Text Direction"}</span>
        </button>
      </div>

      {/* -----------------------------------------------------------
          TABLE SIZING & AUTOFIT CONTROLS (Word-style)
          ----------------------------------------------------------- */}
      <div className="border-t border-slate-100 pt-2.5 dark:border-slate-800 space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Table Sizing & AutoFit
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={autoFitWindow}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
            title="Fit Table to Page Width (100%)"
          >
            <Maximize2 className="h-3.5 w-3.5 text-blue-500" />
            <span>Fit to Page</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={autoFitContent}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
            title="Fit Table to Content snuggly"
          >
            <Minimize2 className="h-3.5 w-3.5 text-amber-500" />
            <span>Fit Content</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={distributeColumns}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
            title="Distribute columns evenly"
          >
            <Columns className="h-3.5 w-3.5 text-indigo-500" />
            <span>Distribute Cols</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={distributeRows}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
            title="Distribute rows evenly"
          >
            <Rows className="h-3.5 w-3.5 text-emerald-500" />
            <span>Distribute Rows</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={deleteCurrentTable}
        className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200/80 bg-red-50/60 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:border-red-950 dark:bg-red-950/40 dark:text-red-400 transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>Delete Selected Table</span>
      </button>
    </div>
  );
}
