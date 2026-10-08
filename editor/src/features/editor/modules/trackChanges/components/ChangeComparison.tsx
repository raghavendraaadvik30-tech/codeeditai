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
    <div className="flex flex-col gap-3 rounded-xl border border-secondary bg-card p-3.5 text-xs dark:border-muted dark:bg-[#0E1A29]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-[#0078d4]" />
          <h4 className="font-bold text-foreground dark:text-primary-foreground">Diff Comparison</h4>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode("inline")}
            className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors ${
              viewMode === "inline"
                ? "bg-[#0078d4] text-primary-foreground"
                : "bg-muted text-secondary-foreground hover:bg-secondary dark:bg-muted dark:text-muted-foreground"
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
                ? "bg-[#0078d4] text-primary-foreground"
                : "bg-muted text-secondary-foreground hover:bg-secondary dark:bg-muted dark:text-muted-foreground"
            }`}
          >
            <Columns className="h-3 w-3" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {viewMode === "inline" ? (
        <div className="rounded-lg border border-secondary bg-muted/60 p-3 font-sans text-xs leading-relaxed dark:border-secondary-foreground dark:bg-[#07131E] max-h-60 overflow-y-auto thin-scroll">
          {tokens.map((token, i) => {
            if (token.type === "added") {
              return (
                <ins
                  key={i}
                  className="bg-success-100/70 text-success-800 underline dark:bg-success-950/60 dark:text-success-300"
                >
                  {token.value}
                </ins>
              );
            }
            if (token.type === "removed") {
              return (
                <del
                  key={i}
                  className="bg-destructive/70 text-destructive/60 line-through dark:bg-destructive/60 dark:text-destructive/30"
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
          <div className="rounded-lg border border-destructive/20 bg-destructive/30 p-2 text-xs dark:border-destructive/40 dark:bg-destructive/10">
            <span className="text-[10px] font-bold text-destructive uppercase block mb-1">Original</span>
            <div className="text-secondary-foreground dark:text-muted-foreground whitespace-pre-wrap">{oldText || "No original content"}</div>
          </div>
          <div className="rounded-lg border border-success-200 bg-success-50/30 p-2 text-xs dark:border-success-900/40 dark:bg-success-950/10">
            <span className="text-[10px] font-bold text-success-600 uppercase block mb-1">Modified</span>
            <div className="text-secondary-foreground dark:text-muted-foreground whitespace-pre-wrap">{newText || "No modified content"}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChangeComparison;
