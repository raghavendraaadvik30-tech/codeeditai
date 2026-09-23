/**
 * --------------------------------------------------------
 * Module: Track Changes
 * Feature: Change History & Revision Log
 * Description:
 * History component listing all accepted, rejected, and pending changes
 * with author metadata, timestamps, and audit metrics.
 * --------------------------------------------------------
 */

import { useState } from "react";
import { History, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useTrackChanges } from "../hooks";
import type { TrackChangeStatus } from "../types";

export function ChangeHistory() {
  const { trackedChanges } = useTrackChanges();
  const [filter, setFilter] = useState<TrackChangeStatus | "all">("all");

  const filtered = trackedChanges.filter((c) => (filter === "all" ? true : c.status === filter));

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-xs dark:border-slate-800 dark:bg-[#0E1A29]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-[#0078d4]" />
          <h4 className="font-bold text-slate-900 dark:text-white">Revision History</h4>
        </div>
        <div className="flex items-center gap-1">
          {(["all", "pending", "accepted", "rejected"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider transition-colors ${
                filter === s
                  ? "bg-[#0078d4] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5 max-h-56 overflow-y-auto thin-scroll pr-1">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-slate-400 dark:border-slate-800">
            No revisions found
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 p-2 dark:border-slate-800 dark:bg-[#07131E]"
            >
              <div className="flex items-center gap-2 min-w-0">
                {item.status === "accepted" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
                {item.status === "rejected" && <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />}
                {item.status === "pending" && <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                    {item.label || `${item.type.toUpperCase()}`}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    by {item.author} · {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
              <span
                className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                  item.status === "accepted"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : item.status === "rejected"
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ChangeHistory;
