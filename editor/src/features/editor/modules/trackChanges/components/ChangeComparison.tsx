/**
 * --------------------------------------------------------
 * Module: Track Changes
 * Feature: Change Comparison & Visual Diff
 * Description:
 * Comparison tool displaying side-by-side or inline rich diffs for
 * reviewing document versions and tracked alterations.
 * --------------------------------------------------------
 */

import { useState } from "react";
import { GitCompare, Columns, AlignLeft } from "lucide-react";
import { diffWords } from "../utils";
import type { DiffToken } from "../types";

interface ChangeComparisonProps {
  originalContent?: string;
  modifiedContent?: string;
}

export function ChangeComparison({
  originalContent = "",
  modifiedContent = "",
}: ChangeComparisonProps) {
  const [viewMode, setViewMode] = useState<"inline" | "split">("inline");
  const oldText = originalContent;
  const newText = modifiedContent;

  const tokens: DiffToken[] = diffWords(oldText, newText);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-xs dark:border-slate-800 dark:bg-[#0E1A29]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-[#0078d4]" />
          <h4 className="font-bold text-slate-900 dark:text-white">Diff Comparison</h4>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode("inline")}
            className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors ${
              viewMode === "inline"
                ? "bg-[#0078d4] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <AlignLeft className="h-3 w-3" />
            <span>Inline</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors ${
              viewMode === "split"
                ? "bg-[#0078d4] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <Columns className="h-3 w-3" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {viewMode === "inline" ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 font-sans text-xs leading-relaxed dark:border-slate-700 dark:bg-[#07131E] max-h-60 overflow-y-auto thin-scroll">
          {tokens.map((token, i) => {
            if (token.type === "added") {
              return (
                <ins
                  key={i}
                  className="bg-emerald-100/70 text-emerald-800 underline dark:bg-emerald-950/60 dark:text-emerald-300"
                >
                  {token.value}
                </ins>
              );
            }
            if (token.type === "removed") {
              return (
                <del
                  key={i}
                  className="bg-rose-100/70 text-rose-800 line-through dark:bg-rose-950/60 dark:text-rose-300"
                >
                  {token.value}
                </del>
              );
            }
            return <span key={i}>{token.value}</span>;
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto thin-scroll">
          <div className="rounded-lg border border-rose-200 bg-rose-50/30 p-2 text-xs dark:border-rose-900/40 dark:bg-rose-950/10">
            <span className="text-[10px] font-bold text-rose-600 uppercase block mb-1">Original</span>
            <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{oldText || "No original content"}</div>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/30 p-2 text-xs dark:border-emerald-900/40 dark:bg-emerald-950/10">
            <span className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">Modified</span>
            <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{newText || "No modified content"}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChangeComparison;
