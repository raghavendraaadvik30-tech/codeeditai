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
import { loadGoogleFont } from "../modules/document/api/fontapi";

interface SavedSelectionData {
  range: Range;
  pageId?: string;
  startPageId?: string;
  endPageId?: string;
  hfType?: "header" | "footer" | null;
  startContainer: Node;
  startOffset: number;
  endContainer: Node;
  endOffset: number;
  startTextOffset?: number;
  endTextOffset?: number;
}

function getCharacterOffsetInContainer(container: HTMLElement, targetNode: Node, targetOffset: number): number | null {
  try {
    if (!container.contains(targetNode)) return null;
    const range = document.createRange();
    range.selectNodeContents(container);
    range.setEnd(targetNode, targetOffset);
    return range.toString().length;
  } catch {
    return null;
  }
}

function getTextPointAtOffset(root: HTMLElement, targetOffset: number): { node: Text; offset: number } | null {
  const safeOffset = Math.max(0, targetOffset);
  let currentOffset = 0;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const textNode = node as Text;
    const length = textNode.data.length;
    if (safeOffset <= currentOffset + length) {
      return { node: textNode, offset: Math.max(0, Math.min(safeOffset - currentOffset, length)) };
    }
    currentOffset += length;
  }
  let lastText: Text | null = null;
  const endWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while ((node = endWalker.nextNode())) lastText = node as Text;
  return lastText ? { node: lastText, offset: lastText.data.length } : null;
}

function saveSelectionData(
  startPageEl: HTMLElement,
  endPageElOrRange: HTMLElement | Range,
  rangeParam?: Range
): SavedSelectionData | null {
  const endPageEl = endPageElOrRange instanceof Range ? startPageEl : endPageElOrRange;
  const range = endPageElOrRange instanceof Range ? endPageElOrRange : rangeParam!;
  if (!range) return null;

  const startOffset = getCharacterOffsetInContainer(startPageEl, range.startContainer, range.startOffset);
  const endOffset = getCharacterOffsetInContainer(endPageEl, range.endContainer, range.endOffset);
  const startPageId = startPageEl.getAttribute("data-page-id") || "";
  const endPageId = endPageEl.getAttribute("data-page-id") || "";
  const hfType = (startPageEl.getAttribute("data-hf-type") as "header" | "footer" | null) ||
                 (startPageEl.closest("[data-hf-type]")?.getAttribute("data-hf-type") as "header" | "footer" | null) ||
                 null;

  return {
    range: range.cloneRange(),
    pageId: startPageId,
    startPageId,
    endPageId,
    hfType,
    startContainer: range.startContainer,
    startOffset: range.startOffset,
    endContainer: range.endContainer,
    endOffset: range.endOffset,
    startTextOffset: startOffset !== null ? startOffset : undefined,
    endTextOffset: endOffset !== null ? endOffset : undefined,
  };
}

function getPagesInSelection(
  startPageEl: HTMLElement,
  endPageEl: HTMLElement
): HTMLElement[] {
  if (startPageEl === endPageEl) {
    return [startPageEl];
  }

  const isHf = startPageEl.hasAttribute("data-hf-type");
  if (isHf) {
    return [startPageEl];
  }

  const allPages = Array.from(
    document.querySelectorAll<HTMLElement>(
      "[data-editor-page][contenteditable='true'], [contenteditable='true'][data-page-id]:not([data-hf-type])"
    )
  ).filter((el) => !el.hasAttribute("data-hf-type") && !el.closest("[data-hf-container]"));

  const uniquePages = Array.from(new Set(allPages));

  const startIdx = uniquePages.indexOf(startPageEl);
  const endIdx = uniquePages.indexOf(endPageEl);

  if (startIdx !== -1 && endIdx !== -1) {
    const min = Math.min(startIdx, endIdx);
    const max = Math.max(startIdx, endIdx);
    return uniquePages.slice(min, max + 1);
  }

  return [startPageEl];
}

function createPageSubRange(
  pEl: HTMLElement,
  fullRange: Range,
  startPageEl: HTMLElement,
  endPageEl: HTMLElement
): Range {
  const subRange = document.createRange();

  const isStart = pEl === startPageEl;
  const isEnd = pEl === endPageEl;

  if (isStart && isEnd) {
    subRange.setStart(fullRange.startContainer, fullRange.startOffset);
    subRange.setEnd(fullRange.endContainer, fullRange.endOffset);
    return subRange;
  }

  if (isStart) {
    subRange.setStart(fullRange.startContainer, fullRange.startOffset);
    let lastNode: Node = pEl.lastChild || pEl;
    while (lastNode.lastChild) lastNode = lastNode.lastChild;
    const lastOffset =
      lastNode.nodeType === Node.TEXT_NODE
        ? (lastNode.textContent?.length || 0)
        : lastNode.childNodes.length;
    subRange.setEnd(lastNode, lastOffset);
    return subRange;
  }

  if (isEnd) {
    let firstNode: Node = pEl.firstChild || pEl;
    while (firstNode.firstChild) firstNode = firstNode.firstChild;
    subRange.setStart(firstNode, 0);
    subRange.setEnd(fullRange.endContainer, fullRange.endOffset);
    return subRange;
  }

  // Intermediate page
  let firstNode: Node = pEl.firstChild || pEl;
  while (firstNode.firstChild) firstNode = firstNode.firstChild;
  let lastNode: Node = pEl.lastChild || pEl;
  while (lastNode.lastChild) lastNode = lastNode.lastChild;
  const lastOffset =
    lastNode.nodeType === Node.TEXT_NODE
      ? (lastNode.textContent?.length || 0)
      : lastNode.childNodes.length;

  subRange.setStart(firstNode, 0);
  subRange.setEnd(lastNode, lastOffset);
  return subRange;
}

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

export interface DocumentClearHistoryData {
  pagesBefore: any[];
  pageHtmlBefore: Record<string, string>;
  activePageBefore: string | null;
}

