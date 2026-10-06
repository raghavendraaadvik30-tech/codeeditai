/*
Purpose:
Provides font, font-size, Undo, and Redo controls in the editor Home ribbon.

Responsibilities:
- Changes font and font size without losing selection.
- Tracks selected text formatting.
- Handles Undo/Redo.
- Prevents editor focus loss across all toolbar interactions.
*/

import { useEffect, useRef, useState, type MouseEvent } from "react";

import {
  Undo2,
  Redo2,
  ChevronDown,
} from "lucide-react";

import { FONT_SIZES } from "../constant";

import RibbonSelect from "../controls/RibbonSelect";
import RibbonDivider from "../controls/RibbonDivider";

import { useEditor } from "../../../context/EditorContext";

import { fetchAllGoogleFonts } from "../../../modules/document/api/fontapi";
export default function HomeTab() {
  const {
    undo,
    redo,
    undoMultiple,
    redoMultiple,
    getUndoActions,
    getRedoActions,
    canUndo,
    canRedo,
    applyFontSize,
    applyFontFamily,
  } = useEditor();

  const [fontName, setFontName] =
  useState("Calibri");

const [fontSize, setFontSize] =
  useState("12");

const [fonts, setFonts] = useState<string[]>([
  "Calibri",
]);

const [fontsLoading, setFontsLoading] =
  useState(false);

const [_fontsError, setFontsError] =
  useState<string | null>(null);

  const [isUndoDropdownOpen, setIsUndoDropdownOpen] = useState(false);
  const [isRedoDropdownOpen, setIsRedoDropdownOpen] = useState(false);
  const [undoHoverIndex, setUndoHoverIndex] = useState<number | null>(null);
  const [redoHoverIndex, setRedoHoverIndex] = useState<number | null>(null);

  const undoDropdownRef = useRef<HTMLDivElement | null>(null);
  const redoDropdownRef = useRef<HTMLDivElement | null>(null);

  const undoActions = isUndoDropdownOpen ? getUndoActions() : [];
  const redoActions = isRedoDropdownOpen ? getRedoActions() : [];

  const preventFocusLoss = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
  };

  useEffect(() => {
  let cancelled = false;

  const loadFonts = async () => {
    try {
      setFontsLoading(true);
      setFontsError(null);

      const googleFonts =
        await fetchAllGoogleFonts();

      if (cancelled) return;

      const fontNames = googleFonts.map(
        (font) => font.family
      );

      /*
       * Keep Calibri because it is commonly used
       * by the editor even though it is not a
       * Google Font.
       */
      const allFonts = Array.from(
        new Set([
          "Calibri",
          ...fontNames,
        ])
      );

      setFonts(allFonts);
    } catch (error) {
      console.error(
        "Failed to load Google Fonts:",
        error
      );

      if (!cancelled) {
        setFontsError(
          "Unable to load fonts"
        );

        setFonts(["Calibri"]);
      }
    } finally {
      if (!cancelled) {
        setFontsLoading(false);
      }
    }
  };

  loadFonts();

  return () => {
    cancelled = true;
  };
}, []);

  useEffect(() => {
    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (
        undoDropdownRef.current &&
        !undoDropdownRef.current.contains(e.target as Node)
      ) {
        setIsUndoDropdownOpen(false);
        setUndoHoverIndex(null);
      }
      if (
        redoDropdownRef.current &&
        !redoDropdownRef.current.contains(e.target as Node)
      ) {
        setIsRedoDropdownOpen(false);
        setRedoHoverIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =====================================================
     Read current selection formatting and update controls
  ====================================================== */
  useEffect(() => {
    const updateToolbar = () => {
      try {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);

        const anc = range.commonAncestorContainer;
        const targetEl = anc.nodeType === Node.ELEMENT_NODE ? (anc as HTMLElement) : anc.parentElement;
        if (!targetEl) return;

        const pageEl = targetEl.closest('[contenteditable="true"][data-page-id]');
        if (!pageEl) return;

        // 1. Font Size: check inline style first, then computed
        const sizeSpan = targetEl.closest<HTMLElement>("span[style*='font-size']");
        if (sizeSpan && sizeSpan.style.fontSize) {
          const ptMatch = sizeSpan.style.fontSize.match(/(\d+(?:\.\d+)?)\s*pt/i);
          if (ptMatch) {
            setFontSize(ptMatch[1]);
          } else {
            const pxVal = parseFloat(sizeSpan.style.fontSize);
            if (!isNaN(pxVal)) {
              setFontSize(String(Math.round(pxVal * 0.75)));
            }
          }
        } else {
          const computed = window.getComputedStyle(targetEl).fontSize;
          const pxVal = parseFloat(computed);
          if (!isNaN(pxVal)) {
            setFontSize(String(Math.round(pxVal * 0.75)));
          }
        }

        // 2. Font Family
        const fontSpan = targetEl.closest<HTMLElement>("span[style*='font-family']");
        const rawFont = fontSpan?.style.fontFamily || window.getComputedStyle(targetEl).fontFamily;
        const firstFont = rawFont.split(",")[0].replace(/['"]/g, "").trim();
        const matchedFont = fonts.find((f) => f.toLowerCase() === firstFont.toLowerCase());
        if (matchedFont) {
          setFontName(matchedFont);
        }
      } catch {
        // ignore
      }
    };

    document.addEventListener("selectionchange", updateToolbar);
    return () => {
      document.removeEventListener("selectionchange", updateToolbar);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 select-none">
      {/* =====================================================
          Font Family
      ====================================================== */}
      <RibbonSelect
  width={190}
  label={fontsLoading ? "Loading fonts..." : fontName}
  options={fonts.map((font) => ({
    label: font,
    onSelect: () => {
      setFontName(font);
      applyFontFamily(font);
    },
  }))}
  disabled={fontsLoading}
/>

      {/* =====================================================
          Font Size
      ====================================================== */}
      <RibbonSelect
        width={70}
        label={fontSize}
        options={FONT_SIZES.map((size) => ({
          label: size.label,
          onSelect: () => {
            setFontSize(size.label);
            applyFontSize(size.label);
          },
        }))}
      />

      <RibbonDivider />

      {/* =====================================================
          Undo / Redo with MS Word-Style Action History Dropdown
      ====================================================== */}
      <div className="relative inline-flex items-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 shadow-2xs">
        <button
          type="button"
          onMouseDown={preventFocusLoss}
          onClick={() => undo()}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={`flex h-7 w-7 items-center justify-center rounded-l-md hover:bg-blue-50/70 dark:hover:bg-slate-800 transition-colors ${
            !canUndo ? "opacity-35 cursor-not-allowed" : "text-slate-700 dark:text-slate-200 cursor-pointer"
          }`}
        >
          <Undo2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onMouseDown={preventFocusLoss}
          onClick={(e) => {
            e.stopPropagation();
            if (canUndo) {
              setIsUndoDropdownOpen((prev) => !prev);
              setIsRedoDropdownOpen(false);
              setUndoHoverIndex(null);
            }
          }}
          disabled={!canUndo}
          title="Undo History"
          className={`flex h-7 w-4 items-center justify-center rounded-r-md hover:bg-blue-50/70 dark:hover:bg-slate-800 border-l border-slate-200 dark:border-slate-700 transition-colors ${
            !canUndo ? "opacity-35 cursor-not-allowed" : "text-slate-600 dark:text-slate-300 cursor-pointer"
          }`}
        >
          <ChevronDown className="h-2.5 w-2.5" />
        </button>

        {isUndoDropdownOpen && (
          <div
            ref={undoDropdownRef}
            onMouseDown={preventFocusLoss}
            className="absolute left-0 top-full z-50 mt-1 min-w-[170px] w-48 border border-slate-400/90 bg-white shadow-xl dark:border-slate-600 dark:bg-[#111D29] overflow-hidden select-none animate-in fade-in zoom-in-95 duration-100"
          >
            <div
              className="max-h-56 overflow-y-auto py-0.5"
              onMouseLeave={() => setUndoHoverIndex(null)}
            >
              {undoActions.length > 0 ? (
                undoActions.map((action, i) => {
                  const isHighlighted = undoHoverIndex !== null && i <= undoHoverIndex;
                  return (
                    <div
                      key={i}
                      onMouseEnter={() => setUndoHoverIndex(i)}
                      onClick={() => {
                        undoMultiple(i + 1);
                        setIsUndoDropdownOpen(false);
                        setUndoHoverIndex(null);
                      }}
                      className={`px-3 py-1 text-xs cursor-pointer transition-colors ${
                        isHighlighted
                          ? "bg-[#0078d4] text-white font-medium"
                          : "text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {action}
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-xs text-slate-400 text-center italic">
                  No actions
                </div>
              )}
            </div>

            <div className="border-t border-slate-300 dark:border-slate-700">
              <button
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={() => {
                  const count = undoHoverIndex !== null ? undoHoverIndex + 1 : 1;
                  undoMultiple(count);
                  setIsUndoDropdownOpen(false);
                  setUndoHoverIndex(null);
                }}
                className="w-full border-b border-slate-300 bg-[#ececec] py-1.5 text-center text-xs font-medium text-slate-800 hover:bg-[#e0e0e0] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Undo {undoHoverIndex !== null ? undoHoverIndex + 1 : 1} Action
                {(undoHoverIndex !== null ? undoHoverIndex + 1 : 1) > 1 ? "s" : ""}
              </button>

              <button
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={() => {
                  setIsUndoDropdownOpen(false);
                  setUndoHoverIndex(null);
                }}
                className="w-full bg-[#ececec] py-1.5 text-center text-xs font-medium text-slate-800 hover:bg-[#e0e0e0] dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative inline-flex items-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 shadow-2xs">
        <button
          type="button"
          onMouseDown={preventFocusLoss}
          onClick={() => redo()}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className={`flex h-7 w-7 items-center justify-center rounded-l-md hover:bg-blue-50/70 dark:hover:bg-slate-800 transition-colors ${
            !canRedo ? "opacity-35 cursor-not-allowed" : "text-slate-700 dark:text-slate-200 cursor-pointer"
          }`}
        >
          <Redo2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onMouseDown={preventFocusLoss}
          onClick={(e) => {
            e.stopPropagation();
            if (canRedo) {
              setIsRedoDropdownOpen((prev) => !prev);
              setIsUndoDropdownOpen(false);
              setRedoHoverIndex(null);
            }
          }}
          disabled={!canRedo}
          title="Redo History"
          className={`flex h-7 w-4 items-center justify-center rounded-r-md hover:bg-blue-50/70 dark:hover:bg-slate-800 border-l border-slate-200 dark:border-slate-700 transition-colors ${
            !canRedo ? "opacity-35 cursor-not-allowed" : "text-slate-600 dark:text-slate-300 cursor-pointer"
          }`}
        >
          <ChevronDown className="h-2.5 w-2.5" />
        </button>

        {isRedoDropdownOpen && (
          <div
            ref={redoDropdownRef}
            onMouseDown={preventFocusLoss}
            className="absolute left-0 top-full z-50 mt-1 min-w-[170px] w-48 border border-slate-400/90 bg-white shadow-xl dark:border-slate-600 dark:bg-[#111D29] overflow-hidden select-none animate-in fade-in zoom-in-95 duration-100"
          >
            <div
              className="max-h-56 overflow-y-auto py-0.5"
              onMouseLeave={() => setRedoHoverIndex(null)}
            >
              {redoActions.length > 0 ? (
                redoActions.map((action, i) => {
                  const isHighlighted = redoHoverIndex !== null && i <= redoHoverIndex;
                  return (
                    <div
                      key={i}
                      onMouseEnter={() => setRedoHoverIndex(i)}
                      onClick={() => {
                        redoMultiple(i + 1);
                        setIsRedoDropdownOpen(false);
                        setRedoHoverIndex(null);
                      }}
                      className={`px-3 py-1 text-xs cursor-pointer transition-colors ${
                        isHighlighted
                          ? "bg-[#0078d4] text-white font-medium"
                          : "text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {action}
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-xs text-slate-400 text-center italic">
                  No actions
                </div>
              )}
            </div>

            <div className="border-t border-slate-300 dark:border-slate-700">
              <button
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={() => {
                  const count = redoHoverIndex !== null ? redoHoverIndex + 1 : 1;
                  redoMultiple(count);
                  setIsRedoDropdownOpen(false);
                  setRedoHoverIndex(null);
                }}
                className="w-full border-b border-slate-300 bg-[#ececec] py-1.5 text-center text-xs font-medium text-slate-800 hover:bg-[#e0e0e0] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Redo {redoHoverIndex !== null ? redoHoverIndex + 1 : 1} Action
                {(redoHoverIndex !== null ? redoHoverIndex + 1 : 1) > 1 ? "s" : ""}
              </button>

              <button
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={() => {
                  setIsRedoDropdownOpen(false);
                  setRedoHoverIndex(null);
                }}
                className="w-full bg-[#ececec] py-1.5 text-center text-xs font-medium text-slate-800 hover:bg-[#e0e0e0] dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}