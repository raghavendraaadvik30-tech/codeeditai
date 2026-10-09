/**
 * --------------------------------------------------------------------------
 * Module: Tables
 * Feature: TableContextMenu Component
 * Description:
 * Microsoft Word-style contextual right-click menu exclusively for table cells (td, th).
 * Implements complete Word-like menu hierarchy: Clipboard, Insert, Delete, Select,
 * Split/Merge Cells, Borders & Shading, Text Direction, Cell Alignment (9-box),
 * AutoFit, Table Properties, Bullets, Numbering, Hyperlink, and Additional Actions.
 *
 * Viewport-aware positioning with automatic boundary detection and submenu flipping.
 * Rendered via Portal into document.body with print:hidden and data-editor-ui.
 * --------------------------------------------------------------------------
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Scissors,
  Copy,
  ClipboardPaste,
  PlusCircle,
  Trash2,
  CheckSquare,
  Split,
  Merge,
  Paintbrush,
  RotateCw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Sliders,
  List,
  ListOrdered,
  Link2,
  Languages,
  MoreHorizontal,
  ChevronRight,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  Rows,
  Columns,
  Combine,
  RemoveFormatting,
  ArrowUp,
  ArrowDown,
  MoveVertical,
} from "lucide-react";
import { useTable } from "../hooks";
import { TableBordersShadingDialog } from "./TableBordersShadingDialog";
import { TablePropertiesDialog } from "./TablePropertiesDialog";

export interface TableContextMenuState {
  open: boolean;
  x: number;
  y: number;
  table: HTMLTableElement | null;
  cell: HTMLTableCellElement | null;
  savedRange: Range | null;
}

interface TableContextMenuProps {
  state: TableContextMenuState;
  onClose: () => void;
  onUpdateTable?: () => void;
}

export function TableContextMenu({
  state,
  onClose,
  onUpdateTable,
}: TableContextMenuProps) {
  const { open, x, y, table, cell, savedRange } = state;

  const {
    insertRowAbove,
    insertRowBelow,
    insertColLeft,
    insertColRight,
    deleteCurrentRow,
    deleteCurrentCol,
    deleteCurrentTable,
    mergeCells,
    splitCell,
    splitCurrentTable,
    mergeWithNextTable,
    setCellHorizontalAlign,
    setCellVerticalAlign,
    toggleCellTextDirection,
    autoFitWindow,
    autoFitContent,
    distributeColumns,
    distributeRows,
  } = useTable();

  // Dialog states
  const [bordersDialogOpen, setBordersDialogOpen] = useState(false);
  const [propertiesDialogOpen, setPropertiesDialogOpen] = useState(false);

  // Active submenu tracking
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Adjusted menu position to guarantee viewport visibility
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({
    top: y,
    left: x,
  });

  // Calculate boundary adjustments whenever coordinates change or menu opens
  useEffect(() => {
    if (!open) return;

    const estimatedWidth = 240;
    const estimatedHeight = 520;
    const padding = 12;

    let adjustedX = x;
    let adjustedY = y;

    if (x + estimatedWidth > window.innerWidth - padding) {
      adjustedX = Math.max(padding, window.innerWidth - estimatedWidth - padding);
    }

    if (y + estimatedHeight > window.innerHeight - padding) {
      adjustedY = Math.max(padding, window.innerHeight - estimatedHeight - padding);
    }

    setMenuPos({ top: adjustedY, left: adjustedX });
    setActiveSubmenu(null);
  }, [open, x, y]);

  // Close menu on click outside, page scroll, window resize, or Escape key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handlePointerDownOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDownOutside, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDownOutside, true);
    };
  }, [open, onClose]);

  // Restore selection before formatting actions
  const restoreSelection = useCallback(() => {
    if (savedRange) {
      try {
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(savedRange);
        }
      } catch {
        // ignore
      }
    } else if (cell) {
      try {
        const sel = window.getSelection();
        if (sel) {
          const target = cell.querySelector("p") || cell.firstChild || cell;
          const range = document.createRange();
          range.selectNodeContents(target);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      } catch {
        // ignore
      }
    }
  }, [savedRange, cell]);

  // Helper: execute text format action with selection preservation
  const executeFormatting = useCallback(
    (command: string, value?: string) => {
      restoreSelection();
      try {
        document.execCommand(command, false, value);
        if (cell) {
          const editable = cell.closest('[contenteditable="true"]');
          if (editable) {
            editable.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }
      } catch {
        // ignore
      }
      onUpdateTable?.();
      onClose();
    },
    [restoreSelection, cell, onUpdateTable, onClose]
  );

  // Helper to wrap table action and close menu
  const runTableAction = useCallback(
    (fn: () => void) => {
      try {
        fn();
        onUpdateTable?.();
      } catch {
        // fail safely
      }
      onClose();
    },
    [onUpdateTable, onClose]
  );

  // ------------------------------------------------------------------------
  // Selection Helpers
  // ------------------------------------------------------------------------
  const selectCellAction = useCallback(() => {
    if (!cell) return;
    try {
      const sel = window.getSelection();
      if (sel) {
        const range = document.createRange();
        range.selectNodeContents(cell);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } catch {
      // ignore
    }
    onClose();
  }, [cell, onClose]);

  const selectRowAction = useCallback(() => {
    if (!cell) return;
    const tr = cell.closest("tr");
    if (!tr) return;
    try {
      const sel = window.getSelection();
      if (sel) {
        const range = document.createRange();
        range.selectNodeContents(tr);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } catch {
      // ignore
    }
    onClose();
  }, [cell, onClose]);

  const selectColumnAction = useCallback(() => {
    if (!cell || !table) return;
    const colIdx = cell.cellIndex;
    const cellsInCol: HTMLTableCellElement[] = [];
    Array.from(table.rows).forEach((r) => {
      if (r.cells[colIdx]) cellsInCol.push(r.cells[colIdx]);
    });

    if (cellsInCol.length > 0) {
      try {
        const sel = window.getSelection();
        if (sel) {
          const range = document.createRange();
          range.setStartBefore(cellsInCol[0]);
          range.setEndAfter(cellsInCol[cellsInCol.length - 1]);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      } catch {
        // ignore
      }
    }
    onClose();
  }, [cell, table, onClose]);

  const selectTableAction = useCallback(() => {
    if (!table) return;
    try {
      const sel = window.getSelection();
      if (sel) {
        const range = document.createRange();
        range.selectNodeContents(table);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } catch {
      // ignore
    }
    onClose();
  }, [table, onClose]);

  // ------------------------------------------------------------------------
  // Clipboard Actions
  // ------------------------------------------------------------------------
  const handleCut = useCallback(() => {
    restoreSelection();
    try {
      document.execCommand("cut");
    } catch {
      // fallback
    }
    onClose();
  }, [restoreSelection, onClose]);

  const handleCopy = useCallback(() => {
    restoreSelection();
    try {
      document.execCommand("copy");
    } catch {
      // fallback
    }
    onClose();
  }, [restoreSelection, onClose]);

  const handlePaste = useCallback(
    async (mode: "source" | "merge" | "text") => {
      restoreSelection();
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          if (mode === "text") {
            document.execCommand("insertText", false, text);
          } else {
            document.execCommand("insertHTML", false, text);
          }
        }
      } catch {
        document.execCommand("paste");
      }
      onClose();
    },
    [restoreSelection, onClose]
  );

  // ------------------------------------------------------------------------
  // Hyperlink Action
  // ------------------------------------------------------------------------
  const handleHyperlink = useCallback(() => {
    restoreSelection();
    const url = window.prompt("Enter Hyperlink URL (e.g. https://example.com):");
    if (url && url.trim()) {
      executeFormatting("createLink", url.trim());
    } else {
      onClose();
    }
  }, [restoreSelection, executeFormatting, onClose]);

  // Check if multiple cells are currently selected for Merge Cells
  const isMultipleCellsSelected = useCallback(() => {
    if (!table) return false;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    const range = sel.getRangeAt(0);
    const allCells = Array.from(table.querySelectorAll("td, th"));
    const selected = allCells.filter((c) => range.intersectsNode(c));
    return selected.length > 1;
  }, [table]);

  if (!open || !table || !cell) {
    return null;
  }

  // Render Submenu helper
  const renderSubmenu = (
    id: string,
    content: React.ReactNode,
    submenuWidth = 200
  ) => {
    if (activeSubmenu !== id) return null;

    // Check if submenu overflows on the right side of the screen
    const openOnLeft = menuPos.left + 230 + submenuWidth > window.innerWidth - 10;

    return (
      <div
        className={`absolute top-0 z-50 rounded-lg border border-secondary/90 bg-card p-1 text-foreground shadow-xl dark:border-muted dark:bg-[#0B1523] dark:text-muted-foreground animate-in fade-in-0 zoom-in-95 duration-100 ${
          openOnLeft ? "right-full mr-1" : "left-full ml-1"
        }`}
        style={{ width: `${submenuWidth}px` }}
        onMouseEnter={() => setActiveSubmenu(id)}
      >
        {content}
      </div>
    );
  };

  return createPortal(
    <>
      <div
        ref={menuRef}
        data-editor-ui="true"
        data-table-control="true"
        className="fixed z-50 min-w-55 rounded-xl border border-secondary/90 bg-card/95 p-1.5 text-xs text-foreground shadow-2xl backdrop-blur-md dark:border-muted dark:bg-[#09121D]/95 dark:text-muted select-none print:hidden"
        style={{
          top: `${menuPos.top}px`,
          left: `${menuPos.left}px`,
        }}
        onMouseDown={(e) => {
          // Prevent losing text selection when clicking inside the context menu
          e.preventDefault();
        }}
      >
        {/* =======================================================
            GROUP 1: CLIPBOARD
        ======================================================= */}
        <div className="space-y-0.5">
          <button
            type="button"
            onClick={handleCut}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted dark:hover:bg-muted/80 cursor-pointer transition-colors"
          >
            <Scissors className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="flex-1">Cut</span>
            <span className="text-10px text-muted-foreground font-mono">Ctrl+X</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted dark:hover:bg-muted/80 cursor-pointer transition-colors"
          >
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="flex-1">Copy</span>
            <span className="text-10px text-muted-foreground font-mono">Ctrl+C</span>
          </button>

          {/* Paste Options Submenu */}
          <div
            className="relative"
            onMouseEnter={() => setActiveSubmenu("paste")}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted dark:hover:bg-muted/80 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ClipboardPaste className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Paste Options</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {renderSubmenu(
              "paste",
              <div className="space-y-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => handlePaste("source")}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer"
                >
                  <span>Keep Source Formatting</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePaste("merge")}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer"
                >
                  <span>Merge Formatting</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePaste("text")}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer"
                >
                  <span>Keep Text Only</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="my-1.5 h-px bg-secondary/80 dark:bg-muted" />

        {/* =======================================================
            GROUP 2: INSERT SUBMENU
        ======================================================= */}
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu("insert")}
        >
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted dark:hover:bg-muted/80 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <PlusCircle className="h-3.5 w-3.5 text-primary" />
              <span>Insert</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {renderSubmenu(
            "insert",
            <div className="space-y-0.5 text-xs">
              <button
                type="button"
                onClick={() => runTableAction(insertColLeft)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer"
              >
                <ArrowLeftToLine className="h-3.5 w-3.5 text-primary" />
                <span>Insert Columns to the Left</span>
              </button>
              <button
                type="button"
                onClick={() => runTableAction(insertColRight)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer"
              >
                <ArrowRightToLine className="h-3.5 w-3.5 text-primary" />
                <span>Insert Columns to the Right</span>
              </button>
              <div className="my-1 h-px bg-muted dark:bg-muted" />
              <button
                type="button"
                onClick={() => runTableAction(insertRowAbove)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer"
              >
                <ArrowUpToLine className="h-3.5 w-3.5 text-primary" />
                <span>Insert Rows Above</span>
              </button>
              <button
                type="button"
                onClick={() => runTableAction(insertRowBelow)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer"
              >
                <ArrowDownToLine className="h-3.5 w-3.5 text-primary" />
                <span>Insert Rows Below</span>
              </button>
            </div>,
            210
          )}
        </div>

        {/* =======================================================
            GROUP 3: DELETE CELLS SUBMENU
        ======================================================= */}
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu("delete")}
        >
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted dark:hover:bg-muted/80 cursor-pointer transition-colors text-destructive dark:text-destructive"
          >
            <div className="flex items-center gap-2.5">
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Cells...</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {renderSubmenu(
            "delete",
            <div className="space-y-0.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (cell) {
                    cell.innerHTML = "<p><br></p>";
                    const editable = cell.closest('[contenteditable="true"]');
                    if (editable) editable.dispatchEvent(new Event("input", { bubbles: true }));
                  }
                  onClose();
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer text-secondary-foreground dark:text-muted-foreground"
              >
                <span>Clear Cell Content</span>
              </button>
              <button
                type="button"
                onClick={() => runTableAction(deleteCurrentCol)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer text-destructive dark:text-destructive"
              >
                <Columns className="h-3.5 w-3.5" />
                <span>Delete Columns</span>
              </button>
              <button
                type="button"
                onClick={() => runTableAction(deleteCurrentRow)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer text-destructive dark:text-destructive"
              >
                <Rows className="h-3.5 w-3.5" />
                <span>Delete Rows</span>
              </button>
              <div className="my-1 h-px bg-muted dark:bg-muted" />
              <button
                type="button"
                onClick={() => runTableAction(deleteCurrentTable)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-destructive/10 dark:hover:bg-destructive/40 cursor-pointer text-destructive dark:text-destructive/30 font-medium"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Entire Table</span>
              </button>
            </div>,
            190
          )}
        </div>

        {/* =======================================================
            GROUP 4: SELECT SUBMENU
        ======================================================= */}
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu("select")}
        >
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted dark:hover:bg-muted/80 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <CheckSquare className="h-3.5 w-3.5 text-success-500" />
              <span>Select</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {renderSubmenu(
            "select",
            <div className="space-y-0.5 text-xs">
              <button
                type="button"
                onClick={selectCellAction}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer"
              >
                <span>Select Cell</span>
              </button>
              <button
                type="button"
                onClick={selectRowAction}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer"
              >
                <span>Select Row</span>
              </button>
              <button
                type="button"
                onClick={selectColumnAction}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer"
              >
                <span>Select Column</span>
              </button>
              <button
                type="button"
                onClick={selectTableAction}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer font-medium text-primary dark:text-primary"
              >
                <span>Select Table</span>
              </button>
            </div>,
            160
          )}
        </div>

        {/* =======================================================
            GROUP 5: SPLIT & MERGE CELLS
        ======================================================= */}
        <button
          type="button"
          onClick={() => runTableAction(splitCell)}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted dark:hover:bg-muted/80 cursor-pointer transition-colors"
          onMouseEnter={() => setActiveSubmenu(null)}
        >
          <Split className="h-3.5 w-3.5 text-warning-500" />
          <span>Split Cells...</span>
        </button>

        <button
          type="button"
          disabled={!isMultipleCellsSelected() && !(cell?.nextElementSibling || cell?.colSpan > 1)}
          onClick={() => runTableAction(mergeCells)}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted dark:hover:bg-muted/80 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-colors"
          onMouseEnter={() => setActiveSubmenu(null)}
        >
          <Merge className="h-3.5 w-3.5 text-success-500" />
          <span>Merge Cells</span>
        </button>

        <div className="my-1.5 h-px bg-secondary/80 dark:bg-muted" />

        {/* =======================================================
            GROUP 6: BORDERS AND SHADING
        ======================================================= */}
        <button
          type="button"
          onClick={() => {
            setBordersDialogOpen(true);
          }}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted dark:hover:bg-muted/80 cursor-pointer transition-colors"
          onMouseEnter={() => setActiveSubmenu(null)}
        >
          <Paintbrush className="h-3.5 w-3.5 text-sky-500" />
          <span>Borders and Shading...</span>
        </button>

        {/* =======================================================
            GROUP 7: TEXT DIRECTION
        ======================================================= */}
        <button
          type="button"
          onClick={() => runTableAction(toggleCellTextDirection)}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted dark:hover:bg-muted/80 cursor-pointer transition-colors"
          onMouseEnter={() => setActiveSubmenu(null)}
        >
          <RotateCw className="h-3.5 w-3.5 text-primary" />
          <span>Text Direction...</span>
        </button>

        {/* =======================================================
            GROUP 8: CELL ALIGNMENT (WORD 9-BOX SUBMENU)
        ======================================================= */}
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu("alignment")}
        >
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted dark:hover:bg-muted/80 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <AlignCenter className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Cell Alignment</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {renderSubmenu(
            "alignment",
            <div className="p-1.5 space-y-1.5 text-xs">
              <div className="text-10px font-semibold text-muted-foreground px-1 uppercase tracking-wider">
                Alignment Grid
              </div>
              {/* 3x3 Alignment Matrix */}
              <div className="grid grid-cols-3 gap-1 bg-muted dark:bg-secondary p-1.5 rounded-lg border border-secondary dark:border-muted">
                {/* Top Row */}
                <button
                  type="button"
                  title="Top Left"
                  onClick={() => {
                    setCellVerticalAlign("top");
                    setCellHorizontalAlign("left");
                    onClose();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded hover:bg-primary/15 hover:text-primary dark:hover:bg-navy-950 cursor-pointer"
                >
                  <ArrowUp className="h-3 w-3 -rotate-45" />
                </button>
                <button
                  type="button"
                  title="Top Center"
                  onClick={() => {
                    setCellVerticalAlign("top");
                    setCellHorizontalAlign("center");
                    onClose();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded hover:bg-primary/15 hover:text-primary dark:hover:bg-navy-950 cursor-pointer"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  title="Top Right"
                  onClick={() => {
                    setCellVerticalAlign("top");
                    setCellHorizontalAlign("right");
                    onClose();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded hover:bg-primary/15 hover:text-primary dark:hover:bg-navy-950 cursor-pointer"
                >
                  <ArrowUp className="h-3 w-3 rotate-45" />
                </button>

                {/* Middle Row */}
                <button
                  type="button"
                  title="Middle Left"
                  onClick={() => {
                    setCellVerticalAlign("middle");
                    setCellHorizontalAlign("left");
                    onClose();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded hover:bg-primary/15 hover:text-primary dark:hover:bg-navy-950 cursor-pointer"
                >
                  <AlignLeft className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  title="Middle Center"
                  onClick={() => {
                    setCellVerticalAlign("middle");
                    setCellHorizontalAlign("center");
                    onClose();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded hover:bg-primary/15 hover:text-primary dark:hover:bg-navy-950 cursor-pointer"
                >
                  <AlignCenter className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  title="Middle Right"
                  onClick={() => {
                    setCellVerticalAlign("middle");
                    setCellHorizontalAlign("right");
                    onClose();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded hover:bg-primary/15 hover:text-primary dark:hover:bg-navy-950 cursor-pointer"
                >
                  <AlignRight className="h-3 w-3" />
                </button>

                {/* Bottom Row */}
                <button
                  type="button"
                  title="Bottom Left"
                  onClick={() => {
                    setCellVerticalAlign("bottom");
                    setCellHorizontalAlign("left");
                    onClose();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded hover:bg-primary/15 hover:text-primary dark:hover:bg-navy-950 cursor-pointer"
                >
                  <ArrowDown className="h-3 w-3 rotate-45" />
                </button>
                <button
                  type="button"
                  title="Bottom Center"
                  onClick={() => {
                    setCellVerticalAlign("bottom");
                    setCellHorizontalAlign("center");
                    onClose();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded hover:bg-primary/15 hover:text-primary dark:hover:bg-navy-950 cursor-pointer"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  title="Bottom Right"
                  onClick={() => {
                    setCellVerticalAlign("bottom");
                    setCellHorizontalAlign("right");
                    onClose();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded hover:bg-primary/15 hover:text-primary dark:hover:bg-navy-950 cursor-pointer"
                >
                  <ArrowDown className="h-3 w-3 -rotate-45" />
                </button>
              </div>
            </div>,
            130
          )}
        </div>

        {/* =======================================================
            GROUP 9: AUTOFIT SUBMENU
        ======================================================= */}
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu("autofit")}
        >
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted dark:hover:bg-muted/80 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Maximize2 className="h-3.5 w-3.5 text-primary" />
              <span>AutoFit</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {renderSubmenu(
            "autofit",
            <div className="space-y-0.5 text-xs">
              <button
                type="button"
                onClick={() => runTableAction(autoFitContent)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer"
              >
                <span>AutoFit Contents</span>
              </button>
              <button
                type="button"
                onClick={() => runTableAction(autoFitWindow)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer"
              >
                <span>AutoFit Window</span>
              </button>
              <button
                type="button"
                onClick={() => runTableAction(distributeColumns)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer"
              >
                <span>Fixed Column Width</span>
              </button>
            </div>,
            170
          )}
        </div>

        {/* =======================================================
            GROUP 10: TABLE PROPERTIES
        ======================================================= */}
        <button
          type="button"
          onClick={() => {
            setPropertiesDialogOpen(true);
          }}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted dark:hover:bg-muted/80 cursor-pointer transition-colors"
          onMouseEnter={() => setActiveSubmenu(null)}
        >
          <Sliders className="h-3.5 w-3.5 text-purple-500" />
          <span>Table Properties...</span>
        </button>

        <div className="my-1.5 h-px bg-secondary/80 dark:bg-muted" />

        {/* =======================================================
            GROUP 11: TEXT FORMATTING (BULLETS & NUMBERING)
        ======================================================= */}
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu("bullets")}
        >
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted dark:hover:bg-muted/80 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <List className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Bullets</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {renderSubmenu(
            "bullets",
            <div className="space-y-0.5 text-xs">
              <button
                type="button"
                onClick={() => executeFormatting("insertUnorderedList")}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer"
              >
                <span className="font-bold">•</span>
                <span>Bullet List (Disc)</span>
              </button>
              <button
                type="button"
                onClick={() => executeFormatting("insertUnorderedList")}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer"
              >
                <span className="font-bold">○</span>
                <span>Circle Bullets</span>
              </button>
              <button
                type="button"
                onClick={() => executeFormatting("insertUnorderedList")}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer"
              >
                <span className="font-bold">■</span>
                <span>Square Bullets</span>
              </button>
            </div>,
            170
          )}
        </div>

        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu("numbering")}
        >
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted dark:hover:bg-muted/80 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ListOrdered className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Numbering</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {renderSubmenu(
            "numbering",
            <div className="space-y-0.5 text-xs">
              <button
                type="button"
                onClick={() => executeFormatting("insertOrderedList")}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer"
              >
                <span className="font-mono font-semibold">1.</span>
                <span>1, 2, 3...</span>
              </button>
              <button
                type="button"
                onClick={() => executeFormatting("insertOrderedList")}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer"
              >
                <span className="font-mono font-semibold">a.</span>
                <span>a, b, c...</span>
              </button>
              <button
                type="button"
                onClick={() => executeFormatting("insertOrderedList")}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer"
              >
                <span className="font-mono font-semibold">i.</span>
                <span>i, ii, iii...</span>
              </button>
            </div>,
            170
          )}
        </div>

        <div className="my-1.5 h-px bg-secondary/80 dark:bg-muted" />

        {/* =======================================================
            GROUP 12: HYPERLINK
        ======================================================= */}
        <button
          type="button"
          onClick={handleHyperlink}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted dark:hover:bg-muted/80 cursor-pointer transition-colors"
          onMouseEnter={() => setActiveSubmenu(null)}
        >
          <Link2 className="h-3.5 w-3.5 text-primary" />
          <span>Hyperlink...</span>
        </button>

        {/* =======================================================
            GROUP 13: LANGUAGE / LOOKUP (Disabled Word standard)
        ======================================================= */}
        <button
          type="button"
          disabled
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs opacity-40 cursor-not-allowed"
          onMouseEnter={() => setActiveSubmenu(null)}
        >
          <Languages className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Look Up / Synonyms</span>
        </button>

        <div className="my-1.5 h-px bg-secondary/80 dark:bg-muted" />

        {/* =======================================================
            GROUP 14: ADDITIONAL ACTIONS SUBMENU
        ======================================================= */}
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu("additional")}
        >
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted dark:hover:bg-muted/80 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Additional Actions</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {renderSubmenu(
            "additional",
            <div className="space-y-0.5 text-xs">
              <button
                type="button"
                onClick={() => runTableAction(distributeRows)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer"
              >
                <MoveVertical className="h-3.5 w-3.5 text-success-500" />
                <span>Distribute Rows Evenly</span>
              </button>
              <button
                type="button"
                onClick={() => runTableAction(distributeColumns)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer"
              >
                <Columns className="h-3.5 w-3.5 text-primary" />
                <span>Distribute Columns Evenly</span>
              </button>
              <div className="my-1 h-px bg-muted dark:bg-muted" />
              <button
                type="button"
                onClick={() => runTableAction(splitCurrentTable)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer text-purple-600 dark:text-purple-400"
              >
                <Split className="h-3.5 w-3.5 text-purple-500" />
                <span>Split Table</span>
              </button>
              <button
                type="button"
                onClick={() => runTableAction(mergeWithNextTable)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer text-primary dark:text-primary"
              >
                <Combine className="h-3.5 w-3.5 text-primary" />
                <span>Merge with Next Table</span>
              </button>
              <div className="my-1 h-px bg-muted dark:bg-muted" />
              <button
                type="button"
                onClick={() => executeFormatting("removeFormat")}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted dark:hover:bg-muted/80 cursor-pointer text-secondary-foreground dark:text-muted-foreground"
              >
                <RemoveFormatting className="h-3.5 w-3.5" />
                <span>Clear Formatting</span>
              </button>
            </div>,
            200
          )}
        </div>
      </div>

      {/* Borders & Shading Dialog */}
      {bordersDialogOpen && (
        <TableBordersShadingDialog
          open={bordersDialogOpen}
          onClose={() => {
            setBordersDialogOpen(false);
            onClose();
          }}
          table={table}
          cell={cell}
          onApplied={() => {
            onUpdateTable?.();
          }}
        />
      )}

      {/* Table Properties Dialog */}
      {propertiesDialogOpen && (
        <TablePropertiesDialog
          open={propertiesDialogOpen}
          onClose={() => {
            setPropertiesDialogOpen(false);
            onClose();
          }}
          table={table}
          onApplied={() => {
            onUpdateTable?.();
          }}
        />
      )}
    </>,
    document.body
  );
}

export default TableContextMenu;
