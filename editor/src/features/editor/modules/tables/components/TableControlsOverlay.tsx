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
import { Move, Maximize2, Minimize2, Columns } from "lucide-react";
import { useDocumentModel } from "@/features/editor/store/documentModel";

interface TableControlsOverlayProps {
  table: HTMLTableElement;
  container: HTMLElement;
  zoom: number;
  onUpdate: () => void;
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

  // Calculate table position, column divider positions, and row divider positions relative to container
  const updatePosition = useCallback(() => {
    if (!table.isConnected || !container.isConnected) {
      setPos(null);
      setColDividers([]);
      setRowDividers([]);
      return;
    }

    const tableRect = table.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const top = (tableRect.top - containerRect.top) / scale;
    const left = (tableRect.left - containerRect.left) / scale;
    const width = tableRect.width / scale;
    const height = tableRect.height / scale;

    setPos({ top, left, width, height });

    // Calculate vertical column divider positions
    const firstRow = table.rows[0];
    if (firstRow && firstRow.cells.length > 0) {
      const dividers: ColDivider[] = [];
      const cells = Array.from(firstRow.cells);
      for (let i = 0; i < cells.length; i++) {
        const cRect = cells[i].getBoundingClientRect();
        const dividerLeft = (cRect.right - containerRect.left) / scale;
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

    // Calculate horizontal row divider positions
    if (table.rows.length > 1) {
      const rDividers: RowDivider[] = [];
      const rows = Array.from(table.rows);
      for (let i = 0; i < rows.length - 1; i++) {
        const rRect = rows[i].getBoundingClientRect();
        const dividerTop = (rRect.bottom - containerRect.top) / scale;
        rDividers.push({ rowIndex: i, top: dividerTop });
      }
      setRowDividers(rDividers);
    } else {
      setRowDividers([]);
    }
  }, [table, container, scale]);

  useEffect(() => {
    updatePosition();

    const observer = new ResizeObserver(() => {
      updatePosition();
    });
    observer.observe(table);
    observer.observe(container);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [table, container, updatePosition]);

  /* ============================================================
     1. Column Lines Extend ("in the table lines extand")
     - Dragging vertical column dividers between columns
     - Dragging the right edge of last column resizes table width
  ============================================================ */
  const handleColResizePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    colIndex: number,
    isLast?: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const startPointerX = e.clientX;
    const firstRow = table.rows[0];
    if (!firstRow) return;

    if (isLast) {
      const lastCell = firstRow.cells[colIndex];
      if (!lastCell) return;
      const startCellWidth = lastCell.getBoundingClientRect().width / scale;
      const startTableWidth = table.getBoundingClientRect().width / scale;

      const compStyle = window.getComputedStyle(container);
      const padLeft = parseFloat(compStyle.paddingLeft) || 72;
      const padRight = parseFloat(compStyle.paddingRight) || 72;
      const totalContentWidth = Math.round((container.clientWidth || 816) - (padLeft + padRight));
      const currentMarginLeft = parseFloat(table.style.marginLeft) || 0;
      const maxAvailableWidth = Math.max(80, totalContentWidth - currentMarginLeft);

      setActiveColIndex(colIndex);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      table.style.tableLayout = "fixed";

      const onPointerMove = (moveEv: PointerEvent) => {
        moveEv.preventDefault();
        const deltaX = (moveEv.clientX - startPointerX) / scale;
        const newTableWidth = Math.min(
          maxAvailableWidth,
          Math.max(80, Math.round(startTableWidth + deltaX))
        );
        const newCellWidth = Math.max(28, Math.round(startCellWidth + (newTableWidth - startTableWidth)));

        table.style.width = `${newTableWidth}px`;
        table.style.minWidth = `${newTableWidth}px`;
        table.style.maxWidth = `${totalContentWidth}px`;

        for (let r = 0; r < table.rows.length; r++) {
          if (table.rows[r].cells[colIndex]) {
            table.rows[r].cells[colIndex].style.width = `${newCellWidth}px`;
          }
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

        onUpdate();
        updatePosition();
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
      return;
    }

    const leftCell = firstRow.cells[colIndex];
    const rightCell = firstRow.cells[colIndex + 1];
    if (!leftCell || !rightCell) return;

    const leftRect = leftCell.getBoundingClientRect();
    const rightRect = rightCell.getBoundingClientRect();
    const startLeftWidth = leftRect.width / scale;
    const startRightWidth = rightRect.width / scale;
    const totalColsWidth = startLeftWidth + startRightWidth;

    const minColWidth = 28;

    setActiveColIndex(colIndex);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    table.style.tableLayout = "fixed";

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const deltaX = (moveEv.clientX - startPointerX) / scale;

      const newLeft = Math.max(
        minColWidth,
        Math.min(totalColsWidth - minColWidth, Math.round(startLeftWidth + deltaX))
      );
      const newRight = totalColsWidth - newLeft;

      for (let r = 0; r < table.rows.length; r++) {
        const rowCells = table.rows[r].cells;
        if (rowCells[colIndex]) {
          rowCells[colIndex].style.width = `${newLeft}px`;
        }
        if (rowCells[colIndex + 1]) {
          rowCells[colIndex + 1].style.width = `${newRight}px`;
        }
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

      onUpdate();
      updatePosition();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  /* ============================================================
     2. Row Lines Extend (Row height adjusting)
  ============================================================ */
  const handleRowResizePointerDown = (e: React.PointerEvent<HTMLDivElement>, rowIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    const startPointerY = e.clientY;
    const row = table.rows[rowIndex];
    if (!row) return;

    const startRowHeight = row.getBoundingClientRect().height / scale;
    const minRowHeight = 22;

    setActiveRowIndex(rowIndex);
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const deltaY = (moveEv.clientY - startPointerY) / scale;
      const newHeight = Math.max(minRowHeight, Math.round(startRowHeight + deltaY));

      row.style.height = `${newHeight}px`;
      Array.from(row.cells).forEach((c) => {
        c.style.height = `${newHeight}px`;
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
      setActiveRowIndex(null);

      onUpdate();
      updatePosition();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  /* ============================================================
     3. Table Resize Handler (Bidirectional Shrinking & Growing: Small & Large)
     - Allows dragging corner to scale both width and height
     - Proportional column distribution ensures table doesn't jam
  ============================================================ */
  const handleResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const startPointerX = e.clientX;
    const startPointerY = e.clientY;
    const startTableWidth = table.getBoundingClientRect().width / scale;
    const startTableHeight = table.getBoundingClientRect().height / scale;

    const computedStyle = window.getComputedStyle(container);
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 72;
    const paddingRight = parseFloat(computedStyle.paddingRight) || 72;
    const totalContentWidth = Math.round((container.clientWidth || 816) - (paddingLeft + paddingRight));
    const currentMarginLeft = parseFloat(table.style.marginLeft) || 0;
    const maxAvailableWidth = Math.max(80, totalContentWidth - currentMarginLeft);
    const minTableWidth = 80;
    const minTableHeight = 40;

    const firstRowCells = table.rows[0] ? Array.from(table.rows[0].cells) : [];
    const startColWidths = firstRowCells.map((c) => c.getBoundingClientRect().width / scale);

    const tableRows = Array.from(table.rows);
    const startRowHeights = tableRows.map((r) => r.getBoundingClientRect().height / scale);

    setIsResizing(true);
    document.body.style.cursor = "nwse-resize";
    document.body.style.userSelect = "none";
    table.style.tableLayout = "fixed";

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const deltaX = (moveEv.clientX - startPointerX) / scale;
      const deltaY = (moveEv.clientY - startPointerY) / scale;

      const targetWidth = Math.min(
        maxAvailableWidth,
        Math.max(minTableWidth, Math.round(startTableWidth + deltaX))
      );
      const targetHeight = Math.min(
        950,
        Math.max(minTableHeight, Math.round(startTableHeight + deltaY))
      );

      table.style.width = `${targetWidth}px`;
      table.style.minWidth = `${targetWidth}px`;
      table.style.maxWidth = `${totalContentWidth}px`;

      // Scale columns proportionally so shrinking down small and growing large is smooth
      if (startTableWidth > 0 && firstRowCells.length > 0) {
        const widthRatio = targetWidth / startTableWidth;
        firstRowCells.forEach((_, colIdx) => {
          const scaledColWidth = Math.max(20, Math.round(startColWidths[colIdx] * widthRatio));
          for (let r = 0; r < table.rows.length; r++) {
            if (table.rows[r].cells[colIdx]) {
              table.rows[r].cells[colIdx].style.width = `${scaledColWidth}px`;
            }
          }
        });
      }

      // Scale rows proportionally so vertical height expansion works
      if (Math.abs(deltaY) > 2 && startTableHeight > 0) {
        const heightRatio = targetHeight / startTableHeight;
        tableRows.forEach((row, rowIdx) => {
          const scaledRowHeight = Math.max(20, Math.round(startRowHeights[rowIdx] * heightRatio));
          row.style.height = `${scaledRowHeight}px`;
          Array.from(row.cells).forEach((c) => {
            c.style.height = `${scaledRowHeight}px`;
          });
        });
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

      setIsResizing(false);
      setResizeDimensions(null);

      onUpdate();
      updatePosition();
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

    const startPointerX = e.clientX;
    const startPointerY = e.clientY;
    const tableRect = table.getBoundingClientRect();
    const grabOffsetX = startPointerX - tableRect.left;
    const grabOffsetY = startPointerY - tableRect.top;
    const startMarginLeft = parseFloat(table.style.marginLeft) || 0;

    setIsDragging(true);
    setDragPreview({
      x: tableRect.left,
      y: tableRect.top,
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

      const viewportHeight = window.innerHeight;
      const scrollThreshold = 90;
      let scrollSpeed = 0;

      if (clientY < scrollThreshold) {
        const factor = (scrollThreshold - clientY) / scrollThreshold;
        scrollSpeed = -Math.max(6, Math.round(factor * 18));
      } else if (clientY > viewportHeight - scrollThreshold) {
        const factor = (clientY - (viewportHeight - scrollThreshold)) / scrollThreshold;
        scrollSpeed = Math.max(6, Math.round(factor * 18));
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
      const padLeft = parseFloat(compStyle.paddingLeft) || 72;
      const padRight = parseFloat(compStyle.paddingRight) || 72;
      const contentWidth = Math.max(100, Math.round((targetContainer.clientWidth || 816) - (padLeft + padRight)));
      const tableWidth = Math.round(tableRect.width / scale);

      // Horizontal edge clamping:
      // At the left edge: margin is 0 (aligns with text left edge, 72px from paper left, never goes outside)
      // At the right edge: margin is contentWidth - tableWidth (never goes outside right margin)
      const maxMarginLeft = Math.max(0, contentWidth - tableWidth);
      const deltaX = (moveEv.clientX - startPointerX) / scale;
      const targetMarginLeft = Math.round(startMarginLeft + deltaX);
      const clampedMarginLeft = Math.max(0, Math.min(maxMarginLeft, targetMarginLeft));
      latestClampedMarginLeft = clampedMarginLeft;

      // Ghost preview position locked strictly within document boundaries
      const ghostLeft = targetContainerRect.left + (padLeft + clampedMarginLeft) * scale;
      const ghostTop = moveEv.clientY - grabOffsetY;

      setDragPreview({
        x: ghostLeft,
        y: ghostTop,
        width: tableRect.width,
        height: tableRect.height,
      });

      // Top-level block children of target container
      const blockChildren = Array.from(targetContainer.children).filter(
        (child) => !child.hasAttribute("data-editor-ui") && child !== table
      );

      const indicatorWidth = Math.min(tableRect.width, contentWidth * scale);

      if (blockChildren.length === 0) {
        dragTargetRef.current = {
          targetContainer,
          targetNode: null,
          insertAfter: true,
        };
        setDropIndicator({
          top: targetContainerRect.top + 28,
          left: ghostLeft,
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
          left: ghostLeft,
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
        setDropIndicator({
          top: lastRect.bottom + 4,
          left: ghostLeft,
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
          left: ghostLeft,
          width: indicatorWidth,
        });
      } else {
        dragTargetRef.current = null;
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

      if (dragTargetRef.current) {
        const { targetContainer, targetNode, insertAfter } = dragTargetRef.current;
        const sourceContainer = table.parentElement as HTMLElement | null;

        if (targetNode) {
          if (insertAfter) {
            targetContainer.insertBefore(table, targetNode.nextSibling);
          } else {
            targetContainer.insertBefore(table, targetNode);
          }
        } else {
          targetContainer.appendChild(table);
        }

        // Apply clamped horizontal position:
        table.style.marginLeft = `${latestClampedMarginLeft}px`;
        table.style.marginRight = "auto";

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

          onDeactivateTable?.();

          // Automatically focus first cell in destination table so controls remount on dest page
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
          onUpdate();

          const cell = table.querySelector("td, th") as HTMLElement | null;
          if (cell) {
            cell.focus();
          }
        }

        updatePosition();
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  /* ============================================================
     5. Quick AutoFit Actions ("fit the table")
  ============================================================ */
  const handleAutoFitToWindow = () => {
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

    onUpdate();
    updatePosition();
  };

  const handleAutoFitToContent = () => {
    table.style.width = "auto";
    table.style.minWidth = "unset";
    table.style.maxWidth = "100%";
    table.style.tableLayout = "auto";

    Array.from(table.rows).forEach((row) => {
      Array.from(row.cells).forEach((cell) => {
        cell.style.width = "auto";
      });
    });

    onUpdate();
    updatePosition();
  };

  const handleDistributeCols = () => {
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

    onUpdate();
    updatePosition();
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
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleDistributeCols}
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Distribute Columns Evenly"
            >
              <Columns className="h-3 w-3 text-indigo-500" />
              <span>Equal Cols</span>
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

      {/* Interactive Vertical Column Divider Lines ("in the table lines extand") */}
      {!isDragging &&
        colDividers.map((col) => (
          <div
            key={`col-line-${col.colIndex}`}
            data-editor-ui="true"
            data-table-control="col-resize"
            contentEditable={false}
            onPointerDown={(e) => handleColResizePointerDown(e, col.colIndex, col.isLast)}
            title="Drag to extend / resize column line"
            className="absolute z-30 flex -translate-x-1/2 cursor-col-resize items-center justify-center group print:hidden"
            style={{
              top: `${pos.top}px`,
              left: `${col.left}px`,
              width: "12px",
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

      {/* Interactive Horizontal Row Divider Lines */}
      {!isDragging &&
        rowDividers.map((row) => (
          <div
            key={`row-line-${row.rowIndex}`}
            data-editor-ui="true"
            data-table-control="row-resize"
            contentEditable={false}
            onPointerDown={(e) => handleRowResizePointerDown(e, row.rowIndex)}
            title="Drag to extend / resize row height"
            className="absolute z-30 flex -translate-y-1/2 cursor-row-resize items-center justify-center group print:hidden"
            style={{
              top: `${row.top}px`,
              left: `${pos.left}px`,
              width: `${pos.width}px`,
              height: "12px",
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