export interface HistorySnapshot {
  pageId: string;
  html: string;
  allPagesHtml?: Record<string, string>;
  pages?: any[];
  caretOffset: number;
  label?: string;
  actionType?: "edit" | "page-break" | "document-clear";
  pageBreakData?: PageBreakHistoryData;
  documentData?: DocumentClearHistoryData;
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
  applyBulletStyle: (
  bulletChar: string,
  styleType: string
) => void;
  applyNumberingStyle: (style?: string) => void;
  applyMultilevelStyle: (style?: string) => void;
  toggleMultilevelList: (type?: string) => void;

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
  const savedSelectionRef = useRef<SavedSelectionData | null>(null);
const preserveSelectionRef = useRef(false);

useEffect(() => {
  const handleSelectionChange = () => {
    /*
     * IMPORTANT:
     * While formatting is being applied, the browser can fire
     * selectionchange several times. Do NOT overwrite the
     * original selected range during that period.
     */
    if (preserveSelectionRef.current) {
      return;
    }

    const sel = window.getSelection();

    if (!sel || sel.rangeCount === 0) {
      return;
    }

    const range = sel.getRangeAt(0);

    const startAnc = range.startContainer.nodeType === Node.ELEMENT_NODE
      ? (range.startContainer as HTMLElement)
      : range.startContainer.parentElement;
    const endAnc = range.endContainer.nodeType === Node.ELEMENT_NODE
      ? (range.endContainer as HTMLElement)
      : range.endContainer.parentElement;

    // 1. Check if selection is within Header or Footer editable container
    const startHf = startAnc?.closest<HTMLElement>('[contenteditable="true"][data-hf-type]');
    const endHf = endAnc?.closest<HTMLElement>('[contenteditable="true"][data-hf-type]') || startHf;

    if (startHf && endHf && startHf === endHf) {
      const saved = saveSelectionData(startHf, endHf, range);
      if (saved) {
        savedSelectionRef.current = saved;
      }
      return;
    }

    // 2. Check if selection is within Body page editable container
    const startPageEl = startAnc?.closest<HTMLElement>('[contenteditable="true"][data-page-id]:not([data-hf-type])');
    const endPageEl = endAnc?.closest<HTMLElement>('[contenteditable="true"][data-page-id]:not([data-hf-type])') || startPageEl;

    if (!startPageEl || !endPageEl) {
      return;
    }

    if (startPageEl.closest("[data-hf-container]") && !startPageEl.hasAttribute("data-hf-type")) {
      return;
    }

    const saved = saveSelectionData(startPageEl, endPageEl, range);
    if (saved) {
      savedSelectionRef.current = saved;
    }
  };

  document.addEventListener("selectionchange", handleSelectionChange);

  return () => {
    document.removeEventListener("selectionchange", handleSelectionChange);
  };
}, []);

