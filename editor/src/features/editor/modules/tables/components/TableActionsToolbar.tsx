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
} from "lucide-react";
import { useTable } from "../hooks";

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
