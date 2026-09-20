/*
Purpose:
Provides font, font-size, Undo, and Redo controls in the editor Home ribbon.

Responsibilities:

Changes font and font size.
Tracks selected text formatting.
Handles Undo/Redo.
Uses EditorContext for the editor reference.

Hardcoded? Partially — font options are defined in constant.ts.

Backend needed? ❌ No. These features work on the frontend.

Backend needed for: Saving, auto-save, document history, collaboration, and document synchronization.*/

import { useEffect, useRef, useState } from "react";

import {
  Undo2,
  Redo2,
  ChevronDown,
} from "lucide-react";
import {
  FONTS,
  FONT_SIZES,
} from "../constant";

import RibbonSelect from "../controls/RibbonSelect";
import RibbonDivider from "../controls/RibbonDivider";

import { useEditor } from "../../../context/EditorContext";

export default function HomeTab() {
  const {
    editorRef,
    undo,
    redo,
    undoMultiple,
    redoMultiple,
    getUndoActions,
    getRedoActions,
    canUndo,
    canRedo,
  } = useEditor();

  const [fontName, setFontName] =
    useState("Calibri");

  const [fontSize, setFontSize] =
    useState("12");

  const [isUndoDropdownOpen, setIsUndoDropdownOpen] = useState(false);
  const [isRedoDropdownOpen, setIsRedoDropdownOpen] = useState(false);
  const [undoHoverIndex, setUndoHoverIndex] = useState<number | null>(null);
  const [redoHoverIndex, setRedoHoverIndex] = useState<number | null>(null);

  const undoDropdownRef = useRef<HTMLDivElement | null>(null);
  const redoDropdownRef = useRef<HTMLDivElement | null>(null);

  const undoActions = isUndoDropdownOpen ? getUndoActions() : [];
  const redoActions = isRedoDropdownOpen ? getRedoActions() : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
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
     Execute browser command
  ====================================================== */

  const exec = (
    command: string,
    value?: string 
  ) => {
    if (command === "undo") {
      undo();
      return;
    }
    if (command === "redo") {
      redo();
      return;
    }

    editorRef.current?.focus();

    document.execCommand(
      command,
      false,
      value
    );

    const el = editorRef.current;
    if (el) {
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  /* =====================================================
     Read current selection formatting
  ====================================================== */

  useEffect(() => {
    const updateToolbar = () => {
      const font =
        document.queryCommandValue("fontName");

      if (font) {
        setFontName(
          font.replace(/['"]/g, "")
        );
      }

      const size =
        document.queryCommandValue("fontSize");

      if (size) {
        const match =
          FONT_SIZES.find(
            (item) =>
              item.command === size
          );

        if (match) {
          setFontSize(match.label);
        }
      }
    };

    document.addEventListener(
      "selectionchange",
      updateToolbar
    );

    return () => {
      document.removeEventListener(
        "selectionchange",
        updateToolbar
      );
    };
  }, []);

  return (
    <div
      className="
        flex
        items-center
        gap-2

        text-slate-700

        dark:text-slate-200
      "
    >

      {/* =====================================================
          Font
      ====================================================== */}

      <RibbonSelect
        width={170}
        label={fontName}
        options={FONTS.map((font) => ({
          label: font,

          onSelect: () => {
            setFontName(font);

            exec(
              "fontName",
              font
            );
          },
        }))}
      />


      {/* =====================================================
          Font Size
      ====================================================== */}

      <RibbonSelect
        width={70}
        label={fontSize}
        options={FONT_SIZES.map(
          (size) => ({
            label: size.label,

            onSelect: () => {
              setFontSize(
                size.label
              );

              exec(
                "fontSize",
                size.command
              );
            },
          })
        )}
      />

      <RibbonDivider />

      {/* =====================================================
          Undo / Redo with MS Word-Style Action History Dropdown
      ====================================================== */}

      {/* Undo Split Button & Dropdown */}
      <div className="relative inline-flex items-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 shadow-2xs">
        <button
          type="button"
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

      {/* Redo Split Button & Dropdown */}
      <div className="relative inline-flex items-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 shadow-2xs">
        <button
          type="button"
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