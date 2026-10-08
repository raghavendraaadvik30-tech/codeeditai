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

import React, { useState } from "react";
import { Check, X as XIcon, MessageSquare, Plus } from "lucide-react";
import { useTrackChanges } from "../hooks";
import type { TrackedChange, Comment } from "../types";
import { cn } from "@/lib/utils";

interface TrackedChangeCardProps {
  change: TrackedChange;
}

export function TrackedChangeCard({ change }: TrackedChangeCardProps) {
  const { acceptChange, rejectChange, addCommentToChange, activeChangeId, setActiveChangeId } =
    useTrackChanges();
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

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

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCommentToChange(change.id, commentText);
    setCommentText("");
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
          className="font-semibold text-foreground dark:text-muted truncate max-w-[150px] text-xs"
          title={change.author}
        >
          {change.author || "Current User"}
        </span>
        <span className="text-[11px] text-muted-foreground font-medium">
          {formattedTime}
        </span>
      </div>

      {/* 2. Badge & Change ID */}
      <div className="flex items-center gap-2 flex-wrap">
        {change.type === "delete" && (
          <span className="rounded bg-destructive/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-destructive border border-destructive/20 dark:bg-destructive/40 dark:text-destructive dark:border-destructive/60">
            DELETION
          </span>
        )}
        {change.type === "insert" && (
          <span className="rounded bg-success-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-success-700 border border-success-200 dark:bg-success-950/40 dark:text-success-400 dark:border-success-900/60">
            INSERTION
          </span>
        )}
        {change.type === "edit" && (
          <span className="rounded bg-warning-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-warning-700 border border-warning-200 dark:bg-warning-950/40 dark:text-warning-400 dark:border-warning-900/60">
            EDIT
          </span>
        )}

        <span className="text-[11px] text-muted-foreground font-mono">
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
                <div className="text-destructive dark:text-destructive line-through text-[11px] break-words">
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

      {/* 5. Comments Section */}
      <div
        className="border-t border-muted dark:border-muted pt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Comments ({change.comments?.length || 0})</span>
          </div>
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="text-xs text-muted-foreground hover:text-secondary-foreground dark:text-muted-foreground dark:hover:text-muted-foreground transition-colors font-medium"
          >
            {showComments ? "Hide" : "Show"}
          </button>
        </div>

        {showComments && (
          <div className="mt-2.5 space-y-2">
            {change.comments && change.comments.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto thin-scroll pr-1">
                {change.comments.map((c: Comment) => (
                  <div
                    key={c.id}
                    className="rounded-lg border border-secondary bg-muted/80 p-2 text-xs text-secondary-foreground dark:border-muted dark:bg-[#07131E] dark:text-muted-foreground"
                  >
                    <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground dark:text-muted-foreground mb-1">
                      <span>{c.author}</span>
                      <span>
                        {new Date(c.timestamp).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                    <div className="text-foreground dark:text-muted-foreground break-words leading-relaxed">
                      {c.text}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground italic">No comments on this change yet.</p>
            )}

            <form onSubmit={handleAddComment} className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="h-8 flex-1 rounded-md border border-secondary bg-muted px-2.5 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-brand focus:bg-card dark:border-secondary-foreground dark:bg-[#07131E] dark:text-primary-foreground"
              />
              <button
                type="submit"
                className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-primary-foreground hover:bg-brand transition-colors shrink-0"
                title="Add Comment"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackedChangeCard;
