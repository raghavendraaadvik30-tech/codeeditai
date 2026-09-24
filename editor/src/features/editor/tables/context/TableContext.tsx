/**
 * --------------------------------------------------------
 * Module: Tables
 * Feature: Table Feature Context
 * Description:
 * React Context provider managing active table configuration,
 * interactive grid state, and table insertion/manipulation operations.
 * --------------------------------------------------------
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { TableConfig, TableTemplate } from "../types";
import { DEFAULT_TABLE_CONFIG } from "../constants";
import { generateTableHtml, generateTemplateTableHtml } from "../utils";
import { useEditor } from "@/features/editor/context/EditorContext";
import { useDocumentModel } from "@/features/editor/store/documentModel";

export interface ActiveCellFormat {
  verticalAlign: "top" | "middle" | "bottom";
  horizontalAlign: "left" | "center" | "right";
  isVerticalText: boolean;
}

export interface TableContextValue {
  config: TableConfig;
  setConfig: React.Dispatch<React.SetStateAction<TableConfig>>;
  updateConfig: (patch: Partial<TableConfig>) => void;
  insertTableWithConfig: (customConfig?: TableConfig) => void;
  insertTemplate: (template: TableTemplate) => void;
  insertQuickTable: (rows: number, cols: number) => void;
  insertCustomTableHTML: (html: string) => void;
  insertRowAbove: () => void;
  insertRowBelow: () => void;
  insertColLeft: () => void;
  insertColRight: () => void;
  deleteCurrentRow: () => void;
  deleteCurrentCol: () => void;
  deleteCurrentTable: () => void;
  mergeCells: () => void;
  splitCell: () => void;
  // Aliases for compatibility
  mergeSelectedCells: () => void;
  splitSelectedCell: () => void;
  splitCurrentTable: () => void;
  mergeWithNextTable: () => void;
  setCellHorizontalAlign: (align: "left" | "center" | "right") => void;
  setCellVerticalAlign: (align: "top" | "middle" | "bottom") => void;
  toggleCellTextDirection: () => void;
  activeCellFormat: ActiveCellFormat;
  autoFitWindow: () => void;
  autoFitContent: () => void;
  distributeColumns: () => void;
  distributeRows: () => void;
}

const TableContext = createContext<TableContextValue | null>(null);

function getNodeElement(node: Node | null): HTMLElement | null {
  if (!node) return null;
  return node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
}

function placeCaretInCell(cell: HTMLElement) {
  try {
    const sel = window.getSelection();
    if (!sel) return;
    const target = cell.querySelector("p") || cell.firstChild || cell;
    const range = document.createRange();
    range.selectNodeContents(target);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);

    const editable = cell.closest('[contenteditable="true"]') as HTMLElement | null;
    if (editable) {
      editable.focus();
    } else {
      cell.focus();
    }
  } catch {
    // ignore
  }
}

interface CellGridInfo {
  cell: HTMLTableCellElement;
  row: HTMLTableRowElement;
  rowIndex: number;
  colIndex: number;
  colSpan: number;
  rowSpan: number;
}

function getTableGridMap(table: HTMLTableElement) {
  const rows = Array.from(table.querySelectorAll("tr"));
  const grid: (HTMLTableCellElement | null)[][] = [];
  const cellInfos = new Map<HTMLTableCellElement, CellGridInfo>();
  let maxCols = 0;

  for (let r = 0; r < rows.length; r++) {
    if (!grid[r]) grid[r] = [];
    const tr = rows[r];
    const cells = Array.from(tr.children).filter(
      (c): c is HTMLTableCellElement => c.tagName.toLowerCase() === "td" || c.tagName.toLowerCase() === "th"
    );

    let col = 0;
    for (const cell of cells) {
      while (grid[r][col] !== undefined && grid[r][col] !== null) {
        col++;
      }

      const colSpan = Math.max(1, cell.colSpan || 1);
      const rowSpan = Math.max(1, cell.rowSpan || 1);

      cellInfos.set(cell, {
        cell,
        row: tr,
        rowIndex: r,
        colIndex: col,
        colSpan,
        rowSpan,
      });

      for (let dr = 0; dr < rowSpan; dr++) {
        const targetR = r + dr;
        if (!grid[targetR]) grid[targetR] = [];
        for (let dc = 0; dc < colSpan; dc++) {
          grid[targetR][col + dc] = cell;
        }
      }

      col += colSpan;
      if (col > maxCols) maxCols = col;
    }
  }

  return { grid, cellInfos, maxCols, rows };
}

export function TableProvider({
  children,
  initialConfig = DEFAULT_TABLE_CONFIG,
}: {
  children: ReactNode;
  initialConfig?: TableConfig;
}) {
  const { insertHTML, editorRef, zoom } = useEditor();
  const { setPageHtml, activePage, model } = useDocumentModel();
  const [config, setConfig] = useState<TableConfig>(initialConfig);

  const lastActiveCellRef = useRef<HTMLTableCellElement | null>(null);
  const lastActiveTableRef = useRef<HTMLTableElement | null>(null);

  const [activeCellFormat, setActiveCellFormat] = useState<ActiveCellFormat>({
    verticalAlign: "top",
    horizontalAlign: "left",
    isVerticalText: false,
  });

  const findActiveTarget = () => {
    // 0. Currently active table marked by overlay or selection
    const activeOverlayTable = document.querySelector<HTMLTableElement>('table[data-active-table="true"]');
    if (activeOverlayTable && activeOverlayTable.isConnected) {
      lastActiveTableRef.current = activeOverlayTable;
      const selCell = window.getSelection()?.anchorNode
        ? (getNodeElement(window.getSelection()!.anchorNode)?.closest("td, th") as HTMLTableCellElement | null)
        : null;
      const cell = (selCell && activeOverlayTable.contains(selCell))
        ? selCell
        : (lastActiveCellRef.current && activeOverlayTable.contains(lastActiveCellRef.current))
        ? lastActiveCellRef.current
        : (activeOverlayTable.querySelector("td, th") as HTMLTableCellElement | null);
      if (cell) lastActiveCellRef.current = cell;
      return {
        cell,
        tr: cell ? cell.closest("tr") : activeOverlayTable.querySelector("tr"),
        table: activeOverlayTable,
      };
    }

    // 1. Current selection
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);

      // 1a. anchorNode
      let el = getNodeElement(sel.anchorNode);
      let cell = el?.closest("td, th") as HTMLTableCellElement | null;

      // 1b. focusNode
      if (!cell && sel.focusNode) {
        el = getNodeElement(sel.focusNode);
        cell = el?.closest("td, th") as HTMLTableCellElement | null;
      }

      // 1c. commonAncestorContainer
      if (!cell && range.commonAncestorContainer) {
        el = getNodeElement(range.commonAncestorContainer);
        cell = el?.closest("td, th") as HTMLTableCellElement | null;
      }

      // 1d. startContainer / child at startOffset
      if (!cell && range.startContainer) {
        el = getNodeElement(range.startContainer);
        cell = el?.closest("td, th") as HTMLTableCellElement | null;
        if (!cell && range.startContainer.nodeType === Node.ELEMENT_NODE) {
          const containerElem = range.startContainer as Element;
          const childAtOffset = containerElem.children[range.startOffset] || containerElem.children[0];
          cell = childAtOffset?.closest("td, th") as HTMLTableCellElement | null;
        }
      }

      // 1e. Check table cells intersected by selection range
      if (!cell) {
        const activeContainer =
          editorRef.current || (document.querySelector('[contenteditable="true"]') as HTMLElement | null);
        if (activeContainer) {
          const allCells = Array.from(activeContainer.querySelectorAll("td, th")) as HTMLTableCellElement[];
          cell = allCells.find((c) => range.intersectsNode(c)) || null;
        }
      }

      if (cell && cell.isConnected) {
        lastActiveCellRef.current = cell;
        lastActiveTableRef.current = cell.closest("table");
        return {
          cell,
          tr: cell.closest("tr"),
          table: cell.closest("table"),
        };
      }
    }

    // 2. Active element
    if (document.activeElement) {
      const cell = document.activeElement.closest("td, th") as HTMLTableCellElement | null;
      if (cell && cell.isConnected) {
        lastActiveCellRef.current = cell;
        lastActiveTableRef.current = cell.closest("table");
        return {
          cell,
          tr: cell.closest("tr"),
          table: cell.closest("table"),
        };
      }
    }

    // 3. Tracked cell
    if (lastActiveCellRef.current && lastActiveCellRef.current.isConnected) {
      const cell = lastActiveCellRef.current;
      return {
        cell,
        tr: cell.closest("tr"),
        table: cell.closest("table"),
      };
    }

    // 4. Tracked table
    if (lastActiveTableRef.current && lastActiveTableRef.current.isConnected) {
      const table = lastActiveTableRef.current;
      const cell = table.querySelector("td, th") as HTMLTableCellElement | null;
      return {
        cell,
        tr: cell ? cell.closest("tr") : table.querySelector("tr"),
        table,
      };
    }

    // 5. Any table in active editor or page
    const editor = editorRef.current || document.querySelector('[contenteditable="true"]');
    if (editor) {
      const table = editor.querySelector("table");
      if (table) {
        const cell = table.querySelector("td, th") as HTMLTableCellElement | null;
        return {
          cell,
          tr: cell ? cell.closest("tr") : table.querySelector("tr"),
          table,
        };
      }
    }

    return { cell: null, tr: null, table: null };
  };

  // Helper to retrieve all target cells: either multi-selection, single cell, or table cells
  const getTargetCells = (): { cells: HTMLTableCellElement[]; table: HTMLTableElement | null } => {
    const { cell, table } = findActiveTarget();
    const targetTable = table || cell?.closest("table") || null;
    if (!targetTable && !cell) return { cells: [], table: null };

    // 1. Check if user selected multiple cells via mouse selection range
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && targetTable) {
      const range = sel.getRangeAt(0);
      const allCells = Array.from(targetTable.querySelectorAll("td, th")) as HTMLTableCellElement[];
      const intersecting = allCells.filter((c) => {
        try {
          return range.intersectsNode(c);
        } catch {
          return false;
        }
      });
      if (intersecting.length > 0) {
        return { cells: intersecting, table: targetTable };
      }
    }

    // 2. Focused / active single cell
    if (cell && cell.isConnected) {
      return { cells: [cell], table: targetTable };
    }

    // 3. Fallback: all cells in active table if table is selected
    if (targetTable) {
      return { cells: Array.from(targetTable.querySelectorAll("td, th")) as HTMLTableCellElement[], table: targetTable };
    }

    return { cells: [], table: null };
  };

  const updateCellFormatState = useCallback(() => {
    const target = findActiveTarget();
    const cell = target.cell;
    if (!cell || !cell.isConnected) return;

    // Detect vertical alignment
    let vAlign: "top" | "middle" | "bottom" = "top";
    const vStyle =
      cell.style.verticalAlign || cell.getAttribute("valign") || cell.getAttribute("data-vertical-align");
    if (vStyle === "middle" || vStyle === "center") {
      vAlign = "middle";
    } else if (vStyle === "bottom") {
      vAlign = "bottom";
    }

    // Detect horizontal alignment
    let hAlign: "left" | "center" | "right" = "left";
    const hStyle = cell.style.textAlign || cell.getAttribute("align");
    if (hStyle === "center") {
      hAlign = "center";
    } else if (hStyle === "right") {
      hAlign = "right";
    }

    // Detect text direction
    const isVert =
      cell.style.writingMode === "vertical-rl" ||
      cell.style.writingMode === "vertical-lr" ||
      cell.getAttribute("data-text-direction") === "vertical";

    setActiveCellFormat({
      verticalAlign: vAlign,
      horizontalAlign: hAlign,
      isVerticalText: isVert,
    });
  }, []);

  // Continuously track active table and cell across the document
  useEffect(() => {
    const updateActiveCell = (e?: Event) => {
      if (e && e.target) {
        const targetEl = getNodeElement(e.target as Node);
        const table = targetEl?.closest("table");
        if (table) {
          lastActiveTableRef.current = table;
          const cell = targetEl?.closest("td, th") as HTMLTableCellElement | null;
          if (cell) {
            lastActiveCellRef.current = cell;
          }
          return;
        }
      }

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const el = getNodeElement(selection.anchorNode);
        const cell = el?.closest("td, th") as HTMLTableCellElement | null;
        if (cell) {
          lastActiveCellRef.current = cell;
          lastActiveTableRef.current = cell.closest("table");
          return;
        }
        const table = el?.closest("table");
        if (table) {
          lastActiveTableRef.current = table;
          return;
        }
      }

      if (document.activeElement) {
        const cell = document.activeElement.closest("td, th") as HTMLTableCellElement | null;
        if (cell) {
          lastActiveCellRef.current = cell;
          lastActiveTableRef.current = cell.closest("table");
          return;
        }
        const table = document.activeElement.closest("table");
        if (table) {
          lastActiveTableRef.current = table;
        }
      }
    };

    const handleEvents = (e?: Event) => {
      updateActiveCell(e);
      updateCellFormatState();
    };

    // Initial inspection
    updateCellFormatState();

    document.addEventListener("selectionchange", handleEvents);
    document.addEventListener("pointerdown", handleEvents);
    document.addEventListener("keyup", handleEvents);
    document.addEventListener("focusin", handleEvents);
    window.addEventListener("table:updated", updateCellFormatState);

    return () => {
      document.removeEventListener("selectionchange", handleEvents);
      document.removeEventListener("pointerdown", handleEvents);
      document.removeEventListener("keyup", handleEvents);
      document.removeEventListener("focusin", handleEvents);
      window.removeEventListener("table:updated", updateCellFormatState);
    };
  }, [updateCellFormatState]);

  const notifyDomChange = (node?: Node | null) => {
    const editable =
      (node ? (getNodeElement(node)?.closest('[contenteditable="true"]') as HTMLElement | null) : null) ||
      (lastActiveTableRef.current?.closest('[contenteditable="true"]') as HTMLElement | null) ||
      editorRef.current ||
      (document.querySelector('[contenteditable="true"]') as HTMLElement | null);

    if (editable) {
      editable.dispatchEvent(new Event("input", { bubbles: true }));

      const pageSection = editable.closest("section[data-page-id]");
      const pageId = pageSection?.getAttribute("data-page-id");
      if (pageId && setPageHtml) {
        setPageHtml(pageId, editable.innerHTML);
      }
    }
  };

  const updateConfig = (patch: Partial<TableConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  };

  const executeInsertTable = (html: string) => {
    const pageId = activePage || model.pages[0]?.id;
    const pageSection = pageId ? document.querySelector(`section[data-page-id="${pageId}"]`) : null;
    const activeEditor =
      (pageSection?.querySelector('[contenteditable="true"]') as HTMLElement | null) ||
      editorRef.current ||
      (document.querySelector('[contenteditable="true"]') as HTMLElement | null);

    const marker = `data-new-tbl-${Date.now()}`;
    const markedHtml = html.includes("<table")
      ? html.replace("<table", `<table ${marker}="true"`)
      : html;

    const sel = window.getSelection();
    let hasRangeInActive = false;
    if (sel && sel.rangeCount > 0 && activeEditor) {
      const common = sel.getRangeAt(0).commonAncestorContainer;
      if (activeEditor.contains(common)) {
        hasRangeInActive = true;
      }
    }

    if (hasRangeInActive) {
      insertHTML?.(markedHtml);
    } else if (activeEditor) {
      activeEditor.focus();
      const lastP = activeEditor.lastElementChild;
      if (
        lastP &&
        (lastP.innerHTML === "<br>" ||
          lastP.innerHTML === "<br/>" ||
          lastP.textContent?.trim() === "")
      ) {
        lastP.insertAdjacentHTML("beforebegin", markedHtml);
      } else {
        activeEditor.insertAdjacentHTML("beforeend", markedHtml);
      }
      activeEditor.dispatchEvent(new Event("input", { bubbles: true }));
      const targetPageId = activeEditor.closest("section[data-page-id]")?.getAttribute("data-page-id");
      if (targetPageId && setPageHtml) {
        setPageHtml(targetPageId, activeEditor.innerHTML);
      }
    } else {
      insertHTML?.(markedHtml);
    }

    // Automatically place cursor in cell (0, 0) of newly inserted table and activate it
    setTimeout(() => {
      const targetEditor =
        activeEditor || editorRef.current || (document.querySelector('[contenteditable="true"]') as HTMLElement | null);
      let newTable: HTMLTableElement | null = null;
      if (targetEditor) {
        newTable = targetEditor.querySelector(`table[${marker}="true"]`) as HTMLTableElement | null;
      }
      if (!newTable) {
        newTable = document.querySelector(`table[${marker}="true"]`) as HTMLTableElement | null;
      }
      if (!newTable && targetEditor) {
        const allTables = targetEditor.querySelectorAll("table");
        newTable = allTables[allTables.length - 1] || null;
      }

      if (newTable) {
        newTable.removeAttribute(marker);
        lastActiveTableRef.current = newTable;
        const firstCell = newTable.querySelector("td, th") as HTMLTableCellElement | null;
        if (firstCell) {
          lastActiveCellRef.current = firstCell;
          placeCaretInCell(firstCell);
        }
        newTable.dispatchEvent(new Event("selectionchange", { bubbles: true }));
        newTable.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        notifyDomChange(newTable);
      }
    }, 50);
  };

  const insertTableWithConfig = (customConfig?: TableConfig) => {
    const active = customConfig || config;
    const html = generateTableHtml(active);
    executeInsertTable(html);
  };

  const insertTemplate = (template: TableTemplate) => {
    const html = generateTemplateTableHtml(template);
    executeInsertTable(html);
  };

  const insertQuickTable = (rows: number, cols: number) => {
    const quickConfig: TableConfig = {
      ...config,
      rows,
      cols,
    };
    const html = generateTableHtml(quickConfig);
    executeInsertTable(html);
  };

  const insertRowAbove = () => {
    const { tr, table, cell } = findActiveTarget();
    if (!table) return;

    const allRows = Array.from(table.querySelectorAll("tr"));
    const targetRow = tr || allRows[0];
    if (!targetRow || !targetRow.parentElement) return;

    const colCount = Math.max(
      targetRow.children.length,
      ...allRows.map((r) => r.children.length),
      1
    );

    const colWidth = (100 / colCount).toFixed(2);
    const newTr = document.createElement("tr");
    for (let i = 0; i < colCount; i++) {
      const td = document.createElement("td");
      td.style.border = "1px solid #cbd5e1";
      td.style.width = `${colWidth}%`;
      td.style.padding = "8px 12px";
      td.style.verticalAlign = "top";
      td.style.textAlign = "left";
      td.style.wordBreak = "break-word";
      td.style.overflowWrap = "anywhere";
      td.style.boxSizing = "border-box";
      td.innerHTML = "&nbsp;";
      newTr.appendChild(td);
    }

    targetRow.parentElement.insertBefore(newTr, targetRow);
    const targetCell = (newTr.children[cell?.cellIndex ?? 0] as HTMLTableCellElement) || (newTr.firstElementChild as HTMLTableCellElement);
    if (targetCell) {
      lastActiveCellRef.current = targetCell;
      lastActiveTableRef.current = table;
      placeCaretInCell(targetCell);
    }
    notifyDomChange(table);
  };

  const insertRowBelow = () => {
    const { tr, table, cell } = findActiveTarget();
    if (!table) return;

    const allRows = Array.from(table.querySelectorAll("tr"));
    const targetRow = tr || allRows[allRows.length - 1];
    if (!targetRow || !targetRow.parentElement) return;

    const colCount = Math.max(
      targetRow.children.length,
      ...allRows.map((r) => r.children.length),
      1
    );

    const colWidth = (100 / colCount).toFixed(2);
    const newTr = document.createElement("tr");
    for (let i = 0; i < colCount; i++) {
      const td = document.createElement("td");
      td.style.border = "1px solid #cbd5e1";
      td.style.width = `${colWidth}%`;
      td.style.padding = "8px 12px";
      td.style.verticalAlign = "top";
      td.style.textAlign = "left";
      td.style.wordBreak = "break-word";
      td.style.overflowWrap = "anywhere";
      td.style.boxSizing = "border-box";
      td.innerHTML = "&nbsp;";
      newTr.appendChild(td);
    }

    targetRow.parentElement.insertBefore(newTr, targetRow.nextSibling);
    const targetCell = (newTr.children[cell?.cellIndex ?? 0] as HTMLTableCellElement) || (newTr.firstElementChild as HTMLTableCellElement);
    if (targetCell) {
      lastActiveCellRef.current = targetCell;
      lastActiveTableRef.current = table;
      placeCaretInCell(targetCell);
    }
    notifyDomChange(table);
  };

  const insertColLeft = () => {
    const { cell, table } = findActiveTarget();
    if (!table) return;

    const rows = Array.from(table.querySelectorAll("tr"));
    if (rows.length === 0) return;

    const colIndex = cell ? cell.cellIndex : 0;
    const maxCols = Math.max(...rows.map((r) => r.children.length), 1);
    const newColCount = maxCols + 1;
    const newColWidth = `${(100 / newColCount).toFixed(2)}%`;

    let targetFocusCell: HTMLTableCellElement | null = null;

    rows.forEach((row) => {
      const isHeader =
        row.parentElement?.tagName.toLowerCase() === "thead" ||
        !!row.querySelector("th");
      const newCell = document.createElement(isHeader ? "th" : "td") as HTMLTableCellElement;
      newCell.style.border = "1px solid #cbd5e1";
      newCell.style.padding = "8px 12px";
      newCell.style.verticalAlign = "top";
      newCell.style.textAlign = "left";
      newCell.style.wordBreak = "break-word";
      newCell.style.overflowWrap = "anywhere";
      newCell.style.whiteSpace = "normal";
      newCell.style.boxSizing = "border-box";
      newCell.innerHTML = "&nbsp;";
      if (isHeader) {
        newCell.style.backgroundColor = "#f1f5f9";
        newCell.style.fontWeight = "600";
      }

      if (row.children[colIndex]) {
        row.insertBefore(newCell, row.children[colIndex]);
      } else {
        row.appendChild(newCell);
      }

      Array.from(row.children).forEach((c) => {
        (c as HTMLElement).style.width = newColWidth;
      });

      if (cell && row === cell.closest("tr")) {
        targetFocusCell = newCell;
      }
    });

    if (!targetFocusCell && rows.length > 0) {
      targetFocusCell = rows[0].children[colIndex] as HTMLTableCellElement;
    }

    if (targetFocusCell) {
      lastActiveCellRef.current = targetFocusCell;
      lastActiveTableRef.current = table;
      placeCaretInCell(targetFocusCell);
    }
    notifyDomChange(table);
  };

  const insertColRight = () => {
    const { cell, table } = findActiveTarget();
    if (!table) return;

    const rows = Array.from(table.querySelectorAll("tr"));
    if (rows.length === 0) return;

    const colIndex = cell ? cell.cellIndex : (rows[0]?.children.length ?? 1) - 1;
    const maxCols = Math.max(...rows.map((r) => r.children.length), 1);
    const newColCount = maxCols + 1;
    const newColWidth = `${(100 / newColCount).toFixed(2)}%`;

    let targetFocusCell: HTMLTableCellElement | null = null;

    rows.forEach((row) => {
      const isHeader =
        row.parentElement?.tagName.toLowerCase() === "thead" ||
        !!row.querySelector("th");
      const newCell = document.createElement(isHeader ? "th" : "td") as HTMLTableCellElement;
      newCell.style.border = "1px solid #cbd5e1";
      newCell.style.padding = "8px 12px";
      newCell.style.verticalAlign = "top";
      newCell.style.textAlign = "left";
      newCell.style.wordBreak = "break-word";
      newCell.style.overflowWrap = "anywhere";
      newCell.style.whiteSpace = "normal";
      newCell.style.boxSizing = "border-box";
      newCell.innerHTML = "&nbsp;";
      if (isHeader) {
        newCell.style.backgroundColor = "#f1f5f9";
        newCell.style.fontWeight = "600";
      }

      const refChild = row.children[colIndex]?.nextSibling;
      if (refChild) {
        row.insertBefore(newCell, refChild);
      } else {
        row.appendChild(newCell);
      }

      Array.from(row.children).forEach((c) => {
        (c as HTMLElement).style.width = newColWidth;
      });

      if (cell && row === cell.closest("tr")) {
        targetFocusCell = newCell;
      }
    });

    if (!targetFocusCell && rows.length > 0) {
      targetFocusCell =
        (rows[0].children[colIndex + 1] as HTMLTableCellElement) ||
        (rows[0].lastElementChild as HTMLTableCellElement);
    }

    if (targetFocusCell) {
      lastActiveCellRef.current = targetFocusCell;
      lastActiveTableRef.current = table;
      placeCaretInCell(targetFocusCell);
    }
    notifyDomChange(table);
  };

  const deleteCurrentRow = () => {
    const { tr, table } = findActiveTarget();
    if (!table) return;

    const allRows = Array.from(table.querySelectorAll("tr"));
    const targetRow = tr || allRows[allRows.length - 1];
    if (!targetRow) return;

    const nextRow = targetRow.nextElementSibling || targetRow.previousElementSibling;
    targetRow.remove();

    if (table.querySelectorAll("tr").length === 0) {
      table.remove();
      lastActiveCellRef.current = null;
      lastActiveTableRef.current = null;
    } else if (nextRow) {
      const nextCell = nextRow.querySelector("td, th") as HTMLTableCellElement | null;
      if (nextCell) {
        lastActiveCellRef.current = nextCell;
        lastActiveTableRef.current = table;
        placeCaretInCell(nextCell);
      }
    }
    notifyDomChange(table);
  };

  const deleteCurrentCol = () => {
    const { cell, table } = findActiveTarget();
    if (!table) return;

    const colIndex = cell ? cell.cellIndex : 0;
    const rows = Array.from(table.querySelectorAll("tr"));

    rows.forEach((row) => {
      if (row.children[colIndex]) {
        row.children[colIndex].remove();
      }
    });

    const remainingCells = table.querySelectorAll("td, th");
    if (remainingCells.length === 0) {
      table.remove();
      lastActiveCellRef.current = null;
      lastActiveTableRef.current = null;
    } else {
      const remainingCols = Math.max(...rows.map((r) => r.children.length), 1);
      const colWidth = `${(100 / remainingCols).toFixed(2)}%`;
      rows.forEach((row) => {
        Array.from(row.children).forEach((c) => {
          (c as HTMLElement).style.width = colWidth;
        });
      });

      const firstCell = remainingCells[0] as HTMLTableCellElement;
      lastActiveCellRef.current = firstCell;
      lastActiveTableRef.current = table;
      placeCaretInCell(firstCell);
    }
    notifyDomChange(table);
  };

  const deleteCurrentTable = () => {
    const { table } = findActiveTarget();
    if (!table) return;

    const parentNode = table.parentNode;
    table.remove();
    lastActiveCellRef.current = null;
    lastActiveTableRef.current = null;
    notifyDomChange(parentNode);
  };

  const mergeCells = () => {
    const { cell, tr, table } = findActiveTarget();
    if (!table) return;

    // Check if user selected multiple cells via mouse selection
    const sel = window.getSelection();
    let selectedCells: HTMLTableCellElement[] = [];
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const allCells = Array.from(table.querySelectorAll("td, th")) as HTMLTableCellElement[];
      selectedCells = allCells.filter((c) => range.intersectsNode(c));
    }

    if (selectedCells.length > 1) {
      const firstCell = selectedCells[0];
      const rows = Array.from(new Set(selectedCells.map((c) => c.closest("tr")))).filter(Boolean) as HTMLTableRowElement[];

      const texts: string[] = [];
      selectedCells.forEach((c) => {
        const text = c.textContent?.trim();
        if (text && text !== "" && text !== "\u00a0") {
          texts.push(c.innerHTML.trim());
        }
      });
      firstCell.innerHTML = texts.length > 0 ? texts.join(" ") : "<p><br></p>";

      if (rows.length === 1) {
        // Horizontal merge within single row
        let totalColSpan = 0;
        let totalWidth = 0;
        selectedCells.forEach((c) => {
          totalColSpan += c.colSpan || 1;
          totalWidth += parseFloat(c.style.width) || 0;
        });
        firstCell.colSpan = totalColSpan;
        if (totalWidth > 0) {
          firstCell.style.width = `${totalWidth.toFixed(2)}%`;
        }
      } else {
        // Multi-row merge
        const firstRowCells = selectedCells.filter((c) => c.closest("tr") === rows[0]);
        let totalColSpan = 0;
        firstRowCells.forEach((c) => {
          totalColSpan += c.colSpan || 1;
        });
        firstCell.colSpan = totalColSpan;
        firstCell.rowSpan = rows.length;
      }

      for (let i = 1; i < selectedCells.length; i++) {
        selectedCells[i].remove();
      }

      lastActiveCellRef.current = firstCell;
      lastActiveTableRef.current = table;
      placeCaretInCell(firstCell);
      notifyDomChange(table);
      return;
    }

    // Fallback: merge active cell with next adjacent cell
    const targetCell = cell || (table.querySelector("td, th") as HTMLTableCellElement | null);
    const targetTr = tr || targetCell?.closest("tr");
    if (!targetCell || !targetTr) return;

    const nextCell = targetCell.nextElementSibling as HTMLTableCellElement | null;
    if (nextCell) {
      const curText = targetCell.textContent?.trim();
      const nxtText = nextCell.textContent?.trim();
      if (nxtText && nxtText !== "" && nxtText !== "\u00a0") {
        if (curText && curText !== "" && curText !== "\u00a0") {
          targetCell.innerHTML = `${targetCell.innerHTML.trim()} ${nextCell.innerHTML.trim()}`;
        } else {
          targetCell.innerHTML = nextCell.innerHTML;
        }
      }
      const w1 = parseFloat(targetCell.style.width) || 0;
      const w2 = parseFloat(nextCell.style.width) || 0;
      if (w1 > 0 || w2 > 0) {
        targetCell.style.width = `${(w1 + w2).toFixed(2)}%`;
      }
      targetCell.colSpan = (targetCell.colSpan || 1) + (nextCell.colSpan || 1);
      nextCell.remove();
      lastActiveCellRef.current = targetCell;
      lastActiveTableRef.current = table;
      placeCaretInCell(targetCell);
      notifyDomChange(table);
      return;
    }

    // If at end of row, merge vertically with cell below
    const nextRow = targetTr.nextElementSibling as HTMLTableRowElement | null;
    if (nextRow) {
      const colIndex = targetCell.cellIndex;
      const cellBelow = nextRow.children[colIndex] as HTMLTableCellElement | undefined;
      if (cellBelow) {
        const curText = targetCell.textContent?.trim();
        const blwText = cellBelow.textContent?.trim();
        if (blwText && blwText !== "" && blwText !== "\u00a0") {
          if (curText && curText !== "" && curText !== "\u00a0") {
            targetCell.innerHTML = `${targetCell.innerHTML.trim()} ${cellBelow.innerHTML.trim()}`;
          } else {
            targetCell.innerHTML = cellBelow.innerHTML;
          }
        }
        targetCell.rowSpan = (targetCell.rowSpan || 1) + (cellBelow.rowSpan || 1);
        cellBelow.remove();
        lastActiveCellRef.current = targetCell;
        lastActiveTableRef.current = table;
        placeCaretInCell(targetCell);
        notifyDomChange(table);
      }
    }
  };

  const splitCell = () => {
    const { cell, tr, table } = findActiveTarget();
    const targetCell = cell || (table?.querySelector("td, th") as HTMLTableCellElement | null);
    const targetTr = tr || targetCell?.closest("tr");
    const targetTable = table || targetCell?.closest("table");
    if (!targetCell || !targetTr || !targetTable) return;

    const { grid, cellInfos, maxCols, rows } = getTableGridMap(targetTable);
    const targetInfo = cellInfos.get(targetCell);
    const targetRowIndex = targetInfo ? targetInfo.rowIndex : rows.indexOf(targetTr);
    const targetColIndex = targetInfo ? targetInfo.colIndex : targetCell.cellIndex;

    const colSpan = targetCell.colSpan || 1;
    const rowSpan = targetCell.rowSpan || 1;
    const isHeader = targetCell.tagName.toLowerCase() === "th";

    // 1. If cell is merged horizontally (colspan > 1), split into individual cells
    if (colSpan > 1) {
      targetCell.colSpan = 1;
      const curWidth = parseFloat(targetCell.style.width);
      const splitPct = (!isNaN(curWidth) && curWidth > 0)
        ? (curWidth / colSpan).toFixed(2) + "%"
        : `${(100 / (maxCols || 1)).toFixed(2)}%`;
      targetCell.style.width = splitPct;

      let insertAfter: Node = targetCell;
      for (let i = 0; i < colSpan - 1; i++) {
        const newCell = document.createElement(isHeader ? "th" : "td") as HTMLTableCellElement;
        newCell.style.border = targetCell.style.border || "1px solid #cbd5e1";
        newCell.style.padding = targetCell.style.padding || "8px 12px";
        newCell.style.verticalAlign = targetCell.style.verticalAlign || "top";
        newCell.style.textAlign = targetCell.style.textAlign || "left";
        newCell.style.wordBreak = "break-word";
        newCell.style.overflowWrap = "anywhere";
        newCell.style.boxSizing = "border-box";
        newCell.style.width = splitPct;
        newCell.colSpan = 1;
        newCell.rowSpan = rowSpan;
        newCell.innerHTML = "<p><br></p>";
        if (isHeader) {
          newCell.style.backgroundColor = targetCell.style.backgroundColor || "#f1f5f9";
          newCell.style.fontWeight = targetCell.style.fontWeight || "600";
          newCell.style.color = targetCell.style.color || "#1e293b";
        }
        if (insertAfter.nextSibling) {
          targetTr.insertBefore(newCell, insertAfter.nextSibling);
        } else {
          targetTr.appendChild(newCell);
        }
        insertAfter = newCell;
      }
    } else if (rowSpan > 1) {
      // 2. If cell is merged vertically (rowspan > 1), restore into separate rows
      targetCell.rowSpan = 1;
      if (targetRowIndex !== -1) {
        for (let r = 1; r < rowSpan; r++) {
          const rowElem = rows[targetRowIndex + r];
          if (rowElem) {
            const newCell = document.createElement("td") as HTMLTableCellElement;
            newCell.style.border = targetCell.style.border || "1px solid #cbd5e1";
            newCell.style.padding = targetCell.style.padding || "8px 12px";
            newCell.style.verticalAlign = targetCell.style.verticalAlign || "top";
            newCell.style.textAlign = targetCell.style.textAlign || "left";
            newCell.style.wordBreak = "break-word";
            newCell.style.overflowWrap = "anywhere";
            newCell.style.boxSizing = "border-box";
            newCell.style.width = targetCell.style.width;
            newCell.colSpan = colSpan;
            newCell.rowSpan = 1;
            newCell.innerHTML = "<p><br></p>";

            const nextRowCells = Array.from(rowElem.children).filter(
              (c): c is HTMLTableCellElement => c.tagName.toLowerCase() === "td" || c.tagName.toLowerCase() === "th"
            );
            let inserted = false;
            for (const c of nextRowCells) {
              const cInfo = cellInfos.get(c);
              if (cInfo && cInfo.colIndex > targetColIndex) {
                rowElem.insertBefore(newCell, c);
                inserted = true;
                break;
              }
            }
            if (!inserted) {
              rowElem.appendChild(newCell);
            }
          }
        }
      }
    } else {
      // 3. Normal unmerged cell: Split this cell horizontally into two cells
      const curWidth = parseFloat(targetCell.style.width);
      const halfPct = (!isNaN(curWidth) && curWidth > 0)
        ? (curWidth / 2).toFixed(2) + "%"
        : `${(100 / ((maxCols || 1) + 1)).toFixed(2)}%`;

      targetCell.style.width = halfPct;

      const newCell = document.createElement(isHeader ? "th" : "td") as HTMLTableCellElement;
      newCell.style.border = targetCell.style.border || "1px solid #cbd5e1";
      newCell.style.padding = targetCell.style.padding || "8px 12px";
      newCell.style.verticalAlign = targetCell.style.verticalAlign || "top";
      newCell.style.textAlign = targetCell.style.textAlign || "left";
      newCell.style.wordBreak = "break-word";
      newCell.style.overflowWrap = "anywhere";
      newCell.style.boxSizing = "border-box";
      newCell.style.width = halfPct;
      newCell.colSpan = 1;
      newCell.rowSpan = 1;
      newCell.innerHTML = "<p><br></p>";
      if (isHeader) {
        newCell.style.backgroundColor = targetCell.style.backgroundColor || "#f1f5f9";
        newCell.style.fontWeight = targetCell.style.fontWeight || "600";
        newCell.style.color = targetCell.style.color || "#1e293b";
      }

      if (targetCell.nextSibling) {
        targetTr.insertBefore(newCell, targetCell.nextSibling);
      } else {
        targetTr.appendChild(newCell);
      }

      // Maintain a strictly rectangular table grid:
      // For all other rows, expand the cell spanning this column position so all rows remain aligned
      const updatedOtherCells = new Set<HTMLTableCellElement>();
      for (let r = 0; r < rows.length; r++) {
        if (r === targetRowIndex) continue;
        const otherCell = grid[r] ? grid[r][targetColIndex] : null;
        if (otherCell && !updatedOtherCells.has(otherCell)) {
          updatedOtherCells.add(otherCell);
          otherCell.colSpan = (otherCell.colSpan || 1) + 1;
        }
      }

      lastActiveCellRef.current = newCell;
      lastActiveTableRef.current = targetTable;
      placeCaretInCell(newCell);
      notifyDomChange(targetTable);
      return;
    }

    lastActiveCellRef.current = targetCell;
    lastActiveTableRef.current = targetTable;
    placeCaretInCell(targetCell);
    notifyDomChange(targetTable);
  };

  const splitCurrentTable = () => {
    const { tr, table } = findActiveTarget();
    const targetTable = table || (document.querySelector('[contenteditable="true"] table') as HTMLTableElement | null);
    if (!targetTable || !targetTable.parentNode) return;

    const allRows = Array.from(targetTable.querySelectorAll("tr"));
    if (allRows.length === 0) return;

    const activeRow = tr || allRows[Math.floor(allRows.length / 2)];
    let rowIndex = allRows.indexOf(activeRow);
    if (rowIndex <= 0) {
      if (allRows.length > 1) {
        rowIndex = 1;
      } else {
        // Single row table: duplicate row to split into two 1-row tables
        rowIndex = 1;
        const clonedRow = allRows[0].cloneNode(true) as HTMLTableRowElement;
        Array.from(clonedRow.querySelectorAll("td, th")).forEach((c) => {
          c.innerHTML = "&nbsp;";
        });
        targetTable.appendChild(clonedRow);
        allRows.push(clonedRow);
      }
    }

    const rowsToMove = allRows.slice(rowIndex);
    if (rowsToMove.length === 0) return;

    const newTable = targetTable.cloneNode(false) as HTMLTableElement;
    const newTbody = document.createElement("tbody");
    newTable.appendChild(newTbody);

    rowsToMove.forEach((row) => {
      newTbody.appendChild(row);
    });

    const spacer = document.createElement("p");
    spacer.innerHTML = "<br/>";

    // Continuation Title Caption (Word-style clinical table continuation)
    let origCaptionText = "Table 1: Table Title";
    const prevElem = targetTable.previousElementSibling;
    if (prevElem && (prevElem.classList.contains("doc-table-caption") || prevElem.getAttribute("data-caption") === "true")) {
      origCaptionText = prevElem.textContent?.trim() || origCaptionText;
    }
    const continueCaption = document.createElement("p");
    continueCaption.className = "doc-table-caption font-bold";
    continueCaption.setAttribute("data-caption", "true");
    continueCaption.style.cssText = "font-size: 11pt; font-weight: 700; margin: 12px 0 4px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif;";
    continueCaption.textContent = origCaptionText.includes("(Continued)")
      ? origCaptionText
      : `${origCaptionText} (Continued)`;

    const parentNode = targetTable.parentNode;
    if (targetTable.nextSibling) {
      parentNode.insertBefore(spacer, targetTable.nextSibling);
      parentNode.insertBefore(continueCaption, spacer.nextSibling);
      parentNode.insertBefore(newTable, continueCaption.nextSibling);
    } else {
      parentNode.appendChild(spacer);
      parentNode.appendChild(continueCaption);
      parentNode.appendChild(newTable);
    }

    const firstCell = newTable.querySelector("td, th") as HTMLTableCellElement | null;
    if (firstCell) {
      lastActiveCellRef.current = firstCell;
      lastActiveTableRef.current = newTable;
      placeCaretInCell(firstCell);
    }

    notifyDomChange(targetTable);
  };

  const mergeWithNextTable = () => {
    let { table } = findActiveTarget();
    const container =
      (table ? table.closest('[contenteditable="true"]') : null) ||
      editorRef.current ||
      (document.querySelector('[contenteditable="true"]') as HTMLElement | null) ||
      document.body;

    const allTables = Array.from(container.querySelectorAll("table")) as HTMLTableElement[];
    if (allTables.length < 2) {
      return;
    }

    let firstTable: HTMLTableElement;
    let secondTable: HTMLTableElement;

    if (table && allTables.includes(table)) {
      const idx = allTables.indexOf(table);
      if (idx < allTables.length - 1) {
        firstTable = table;
        secondTable = allTables[idx + 1];
      } else {
        // Active table is the last table, merge with previous table
        firstTable = allTables[idx - 1];
        secondTable = table;
      }
    } else {
      firstTable = allTables[0];
      secondTable = allTables[1];
    }

    // Remove any intervening nodes (empty paragraphs, spacing) between firstTable and secondTable
    let currNode: Element | null = firstTable.nextElementSibling;
    while (currNode && currNode !== secondTable) {
      const next: Element | null = currNode.nextElementSibling;
      currNode.remove();
      currNode = next;
    }

    // Move all rows from secondTable into firstTable
    const firstTbody = firstTable.querySelector("tbody") || firstTable;
    const secondRows = Array.from(secondTable.querySelectorAll("tr"));

    secondRows.forEach((row) => {
      firstTbody.appendChild(row);
    });

    secondTable.remove();

    // Focus and update
    const firstMergedCell = secondRows[0]?.querySelector("td, th") as HTMLTableCellElement | null;
    const focusCell = firstMergedCell || (firstTable.querySelector("td, th") as HTMLTableCellElement | null);
    if (focusCell) {
      lastActiveCellRef.current = focusCell;
      lastActiveTableRef.current = firstTable;
      placeCaretInCell(focusCell);
    }

    notifyDomChange(firstTable);
  };

  const setCellHorizontalAlign = (align: "left" | "center" | "right") => {
    const { cells, table } = getTargetCells();
    if (cells.length === 0) return;

    cells.forEach((cell) => {
      cell.style.textAlign = align;
      cell.setAttribute("align", align);
      const innerBlocks = cell.querySelectorAll<HTMLElement>("p, div, span, h1, h2, h3");
      innerBlocks.forEach((b) => {
        b.style.textAlign = align;
      });
    });

    updateCellFormatState();
    notifyDomChange(table || cells[0]);
    window.dispatchEvent(new CustomEvent("table:updated"));
  };

  const setCellVerticalAlign = (align: "top" | "middle" | "bottom") => {
    const { cells, table } = getTargetCells();
    if (cells.length === 0) return;

    cells.forEach((cell) => {
      cell.style.verticalAlign = align;
      cell.setAttribute("valign", align);
      cell.setAttribute("data-vertical-align", align);

      // Reset paragraph vertical margins inside the cell to allow accurate centering
      const innerBlocks = cell.querySelectorAll<HTMLElement>("p, div");
      innerBlocks.forEach((b) => {
        b.style.marginTop = "0px";
        b.style.marginBottom = "0px";
      });

      // Ensure the row has enough height so middle & bottom alignments are clearly visible
      const row = cell.closest("tr");
      if (row && (align === "middle" || align === "bottom")) {
        const currentHeight = parseFloat(row.style.height) || row.offsetHeight || 0;
        if (currentHeight < 44) {
          row.style.height = "44px";
          Array.from(row.cells).forEach((rc) => {
            rc.style.height = "44px";
          });
        }
      }
    });

    updateCellFormatState();
    notifyDomChange(table || cells[0]);
    window.dispatchEvent(new CustomEvent("table:updated"));
  };

  const toggleCellTextDirection = () => {
    const { cells, table } = getTargetCells();
    if (cells.length === 0) return;

    const primary = cells[0];
    const isCurrentlyVertical =
      primary.style.writingMode === "vertical-rl" ||
      primary.getAttribute("data-text-direction") === "vertical" ||
      primary.style.writingMode === "vertical-lr";

    const targetMode = isCurrentlyVertical ? "horizontal-tb" : "vertical-rl";

    cells.forEach((cell) => {
      cell.style.writingMode = targetMode;
      const innerBlocks = cell.querySelectorAll<HTMLElement>("p, div, span, h1, h2, h3");

      if (targetMode === "vertical-rl") {
        cell.setAttribute("data-text-direction", "vertical");
        cell.style.textOrientation = "mixed";
        cell.style.whiteSpace = "nowrap";

        innerBlocks.forEach((b) => {
          b.style.writingMode = "vertical-rl";
          b.style.textOrientation = "mixed";
          b.style.whiteSpace = "nowrap";
          b.style.marginTop = "0px";
          b.style.marginBottom = "0px";
        });

        const row = cell.closest("tr");
        if (row) {
          const textLen = (cell.textContent || "").trim().length;
          const neededHeight = Math.max(70, Math.min(240, textLen * 12 + 24));
          const currentHeight = parseFloat(row.style.height) || row.offsetHeight || 0;
          if (currentHeight < neededHeight) {
            row.style.height = `${neededHeight}px`;
            Array.from(row.cells).forEach((rc) => {
              rc.style.height = `${neededHeight}px`;
            });
          }
        }
      } else {
        cell.removeAttribute("data-text-direction");
        cell.style.textOrientation = "";
        cell.style.whiteSpace = "";

        innerBlocks.forEach((b) => {
          b.style.writingMode = "horizontal-tb";
          b.style.textOrientation = "";
          b.style.whiteSpace = "";
          b.style.marginTop = "";
          b.style.marginBottom = "";
        });

        const row = cell.closest("tr");
        if (row) {
          const otherVerticalCells = Array.from(row.cells).filter(
            (rc) => rc !== cell && rc.getAttribute("data-text-direction") === "vertical"
          );
          if (otherVerticalCells.length === 0) {
            row.style.height = "";
            row.removeAttribute("height");
            Array.from(row.cells).forEach((rc) => {
              rc.style.height = "";
              rc.removeAttribute("height");
            });
          }
        }
      }
    });

    updateCellFormatState();
    notifyDomChange(table || cells[0]);
    window.dispatchEvent(new CustomEvent("table:updated"));
  };

  const autoFitWindow = () => {
    const { table } = findActiveTarget();
    if (!table) return;

    table.style.width = "100%";
    table.style.minWidth = "100%";
    table.style.maxWidth = "100%";
    table.style.tableLayout = "fixed";

    const numCols = Math.max(
      ...Array.from(table.rows).map((r) => r.cells.length),
      1
    );
    const colWidth = (100 / numCols).toFixed(2) + "%";

    Array.from(table.rows).forEach((row) => {
      Array.from(row.cells).forEach((cell) => {
        cell.style.width = colWidth;
      });
    });

    notifyDomChange(table);
  };

  const autoFitContent = () => {
    const { table } = findActiveTarget();
    if (!table) return;

    table.style.width = "auto";
    table.style.minWidth = "unset";
    table.style.maxWidth = "100%";
    table.style.tableLayout = "auto";

    Array.from(table.rows).forEach((row) => {
      Array.from(row.cells).forEach((cell) => {
        cell.style.width = "auto";
      });
    });

    notifyDomChange(table);
  };

  const distributeColumns = () => {
    const { table } = findActiveTarget();
    if (!table) return;

    table.style.tableLayout = "fixed";
    const numCols = Math.max(
      ...Array.from(table.rows).map((r) => r.cells.length),
      1
    );
    const scale = (zoom || 100) / 100;
    const colWidthPct = (100 / numCols).toFixed(2) + "%";
    const tableWidth = table.getBoundingClientRect().width / scale;
    const colWidthPx = Math.max(20, Math.floor(tableWidth / numCols));

    Array.from(table.rows).forEach((row) => {
      Array.from(row.cells).forEach((cell) => {
        cell.style.minWidth = "unset";
        cell.style.maxWidth = "unset";
        cell.style.width = table.style.width && table.style.width.endsWith("px")
          ? `${colWidthPx}px`
          : colWidthPct;
        cell.style.boxSizing = "border-box";
      });
    });

    notifyDomChange(table);
    window.dispatchEvent(new CustomEvent("table:updated"));
  };

  const distributeRows = () => {
    const { table } = findActiveTarget();
    if (!table) return;

    const rows = Array.from(table.rows);
    if (rows.length === 0) return;

    const scale = (zoom || 100) / 100;
    const rowHeights = rows.map((r) => r.getBoundingClientRect().height / scale);
    const totalRowsHeight = rowHeights.reduce((acc, h) => acc + h, 0);
    const equalRowHeight = Math.max(18, Math.round(totalRowsHeight / rows.length));

    let maxContentHeight = 18;
    rows.forEach((r) => {
      Array.from(r.cells).forEach((c) => {
        const cellContentHeight = Math.max(c.scrollHeight || 0, c.offsetHeight || 0, 18);
        if (cellContentHeight > maxContentHeight) {
          maxContentHeight = cellContentHeight;
        }
      });
    });

    const targetRowHeight = Math.max(equalRowHeight, Math.round(maxContentHeight));

    rows.forEach((row) => {
      row.style.height = `${targetRowHeight}px`;
      row.removeAttribute("height");
      Array.from(row.cells).forEach((cell) => {
        cell.style.height = `${targetRowHeight}px`;
        cell.style.minHeight = "unset";
        cell.style.maxHeight = "unset";
        cell.style.boxSizing = "border-box";
        cell.removeAttribute("height");
      });
    });

    table.style.height = `${Math.round(targetRowHeight * rows.length)}px`;
    table.style.minHeight = "unset";
    table.removeAttribute("height");

    notifyDomChange(table);
    window.dispatchEvent(new CustomEvent("table:updated"));
  };

  const value = useMemo<TableContextValue>(
    () => ({
      config,
      setConfig,
      updateConfig,
      insertTableWithConfig,
      insertTemplate,
      insertQuickTable,
      insertCustomTableHTML: executeInsertTable,
      insertRowAbove,
      insertRowBelow,
      insertColLeft,
      insertColRight,
      deleteCurrentRow,
      deleteCurrentCol,
      deleteCurrentTable,
      mergeCells,
      splitCell,
      mergeSelectedCells: mergeCells,
      splitSelectedCell: splitCell,
      splitCurrentTable,
      mergeWithNextTable,
      setCellHorizontalAlign,
      setCellVerticalAlign,
      toggleCellTextDirection,
      activeCellFormat,
      autoFitWindow,
      autoFitContent,
      distributeColumns,
      distributeRows,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config, activeCellFormat]
  );

  return (
    <TableContext.Provider value={value}>
      {children}
    </TableContext.Provider>
  );
}

export function useTableContext(): TableContextValue {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("useTableContext must be used within a TableProvider");
  }
  return context;
}
