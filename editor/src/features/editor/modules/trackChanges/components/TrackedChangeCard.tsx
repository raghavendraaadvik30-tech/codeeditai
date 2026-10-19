/**
 * --------------------------------------------------------
 * Module: Track Changes
 * Feature: Tracked Change Item Card
 * Description:
 * Card component presenting an individual tracked change in a clean white box
 * with human-readable action labels, text diff preview, scroll-to-view selection,
 * Accept/Reject actions, and interactive comment threads.
 * --------------------------------------------------------
 */


import { Check, X as XIcon } from "lucide-react";
import { useTrackChanges } from "../hooks";
import type { TrackedChange } from "../types";
import { cn } from "@/lib/utils";

interface TrackedChangeCardProps {
  change: TrackedChange;
}

export function TrackedChangeCard({ change }: TrackedChangeCardProps) {
  const { acceptChange, rejectChange,  activeChangeId, setActiveChangeId } =
    useTrackChanges();
  

  const isSelected = activeChangeId === change.id;

  const handleCardClick = () => {
    setActiveChangeId(change.id);
    const el = document.querySelector(`[data-tc-id="${change.id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };



  const formattedTime = new Date(change.timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group flex flex-col gap-2.5 rounded-xl border p-3.5 text-xs transition-all cursor-pointer shadow-xs",
        isSelected
          ? "border-primary bg-primary/40 ring-1 ring-primary/30 dark:bg-[#162536] dark:border-primary"
          : "border-secondary bg-card hover:border-border dark:border-muted dark:bg-[#111D29]"
      )}
    >
      {/* 1. Header: Author & Formatted Time */}
      <div className="flex items-center justify-between">
        <span
          className="font-semibold text-foreground dark:text-muted truncate max-w-37.5 text-xs"
          title={change.author}
        >
          {change.author || "Current User"}
        </span>
        <span className="text-11px text-muted-foreground font-medium">
          {formattedTime}
        </span>
      </div>

      {/* 2. Badge & Change ID */}
      <div className="flex items-center gap-2 flex-wrap">
        {change.type === "delete" && (
          <span className="rounded bg-destructive/10 px-2 py-0.5 text-9px font-bold uppercase tracking-wider text-destructive border border-destructive/20 dark:bg-destructive/40 dark:text-destructive dark:border-destructive/60">
            DELETION
          </span>
        )}
        {change.type === "insert" && (
          <span className="rounded bg-success-50 px-2 py-0.5 text-9px font-bold uppercase tracking-wider text-success-700 border border-success-200 dark:bg-success-950/40 dark:text-success-400 dark:border-success-900/60">
            INSERTION
          </span>
        )}
        {change.type === "edit" && (
          <span className="rounded bg-warning-50 px-2 py-0.5 text-9px font-bold uppercase tracking-wider text-warning-700 border border-warning-200 dark:bg-warning-950/40 dark:text-warning-400 dark:border-warning-900/60">
            EDIT
          </span>
        )}

        <span className="text-11px text-muted-foreground font-mono">
          ID: {change.id}
        </span>
      </div>

      {/* 3. Text Preview Snippet with accent bar */}
      {(change.newText || change.originalText) && (
        <div className="my-0.5">
          {change.type === "insert" && change.newText && (
            <div className="border-l-2 border-success-500 pl-2 text-xs font-medium text-success-700 dark:text-success-400 break-words bg-success-50/30 p-1 rounded-r">
              {change.newText}
            </div>
          )}
          {change.type === "delete" && change.originalText && (
            <div className="border-l-2 border-destructive pl-2 text-xs font-medium text-destructive dark:text-destructive line-through break-words bg-destructive/30 p-1 rounded-r">
              {change.originalText}
            </div>
          )}
          {change.type === "edit" && (
            <div className="border-l-2 border-warning-500 pl-2 text-xs space-y-0.5 bg-warning-50/20 p-1 rounded-r">
              {change.originalText && (
                <div className="text-destructive dark:text-destructive line-through text-11px break-words">
                  {change.originalText}
                </div>
              )}
              {change.newText && (
                <div className="text-success-700 dark:text-success-400 font-medium underline text-xs break-words">
                  {change.newText}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Action Buttons: Accept & Reject */}
      <div
        className="flex items-center gap-2 mt-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => acceptChange(change.id)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-success-200 bg-success-50 py-1.5 text-xs font-medium text-success-700 hover:bg-success-100 transition-colors dark:border-success-900/60 dark:bg-success-950/30 dark:text-success-400"
        >
          <Check className="h-3.5 w-3.5" />
          <span>Accept</span>
        </button>
        <button
          type="button"
          onClick={() => rejectChange(change.id)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/10 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors dark:border-destructive/60 dark:bg-destructive/30 dark:text-destructive"
        >
          <XIcon className="h-3.5 w-3.5" />
          <span>Reject</span>
        </button>
      </div>



    </div>
  );
}

export default TrackedChangeCard;
