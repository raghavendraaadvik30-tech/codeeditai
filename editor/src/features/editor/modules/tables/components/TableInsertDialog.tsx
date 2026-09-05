/**
 * --------------------------------------------------------
 * Module: Tables
 * Feature: TableInsertDialog Component
 * Description:
 * Modal dialog providing custom dimension inputs, styling options,
 * and header controls for precision table creation.
 * --------------------------------------------------------
 */

import { useState } from "react";
import { Table, Plus, X } from "lucide-react";
import { useTable } from "../hooks";
import type { TableStyle } from "../types";

export function TableInsertDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { insertTableWithConfig } = useTable();
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(3);
  const [hasHeader, setHasHeader] = useState(false);
  const [bordered, setBordered] = useState(true);
  const [striped, setStriped] = useState(false);
  const [style, setStyle] = useState<TableStyle>("clinical");
  const [width, setWidth] = useState("100%");
  const [caption, setCaption] = useState("");

  if (!open) return null;

  const handleInsert = () => {
    insertTableWithConfig({
      rows: Math.max(1, rows),
      cols: Math.max(1, cols),
      hasHeader,
      bordered,
      striped,
      style,
      width,
      caption,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#0c1929]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0078d4]/10 text-[#0078d4]">
              <Table className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Insert Custom Table
              </h3>
              <p className="text-[11px] text-slate-500">
                Configure table dimensions and styles
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
                Number of Rows
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                className="mt-1 h-8 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-[#0078d4] dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
                Number of Columns
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={cols}
                onChange={(e) => setCols(Number(e.target.value))}
                className="mt-1 h-8 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-[#0078d4] dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>

          {/* Style Selector */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
              Table Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as TableStyle)}
              className="mt-1 h-8 w-full rounded-md border border-slate-200 px-2 outline-none focus:border-[#0078d4] dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="clinical">Clinical / Medical (Blue Header)</option>
              <option value="striped">Striped Rows</option>
              <option value="bordered">Bordered Grid</option>
              <option value="default">Default Clean</option>
              <option value="minimal">Minimal / Borderless</option>
              <option value="darkHeader">Dark Header</option>
            </select>
          </div>

          {/* Width Preset */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
              Table Width Preset
            </label>
            <select
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="mt-1 h-8 w-full rounded-md border border-slate-200 px-2 outline-none focus:border-[#0078d4] dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="100%">Full Width (100%)</option>
              <option value="90%">Large (90%)</option>
              <option value="75%">Medium (75%)</option>
              <option value="50%">Compact (50%)</option>
            </select>
          </div>

          {/* Optional Caption */}
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300">
              Table Caption (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Table 1.1 Demographic Baseline"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="mt-1 h-8 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-[#0078d4] dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col gap-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="rounded border-slate-300 text-[#0078d4] focus:ring-[#0078d4]"
              />
              <span className="text-slate-700 dark:text-slate-300">
                Include Header Row
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={bordered}
                onChange={(e) => setBordered(e.target.checked)}
                className="rounded border-slate-300 text-[#0078d4] focus:ring-[#0078d4]"
              />
              <span className="text-slate-700 dark:text-slate-300">
                Show Cell Borders
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={striped}
                onChange={(e) => setStriped(e.target.checked)}
                className="rounded border-slate-300 text-[#0078d4] focus:ring-[#0078d4]"
              />
              <span className="text-slate-700 dark:text-slate-300">
                Zebra Striping
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsert}
              className="flex items-center gap-1.5 rounded-lg bg-[#0078d4] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#005a9e] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Insert Table
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
