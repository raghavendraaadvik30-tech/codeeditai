/**
 * --------------------------------------------------------
 * Module: Comments
 * Feature: Comments Panel Component
 * Description:
 * Right-side comments pane displaying active discussions,
 * resolution filters, draft composer, and navigation between threads.
 * --------------------------------------------------------
 */

import { useState } from "react";
import {
  MessageSquare,
  X,
  Plus,
} from "lucide-react";
import { useComments } from "./context/CommentsContext";
import CommentComposer from "./CommentComposer";
import CommentThread from "./CommentThread";

export default function CommentsPanel() {
  const {
    comments,
    activeCommentId,
    isDraftingComment,
    draftAnchor,
    closeCommentsPanel,
    createCommentFromSelection,
    submitNewComment,
    cancelDraftComment,
    deleteComment,
    resolveComment,
    reopenComment,
    editComment,
    addReply,
    deleteReply,
    setActiveCommentId,
    scrollToCommentAnchor,
  } = useComments();

  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");

  const filteredComments = comments.filter((c) => {
    if (filter === "active") return c.status === "open";
    if (filter === "resolved") return c.status === "resolved";
    return true;
  });

  const openCount = comments.filter((c) => c.status === "open").length;
  const resolvedCount = comments.filter((c) => c.status === "resolved").length;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white text-foreground dark:bg-[#0D213D] dark:text-muted">
      {/* HEADER */}
      <div
        className="
          flex
          h-13
          shrink-0
          items-center
          justify-between
          border-b
          border-[#E2E8F0]
          bg-white
          px-3.5
          dark:border-[#294564]
          dark:bg-[#0D213D]
        "
      >
        <div className="flex items-center gap-2.5">
          <div
            className="
              flex
              h-7.5
              w-7.5
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-[#EFF6FF]
              text-[#2563EB]
              dark:bg-[#1E3A8A]
              dark:text-[#93C5FD]
            "
          >
            <MessageSquare className="h-4 w-4" />
          </div>

          <div>
            <h2 className="text-xs font-bold text-[#0F172A] dark:text-white leading-tight">
              Comments
            </h2>
            <p className="text-[10px] text-[#64748B] dark:text-slate-400 leading-tight">
              {openCount} active {openCount === 1 ? "thread" : "threads"}
              {resolvedCount > 0 && ` • ${resolvedCount} resolved`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={closeCommentsPanel}
          className="
            flex
            h-6
            w-6
            shrink-0
            items-center
            justify-center
            rounded-md
            text-slate-400
            hover:text-slate-600
            hover:bg-slate-100
            dark:hover:bg-white/10
            dark:hover:text-white
            transition-colors
            cursor-pointer
          "
          aria-label="Close comments panel"
          title="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center justify-between border-b border-[#F1F5F9] bg-[#F8FAFC] px-3.5 py-2 dark:border-[#20364F] dark:bg-[#0A1828]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`
              rounded-md
              px-2
              py-0.5
              text-[11px]
              font-semibold
              transition-colors
              cursor-pointer
              ${
                filter === "all"
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-white"
              }
            `}
          >
            All ({comments.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter("active")}
            className={`
              rounded-md
              px-2
              py-0.5
              text-[11px]
              font-semibold
              transition-colors
              cursor-pointer
              ${
                filter === "active"
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-white"
              }
            `}
          >
            Active ({openCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter("resolved")}
            className={`
              rounded-md
              px-2
              py-0.5
              text-[11px]
              font-semibold
              transition-colors
              cursor-pointer
              ${
                filter === "resolved"
                  ? "bg-[#2563EB] text-white shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A] dark:text-slate-400 dark:hover:text-white"
              }
            `}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        {/* Quick New Comment button */}
        <button
          type="button"
          onClick={() => createCommentFromSelection()}
          title="New Comment on selected text"
          className="
            flex
            items-center
            gap-1
            rounded-md
            bg-white
            border
            border-[#CBD5E1]
            px-2
            py-0.5
            text-[11px]
            font-medium
            text-[#1E293B]
            hover:border-[#2563EB]
            hover:text-[#2563EB]
            shadow-2xs
            transition-colors
            dark:bg-[#112338]
            dark:border-slate-600
            dark:text-slate-200
            cursor-pointer
          "
        >
          <Plus className="h-3 w-3" />
          <span>New</span>
        </button>
      </div>

      {/* COMMENTS LIST AREA */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
        {/* Draft Comment Composer (if drafting) */}
        {isDraftingComment && draftAnchor && (
          <CommentComposer
            selectedText={draftAnchor.selectedText}
            placeholder="Type your comment..."
            onSubmit={submitNewComment}
            onCancel={cancelDraftComment}
          />
        )}

        {/* Empty State */}
        {filteredComments.length === 0 && !isDraftingComment ? (
          <div className="flex h-56 flex-col items-center justify-center text-center px-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB] dark:bg-[#172B4D] dark:text-[#93C5FD] mb-2.5">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-bold text-[#0F172A] dark:text-white">
              No {filter !== "all" ? filter : ""} comments
            </h3>
            <p className="mt-1 text-[11px] text-[#64748B] dark:text-slate-400 max-w-56 leading-relaxed">
              Select any text in the document and click{" "}
              <strong className="text-[#2563EB] dark:text-[#38BDF8]">New Comment</strong> in
              the Review ribbon to attach feedback or start a discussion.
            </p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              isActive={activeCommentId === comment.id}
              onSelect={(id) => {
                setActiveCommentId(id);
                scrollToCommentAnchor(id);
              }}
              onResolve={resolveComment}
              onReopen={reopenComment}
              onDelete={deleteComment}
              onEdit={editComment}
              onAddReply={addReply}
              onDeleteReply={deleteReply}
              onNavigateToAnchor={scrollToCommentAnchor}
            />
          ))
        )}
      </div>
    </div>
  );
}
