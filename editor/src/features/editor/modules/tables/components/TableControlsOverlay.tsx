/**
 * --------------------------------------------------------
 * Module: Tables
 * Feature: TableControlsOverlay Component
 * Description:
 * Word-style external UI handles (Move, Resize, Column Line Extend,
 * and AutoFit) rendered as an overlay outside contentEditable DOM
 * to avoid contaminating saved/exported document HTML.
 * Supports smooth bidirectional resizing (shrinking & growing up to available page width),
 * internal column line extending/divider dragging, row height extending,
 * quick AutoFit actions, and full-table drag-and-drop between document blocks and across multiple document pages.
 * --------------------------------------------------------
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Move, Maximize2, Minimize2 } from "lucide-react";
import { useDocumentModel } from "@/features/editor/store/documentModel";

interface TableControlsOverlayProps {
  table: HTMLTableElement;
  container: HTMLElement;
  zoom: number;
  onUpdate: () => void;
  onActivateTable?: (table: HTMLTableElement | null) => void;
  onDeactivateTable?: () => void;
}

interface TablePosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ColDivider {
  colIndex: number;
  left: number;
  isLast?: boolean;
}

interface RowDivider {
  rowIndex: number;
  top: number;
}

interface DragPreviewState {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DropIndicatorState {
  top: number;
  left: number;
  width: number;
}

export function TableControlsOverlay({
  table,
  container,
  zoom,
  onUpdate,
  onActivateTable,
  onDeactivateTable,
}: TableControlsOverlayProps) {
  const { setPageHtml, setActivePage } = useDocumentModel();

  const [pos, setPos] = useState<TablePosition | null>(null);
  const [colDividers, setColDividers] = useState<ColDivider[]>([]);
  const [rowDividers, setRowDividers] = useState<RowDivider[]>([]);
  const [activeColIndex, setActiveColIndex] = useState<number | null>(null);
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDimensions, setResizeDimensions] = useState<{ width: number; height: number } | null>(null);

  const [dragPreview, setDragPreview] = useState<DragPreviewState | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicatorState | null>(null);

  const dragTargetRef = useRef<{
    targetContainer: HTMLElement;
    targetNode: Element | null;
    insertAfter: boolean;
  } | null>(null);

  const scale = zoom / 100;

  // Calculate table position, column divider positions, and row divider positions relative to section (offsetParent)
  const updatePosition = useCallback(() => {
    if (!table.isConnected || !container.isConnected) {
      onDeactivateTable?.();
      setPos(null);
      setColDividers([]);
      setRowDividers([]);
      return;
    }

    const compStyle = window.getComputedStyle(container);
    const padLeft = parseFloat(compStyle.paddingLeft) || 0;
    const padRight = parseFloat(compStyle.paddingRight) || 0;
    const availableContentWidth = Math.max(100, Math.round((container.clientWidth || 816) - (padLeft + padRight)));

    // Clean up any historical full-page minWidth locks so table can shrink freely
    if (
      !table.style.minWidth ||
      table.style.minWidth === "100%" ||
      table.style.minWidth === "unset" ||
      parseFloat(table.style.minWidth) >= (container.clientWidth || 800)
    ) {
      table.style.minWidth = "0px";
    }
    table.style.maxWidth = `${availableContentWidth}px`;

    const tableRect = table.getBoundingClientRect();
    const section = container.closest("section[data-page-id]") || container;
    const sectionRect = section.getBoundingClientRect();

    const top = (tableRect.top - sectionRect.top) / scale;
    const left = (tableRect.left - sectionRect.left) / scale;
    const width = tableRect.width / scale;
    const height = tableRect.height / scale;

    setPos({ top, left, width, height });

    // Calculate vertical column divider positions relative to section using a reference row with no colSpans if possible
    const referenceRow = Array.from(table.rows).find((r) =>
      r.cells.length > 0 && Array.from(r.cells).every((c) => (c.colSpan || 1) === 1)
    ) || table.rows[0];

    if (referenceRow && referenceRow.cells.length > 0) {
      const dividers: ColDivider[] = [];
      const cells = Array.from(referenceRow.cells);
      for (let i = 0; i < cells.length; i++) {
        const cRect = cells[i].getBoundingClientRect();
        const dividerLeft = (cRect.right - sectionRect.left) / scale;
        dividers.push({
          colIndex: i,
          left: dividerLeft,
          isLast: i === cells.length - 1,
        });
      }
      setColDividers(dividers);
    } else {
      setColDividers([]);
    }

    // Calculate horizontal row divider positions relative to section
    if (table.rows.length > 0) {
      const rDividers: RowDivider[] = [];
      const rows = Array.from(table.rows);
      for (let i = 0; i < rows.length; i++) {
        const rRect = rows[i].getBoundingClientRect();
        const dividerTop = (rRect.bottom - sectionRect.top) / scale;
        rDividers.push({ rowIndex: i, top: dividerTop });
      }
      setRowDividers(rDividers);
    } else {
      setRowDividers([]);
    }
  }, [table, container, scale]);

  // Tag active table so any external command (such as Distribute Rows from sidebar) immediately finds it
  useEffect(() => {
    table.setAttribute("data-active-table", "true");
    return () => {
      table.removeAttribute("data-active-table");
    };
  }, [table]);

  useEffect(() => {
    updatePosition();

    const observer = new ResizeObserver(() => {
      updatePosition();
    });
    observer.observe(table);
    observer.observe(container);

    const mutationObserver = new MutationObserver(() => {
      updatePosition();
    });
    mutationObserver.observe(table, {
      attributes: true,
      attributeFilter: ["style", "class", "height", "width"],
      subtree: true,
      childList: true,
    });

    const handleTableUpdated = () => {
      updatePosition();
    };

    window.addEventListener("table:updated", handleTableUpdated);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    container.addEventListener("input", handleTableUpdated);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("table:updated", handleTableUpdated);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      container.removeEventListener("input", handleTableUpdated);
    };
  }, [table, container, updatePosition]);

  /* ============================================================
     1. Column Lines Resizing (Word-style column divider dragging)
     - Internal column dividers adjust adjacent columns and preserve total table width
     - Right edge of table adjusts last column and expands/contracts table width
     - All deltas account for zoom scale and clamp to page margins
  ============================================================ */
  /* ============================================================
     TABLE RESIZING ENGINE (Word-Style Bidirectional & Proportional)
     ============================================================ */

  const distributeProportionalWidths = (
    targetTotal: number,
    baseWidths: number[],
    minW: number
  ): number[] => {
    const currentTotal = baseWidths.reduce((a, b) => a + b, 0);
    if (currentTotal <= 0) return baseWidths.map(() => minW);

    const ratio = targetTotal / currentTotal;
    const newWidths = baseWidths.map((w) => Math.max(minW, Math.floor(w * ratio)));
    let sum = newWidths.reduce((a, b) => a + b, 0);
    let diff = targetTotal - sum;

    let idx = 0;
    while (diff > 0) {
      newWidths[idx % newWidths.length]++;
      diff--;
      idx++;
    }
    while (diff < 0) {
      const maxIdx = newWidths.indexOf(Math.max(...newWidths));
      if (newWidths[maxIdx] > minW) {
        newWidths[maxIdx]--;
        diff++;
      } else {
        break;
      }
    }
    return newWidths;
  };

  const distributeProportionalHeights = (
    targetTotal: number,
    baseHeights: number[],
    minH: number
  ): number[] => {
    const currentTotal = baseHeights.reduce((a, b) => a + b, 0);
    if (currentTotal <= 0) return baseHeights.map(() => minH);

    const ratio = targetTotal / currentTotal;
    const newHeights = baseHeights.map((h) => Math.max(minH, Math.floor(h * ratio)));
    let sum = newHeights.reduce((a, b) => a + b, 0);
    let diff = targetTotal - sum;

    let idx = 0;
    while (diff > 0) {
      newHeights[idx % newHeights.length]++;
      diff--;
      idx++;
    }
    while (diff < 0) {
      const maxIdx = newHeights.indexOf(Math.max(...newHeights));
      if (newHeights[maxIdx] > minH) {
        newHeights[maxIdx]--;
        diff++;
      } else {
        break;
      }
    }
    return newHeights;
  };

  const applyColumnWidthsToTable = (tbl: HTMLTableElement, colWidths: number[]) => {
    Array.from(tbl.rows).forEach((row) => {
      let colIdx = 0;
      Array.from(row.cells).forEach((cell) => {
        const span = cell.colSpan || 1;
        if (span === 1 && colWidths[colIdx] !== undefined) {
          cell.style.width = `${colWidths[colIdx]}px`;
        } else if (span > 1) {
          let spanW = 0;
          for (let s = 0; s < span && colIdx + s < colWidths.length; s++) {
            spanW += colWidths[colIdx + s];
          }
          if (spanW > 0) cell.style.width = `${spanW}px`;
        }
        cell.style.minWidth = "0px";
        cell.style.boxSizing = "border-box";
        cell.style.overflow = "hidden";
        cell.style.wordBreak = "break-word";
        cell.style.overflowWrap = "anywhere";
        colIdx += span;
      });
    });
  };

  const applyRowHeightsToTable = (tbl: HTMLTableElement, rowHeights: number[]) => {
    Array.from(tbl.rows).forEach((row, rIdx) => {
      const h = rowHeights[rIdx];
      if (h !== undefined) {
        row.style.height = `${h}px`;
        Array.from(row.cells).forEach((cell) => {
          if ((cell.rowSpan || 1) === 1) {
            cell.style.height = `${h}px`;
          }
          cell.style.minHeight = "0px";
          cell.style.boxSizing = "border-box";
        });
      }
    });
  };

  /* ============================================================
     1. Column Lines Resizing (Word-style column divider dragging)
     - Internal column dividers adjust adjacent columns and preserve total table width
     - Right edge of table adjusts last column and expands/contracts table width
     ============================================================ */
  const handleColResizePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    colIndex: number,
    isLast?: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const startPointerX = e.clientX;
    const referenceRow = Array.from(table.rows).find((r) =>
      r.cells.length > 0 && Array.from(r.cells).every((c) => (c.colSpan || 1) === 1)
    ) || table.rows[0];
    if (!referenceRow) return;

    const refCells = Array.from(referenceRow.cells);
    if (refCells.length === 0) return;

    const startColWidths = refCells.map((c) => c.getBoundingClientRect().width / scale);
    const startTableWidth = table.getBoundingClientRect().width / scale;

    const compStyle = window.getComputedStyle(container);
    const padLeft = parseFloat(compStyle.paddingLeft) || 0;
    const padRight = parseFloat(compStyle.paddingRight) || 0;
    const availableContentWidth = Math.max(100, Math.round((container.clientWidth || 816) - (padLeft + padRight)));
    const currentMarginLeft = parseFloat(table.style.marginLeft) || 0;
    const maxAvailableWidth = Math.max(80, availableContentWidth - currentMarginLeft);
    const minColWidth = 16;
    const minTableWidth = Math.max(30, refCells.length * minColWidth);

    table.style.width = `${startTableWidth}px`;
    table.style.minWidth = "0px";
    table.style.maxWidth = `${availableContentWidth}px`;
    table.style.tableLayout = "fixed";

    applyColumnWidthsToTable(table, startColWidths);

    setActiveColIndex(colIndex);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    let didMove = false;
    const isInternalDivider = !isLast && colIndex < refCells.length - 1;

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const deltaX = (moveEv.clientX - startPointerX) / scale;
      if (Math.abs(deltaX) > 1.5) didMove = true;

      if (isInternalDivider) {
        const leftCol = colIndex;
        const rightCol = colIndex + 1;
        const startLeftWidth = startColWidths[leftCol] ?? 50;
        const startRightWidth = startColWidths[rightCol] ?? 50;
        const combinedWidth = startLeftWidth + startRightWidth;

        const minDelta = minColWidth - startLeftWidth;
        const maxDelta = startRightWidth - minColWidth;
        const clampedDelta = Math.max(minDelta, Math.min(maxDelta, deltaX));

        const newLeftWidth = Math.max(minColWidth, Math.round(startLeftWidth + clampedDelta));
        const newRightWidth = Math.max(minColWidth, combinedWidth - newLeftWidth);

        const updatedColWidths = [...startColWidths];
        updatedColWidths[leftCol] = newLeftWidth;
        updatedColWidths[rightCol] = newRightWidth;

        applyColumnWidthsToTable(table, updatedColWidths);
        table.style.width = `${startTableWidth}px`;
        table.style.minWidth = "0px";
      } else {
        const targetTableWidth = Math.min(
          maxAvailableWidth,
          Math.max(minTableWidth, Math.round(startTableWidth + deltaX))
        );
        const newWidths = distributeProportionalWidths(targetTableWidth, startColWidths, minColWidth);

        table.style.width = `${targetTableWidth}px`;
        table.style.minWidth = "0px";
        applyColumnWidthsToTable(table, newWidths);
      }

      updatePosition();
    };

    const onPointerUp = (upEv: PointerEvent) => {
      upEv.preventDefault();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setActiveColIndex(null);

      if (!didMove) {
        const el = document.elementFromPoint(upEv.clientX, upEv.clientY);
        const cell = el?.closest("td, th") as HTMLElement | null;
        if (cell) {
          cell.focus();
        }
      } else {
        table.style.minWidth = "0px";
        onUpdate();
        updatePosition();

        const pageContainer = table.closest('[contenteditable="true"]') as HTMLElement | null;
        if (pageContainer) {
          pageContainer.dispatchEvent(new Event("input", { bubbles: true }));
          const pageId = pageContainer.closest("section[data-page-id]")?.getAttribute("data-page-id");
          if (pageId && setPageHtml) {
            setPageHtml(pageId, pageContainer.innerHTML);
          }
        }
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  /* ============================================================
     2. Row Lines Resizing (Word-style row height adjusting)
     - Internal dividers adjust adjacent rows and preserve total height
     - Bottom boundary expands or contracts rows down to 16px min height
     ============================================================ */
  const handleRowResizePointerDown = (e: React.PointerEvent<HTMLDivElement>, rowIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const startPointerY = e.clientY;
    const rows = Array.from(table.rows);
    if (rows.length === 0 || !rows[rowIndex]) return;

    const startRowHeights = rows.map((r) => r.getBoundingClientRect().height / scale);
    const startTableHeight = table.getBoundingClientRect().height / scale;
    const minRowHeight = 16;
    const minTableHeight = Math.max(20, rows.length * minRowHeight);

    const compStyle = window.getComputedStyle(container);
    const padTop = parseFloat(compStyle.paddingTop) || 0;
    const padBottom = parseFloat(compStyle.paddingBottom) || 0;
    const availableContentHeight = Math.max(100, Math.round((container.clientHeight || 1056) - (padTop + padBottom)));
    const currentMarginTop = parseFloat(table.style.marginTop) || 0;
    const maxAvailableHeight = Math.max(60, availableContentHeight - currentMarginTop);

    applyRowHeightsToTable(table, startRowHeights);

    setActiveRowIndex(rowIndex);
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";

    let didMove = false;
    const isInternalRow = rowIndex < rows.length - 1;

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const deltaY = (moveEv.clientY - startPointerY) / scale;
      if (Math.abs(deltaY) > 1.5) didMove = true;

      if (isInternalRow) {
        const startAboveH = startRowHeights[rowIndex] || minRowHeight;
        const startBelowH = startRowHeights[rowIndex + 1] || minRowHeight;
        const combinedH = startAboveH + startBelowH;

        const minDelta = minRowHeight - startAboveH;
        const maxDelta = startBelowH - minRowHeight;
        const clampedDelta = Math.max(minDelta, Math.min(maxDelta, deltaY));

        const newAboveH = Math.max(minRowHeight, Math.round(startAboveH + clampedDelta));
        const newBelowH = Math.max(minRowHeight, combinedH - newAboveH);

        const updatedRowHeights = [...startRowHeights];
        updatedRowHeights[rowIndex] = newAboveH;
        updatedRowHeights[rowIndex + 1] = newBelowH;
        applyRowHeightsToTable(table, updatedRowHeights);
      } else {
        const targetTableH = Math.min(
          maxAvailableHeight,
          Math.max(minTableHeight, Math.round(startTableHeight + deltaY))
        );
        const newHeights = distributeProportionalHeights(targetTableH, startRowHeights, minRowHeight);
        applyRowHeightsToTable(table, newHeights);
      }

      updatePosition();
    };

    const onPointerUp = (upEv: PointerEvent) => {
      upEv.preventDefault();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setActiveRowIndex(null);

      if (!didMove) {
        const el = document.elementFromPoint(upEv.clientX, upEv.clientY);
        const cell = el?.closest("td, th") as HTMLElement | null;
        if (cell) {
          cell.focus();
        }
      } else {
        onUpdate();
        updatePosition();

        const pageContainer = table.closest('[contenteditable="true"]') as HTMLElement | null;
        if (pageContainer) {
          pageContainer.dispatchEvent(new Event("input", { bubbles: true }));
          const pageId = pageContainer.closest("section[data-page-id]")?.getAttribute("data-page-id");
          if (pageId && setPageHtml) {
            setPageHtml(pageId, pageContainer.innerHTML);
          }
        }
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  /* ============================================================
     3. Left Edge Table Width Resize Handler
     - Dragging right: table shrinks from the left (narrower)
     - Dragging left: table expands to the left (wider)
     ============================================================ */
  const handleLeftResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const startPointerX = e.clientX;
    const startTableWidth = table.getBoundingClientRect().width / scale;
    const startMarginLeft = parseFloat(table.style.marginLeft) || 0;

    const compStyle = window.getComputedStyle(container);
    const padLeft = parseFloat(compStyle.paddingLeft) || 0;
    const padRight = parseFloat(compStyle.paddingRight) || 0;
    const availableContentWidth = Math.max(100, Math.round((container.clientWidth || 816) - padLeft - padRight));

    const referenceRow = Array.from(table.rows).find((r) =>
      r.cells.length > 0 && Array.from(r.cells).every((c) => (c.colSpan || 1) === 1)
    ) || table.rows[0];
    const refCells = referenceRow ? Array.from(referenceRow.cells) : [];
    const startColWidths = refCells.map((c) => c.getBoundingClientRect().width / scale);
    const minColWidth = 16;
    const minTableWidth = Math.max(30, refCells.length * minColWidth);

    setIsResizing(true);
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
    table.style.tableLayout = "fixed";
    table.style.minWidth = "0px";

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const deltaX = (moveEv.clientX - startPointerX) / scale;

      const maxGrowLeft = startMarginLeft;
      const clampedDeltaX = Math.max(-maxGrowLeft, deltaX);

      const targetWidth = Math.max(
        minTableWidth,
        Math.min(availableContentWidth, Math.round(startTableWidth - clampedDeltaX))
      );
      const actualDelta = startTableWidth - targetWidth;
      const targetMarginLeft = Math.max(0, Math.round(startMarginLeft + actualDelta));

      table.style.marginLeft = `${targetMarginLeft}px`;
      table.style.width = `${targetWidth}px`;
      table.style.minWidth = "0px";
      table.style.maxWidth = `${availableContentWidth}px`;

      if (startTableWidth > 0 && refCells.length > 0) {
        const newWidths = distributeProportionalWidths(targetWidth, startColWidths, minColWidth);
        applyColumnWidthsToTable(table, newWidths);
      }

      setResizeDimensions({
        width: targetWidth,
        height: Math.round(table.getBoundingClientRect().height / scale),
      });
      updatePosition();
    };

    const onPointerUp = (upEv: PointerEvent) => {
      upEv.preventDefault();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      table.style.minWidth = "0px";
      setIsResizing(false);
      setResizeDimensions(null);

      onUpdate();
      updatePosition();

      const pageContainer = table.closest('[contenteditable="true"]') as HTMLElement | null;
      if (pageContainer) {
        pageContainer.dispatchEvent(new Event("input", { bubbles: true }));
        const pageId = pageContainer.closest("section[data-page-id]")?.getAttribute("data-page-id");
        if (pageId && setPageHtml) {
          setPageHtml(pageId, pageContainer.innerHTML);
        }
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  /* ============================================================
     4. Right Edge Table Width Resize Handler
     - Dragging left: table shrinks from the right (narrower)
     - Dragging right: table expands up to available page width
     ============================================================ */
  const handleRightResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const startPointerX = e.clientX;
    const startTableWidth = table.getBoundingClientRect().width / scale;

    const compStyle = window.getComputedStyle(container);
    const padLeft = parseFloat(compStyle.paddingLeft) || 0;
    const padRight = parseFloat(compStyle.paddingRight) || 0;
    const availableContentWidth = Math.max(100, Math.round((container.clientWidth || 816) - padLeft - padRight));
    const currentMarginLeft = parseFloat(table.style.marginLeft) || 0;
    const maxAvailableWidth = Math.max(80, availableContentWidth - currentMarginLeft);

    const referenceRow = Array.from(table.rows).find((r) =>
      r.cells.length > 0 && Array.from(r.cells).every((c) => (c.colSpan || 1) === 1)
    ) || table.rows[0];
    const refCells = referenceRow ? Array.from(referenceRow.cells) : [];
    const startColWidths = refCells.map((c) => c.getBoundingClientRect().width / scale);
    const minColWidth = 16;
    const minTableWidth = Math.max(30, refCells.length * minColWidth);

    setIsResizing(true);
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
    table.style.tableLayout = "fixed";
    table.style.minWidth = "0px";

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const deltaX = (moveEv.clientX - startPointerX) / scale;

      const targetWidth = Math.min(
        maxAvailableWidth,
        Math.max(minTableWidth, Math.round(startTableWidth + deltaX))
      );

      table.style.width = `${targetWidth}px`;
      table.style.minWidth = "0px";
      table.style.maxWidth = `${availableContentWidth}px`;

      if (startTableWidth > 0 && refCells.length > 0) {
        const newWidths = distributeProportionalWidths(targetWidth, startColWidths, minColWidth);
        applyColumnWidthsToTable(table, newWidths);
      }

      setResizeDimensions({
        width: targetWidth,
        height: Math.round(table.getBoundingClientRect().height / scale),
      });
      updatePosition();
    };

    const onPointerUp = (upEv: PointerEvent) => {
      upEv.preventDefault();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      table.style.minWidth = "0px";
      setIsResizing(false);
      setResizeDimensions(null);

      onUpdate();
      updatePosition();

      const pageContainer = table.closest('[contenteditable="true"]') as HTMLElement | null;
      if (pageContainer) {
        pageContainer.dispatchEvent(new Event("input", { bubbles: true }));
        const pageId = pageContainer.closest("section[data-page-id]")?.getAttribute("data-page-id");
        if (pageId && setPageHtml) {
          setPageHtml(pageId, pageContainer.innerHTML);
        }
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  /* ============================================================
     5. Corner Resize Handler (Bottom-Right Handle)
     - Scales both width and height smoothly & proportionally
     - Strictly clamped to page content boundaries
     ============================================================ */
  const handleResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const startPointerX = e.clientX;
    const startPointerY = e.clientY;
    const startTableWidth = table.getBoundingClientRect().width / scale;
    const startTableHeight = table.getBoundingClientRect().height / scale;

    const compStyle = window.getComputedStyle(container);
    const padLeft = parseFloat(compStyle.paddingLeft) || 0;
    const padRight = parseFloat(compStyle.paddingRight) || 0;
    const padTop = parseFloat(compStyle.paddingTop) || 0;
    const padBottom = parseFloat(compStyle.paddingBottom) || 0;

    const availableContentWidth = Math.max(100, Math.round((container.clientWidth || 816) - padLeft - padRight));
    const availableContentHeight = Math.max(100, Math.round((container.clientHeight || 1056) - padTop - padBottom));

    const currentMarginLeft = parseFloat(table.style.marginLeft) || 0;
    const currentMarginTop = parseFloat(table.style.marginTop) || 0;
    const maxAvailableWidth = Math.max(80, availableContentWidth - currentMarginLeft);
    const maxAvailableHeight = Math.max(60, availableContentHeight - currentMarginTop);

    const referenceRow = Array.from(table.rows).find((r) =>
      r.cells.length > 0 && Array.from(r.cells).every((c) => (c.colSpan || 1) === 1)
    ) || table.rows[0];
    const firstRowCells = referenceRow ? Array.from(referenceRow.cells) : [];
    const startColWidths = firstRowCells.map((c) => c.getBoundingClientRect().width / scale);
    const minColWidth = 16;
    const minTableWidth = Math.max(30, firstRowCells.length * minColWidth);

    const tableRows = Array.from(table.rows);
    const startRowHeights = tableRows.map((r) => r.getBoundingClientRect().height / scale);
    const minRowHeight = 16;
    const minTableHeight = Math.max(20, tableRows.length * minRowHeight);

    setIsResizing(true);
    document.body.style.cursor = "nwse-resize";
    document.body.style.userSelect = "none";
    table.style.tableLayout = "fixed";
    table.style.minWidth = "0px";

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const deltaX = (moveEv.clientX - startPointerX) / scale;
      const deltaY = (moveEv.clientY - startPointerY) / scale;

      const targetWidth = Math.min(
        maxAvailableWidth,
        Math.max(minTableWidth, Math.round(startTableWidth + deltaX))
      );
      const targetHeight = Math.min(
        maxAvailableHeight,
        Math.max(minTableHeight, Math.round(startTableHeight + deltaY))
      );

      table.style.width = `${targetWidth}px`;
      table.style.minWidth = "0px";
      table.style.maxWidth = `${availableContentWidth}px`;

      // Scale columns proportionally
      if (startTableWidth > 0 && firstRowCells.length > 0) {
        const newWidths = distributeProportionalWidths(targetWidth, startColWidths, minColWidth);
        applyColumnWidthsToTable(table, newWidths);
      }

      // Scale rows proportionally
      if (startTableHeight > 0 && tableRows.length > 0) {
        const newHeights = distributeProportionalHeights(targetHeight, startRowHeights, minRowHeight);
        applyRowHeightsToTable(table, newHeights);
      }

      setResizeDimensions({ width: targetWidth, height: targetHeight });
      updatePosition();
    };

    const onPointerUp = (upEv: PointerEvent) => {
      upEv.preventDefault();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      table.style.minWidth = "0px";
      setIsResizing(false);
      setResizeDimensions(null);

      onUpdate();
      updatePosition();

      const pageContainer = table.closest('[contenteditable="true"]') as HTMLElement | null;
      if (pageContainer) {
        pageContainer.dispatchEvent(new Event("input", { bubbles: true }));
        const pageId = pageContainer.closest("section[data-page-id]")?.getAttribute("data-page-id");
        if (pageId && setPageHtml) {
          setPageHtml(pageId, pageContainer.innerHTML);
        }
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  /* ============================================================
     4. Table Move (Drag & Drop across blocks and across multiple pages)
     - Edge clamping prevents table from moving outside the page on left or right
     - Right-to-left placement updates marginLeft correctly and preserves position
     - Auto-scroll engine smoothly scrolls workspace when dragging near top/bottom edges
  ============================================================ */
  const handleMovePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const startPointerX = e.clientX;
    const startPointerY = e.clientY;
    const tableRect = table.getBoundingClientRect();
    const grabOffsetX = startPointerX - tableRect.left;
    const grabOffsetY = startPointerY - tableRect.top;
    const startMarginLeft = parseFloat(table.style.marginLeft) || 0;
    const startMarginTop = parseFloat(table.style.marginTop) || 0;

    setIsDragging(true);
    setDragPreview({
      x: startPointerX - grabOffsetX,
      y: startPointerY - grabOffsetY,
      width: tableRect.width,
      height: tableRect.height,
    });

    table.style.opacity = "0.3";
    document.body.style.cursor = "move";
    document.body.style.userSelect = "none";

    const scrollContainer =
      container.closest("main") ||
      document.querySelector("main") ||
      document.scrollingElement ||
      document.documentElement;

    let autoScrollRaf: number | null = null;
    const checkAutoScroll = (clientY: number) => {
      if (autoScrollRaf) {
        cancelAnimationFrame(autoScrollRaf);
        autoScrollRaf = null;
      }

      const scrollRect = scrollContainer.getBoundingClientRect();
      const scrollThreshold = 90;
      let scrollSpeed = 0;

      if (clientY < scrollRect.top + scrollThreshold) {
        const factor = (scrollRect.top + scrollThreshold - clientY) / scrollThreshold;
        scrollSpeed = -Math.max(6, Math.round(factor * 20));
      } else if (clientY > scrollRect.bottom - scrollThreshold) {
        const factor = (clientY - (scrollRect.bottom - scrollThreshold)) / scrollThreshold;
        scrollSpeed = Math.max(6, Math.round(factor * 20));
      }

      if (scrollSpeed !== 0) {
        const stepScroll = () => {
          scrollContainer.scrollTop += scrollSpeed;
          autoScrollRaf = requestAnimationFrame(stepScroll);
        };
        autoScrollRaf = requestAnimationFrame(stepScroll);
      }
    };

    let latestClampedMarginLeft = startMarginLeft;
    let latestClampedMarginTop = startMarginTop;

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();

      checkAutoScroll(moveEv.clientY);

      const pointerY = moveEv.clientY;

      // Find which page section the pointer is currently over or closest to
      const allPageSections = Array.from(
        document.querySelectorAll<HTMLElement>("section[data-page-id]")
      );

      let targetSection: HTMLElement | null = null;
      let minSectionDist = Infinity;

      for (const sec of allPageSections) {
        const secRect = sec.getBoundingClientRect();
        if (pointerY >= secRect.top && pointerY <= secRect.bottom) {
          targetSection = sec;
          break;
        }
        const secMiddleY = secRect.top + secRect.height / 2;
        const dist = Math.abs(pointerY - secMiddleY);
        if (dist < minSectionDist) {
          minSectionDist = dist;
          targetSection = sec;
        }
      }

      const targetContainer =
        targetSection?.querySelector<HTMLElement>('[contenteditable="true"]') || container;
      const targetContainerRect = targetContainer.getBoundingClientRect();
      const compStyle = window.getComputedStyle(targetContainer);
      const padLeft = parseFloat(compStyle.paddingLeft) || 0;
      const padRight = parseFloat(compStyle.paddingRight) || 0;
      const padTop = parseFloat(compStyle.paddingTop) || 0;
      const padBottom = parseFloat(compStyle.paddingBottom) || 0;
      const contentWidth = Math.max(100, Math.round((targetContainer.clientWidth || 816) - (padLeft + padRight)));
      const contentHeight = Math.max(100, Math.round((targetContainer.clientHeight || 1056) - (padTop + padBottom)));
      const tableWidth = Math.round(tableRect.width / scale);
      const tableHeight = Math.round(tableRect.height / scale);

      // Horizontal edge clamping:
      const maxMarginLeft = Math.max(0, contentWidth - tableWidth);
      const deltaX = (moveEv.clientX - startPointerX) / scale;
      const targetMarginLeft = Math.round(startMarginLeft + deltaX);
      const clampedMarginLeft = Math.max(0, Math.min(maxMarginLeft, targetMarginLeft));
      latestClampedMarginLeft = clampedMarginLeft;

      // Vertical edge clamping (allows placing the table anywhere vertically on the page!):
      const maxMarginTop = Math.max(0, contentHeight - tableHeight);
      const deltaY = (moveEv.clientY - startPointerY) / scale;
      const targetMarginTop = Math.round(startMarginTop + deltaY);
      const clampedMarginTop = Math.max(0, Math.min(maxMarginTop, targetMarginTop));
      latestClampedMarginTop = clampedMarginTop;

      // Drag preview ghost smoothly follows pointer across the entire viewport
      const ghostX = Math.max(0, Math.min(window.innerWidth - tableRect.width, moveEv.clientX - grabOffsetX));
      const ghostY = Math.max(0, Math.min(window.innerHeight - 40, moveEv.clientY - grabOffsetY));

      setDragPreview({
        x: ghostX,
        y: ghostY,
        width: tableRect.width,
        height: tableRect.height,
      });

      // Top-level block children of target container
      const blockChildren = Array.from(targetContainer.children).filter(
        (child) => !child.hasAttribute("data-editor-ui") && child !== table
      );

      const indicatorLeft = targetContainerRect.left + (padLeft + clampedMarginLeft) * scale;
      const indicatorWidth = Math.min(tableRect.width, (contentWidth - clampedMarginLeft) * scale);

      if (blockChildren.length === 0) {
        dragTargetRef.current = {
          targetContainer,
          targetNode: null,
          insertAfter: true,
        };
        setDropIndicator({
          top: targetContainerRect.top + (padTop + clampedMarginTop) * scale,
          left: indicatorLeft,
          width: indicatorWidth,
        });
        return;
      }

      // Above first child
      const firstRect = blockChildren[0].getBoundingClientRect();
      if (pointerY < firstRect.top + firstRect.height / 2) {
        dragTargetRef.current = {
          targetContainer,
          targetNode: blockChildren[0],
          insertAfter: false,
        };
        setDropIndicator({
          top: firstRect.top - 4,
          left: indicatorLeft,
          width: indicatorWidth,
        });
        return;
      }

      // Below last child
      const lastRect = blockChildren[blockChildren.length - 1].getBoundingClientRect();
      if (pointerY > lastRect.bottom - lastRect.height / 2) {
        dragTargetRef.current = {
          targetContainer,
          targetNode: blockChildren[blockChildren.length - 1],
          insertAfter: true,
        };
        const indicatorTop = Math.max(
          lastRect.bottom + 4,
          targetContainerRect.top + (padTop + clampedMarginTop) * scale
        );
        setDropIndicator({
          top: indicatorTop,
          left: indicatorLeft,
          width: indicatorWidth,
        });
        return;
      }

      // Find closest block
      let closestChild: Element | null = null;
      let minDistance = Infinity;
      let insertAfter = false;

      for (const child of blockChildren) {
        const rect = child.getBoundingClientRect();
        const middleY = rect.top + rect.height / 2;
        const dist = Math.abs(pointerY - middleY);

        if (dist < minDistance) {
          minDistance = dist;
          closestChild = child;
          insertAfter = pointerY > middleY;
        }
      }

      if (closestChild) {
        dragTargetRef.current = {
          targetContainer,
          targetNode: closestChild,
          insertAfter,
        };

        const blockRect = closestChild.getBoundingClientRect();
        const lineTop = insertAfter ? blockRect.bottom + 4 : blockRect.top - 4;
        setDropIndicator({
          top: lineTop,
          left: indicatorLeft,
          width: indicatorWidth,
        });
      } else {
        dragTargetRef.current = {
          targetContainer,
          targetNode: null,
          insertAfter: true,
        };
        setDropIndicator(null);
      }
    };

    const onPointerUp = (upEv: PointerEvent) => {
      upEv.preventDefault();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      if (autoScrollRaf) {
        cancelAnimationFrame(autoScrollRaf);
        autoScrollRaf = null;
      }

      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      table.style.opacity = "";
      setIsDragging(false);
      setDragPreview(null);
      setDropIndicator(null);

      const targetInfo = dragTargetRef.current;
      const targetContainer = targetInfo?.targetContainer || container;
      const targetNode = targetInfo?.targetNode || null;
      const insertAfter = targetInfo?.insertAfter || false;
      const sourceContainer = table.parentElement as HTMLElement | null;

      const blockChildren = Array.from(targetContainer.children).filter(
        (child) => !child.hasAttribute("data-editor-ui") && child !== table
      );

      if (targetNode && targetNode !== table) {
        if (insertAfter) {
          targetContainer.insertBefore(table, targetNode.nextSibling);
        } else {
          targetContainer.insertBefore(table, targetNode);
        }
      } else if (!targetNode) {
        targetContainer.appendChild(table);
      }

      // Apply clamped horizontal position:
      table.style.marginLeft = `${latestClampedMarginLeft}px`;
      table.style.marginRight = "auto";

      // Apply clamped vertical position:
      const targetContainerRect = targetContainer.getBoundingClientRect();
      const compStyle = window.getComputedStyle(targetContainer);
      const padTop = parseFloat(compStyle.paddingTop) || 0;

      if (!targetNode || blockChildren.length === 0) {
        table.style.marginTop = `${latestClampedMarginTop}px`;
      } else if (insertAfter && targetNode === blockChildren[blockChildren.length - 1]) {
        const lastBlockBottom = (targetNode.getBoundingClientRect().bottom - targetContainerRect.top) / scale - padTop;
        const verticalGap = Math.max(0, Math.round(latestClampedMarginTop - lastBlockBottom));
        table.style.marginTop = `${verticalGap}px`;
      } else {
        table.style.marginTop = "0px";
      }

      dragTargetRef.current = null;

      // Synchronize source and destination pages
      if (sourceContainer && sourceContainer !== targetContainer) {
        if (!sourceContainer.innerHTML.trim() || sourceContainer.innerHTML.trim() === "<br>") {
          sourceContainer.innerHTML = "<p><br></p>";
        }

        const sourcePageId = sourceContainer.closest("section[data-page-id]")?.getAttribute("data-page-id");
        const destPageId = targetContainer.closest("section[data-page-id]")?.getAttribute("data-page-id");

        if (sourcePageId && setPageHtml) {
          setPageHtml(sourcePageId, sourceContainer.innerHTML);
        }
        if (destPageId && setPageHtml) {
          setPageHtml(destPageId, targetContainer.innerHTML);
        }
        if (destPageId && setActivePage) {
          setActivePage(destPageId);
        }

        sourceContainer.dispatchEvent(new Event("input", { bubbles: true }));
        targetContainer.dispatchEvent(new Event("input", { bubbles: true }));

        // Activate table on destination page and focus first cell
        onActivateTable?.(table);

        const cell = table.querySelector("td, th") as HTMLElement | null;
        if (cell) {
          cell.focus();
          try {
            const sel = window.getSelection();
            if (sel) {
              const range = document.createRange();
              range.selectNodeContents(cell);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          } catch {
            // ignore
          }
        }
      } else if (sourceContainer) {
        const pageId = sourceContainer.closest("section[data-page-id]")?.getAttribute("data-page-id");
        if (pageId && setPageHtml) {
          setPageHtml(pageId, sourceContainer.innerHTML);
        }
        sourceContainer.dispatchEvent(new Event("input", { bubbles: true }));

        onUpdate();
        onActivateTable?.(table);

        const cell = table.querySelector("td, th") as HTMLElement | null;
        if (cell) {
          cell.focus();
        }
      }

      updatePosition();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  /* ============================================================
     5. Quick AutoFit Actions ("fit the table")
     - Fit Page: exact available content width with distributed pixel columns
     - Fit Content: natural content widths clamped to available page width
     - Never locks future manual line or handle resizing
  ============================================================ */
  const handleAutoFitToWindow = () => {
    const compStyle = window.getComputedStyle(container);
    const padLeft = parseFloat(compStyle.paddingLeft) || 0;
    const padRight = parseFloat(compStyle.paddingRight) || 0;
    const availableContentWidth = Math.max(100, Math.round((container.clientWidth || 816) - (padLeft + padRight)));

    table.style.marginLeft = "0px";
    table.style.marginRight = "auto";
    table.style.width = `${availableContentWidth}px`;
    table.style.minWidth = "unset";
    table.style.maxWidth = `${availableContentWidth}px`;
    table.style.tableLayout = "fixed";

    const numCols = Math.max(
      ...Array.from(table.rows).map((r) => r.cells.length),
      1
    );
    const equalWidth = Math.floor(availableContentWidth / numCols);
    const remainder = availableContentWidth - equalWidth * numCols;

    Array.from(table.rows).forEach((row) => {
      Array.from(row.cells).forEach((cell, cIdx) => {
        const w = cIdx === numCols - 1 ? equalWidth + remainder : equalWidth;
        cell.style.width = `${w}px`;
        cell.style.minWidth = "20px";
        cell.style.boxSizing = "border-box";
      });
    });

    onUpdate();
    updatePosition();

    const pageContainer = table.closest('[contenteditable="true"]') as HTMLElement | null;
    if (pageContainer) {
      pageContainer.dispatchEvent(new Event("input", { bubbles: true }));
      const pageId = pageContainer.closest("section[data-page-id]")?.getAttribute("data-page-id");
      if (pageId && setPageHtml) {
        setPageHtml(pageId, pageContainer.innerHTML);
      }
    }
  };

  const handleAutoFitToContent = () => {
    const compStyle = window.getComputedStyle(container);
    const padLeft = parseFloat(compStyle.paddingLeft) || 0;
    const padRight = parseFloat(compStyle.paddingRight) || 0;
    const availableContentWidth = Math.max(100, Math.round((container.clientWidth || 816) - (padLeft + padRight)));

    // Clear existing fixed widths on table and cells so true natural content sizes can be measured
    table.style.tableLayout = "auto";
    table.style.width = "auto";
    table.style.minWidth = "unset";
    table.style.maxWidth = `${availableContentWidth}px`;

    const numCols = Math.max(...Array.from(table.rows).map((r) => r.cells.length), 1);

    // Clear inline widths so browser can calculate true content-based cell dimensions
    Array.from(table.rows).forEach((row) => {
      Array.from(row.cells).forEach((cell) => {
        cell.style.width = "auto";
        cell.style.minWidth = "unset";
      });
    });

    const naturalWidths: number[] = new Array(numCols).fill(36);

    Array.from(table.rows).forEach((row) => {
      Array.from(row.cells).forEach((cell, colIdx) => {
        const scrollW = cell.scrollWidth || cell.offsetWidth || 36;
        naturalWidths[colIdx] = Math.max(
          naturalWidths[colIdx],
          Math.min(availableContentWidth, Math.max(24, scrollW + 16))
        );
      });
    });

    let totalNatural = naturalWidths.reduce((a, b) => a + b, 0);

    // If total exceeds availableContentWidth, scale down proportionally
    if (totalNatural > availableContentWidth) {
      const ratio = availableContentWidth / totalNatural;
      naturalWidths.forEach((w, idx) => {
        naturalWidths[idx] = Math.max(20, Math.floor(w * ratio));
      });
      totalNatural = naturalWidths.reduce((a, b) => a + b, 0);
    }

    table.style.tableLayout = "fixed";
    table.style.width = `${totalNatural}px`;
    table.style.minWidth = "unset";
    table.style.maxWidth = `${availableContentWidth}px`;

    Array.from(table.rows).forEach((row) => {
      Array.from(row.cells).forEach((cell, colIdx) => {
        cell.style.width = `${naturalWidths[colIdx]}px`;
        cell.style.minWidth = "20px";
        cell.style.boxSizing = "border-box";
      });
    });

    onUpdate();
    updatePosition();

    const pageContainer = table.closest('[contenteditable="true"]') as HTMLElement | null;
    if (pageContainer) {
      pageContainer.dispatchEvent(new Event("input", { bubbles: true }));
      const pageId = pageContainer.closest("section[data-page-id]")?.getAttribute("data-page-id");
      if (pageId && setPageHtml) {
        setPageHtml(pageId, pageContainer.innerHTML);
      }
    }
  };


  if (!pos) return null;

  return (
    <>
      {/* Table Outline Highlight when Active */}
      <div
        data-editor-ui="true"
        contentEditable={false}
        className="pointer-events-none absolute z-20 print:hidden"
        style={{
          top: `${pos.top}px`,
          left: `${pos.left}px`,
          width: `${pos.width}px`,
          height: `${pos.height}px`,
          border: isResizing || isDragging ? "2px dashed #0078d4" : "1px solid rgba(0, 120, 212, 0.5)",
          borderRadius: "2px",
        }}
      />

      {/* Quick AutoFit Action Bar attached above the table */}
      {!isDragging && (
        <div
          data-editor-ui="true"
          data-table-control="autofit-badge"
          contentEditable={false}
          className="absolute z-30 flex items-center gap-1 -translate-y-full pb-1 text-[11px] font-medium print:hidden"
          style={{
            top: `${pos.top - 4}px`,
            left: `${pos.left + 28}px`,
          }}
        >
          <div className="flex items-center gap-0.5 rounded-md border border-slate-200/90 bg-white/95 px-1 py-0.5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-[#0b1623]/95">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleAutoFitToWindow}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="AutoFit Table to Page Margins (100%)"
            >
              <Maximize2 className="h-3 w-3 text-blue-500" />
              <span>Fit Page</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleAutoFitToContent}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="AutoFit Table to Content Snugly"
            >
              <Minimize2 className="h-3 w-3 text-amber-500" />
              <span>Fit Content</span>
            </button>

          </div>
        </div>
      )}

      {/* Top-Left Move Handle */}
      <div
        data-editor-ui="true"
        data-table-control="move"
        contentEditable={false}
        onPointerDown={handleMovePointerDown}
        title="Click and drag to move table across blocks or pages"
        className={`absolute z-30 flex h-6 w-6 -translate-x-3 -translate-y-3 cursor-move items-center justify-center rounded-md border shadow-md select-none transition-transform hover:scale-110 active:scale-95 print:hidden ${
          isDragging
            ? "bg-[#0078d4] text-white border-[#0078d4] ring-2 ring-blue-300"
            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        }`}
        style={{
          top: `${pos.top}px`,
          left: `${pos.left}px`,
        }}
      >
        <Move className="h-3.5 w-3.5" />
      </div>

      {/* Left-Edge Table Width Resize Handle */}
      {!isDragging && (
        <div
          data-editor-ui="true"
          data-table-control="left-resize"
          contentEditable={false}
          onPointerDown={handleLeftResizePointerDown}
          title="Drag to resize table width from the left"
          className="absolute z-20 flex -translate-x-1/2 cursor-ew-resize items-center justify-center group print:hidden"
          style={{
            top: `${pos.top}px`,
            left: `${pos.left}px`,
            width: "14px",
            height: `${pos.height}px`,
          }}
        >
          <div className="h-full w-[2px] transition-colors bg-transparent group-hover:bg-[#0078d4]/80" />
          <div className="absolute top-1/2 -translate-y-1/2 h-4 w-2 rounded-full border border-white bg-[#0078d4] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity dark:border-slate-900" />
        </div>
      )}

      {/* Interactive Vertical Column Divider Lines */}
      {!isDragging &&
        colDividers.map((col) => (
          <div
            key={`col-line-${col.colIndex}`}
            data-editor-ui="true"
            data-table-control="col-resize"
            contentEditable={false}
            onPointerDown={(e) => handleColResizePointerDown(e, col.colIndex, col.isLast)}
            title="Drag to resize column line"
            className="absolute z-20 flex -translate-x-1/2 cursor-col-resize items-center justify-center group print:hidden"
            style={{
              top: `${pos.top}px`,
              left: `${col.left}px`,
              width: "14px",
              height: `${pos.height}px`,
            }}
          >
            {/* Visual highlight line */}
            <div
              className={`h-full w-[2px] transition-colors ${
                activeColIndex === col.colIndex
                  ? "bg-[#0078d4] shadow-[0_0_8px_rgba(0,120,212,0.8)]"
                  : "bg-transparent group-hover:bg-[#0078d4]/80"
              }`}
            />
            {/* Top guide indicator pill */}
            <div
              className={`absolute top-0 h-3 w-2 rounded-full border border-white bg-[#0078d4] shadow-sm transition-opacity dark:border-slate-900 ${
                activeColIndex === col.colIndex ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            />
          </div>
        ))}

      {/* Right-Edge Table Width Resize Handle */}
      {!isDragging && (
        <div
          data-editor-ui="true"
          data-table-control="right-resize"
          contentEditable={false}
          onPointerDown={handleRightResizePointerDown}
          title="Drag to resize table width from the right"
          className="absolute z-20 flex -translate-x-1/2 cursor-ew-resize items-center justify-center group print:hidden"
          style={{
            top: `${pos.top}px`,
            left: `${pos.left + pos.width}px`,
            width: "14px",
            height: `${pos.height}px`,
          }}
        >
          <div className="h-full w-[2px] transition-colors bg-transparent group-hover:bg-[#0078d4]/80" />
          <div className="absolute top-1/2 -translate-y-1/2 h-4 w-2 rounded-full border border-white bg-[#0078d4] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity dark:border-slate-900" />
        </div>
      )}

      {/* Interactive Horizontal Row Divider Lines */}
      {!isDragging &&
        rowDividers.map((row) => (
          <div
            key={`row-line-${row.rowIndex}`}
            data-editor-ui="true"
            data-table-control="row-resize"
            contentEditable={false}
            onPointerDown={(e) => handleRowResizePointerDown(e, row.rowIndex)}
            title="Drag to resize row line"
            className="absolute z-20 flex -translate-y-1/2 cursor-row-resize items-center justify-center group print:hidden"
            style={{
              top: `${row.top}px`,
              left: `${pos.left}px`,
              width: `${pos.width}px`,
              height: "14px",
            }}
          >
            {/* Visual highlight line */}
            <div
              className={`w-full h-[2px] transition-colors ${
                activeRowIndex === row.rowIndex
                  ? "bg-[#0078d4] shadow-[0_0_8px_rgba(0,120,212,0.8)]"
                  : "bg-transparent group-hover:bg-[#0078d4]/80"
              }`}
            />
            {/* Left guide indicator pill */}
            <div
              className={`absolute left-0 h-2 w-3 rounded-full border border-white bg-[#0078d4] shadow-sm transition-opacity dark:border-slate-900 ${
                activeRowIndex === row.rowIndex ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            />
          </div>
        ))}

      {/* Bottom-Right Resize Handle */}
      {!isDragging && (
        <div
          data-editor-ui="true"
          data-table-control="resize"
          contentEditable={false}
          onPointerDown={handleResizePointerDown}
          title="Drag to resize table (both width & height, small & large)"
          className={`absolute z-30 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize rounded-sm border-2 border-white bg-[#0078d4] shadow-md select-none transition-transform hover:scale-125 print:hidden dark:border-slate-900 ${
            isResizing ? "scale-125 bg-blue-600 ring-2 ring-blue-300" : ""
          }`}
          style={{
            top: `${pos.top + pos.height}px`,
            left: `${pos.left + pos.width}px`,
          }}
        />
      )}

      {/* Dimension Badge when Resizing */}
      {isResizing && resizeDimensions && (
        <div
          data-editor-ui="true"
          className="absolute z-30 -translate-x-1/2 rounded bg-slate-900/90 px-2 py-1 text-[10px] font-semibold text-white shadow-md backdrop-blur-sm print:hidden dark:bg-slate-100 dark:text-slate-900"
          style={{
            top: `${pos.top + pos.height + 8}px`,
            left: `${pos.left + pos.width}px`,
          }}
        >
          {resizeDimensions.width}px × {resizeDimensions.height}px
        </div>
      )}

      {/* Floating Drag Preview Ghost attached to cursor across pages */}
      {isDragging && dragPreview && createPortal(
        <div
          data-editor-ui="true"
          className="fixed pointer-events-none z-[9999] rounded-md border-2 border-[#0078d4] bg-white/90 p-2 shadow-2xl backdrop-blur-sm print:hidden"
          style={{
            left: `${dragPreview.x}px`,
            top: `${dragPreview.y}px`,
            width: `${dragPreview.width}px`,
            height: `${Math.min(dragPreview.height, 160)}px`,
            overflow: "hidden",
            transform: "scale(0.95)",
            boxShadow: "0 12px 36px rgba(0, 120, 212, 0.25)",
          }}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0078d4] mb-1">
            <Move className="h-3.5 w-3.5" />
            <span>Moving Table (Drop to place)</span>
          </div>
          <div
            className="pointer-events-none opacity-80"
            dangerouslySetInnerHTML={{ __html: table.outerHTML }}
          />
        </div>,
        document.body
      )}

      {/* Live Drop Insertion Guide Line across pages */}
      {isDragging && dropIndicator && createPortal(
        <div
          data-editor-ui="true"
          className="fixed pointer-events-none z-[9998] h-1.5 rounded-full bg-[#0078d4] shadow-lg ring-2 ring-blue-400/50 print:hidden"
          style={{
            top: `${dropIndicator.top}px`,
            left: `${dropIndicator.left}px`,
            width: `${dropIndicator.width}px`,
          }}
        />,
        document.body
      )}
    </>
  );
}

export default TableControlsOverlay;
