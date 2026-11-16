
import { useCallback, useEffect, useRef, useState } from "react";

import { Undo2, Redo2, ChevronDown } from "lucide-react";

import { FONT_SIZES, FONTS } from "../constant";
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
    restoreEditorSelection,
  } = useEditor();

  const [fontName, setFontName] = useState("Calibri");
  const [fontSize, setFontSize] = useState("11");

  const [fonts, setFonts] = useState<string[]>(FONTS);
  const [fontsLoading, setFontsLoading] = useState(false);

  const isEditingFontRef = useRef(false);
  const isEditingSizeRef = useRef(false);

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

  // ---------------------------------------------------------------------------
  // Helper: Extract font size in points from element or its ancestors up to page
  // ---------------------------------------------------------------------------
  const getElementFontSizePt = useCallback((el: HTMLElement, pageEl: HTMLElement): string => {
    let curr: HTMLElement | null = el;
    while (curr && curr !== pageEl.parentElement) {
      if (curr.style?.fontSize) {
        const ptMatch = curr.style.fontSize.match(/(\d+(?:\.\d+)?)\s*pt/i);
        if (ptMatch) return ptMatch[1];
        const pxVal = parseFloat(curr.style.fontSize);
        if (!isNaN(pxVal) && pxVal > 0) {
          const pt = Math.round(pxVal * 0.75 * 2) / 2;
          return String(pt);
        }
      }
      curr = curr.parentElement;
    }
    try {
      const computed = window.getComputedStyle(el).fontSize;
      const pxVal = parseFloat(computed);
      if (!isNaN(pxVal) && pxVal > 0) {
        const pt = Math.round(pxVal * 0.75 * 2) / 2;
        return String(pt);
      }
    } catch {
      // ignore
    }
    return "11";
  }, []);

  // ---------------------------------------------------------------------------
  // Helper: Extract font family name from element or its ancestors up to page
  // ---------------------------------------------------------------------------
  const getElementFontFamily = useCallback((el: HTMLElement, pageEl: HTMLElement, fontsList: string[]): string => {
    let curr: HTMLElement | null = el;
    while (curr && curr !== pageEl.parentElement) {
      if (curr.style?.fontFamily) {
        const raw = curr.style.fontFamily;
        const first = raw.split(",")[0].replace(/['"]/g, "").trim();
        if (first && first !== "inherit") {
          const matched = fontsList.find((f) => f.toLowerCase() === first.toLowerCase());
          return matched || first;
        }
      }
      curr = curr.parentElement;
    }
    try {
      const raw = window.getComputedStyle(el).fontFamily;
      const first = raw.split(",")[0].replace(/['"]/g, "").trim();
      if (first && first !== "inherit") {
        const matched = fontsList.find((f) => f.toLowerCase() === first.toLowerCase());
        return matched || first;
      }
    } catch {
      // ignore
    }
    return "Calibri";
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

        const pageEl = targetEl.closest<HTMLElement>(
          '[contenteditable="true"][data-page-id], [contenteditable="true"][data-editor-page], [contenteditable="true"][data-hf-type]'
        );

        if (!pageEl) return;

        if (range.collapsed) {
          // Cursor placed inside text or empty line
          let cursorEl: HTMLElement | null = null;
          if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
            const el = range.startContainer as HTMLElement;
            const child = el.childNodes[range.startOffset];
            if (child && child.nodeType === Node.ELEMENT_NODE) {
              cursorEl = child as HTMLElement;
            } else if (child && child.nodeType === Node.TEXT_NODE) {
              cursorEl = child.parentElement;
            } else {
              cursorEl = el;
            }
          } else {
            cursorEl = range.startContainer.parentElement;
          }
          cursorEl = cursorEl || targetEl;

          if (!isEditingSizeRef.current) {
            setFontSize(getElementFontSizePt(cursorEl, pageEl));
          }

          if (!isEditingFontRef.current) {
            setFontName(getElementFontFamily(cursorEl, pageEl, fonts));
          }
        } else {
          // User selected text range (word, sentence, or multiple paragraphs)
          const textNodes: Text[] = [];
          const root = anc.nodeType === Node.TEXT_NODE ? (anc.parentElement || anc) : anc;

          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
              if (!node.textContent || node.textContent.length === 0) {
                return NodeFilter.FILTER_REJECT;
              }
              try {
                if (range.intersectsNode(node)) {
                  return NodeFilter.FILTER_ACCEPT;
                }
              } catch {
                return NodeFilter.FILTER_REJECT;
              }
              return NodeFilter.FILTER_REJECT;
            },
          });

          let currentNode = walker.nextNode();
          while (currentNode) {
            const tn = currentNode as Text;
            let isIncluded = true;
            if (tn === range.startContainer && tn === range.endContainer) {
              isIncluded = range.endOffset > range.startOffset;
            } else if (tn === range.startContainer) {
              isIncluded = range.startOffset < (tn.textContent?.length || 0);
            } else if (tn === range.endContainer) {
              isIncluded = range.endOffset > 0;
            }
            if (isIncluded && tn.textContent && tn.textContent.trim().length > 0) {
              textNodes.push(tn);
            }
            currentNode = walker.nextNode();
          }

          if (textNodes.length === 0) {
            if (!isEditingSizeRef.current) {
              setFontSize(getElementFontSizePt(targetEl, pageEl));
            }
            if (!isEditingFontRef.current) {
              setFontName(getElementFontFamily(targetEl, pageEl, fonts));
            }
          } else {
            const detectedFonts = new Set<string>();
            const detectedSizes = new Set<string>();

            for (const tn of textNodes) {
              const parent = tn.parentElement;
              if (parent) {
                detectedFonts.add(getElementFontFamily(parent, pageEl, fonts));
                detectedSizes.add(getElementFontSizePt(parent, pageEl));
              }
            }

            if (!isEditingFontRef.current) {
              if (detectedFonts.size === 1) {
                setFontName(Array.from(detectedFonts)[0]);
              } else if (detectedFonts.size > 1) {
                // Selection has mixed font families: display blank/placeholder state
                setFontName("");
              }
            }

            if (!isEditingSizeRef.current) {
              if (detectedSizes.size === 1) {
                setFontSize(Array.from(detectedSizes)[0]);
              } else if (detectedSizes.size > 1) {
                // Selection has mixed font sizes: display blank/placeholder state
                setFontSize("");
              }
            }
          }
        }
      } catch {
        // Ignore selection changes outside the editor.
      }
    };

    document.addEventListener("selectionchange", updateToolbar);
    document.addEventListener("mouseup", updateToolbar);
    document.addEventListener("keyup", updateToolbar);

    return () => {
      document.removeEventListener("selectionchange", updateToolbar);
      document.removeEventListener("mouseup", updateToolbar);
      document.removeEventListener("keyup", updateToolbar);
    };
  }, [fonts, getElementFontFamily, getElementFontSizePt]);

  const validateFontSize = useCallback((val: string): boolean => {
    if (!val || !val.trim()) return false;
    const clean = val.replace(/pt$/i, "").trim();
    const num = Number(clean);
    return !isNaN(num) && isFinite(num) && num > 0 && num <= 500;
  }, []);

  const validateFontFamily = useCallback((val: string): boolean => {
    if (!val || !val.trim()) return false;
    const trimmed = val.trim();
    return trimmed.length > 0 && trimmed.length <= 100 && !/[<>{}\\]/.test(trimmed);
  }, []);

  const handleFontFamilyCommit = useCallback(
    (font: string) => {
      const trimmed = font.trim();
      if (!trimmed) return;
      setFontName(trimmed);
      loadGoogleFont(trimmed);
      applyFontFamily(trimmed);
      setFonts((prev) =>
        prev.some((f) => f.toLowerCase() === trimmed.toLowerCase())
          ? prev
          : [trimmed, ...prev]
      );
      restoreEditorSelection();
    },
    [applyFontFamily, restoreEditorSelection]
  );

  const handleFontSizeCommit = useCallback(
    (sizeVal: string) => {
      const clean = sizeVal.replace(/pt$/i, "").trim();
      if (!validateFontSize(clean)) return;
      setFontSize(clean);
      applyFontSize(clean);
      restoreEditorSelection();
    },
    [applyFontSize, restoreEditorSelection, validateFontSize]
  );

  const preventFocusLoss = (
    e: React.MouseEvent<HTMLElement>
  ) => {
    e.preventDefault();
  };

  return (
    <div className="flex items-center gap-2 select-none text-secondary-foreground dark:text-muted-foreground">
      {/* Font Family - Editable Combobox */}
      <RibbonSelect
        editable
        width={190}
        label={fontsLoading ? "Loading fonts..." : fontName}
        placeholder="Font family"
        title="Font Family (Type or select)"
        ariaLabel="Font Family"
        filterOptions
        validate={validateFontFamily}
        onFocusChange={(focused) => {
          isEditingFontRef.current = focused;
        }}
        onCommit={handleFontFamilyCommit}
        onCancel={() => {
          restoreEditorSelection();
        }}
        options={fonts.map((font) => ({
          label: font,
          style: { fontFamily: font },
          onSelect: () => {
            handleFontFamilyCommit(font);
          },
        }))}
        disabled={fontsLoading}
      />

      {/* Font Size - Editable Combobox */}
      <RibbonSelect
        editable
        width={68}
        label={fontSize}
        placeholder="Size"
        title="Font Size (Type or select)"
        ariaLabel="Font Size"
        inputMode="decimal"
        filterOptions={false}
        validate={validateFontSize}
        onFocusChange={(focused) => {
          isEditingSizeRef.current = focused;
        }}
        onCommit={handleFontSizeCommit}
        onCancel={() => {
          restoreEditorSelection();
        }}
        options={FONT_SIZES.map((size) => ({
          label: size.label,
          onSelect: () => {
            handleFontSizeCommit(size.label);
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
          className={`flex h-7 w-7 items-center justify-center rounded-l-md transition-colors hover:bg-primary/70 dark:hover:bg-muted ${!canUndo
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
          className={`flex h-7 w-4 items-center justify-center rounded-r-md border-l border-secondary transition-colors hover:bg-primary/70 dark:border-secondary-foreground dark:hover:bg-muted ${!canUndo
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
                      className={`cursor-pointer px-3 py-1 text-xs transition-colors ${isHighlighted
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
          className={`flex h-7 w-7 items-center justify-center rounded-l-md transition-colors hover:bg-primary/70 dark:hover:bg-muted ${!canRedo
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
          className={`flex h-7 w-4 items-center justify-center rounded-r-md border-l border-secondary transition-colors hover:bg-primary/70 dark:border-secondary-foreground dark:hover:bg-muted ${!canRedo
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
                      className={`cursor-pointer px-3 py-1 text-xs transition-colors ${isHighlighted
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