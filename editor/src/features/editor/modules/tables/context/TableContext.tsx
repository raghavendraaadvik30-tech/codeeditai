/**
 * --------------------------------------------------------
 * Module: Tables
 * Feature: Table Feature Context
 * Description:
 * React Context provider managing active table configuration,
 * interactive grid state, and table insertion/manipulation operations.
 * --------------------------------------------------------
 */

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { TableConfig, TableTemplate } from "../types";
import { DEFAULT_TABLE_CONFIG } from "../constants";
import { generateTableHtml, generateTemplateTableHtml } from "../utils";
import { useEditor } from "@/features/editor/context/EditorContext";
import { useDocumentModel } from "@/features/editor/store/documentModel";

export interface TableContextValue {
  config: TableConfig;
  setConfig: React.Dispatch<React.SetStateAction<TableConfig>>;
  updateConfig: (patch: Partial<TableConfig>) => void;
  insertTableWithConfig: (customConfig?: TableConfig) => void;
  insertTemplate: (template: TableTemplate) => void;
  insertQuickTable: (rows: number, cols: number) => void;
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
    const range = document.createRange();
    range.selectNodeContents(cell);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    cell.focus();
  } catch {
    // ignore
  }
}

export function TableProvider({
  children,
  initialConfig = DEFAULT_TABLE_CONFIG,
}: {
  children: ReactNode;
  initialConfig?: TableConfig;
}) {
  const { insertHTML, editorRef } = useEditor();
  const { setPageHtml } = useDocumentModel();
  const [config, setConfig] = useState<TableConfig>(initialConfig);

  const lastActiveCellRef = useRef<HTMLTableCellElement | null>(null);
  const lastActiveTableRef = useRef<HTMLTableElement | null>(null);

  // Continuously track active table and cell across the document
  useEffect(() => {
    const updateActiveCell = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const el = getNodeElement(selection.anchorNode);
        const cell = el?.closest("td, th") as HTMLTableCellElement | null;
        if (cell) {
          lastActiveCellRef.current = cell;
          lastActiveTableRef.current = cell.closest("table");
          return;
        }
      }

      if (document.activeElement) {
        const cell = document.activeElement.closest("td, th") as HTMLTableCellElement | null;
        if (cell) {
          lastActiveCellRef.current = cell;
          lastActiveTableRef.current = cell.closest("table");
        }
      }
    };

    document.addEventListener("selectionchange", updateActiveCell);
    document.addEventListener("pointerdown", updateActiveCell);
    document.addEventListener("keyup", updateActiveCell);
    document.addEventListener("focusin", updateActiveCell);

    return () => {
      document.removeEventListener("selectionchange", updateActiveCell);
      document.removeEventListener("pointerdown", updateActiveCell);
      document.removeEventListener("keyup", updateActiveCell);
      document.removeEventListener("focusin", updateActiveCell);
    };
  }, []);

  const findActiveTarget = () => {
    // 1. Current selection
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const el = getNodeElement(sel.anchorNode);
      const cell = el?.closest("td, th") as HTMLTableCellElement | null;
      if (cell && cell.isConnected) {
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

  const insertTableWithConfig = (customConfig?: TableConfig) => {
    const active = customConfig || config;
    const html = generateTableHtml(active);
    insertHTML?.(html);
  };

  const insertTemplate = (template: TableTemplate) => {
    const html = generateTemplateTableHtml(template);
    insertHTML?.(html);
  };

  const insertQuickTable = (rows: number, cols: number) => {
    const quickConfig: TableConfig = {
      ...config,
      rows,
      cols,
    };
    const html = generateTableHtml(quickConfig);
    insertHTML?.(html);
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
      firstCell.innerHTML = texts.length > 0 ? texts.join(" ") : "&nbsp;";

      if (rows.length === 1) {
        // Horizontal merge within single row
        let totalColSpan = 0;
        selectedCells.forEach((c) => {
          totalColSpan += c.colSpan || 1;
        });
        firstCell.colSpan = totalColSpan;
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

    const colSpan = targetCell.colSpan || 1;
    const rowSpan = targetCell.rowSpan || 1;

    // Part 12: If the selected cell is not merged, do nothing safely
    if (colSpan <= 1 && rowSpan <= 1) {
      return;
    }

    const isHeader = targetCell.tagName.toLowerCase() === "th";

    // Split horizontal colspan (e.g. colspan="3" -> 3 individual cells)
    if (colSpan > 1) {
      targetCell.colSpan = 1;
      for (let i = 0; i < colSpan - 1; i++) {
        const newCell = document.createElement(isHeader ? "th" : "td") as HTMLTableCellElement;
        newCell.style.border = targetCell.style.border || "1px solid #cbd5e1";
        newCell.style.padding = targetCell.style.padding || "8px 12px";
        newCell.style.verticalAlign = "top";
        newCell.style.textAlign = "left";
        newCell.style.wordBreak = "break-word";
        newCell.style.overflowWrap = "anywhere";
        newCell.style.boxSizing = "border-box";
        newCell.innerHTML = "&nbsp;";
        if (isHeader) {
          newCell.style.backgroundColor = targetCell.style.backgroundColor || "#f1f5f9";
          newCell.style.fontWeight = targetCell.style.fontWeight || "600";
        }
        if (targetCell.nextSibling) {
          targetTr.insertBefore(newCell, targetCell.nextSibling);
        } else {
          targetTr.appendChild(newCell);
        }
      }
    }

    // Split vertical rowspan (e.g. rowspan="2" -> restore into separate rows/cells)
    if (rowSpan > 1) {
      targetCell.rowSpan = 1;
      const allRows = Array.from(targetTable.querySelectorAll("tr"));
      const rowIndex = allRows.indexOf(targetTr);
      const colIndex = targetCell.cellIndex;

      if (rowIndex !== -1) {
        for (let r = 1; r < rowSpan; r++) {
          const rowElem = allRows[rowIndex + r];
          if (rowElem) {
            const newCell = document.createElement("td") as HTMLTableCellElement;
            newCell.style.border = targetCell.style.border || "1px solid #cbd5e1";
            newCell.style.padding = targetCell.style.padding || "8px 12px";
            newCell.style.verticalAlign = "top";
            newCell.style.textAlign = "left";
            newCell.style.wordBreak = "break-word";
            newCell.style.overflowWrap = "anywhere";
            newCell.style.boxSizing = "border-box";
            newCell.innerHTML = "&nbsp;";

            if (rowElem.children[colIndex]) {
              rowElem.insertBefore(newCell, rowElem.children[colIndex]);
            } else {
              rowElem.appendChild(newCell);
            }
          }
        }
      }
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

    const parentNode = targetTable.parentNode;
    if (targetTable.nextSibling) {
      parentNode.insertBefore(spacer, targetTable.nextSibling);
      parentNode.insertBefore(newTable, spacer.nextSibling);
    } else {
      parentNode.appendChild(spacer);
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

  const value = useMemo<TableContextValue>(
    () => ({
      config,
      setConfig,
      updateConfig,
      insertTableWithConfig,
      insertTemplate,
      insertQuickTable,
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
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config]
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
