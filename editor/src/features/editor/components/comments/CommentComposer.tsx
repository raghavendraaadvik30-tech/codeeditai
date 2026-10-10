/**
 * --------------------------------------------------------
 * Module: Comments
 * Feature: Comment Composer Component
 * Description:
 * Input area for drafting a new comment or entering a thread reply.
 * --------------------------------------------------------
 */

import { useState, useEffect, useRef } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Send, X, CornerDownRight } from "lucide-react";

interface CommentComposerProps {
  selectedText?: string;
  authorName?: string;
  authorAvatar?: string;
  placeholder?: string;
  isReply?: boolean;
  onSubmit: (content: string) => void;
  onCancel: () => void;
}

export default function CommentComposer({
  selectedText,
  authorName = "Bhumika C",
  authorAvatar = "BC",
  placeholder = "Add a comment...",
  isReply = false,
  onSubmit,
  onCancel,
}: CommentComposerProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content.trim());
    setContent("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      className={`
        rounded-xl
        border
        border-[#D3E7F4]
        bg-white
        p-3
        shadow-sm
        transition-all
        dark:border-[#294564]
        dark:bg-[#112338]
        ${isReply ? "mt-2 ml-4 border-l-2 border-l-[#2563EB]" : "mb-3"}
      `}
    >
      {/* Selected text quote if starting a top-level comment */}
      {!isReply && selectedText && (
        <div className="mb-2.5 rounded-md bg-[#EFF6FF] px-2.5 py-1.5 text-xs text-[#1D4ED8] dark:bg-[#172B4D] dark:text-[#93C5FD] border-l-2 border-[#2563EB] italic line-clamp-2">
          "{selectedText}"
        </div>
      )}

      {/* Author Header */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D3E3FD] text-[11px] font-bold text-[#102A43] dark:bg-[#1E3A8A] dark:text-[#BFDBFE]">
          {authorAvatar}
        </div>
        <span className="text-xs font-semibold text-[#0F172A] dark:text-white">
          {authorName}
        </span>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={2}
        className="
          w-full
          resize-none
          rounded-lg
          border
          border-[#E2E8F0]
          bg-[#F8FAFC]
          p-2
          text-xs
          text-[#0F172A]
          placeholder-[#94A3B8]
          outline-none
          focus:border-[#2563EB]
          focus:bg-white
          focus:ring-1
          focus:ring-[#2563EB]
          dark:border-[#294564]
          dark:bg-[#0B1726]
          dark:text-slate-200
          dark:placeholder-slate-500
          dark:focus:border-[#38BDF8]
        "
      />

      {/* Actions */}
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-[#94A3B8]">
          Ctrl+Enter to post
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onCancel}
            className="
              flex
              h-6.5
              items-center
              gap-1
              rounded-md
              px-2
              text-xs
              text-[#64748B]
              hover:bg-slate-100
              hover:text-[#0F172A]
              dark:text-slate-400
              dark:hover:bg-white/10
              dark:hover:text-white
              transition-colors
              cursor-pointer
            "
          >
            <X className="h-3 w-3" />
            <span>Cancel</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={!content.trim()}
            className="
              flex
              h-6.5
              items-center
              gap-1.5
              rounded-md
              bg-[#2563EB]
              px-2.5
              text-xs
              font-semibold
              text-white
              shadow-xs
              hover:bg-[#1D4ED8]
              disabled:opacity-40
              disabled:cursor-not-allowed
              transition-colors
              cursor-pointer
            "
          >
            {isReply ? (
              <>
                <CornerDownRight className="h-3 w-3" />
                <span>Reply</span>
              </>
            ) : (
              <>
                <Send className="h-3 w-3" />
                <span>Post</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
