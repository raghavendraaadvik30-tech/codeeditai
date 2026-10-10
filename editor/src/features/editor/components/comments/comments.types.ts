/**
 * --------------------------------------------------------
 * Module: Comments
 * Feature: Comment Types & Interfaces
 * Description:
 * Data models and interfaces for Microsoft Word-style comments,
 * threaded replies, author attribution, and context state.
 * --------------------------------------------------------
 */

export interface CommentReply {
  id: string;
  author: string;
  authorAvatar?: string;
  authorRole?: string;
  content: string;
  createdAt: number;
}

export interface DocumentComment {
  id: string;
  pageId: string;
  selectedText: string;
  author: string;
  authorAvatar?: string;
  authorRole?: string;
  content: string;
  createdAt: number;
  status: "open" | "resolved";
  replies: CommentReply[];
}

export interface DraftCommentAnchor {
  commentId: string;
  pageId: string;
  selectedText: string;
}

export interface CommentsContextValue {
  comments: DocumentComment[];
  activeCommentId: string | null;
  isCommentsPanelOpen: boolean;
  isDraftingComment: boolean;
  draftAnchor: DraftCommentAnchor | null;
  openCommentsPanel: () => void;
  closeCommentsPanel: () => void;
  toggleCommentsPanel: () => void;
  createCommentFromSelection: () => boolean;
  submitNewComment: (content: string) => void;
  cancelDraftComment: () => void;
  deleteComment: (commentId?: string) => void;
  resolveComment: (commentId: string) => void;
  reopenComment: (commentId: string) => void;
  editComment: (commentId: string, newContent: string) => void;
  addReply: (commentId: string, content: string) => void;
  deleteReply: (commentId: string, replyId: string) => void;
  setActiveCommentId: (commentId: string | null) => void;
  goToPreviousComment: () => void;
  goToNextComment: () => void;
  scrollToCommentAnchor: (commentId: string) => void;
}
