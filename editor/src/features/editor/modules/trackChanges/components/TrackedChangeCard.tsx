/**
 * --------------------------------------------------------
 * Module: Track Changes
 * Feature: Tracked Change Item Card
 * Description:
 * Card component presenting an individual tracked change with human-readable
 * action labels, text diff preview, scroll-to-view selection, Accept/Reject
 * actions, and interactive comment threads matching the reference screenshot.
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
          ? "border-blue-500 bg-[#1e2430] ring-1 ring-blue-500/40"
          : "border-slate-800/80 bg-[#161b22] hover:border-slate-700/80"
      )}
    >
      {/* 1. Header: Author & Formatted Time */}
      <div className="flex items-center justify-between">
        <span
          className="font-semibold text-slate-100 truncate max-w-[150px] text-xs"
          title={change.author}
        >
          {change.author || "Current User"}
        </span>
        <span className="text-[11px] text-slate-400 font-medium">
          {formattedTime}
        </span>
      </div>

      {/* 2. Badge & Change ID */}
      <div className="flex items-center gap-2 flex-wrap">
        {change.type === "delete" && (
          <span className="rounded bg-[#3f1619] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#f87171] border border-[#5d1c24]">
            DELETION
          </span>
        )}
        {change.type === "insert" && (
          <span className="rounded bg-[#0f2d1e] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#4ade80] border border-[#1b5035]">
            INSERTION
          </span>
        )}
        {change.type === "edit" && (
          <span className="rounded bg-[#382405] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#fbbf24] border border-[#5c3c0a]">
            EDIT
          </span>
        )}

        <span className="text-[11px] text-slate-400 font-mono">
          ID: {change.id}
        </span>
      </div>

      {/* 3. Text Preview Snippet with accent bar */}
      {(change.newText || change.originalText) && (
        <div className="my-0.5">
          {change.type === "insert" && change.newText && (
            <div className="border-l-2 border-emerald-500 pl-2 text-xs font-medium text-emerald-400 break-words">
              {change.newText}
            </div>
          )}
          {change.type === "delete" && change.originalText && (
            <div className="border-l-2 border-rose-500 pl-2 text-xs font-medium text-rose-400 line-through break-words">
              {change.originalText}
            </div>
          )}
          {change.type === "edit" && (
            <div className="border-l-2 border-amber-500 pl-2 text-xs space-y-0.5">
              {change.originalText && (
                <div className="text-rose-400 line-through text-[11px] break-words">
                  {change.originalText}
                </div>
              )}
              {change.newText && (
                <div className="text-emerald-400 font-medium underline text-xs break-words">
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
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#1b5035] bg-[#0f2d1e]/50 py-1.5 text-xs font-medium text-[#4ade80] hover:bg-[#0f2d1e] transition-colors"
        >
          <Check className="h-3.5 w-3.5" />
          <span>Accept</span>
        </button>
        <button
          type="button"
          onClick={() => rejectChange(change.id)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#5d1c24] bg-[#3f1619]/50 py-1.5 text-xs font-medium text-[#f87171] hover:bg-[#3f1619] transition-colors"
        >
          <XIcon className="h-3.5 w-3.5" />
          <span>Reject</span>
        </button>
      </div>

      {/* 5. Comments Section */}
      <div
        className="border-t border-slate-800/80 pt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Comments ({change.comments?.length || 0})</span>
          </div>
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium"
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
                    className="rounded-lg border border-slate-800 bg-[#10141b] p-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
                      <span>{c.author}</span>
                      <span>
                        {new Date(c.timestamp).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                    <div className="text-slate-200 break-words leading-relaxed">
                      {c.text}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic">No comments on this change yet.</p>
            )}

            <form onSubmit={handleAddComment} className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="h-8 flex-1 rounded-md border border-slate-700 bg-[#10141b] px-2.5 text-xs text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0078d4] text-white hover:bg-[#006cc1] transition-colors shrink-0"
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
