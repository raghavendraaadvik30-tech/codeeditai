import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type { ReactNode, RefObject } from "react";

import type { StyleToken } from "@/features/editor/styles/types/styles.types";
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

export function focusPageInDom(pageId: string, position: "start" | "end" = "start") {
  const section = document.querySelector(`section[data-page-id="${pageId}"]`);
  const editable =
    section?.querySelector<HTMLDivElement>('[contenteditable="true"]') ||
    document.querySelector<HTMLDivElement>(`[contenteditable="true"][data-page-id="${pageId}"]`);
  if (!editable) return;

  editable.focus();

  try {
    const sel = window.getSelection();
    if (!sel) return;

    const range = document.createRange();

    if (position === "start") {
      let firstTarget: Node = editable.firstElementChild || editable.firstChild || editable;
      while (firstTarget.firstChild && firstTarget.nodeType !== Node.TEXT_NODE) {
        firstTarget = firstTarget.firstChild;
      }
      if (firstTarget.nodeType === Node.TEXT_NODE) {
        range.setStart(firstTarget, 0);
        range.collapse(true);
      } else {
        range.selectNodeContents(firstTarget);
        range.collapse(true);
      }
    } else {
      let lastTarget: Node = editable.lastElementChild || editable.lastChild || editable;
      while (lastTarget.lastChild && lastTarget.nodeType !== Node.TEXT_NODE) {
        lastTarget = lastTarget.lastChild;
      }
      if (lastTarget.nodeType === Node.TEXT_NODE) {
        range.setStart(lastTarget, lastTarget.textContent?.length ?? 0);
        range.collapse(true);
      } else {
        range.selectNodeContents(lastTarget);
        range.collapse(false);
      }
    }

    sel.removeAllRanges();
    sel.addRange(range);
  } catch {
    // fallback
  }

  section?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function cleanChartMountsForHtml(html: string): string {
  if (
    !html ||
    (!html.includes("editor-chart-mount") &&
      !html.includes("editor-smartart-mount") &&
      !html.includes("editor-picture-mount") &&
      !html.includes("editor-icon-mount") &&
      !html.includes("editor-shape-mount"))
  )
    return html;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${html}</body>`, "text/html");
    const mounts = doc.querySelectorAll(
      ".editor-chart-mount, .editor-smartart-mount, .editor-picture-mount, .editor-icon-mount, .editor-shape-mount"
    );
    if (mounts.length === 0) return html;
    mounts.forEach((m) => {
      m.innerHTML = "";
    });
    return doc.body.innerHTML;
  } catch {
    return html;
  }
}

export interface PageBreakHistoryData {
  sourcePageId: string;
  targetPageId: string;
  isNewPage: boolean;
  sourceHtmlBefore: string;
  sourceHtmlAfter: string;
  targetHtmlBefore: string;
  targetHtmlAfter: string;
  caretOffsetBefore: number;
}

export interface HistorySnapshot {
  pageId: string;
  html: string;
  caretOffset: number;
  label?: string;
  actionType?: "edit" | "page-break";
  pageBreakData?: PageBreakHistoryData;
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

  /**
   * Inserts a Microsoft Word-style Page Break at current caret position,
   * splitting content across pages and placing caret at top of next page.
   */
  insertPageBreak: () => void;

  /**
   * Inserts a Microsoft Word-style soft Line Break (<br>) inside the current
   * paragraph without splitting the paragraph or creating a new block.
   */
  insertLineBreak: () => void;

  /**
   * Inserts a Microsoft Word-style Column Break. If in a multi-column section:
   * - Non-terminal column: moves following content to next column on SAME page.
   * - Last column / single-column: transitions subsequent content to NEXT page.
   */
  insertColumnBreak: () => void;

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

  const insertPageBreak = useCallback(() => {
    // 1. Locate current contenteditable page and caret range
    restoreEditorSelection();
    let sel = window.getSelection();
    let pageEl: HTMLElement | null = null;
    let range: Range | null = null;

    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      const anc = r.commonAncestorContainer;
      const el = anc.nodeType === Node.ELEMENT_NODE ? (anc as HTMLElement) : anc.parentElement;
      const found = el?.closest<HTMLElement>('[contenteditable="true"][data-page-id]');
      if (found) {
        pageEl = found;
        range = r.cloneRange();
      }
    }

    if (!pageEl && savedSelectionRef.current) {
      const saved = savedSelectionRef.current;
      const found = document.querySelector<HTMLElement>(`[contenteditable="true"][data-page-id="${saved.pageId}"]`);
      if (found) {
        pageEl = found;
        if (found.contains(saved.startContainer) && found.contains(saved.endContainer)) {
          range = document.createRange();
          range.setStart(saved.startContainer, saved.startOffset);
          range.setEnd(saved.endContainer, saved.endOffset);
        } else {
          range = saved.range.cloneRange();
        }
      }
    }

    if (!pageEl) {
      const activeId = docModel?.activePage || docModel?.model.pages[0]?.id;
      if (activeId) {
        pageEl = document.querySelector<HTMLElement>(`[contenteditable="true"][data-page-id="${activeId}"]`);
      }
    }

    if (!pageEl) {
      pageEl = editorRef.current || document.querySelector<HTMLElement>('[contenteditable="true"][data-page-id]');
    }

    if (!pageEl) return;

    const currentPageId =
      pageEl.getAttribute("data-page-id") ||
      docModel?.activePage ||
      docModel?.model.pages[0]?.id ||
      "";

    // Ensure range is valid and inside pageEl
    if (!range || !pageEl.contains(range.startContainer)) {
      range = document.createRange();
      range.selectNodeContents(pageEl);
      range.collapse(false);
    }

    // Capture state BEFORE modifications for Undo
    const sourceHtmlBefore = cleanChartMountsForHtml(pageEl.innerHTML);
    const caretOffsetBefore = getCaretCharacterOffsetWithin(pageEl);

    // If user has selected text, delete it first (standard Word behavior)
    if (!range.collapsed) {
      range.deleteContents();
    }

    let trailingHtml = "";

    // Check if cursor is inside a table cell (td, th)
    const anchorEl =
      range.startContainer.nodeType === Node.ELEMENT_NODE
        ? (range.startContainer as HTMLElement)
        : range.startContainer.parentElement;
    const tableCell = anchorEl?.closest("td, th");

    if (tableCell) {
      const tableRow = tableCell.closest("tr");
      const table = tableRow?.closest("table");
      if (table && tableRow) {
        const rows = Array.from(table.rows);
        const splitRowIndex = rows.indexOf(tableRow);
        const rowsToMove = rows.slice(splitRowIndex);

        const newTable = table.cloneNode(false) as HTMLTableElement;
        const newTbody = document.createElement("tbody");
        newTable.appendChild(newTbody);
        rowsToMove.forEach((r) => newTbody.appendChild(r));

        const afterTableNodes: Node[] = [];
        let nextSibling = table.nextSibling;
        while (nextSibling) {
          const toRemove = nextSibling;
          nextSibling = nextSibling.nextSibling;
          afterTableNodes.push(toRemove);
        }

        const nextDiv = document.createElement("div");
        nextDiv.appendChild(newTable);
        afterTableNodes.forEach((n) => nextDiv.appendChild(n));
        trailingHtml = nextDiv.innerHTML.trim();

        if (table.rows.length === 0) {
          table.remove();
        }
      }
    } else {
      // Normal paragraph / block splitting
      const splitRange = document.createRange();
      splitRange.setStart(range.endContainer, range.endOffset);
      if (pageEl.lastChild) {
        splitRange.setEndAfter(pageEl.lastChild);
      } else {
        splitRange.selectNodeContents(pageEl);
      }

      const fragment = splitRange.extractContents();
      const tempDiv = document.createElement("div");
      tempDiv.appendChild(fragment);
      trailingHtml = tempDiv.innerHTML.trim();

      // Clean up empty remnant shell on source page if cursor was at start of block
      let cursorBlock: Node | null = range.endContainer;
      while (cursorBlock && cursorBlock.parentNode !== pageEl) {
        cursorBlock = cursorBlock.parentNode;
      }

      if (cursorBlock && cursorBlock.parentNode === pageEl) {
        const isBlockEmpty =
          cursorBlock.nodeType === Node.ELEMENT_NODE &&
          (cursorBlock as HTMLElement).textContent?.trim() === "" &&
          !(cursorBlock as HTMLElement).querySelector("table, img, video, iframe, [data-editor-ui]");

        if (isBlockEmpty && pageEl.children.length > 1) {
          cursorBlock.parentNode.removeChild(cursorBlock);
        }
      }
    }

    // Ensure source page has valid content
    const cleanedSourceHtml = cleanChartMountsForHtml(pageEl.innerHTML.trim());
    const remainingHtml = cleanedSourceHtml || "<p><br/></p>";
    if (pageEl.children.length === 0 || !pageEl.textContent?.trim()) {
      pageEl.innerHTML = remainingHtml;
    }

    // Normalize trailingHtml for the new page
    if (
      !trailingHtml ||
      trailingHtml === "<br>" ||
      trailingHtml === "<br/>" ||
      trailingHtml === "<p></p>" ||
      trailingHtml === "<p><br></p>" ||
      trailingHtml === "<p><br/></p>" ||
      trailingHtml === "<p><br data-mce-bogus=\"1\"></p>"
    ) {
      trailingHtml = "<p><br/></p>";
    } else if (
      !/^<(?:\/?[a-z]+)[^>]*>/i.test(trailingHtml.trim()) ||
      (!trailingHtml.trim().startsWith("<p") &&
       !trailingHtml.trim().startsWith("<div") &&
       !trailingHtml.trim().startsWith("<h") &&
       !trailingHtml.trim().startsWith("<table") &&
       !trailingHtml.trim().startsWith("<ul") &&
       !trailingHtml.trim().startsWith("<ol") &&
       !trailingHtml.trim().startsWith("<blockquote"))
    ) {
      trailingHtml = `<p>${trailingHtml}</p>`;
    }

    if (docModel && currentPageId) {
      // 1. Update source page HTML
      docModel.setPageHtml(currentPageId, remainingHtml);

      // 2. Check if a trailing blank page can be reused, or create new page
      const pages = docModel.model.pages;
      const currentIdx = pages.findIndex((p) => p.id === currentPageId);
      const nextPage = currentIdx >= 0 && currentIdx + 1 < pages.length ? pages[currentIdx + 1] : null;

      let targetPageId = "";
      let isNewPage = false;
      let targetHtmlBefore = "";

      if (nextPage) {
        const nextHtml = (docModel.model.pageHtml[nextPage.id] || "").trim();
        const isNextBlank =
          !nextHtml ||
          nextHtml === "<p></p>" ||
          nextHtml === "<p><br></p>" ||
          nextHtml === "<p><br/></p>" ||
          nextHtml === "<p><br data-mce-bogus=\"1\"></p>";

        if (isNextBlank) {
          targetHtmlBefore = nextHtml;
          docModel.setPageHtml(nextPage.id, trailingHtml);
          targetPageId = nextPage.id;
          isNewPage = false;
        } else {
          targetPageId = docModel.addPage(currentPageId, trailingHtml);
          isNewPage = true;
        }
      } else {
        targetPageId = docModel.addPage(currentPageId, trailingHtml);
        isNewPage = true;
      }

      // 3. Set active page to target page
      docModel.setActivePage(targetPageId);

      // 4. Record snapshot with structural pageBreakData for clean Undo/Redo
      if (isUndoingRedoingRef.current === false) {
        const stack = historyStackRef.current;
        const idx = historyIndexRef.current;
        const newStack = idx >= 0 ? stack.slice(0, idx + 1) : [];

        newStack.push({
          pageId: targetPageId,
          html: trailingHtml,
          caretOffset: 0,
          label: "Insert Page Break",
          actionType: "page-break",
          pageBreakData: {
            sourcePageId: currentPageId,
            targetPageId,
            isNewPage,
            sourceHtmlBefore,
            sourceHtmlAfter: remainingHtml,
            targetHtmlBefore,
            targetHtmlAfter: trailingHtml,
            caretOffsetBefore,
          },
        });

        if (newStack.length > 2000) newStack.shift();
        historyStackRef.current = newStack;
        historyIndexRef.current = newStack.length - 1;
        setHistoryVersion((v) => v + 1);
      }

      // 5. Trigger input event on source page container
      pageEl.dispatchEvent(new Event("input", { bubbles: true }));

      // 6. Focus the start of the target page
      const focusTarget = () => {
        focusPageInDom(targetPageId, "start");
      };
      setTimeout(focusTarget, 30);
      setTimeout(focusTarget, 100);
    }
  }, [restoreEditorSelection, docModel, editorRef]);

  /**
   * ============================================================================
   * Line Break (Soft Break / Shift + Enter)
   * ----------------------------------------------------------------------------
   * Inserts an inline `<br>` element at the current cursor position within the
   * current paragraph block without splitting the block or generating extra paragraphs.
   * Also appends a trailing bogus `<br>` if located at the end of the block so that
   * contenteditable browsers correctly display the caret on the newly created line.
   * ============================================================================
   */
  const insertLineBreak = useCallback(() => {
    // Step 1: Restore active editor selection if focus was temporarily transferred
    restoreEditorSelection();
    const sel = window.getSelection();
    let pageEl: HTMLElement | null = null;
    let range: Range | null = null;

    // Step 2: Resolve active contenteditable page element from DOM selection
    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      const anc = r.commonAncestorContainer;
      const el = anc.nodeType === Node.ELEMENT_NODE ? (anc as HTMLElement) : anc.parentElement;
      const found = el?.closest<HTMLElement>('[contenteditable="true"][data-page-id]');
      if (found) {
        pageEl = found;
        range = r.cloneRange();
      }
    }

    // Step 3: Fall back to saved selection ref if selection is outside DOM
    if (!pageEl && savedSelectionRef.current) {
      const saved = savedSelectionRef.current;
      const found = document.querySelector<HTMLElement>(`[contenteditable="true"][data-page-id="${saved.pageId}"]`);
      if (found) {
        pageEl = found;
        range = saved.range.cloneRange();
      }
    }

    // Step 4: Fall back to active page ID from the document model
    if (!pageEl) {
      const activeId = docModel?.activePage || docModel?.model.pages[0]?.id;
      if (activeId) {
        pageEl = document.querySelector<HTMLElement>(`[contenteditable="true"][data-page-id="${activeId}"]`);
      }
    }

    if (!pageEl) {
      pageEl = editorRef.current || document.querySelector<HTMLElement>('[contenteditable="true"][data-page-id]');
    }

    if (!pageEl) return;

    // Step 5: Ensure range exists and is anchored within the current page container
    if (!range || !pageEl.contains(range.startContainer)) {
      range = document.createRange();
      range.selectNodeContents(pageEl);
      range.collapse(false);
    }

    // Step 6: Delete any currently highlighted/selected text before inserting break
    if (!range.collapsed) {
      range.deleteContents();
    }

    // Step 7: Insert soft line break <br>
    const br = document.createElement("br");
    range.insertNode(br);

    // Step 8: Detect if cursor is at the end of the enclosing block (p, h1-h6, li, etc.)
    // Browsers require a trailing bogus <br> for caret navigation and typing on the new line
    let parentBlock: Node | null = br.parentNode;
    while (parentBlock && parentBlock !== pageEl && !/^(P|H[1-6]|LI|BLOCKQUOTE|DIV|TD|TH)$/i.test(parentBlock.nodeName)) {
      parentBlock = parentBlock.parentNode;
    }

    let isAtEndOfBlock = false;
    if (parentBlock) {
      let next: Node | null = br.nextSibling;
      while (next && next.nodeType === Node.TEXT_NODE && (next.textContent || "").trim() === "") {
        next = next.nextSibling;
      }
      if (!next) {
        isAtEndOfBlock = true;
      }
    }

    // Step 9: Append bogus <br> if inserting at the trailing edge of the block
    if (isAtEndOfBlock && parentBlock) {
      const bogusBr = document.createElement("br");
      bogusBr.setAttribute("data-bogus", "1");
      if (br.nextSibling) {
        parentBlock.insertBefore(bogusBr, br.nextSibling);
      } else {
        parentBlock.appendChild(bogusBr);
      }
    }

    // Step 10: Place the caret immediately after the inserted <br>
    const newRange = document.createRange();
    newRange.setStartAfter(br);
    newRange.collapse(true);

    if (sel) {
      sel.removeAllRanges();
      sel.addRange(newRange);
    }

    // Step 11: Persist updated selection coordinates in saved selection ref
    const currentPageId = pageEl.getAttribute("data-page-id") || "";
    savedSelectionRef.current = {
      range: newRange.cloneRange(),
      pageId: currentPageId,
      startContainer: newRange.startContainer,
      startOffset: newRange.startOffset,
      endContainer: newRange.endContainer,
      endOffset: newRange.endOffset,
    };

    // Step 12: Dispatch input event to synchronize with state & document model
    pageEl.dispatchEvent(new Event("input", { bubbles: true }));
  }, [restoreEditorSelection, docModel, editorRef]);

  /**
   * ============================================================================
   * Column Break (Ctrl + Shift + Enter)
   * ----------------------------------------------------------------------------
   * Implements true Microsoft Word-style column break behavior:
   * 1. Single Column: In Word, a column break in single-column layout behaves as a page break.
   * 2. Non-Terminal Column (Col 1 of 2, Col 1/2 of 3): Splits subsequent content into
   *    the next column on the SAME page using a `.column-break` indicator element.
   * 3. Last Column (Col 2 of 2, Col 3 of 3): Transitions subsequent content to Column 1
   *    of the NEXT page (reusing an existing blank page or appending a new page).
   * ============================================================================
   */
  const insertColumnBreak = useCallback(() => {
    // Step 1: Restore active editor selection
    restoreEditorSelection();
    const sel = window.getSelection();
    let pageEl: HTMLElement | null = null;
    let range: Range | null = null;

    // Step 2: Locate active contenteditable page element from DOM
    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      const anc = r.commonAncestorContainer;
      const el = anc.nodeType === Node.ELEMENT_NODE ? (anc as HTMLElement) : anc.parentElement;
      const found = el?.closest<HTMLElement>('[contenteditable="true"][data-page-id]');
      if (found) {
        pageEl = found;
        range = r.cloneRange();
      }
    }

    // Step 3: Fall back to saved selection ref if focus was elsewhere
    if (!pageEl && savedSelectionRef.current) {
      const saved = savedSelectionRef.current;
      const found = document.querySelector<HTMLElement>(`[contenteditable="true"][data-page-id="${saved.pageId}"]`);
      if (found) {
        pageEl = found;
        range = saved.range.cloneRange();
      }
    }

    // Step 4: Fall back to active page ID from the document model
    if (!pageEl) {
      const activeId = docModel?.activePage || docModel?.model.pages[0]?.id;
      if (activeId) {
        pageEl = document.querySelector<HTMLElement>(`[contenteditable="true"][data-page-id="${activeId}"]`);
      }
    }

    if (!pageEl) {
      pageEl = editorRef.current || document.querySelector<HTMLElement>('[contenteditable="true"][data-page-id]');
    }

    if (!pageEl) return;

    const currentPageId =
      pageEl.getAttribute("data-page-id") ||
      docModel?.activePage ||
      docModel?.model.pages[0]?.id ||
      "";

    // Step 5: Check active section column configuration (count & gap)
    const pageModel = docModel?.model.pages.find((p) => p.id === currentPageId);
    const section = docModel?.model.sections.find((s) => s.id === (pageModel?.sectionId || docModel.model.sections[0]?.id));
    const columnCount = section?.columns?.count ?? 1;

    // Word Rule: In single column mode, a column break behaves identically to a page break
    if (columnCount <= 1) {
      insertPageBreak();
      return;
    }

    if (!range || !pageEl.contains(range.startContainer)) {
      range = document.createRange();
      range.selectNodeContents(pageEl);
      range.collapse(false);
    }

    if (!range.collapsed) {
      range.deleteContents();
    }

    // Step 6: Calculate current column index (0-indexed) based on caret X coordinate
    const containerRect = pageEl.getBoundingClientRect();
    const rangeRect = range.getBoundingClientRect();
    const colGap = section?.columns?.gap ?? 32;
    const colWidth = (containerRect.width - (columnCount - 1) * colGap) / columnCount;

    let targetLeft = rangeRect.left;
    if (targetLeft === 0) {
      const pNode = range.startContainer.nodeType === Node.ELEMENT_NODE
        ? (range.startContainer as HTMLElement)
        : range.startContainer.parentElement;
      if (pNode) {
        targetLeft = pNode.getBoundingClientRect().left;
      }
    }

    const relX = Math.max(0, targetLeft - containerRect.left);
    const currentColIdx = Math.min(columnCount - 1, Math.floor(relX / (colWidth + colGap)));

    // Step 7: Create the standard visual Column Break indicator element
    const colBreakEl = document.createElement("div");
    colBreakEl.className = "column-break";
    colBreakEl.contentEditable = "false";
    colBreakEl.setAttribute("data-column-break", "true");
    colBreakEl.setAttribute("data-cb", "1");
    colBreakEl.setAttribute(
      "style",
      "break-after: column; -webkit-column-break-after: always; page-break-after: column; border-top: 1px dotted #94a3b8; margin: 12px 0; text-align: center; color: #94a3b8; font-size: 9pt; user-select: none;"
    );
    colBreakEl.textContent = "— Column Break —";

    // --------------------------------------------------------------------------
    // CASE 1: Caret is in the LAST column -> transition subsequent content to NEXT page
    // --------------------------------------------------------------------------
    if (currentColIdx >= columnCount - 1) {
      const splitRange = document.createRange();
      splitRange.setStart(range.endContainer, range.endOffset);
      if (pageEl.lastChild) {
        splitRange.setEndAfter(pageEl.lastChild);
      } else {
        splitRange.selectNodeContents(pageEl);
      }

      const fragment = splitRange.extractContents();
      const tempDiv = document.createElement("div");
      tempDiv.appendChild(fragment);

      let trailingHtml = tempDiv.innerHTML.trim();

      // Insert column-break marker on the current page
      let cursorBlock: Node | null = range.endContainer;
      while (cursorBlock && cursorBlock.parentNode !== pageEl) {
        cursorBlock = cursorBlock.parentNode;
      }

      if (cursorBlock && cursorBlock.parentNode === pageEl) {
        const isBlockEmpty =
          cursorBlock.nodeType === Node.ELEMENT_NODE &&
          (cursorBlock as HTMLElement).textContent?.trim() === "" &&
          !(cursorBlock as HTMLElement).querySelector("table, img, video, iframe");

        if (isBlockEmpty && pageEl.children.length > 1) {
          pageEl.replaceChild(colBreakEl, cursorBlock);
        } else {
          if (cursorBlock.nextSibling) {
            pageEl.insertBefore(colBreakEl, cursorBlock.nextSibling);
          } else {
            pageEl.appendChild(colBreakEl);
          }
        }
      } else {
        pageEl.appendChild(colBreakEl);
      }

      if (pageEl.firstChild === colBreakEl) {
        const emptyP = document.createElement("p");
        emptyP.innerHTML = "<br/>";
        pageEl.insertBefore(emptyP, colBreakEl);
      }

      if (!trailingHtml || trailingHtml === "<br>" || trailingHtml === "<p></p>" || trailingHtml === "<p><br></p>") {
        trailingHtml = "<p><br/></p>";
      }

      const remainingHtml = pageEl.innerHTML.trim() || "<p><br/></p>";

      // Transfer trailing content to the next page
      if (docModel && currentPageId) {
        docModel.setPageHtml(currentPageId, remainingHtml);

        const pages = docModel.model.pages;
        const currentIdx = pages.findIndex((p) => p.id === currentPageId);
        const nextPage = currentIdx >= 0 && currentIdx + 1 < pages.length ? pages[currentIdx + 1] : null;

        let targetPageId = "";

        if (nextPage) {
          const nextHtml = (docModel.model.pageHtml[nextPage.id] || "").trim();
          const isNextBlank =
            !nextHtml ||
            nextHtml === "<p></p>" ||
            nextHtml === "<p><br></p>" ||
            nextHtml === "<p><br/></p>";

          if (isNextBlank) {
            docModel.setPageHtml(nextPage.id, trailingHtml);
            targetPageId = nextPage.id;
          } else {
            targetPageId = docModel.addPage(currentPageId, trailingHtml);
          }
        } else {
          targetPageId = docModel.addPage(currentPageId, trailingHtml);
        }

        docModel.setActivePage(targetPageId);
        recordSnapshot(currentPageId, remainingHtml, undefined, "Insert Column Break");
        if (targetPageId) {
          recordSnapshot(targetPageId, trailingHtml, 0, "Insert Column Break");
        }

        pageEl.dispatchEvent(new Event("input", { bubbles: true }));

        setTimeout(() => {
          focusPageInDom(targetPageId, "start");
        }, 50);
      }
      return;
    }

    // --------------------------------------------------------------------------
    // CASE 2: Caret is NOT in the last column -> move subsequent content to NEXT column on SAME page
    // --------------------------------------------------------------------------
    let topBlock: Node | null = range.endContainer;
    while (topBlock && topBlock.parentNode !== pageEl) {
      topBlock = topBlock.parentNode;
    }

    let nextBlockToFocus: HTMLElement | null = null;

    if (topBlock && topBlock.parentNode === pageEl) {
      // Split the current paragraph block at cursor position
      const splitBlockRange = document.createRange();
      splitBlockRange.setStart(range.endContainer, range.endOffset);
      splitBlockRange.setEndAfter(topBlock.lastChild || topBlock);

      const trailingFragment = splitBlockRange.extractContents();
      const trailingDiv = document.createElement("div");
      trailingDiv.appendChild(trailingFragment);

      let trailingText = trailingDiv.innerHTML.trim();
      if (!trailingText || trailingText === "<br>") {
        trailingText = "<br/>";
      }

      // Create new paragraph block placed after the column-break marker
      const nextP = document.createElement("p");
      nextP.innerHTML = trailingText;

      if (topBlock.nextSibling) {
        pageEl.insertBefore(colBreakEl, topBlock.nextSibling);
        pageEl.insertBefore(nextP, colBreakEl.nextSibling);
      } else {
        pageEl.appendChild(colBreakEl);
        pageEl.appendChild(nextP);
      }

      nextBlockToFocus = nextP;
    } else {
      const nextP = document.createElement("p");
      nextP.innerHTML = "<br/>";
      pageEl.appendChild(colBreakEl);
      pageEl.appendChild(nextP);
      nextBlockToFocus = nextP;
    }

    // Place caret at start of the newly moved content in the next column
    if (nextBlockToFocus) {
      const caretRange = document.createRange();
      caretRange.selectNodeContents(nextBlockToFocus);
      caretRange.collapse(true);
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(caretRange);
      }

      savedSelectionRef.current = {
        range: caretRange.cloneRange(),
        pageId: currentPageId,
        startContainer: caretRange.startContainer,
        startOffset: caretRange.startOffset,
        endContainer: caretRange.endContainer,
        endOffset: caretRange.endOffset,
      };
    }

    // Persist updated page HTML into document model
    const newHtml = pageEl.innerHTML;
    if (docModel && currentPageId) {
      docModel.setPageHtml(currentPageId, newHtml);
      recordSnapshot(currentPageId, newHtml, undefined, "Insert Column Break");
    }

    pageEl.dispatchEvent(new Event("input", { bubbles: true }));
  }, [restoreEditorSelection, docModel, editorRef, insertPageBreak, recordSnapshot]);

  const undoMultiple = useCallback((count: number) => {
    if (count <= 0) return;
    const stack = historyStackRef.current;
    let idx = historyIndexRef.current;
    if (idx <= 0 || stack.length === 0) {
      return;
    }

    // Check if the current action being undone is a page-break
    const currentAction = stack[idx];
    if (currentAction?.actionType === "page-break" && currentAction.pageBreakData) {
      const data = currentAction.pageBreakData;
      const targetIdx = Math.max(0, idx - count);
      historyIndexRef.current = targetIdx;
      setHistoryVersion((v) => v + 1);
      isUndoingRedoingRef.current = true;

      if (docModel) {
        docModel.setPageHtml(data.sourcePageId, data.sourceHtmlBefore);
        if (data.isNewPage) {
          docModel.removePage(data.targetPageId);
        } else {
          docModel.setPageHtml(data.targetPageId, data.targetHtmlBefore || "<p><br/></p>");
        }
        docModel.setActivePage(data.sourcePageId);

        setTimeout(() => {
          const sourceEl = document.querySelector<HTMLDivElement>(
            `[contenteditable="true"][data-page-id="${data.sourcePageId}"]`
          );
          if (sourceEl) {
            sourceEl.innerHTML = data.sourceHtmlBefore;
            setCaretCharacterOffsetWithin(sourceEl, data.caretOffsetBefore);
          }
          focusPageInDom(data.sourcePageId, "start");
          setTimeout(() => {
            if (sourceEl) setCaretCharacterOffsetWithin(sourceEl, data.caretOffsetBefore);
            isUndoingRedoingRef.current = false;
          }, 40);
        }, 40);
      } else {
        isUndoingRedoingRef.current = false;
      }
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
    const targetAction = stack[targetIdx];
    if (!targetAction) return;

    if (targetAction.actionType === "page-break" && targetAction.pageBreakData) {
      const data = targetAction.pageBreakData;
      historyIndexRef.current = targetIdx;
      setHistoryVersion((v) => v + 1);
      isUndoingRedoingRef.current = true;

      if (docModel) {
        docModel.setPageHtml(data.sourcePageId, data.sourceHtmlAfter);

        let finalTargetId = data.targetPageId;
        if (data.isNewPage) {
          finalTargetId = docModel.addPage(data.sourcePageId, data.targetHtmlAfter);
          data.targetPageId = finalTargetId;
          targetAction.pageId = finalTargetId;
        } else {
          docModel.setPageHtml(data.targetPageId, data.targetHtmlAfter);
        }

        docModel.setActivePage(finalTargetId);

        setTimeout(() => {
          focusPageInDom(finalTargetId, "start");
          isUndoingRedoingRef.current = false;
        }, 50);
      } else {
        isUndoingRedoingRef.current = false;
      }
      return;
    }

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
    insertPageBreak,
    insertLineBreak,
    insertColumnBreak,

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