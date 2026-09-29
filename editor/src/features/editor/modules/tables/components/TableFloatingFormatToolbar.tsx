/**
 * --------------------------------------------------------------------------
 * Module: Tables
 * Feature: TableFloatingFormatToolbar Component
 * Description:
 * Word-style floating contextual text formatting toolbar for table cells.
 * Appears immediately above/near text selected inside any table cell.
 *
 * Requirements & Behavior:
 * 1. Appears ONLY when text inside a table cell (td/th) is selected.
 * 2. Positioned dynamically close to the selected text range via getBoundingClientRect.
 * 3. STABLE CONSTANT POSITION: Position is locked once opened for a selection.
 *    Increasing font size (A+) or decreasing font size (A-), toggling Bold/Italic,
 *    or changing colors will KEEP THE TOOLBAR IN ITS EXACT CONSTANT POSITION
 *    without jumping, moving, or wobbling.
 * 4. Disappears immediately when selection is cleared or user clicks outside.
 * 5. Uses onMouseDown with e.preventDefault() so table cell selection is never blurred.
 * 6. Rendered via React Portal into document.body with print:hidden (never in document HTML or exports).
 * 7. Provides Font Family, Font Size, A+/A- quick sizing, Bold, Italic, Underline,
 *    Strikethrough, Text Alignment (Left, Center, Right), Text Color, Highlight Color,
 *    and Clear Formatting.
 * --------------------------------------------------------------------------
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Highlighter,
  Baseline,
  RemoveFormatting,
  Indent,
  Outdent,
} from "lucide-react";

// --------------------------------------------------------------------------
// Configuration Constants
// --------------------------------------------------------------------------

// Font Family options (including document default Geist Variable)
const FONT_OPTIONS = [
  "Geist Variable",
  "Calibri",
  "Arial",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Courier New",
];

// Standard Typographic Font Size scale for stepping up/down
const FONT_SIZE_STEPS = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 48, 72];

// Dropdown Font Size options (pt values)
const FONT_SIZE_OPTIONS = [
  "8",
  "9",
  "10",
  "11",
  "12",
  "14",
  "16",
  "18",
  "20",
  "22",
  "24",
  "26",
  "28",
  "32",
  "36",
  "48",
  "72",
];

// Text Color Presets
const TEXT_COLORS = [
  { label: "Automatic (Black)", color: "#000000" },
  { label: "Dark Slate", color: "#334155" },
  { label: "Blue", color: "#2563eb" },
  { label: "Red", color: "#dc2626" },
  { label: "Emerald Green", color: "#059669" },
  { label: "Purple", color: "#7c3aed" },
  { label: "Amber", color: "#d97706" },
];

// Highlight Color Presets
const HIGHLIGHT_COLORS = [
  { label: "Yellow", color: "#fef08a" },
  { label: "Bright Green", color: "#bbf7d0" },
  { label: "Cyan", color: "#bae6fd" },
  { label: "Pink", color: "#fbcfe8" },
  { label: "Lavender", color: "#e9d5ff" },
  { label: "No Color", color: "transparent" },
];

interface ToolbarPosition {
  top: number;
  left: number;
}

export function TableFloatingFormatToolbar() {
  // ------------------------------------------------------------------------
  // State: Visibility and Position
  // ------------------------------------------------------------------------
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<ToolbarPosition>({ top: 0, left: 0 });

  // ------------------------------------------------------------------------
  // State: Active Formatting States
  // ------------------------------------------------------------------------
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [currentFont, setCurrentFont] = useState("Geist Variable");
  const [currentSize, setCurrentSize] = useState("12");

  // ------------------------------------------------------------------------
  // State: Open Popovers inside the Floating Toolbar
  // ------------------------------------------------------------------------
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);

  // ------------------------------------------------------------------------
  // Refs: Position Locking & Formatting Protection
  // Prevents the toolbar from jumping or shifting when A+, A-, Bold, etc. are clicked!
  // ------------------------------------------------------------------------
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const activeTableCellRef = useRef<HTMLTableCellElement | null>(null);
  const isPositionLockedRef = useRef<boolean>(false);
  const isFormattingActionRef = useRef<boolean>(false);
  const formatTimerRef = useRef<number | null>(null);

  // ------------------------------------------------------------------------
  // Helper: Close all popover dropdowns
  // ------------------------------------------------------------------------
  const closeAllSubmenus = () => {
    setFontMenuOpen(false);
    setSizeMenuOpen(false);
    setTextColorOpen(false);
    setHighlightOpen(false);
  };

  // ------------------------------------------------------------------------
  // Helper: Start formatting action protection timer
  // Keeps isFormattingActionRef true for a safe window so position stays constant
  // ------------------------------------------------------------------------
  const startFormattingProtection = () => {
    isFormattingActionRef.current = true;
    if (formatTimerRef.current !== null) {
      window.clearTimeout(formatTimerRef.current);
    }
    formatTimerRef.current = window.setTimeout(() => {
      isFormattingActionRef.current = false;
      formatTimerRef.current = null;
    }, 250);
  };

  // ------------------------------------------------------------------------
  // Helper: Execute formatting command directly on current text selection
  // Dispatches input event to editable container to guarantee auto-saving.
  // ------------------------------------------------------------------------
  const execFormat = useCallback((command: string, value: string | undefined = undefined) => {
    try {
      // Mark active formatting action to guarantee constant position
      startFormattingProtection();

      document.execCommand(command, false, value);

      // Notify the active contentEditable container of DOM modification
      if (activeTableCellRef.current) {
        const editable = activeTableCellRef.current.closest('[contenteditable="true"]');
        if (editable) {
          editable.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }

      // Update active toggle states
      setIsBold(document.queryCommandState("bold"));
      setIsItalic(document.queryCommandState("italic"));
      setIsUnderline(document.queryCommandState("underline"));
      setIsStrike(document.queryCommandState("strikeThrough"));
    } catch {
      // Ignore browser command errors
    }
  }, []);

  // ------------------------------------------------------------------------
  // Helper: Change Font Size directly using inline style on selection range
  // Keeps the toolbar in its CONSTANT position without moving!
  // ------------------------------------------------------------------------
  const applyFontSize = (sizePt: string) => {
    setCurrentSize(sizePt);
    setSizeMenuOpen(false);

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);

    // Flag that formatting action is active so position stays strictly constant
    startFormattingProtection();

    // Check if the current common ancestor or parent is already a font-size span
    const commonNode = range.commonAncestorContainer;
    const parentEl =
      commonNode.nodeType === Node.ELEMENT_NODE
        ? (commonNode as HTMLElement)
        : commonNode.parentElement;
    const existingSizeSpan = parentEl?.closest("span[style*='font-size']") as HTMLElement | null;

    if (existingSizeSpan && existingSizeSpan.textContent?.trim() === sel.toString().trim()) {
      // Directly update existing span font-size to avoid nesting redundant spans
      existingSizeSpan.style.fontSize = `${sizePt}pt`;
    } else {
      const span = document.createElement("span");
      span.style.fontSize = `${sizePt}pt`;

      try {
        range.surroundContents(span);
      } catch {
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
      }

      // Reselect contents of the newly styled span so user selection continues
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      sel.addRange(newRange);
    }

    // Keep position firmly locked
    isPositionLockedRef.current = true;

    if (activeTableCellRef.current) {
      const editable = activeTableCellRef.current.closest('[contenteditable="true"]');
      if (editable) {
        editable.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  };

  // ------------------------------------------------------------------------
  // Helper: Quick Step Font Size Up / Down (A+ / A-)
  // Steps cleanly through standard font size scale, position stays CONSTANT!
  // ------------------------------------------------------------------------
  const stepFontSize = (direction: 1 | -1) => {
    const currentNum = parseInt(currentSize, 10) || 12;
    let nextSize: number;

    if (direction === 1) {
      // Step up to the next size in the scale
      const found = FONT_SIZE_STEPS.find((s) => s > currentNum);
      nextSize = found !== undefined ? found : Math.min(72, currentNum + 2);
    } else {
      // Step down to the previous size in the scale
      const reversed = [...FONT_SIZE_STEPS].reverse();
      const found = reversed.find((s) => s < currentNum);
      nextSize = found !== undefined ? found : Math.max(6, currentNum - 2);
    }

    applyFontSize(String(nextSize));
  };

  // ------------------------------------------------------------------------
  // Helper: Change Font Family
  // ------------------------------------------------------------------------
  const applyFontFamily = (font: string) => {
    setCurrentFont(font);
    setFontMenuOpen(false);
    execFormat("fontName", font);
  };

  // ------------------------------------------------------------------------
  // Helper: Change Text Foreground Color
  // ------------------------------------------------------------------------
  const applyTextColor = (color: string) => {
    setTextColorOpen(false);
    execFormat("foreColor", color);
  };

  // ------------------------------------------------------------------------
  // Helper: Change Background Highlight Color
  // ------------------------------------------------------------------------
  const applyHighlightColor = (color: string) => {
    setHighlightOpen(false);
    if (color === "transparent") {
      execFormat("removeFormat");
    } else {
      startFormattingProtection();
      if (!document.execCommand("hiliteColor", false, color)) {
        document.execCommand("backColor", false, color);
      }
      if (activeTableCellRef.current) {
        const editable = activeTableCellRef.current.closest('[contenteditable="true"]');
        if (editable) {
          editable.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }
    }
  };

  // ------------------------------------------------------------------------
  // Core Selection Change & Position Handler
  // Checks if text is selected inside a <td> or <th> within an editor table
  // and maintains a CONSTANT anchored position while interacting.
  // ------------------------------------------------------------------------
  const handleSelectionChange = useCallback((isExplicitNewSelection: boolean = false) => {
    // If a formatting action (A+, A-, Bold, Color) just occurred,
    // KEEP THE POSITION COMPLETELY CONSTANT!
    if (isFormattingActionRef.current) {
      return;
    }

    const sel = window.getSelection();

    // 1. If selection is collapsed or empty, hide toolbar and unlock position
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setIsVisible(false);
      isPositionLockedRef.current = false;
      activeTableCellRef.current = null;
      closeAllSubmenus();
      return;
    }

    const selectedText = sel.toString().trim();
    if (selectedText.length === 0) {
      setIsVisible(false);
      isPositionLockedRef.current = false;
      activeTableCellRef.current = null;
      closeAllSubmenus();
      return;
    }

    // 2. Validate selection is strictly inside a table cell (td or th)
    const range = sel.getRangeAt(0);
    const commonNode = range.commonAncestorContainer;
    const commonEl =
      commonNode.nodeType === Node.ELEMENT_NODE
        ? (commonNode as HTMLElement)
        : commonNode.parentElement;

    const cell = commonEl?.closest("td, th") as HTMLTableCellElement | null;
    const table = cell?.closest("table");
    const editor = table?.closest('[contenteditable="true"]');

    if (!cell || !table || !editor) {
      // Selection is outside of a table cell; hide floating toolbar
      setIsVisible(false);
      isPositionLockedRef.current = false;
      activeTableCellRef.current = null;
      closeAllSubmenus();
      return;
    }

    activeTableCellRef.current = cell;

    // Read active formatting states from document
    try {
      setIsBold(document.queryCommandState("bold"));
      setIsItalic(document.queryCommandState("italic"));
      setIsUnderline(document.queryCommandState("underline"));
      setIsStrike(document.queryCommandState("strikeThrough"));

      const fontVal = document.queryCommandValue("fontName");
      if (fontVal) {
        setCurrentFont(fontVal.replace(/['"]/g, ""));
      }

      // Read current font size if available on selection
      const parentEl =
        commonNode.nodeType === Node.ELEMENT_NODE
          ? (commonNode as HTMLElement)
          : commonNode.parentElement;
      const sizeSpan = parentEl?.closest("span[style*='font-size']") as HTMLElement | null;
      if (sizeSpan && sizeSpan.style.fontSize) {
        const ptVal = parseInt(sizeSpan.style.fontSize, 10);
        if (!isNaN(ptVal)) {
          setCurrentSize(String(ptVal));
        }
      }
    } catch {
      // Ignore
    }

    // 3. Constant Position Enforcement:
    // Once the toolbar position is locked for an open selection,
    // KEEP POSITION 100% CONSTANT! NEVER recalculate or shift!
    if (isPositionLockedRef.current && !isExplicitNewSelection) {
      return;
    }

    // Compute viewport bounding box of the selected text range
    const rangeRect = range.getBoundingClientRect();
    if (rangeRect.width === 0 && rangeRect.height === 0) {
      setIsVisible(false);
      return;
    }

    // Approximate floating toolbar dimensions
    const toolbarWidth = 380;
    const toolbarHeight = 38;

    // Position directly above the selected text range
    let top = rangeRect.top - toolbarHeight - 8;

    // If too close to top of viewport, position directly below selected text
    if (top < 10) {
      top = rangeRect.bottom + 8;
    }

    // Center horizontally relative to selected text
    let left = rangeRect.left + rangeRect.width / 2 - toolbarWidth / 2;

    // Clamp horizontally to stay within viewport edges
    if (left < 10) left = 10;
    if (left + toolbarWidth > window.innerWidth - 10) {
      left = window.innerWidth - toolbarWidth - 10;
    }

    // Set position and lock it in place!
    setPosition({ top, left });
    setIsVisible(true);
    isPositionLockedRef.current = true;
  }, []);

  // ------------------------------------------------------------------------
  // Event Listeners: selectionchange, scroll, resize, mousedown, mouseup
  // ------------------------------------------------------------------------
  useEffect(() => {
    // Selection change inside editor: update formatting indicators without shifting position
    const handleDocumentSelection = () => {
      if (isFormattingActionRef.current) return;
      setTimeout(() => handleSelectionChange(false), 10);
    };

    // When mouse goes up on the document:
    const handleDocumentMouseUp = (e: MouseEvent) => {
      // 1. If click was inside the toolbar, ignore completely (position stays constant)
      if (toolbarRef.current && toolbarRef.current.contains(e.target as Node)) {
        return;
      }

      // 2. If formatting action is currently underway (e.g. A+, A-), ignore
      if (isFormattingActionRef.current) {
        return;
      }

      // 3. Check if text selection is collapsed or empty
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0 || sel.toString().trim().length === 0) {
        setIsVisible(false);
        isPositionLockedRef.current = false;
        return;
      }

      // 4. If toolbar is ALREADY visible and position is locked, KEEP POSITION CONSTANT!
      if (isPositionLockedRef.current) {
        return;
      }

      // 5. Fresh new selection gesture on the document: calculate position and lock
      setTimeout(() => handleSelectionChange(true), 15);
    };

    // When scrolling or resizing window:
    const handleWindowScrollOrResize = () => {
      // If formatting action is active (e.g. A+ or A- caused cell to expand), ignore scroll!
      if (isFormattingActionRef.current) {
        return;
      }
    };

    // When clicking outside the toolbar on the document, close dropdown submenus
    const handleDocumentMouseDown = (e: MouseEvent) => {
      if (toolbarRef.current && toolbarRef.current.contains(e.target as Node)) {
        return;
      }
      closeAllSubmenus();
    };

    document.addEventListener("selectionchange", handleDocumentSelection);
    document.addEventListener("mouseup", handleDocumentMouseUp);
    document.addEventListener("keyup", handleDocumentSelection);
    document.addEventListener("mousedown", handleDocumentMouseDown);
    window.addEventListener("scroll", handleWindowScrollOrResize, true);
    window.addEventListener("resize", handleWindowScrollOrResize);

    return () => {
      document.removeEventListener("selectionchange", handleDocumentSelection);
      document.removeEventListener("mouseup", handleDocumentMouseUp);
      document.removeEventListener("keyup", handleDocumentSelection);
      document.removeEventListener("mousedown", handleDocumentMouseDown);
      window.removeEventListener("scroll", handleWindowScrollOrResize, true);
      window.removeEventListener("resize", handleWindowScrollOrResize);
      if (formatTimerRef.current !== null) {
        window.clearTimeout(formatTimerRef.current);
      }
    };
  }, [handleSelectionChange, isVisible]);

  // ------------------------------------------------------------------------
  // If not visible, render nothing
  // ------------------------------------------------------------------------
  if (!isVisible) {
    return null;
  }

  // ------------------------------------------------------------------------
  // Render Floating Toolbar via Portal directly into document.body
  // ------------------------------------------------------------------------
  return createPortal(
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-label="Table Text Formatting Toolbar"
      data-no-print="true"
      onMouseDown={(e) => {
        // Crucial: prevent blur on contenteditable so selection is not cleared
        e.preventDefault();
      }}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      className="
        fixed z-50 flex items-center gap-1 rounded-lg border border-slate-200/90 bg-white px-2 py-1
        shadow-lg shadow-black/10 select-none text-xs text-slate-700
        dark:border-slate-700/80 dark:bg-[#0f172a] dark:text-slate-200
        animate-in fade-in zoom-in-95 duration-100 print:hidden
      "
    >
      {/* ------------------------------------------------------------------
          1. FONT FAMILY SELECTOR (Fixed width prevents horizontal toolbar shift)
          ------------------------------------------------------------------ */}
      <div className="relative shrink-0">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const next = !fontMenuOpen;
            closeAllSubmenus();
            setFontMenuOpen(next);
          }}
          className="flex h-7 items-center gap-1 rounded px-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium w-24 justify-between shrink-0"
          title="Font Family"
        >
          <span className="truncate">{currentFont}</span>
          <ChevronDown className="h-3 w-3 shrink-0 text-slate-400" />
        </button>

        {fontMenuOpen && (
          <div className="absolute left-0 top-full mt-1 z-50 w-36 rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-[#0f172a]">
            {FONT_OPTIONS.map((f) => (
              <button
                key={f}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFontFamily(f)}
                className={`w-full text-left px-2.5 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  currentFont === f ? "font-semibold text-blue-600 dark:text-blue-400" : ""
                }`}
                style={{ fontFamily: f }}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------
          2. FONT SIZE SELECTOR (Fixed width prevents horizontal toolbar shift)
          ------------------------------------------------------------------ */}
      <div className="relative shrink-0">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const next = !sizeMenuOpen;
            closeAllSubmenus();
            setSizeMenuOpen(next);
          }}
          className="flex h-7 items-center gap-0.5 rounded px-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium w-14 justify-between shrink-0"
          title="Font Size"
        >
          <span>{currentSize}</span>
          <ChevronDown className="h-3 w-3 shrink-0 text-slate-400" />
        </button>

        {sizeMenuOpen && (
          <div className="absolute left-0 top-full mt-1 z-50 w-20 max-h-48 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-[#0f172a]">
            {FONT_SIZE_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyFontSize(s)}
                className={`w-full text-left px-2.5 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  currentSize === s ? "font-semibold text-blue-600 dark:text-blue-400" : ""
                }`}
              >
                {s} pt
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------
          3. QUICK STEP FONT SIZE: A+ (Increase) & A- (Decrease)
          Positions remain 100% CONSTANT when clicked!
          ------------------------------------------------------------------ */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => stepFontSize(1)}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold"
        title="Increase Font Size (A+)"
      >
        A<sup>+</sup>
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => stepFontSize(-1)}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-bold"
        title="Decrease Font Size (A-)"
      >
        A<sup>-</sup>
      </button>

      {/* Vertical Divider */}
      <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />

      {/* ------------------------------------------------------------------
          4. BOLD TOGGLE
          ------------------------------------------------------------------ */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execFormat("bold")}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded transition-colors ${
          isBold
            ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold"
            : "hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-3.5 w-3.5" />
      </button>

      {/* ------------------------------------------------------------------
          5. ITALIC TOGGLE
          ------------------------------------------------------------------ */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execFormat("italic")}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded transition-colors ${
          isItalic
            ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 italic"
            : "hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-3.5 w-3.5" />
      </button>

      {/* ------------------------------------------------------------------
          6. UNDERLINE TOGGLE
          ------------------------------------------------------------------ */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execFormat("underline")}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded transition-colors ${
          isUnderline
            ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 underline"
            : "hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
        title="Underline (Ctrl+U)"
      >
        <Underline className="h-3.5 w-3.5" />
      </button>

      {/* ------------------------------------------------------------------
          7. STRIKETHROUGH TOGGLE
          ------------------------------------------------------------------ */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execFormat("strikeThrough")}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded transition-colors ${
          isStrike
            ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            : "hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
        title="Strikethrough"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </button>

      {/* Vertical Divider */}
      <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />

      {/* ------------------------------------------------------------------
          8. TEXT ALIGNMENT (Left, Center, Right)
          ------------------------------------------------------------------ */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execFormat("justifyLeft")}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        title="Align Left"
      >
        <AlignLeft className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execFormat("justifyCenter")}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        title="Align Center"
      >
        <AlignCenter className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execFormat("justifyRight")}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        title="Align Right"
      >
        <AlignRight className="h-3.5 w-3.5" />
      </button>

      {/* ------------------------------------------------------------------
          8b. INDENT / OUTDENT
          ------------------------------------------------------------------ */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execFormat("outdent")}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        title="Decrease Indent"
      >
        <Outdent className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execFormat("indent")}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        title="Increase Indent"
      >
        <Indent className="h-3.5 w-3.5" />
      </button>

      {/* Vertical Divider */}
      <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />

      {/* ------------------------------------------------------------------
          9. TEXT FOREGROUND COLOR DROPDOWN
          ------------------------------------------------------------------ */}
      <div className="relative shrink-0">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const next = !textColorOpen;
            closeAllSubmenus();
            setTextColorOpen(next);
          }}
          className="flex h-7 items-center gap-0.5 rounded px-1 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          title="Text Color"
        >
          <Baseline className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
        </button>

        {textColorOpen && (
          <div className="absolute left-0 top-full mt-1 z-50 w-36 rounded-md border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-[#0f172a] space-y-1">
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Text Color
            </div>
            {TEXT_COLORS.map((c) => (
              <button
                key={c.color}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyTextColor(c.color)}
                className="w-full text-left flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
              >
                <div
                  className="h-3 w-3 rounded-full border border-slate-300 shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <span className="truncate">{c.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------
          10. HIGHLIGHT BACKGROUND COLOR DROPDOWN
          ------------------------------------------------------------------ */}
      <div className="relative shrink-0">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const next = !highlightOpen;
            closeAllSubmenus();
            setHighlightOpen(next);
          }}
          className="flex h-7 items-center gap-0.5 rounded px-1 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          title="Highlight Color"
        >
          <Highlighter className="h-3.5 w-3.5 text-amber-500" />
          <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
        </button>

        {highlightOpen && (
          <div className="absolute left-0 top-full mt-1 z-50 w-36 rounded-md border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-[#0f172a] space-y-1">
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Highlight Color
            </div>
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.label}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyHighlightColor(c.color)}
                className="w-full text-left flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
              >
                <div
                  className="h-3 w-3 rounded border border-slate-300 shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <span className="truncate">{c.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------
          11. CLEAR FORMATTING
          ------------------------------------------------------------------ */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execFormat("removeFormat")}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
        title="Clear Formatting"
      >
        <RemoveFormatting className="h-3.5 w-3.5" />
      </button>
    </div>,
    document.body
  );
}

export default TableFloatingFormatToolbar;
