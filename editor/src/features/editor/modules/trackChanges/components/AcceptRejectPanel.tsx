/**
 * --------------------------------------------------------
 * Module: Track Changes
 * Feature: Quick Accept / Reject Action Panel
 * Description:
 * Fast reviewer action control for iterating and batch reviewing changes.
 * --------------------------------------------------------
 */

import { Check, X as XIcon, ChevronLeft, ChevronRight, CheckCheck, Ban } from "lucide-react";
import { useTrackChanges } from "../hooks";

export function AcceptRejectPanel() {
  const {
    pendingChanges,
    acceptAll,
    rejectAll,
    prevChange,
    nextChange,
    trackedChanges,
    activeChangeId,
    acceptChange,
    rejectChange,
  } = useTrackChanges();

  const activeChange = trackedChanges.find((c) => c.id === activeChangeId && c.status === "pending");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-3 dark:border-slate-800 dark:bg-[#0E1A29]">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
        <span>Quick Review Controls</span>
        <span className="text-[10px] text-slate-400 font-normal">{pendingChanges} pending</span>
      </div>

      {/* Navigation & Active item action */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={prevChange}
          className="flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Previous</span>
        </button>
        <button
          type="button"
          onClick={nextChange}
          className="flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {activeChange && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-2 text-xs space-y-2 dark:border-blue-900/60 dark:bg-blue-950/20">
          <div className="text-[11px] font-semibold text-blue-900 dark:text-blue-300 truncate">
            Active: {activeChange.label || activeChange.type} by {activeChange.author}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => acceptChange(activeChange.id)}
              className="flex flex-1 items-center justify-center gap-1 rounded-md bg-emerald-600 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              <Check className="h-3 w-3" />
              <span>Accept</span>
            </button>
            <button
              type="button"
              onClick={() => rejectChange(activeChange.id)}
              className="flex flex-1 items-center justify-center gap-1 rounded-md bg-rose-600 py-1 text-[11px] font-semibold text-white hover:bg-rose-700 transition-colors"
            >
              <XIcon className="h-3 w-3" />
              <span>Reject</span>
            </button>
          </div>
        </div>
      )}

      {/* Batch Actions */}
      <div className="flex gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={acceptAll}
          disabled={pendingChanges === 0}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          <span>Accept All</span>
        </button>
        <button
          type="button"
          onClick={rejectAll}
          disabled={pendingChanges === 0}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50/50 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/20 dark:text-rose-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Ban className="h-3.5 w-3.5" />
          <span>Reject All</span>
        </button>
      </div>
    </div>
  );
}

export default AcceptRejectPanel;
