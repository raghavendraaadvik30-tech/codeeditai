/**
 * --------------------------------------------------------
 * Module: Track Changes
 * Feature: Track Changes Sidebar Panel
 * Description:
 * Management panel displaying active tracking toggle, Accept/Reject All buttons,
 * and the list of tracked change cards matching the reference screenshot.
 * --------------------------------------------------------
 */

import { Check, X as XIcon } from "lucide-react";
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
    <div className="flex flex-col select-none space-y-3 p-1">
      {/* 1. Tracking Toggle Button */}
      <button
        type="button"
        onClick={toggleTrackChanges}
        className={cn(
          "flex h-9 w-full items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-all shadow-xs",
          trackChanges
            ? "border border-slate-700 bg-[#21262d] text-slate-200 hover:bg-[#30363d] hover:text-white"
            : "bg-[#0078d4] text-white hover:bg-[#006cc1]"
        )}
      >
        <span>{trackChanges ? "Disable Tracking" : "Enable Tracking"}</span>
      </button>

      {/* 2. Mass Actions: Accept all & Reject all */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={acceptAll}
          disabled={pendingChanges === 0}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#0078d4] py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#006cc1] disabled:opacity-40 disabled:cursor-not-allowed"
          title="Accept all pending changes across all pages"
        >
          <Check className="h-3.5 w-3.5" />
          <span>Accept all</span>
        </button>
        <button
          type="button"
          onClick={rejectAll}
          disabled={pendingChanges === 0}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-[#21262d] py-2 text-xs font-semibold text-slate-200 shadow-xs transition-colors hover:bg-[#30363d] disabled:opacity-40 disabled:cursor-not-allowed"
          title="Reject all pending changes across all pages"
        >
          <XIcon className="h-3.5 w-3.5" />
          <span>Reject all</span>
        </button>
      </div>

      {/* 3. Section Title: CHANGES LIST (N) */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          CHANGES LIST ({pendingTrackedChanges.length})
        </h4>
      </div>

      {/* 4. Scrollable Changes List */}
      <div className="space-y-2.5 max-h-[calc(100vh-260px)] overflow-y-auto thin-scroll pr-0.5">
        {pendingTrackedChanges.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-[#10141b]/50 p-6 text-center text-slate-400">
            <p className="text-xs text-slate-400">No pending changes to review</p>
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
