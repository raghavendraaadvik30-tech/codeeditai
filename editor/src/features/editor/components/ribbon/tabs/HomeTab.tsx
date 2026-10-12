
import { useEffect, useRef, useState } from "react";

import { Undo2, Redo2, ChevronDown } from "lucide-react";

import { FONT_SIZES } from "../constant";
import RibbonSelect from "../controls/RibbonSelect";
import RibbonDivider from "../controls/RibbonDivider";

import { useEditor } from "../../../context/EditorContext";

import {
  fetchAllGoogleFonts,
  loadGoogleFont,
  STANDARD_SYSTEM_FONTS,
} from "../../../modules/document/api/fontapi";

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

  const [fontName, setFontName] = useState("Inter (Modern Clean)");
  const [fontSize, setFontSize] = useState("10 pt");

  const [fonts, setFonts] = useState<string[]>([
    "Inter (Modern Clean)",
    "Calibri",
    "Arial",
    "Times New Roman",
    "Roboto",
  ]);

  const [fontsLoading, setFontsLoading] = useState(false);

  const [isUndoDropdownOpen, setIsUndoDropdownOpen] = useState(false);
  const [isRedoDropdownOpen, setIsRedoDropdownOpen] = useState(false);

  const [undoHoverIndex, setUndoHoverIndex] = useState<number | null>(null);
  const [redoHoverIndex, setRedoHoverIndex] = useState<number | null>(null);

  const undoDropdownRef = useRef<HTMLDivElement | null>(null);
  const redoDropdownRef = useRef<HTMLDivElement | null>(null);

  const undoActions = isUndoDropdownOpen ? getUndoActions() : [];
  const redoActions = isRedoDropdownOpen ? getRedoActions() : [];

  useEffect(() => {
    let cancelled = false;

    const loadFonts = async () => {
      try {
        setFontsLoading(true);

        const googleFonts = await fetchAllGoogleFonts();

        if (cancelled) return;

        const fontNames = googleFonts.map((font) => font.family);

        const allFonts = Array.from(
          new Set([...STANDARD_SYSTEM_FONTS, ...fontNames])
        );

        setFonts(allFonts);
      } catch (error) {
        console.warn("Failed to load Google Fonts catalog:", error);

        if (!cancelled) {
          setFonts(STANDARD_SYSTEM_FONTS);
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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const updateToolbar = () => {
      try {
        const sel = window.getSelection();

        if (!sel || sel.rangeCount === 0) return;

        const range = sel.getRangeAt(0);
        const anc = range.commonAncestorContainer;

        const targetEl =
          anc.nodeType === Node.ELEMENT_NODE
            ? (anc as HTMLElement)
            : anc.parentElement;

        if (!targetEl) return;

        const pageEl = targetEl.closest(
          '[contenteditable="true"][data-page-id]'
        );

        if (!pageEl) return;

        // Update font size from the selected text.
        const sizeSpan =
          targetEl.closest<HTMLElement>("span[style*='font-size']");

        if (sizeSpan?.style.fontSize) {
          const ptMatch = sizeSpan.style.fontSize.match(
            /(\d+(?:\.\d+)?)\s*pt/i
          );

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

        // Update font family from the selected text.
        const fontSpan =
          targetEl.closest<HTMLElement>("span[style*='font-family']");

        const rawFont =
          fontSpan?.style.fontFamily ||
          window.getComputedStyle(targetEl).fontFamily;

        const firstFont = rawFont.split(",")[0].replace(/['"]/g, "").trim();

        const matchedFont = fonts.find(
          (font) => font.toLowerCase() === firstFont.toLowerCase()
        );

        if (matchedFont) {
          setFontName(matchedFont);
          loadGoogleFont(matchedFont);
        }
      } catch {
        // Ignore selection changes outside the editor.
      }
    };

    document.addEventListener("selectionchange", updateToolbar);

    return () => {
      document.removeEventListener("selectionchange", updateToolbar);
    };
  }, [fonts]);

  const preventFocusLoss = (
    e: React.MouseEvent<HTMLElement>
  ) => {
    e.preventDefault();
  };

  return (
    <div className="flex items-center gap-2 select-none text-secondary-foreground dark:text-muted-foreground">
      {/* Font Family */}
      <RibbonSelect
        width={190}
        label={fontsLoading ? "Loading fonts..." : fontName}
        options={fonts.map((font) => ({
          label: font,
          style: { fontFamily: font },
          onSelect: () => {
            setFontName(font);
            loadGoogleFont(font);
            applyFontFamily(font);
          },
        }))}
        disabled={fontsLoading}
      />

      {/* Font Size */}
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

      {/* Undo */}
      <div className="relative inline-flex items-center rounded-md border border-secondary bg-card shadow-2xs hover:bg-muted dark:border-secondary-foreground dark:bg-secondary dark:hover:bg-muted">
        <button
          type="button"
          onMouseDown={preventFocusLoss}
          onClick={() => undo()}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={`flex h - 7 w - 7 items - center justify - center rounded - l - md transition - colors hover: bg - primary / 70 dark: hover: bg - muted ${!canUndo
              ? "cursor-not-allowed opacity-35"
              : "cursor-pointer text-secondary-foreground dark:text-muted-foreground"
            } `}
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
          className={`flex h - 7 w - 4 items - center justify - center rounded - r - md border - l border - secondary transition - colors hover: bg - primary / 70 dark: border - secondary - foreground dark: hover: bg - muted ${!canUndo
              ? "cursor-not-allowed opacity-35"
              : "cursor-pointer text-secondary-foreground dark:text-muted-foreground"
            } `}
        >
          <ChevronDown className="h-2.5 w-2.5" />
        </button>

        {isUndoDropdownOpen && (
          <div
            ref={undoDropdownRef}
            onMouseDown={preventFocusLoss}
            className="absolute left-0 top-full z-50 mt-1 w-48 overflow-hidden border border-muted-foreground/90 bg-card shadow-xl dark:border-secondary-foreground dark:bg-[#111D29]"
          >
            <div
              className="max-h-56 overflow-y-auto py-0.5"
              onMouseLeave={() => setUndoHoverIndex(null)}
            >
              {undoActions.length > 0 ? (
                undoActions.map((action, i) => {
                  const isHighlighted =
                    undoHoverIndex !== null && i <= undoHoverIndex;

                  return (
                    <div
                      key={i}
                      onMouseEnter={() => setUndoHoverIndex(i)}
                      onClick={() => {
                        undoMultiple(i + 1);
                        setIsUndoDropdownOpen(false);
                        setUndoHoverIndex(null);
                      }}
                      className={`cursor - pointer px - 3 py - 1 text - xs transition - colors ${isHighlighted
                          ? "bg-brand font-medium text-primary-foreground"
                          : "text-foreground dark:text-muted"
                        } `}
                    >
                      {action}
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-center text-xs italic text-muted-foreground">
                  No actions
                </div>
              )}
            </div>

            <div className="border-t border-border dark:border-secondary-foreground">
              <button
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={() => {
                  const count =
                    undoHoverIndex !== null ? undoHoverIndex + 1 : 1;

                  undoMultiple(count);
                  setIsUndoDropdownOpen(false);
                  setUndoHoverIndex(null);
                }}
                className="w-full border-b border-border bg-secondary py-1.5 text-center text-xs font-medium text-foreground transition-colors hover:bg-secondary dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground dark:hover:bg-secondary-foreground"
              >
                Undo {undoHoverIndex !== null ? undoHoverIndex + 1 : 1} Action
                {(undoHoverIndex !== null ? undoHoverIndex + 1 : 1) > 1
                  ? "s"
                  : ""}
              </button>

              <button
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={() => {
                  setIsUndoDropdownOpen(false);
                  setUndoHoverIndex(null);
                }}
                className="w-full bg-secondary py-1.5 text-center text-xs font-medium text-foreground transition-colors hover:bg-secondary dark:bg-muted dark:text-muted-foreground dark:hover:bg-secondary-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Redo */}
      <div className="relative inline-flex items-center rounded-md border border-secondary bg-card shadow-2xs hover:bg-muted dark:border-secondary-foreground dark:bg-secondary dark:hover:bg-muted">
        <button
          type="button"
          onMouseDown={preventFocusLoss}
          onClick={() => redo()}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className={`flex h - 7 w - 7 items - center justify - center rounded - l - md transition - colors hover: bg - primary / 70 dark: hover: bg - muted ${!canRedo
              ? "cursor-not-allowed opacity-35"
              : "cursor-pointer text-secondary-foreground dark:text-muted-foreground"
            } `}
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
          className={`flex h - 7 w - 4 items - center justify - center rounded - r - md border - l border - secondary transition - colors hover: bg - primary / 70 dark: border - secondary - foreground dark: hover: bg - muted ${!canRedo
              ? "cursor-not-allowed opacity-35"
              : "cursor-pointer text-secondary-foreground dark:text-muted-foreground"
            } `}
        >
          <ChevronDown className="h-2.5 w-2.5" />
        </button>

        {isRedoDropdownOpen && (
          <div
            ref={redoDropdownRef}
            onMouseDown={preventFocusLoss}
            className="absolute left-0 top-full z-50 mt-1 w-48 overflow-hidden border border-muted-foreground/90 bg-card shadow-xl dark:border-secondary-foreground dark:bg-[#111D29]"
          >
            <div
              className="max-h-56 overflow-y-auto py-0.5"
              onMouseLeave={() => setRedoHoverIndex(null)}
            >
              {redoActions.length > 0 ? (
                redoActions.map((action, i) => {
                  const isHighlighted =
                    redoHoverIndex !== null && i <= redoHoverIndex;

                  return (
                    <div
                      key={i}
                      onMouseEnter={() => setRedoHoverIndex(i)}
                      onClick={() => {
                        redoMultiple(i + 1);
                        setIsRedoDropdownOpen(false);
                        setRedoHoverIndex(null);
                      }}
                      className={`cursor - pointer px - 3 py - 1 text - xs transition - colors ${isHighlighted
                          ? "bg-brand font-medium text-primary-foreground"
                          : "text-foreground dark:text-muted"
                        } `}
                    >
                      {action}
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-center text-xs italic text-muted-foreground">
                  No actions
                </div>
              )}
            </div>

            <div className="border-t border-border dark:border-secondary-foreground">
              <button
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={() => {
                  const count =
                    redoHoverIndex !== null ? redoHoverIndex + 1 : 1;

                  redoMultiple(count);
                  setIsRedoDropdownOpen(false);
                  setRedoHoverIndex(null);
                }}
                className="w-full border-b border-border bg-secondary py-1.5 text-center text-xs font-medium text-foreground transition-colors hover:bg-secondary dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground dark:hover:bg-secondary-foreground"
              >
                Redo {redoHoverIndex !== null ? redoHoverIndex + 1 : 1} Action
                {(redoHoverIndex !== null ? redoHoverIndex + 1 : 1) > 1
                  ? "s"
                  : ""}
              </button>

              <button
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={() => {
                  setIsRedoDropdownOpen(false);
                  setRedoHoverIndex(null);
                }}
                className="w-full bg-secondary py-1.5 text-center text-xs font-medium text-foreground transition-colors hover:bg-secondary dark:bg-muted dark:text-muted-foreground dark:hover:bg-secondary-foreground"
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