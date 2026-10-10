/**
 * --------------------------------------------------------
 * Module: Comments
 * Feature: Comments Context Provider
 * Description:
 * Manages document comment threads, selection text anchoring,
 * navigation between comments, reply discussions, and persistence.
 * --------------------------------------------------------
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  CommentsContextValue,
  DocumentComment,
  DraftCommentAnchor,
} from "../comments.types";
import { useSettings } from "@/features/editor/modules/settings/hooks";

const COMMENTS_STORAGE_KEY = "paraexcel_document_comments_v1";

const CommentsContext = createContext<CommentsContextValue | null>(null);

export function CommentsProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();

  // 1. Comments State & Persistence
  const [comments, setComments] = useState<DocumentComment[]>(() => {
    try {
      const saved = localStorage.getItem(COMMENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [isCommentsPanelOpen, setIsCommentsPanelOpen] = useState(false);
  const [isDraftingComment, setIsDraftingComment] = useState(false);
  const [draftAnchor, setDraftAnchor] = useState<DraftCommentAnchor | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
    } catch {
      // ignore
    }
  }, [comments]);

  // Author details fallback
  const currentAuthor = settings?.userName || "Bhumika C";
  const currentAvatar = settings?.userAvatarInitials || "BC";
  const currentRole = settings?.userDesignation || "Medical Writer";

  // 2. Open / Close / Toggle Panel
  const openCommentsPanel = useCallback(() => {
    setIsCommentsPanelOpen(true);
  }, []);

  const closeCommentsPanel = useCallback(() => {
    setIsCommentsPanelOpen(false);
  }, []);

  const toggleCommentsPanel = useCallback(() => {
    setIsCommentsPanelOpen((prev) => !prev);
  }, []);

  // 3. Highlight synchronization in DOM when activeCommentId changes
  useEffect(() => {
    const marks = document.querySelectorAll<HTMLElement>("mark[data-comment-id]");
    marks.forEach((mark) => {
      const cId = mark.getAttribute("data-comment-id");
      if (cId === activeCommentId) {
        mark.classList.add("ring-2", "ring-amber-500", "bg-amber-200", "dark:bg-amber-900/80");
        mark.style.backgroundColor = "rgba(253, 230, 138, 0.95)";
      } else {
        mark.classList.remove("ring-2", "ring-amber-500", "bg-amber-200", "dark:bg-amber-900/80");
        mark.style.backgroundColor = "rgba(254, 243, 199, 0.85)";
      }
    });
  }, [activeCommentId]);

  // 4. Scroll to Comment Anchor in Document
  const scrollToCommentAnchor = useCallback((commentId: string) => {
    const mark = document.querySelector<HTMLElement>(`mark[data-comment-id="${commentId}"]`);
    if (mark) {
      mark.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  // 5. Global click listener on document for comment marks
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const mark = target.closest<HTMLElement>("mark[data-comment-id]");
      if (mark) {
        const commentId = mark.getAttribute("data-comment-id");
        if (commentId) {
          setActiveCommentId(commentId);
          setIsCommentsPanelOpen(true);
        }
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  // 6. Create Comment From Current Selection
  const createCommentFromSelection = useCallback((): boolean => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      alert("Please select text in the document to attach a comment.");
      return false;
    }

    const range = sel.getRangeAt(0);
    const selectedText = range.toString().trim();
    if (!selectedText) {
      alert("Please select text in the document to attach a comment.");
      return false;
    }

    // Identify page container
    const startNode = range.startContainer;
    const parentEl =
      startNode.nodeType === Node.ELEMENT_NODE
        ? (startNode as HTMLElement)
        : startNode.parentElement;
    const pageEl =
      parentEl?.closest<HTMLElement>("[data-editor-page]") ||
      parentEl?.closest<HTMLElement>("[data-page-id]");

    const pageId = pageEl?.getAttribute("data-page-id") || "page_1";
    const commentId =
      "comment_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 7);

    // Wrap the selected range in <mark data-comment-id="...">
    const mark = document.createElement("mark");
    mark.setAttribute("data-comment-id", commentId);
    mark.className =
      "comment-highlight bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border-b-2 border-amber-500 cursor-pointer rounded-xs px-0.5 transition-colors";
    mark.style.backgroundColor = "rgba(254, 243, 199, 0.85)";
    mark.style.borderBottom = "2px solid #F59E0B";
    mark.style.color = "inherit";
    mark.title = `Comment by ${currentAuthor}`;

    try {
      range.surroundContents(mark);
    } catch {
      try {
        const fragment = range.extractContents();
        mark.appendChild(fragment);
        range.insertNode(mark);
      } catch (err) {
        console.warn("Failed to anchor comment selection range:", err);
        return false;
      }
    }

    // Trigger input event on page container to ensure document model captures HTML update
    if (pageEl) {
      pageEl.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Set draft anchor and open comments panel
    const anchor: DraftCommentAnchor = {
      commentId,
      pageId,
      selectedText,
    };

    setDraftAnchor(anchor);
    setIsDraftingComment(true);
    setActiveCommentId(commentId);
    setIsCommentsPanelOpen(true);

    return true;
  }, [currentAuthor]);

  // 7. Submit New Comment (from draft)
  const submitNewComment = useCallback(
    (content: string) => {
      if (!draftAnchor || !content.trim()) return;

      const newComment: DocumentComment = {
        id: draftAnchor.commentId,
        pageId: draftAnchor.pageId,
        selectedText: draftAnchor.selectedText,
        author: currentAuthor,
        authorAvatar: currentAvatar,
        authorRole: currentRole,
        content: content.trim(),
        createdAt: Date.now(),
        status: "open",
        replies: [],
      };

      setComments((prev) => [...prev, newComment]);
      setIsDraftingComment(false);
      setDraftAnchor(null);
      setActiveCommentId(draftAnchor.commentId);
      scrollToCommentAnchor(draftAnchor.commentId);
    },
    [draftAnchor, currentAuthor, currentAvatar, currentRole, scrollToCommentAnchor]
  );

  // 8. Cancel Draft Comment
  const cancelDraftComment = useCallback(() => {
    if (draftAnchor) {
      const mark = document.querySelector<HTMLElement>(`mark[data-comment-id="${draftAnchor.commentId}"]`);
      if (mark && mark.parentNode) {
        const parent = mark.parentNode;
        while (mark.firstChild) {
          parent.insertBefore(mark.firstChild, mark);
        }
        mark.remove();

        const pageEl = parent instanceof HTMLElement ? parent.closest("[data-editor-page]") : null;
        if (pageEl) {
          pageEl.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    }

    setIsDraftingComment(false);
    setDraftAnchor(null);
    setActiveCommentId(null);
  }, [draftAnchor]);

  // 9. Delete Comment
  const deleteComment = useCallback(
    (commentId?: string) => {
      const targetId = commentId || activeCommentId;
      if (!targetId) return;

      // Remove markup from document DOM
      const mark = document.querySelector<HTMLElement>(`mark[data-comment-id="${targetId}"]`);
      if (mark && mark.parentNode) {
        const parent = mark.parentNode;
        while (mark.firstChild) {
          parent.insertBefore(mark.firstChild, mark);
        }
        mark.remove();

        const pageEl = parent instanceof HTMLElement ? parent.closest("[data-editor-page]") : null;
        if (pageEl) {
          pageEl.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }

      setComments((prev) => prev.filter((c) => c.id !== targetId));

      if (activeCommentId === targetId) {
        setActiveCommentId(null);
      }
    },
    [activeCommentId]
  );

  // 10. Resolve / Reopen Comment
  const resolveComment = useCallback((commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, status: "resolved" } : c))
    );
  }, []);

  const reopenComment = useCallback((commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, status: "open" } : c))
    );
  }, []);

  // 11. Edit Comment Content
  const editComment = useCallback((commentId: string, newContent: string) => {
    if (!newContent.trim()) return;
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, content: newContent.trim() } : c))
    );
  }, []);

  // 12. Add Reply
  const addReply = useCallback(
    (commentId: string, content: string) => {
      if (!content.trim()) return;
      const newReply = {
        id: "reply_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6),
        author: currentAuthor,
        authorAvatar: currentAvatar,
        authorRole: currentRole,
        content: content.trim(),
        createdAt: Date.now(),
      };

      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, replies: [...c.replies, newReply] } : c))
      );
    },
    [currentAuthor, currentAvatar, currentRole]
  );

  // 13. Delete Reply
  const deleteReply = useCallback((commentId: string, replyId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, replies: c.replies.filter((r) => r.id !== replyId) }
          : c
      )
    );
  }, []);

  // 14. Document Order Navigation (Previous & Next)
  const getDocumentOrderedCommentIds = useCallback((): string[] => {
    const marks = Array.from(document.querySelectorAll<HTMLElement>("mark[data-comment-id]"));
    const idsInDom: string[] = [];
    marks.forEach((m) => {
      const id = m.getAttribute("data-comment-id");
      if (id && !idsInDom.includes(id)) {
        idsInDom.push(id);
      }
    });

    // Also include any comments in state not found in DOM
    comments.forEach((c) => {
      if (!idsInDom.includes(c.id)) {
        idsInDom.push(c.id);
      }
    });

    return idsInDom;
  }, [comments]);

  const goToPreviousComment = useCallback(() => {
    const orderedIds = getDocumentOrderedCommentIds();
    if (orderedIds.length === 0) return;

    if (!activeCommentId) {
      const targetId = orderedIds[orderedIds.length - 1];
      setActiveCommentId(targetId);
      setIsCommentsPanelOpen(true);
      scrollToCommentAnchor(targetId);
      return;
    }

    const currentIndex = orderedIds.indexOf(activeCommentId);
    if (currentIndex > 0) {
      const targetId = orderedIds[currentIndex - 1];
      setActiveCommentId(targetId);
      setIsCommentsPanelOpen(true);
      scrollToCommentAnchor(targetId);
    }
  }, [activeCommentId, getDocumentOrderedCommentIds, scrollToCommentAnchor]);

  const goToNextComment = useCallback(() => {
    const orderedIds = getDocumentOrderedCommentIds();
    if (orderedIds.length === 0) return;

    if (!activeCommentId) {
      const targetId = orderedIds[0];
      setActiveCommentId(targetId);
      setIsCommentsPanelOpen(true);
      scrollToCommentAnchor(targetId);
      return;
    }

    const currentIndex = orderedIds.indexOf(activeCommentId);
    if (currentIndex >= 0 && currentIndex < orderedIds.length - 1) {
      const targetId = orderedIds[currentIndex + 1];
      setActiveCommentId(targetId);
      setIsCommentsPanelOpen(true);
      scrollToCommentAnchor(targetId);
    }
  }, [activeCommentId, getDocumentOrderedCommentIds, scrollToCommentAnchor]);

  return (
    <CommentsContext.Provider
      value={{
        comments,
        activeCommentId,
        isCommentsPanelOpen,
        isDraftingComment,
        draftAnchor,
        openCommentsPanel,
        closeCommentsPanel,
        toggleCommentsPanel,
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
        goToPreviousComment,
        goToNextComment,
        scrollToCommentAnchor,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
}

export function useComments(): CommentsContextValue {
  const context = useContext(CommentsContext);
  if (!context) {
    throw new Error("useComments must be used within a CommentsProvider");
  }
  return context;
}
