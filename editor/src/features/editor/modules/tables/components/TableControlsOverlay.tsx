/**
 * --------------------------------------------------------
 * Module: Tables
 * Feature: TableControlsOverlay Component
 * Description:
 * Word-style external UI handles (Move & Resize) rendered as an overlay
 * outside contentEditable DOM to avoid contaminating saved/exported document HTML.
 * Supports smooth bidirectional resizing (shrinking & growing up to page width)
 * and full-table drag-and-drop between document blocks and across multiple document pages.
 * --------------------------------------------------------
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Move } from "lucide-react";
import { useDocumentModel } from "@/features/editor/store/documentModel";

interface TableControlsOverlayProps {
  table: HTMLTableElement;
  container: HTMLElement;
  zoom: number;
  onUpdate: () => void;
}

interface TablePosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TableControlsOverlay({
  table,
  container,
  zoom,
  onUpdate,
}: TableControlsOverlayProps) {
  const { setPageHtml } = useDocumentModel();

  const [pos, setPos] = useState<TablePosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dropIndicatorY, setDropIndicatorY] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);

  const dragTargetRef = useRef<{
    container: HTMLElement;
    targetNode: Element | null;
    insertAfter: boolean;
  } | null>(null);

  const scale = zoom / 100;

  // Calculate table position relative to container
  const updatePosition = useCallback(() => {
    if (!table.isConnected || !container.isConnected) {
      setPos(null);
      return;
    }

    const tableRect = table.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setPos({
      top: (tableRect.top - containerRect.top) / scale,
      left: (tableRect.left - containerRect.left) / scale,
      width: tableRect.width / scale,
      height: tableRect.height / scale,
    });
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
     Table Resize Handler (Smooth Bidirectional Shrink & Grow)
  ============================================================ */
  const handleResizePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startTableWidth = table.getBoundingClientRect().width / scale;

    // Calculate maximum available document content width
    const computedStyle = window.getComputedStyle(container);
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 72;
    const paddingRight = parseFloat(computedStyle.paddingRight) || 72;
    const maxWidth = (container.clientWidth || 816) - (paddingLeft + paddingRight);
    const minWidth = 120;

    setIsResizing(true);
    document.body.style.cursor = "nwse-resize";
    document.body.style.userSelect = "none";

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const deltaX = (moveEv.clientX - startX) / scale;
      const targetWidth = Math.min(
        maxWidth,
        Math.max(minWidth, Math.round(startTableWidth + deltaX))
      );

      table.style.width = `${targetWidth}px`;
      table.style.minWidth = `${targetWidth}px`;
      table.style.maxWidth = "100%";

      setPos((prev) => (prev ? { ...prev, width: targetWidth } : null));
    };

    const onPointerUp = (upEv: PointerEvent) => {
      upEv.preventDefault();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      setIsResizing(false);

      const pageId = container.closest("section[data-page-id]")?.getAttribute("data-page-id");
      if (pageId && setPageHtml) {
        setPageHtml(pageId, container.innerHTML);
      }
      container.dispatchEvent(new Event("input", { bubbles: true }));

      updatePosition();
      onUpdate();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  /* ============================================================
     Table Move (Drag & Drop across blocks and across multiple pages)
  ============================================================ */
  const handleMovePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const startPointerX = e.clientX;
    const startPointerY = e.clientY;

    setIsDragging(true);
    setDragOffset({ x: 0, y: 0 });
    document.body.style.cursor = "move";
    document.body.style.userSelect = "none";

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();

      const deltaX = (moveEv.clientX - startPointerX) / scale;
      const deltaY = (moveEv.clientY - startPointerY) / scale;
      setDragOffset({ x: deltaX, y: deltaY });

      const containerRect = container.getBoundingClientRect();
      const pointerY = moveEv.clientY;

      // Find which page section the pointer is currently over or closest to
      const allPageSections = Array.from(
        document.querySelectorAll<HTMLElement>("section[data-page-id]")
      );

      let targetSection: HTMLElement | null = null;
      let minSectionDist = Infinity;

      for (const sec of allPageSections) {
        const secRect = sec.getBoundingClientRect();
        if (pointerY >= secRect.top - 20 && pointerY <= secRect.bottom + 20) {
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

      // Find all top-level block children of the target container
      const blockChildren = Array.from(targetContainer.children).filter(
        (child) => !child.hasAttribute("data-editor-ui") && child !== table
      );

      if (blockChildren.length === 0) {
        dragTargetRef.current = {
          container: targetContainer,
          targetNode: null,
          insertAfter: true,
        };
        const targetRect = targetContainer.getBoundingClientRect();
        setDropIndicatorY((targetRect.top + 20 - containerRect.top) / scale);
        return;
      }

      // Check if pointer is above the first element
      const firstRect = blockChildren[0].getBoundingClientRect();
      if (pointerY < firstRect.top + firstRect.height / 3) {
        dragTargetRef.current = {
          container: targetContainer,
          targetNode: blockChildren[0],
          insertAfter: false,
        };
        setDropIndicatorY((firstRect.top - containerRect.top) / scale);
        return;
      }

      // Check if pointer is below the last element
      const lastRect = blockChildren[blockChildren.length - 1].getBoundingClientRect();
      if (pointerY > lastRect.bottom - lastRect.height / 3) {
        dragTargetRef.current = {
          container: targetContainer,
          targetNode: blockChildren[blockChildren.length - 1],
          insertAfter: true,
        };
        setDropIndicatorY((lastRect.bottom - containerRect.top) / scale);
        return;
      }

      // Find closest element
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
          container: targetContainer,
          targetNode: closestChild,
          insertAfter,
        };

        const blockRect = closestChild.getBoundingClientRect();
        const indicatorY = insertAfter
          ? (blockRect.bottom - containerRect.top) / scale
          : (blockRect.top - containerRect.top) / scale;

        setDropIndicatorY(indicatorY);
      } else {
        dragTargetRef.current = null;
        setDropIndicatorY(null);
      }
    };

    const onPointerUp = (upEv: PointerEvent) => {
      upEv.preventDefault();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      setIsDragging(false);
      setDragOffset(null);
      setDropIndicatorY(null);

      if (dragTargetRef.current) {
        const { container: destContainer, targetNode, insertAfter } = dragTargetRef.current;
        const sourceContainer = table.parentElement as HTMLElement | null;

        if (targetNode) {
          if (insertAfter) {
            destContainer.insertBefore(table, targetNode.nextSibling);
          } else {
            destContainer.insertBefore(table, targetNode);
          }
        } else {
          destContainer.appendChild(table);
        }

        dragTargetRef.current = null;

        // Synchronize source and destination pages
        if (sourceContainer && sourceContainer !== destContainer) {
          const sourcePageId = sourceContainer.closest("section[data-page-id]")?.getAttribute("data-page-id");
          const destPageId = destContainer.closest("section[data-page-id]")?.getAttribute("data-page-id");

          if (sourcePageId && setPageHtml) {
            setPageHtml(sourcePageId, sourceContainer.innerHTML);
          }
          if (destPageId && setPageHtml) {
            setPageHtml(destPageId, destContainer.innerHTML);
          }

          sourceContainer.dispatchEvent(new Event("input", { bubbles: true }));
          destContainer.dispatchEvent(new Event("input", { bubbles: true }));
        } else if (sourceContainer) {
          const pageId = sourceContainer.closest("section[data-page-id]")?.getAttribute("data-page-id");
          if (pageId && setPageHtml) {
            setPageHtml(pageId, sourceContainer.innerHTML);
          }
          sourceContainer.dispatchEvent(new Event("input", { bubbles: true }));
          onUpdate();
        }

        updatePosition();
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  if (!pos) return null;

  const currentLeft = pos.left + (dragOffset ? dragOffset.x : 0);
  const currentTop = pos.top + (dragOffset ? dragOffset.y : 0);

  return (
    <>
      {/* Table Outline Highlight when Active / Resizing / Dragging */}
      <div
        data-editor-ui="true"
        contentEditable={false}
        className={`pointer-events-none absolute z-20 transition-all ${
          isDragging ? "opacity-70 bg-blue-500/10" : "opacity-100"
        }`}
        style={{
          top: `${currentTop}px`,
          left: `${currentLeft}px`,
          width: `${pos.width}px`,
          height: `${pos.height}px`,
          border: isResizing || isDragging ? "2px dashed #0078d4" : "1px solid rgba(0, 120, 212, 0.5)",
          borderRadius: "2px",
        }}
      />

      {/* Top-Left Move Handle */}
      <div
        data-editor-ui="true"
        contentEditable={false}
        onPointerDown={handleMovePointerDown}
        title="Click and drag to move table across blocks or pages"
        className={`absolute z-30 flex h-6 w-6 -translate-x-3 -translate-y-3 cursor-move items-center justify-center rounded-md border shadow-md select-none transition-transform hover:scale-110 active:scale-95 ${
          isDragging
            ? "bg-[#0078d4] text-white border-[#0078d4] ring-2 ring-blue-300"
            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        }`}
        style={{
          top: `${currentTop}px`,
          left: `${currentLeft}px`,
        }}
      >
        <Move className="h-3.5 w-3.5" />
      </div>

      {/* Bottom-Right Resize Handle */}
      {!isDragging && (
        <div
          data-editor-ui="true"
          contentEditable={false}
          onPointerDown={handleResizePointerDown}
          title="Drag to resize table width (left: shrink, right: grow)"
          className={`absolute z-30 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize rounded-sm border-2 border-white bg-[#0078d4] shadow-md select-none transition-transform hover:scale-125 dark:border-slate-900 ${
            isResizing ? "scale-125 bg-blue-600 ring-2 ring-blue-300" : ""
          }`}
          style={{
            top: `${pos.top + pos.height}px`,
            left: `${pos.left + pos.width}px`,
          }}
        />
      )}

      {/* Live Drop Insertion Guide Line */}
      {isDragging && dropIndicatorY !== null && (
        <div
          data-editor-ui="true"
          contentEditable={false}
          className="pointer-events-none absolute left-0 z-40 h-1.5 w-full rounded-full bg-[#0078d4] shadow-lg ring-2 ring-blue-400/40"
          style={{
            top: `${dropIndicatorY}px`,
          }}
        />
      )}
    </>
  );
}
