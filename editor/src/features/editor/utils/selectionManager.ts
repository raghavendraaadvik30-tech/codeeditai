/**
 * selectionManager.ts
 * 
 * Enterprise-grade Selection & Formatting Manager for the Word Document Editor.
 * 
 * Responsibilities:
 * - Safely captures, saves, and restores text selections across DOM updates and toolbar interactions.
 * - Handles both single-page and cross-page selections.
 * - Applies formatting commands exclusively to selected ranges or sets state for future typing.
 * - Prevents selection collapse when interacting with dropdowns, color pickers, inputs, and buttons.
 */

export interface SavedSelection {
  pageId: string;
  startContainerPath: number[];
  endContainerPath: number[];
  startOffset: number;
  endOffset: number;
  startCharOffset: number;
  endCharOffset: number;
  selectedText: string;
  isCollapsed: boolean;
  rawRange?: Range;
  // Cross-page selection info
  isCrossPage?: boolean;
  startPageId?: string;
  endPageId?: string;
  startPageCharOffset?: number;
  endPageCharOffset?: number;
}

export interface FutureFormattingState {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  subscript?: boolean;
  superscript?: boolean;
  fontSize?: string;
  fontFamily?: string;
  color?: string;
  highlight?: string;
}

/** Helper to generate DOM node path relative to a container */
function getNodePath(root: Node, node: Node): number[] {
  const path: number[] = [];
  let curr: Node | null = node;
  while (curr && curr !== root) {
    const parent: Node | null = curr.parentNode;
    if (!parent) break;
    const index = Array.from(parent.childNodes).indexOf(curr as ChildNode);
    path.unshift(index);
    curr = parent;
  }
  return path;
}

/** Helper to resolve DOM node from path relative to a container */
function resolveNodePath(root: Node, path: number[]): Node | null {
  let curr: Node = root;
  for (const index of path) {
    if (!curr.childNodes || index >= curr.childNodes.length) {
      return curr;
    }
    curr = curr.childNodes[index];
  }
  return curr;
}

/** Computes character offset within an element */
function getCharOffsetWithin(container: HTMLElement, targetNode: Node, targetOffset: number): number {
  let offset = 0;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let n: Node | null;
  while ((n = walker.nextNode())) {
    if (n === targetNode) {
      return offset + targetOffset;
    }
    offset += (n.textContent?.length || 0);
  }
  if (targetNode.nodeType === Node.ELEMENT_NODE) {
    let elOffset = 0;
    for (let i = 0; i < targetOffset && i < targetNode.childNodes.length; i++) {
      elOffset += (targetNode.childNodes[i].textContent?.length || 0);
    }
    return offset + elOffset;
  }
  return offset;
}

/** Resolves DOM node and offset from character offset within container */
function getNodeAtCharOffset(container: HTMLElement, targetCharOffset: number): { node: Node; offset: number } | null {
  let accumulated = 0;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let n: Node | null;
  let lastNode: Node | null = null;

  while ((n = walker.nextNode())) {
    lastNode = n;
    const length = n.textContent?.length || 0;
    if (accumulated + length >= targetCharOffset) {
      return {
        node: n,
        offset: Math.max(0, Math.min(targetCharOffset - accumulated, length)),
      };
    }
    accumulated += length;
  }

  if (lastNode) {
    return {
      node: lastNode,
      offset: lastNode.textContent?.length || 0,
    };
  }

  const p = container.querySelector("p") || container.firstChild || container;
  return { node: p, offset: 0 };
}

class SelectionManagerClass {
  private savedSelection: SavedSelection | null = null;
  private futureFormatting: FutureFormattingState = {};
  private isLocked: boolean = false;

  /**
   * Captures the current browser selection if inside an editor container.
   */
  public saveSelection(): SavedSelection | null {
    if (this.isLocked) return this.savedSelection;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;

    const range = sel.getRangeAt(0);
    const startEl = range.startContainer.nodeType === Node.ELEMENT_NODE
      ? (range.startContainer as HTMLElement)
      : range.startContainer.parentElement;

    const endEl = range.endContainer.nodeType === Node.ELEMENT_NODE
      ? (range.endContainer as HTMLElement)
      : range.endContainer.parentElement;

    const startPage = startEl?.closest<HTMLElement>('[contenteditable="true"][data-page-id]');
    const endPage = endEl?.closest<HTMLElement>('[contenteditable="true"][data-page-id]');

    if (!startPage) {
      // Selection is outside editor (e.g. in toolbar), keep previously saved selection
      return this.savedSelection;
    }

    const isCrossPage = Boolean(endPage && startPage !== endPage);
    const startPageId = startPage.getAttribute("data-page-id") || "";
    const endPageId = endPage?.getAttribute("data-page-id") || startPageId;

    const startChar = getCharOffsetWithin(startPage, range.startContainer, range.startOffset);
    const endChar = isCrossPage && endPage
      ? getCharOffsetWithin(endPage, range.endContainer, range.endOffset)
      : getCharOffsetWithin(startPage, range.endContainer, range.endOffset);

    this.savedSelection = {
      pageId: startPageId,
      startContainerPath: getNodePath(startPage, range.startContainer),
      endContainerPath: getNodePath(isCrossPage && endPage ? endPage : startPage, range.endContainer),
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      startCharOffset: startChar,
      endCharOffset: endChar,
      selectedText: sel.toString(),
      isCollapsed: range.collapsed,
      rawRange: range.cloneRange(),
      isCrossPage,
      startPageId,
      endPageId,
      startPageCharOffset: startChar,
      endPageCharOffset: endChar,
    };

    return this.savedSelection;
  }

