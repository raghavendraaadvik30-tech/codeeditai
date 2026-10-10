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
          className="group flex flex-col justify-between rounded-xl border border-secondary/80 bg-card p-3 transition-all hover:border-brand/60 dark:border-muted/80 dark:bg-[#091524] dark:hover:border-secondary-foreground"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-brand dark:bg-navy-950/40">
                <Table className="h-3.5 w-3.5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground dark:text-muted">
                  {tpl.title}
                </div>
                <div className="text-10px text-muted-foreground">
                  {tpl.rows} × {tpl.cols} · {tpl.style}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => insertTemplate(tpl)}
              className="flex h-6 items-center gap-1 rounded-md bg-button-primary px-2 text-11px font-medium text-button-primary-foreground hover:bg-button-primary-hover active:bg-button-primary-active transition-colors"
            >
              <Plus className="h-3 w-3" />
              Insert
            </button>
          </div>

          <p className="mt-2 text-11px leading-relaxed text-muted-foreground dark:text-muted-foreground">
            {tpl.description}
          </p>
        </div>
      ))}
    </div>
  );
}
