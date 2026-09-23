import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type { ReactNode, RefObject } from "react";

import type { StyleToken } from "@/features/editor/modules/styles/types/styles.types";
import { useDocumentModel } from "../store/documentModel";

export function getCaretCharacterOffsetWithin(element: HTMLElement): number {
  let caretOffset = 0;
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    try {
      const range = sel.getRangeAt(0);
      if (element.contains(range.startContainer)) {
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        caretOffset = preCaretRange.toString().length;
      }
    } catch {
      // ignore
    }
  }
  return caretOffset;
}

export function setCaretCharacterOffsetWithin(element: HTMLElement, offset: number) {
  try {
    element.focus();
    const sel = window.getSelection();
    if (!sel) return;

    let currentOffset = 0;
    let found = false;

    function traverse(node: Node) {
      if (found) return;

      if (node.nodeType === Node.TEXT_NODE) {
        const textLength = node.textContent?.length ?? 0;
        if (currentOffset + textLength >= offset) {
          const range = document.createRange();
          const targetOffset = Math.max(0, Math.min(offset - currentOffset, textLength));
          range.setStart(node, targetOffset);
          range.collapse(true);
          sel?.removeAllRanges();
          sel?.addRange(range);
          found = true;
          return;
        }
        currentOffset += textLength;
      } else if (node.nodeName === "BR" && currentOffset >= offset) {
        const range = document.createRange();
        range.setStartBefore(node);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
        found = true;
        return;
      } else {
        if (node.childNodes.length === 0 && currentOffset >= offset) {
          const range = document.createRange();
          range.selectNodeContents(node);
          range.collapse(true);
          sel?.removeAllRanges();
          sel?.addRange(range);
          found = true;
          return;
        }
        for (let i = 0; i < node.childNodes.length; i++) {
          traverse(node.childNodes[i]);
          if (found) return;
        }
      }
    }

    traverse(element);

    if (!found) {
      const range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  } catch {
    // fallback
  }
}

export interface HistorySnapshot {
  pageId: string;
  html: string;
  caretOffset: number;
  label?: string;
}

export function extractPlainText(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || div.innerText || "").replace(/\u00a0/g, " ");
}

export function getActionLabel(prevHtml: string, currHtml: string, customLabel?: string): string {
  if (customLabel) return customLabel;
  const prevText = extractPlainText(prevHtml);
  const currText = extractPlainText(currHtml);

  if (currText.length > prevText.length) {
    const diffLen = currText.length - prevText.length;
    if (diffLen === 1) {
      let i = 0;
      while (i < prevText.length && prevText[i] === currText[i]) {
        i++;
      }
      const char = currText[i] !== undefined ? currText[i] : currText[currText.length - 1];
      if (char === " ") return 'Typing " "';
      return `Typing "${char}"`;
    }
    return "Paste";
  }

  if (currText.length < prevText.length) {
    const diffLen = prevText.length - currText.length;
    if (diffLen === 1) {
      let i = 0;
      while (i < currText.length && prevText[i] === currText[i]) {
        i++;
      }
      const char = prevText[i] !== undefined ? prevText[i] : prevText[prevText.length - 1];
      return `Typing "${char}"`;
    }
    return "Clear";
  }

  if (currHtml.includes("<b>") || currHtml.includes("<strong>")) return "Bold";
  if (currHtml.includes("<i>") || currHtml.includes("<em>")) return "Italic";
  if (currHtml.includes("<u>")) return "Underline";

  return 'Typing "text"';
}

export type ViewMode = "print" | "web" | "read" | "outline" | "draft";

export interface EditorContextType {
  activePanel: string;
  setActivePanel: React.Dispatch<React.SetStateAction<string>>;

  leftPanelOpen: boolean;
  setLeftPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;

  aiPanelOpen: boolean;
  setAiPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;

  editorRef: RefObject<HTMLDivElement | null>;

  /**
   * Applies a style token to the current editor selection.
   */
  applyStyleToken: (token: StyleToken) => void;

  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;

  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;

  isEditable: boolean;
  setIsEditable: React.Dispatch<React.SetStateAction<boolean>>;

  selection: Selection | null;
  setSelection: React.Dispatch<React.SetStateAction<Selection | null>>;

  focusEditor: () => void;
  insertHTML: (html: string) => void;

  pendingPermissionFile: { fileName: string } | null;
  setPendingPermissionFile: React.Dispatch<React.SetStateAction<{ fileName: string } | null>>;

  undo: () => void;
  redo: () => void;
  undoMultiple: (count: number) => void;
  redoMultiple: (count: number) => void;
  getUndoActions: () => string[];
  getRedoActions: () => string[];
  canUndo: boolean;
  canRedo: boolean;
  recordSnapshot: (pageId: string, html: string, caretOffset?: number, customLabel?: string) => void;
  initHistory: (pageId: string, html: string) => void;
}

export const EditorContext =
  createContext<EditorContextType | null>(null);

