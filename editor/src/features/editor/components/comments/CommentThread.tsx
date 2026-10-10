/**
 * --------------------------------------------------------
 * Module: Comments
 * Feature: Comment Thread Card Component
 * Description:
 * Displays a comment thread with author attribution, quoted text,
 * reply discussions, resolution status, and editing/deletion actions.
 * --------------------------------------------------------
 */

import { useState } from "react";
import {
  Check,
  RotateCcw,
  Trash2,
  Edit2,
  MessageSquare,
  CornerDownRight,
  MoreHorizontal,
  X,
  ExternalLink,
} from "lucide-react";
import type { DocumentComment } from "./comments.types";
import CommentComposer from "./CommentComposer";

interface CommentThreadProps {
  comment: DocumentComment;
  isActive: boolean;
  onSelect: (commentId: string) => void;
  onResolve: (commentId: string) => void;
  onReopen: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onEdit: (commentId: string, newContent: string) => void;
  onAddReply: (commentId: string, content: string) => void;
  onDeleteReply: (commentId: string, replyId: string) => void;
  onNavigateToAnchor: (commentId: string) => void;
}

function formatTimestamp(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return new Date(timestamp).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CommentThread({
  comment,
  isActive,
  onSelect,
  onResolve,
  onReopen,
  onDelete,
  onEdit,
  onAddReply,
  onDeleteReply,
  onNavigateToAnchor,
}: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);

  const isResolved = comment.status === "resolved";

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      onEdit(comment.id, editContent.trim());
      setIsEditing(false);
    }
  };

  return (
    <div
      onClick={() => onSelect(comment.id)}
      className={`
        rounded-xl
        border
        p-3.5
        transition-all
        cursor-pointer
        ${
          isActive
            ? "border-[#2563EB] bg-[#F8FAFC] shadow-sm ring-1 ring-[#2563EB]/40 dark:border-[#38BDF8] dark:bg-[#122438] dark:ring-[#38BDF8]/40"
            : isResolved
            ? "border-[#E2E8F0] bg-slate-50/70 opacity-75 dark:border-[#20364F] dark:bg-[#0A1828]/60"
            : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:shadow-xs dark:border-[#294564] dark:bg-[#0D213D] dark:hover:border-slate-600"
        }
      `}
    >
      {/* Quoted Document Text */}
      {comment.selectedText && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onNavigateToAnchor(comment.id);
          }}
          title="Click to jump to this text in the document"
          className="
            mb-2.5
            flex
            items-center
            justify-between
            rounded-md
            bg-[#EFF6FF]
            px-2.5
            py-1.5
            text-xs
            text-[#1D4ED8]
            border-l-2
            border-[#2563EB]
            italic
            hover:bg-[#DBEAFE]
            transition-colors
            dark:bg-[#172B4D]
            dark:text-[#93C5FD]
            cursor-pointer
          "
        >
          <span className="line-clamp-2">"{comment.selectedText}"</span>
          <ExternalLink className="h-3 w-3 shrink-0 ml-1.5 opacity-60" />
        </div>
      )}

      {/* Author Header & Menu */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D3E3FD] text-xs font-bold text-[#102A43] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]">
            {comment.authorAvatar || "BC"}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#0F172A] dark:text-white">
                {comment.author}
              </span>

              {isResolved && (
                <span className="flex items-center gap-0.5 rounded-full bg-[#D1FAE5] px-1.5 py-0.2 text-[9px] font-semibold text-[#065F46] dark:bg-[#064E3B] dark:text-[#A7F3D0]">
                  <Check className="h-2.5 w-2.5" />
                  <span>Resolved</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-[#64748B] dark:text-slate-400">
              {comment.authorRole && <span>{comment.authorRole}</span>}
              <span>•</span>
              <span>{formatTimestamp(comment.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Menu Actions */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>

          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full z-20 mt-1 w-32 rounded-lg border border-[#E2E8F0] bg-white py-1 shadow-lg dark:border-[#294564] dark:bg-[#112338]"
            >
              {isResolved ? (
                <button
                  type="button"
                  onClick={() => {
                    onReopen(comment.id);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-[#0F172A] hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reopen</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onResolve(comment.id);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-[#059669] hover:bg-slate-50 dark:text-[#34D399] dark:hover:bg-white/10"
                >
                  <Check className="h-3 w-3" />
                  <span>Resolve</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-[#0F172A] hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/10"
              >
                <Edit2 className="h-3 w-3" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm("Delete this comment thread?")) {
                    onDelete(comment.id);
                  }
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="h-3 w-3" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comment Body / Edit Form */}
      <div className="mt-2.5">
        {isEditing ? (
          <div onClick={(e) => e.stopPropagation()} className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-lg border border-[#2563EB] bg-white p-2 text-xs text-[#0F172A] outline-none dark:bg-[#0B1726] dark:text-white"
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="rounded bg-[#2563EB] px-2.5 py-0.5 text-xs font-semibold text-white hover:bg-[#1D4ED8]"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#0F172A] dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
            {comment.content}
          </p>
        )}
      </div>

      {/* Replies Thread */}
      {comment.replies.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-[#F1F5F9] pt-2.5 dark:border-[#1E3048]">
          {comment.replies.map((reply) => (
            <div
              key={reply.id}
              className="ml-3 rounded-lg bg-[#F8FAFC] p-2 text-xs border border-[#E2E8F0] dark:bg-[#0E1E30] dark:border-[#20364F]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D3E3FD] text-[10px] font-bold text-[#102A43] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]">
                    {reply.authorAvatar || "U"}
                  </div>
                  <span className="font-semibold text-[#0F172A] dark:text-white">
                    {reply.author}
                  </span>
                  <span className="text-[10px] text-[#94A3B8]">
                    {formatTimestamp(reply.createdAt)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteReply(comment.id, reply.id);
                  }}
                  title="Delete reply"
                  className="text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              <p className="mt-1 pl-6 text-[#334155] dark:text-slate-300 whitespace-pre-wrap">
                {reply.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Reply Composer or Reply Button */}
      <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
        {!isResolved && !isReplying && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsReplying(true);
            }}
            className="flex items-center gap-1 text-[11px] font-medium text-[#2563EB] hover:text-[#1D4ED8] dark:text-[#38BDF8] transition-colors cursor-pointer"
          >
            <CornerDownRight className="h-3 w-3" />
            <span>Reply</span>
          </button>
        )}

        <div className="ml-auto flex items-center gap-1 text-[11px] text-[#64748B] dark:text-slate-400">
          <MessageSquare className="h-3 w-3" />
          <span>{comment.replies.length}</span>
        </div>
      </div>

      {/* Embedded Reply Composer */}
      {isReplying && (
        <div onClick={(e) => e.stopPropagation()}>
          <CommentComposer
            isReply
            placeholder="Write a reply..."
            onSubmit={(content) => {
              onAddReply(comment.id, content);
              setIsReplying(false);
            }}
            onCancel={() => setIsReplying(false)}
          />
        </div>
      )}
    </div>
  );
}
