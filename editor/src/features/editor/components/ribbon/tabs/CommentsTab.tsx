/**
 * --------------------------------------------------------
 * Module: Ribbon
 * Feature: Comments Tab Toolbar
 * Description:
 * Ribbon tab providing Microsoft Word-style Comment controls:
 * New Comment, Delete, Previous, Next, and Show Comments.
 * Connects directly to the existing Comments context and handlers.
 * --------------------------------------------------------
 */

import {
  PlusCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { useComments } from "../../comments";

export default function CommentsTab() {
  const {
    comments,
    activeCommentId,
    isCommentsPanelOpen,
    createCommentFromSelection,
    deleteComment,
    goToPreviousComment,
    goToNextComment,
    toggleCommentsPanel,
  } = useComments();

  return (
    <div className="flex items-center gap-10 px-4 py-1 select-none">
      {/* 1. NEW COMMENT */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => createCommentFromSelection()}
        title="New Comment: Add a comment about the selected text (Ctrl+Alt+M)"
        className="
          flex
          flex-col
          items-center
          justify-center
          rounded-md
          px-3
          py-1.5
          text-xs
          font-medium
          text-[#324480]
          hover:bg-slate-100
          active:bg-slate-200
          dark:text-slate-200
          dark:hover:bg-white/10
          transition-colors
          cursor-pointer
        "
      >
        <PlusCircle className="h-5 w-5 text-[#324480] dark:text-slate-200" />
        <span className="mt-1 text-xs leading-none">New Comment</span>
      </button>

      {/* 2. DELETE */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (activeCommentId) {
            if (confirm("Delete the selected comment?")) {
              deleteComment(activeCommentId);
            }
          }
        }}
        disabled={!activeCommentId || comments.length === 0}
        title={activeCommentId ? "Delete Selected Comment" : "No comment selected to delete"}
        className="
          flex
          flex-col
          items-center
          justify-center
          rounded-md
          px-3
          py-1.5
          text-xs
          font-medium
          text-[#324480]
          hover:bg-slate-100
          active:bg-slate-200
          disabled:opacity-40
          disabled:pointer-events-none
          dark:text-slate-200
          dark:hover:bg-white/10
          transition-colors
          cursor-pointer
        "
      >
        <Trash2 className="h-5 w-5 text-[#324480] dark:text-slate-200" />
        <span className="mt-1 text-xs leading-none">Delete</span>
      </button>

      {/* 3. PREVIOUS */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={goToPreviousComment}
        disabled={comments.length === 0}
        title="Go to Previous Comment"
        className="
          flex
          flex-col
          items-center
          justify-center
          rounded-md
          px-3
          py-1.5
          text-xs
          font-medium
          text-[#324480]
          hover:bg-slate-100
          active:bg-slate-200
          disabled:opacity-40
          disabled:pointer-events-none
          dark:text-slate-200
          dark:hover:bg-white/10
          transition-colors
          cursor-pointer
        "
      >
        <ChevronLeft className="h-5 w-5 text-[#324480] dark:text-slate-200" />
        <span className="mt-1 text-xs leading-none">Previous</span>
      </button>

      {/* 4. NEXT */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={goToNextComment}
        disabled={comments.length === 0}
        title="Go to Next Comment"
        className="
          flex
          flex-col
          items-center
          justify-center
          rounded-md
          px-3
          py-1.5
          text-xs
          font-medium
          text-[#324480]
          hover:bg-slate-100
          active:bg-slate-200
          disabled:opacity-40
          disabled:pointer-events-none
          dark:text-slate-200
          dark:hover:bg-white/10
          transition-colors
          cursor-pointer
        "
      >
        <ChevronRight className="h-5 w-5 text-[#324480] dark:text-slate-200" />
        <span className="mt-1 text-xs leading-none">Next</span>
      </button>

      {/* 5. SHOW COMMENTS */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={toggleCommentsPanel}
        title="Show or hide the Comments pane"
        className={`
          flex
          flex-col
          items-center
          justify-center
          rounded-md
          px-3
          py-1.5
          text-xs
          font-medium
          transition-colors
          cursor-pointer
          ${
            isCommentsPanelOpen
              ? "bg-[#EFF6FF] text-[#E82D91] border border-[#E82D91]/40 dark:bg-[#1E3A8A] dark:text-[#93C5FD]"
              : "text-[#324480] hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
          }
        `}
      >
        <MessageSquare className="h-5 w-5" />
        <span className="mt-1 text-xs leading-none">Show Comments</span>
      </button>
    </div>
  );
}
