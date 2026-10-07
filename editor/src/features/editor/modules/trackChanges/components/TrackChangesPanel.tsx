/**
 * --------------------------------------------------------
 * Module: Track Changes
 * Feature: Track Changes Sidebar Panel
 * Description:
 * Management panel displaying active tracking toggle, Accept/Reject All buttons,
 * and the list of tracked change cards in a clean white container.
 * --------------------------------------------------------
 */

import { Check, X as XIcon, GitCompare } from "lucide-react";
import { useTrackChanges } from "../hooks";
import { TrackedChangeCard } from "./TrackedChangeCard";
import { cn } from "@/lib/utils";

export function TrackChangesPanel() {
  const {
    trackChanges,
    toggleTrackChanges,
    pendingChanges,
    trackedChanges,
    acceptAll,
    rejectAll,
  } = useTrackChanges();

  const pendingTrackedChanges = trackedChanges.filter(
    (c) => c.status === "pending"
  );

  return (
    <div className="flex flex-col select-none space-y-3">
      {/* 1. Tracking Toggle Button */}
      <button
        type="button"
        onClick={toggleTrackChanges}
        className={cn(
          "flex h-9 w-full items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all shadow-xs",
          trackChanges
            ? "border border-primary/30 bg-primary/10 text-[#0078d4] hover:bg-primary/15 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-primary"
            : "bg-[#0078d4] text-primary-foreground hover:bg-[#006cc1]"
        )}
      >
        <GitCompare className="h-4 w-4" />
        <span>{trackChanges ? "Tracking is ON" : "Enable Tracking"}</span>
      </button>

      {/* 2. Mass Actions: Accept all & Reject all */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={acceptAll}
          disabled={pendingChanges === 0}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Accept all pending changes across all pages"
        >
          <Check className="h-3.5 w-3.5" />
          <span>Accept all</span>
        </button>
        <button
          type="button"
          onClick={rejectAll}
          disabled={pendingChanges === 0}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-destructive/10 py-2 text-xs font-semibold text-destructive shadow-xs transition-colors hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/20 dark:text-rose-400 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Reject all pending changes across all pages"
        >
          <XIcon className="h-3.5 w-3.5" />
          <span>Reject all</span>
        </button>
      </div>

      {/* 3. Section Title: CHANGES LIST (N) */}
      <div className="flex items-center justify-between pt-1 border-t border-secondary dark:border-muted">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
          CHANGES LIST ({pendingTrackedChanges.length})
        </h4>
      </div>

      {/* 4. Scrollable Changes List */}
      <div className="space-y-2.5 max-h-[calc(100vh-260px)] overflow-y-auto thin-scroll pr-0.5">
        {pendingTrackedChanges.length === 0 ? (
          <div className="rounded-xl border border-dashed border-secondary bg-muted/60 p-6 text-center text-muted-foreground dark:border-muted dark:bg-[#07131E]">
            <p className="text-xs text-muted-foreground dark:text-muted-foreground">No pending changes to review</p>
          </div>
        ) : (
          pendingTrackedChanges.map((change) => (
            <TrackedChangeCard key={change.id} change={change} />
          ))
        )}
      </div>
    </div>
  );
}

export default TrackChangesPanel;