export function EditorProvider({
  children,
}: {
  children: ReactNode;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  const [activePanel, setActivePanelState] = useState<string>(() => {
    try {
      return localStorage.getItem("editor_active_panel") || "trackChanges";
    } catch {
      return "trackChanges";
    }
  });

  const [leftPanelOpen, setLeftPanelOpenState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("editor_left_panel_open");
      return stored !== null ? stored === "true" : true;
    } catch {
      return true;
    }
  });

  const setActivePanel: React.Dispatch<React.SetStateAction<string>> = (action) => {
    setActivePanelState((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      try {
        localStorage.setItem("editor_active_panel", next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  const setLeftPanelOpen: React.Dispatch<React.SetStateAction<boolean>> = (action) => {
    setLeftPanelOpenState((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      try {
        localStorage.setItem("editor_left_panel_open", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const [aiPanelOpen, setAiPanelOpen] =
    useState<boolean>(false);

  const [zoom, setZoom] =
    useState<number>(100);

  const [viewMode, setViewMode] =
    useState<ViewMode>("print");

  const [isEditable, setIsEditable] =
    useState<boolean>(true);

  const [pendingPermissionFile, setPendingPermissionFile] =
    useState<{ fileName: string } | null>(null);

  const [selection, setSelection] =
    useState<Selection | null>(null);

  const applyStyleToken = (
    token: StyleToken,
  ) => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();

    const selection =
      window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range =
      selection.getRangeAt(0);

    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }

    const span =
      document.createElement("span");

    span.dataset.style = token.name;

    span.style.fontFamily =
      `${token.font}, Calibri, sans-serif`;

    span.style.fontSize =
      `${token.size}pt`;

    span.style.fontWeight =
      String(token.weight);

    if (token.italic) {
      span.style.fontStyle = "italic";
    }

    if (token.underline) {
      span.style.textDecoration =
        "underline";
    }

    if (token.color === "primary") {
      span.style.color =
        "hsl(var(--primary))";
    } else if (token.color) {
      span.style.color = token.color;
    }

    if (token.align) {
      span.style.textAlign =
        token.align;
    }

    if (token.lineHeight) {
      span.style.lineHeight =
        String(token.lineHeight);
    }

    if (token.leftIndent) {
      span.style.paddingLeft =
        `${token.leftIndent}pt`;
    }

    if (token.rightIndent) {
      span.style.paddingRight =
        `${token.rightIndent}pt`;
    }

    if (token.spaceBefore) {
      span.style.marginTop =
        `${token.spaceBefore}pt`;
    }

    if (token.spaceAfter) {
      span.style.marginBottom =
        `${token.spaceAfter}pt`;
    }

    try {
      range.surroundContents(span);
    } catch {
      const fragment =
        range.extractContents();

      span.appendChild(fragment);

      range.insertNode(span);
    }

    selection.removeAllRanges();

    const newRange =
      document.createRange();

    newRange.selectNodeContents(span);

    selection.addRange(newRange);
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const insertHTML = (html: string) => {
    const el = editorRef.current;
    if (el) {
      el.focus();
      document.execCommand("insertHTML", false, html);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      document.execCommand("insertHTML", false, html);
    }
  };

  let docModel: ReturnType<typeof useDocumentModel> | null = null;
  try {
    docModel = useDocumentModel();
  } catch {
    docModel = null;
  }

  const historyStackRef = useRef<HistorySnapshot[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isUndoingRedoingRef = useRef<boolean>(false);
  const [, setHistoryVersion] = useState(0);

  const initHistory = useCallback((pageId: string, html: string) => {
    if (historyStackRef.current.length === 0) {
      historyStackRef.current = [{ pageId, html: html || "<p><br></p>", caretOffset: 0 }];
      historyIndexRef.current = 0;
      setHistoryVersion((v) => v + 1);
    }
  }, []);

  const recordSnapshot = useCallback(
    (pageId: string, html: string, caretOffset?: number, customLabel?: string) => {
      if (isUndoingRedoingRef.current) return;
      const stack = historyStackRef.current;
      const idx = historyIndexRef.current;

      const offset =
        caretOffset !== undefined
          ? caretOffset
          : editorRef.current
          ? getCaretCharacterOffsetWithin(editorRef.current)
          : 0;

      // Avoid recording if identical to current snapshot
      if (idx >= 0 && stack[idx] && stack[idx].pageId === pageId && stack[idx].html === html) {
        return;
      }

      const prevHtml = idx >= 0 && stack[idx] ? stack[idx].html : "";
      const label = customLabel || getActionLabel(prevHtml, html);

      let newStack: HistorySnapshot[];
      if (idx < 0 || stack.length === 0) {
        newStack = [
          { pageId, html: "<p><br></p>", caretOffset: 0, label: "Initial" },
          { pageId, html, caretOffset: offset, label },
        ];
      } else {
        newStack = stack.slice(0, idx + 1);
        newStack.push({ pageId, html, caretOffset: offset, label });
      }

      if (newStack.length > 2000) {
        newStack.shift();
      }

      historyStackRef.current = newStack;
      historyIndexRef.current = newStack.length - 1;
      setHistoryVersion((v) => v + 1);
    },
    []
  );

  const undoMultiple = useCallback((count: number) => {
    if (count <= 0) return;
    const stack = historyStackRef.current;
    let idx = historyIndexRef.current;
    if (idx <= 0 || stack.length === 0) {
      return;
    }

    const targetIdx = Math.max(0, idx - count);
    historyIndexRef.current = targetIdx;
    setHistoryVersion((v) => v + 1);
    const snapshot = stack[targetIdx];
    if (!snapshot) return;

    isUndoingRedoingRef.current = true;

    let el = editorRef.current;
    if (!el || el.getAttribute("data-page-id") !== snapshot.pageId) {
      const pageEl = document.querySelector<HTMLDivElement>(
        `[data-editor-page="${snapshot.pageId}"]`
      );
      if (pageEl) {
        el = pageEl;
        (editorRef as React.MutableRefObject<HTMLDivElement | null>).current = pageEl;
      }
    }

    if (el) {
      el.innerHTML = snapshot.html || "<p><br></p>";
      setCaretCharacterOffsetWithin(el, snapshot.caretOffset);
    }

    if (docModel) {
      docModel.setPageHtml(snapshot.pageId, snapshot.html || "<p><br></p>");
      if (docModel.activePage !== snapshot.pageId) {
        docModel.setActivePage(snapshot.pageId);
      }
    }

    setTimeout(() => {
      isUndoingRedoingRef.current = false;
    }, 10);
  }, [docModel]);

  const redoMultiple = useCallback((count: number) => {
    if (count <= 0) return;
    const stack = historyStackRef.current;
    let idx = historyIndexRef.current;
    if (idx >= stack.length - 1 || stack.length === 0) {
      return;
    }

    const targetIdx = Math.min(stack.length - 1, idx + count);
    historyIndexRef.current = targetIdx;
    setHistoryVersion((v) => v + 1);
    const snapshot = stack[targetIdx];
    if (!snapshot) return;

    isUndoingRedoingRef.current = true;

    let el = editorRef.current;
    if (!el || el.getAttribute("data-page-id") !== snapshot.pageId) {
      const pageEl = document.querySelector<HTMLDivElement>(
        `[data-editor-page="${snapshot.pageId}"]`
      );
      if (pageEl) {
        el = pageEl;
        (editorRef as React.MutableRefObject<HTMLDivElement | null>).current = pageEl;
      }
    }

    if (el) {
      el.innerHTML = snapshot.html || "<p><br></p>";
      setCaretCharacterOffsetWithin(el, snapshot.caretOffset);
    }

    if (docModel) {
      docModel.setPageHtml(snapshot.pageId, snapshot.html || "<p><br></p>");
      if (docModel.activePage !== snapshot.pageId) {
        docModel.setActivePage(snapshot.pageId);
      }
    }

    setTimeout(() => {
      isUndoingRedoingRef.current = false;
    }, 10);
  }, [docModel]);

  const undo = useCallback(() => {
    undoMultiple(1);
  }, [undoMultiple]);

  const redo = useCallback(() => {
    redoMultiple(1);
  }, [redoMultiple]);

  const getUndoActions = useCallback((): string[] => {
    const stack = historyStackRef.current;
    const idx = historyIndexRef.current;
    if (idx <= 0 || stack.length === 0) return [];
    const actions: string[] = [];
    for (let i = idx; i >= 1; i--) {
      actions.push(stack[i].label || 'Typing "text"');
    }
    return actions;
  }, []);

  const getRedoActions = useCallback((): string[] => {
    const stack = historyStackRef.current;
    const idx = historyIndexRef.current;
    if (idx >= stack.length - 1 || stack.length === 0) return [];
    const actions: string[] = [];
    for (let i = idx + 1; i < stack.length; i++) {
      actions.push(stack[i].label || 'Typing "text"');
    }
    return actions;
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA") &&
        !target.closest("[data-editor-page]")
      ) {
        return;
      }

      // Undo: Ctrl+Z or Cmd+Z (without Shift)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        e.stopPropagation();
        undo();
        return;
      }

      // Redo: Ctrl+Y / Cmd+Y or Ctrl+Shift+Z / Cmd+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y")) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "z" || e.key === "Z"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        redo();
        return;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown, true);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown, true);
  }, [undo, redo]);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyStackRef.current.length - 1;

  const value: EditorContextType = {
    activePanel,
    setActivePanel,

    leftPanelOpen,
    setLeftPanelOpen,

    aiPanelOpen,
    setAiPanelOpen,

    editorRef,

    applyStyleToken,

    zoom,
    setZoom,

    viewMode,
    setViewMode,

    isEditable,
    setIsEditable,

    selection,
    setSelection,

    focusEditor,
    insertHTML,

    pendingPermissionFile,
    setPendingPermissionFile,

    undo,
    redo,
    undoMultiple,
    redoMultiple,
    getUndoActions,
    getRedoActions,
    canUndo,
    canRedo,
    recordSnapshot,
    initHistory,
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context =
    useContext(EditorContext);

  if (!context) {
    throw new Error(
      "useEditor must be used inside EditorProvider",
    );
  }

  return context;
}