  /**
   * Restores the saved selection to the editor DOM.
   */
  public restoreSelection(): boolean {
    if (!this.savedSelection) {
      const sel = window.getSelection();
      return Boolean(sel && sel.rangeCount > 0);
    }

    const {
      pageId,
      startCharOffset,
      endCharOffset,
      startContainerPath,
      endContainerPath,
      startOffset,
      endOffset,
      isCrossPage,
      endPageId,
    } = this.savedSelection;

    const startPage = document.querySelector<HTMLElement>(
      `[contenteditable="true"][data-page-id="${pageId}"]`
    );
    if (!startPage) return false;

    const endPage = isCrossPage && endPageId
      ? document.querySelector<HTMLElement>(`[contenteditable="true"][data-page-id="${endPageId}"]`)
      : startPage;

    if (!endPage) return false;

    // Focus start page without scrolling unnecessarily
    startPage.focus({ preventScroll: true });

    const sel = window.getSelection();
    if (!sel) return false;

    try {
      // 1. Try Character Offset restoration (most resilient across HTML formatting mutations)
      const startPoint = getNodeAtCharOffset(startPage, startCharOffset);
      const endPoint = getNodeAtCharOffset(endPage, endCharOffset);

      if (startPoint && endPoint) {
        const range = document.createRange();
        range.setStart(startPoint.node, startPoint.offset);
        range.setEnd(endPoint.node, endPoint.offset);
        sel.removeAllRanges();
        sel.addRange(range);
        return true;
      }

      // 2. Try Node Path restoration
      const startNode = resolveNodePath(startPage, startContainerPath);
      const endNode = resolveNodePath(endPage, endContainerPath);

      if (startNode && endNode) {
        const range = document.createRange();
        const maxStartOffset = startNode.nodeType === Node.TEXT_NODE
          ? (startNode.textContent?.length || 0)
          : startNode.childNodes.length;
        const maxEndOffset = endNode.nodeType === Node.TEXT_NODE
          ? (endNode.textContent?.length || 0)
          : endNode.childNodes.length;

        range.setStart(startNode, Math.min(startOffset, maxStartOffset));
        range.setEnd(endNode, Math.min(endOffset, maxEndOffset));
        sel.removeAllRanges();
        sel.addRange(range);
        return true;
      }

      // 3. Try raw range fallback
      if (this.savedSelection.rawRange) {
        sel.removeAllRanges();
        sel.addRange(this.savedSelection.rawRange);
        return true;
      }
    } catch (e) {
      console.warn("SelectionManager restore error:", e);
    }

    return false;
  }

  /** Gets the active range or saved range */
  public getSelectedRange(): Range | null {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      const anc = r.commonAncestorContainer;
      const el = anc.nodeType === Node.ELEMENT_NODE ? (anc as HTMLElement) : anc.parentElement;
      if (el?.closest('[contenteditable="true"]')) {
        return r;
      }
    }
    return this.savedSelection?.rawRange || null;
  }

  /** Gets currently selected text */
  public getSelectedText(): string {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      return sel.toString();
    }
    return this.savedSelection?.selectedText || "";
  }

  /** Returns true if current selection is inside the editor */
  public isSelectionInsideEditor(): boolean {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    const anc = sel.getRangeAt(0).commonAncestorContainer;
    const el = anc.nodeType === Node.ELEMENT_NODE ? (anc as HTMLElement) : anc.parentElement;
    return Boolean(el?.closest('[contenteditable="true"]'));
  }

  /** Returns true if selection spans across multiple pages */
  public isSelectionAcrossPages(): boolean {
    return Boolean(this.savedSelection?.isCrossPage);
  }

  /** Returns current saved selection object */
  public getCurrentSelection(): SavedSelection | null {
    return this.savedSelection;
  }

  /** Set lock state during formatting mutations */
  public setLocked(locked: boolean) {
    this.isLocked = locked;
  }

  /** Set future typing formatting state */
  public setFutureFormatting(formatting: FutureFormattingState) {
    this.futureFormatting = { ...this.futureFormatting, ...formatting };
  }

  /** Get future typing formatting state */
  public getFutureFormatting(): FutureFormattingState {
    return this.futureFormatting;
  }

  /** Clear future formatting state */
  public clearFutureFormatting() {
    this.futureFormatting = {};
  }
}

export const SelectionManager = new SelectionManagerClass();
