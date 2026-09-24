import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type { ReactNode, RefObject } from "react";

<<<<<<< HEAD
import type { StyleToken } from "@/features/editor/styles/types/styles.types";
=======
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
>>>>>>> origin/main

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

  /**
   * Applies font size (in pt) to active selection or current cursor without losing selection.
   */
  applyFontSize: (size: string | number) => void;

  /**
   * Applies font family to active selection or current cursor.
   */
  applyFontFamily: (font: string) => void;

  /**
   * Executes a native formatting command (bold, italic, underline, align, etc.) preserving selection.
   */
  applyFormatCommand: (command: string, value?: string) => void;
  exec: (command: string, value?: string) => void;
  applyBulletStyle: (style?: any) => void;
  applyNumberingStyle: (style?: any) => void;
  applyMultilevelStyle: (style?: any) => void;
  toggleMultilevelList: (type?: any) => void;

  /**
   * Formats paragraph block (p, h1, h2, h3, h4, blockquote) preserving selection.
   */
  applyBlockStyle: (tag: string) => void;

  /**
   * Restores editor focus and selection from the last known valid range within active page.
   */
  restoreEditorSelection: () => boolean;

  /**
   * Retrieves the current editor range or last saved range.
   */
  getEditorSelection: () => Range | null;

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

  // Saved selection tracking for active editor contenteditable pages
  const savedSelectionRef = useRef<{
    range: Range;
    pageId: string;
    startContainer: Node;
    startOffset: number;
    endContainer: Node;
    endOffset: number;
  } | null>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);

      // Verify if selection originates inside an editor contenteditable page
      const ancestor = range.commonAncestorContainer;
      const el = ancestor.nodeType === Node.ELEMENT_NODE ? (ancestor as HTMLElement) : ancestor.parentElement;
      const pageEl = el?.closest<HTMLElement>('[contenteditable="true"][data-page-id]');
      if (!pageEl) {
        // Selection is outside editor pages (e.g. in ribbon/toolbar/dialog) - retain previous saved selection
        return;
      }

      const pageId = pageEl.getAttribute("data-page-id") || "";
      savedSelectionRef.current = {
        range: range.cloneRange(),
        pageId,
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset,
      };
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const restoreEditorSelection = useCallback((): boolean => {
    const sel = window.getSelection();
    if (!sel) return false;

    // 1. If active selection is already inside an editor page, keep it!
    if (sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      const anc = r.commonAncestorContainer;
      const el = anc.nodeType === Node.ELEMENT_NODE ? (anc as HTMLElement) : anc.parentElement;
      const pageEl = el?.closest<HTMLElement>('[contenteditable="true"][data-page-id]');
      if (pageEl) {
        if (document.activeElement !== pageEl && !pageEl.contains(document.activeElement)) {
          pageEl.focus({ preventScroll: true });
        }
        return true;
      }
    }

    // 2. Otherwise restore from savedSelectionRef
    const saved = savedSelectionRef.current;
    if (!saved) {
      if (editorRef.current) {
        editorRef.current.focus({ preventScroll: true });
        return true;
      }
      return false;
    }

    const targetPage =
      document.querySelector<HTMLElement>(`[contenteditable="true"][data-page-id="${saved.pageId}"]`) ||
      editorRef.current;

    if (!targetPage) return false;

    targetPage.focus({ preventScroll: true });

    try {
      if (targetPage.contains(saved.startContainer) && targetPage.contains(saved.endContainer)) {
        const newRange = document.createRange();
        newRange.setStart(saved.startContainer, saved.startOffset);
        newRange.setEnd(saved.endContainer, saved.endOffset);
        sel.removeAllRanges();
        sel.addRange(newRange);
        return true;
      } else {
        sel.removeAllRanges();
        sel.addRange(saved.range);
        return true;
      }
    } catch {
      return false;
    }
  }, [editorRef]);

  const getEditorSelection = useCallback((): Range | null => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      const anc = r.commonAncestorContainer;
      const el = anc.nodeType === Node.ELEMENT_NODE ? (anc as HTMLElement) : anc.parentElement;
      if (el?.closest('[contenteditable="true"][data-page-id]')) {
        return r;
      }
    }
    return savedSelectionRef.current?.range || null;
  }, []);

  const applyFontSize = useCallback((size: string | number) => {
    restoreEditorSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    const anc = range.commonAncestorContainer;
    const parentEl = anc.nodeType === Node.ELEMENT_NODE ? (anc as HTMLElement) : anc.parentElement;
    const pageEl = parentEl?.closest<HTMLElement>('[contenteditable="true"][data-page-id]') || editorRef.current;
    if (!pageEl) return;

    const sizePt = `${size}pt`;

    // 1. Collapsed selection (caret only, no text selected)
    if (range.collapsed) {
      const span = document.createElement("span");
      span.style.fontSize = sizePt;
      span.innerHTML = "&#8203;"; // Zero-width space placeholder
      range.insertNode(span);

      const newRange = document.createRange();
      newRange.setStart(span.firstChild || span, 1);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);

      pageEl.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    // 2. Text is selected:
    // Sentinel fontSize "7" accurately wraps all selected text nodes across inline tags and blocks
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand("fontSize", false, "7");

    const fontElements = Array.from(
      pageEl.querySelectorAll<HTMLElement>('font[size="7"], span[style*="xxx-large"]')
    );
    const createdSpans: HTMLElement[] = [];

    if (fontElements.length > 0) {
      fontElements.forEach((el) => {
        if (el.tagName === "FONT") {
          const span = document.createElement("span");
          span.style.fontSize = sizePt;
          while (el.firstChild) {
            span.appendChild(el.firstChild);
          }
          span.querySelectorAll<HTMLElement>("span[style*='font-size']").forEach((inner) => {
            inner.style.fontSize = "";
          });
          el.parentNode?.replaceChild(span, el);
          createdSpans.push(span);
        } else {
          el.style.fontSize = sizePt;
          createdSpans.push(el);
        }
      });
    } else {
      const existingSpan = parentEl?.closest<HTMLElement>("span[style*='font-size']");
      if (existingSpan && existingSpan.textContent?.trim() === sel.toString().trim()) {
        existingSpan.style.fontSize = sizePt;
        createdSpans.push(existingSpan);
      } else {
        try {
          const span = document.createElement("span");
          span.style.fontSize = sizePt;
          range.surroundContents(span);
          createdSpans.push(span);
        } catch {
          // Cross-block selection fallback
        }
      }
    }

    // Reselect formatted contents to keep selection highlighted and active
    if (createdSpans.length > 0) {
      const newRange = document.createRange();
      const first = createdSpans[0];
      const last = createdSpans[createdSpans.length - 1];
      newRange.setStartBefore(first.firstChild || first);
      newRange.setEndAfter(last.lastChild || last);
      sel.removeAllRanges();
      sel.addRange(newRange);

      const pageId = pageEl.getAttribute("data-page-id") || "";
      savedSelectionRef.current = {
        range: newRange.cloneRange(),
        pageId,
        startContainer: newRange.startContainer,
        startOffset: newRange.startOffset,
        endContainer: newRange.endContainer,
        endOffset: newRange.endOffset,
      };
    }

    pageEl.dispatchEvent(new Event("input", { bubbles: true }));
  }, [restoreEditorSelection, editorRef]);

  const applyFontFamily = useCallback((font: string) => {
    restoreEditorSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    const anc = range.commonAncestorContainer;
    const parentEl = anc.nodeType === Node.ELEMENT_NODE ? (anc as HTMLElement) : anc.parentElement;
    const pageEl = parentEl?.closest<HTMLElement>('[contenteditable="true"][data-page-id]') || editorRef.current;
    if (!pageEl) return;

    const fontCss = `${font}, Calibri, sans-serif`;

    if (range.collapsed) {
      const span = document.createElement("span");
      span.style.fontFamily = fontCss;
      span.innerHTML = "&#8203;";
      range.insertNode(span);

      const newRange = document.createRange();
      newRange.setStart(span.firstChild || span, 1);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);

      pageEl.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    document.execCommand("fontName", false, font);

    const fontElements = Array.from(
      pageEl.querySelectorAll<HTMLElement>(`font[face="${font}"], font[face*="${font}"]`)
    );
    const createdSpans: HTMLElement[] = [];

    if (fontElements.length > 0) {
      fontElements.forEach((el) => {
        const span = document.createElement("span");
        span.style.fontFamily = fontCss;
        while (el.firstChild) {
          span.appendChild(el.firstChild);
        }
        el.parentNode?.replaceChild(span, el);
        createdSpans.push(span);
      });
    }

    if (createdSpans.length > 0) {
      const newRange = document.createRange();
      const first = createdSpans[0];
      const last = createdSpans[createdSpans.length - 1];
      newRange.setStartBefore(first.firstChild || first);
      newRange.setEndAfter(last.lastChild || last);
      sel.removeAllRanges();
      sel.addRange(newRange);

      const pageId = pageEl.getAttribute("data-page-id") || "";
      savedSelectionRef.current = {
        range: newRange.cloneRange(),
        pageId,
        startContainer: newRange.startContainer,
        startOffset: newRange.startOffset,
        endContainer: newRange.endContainer,
        endOffset: newRange.endOffset,
      };
    }

    pageEl.dispatchEvent(new Event("input", { bubbles: true }));
  }, [restoreEditorSelection, editorRef]);

  const applyFormatCommand = useCallback((command: string, value?: string) => {
    restoreEditorSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    const anc = range.commonAncestorContainer;
    const parentEl = anc.nodeType === Node.ELEMENT_NODE ? (anc as HTMLElement) : anc.parentElement;
    const pageEl = parentEl?.closest<HTMLElement>('[contenteditable="true"][data-page-id]') || editorRef.current;

    document.execCommand(command, false, value);

    if (pageEl) {
      pageEl.dispatchEvent(new Event("input", { bubbles: true }));
      const currentSel = window.getSelection();
      if (currentSel && currentSel.rangeCount > 0) {
        const r = currentSel.getRangeAt(0);
        const pageId = pageEl.getAttribute("data-page-id") || "";
        savedSelectionRef.current = {
          range: r.cloneRange(),
          pageId,
          startContainer: r.startContainer,
          startOffset: r.startOffset,
          endContainer: r.endContainer,
          endOffset: r.endOffset,
        };
      }
    }
  }, [restoreEditorSelection, editorRef]);

  const applyBlockStyle = useCallback((tag: string) => {
    restoreEditorSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    const anc = range.commonAncestorContainer;
    const parentEl = anc.nodeType === Node.ELEMENT_NODE ? (anc as HTMLElement) : anc.parentElement;
    const pageEl = parentEl?.closest<HTMLElement>('[contenteditable="true"][data-page-id]') || editorRef.current;

    const blockTag = tag.toLowerCase() === "p" ? "<p>" : `<${tag.toUpperCase()}>`;
    document.execCommand("formatBlock", false, blockTag);

    if (pageEl) {
      pageEl.dispatchEvent(new Event("input", { bubbles: true }));
      const currentSel = window.getSelection();
      if (currentSel && currentSel.rangeCount > 0) {
        const r = currentSel.getRangeAt(0);
        const pageId = pageEl.getAttribute("data-page-id") || "";
        savedSelectionRef.current = {
          range: r.cloneRange(),
          pageId,
          startContainer: r.startContainer,
          startOffset: r.startOffset,
          endContainer: r.endContainer,
          endOffset: r.endOffset,
        };
      }
    }
  }, [restoreEditorSelection, editorRef]);

  const applyStyleToken = useCallback((token: StyleToken) => {
    restoreEditorSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    const anc = range.commonAncestorContainer;
    const parentEl = anc.nodeType === Node.ELEMENT_NODE ? (anc as HTMLElement) : anc.parentElement;
    const pageEl = parentEl?.closest<HTMLElement>('[contenteditable="true"][data-page-id]') || editorRef.current;
    if (!pageEl) return;

    const lowerName = token.name.toLowerCase();
    if (lowerName.includes("heading 1")) {
      document.execCommand("formatBlock", false, "<h1>");
    } else if (lowerName.includes("heading 2")) {
      document.execCommand("formatBlock", false, "<h2>");
    } else if (lowerName.includes("heading 3")) {
      document.execCommand("formatBlock", false, "<h3>");
    } else if (lowerName.includes("heading 4")) {
      document.execCommand("formatBlock", false, "<h4>");
    } else if (lowerName.includes("quote")) {
      document.execCommand("formatBlock", false, "<blockquote>");
    }

    if (token.size) {
      applyFontSize(token.size);
    }
    const familyOrFont = token.family || token.font;
    if (familyOrFont) {
      applyFontFamily(familyOrFont);
    }
    if (token.weight && token.weight >= 600) {
      document.execCommand("bold", false);
    }
    if (token.italic) {
      document.execCommand("italic", false);
    }
    if (token.underline) {
      document.execCommand("underline", false);
    }
    if (token.color && token.color !== "primary") {
      document.execCommand("foreColor", false, token.color);
    } else if (token.color === "primary") {
      document.execCommand("foreColor", false, "#0078d4");
    }
    const align = token.alignment || token.align;
    if (align) {
      if (align === "center") document.execCommand("justifyCenter", false);
      else if (align === "right") document.execCommand("justifyRight", false);
      else if (align === "justify") document.execCommand("justifyFull", false);
      else document.execCommand("justifyLeft", false);
    }

    pageEl.dispatchEvent(new Event("input", { bubbles: true }));
  }, [restoreEditorSelection, applyFontSize, applyFontFamily, editorRef]);

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
    applyFontSize,
    applyFontFamily,
    applyFormatCommand,
    applyBlockStyle,
    restoreEditorSelection,
    getEditorSelection,

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

    exec: applyFormatCommand,
    applyBulletStyle: (style?: any) => applyFormatCommand("insertUnorderedList", style),
    applyNumberingStyle: (style?: any) => applyFormatCommand("insertOrderedList", style),
    applyMultilevelStyle: (style?: any) => applyFormatCommand("insertOrderedList", style),
    toggleMultilevelList: (type?: any) => applyFormatCommand("insertOrderedList", type),

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