  const restoreEditorSelection = useCallback((): boolean => {
  const sel = window.getSelection();
  if (!sel) return false;

  const saved = savedSelectionRef.current;

  if (!saved) {
    if (sel.rangeCount > 0) {
      const currentRange = sel.getRangeAt(0);

      const startAnc = currentRange.startContainer.nodeType === Node.ELEMENT_NODE
        ? (currentRange.startContainer as HTMLElement)
        : currentRange.startContainer.parentElement;
      const endAnc = currentRange.endContainer.nodeType === Node.ELEMENT_NODE
        ? (currentRange.endContainer as HTMLElement)
        : currentRange.endContainer.parentElement;

      const hfEl = startAnc?.closest<HTMLElement>('[contenteditable="true"][data-hf-type]');
      if (hfEl && !currentRange.collapsed) {
        const currentSaved = saveSelectionData(hfEl, hfEl, currentRange);
        if (currentSaved) {
          savedSelectionRef.current = currentSaved;
        }
        return true;
      }

      const startPageEl = startAnc?.closest<HTMLElement>('[contenteditable="true"][data-page-id]:not([data-hf-type])');
      const endPageEl = endAnc?.closest<HTMLElement>('[contenteditable="true"][data-page-id]:not([data-hf-type])') || startPageEl;

      if (startPageEl && endPageEl && !currentRange.collapsed) {
        const currentSaved = saveSelectionData(startPageEl, endPageEl, currentRange);
        if (currentSaved) {
          savedSelectionRef.current = currentSaved;
        }
        return true;
      }
    }

    if (editorRef.current) {
      editorRef.current.focus({ preventScroll: true });
      return true;
    }

    return false;
  }

  // 1. Header or Footer selection restoration
  if (saved.hfType) {
    const hfEl = document.querySelector<HTMLElement>(
      `[contenteditable="true"][data-hf-type="${saved.hfType}"][data-page-id="${saved.pageId || saved.startPageId}"]`
    ) || document.querySelector<HTMLElement>(
      `[contenteditable="true"][data-hf-type="${saved.hfType}"]`
    );

    if (!hfEl) return false;

    hfEl.focus({ preventScroll: true });

    try {
      if (saved.startTextOffset !== undefined && saved.endTextOffset !== undefined) {
        const startPoint = getTextPointAtOffset(hfEl, saved.startTextOffset);
        const endPoint = getTextPointAtOffset(hfEl, saved.endTextOffset);

        if (startPoint && endPoint) {
          const newRange = document.createRange();
          newRange.setStart(startPoint.node, startPoint.offset);
          newRange.setEnd(endPoint.node, endPoint.offset);

          sel.removeAllRanges();
          sel.addRange(newRange);
          return true;
        }
      }

      if (hfEl.contains(saved.startContainer) && hfEl.contains(saved.endContainer)) {
        const newRange = document.createRange();
        newRange.setStart(saved.startContainer, saved.startOffset);
        newRange.setEnd(saved.endContainer, saved.endOffset);

        sel.removeAllRanges();
        sel.addRange(newRange);
        return true;
      }

      if (saved.range) {
        sel.removeAllRanges();
        sel.addRange(saved.range);
        return true;
      }
    } catch (err) {
      console.warn("Failed to restore header/footer selection:", err);
    }
    return false;
  }

  // 2. Body selection restoration
  const startPage = document.querySelector<HTMLElement>(
    `[contenteditable="true"][data-editor-page="${saved.startPageId}"], [contenteditable="true"][data-page-id="${saved.startPageId}"]:not([data-hf-type])`
  ) || editorRef.current;

  const endPage = document.querySelector<HTMLElement>(
    `[contenteditable="true"][data-editor-page="${saved.endPageId}"], [contenteditable="true"][data-page-id="${saved.endPageId}"]:not([data-hf-type])`
  ) || startPage;

  if (!startPage || !endPage) {
    return false;
  }

  startPage.focus({ preventScroll: true });

  try {
    if (saved.startTextOffset !== undefined && saved.endTextOffset !== undefined) {
      const startPoint = getTextPointAtOffset(startPage, saved.startTextOffset);
      const endPoint = getTextPointAtOffset(endPage, saved.endTextOffset);

      if (startPoint && endPoint) {
        const newRange = document.createRange();
        newRange.setStart(startPoint.node, startPoint.offset);
        newRange.setEnd(endPoint.node, endPoint.offset);

        sel.removeAllRanges();
        sel.addRange(newRange);
        return true;
      }
    }

    if (
      startPage.contains(saved.startContainer) &&
      endPage.contains(saved.endContainer)
    ) {
      const newRange = document.createRange();
      newRange.setStart(saved.startContainer, saved.startOffset);
      newRange.setEnd(saved.endContainer, saved.endOffset);

      sel.removeAllRanges();
      sel.addRange(newRange);
      return true;
    }

    if (saved.range) {
      sel.removeAllRanges();
      sel.addRange(saved.range);
      return true;
    }
  } catch (error) {
    console.warn("Failed to restore editor selection:", error);
  }

  return false;
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

  const docModel = useDocumentModel();

  const historyStackRef = useRef<HistorySnapshot[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isUndoingRedoingRef = useRef<boolean>(false);
  const isAllPagesSelectedRef = useRef<boolean>(false);
  const [, setHistoryVersion] = useState(0);

  const activeDocId = docModel?.model?.id;
  const prevDocIdRef = useRef<string | undefined>(activeDocId);

  useEffect(() => {
    if (activeDocId && activeDocId !== prevDocIdRef.current) {
      prevDocIdRef.current = activeDocId;
      historyStackRef.current = [];
      historyIndexRef.current = -1;
      setHistoryVersion((v) => v + 1);
    }
  }, [activeDocId]);

  const initHistory = useCallback((pageId: string, html: string) => {
    if (historyStackRef.current.length === 0) {
      const allPagesHtml = docModel ? { ...docModel.model.pageHtml } : { [pageId]: html };
      const pages = docModel ? [...docModel.model.pages] : undefined;
      historyStackRef.current = [{
        pageId,
        html: html || "<p><br></p>",
        allPagesHtml,
        pages,
        caretOffset: 0,
        label: "Initial",
      }];
      historyIndexRef.current = 0;
      setHistoryVersion((v) => v + 1);
    }
  }, [docModel]);

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

      const prevHtml = idx >= 0 && stack[idx] ? stack[idx].html : (docModel?.model.pageHtml[pageId] || "");
      const label = customLabel || getActionLabel(prevHtml, html);

      const allPagesHtml = docModel ? { ...docModel.model.pageHtml, [pageId]: html } : { [pageId]: html };
      const pages = docModel ? [...docModel.model.pages] : undefined;

      let newStack: HistorySnapshot[];
      if (idx < 0 || stack.length === 0) {
        const initialHtml = prevHtml || docModel?.model.pageHtml[pageId] || html;
        const initialAllHtml = docModel ? { ...docModel.model.pageHtml, [pageId]: initialHtml } : { [pageId]: initialHtml };
        newStack = [
          { pageId, html: initialHtml, allPagesHtml: initialAllHtml, pages, caretOffset: 0, label: "Initial" },
          { pageId, html, allPagesHtml, pages, caretOffset: offset, label },
        ];
      } else {
        newStack = stack.slice(0, idx + 1);
        newStack.push({ pageId, html, allPagesHtml, pages, caretOffset: offset, label });
      }

      if (newStack.length > 2000) {
        newStack.shift();
      }

      historyStackRef.current = newStack;
      historyIndexRef.current = newStack.length - 1;
      setHistoryVersion((v) => v + 1);
    },
    [docModel, editorRef]
  );

  const applyFontSize = useCallback((size: string | number) => {
    restoreEditorSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const fullRange = sel.getRangeAt(0);

    const startAnc = fullRange.startContainer.nodeType === Node.ELEMENT_NODE
      ? (fullRange.startContainer as HTMLElement)
      : fullRange.startContainer.parentElement;
    const endAnc = fullRange.endContainer.nodeType === Node.ELEMENT_NODE
      ? (fullRange.endContainer as HTMLElement)
      : fullRange.endContainer.parentElement;

    const startHf = startAnc?.closest<HTMLElement>('[contenteditable="true"][data-hf-type]');
    const endHf = endAnc?.closest<HTMLElement>('[contenteditable="true"][data-hf-type]') || startHf;

    const startPageEl = startHf || startAnc?.closest<HTMLElement>('[contenteditable="true"][data-page-id]:not([data-hf-type])') || editorRef.current;
    const endPageEl = endHf || endAnc?.closest<HTMLElement>('[contenteditable="true"][data-page-id]:not([data-hf-type])') || startPageEl;

    if (!startPageEl || !endPageEl) return;

    const saved = saveSelectionData(startPageEl, endPageEl, fullRange);
    if (saved) savedSelectionRef.current = saved;

    const sizePt = `${size}pt`;

    // Collapsed selection on single page
    if (fullRange.collapsed) {
      const span = document.createElement("span");
      span.style.fontSize = sizePt;
      span.innerHTML = "&#8203;";
      fullRange.insertNode(span);

      const newRange = document.createRange();
      newRange.setStart(span.firstChild || span, 1);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);

      startPageEl.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    preserveSelectionRef.current = true;
    const pagesToFormat = getPagesInSelection(startPageEl, endPageEl);

    pagesToFormat.forEach((pEl) => {
      const subRange = createPageSubRange(pEl, fullRange, startPageEl!, endPageEl!);
      sel.removeAllRanges();
      sel.addRange(subRange);

      document.execCommand("styleWithCSS", false, "false");
      document.execCommand("fontSize", false, "7");

      const fontElements = Array.from(
        pEl.querySelectorAll<HTMLElement>('font[size="7"], span[style*="xxx-large"]')
      );
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
          } else {
            el.style.fontSize = sizePt;
          }
        });
      }

      pEl.dispatchEvent(new Event("input", { bubbles: true }));
    });

    const isHeaderOrFooter = startPageEl.hasAttribute("data-hf-type");
    if (!isHeaderOrFooter && docModel) {
      const allPageEls = document.querySelectorAll<HTMLElement>("[data-editor-page][contenteditable='true']");
      allPageEls.forEach((p) => {
        const pid = p.getAttribute("data-page-id") || p.getAttribute("data-editor-page");
        if (pid) {
          docModel.setPageHtml(pid, p.innerHTML);
        }
      });
      const pageId = startPageEl.getAttribute("data-page-id") || "";
      if (pageId) {
        recordSnapshot(pageId, startPageEl.innerHTML, undefined, `Font Size: ${sizePt}`);
      }
    }

    requestAnimationFrame(() => {
      restoreEditorSelection();
      setTimeout(() => {
        preserveSelectionRef.current = false;
      }, 0);
    });
  }, [restoreEditorSelection, editorRef, docModel, recordSnapshot]);

  const applyFontFamily = useCallback((font: string) => {
    loadGoogleFont(font);
    restoreEditorSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const fullRange = sel.getRangeAt(0);

    const startAnc = fullRange.startContainer.nodeType === Node.ELEMENT_NODE
      ? (fullRange.startContainer as HTMLElement)
      : fullRange.startContainer.parentElement;
    const endAnc = fullRange.endContainer.nodeType === Node.ELEMENT_NODE
      ? (fullRange.endContainer as HTMLElement)
      : fullRange.endContainer.parentElement;

    const startHf = startAnc?.closest<HTMLElement>('[contenteditable="true"][data-hf-type]');
    const endHf = endAnc?.closest<HTMLElement>('[contenteditable="true"][data-hf-type]') || startHf;

    const startPageEl = startHf || startAnc?.closest<HTMLElement>('[contenteditable="true"][data-page-id]:not([data-hf-type])') || editorRef.current;
    const endPageEl = endHf || endAnc?.closest<HTMLElement>('[contenteditable="true"][data-page-id]:not([data-hf-type])') || startPageEl;

    if (!startPageEl || !endPageEl) return;

    const saved = saveSelectionData(startPageEl, endPageEl, fullRange);
    if (saved) savedSelectionRef.current = saved;

    const fontCss = `${font}, Calibri, sans-serif`;

    if (fullRange.collapsed) {
      const span = document.createElement("span");
      span.style.fontFamily = fontCss;
      span.innerHTML = "&#8203;";
      fullRange.insertNode(span);

      const newRange = document.createRange();
      newRange.setStart(span.firstChild || span, 1);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);

      startPageEl.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    preserveSelectionRef.current = true;
    const pagesToFormat = getPagesInSelection(startPageEl, endPageEl);

    pagesToFormat.forEach((pEl) => {
      const subRange = createPageSubRange(pEl, fullRange, startPageEl!, endPageEl!);
      sel.removeAllRanges();
      sel.addRange(subRange);

      document.execCommand("fontName", false, font);

      const fontElements = Array.from(
        pEl.querySelectorAll<HTMLElement>(`font[face="${font}"], font[face*="${font}"]`)
      );
      if (fontElements.length > 0) {
        fontElements.forEach((el) => {
          const span = document.createElement("span");
          span.style.fontFamily = fontCss;
          while (el.firstChild) {
            span.appendChild(el.firstChild);
          }
          el.parentNode?.replaceChild(span, el);
        });
      }

      pEl.dispatchEvent(new Event("input", { bubbles: true }));
    });

    const isHeaderOrFooter = startPageEl.hasAttribute("data-hf-type");
    if (!isHeaderOrFooter && docModel) {
      const allPageEls = document.querySelectorAll<HTMLElement>("[data-editor-page][contenteditable='true']");
      allPageEls.forEach((p) => {
        const pid = p.getAttribute("data-page-id") || p.getAttribute("data-editor-page");
        if (pid) {
          docModel.setPageHtml(pid, p.innerHTML);
        }
      });
      const pageId = startPageEl.getAttribute("data-page-id") || "";
      if (pageId) {
        recordSnapshot(pageId, startPageEl.innerHTML, undefined, `Font: ${font}`);
      }
    }

    requestAnimationFrame(() => {
      restoreEditorSelection();
      setTimeout(() => {
        preserveSelectionRef.current = false;
      }, 0);
    });
  }, [restoreEditorSelection, editorRef, docModel, recordSnapshot]);

  const applyFormatCommand = useCallback(
    (command: string, value?: string) => {
      const restored = restoreEditorSelection();
      if (!restored) return;

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const fullRange = sel.getRangeAt(0);

      const startAnc = fullRange.startContainer.nodeType === Node.ELEMENT_NODE
        ? (fullRange.startContainer as HTMLElement)
        : fullRange.startContainer.parentElement;
      const endAnc = fullRange.endContainer.nodeType === Node.ELEMENT_NODE
        ? (fullRange.endContainer as HTMLElement)
        : fullRange.endContainer.parentElement;

      const startHf = startAnc?.closest<HTMLElement>('[contenteditable="true"][data-hf-type]');
      const endHf = endAnc?.closest<HTMLElement>('[contenteditable="true"][data-hf-type]') || startHf;

      const startPageEl = startHf || startAnc?.closest<HTMLElement>('[contenteditable="true"][data-page-id]:not([data-hf-type])') || editorRef.current;
      const endPageEl = endHf || endAnc?.closest<HTMLElement>('[contenteditable="true"][data-page-id]:not([data-hf-type])') || startPageEl;

      if (!startPageEl || !endPageEl) return;

      const saved = saveSelectionData(startPageEl, endPageEl, fullRange);
      if (saved) savedSelectionRef.current = saved;

      preserveSelectionRef.current = true;
      const pagesToFormat = getPagesInSelection(startPageEl, endPageEl);

      try {
        pagesToFormat.forEach((pEl) => {
          const subRange = createPageSubRange(pEl, fullRange, startPageEl!, endPageEl!);
          sel.removeAllRanges();
          sel.addRange(subRange);
          try {
            document.execCommand(command, false, value);
          } catch (e) {
            console.warn("Formatting failed on page:", pEl, e);
          }
          pEl.dispatchEvent(new Event("input", { bubbles: true }));
        });
      } catch (error) {
        console.warn("Formatting command failed:", error);
      }

      const isHeaderOrFooter = startPageEl.hasAttribute("data-hf-type");
      if (!isHeaderOrFooter && docModel) {
        const allPageEls = document.querySelectorAll<HTMLElement>("[data-editor-page][contenteditable='true']");
        allPageEls.forEach((p) => {
          const pid = p.getAttribute("data-page-id") || p.getAttribute("data-editor-page");
          if (pid) {
            docModel.setPageHtml(pid, p.innerHTML);
          }
        });
        const pageId = startPageEl.getAttribute("data-page-id") || "";
        if (pageId) {
          recordSnapshot(pageId, startPageEl.innerHTML, undefined, command);
        }
      }

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          preserveSelectionRef.current = true;
          restoreEditorSelection();

          const finalSel = window.getSelection();
          if (finalSel && finalSel.rangeCount > 0) {
            const finalRange = finalSel.getRangeAt(0);
            if (!finalRange.collapsed) {
              const finalStartAnc = finalRange.startContainer.nodeType === Node.ELEMENT_NODE
                ? (finalRange.startContainer as HTMLElement)
                : finalRange.startContainer.parentElement;
              const finalEndAnc = finalRange.endContainer.nodeType === Node.ELEMENT_NODE
                ? (finalRange.endContainer as HTMLElement)
                : finalRange.endContainer.parentElement;

              const finalStart = finalStartAnc?.closest<HTMLElement>('[contenteditable="true"][data-page-id]') || startPageEl;
              const finalEnd = finalEndAnc?.closest<HTMLElement>('[contenteditable="true"][data-page-id]') || endPageEl;

              if (finalStart && finalEnd) {
                const finalSaved = saveSelectionData(finalStart, finalEnd, finalRange);
                if (finalSaved) {
                  savedSelectionRef.current = finalSaved;
                }
              }
            }
          }

          setTimeout(() => {
            preserveSelectionRef.current = false;
          }, 0);
        });
      });
    },
    [restoreEditorSelection, editorRef, docModel, recordSnapshot]
  );

  const applyBlockStyle = useCallback((tag: string) => {
    restoreEditorSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const fullRange = sel.getRangeAt(0);

    const startAnc = fullRange.startContainer.nodeType === Node.ELEMENT_NODE
      ? (fullRange.startContainer as HTMLElement)
      : fullRange.startContainer.parentElement;
    const endAnc = fullRange.endContainer.nodeType === Node.ELEMENT_NODE
      ? (fullRange.endContainer as HTMLElement)
      : fullRange.endContainer.parentElement;

    const startHf = startAnc?.closest<HTMLElement>('[contenteditable="true"][data-hf-type]');
    const endHf = endAnc?.closest<HTMLElement>('[contenteditable="true"][data-hf-type]') || startHf;

    const startPageEl = startHf || startAnc?.closest<HTMLElement>('[contenteditable="true"][data-page-id]:not([data-hf-type])') || editorRef.current;
    const endPageEl = endHf || endAnc?.closest<HTMLElement>('[contenteditable="true"][data-page-id]:not([data-hf-type])') || startPageEl;

    if (!startPageEl || !endPageEl) return;

    const saved = saveSelectionData(startPageEl, endPageEl, fullRange);
    if (saved) savedSelectionRef.current = saved;

    const blockTag = tag.toLowerCase() === "p" ? "<p>" : `<${tag.toUpperCase()}>`;
    const pagesToFormat = getPagesInSelection(startPageEl, endPageEl);

    pagesToFormat.forEach((pEl) => {
      const subRange = createPageSubRange(pEl, fullRange, startPageEl!, endPageEl!);
      sel.removeAllRanges();
      sel.addRange(subRange);
      document.execCommand("formatBlock", false, blockTag);
      pEl.dispatchEvent(new Event("input", { bubbles: true }));
    });

    requestAnimationFrame(() => {
      restoreEditorSelection();
    });
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
      applyFormatCommand("foreColor", token.color);
    } else if (token.color === "primary") {
      applyFormatCommand("foreColor", "#0078d4");
    }
    const align = token.alignment || token.align;
    if (align) {
      if (align === "center") document.execCommand("justifyCenter", false);
      else if (align === "right") document.execCommand("justifyRight", false);
      else if (align === "justify") document.execCommand("justifyFull", false);
      else document.execCommand("justifyLeft", false);
    }

    pageEl.dispatchEvent(new Event("input", { bubbles: true }));
  }, [restoreEditorSelection, applyFontSize, applyFontFamily, applyFormatCommand, editorRef]);

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



  const insertPageBreak = useCallback(() => {
    // 1. Locate current contenteditable page and caret range
    restoreEditorSelection();
    const sel = window.getSelection();
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
      let isNewPage: boolean;
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

    let nextBlockToFocus: HTMLElement | null;

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
    const idx = historyIndexRef.current;
    if (idx <= 0 || stack.length === 0) {
      return;
    }

    const currentAction = stack[idx];

    // Undo document-clear action (Ctrl+A -> Backspace)
    if (currentAction?.actionType === "document-clear" && currentAction.documentData) {
      const data = currentAction.documentData;
      const targetIdx = Math.max(0, idx - count);
      historyIndexRef.current = targetIdx;
      setHistoryVersion((v) => v + 1);
      isUndoingRedoingRef.current = true;

      if (docModel) {
        docModel.setModel((prev) => ({
          ...prev,
          pages: data.pagesBefore,
          pageHtml: data.pageHtmlBefore,
        }));
        if (data.activePageBefore) {
          docModel.setActivePage(data.activePageBefore);
        }

        const restoreDom = () => {
          Object.entries(data.pageHtmlBefore).forEach(([pId, html]) => {
            const pageEl = document.querySelector<HTMLDivElement>(
              `[contenteditable="true"][data-page-id="${pId}"]`
            );
            if (pageEl && pageEl.innerHTML !== html) {
              pageEl.innerHTML = html;
            }
          });
          const firstId = data.activePageBefore || data.pagesBefore[0]?.id || "";
          if (firstId) {
            focusPageInDom(firstId, "start");
          }
        };

        restoreDom();
        setTimeout(restoreDom, 30);
        setTimeout(restoreDom, 120);
        setTimeout(restoreDom, 250);
        setTimeout(() => {
          isUndoingRedoingRef.current = false;
        }, 400);
      } else {
        isUndoingRedoingRef.current = false;
      }
      return;
    }

    // Check if the current action being undone is a page-break
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

    if (snapshot.allPagesHtml && snapshot.pages && docModel) {
      docModel.setModel((prev) => ({
        ...prev,
        pages: snapshot.pages || prev.pages,
        pageHtml: snapshot.allPagesHtml || prev.pageHtml,
      }));
      Object.entries(snapshot.allPagesHtml).forEach(([pId, pHtml]) => {
        const pageNode = document.querySelector<HTMLDivElement>(
          `[contenteditable="true"][data-page-id="${pId}"]`
        );
        if (pageNode && pageNode.innerHTML !== pHtml) {
          pageNode.innerHTML = pHtml;
        }
      });
      if (docModel.activePage !== snapshot.pageId) {
        docModel.setActivePage(snapshot.pageId);
      }
    } else {
      let el = editorRef.current;
      if (!el || el.getAttribute("data-page-id") !== snapshot.pageId) {
        const pageEl = document.querySelector<HTMLDivElement>(
          `[data-editor-page="${snapshot.pageId}"],[contenteditable="true"][data-page-id="${snapshot.pageId}"]`
        );
        if (pageEl) {
          el = pageEl;
          (editorRef as React.MutableRefObject<HTMLDivElement | null>).current = pageEl;
        }
      }

      if (el) {
        el.innerHTML = snapshot.html || "<p><br></p>";
      }

      if (docModel) {
        docModel.setPageHtml(snapshot.pageId, snapshot.html || "<p><br></p>");
        if (docModel.activePage !== snapshot.pageId) {
          docModel.setActivePage(snapshot.pageId);
        }
      }
    }

    const activeEl = document.querySelector<HTMLDivElement>(
      `[contenteditable="true"][data-page-id="${snapshot.pageId}"]`
    ) || editorRef.current;

    if (activeEl) {
      try { activeEl.focus({ preventScroll: true }); } catch { /* ignore */ }
      setCaretCharacterOffsetWithin(activeEl, snapshot.caretOffset);
    }

    setTimeout(() => {
      isUndoingRedoingRef.current = false;
    }, 40);
  }, [docModel, editorRef]);

  const redoMultiple = useCallback((count: number) => {
    if (count <= 0) return;
    const stack = historyStackRef.current;
    const idx = historyIndexRef.current;
    if (idx >= stack.length - 1 || stack.length === 0) {
      return;
    }

    const targetIdx = Math.min(stack.length - 1, idx + count);
    const targetAction = stack[targetIdx];
    if (!targetAction) return;

    if (targetAction.actionType === "document-clear" && targetAction.documentData) {
      const data = targetAction.documentData;
      historyIndexRef.current = targetIdx;
      setHistoryVersion((v) => v + 1);
      isUndoingRedoingRef.current = true;

      if (docModel) {
        const firstId = data.pagesBefore[0]?.id || "p1";
        const sectionId = docModel.model.sections[0]?.id || "section_1";

        docModel.setModel((prev) => ({
          ...prev,
          pages: [{ id: firstId, sectionId }],
          pageHtml: { [firstId]: "<p><br></p>" },
        }));
        docModel.setActivePage(firstId);
        setTimeout(() => {
          const firstEl = document.querySelector<HTMLDivElement>(
            `[contenteditable="true"][data-page-id="${firstId}"]`
          );
          if (firstEl) {
            firstEl.innerHTML = "<p><br></p>";
          }
          focusPageInDom(firstId, "start");
          isUndoingRedoingRef.current = false;
        }, 50);
      } else {
        isUndoingRedoingRef.current = false;
      }
      return;
    }

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

    if (snapshot.allPagesHtml && snapshot.pages && docModel) {
      docModel.setModel((prev) => ({
        ...prev,
        pages: snapshot.pages || prev.pages,
        pageHtml: snapshot.allPagesHtml || prev.pageHtml,
      }));
      Object.entries(snapshot.allPagesHtml).forEach(([pId, pHtml]) => {
        const pageNode = document.querySelector<HTMLDivElement>(
          `[contenteditable="true"][data-page-id="${pId}"]`
        );
        if (pageNode && pageNode.innerHTML !== pHtml) {
          pageNode.innerHTML = pHtml;
        }
      });
      if (docModel.activePage !== snapshot.pageId) {
        docModel.setActivePage(snapshot.pageId);
      }
    } else {
      let el = editorRef.current;
      if (!el || el.getAttribute("data-page-id") !== snapshot.pageId) {
        const pageEl = document.querySelector<HTMLDivElement>(
          `[data-editor-page="${snapshot.pageId}"],[contenteditable="true"][data-page-id="${snapshot.pageId}"]`
        );
        if (pageEl) {
          el = pageEl;
          (editorRef as React.MutableRefObject<HTMLDivElement | null>).current = pageEl;
        }
      }

      if (el) {
        el.innerHTML = snapshot.html || "<p><br></p>";
      }

      if (docModel) {
        docModel.setPageHtml(snapshot.pageId, snapshot.html || "<p><br></p>");
        if (docModel.activePage !== snapshot.pageId) {
          docModel.setActivePage(snapshot.pageId);
        }
      }
    }

    const activeEl = document.querySelector<HTMLDivElement>(
      `[contenteditable="true"][data-page-id="${snapshot.pageId}"]`
    ) || editorRef.current;

    if (activeEl) {
      try { activeEl.focus({ preventScroll: true }); } catch { /* ignore */ }
      setCaretCharacterOffsetWithin(activeEl, snapshot.caretOffset);
    }

    setTimeout(() => {
      isUndoingRedoingRef.current = false;
    }, 40);
  }, [docModel, editorRef]);

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

      const activeEl = document.activeElement as HTMLElement | null;

      const isInsideEditorPage = Boolean(
        target?.closest("[data-editor-page]") ||
        target?.closest("[contenteditable='true']") ||
        activeEl?.closest("[data-editor-page]") ||
        activeEl?.closest("[contenteditable='true']") ||
        document.querySelector("[data-editor-page]")
      );

      const isCtrlA = (e.ctrlKey || e.metaKey) && (e.code === "KeyA" || e.key === "a" || e.key === "A");
      const isCtrlX = (e.ctrlKey || e.metaKey) && (e.code === "KeyX" || e.key === "x" || e.key === "X");
      const isBackspaceOrDelete = e.key === "Backspace" || e.key === "Delete" || e.code === "Backspace" || e.code === "Delete";
      const isPrintableChar = !e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1;

      // Unique writing page elements query (excluding header and footer)
      const pageElements = Array.from(
        new Set(
          Array.from(
            document.querySelectorAll<HTMLElement>(
              "[data-editor-page][contenteditable='true'], [contenteditable='true'][data-page-id]"
            )
          ).filter((el) => !el.hasAttribute("data-hf-type") && !el.closest("[data-hf-container]"))
        )
      );

      // 1. Ctrl+A / Cmd+A: Select All across all document writing pages (excluding header/footer)
      if (isCtrlA && isInsideEditorPage) {
        const sel = window.getSelection();

        // If focus is currently inside a header or footer box, preserve isolated native selection inside header/footer
        const activeNode = sel?.anchorNode;
        const activeNodeEl = activeNode?.nodeType === Node.ELEMENT_NODE
          ? (activeNode as HTMLElement)
          : activeNode?.parentElement;
        if (activeNodeEl?.closest("[data-hf-container]") || activeNodeEl?.hasAttribute("data-hf-type")) {
          return;
        }

        if (pageElements.length > 0) {

          // Table double Ctrl+A check: if inside cell and not yet selected cell, select cell first
          if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const anchor = range.startContainer.nodeType === Node.ELEMENT_NODE
              ? (range.startContainer as HTMLElement)
              : range.startContainer.parentElement;
            const cell = anchor?.closest("td, th");
            if (cell && !isAllPagesSelectedRef.current) {
              const cellText = (cell.textContent || "").trim();
              const selText = range.toString().trim();
              if (selText.length < cellText.length) {
                // First Ctrl+A inside cell selects cell content
                e.preventDefault();
                e.stopPropagation();
                const cellRange = document.createRange();
                cellRange.selectNodeContents(cell);
                sel.removeAllRanges();
                sel.addRange(cellRange);
                return;
              }
            }
          }

          e.preventDefault();
          e.stopPropagation();

          const range = document.createRange();
          const firstEl = pageElements[0];
          const lastEl = pageElements[pageElements.length - 1];

          let firstNode: Node = firstEl.firstChild || firstEl;
          while (firstNode.firstChild) firstNode = firstNode.firstChild;

          let lastNode: Node = lastEl.lastChild || lastEl;
          while (lastNode.lastChild) lastNode = lastNode.lastChild;

          const lastOffset =
            lastNode.nodeType === Node.TEXT_NODE
              ? (lastNode.textContent?.length || 0)
              : lastNode.childNodes.length;

          range.setStart(firstNode, 0);
          range.setEnd(lastNode, lastOffset);

          if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
          }
          isAllPagesSelectedRef.current = true;
          return;
        }
      }

      // Resolve active selection & check multi-page coverage
      const sel = window.getSelection();
      let isMultiPageSelection = false;
      let startPageId = "";
      let endPageId = "";
      let startPageEl: HTMLElement | null = null;
      let endPageEl: HTMLElement | null = null;
      let currentRange: Range | null = null;

      if (sel && sel.rangeCount > 0 && pageElements.length > 0) {
        currentRange = sel.getRangeAt(0);
        const startAnc = currentRange.startContainer.nodeType === Node.ELEMENT_NODE
          ? (currentRange.startContainer as HTMLElement)
          : currentRange.startContainer.parentElement;
        const endAnc = currentRange.endContainer.nodeType === Node.ELEMENT_NODE
          ? (currentRange.endContainer as HTMLElement)
          : currentRange.endContainer.parentElement;

        startPageEl = startAnc?.closest<HTMLElement>("[contenteditable='true'][data-page-id]") || null;
        endPageEl = endAnc?.closest<HTMLElement>("[contenteditable='true'][data-page-id]") || null;

        startPageId = startPageEl?.getAttribute("data-page-id") || "";
        endPageId = endPageEl?.getAttribute("data-page-id") || "";

        if (startPageEl && endPageEl && startPageEl !== endPageEl) {
          isMultiPageSelection = true;
        } else if (pageElements.length === 1 && currentRange) {
          const selText = currentRange.toString().trim();
          const containerText = (pageElements[0].textContent || "").trim();
          if (containerText.length > 0 && selText.length >= containerText.length * 0.85) {
            isMultiPageSelection = true;
          }
        }
      }

      const isFullDocumentSelection =
        isAllPagesSelectedRef.current ||
        (isMultiPageSelection &&
          startPageEl === pageElements[0] &&
          endPageEl === pageElements[pageElements.length - 1]);

      const shouldInterceptAction =
        (isFullDocumentSelection || isMultiPageSelection || isAllPagesSelectedRef.current) &&
        (isBackspaceOrDelete || isCtrlX || isPrintableChar);

      if (shouldInterceptAction && docModel && docModel.model.pages.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        isAllPagesSelectedRef.current = false;

        const allPages = [...docModel.model.pages];
        const pageHtmlBefore = { ...docModel.model.pageHtml };
        const activePageBefore = docModel.activePage;

        const actionType = isCtrlX ? "cut" : isPrintableChar ? "type" : "delete";
        const insertedText = isPrintableChar ? e.key : "";

        if (actionType === "cut") {
          let selectedText = currentRange?.toString() || "";
          if (!selectedText || isFullDocumentSelection) {
            selectedText = pageElements.map((el) => el.innerText || el.textContent || "").join("\n");
          }
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(selectedText).catch(() => {});
          }
        }

        const startIdx = allPages.findIndex((p) => p.id === startPageId);
        const endIdx = allPages.findIndex((p) => p.id === endPageId);

        if (
          isFullDocumentSelection ||
          startIdx === -1 ||
          endIdx === -1 ||
          (startIdx === 0 && endIdx === allPages.length - 1)
        ) {
          // FULL DOCUMENT CLEAR
          const firstPageId = allPages[0].id;
          const sectionId = docModel.model.sections[0]?.id || "section_1";
          const newHtml = insertedText ? `<p>${insertedText}</p>` : "<p><br></p>";

          // Instantly clear ALL page DOM elements so non-first pages disappear immediately
          pageElements.forEach((el, idx) => {
            if (idx === 0) {
              el.innerHTML = newHtml;
            } else {
              el.innerHTML = "";
            }
          });

          const stack = historyStackRef.current;
          const idx = historyIndexRef.current;
          const newStack = idx >= 0 ? stack.slice(0, idx + 1) : [];

          newStack.push({
            pageId: firstPageId,
            html: newHtml,
            caretOffset: insertedText ? insertedText.length : 0,
            label: actionType === "cut" ? "Cut All Pages" : actionType === "type" ? `Type "${insertedText}"` : "Delete All Pages",
            actionType: "document-clear",
            documentData: {
              pagesBefore: allPages,
              pageHtmlBefore,
              activePageBefore,
            },
          });

          isUndoingRedoingRef.current = true;
          historyStackRef.current = newStack;
          historyIndexRef.current = newStack.length - 1;
          setHistoryVersion((v) => v + 1);

          docModel.setModel((prev) => ({
            ...prev,
            pages: [{ id: firstPageId, sectionId }],
            pageHtml: { [firstPageId]: newHtml },
          }));
          docModel.setActivePage(firstPageId);

          setTimeout(() => {
            focusPageInDom(firstPageId, "start");
            if (insertedText && pageElements[0]) {
              setCaretCharacterOffsetWithin(pageElements[0], insertedText.length);
            }
            isUndoingRedoingRef.current = false;
          }, 100);
          return;
        } else {
          // PARTIAL MULTI-PAGE DELETE (e.g. Page 2 to Page 5)
          let startPrefixHtml = "";
          if (startPageEl && currentRange) {
            try {
              const prefixRange = document.createRange();
              prefixRange.selectNodeContents(startPageEl);
              prefixRange.setEnd(currentRange.startContainer, currentRange.startOffset);
              const fragment = prefixRange.cloneContents();
              const div = document.createElement("div");
              div.appendChild(fragment);
              startPrefixHtml = div.innerHTML;
            } catch {
              startPrefixHtml = "<p><br></p>";
            }
          }

          let endSuffixHtml = "";
          if (endPageEl && currentRange) {
            try {
              const suffixRange = document.createRange();
              suffixRange.selectNodeContents(endPageEl);
              suffixRange.setStart(currentRange.endContainer, currentRange.endOffset);
              const fragment = suffixRange.cloneContents();
              const div = document.createElement("div");
              div.appendChild(fragment);
              endSuffixHtml = div.innerHTML;
            } catch {
              endSuffixHtml = "";
            }
          }

          let mergedHtml = (startPrefixHtml + (insertedText ? insertedText : "") + endSuffixHtml).trim();
          if (!mergedHtml || mergedHtml === "<br>" || mergedHtml === "<p></p>") {
            mergedHtml = "<p><br></p>";
          }

          const remainingPages = allPages.filter((_, i) => i <= startIdx || i > endIdx);
          const newPageHtml: Record<string, string> = { ...pageHtmlBefore };
          newPageHtml[startPageId] = mergedHtml;

          for (let i = startIdx + 1; i <= endIdx; i++) {
            delete newPageHtml[allPages[i].id];
          }

          if (startPageEl) {
            startPageEl.innerHTML = mergedHtml;
          }

          const stack = historyStackRef.current;
          const idx = historyIndexRef.current;
          const newStack = idx >= 0 ? stack.slice(0, idx + 1) : [];

          newStack.push({
            pageId: startPageId,
            html: mergedHtml,
            caretOffset: insertedText.length,
            label: actionType === "cut" ? "Cut Multi-Page Selection" : actionType === "type" ? "Type over Multi-Page Selection" : "Delete Multi-Page Selection",
            actionType: "document-clear",
            documentData: {
              pagesBefore: allPages,
              pageHtmlBefore,
              activePageBefore,
            },
          });

          isUndoingRedoingRef.current = true;
          historyStackRef.current = newStack;
          historyIndexRef.current = newStack.length - 1;
          setHistoryVersion((v) => v + 1);

          docModel.setModel((prev) => ({
            ...prev,
            pages: remainingPages,
            pageHtml: newPageHtml,
          }));
          docModel.setActivePage(startPageId);

          setTimeout(() => {
            focusPageInDom(startPageId, "start");
            isUndoingRedoingRef.current = false;
          }, 100);
          return;
        }
      }

      // Reset selection flag on navigation keys
      if (
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "Escape"
      ) {
        isAllPagesSelectedRef.current = false;
      }

      // 3. Undo: Ctrl+Z or Cmd+Z (without Shift)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === "z" || e.key === "Z" || e.code === "KeyZ")) {
        e.preventDefault();
        e.stopPropagation();
        undo();
        return;
      }

      // 4. Redo: Ctrl+Y / Cmd+Y or Ctrl+Shift+Z / Cmd+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && (e.key === "y" || e.key === "Y" || e.code === "KeyY")) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "z" || e.key === "Z" || e.code === "KeyZ"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        redo();
        return;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown, true);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown, true);
  }, [undo, redo, docModel]);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyStackRef.current.length - 1;
  const applyBulletStyle = useCallback(
    (
      bulletCharOrStyle: string,
      styleType?: string
    ) => {
      const restored = restoreEditorSelection();
      if (!restored) {
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return;
      }

      const fullRange = selection.getRangeAt(0);
      const startAnc = fullRange.startContainer.nodeType === Node.ELEMENT_NODE
        ? (fullRange.startContainer as HTMLElement)
        : fullRange.startContainer.parentElement;
      const endAnc = fullRange.endContainer.nodeType === Node.ELEMENT_NODE
        ? (fullRange.endContainer as HTMLElement)
        : fullRange.endContainer.parentElement;

      const startHf = startAnc?.closest<HTMLElement>('[contenteditable="true"][data-hf-type]');
      const endHf = endAnc?.closest<HTMLElement>('[contenteditable="true"][data-hf-type]') || startHf;

      const startPageEl = startHf || startAnc?.closest<HTMLElement>('[contenteditable="true"][data-page-id]:not([data-hf-type])') || editorRef.current;
      const endPageEl = endHf || endAnc?.closest<HTMLElement>('[contenteditable="true"][data-page-id]:not([data-hf-type])') || startPageEl;

      if (!startPageEl || !endPageEl) {
        return;
      }

      const saved = saveSelectionData(startPageEl, endPageEl, fullRange);
      if (saved) {
        savedSelectionRef.current = saved;
      }

      let effectiveType = styleType || "disc";
      let effectiveChar = bulletCharOrStyle || "";

      if (bulletCharOrStyle && bulletCharOrStyle.startsWith("custom:")) {
        effectiveType = "custom";
        effectiveChar = bulletCharOrStyle.substring(7);
      } else if (["disc", "circle", "square", "none"].includes(bulletCharOrStyle)) {
        effectiveType = bulletCharOrStyle;
        effectiveChar = "";
      }

      preserveSelectionRef.current = true;
      const pagesToFormat = getPagesInSelection(startPageEl, endPageEl);

      pagesToFormat.forEach((pEl) => {
        const subRange = createPageSubRange(pEl, fullRange, startPageEl, endPageEl);
        selection.removeAllRanges();
        selection.addRange(subRange);

        let currentList: HTMLUListElement | null = null;
        let node: Node | null = subRange.startContainer;

        while (node && node !== pEl) {
          if (node instanceof HTMLUListElement) {
            currentList = node;
            break;
          }
          node = node.parentNode;
        }

        if (effectiveType === "none") {
          if (currentList) {
            document.execCommand("insertUnorderedList");
          }
          pEl.dispatchEvent(new Event("input", { bubbles: true }));
          return;
        }

        if (!currentList) {
          document.execCommand("insertUnorderedList");

          const newSelection = window.getSelection();
          if (newSelection && newSelection.rangeCount > 0) {
            const newRange = newSelection.getRangeAt(0);
            let newNode: Node | null = newRange.startContainer;

            while (newNode && newNode !== pEl) {
              if (newNode instanceof HTMLUListElement) {
                currentList = newNode;
                break;
              }
              newNode = newNode.parentNode;
            }
          }
        }

        if (currentList) {
          if (
            effectiveType === "disc" ||
            effectiveType === "circle" ||
            effectiveType === "square"
          ) {
            currentList.style.listStyleType = effectiveType;
            currentList.removeAttribute("data-custom-bullet");

            currentList.querySelectorAll(":scope > li").forEach((li) => {
              li.removeAttribute("data-custom-bullet");
              (li as HTMLElement).style.listStyleType = effectiveType;
            });
          } else if (effectiveType === "custom" || effectiveChar) {
            currentList.style.listStyleType = "none";
            currentList.setAttribute("data-custom-bullet", effectiveChar);

            currentList.querySelectorAll(":scope > li").forEach((li) => {
              li.setAttribute("data-custom-bullet", effectiveChar);
              (li as HTMLElement).style.listStyleType = "none";
            });
          }
        }

        pEl.dispatchEvent(new Event("input", { bubbles: true }));
      });

      const isHeaderOrFooter = startPageEl.hasAttribute("data-hf-type");
      if (!isHeaderOrFooter && docModel) {
        const allPageEls = document.querySelectorAll<HTMLElement>("[data-editor-page][contenteditable='true']");
        allPageEls.forEach((p) => {
          const pid = p.getAttribute("data-page-id") || p.getAttribute("data-editor-page");
          if (pid) {
            docModel.setPageHtml(pid, p.innerHTML);
          }
        });
        const pageId = startPageEl.getAttribute("data-page-id") || "";
        if (pageId) {
          recordSnapshot(pageId, startPageEl.innerHTML, undefined, `Bullet List: ${effectiveType}`);
        }
      }

      requestAnimationFrame(() => {
        restoreEditorSelection();
        setTimeout(() => {
          preserveSelectionRef.current = false;
        }, 0);
      });
    },
    [restoreEditorSelection, editorRef, docModel, recordSnapshot]
  );

  const applyNumberingStyle = useCallback(
    (styleType: string = "decimal") => {
      const restored = restoreEditorSelection();
      if (!restored) {
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return;
      }

      const fullRange = selection.getRangeAt(0);
      const startAnc = fullRange.startContainer.nodeType === Node.ELEMENT_NODE
        ? (fullRange.startContainer as HTMLElement)
        : fullRange.startContainer.parentElement;
      const endAnc = fullRange.endContainer.nodeType === Node.ELEMENT_NODE
        ? (fullRange.endContainer as HTMLElement)
        : fullRange.endContainer.parentElement;

      const startHf = startAnc?.closest<HTMLElement>('[contenteditable="true"][data-hf-type]');
      const endHf = endAnc?.closest<HTMLElement>('[contenteditable="true"][data-hf-type]') || startHf;

      const startPageEl = startHf || startAnc?.closest<HTMLElement>('[contenteditable="true"][data-page-id]:not([data-hf-type])') || editorRef.current;
      const endPageEl = endHf || endAnc?.closest<HTMLElement>('[contenteditable="true"][data-page-id]:not([data-hf-type])') || startPageEl;

      if (!startPageEl || !endPageEl) {
        return;
      }

      const saved = saveSelectionData(startPageEl, endPageEl, fullRange);
      if (saved) {
        savedSelectionRef.current = saved;
      }

      preserveSelectionRef.current = true;
      const pagesToFormat = getPagesInSelection(startPageEl, endPageEl);

      pagesToFormat.forEach((pEl) => {
        const subRange = createPageSubRange(pEl, fullRange, startPageEl, endPageEl);
        selection.removeAllRanges();
        selection.addRange(subRange);

        let currentList: HTMLOListElement | null = null;
        let node: Node | null = subRange.startContainer;

        while (node && node !== pEl) {
          if (node instanceof HTMLOListElement) {
            currentList = node;
            break;
          }
          node = node.parentNode;
        }

        if (styleType === "none") {
          if (currentList) {
            document.execCommand("insertOrderedList");
          }
          pEl.dispatchEvent(new Event("input", { bubbles: true }));
          return;
        }

        if (!currentList) {
          document.execCommand("insertOrderedList");

          const newSelection = window.getSelection();
          if (newSelection && newSelection.rangeCount > 0) {
            const newRange = newSelection.getRangeAt(0);
            let newNode: Node | null = newRange.startContainer;

            while (newNode && newNode !== pEl) {
              if (newNode instanceof HTMLOListElement) {
                currentList = newNode;
                break;
              }
              newNode = newNode.parentNode;
            }
          }
        }

        if (currentList) {
          currentList.style.listStyleType = styleType;
          const htmlType =
            styleType === "lower-alpha"
              ? "a"
              : styleType === "upper-alpha"
              ? "A"
              : styleType === "lower-roman"
              ? "i"
              : styleType === "upper-roman"
              ? "I"
              : "1";
          currentList.setAttribute("type", htmlType);

          currentList.querySelectorAll(":scope > li").forEach((li) => {
            (li as HTMLElement).style.listStyleType = styleType;
          });
        }

        pEl.dispatchEvent(new Event("input", { bubbles: true }));
      });

      const isHeaderOrFooter = startPageEl.hasAttribute("data-hf-type");
      if (!isHeaderOrFooter && docModel) {
        const allPageEls = document.querySelectorAll<HTMLElement>("[data-editor-page][contenteditable='true']");
        allPageEls.forEach((p) => {
          const pid = p.getAttribute("data-page-id") || p.getAttribute("data-editor-page");
          if (pid) {
            docModel.setPageHtml(pid, p.innerHTML);
          }
        });
        const pageId = startPageEl.getAttribute("data-page-id") || "";
        if (pageId) {
          recordSnapshot(pageId, startPageEl.innerHTML, undefined, `Numbered List: ${styleType}`);
        }
      }

      requestAnimationFrame(() => {
        restoreEditorSelection();
        setTimeout(() => {
          preserveSelectionRef.current = false;
        }, 0);
      });
    },
    [restoreEditorSelection, editorRef, docModel, recordSnapshot]
  );


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

    applyBulletStyle,
    applyNumberingStyle,
    applyMultilevelStyle: (style?: string) => applyFormatCommand("insertOrderedList", style),
    toggleMultilevelList: (type?: string) => applyFormatCommand("insertOrderedList", type),

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
