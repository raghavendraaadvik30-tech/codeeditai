/**
 * --------------------------------------------------------
 * Module: Tables
 * Feature: TableTemplateList Component
 * Description:
 * Displays visual templates designed for clinical and corporate
 * documentation with one-click workspace insertion.
 * --------------------------------------------------------
 */

import { Table, Plus } from "lucide-react";
import { useTable } from "../hooks";
import type { TableTemplate } from "../types";

export function TableTemplateList() {
  const { templates, insertTemplate } = useTable();

  return (
    <div className="space-y-2">
      {templates.map((tpl: TableTemplate) => (
        <div
          key={tpl.id}
          className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-3 transition-all hover:border-[#0078d4]/60 dark:border-slate-800/80 dark:bg-[#091524] dark:hover:border-slate-700"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0078d4] dark:bg-blue-950/40">
                <Table className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {tpl.title}
                </div>
                <div className="text-[10px] text-slate-400">
                  {tpl.rows} × {tpl.cols} · {tpl.style}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => insertTemplate(tpl)}
              className="flex h-6 items-center gap-1 rounded-md bg-[#0078d4]/10 px-2 text-[11px] font-medium text-[#0078d4] hover:bg-[#0078d4] hover:text-white transition-colors"
            >
              <Plus className="h-3 w-3" />
              Insert
            </button>
          </div>

          <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            {tpl.description}
          </p>
        </div>
      ))}
    </div>
  );
}
