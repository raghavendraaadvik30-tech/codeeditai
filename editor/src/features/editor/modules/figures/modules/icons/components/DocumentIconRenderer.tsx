import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { Trash2, RotateCw } from "lucide-react";

export interface IconConfig {
  id: string;
  icon: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotate?: number;
  color?: string;
  alignment?: "left" | "center" | "right";
  caption?: string;
}

interface DocumentIconRendererProps {
  config: IconConfig;
  figureEl: HTMLElement;
  onDelete?: () => void;
}

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export default function DocumentIconRenderer({
  config,
  figureEl,
  onDelete,
}: DocumentIconRendererProps) {
  const [x, setX] = useState<number>(config.x || 0);
  const [y, setY] = useState<number>(config.y || 0);
  const [width, setWidth] = useState<number>(config.width || 64);
  const [height, setHeight] = useState<number>(config.height || config.width || 64);
  const [rotate, setRotate] = useState<number>(config.rotate || 0);
  const color = "#000000";
  const [isSelected, setIsSelected] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Ensure DOM config has color set to black
  useEffect(() => {
    if (config.color !== "#000000") {
      updateDOMConfig({ color: "#000000" });
    }
  }, [config.color]);

  // Synchronize figure element styles (position, transform, dimensions)
  useEffect(() => {
    figureEl.style.width = `${width}px`;
    figureEl.style.height = `${height}px`;
    figureEl.style.position = "relative";
    figureEl.style.display = "inline-block";
    figureEl.style.transform = `translate(${x}px, ${y}px)`;
  }, [width, height, x, y, figureEl]);

  // Pointer listener on figure element to select icon when clicked
  useEffect(() => {
    const handleFigurePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest("figcaption") ||
          target.closest("button") ||
          target.closest("input"))
      ) {
        return;
      }
      setIsSelected(true);
    };

    figureEl.addEventListener("pointerdown", handleFigurePointerDown);
    return () => {
      figureEl.removeEventListener("pointerdown", handleFigurePointerDown);
    };
  }, [figureEl]);

  // Click outside listener to deselect icon
  useEffect(() => {
    if (!isSelected) return;

    const handlePointerDownOutside = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !figureEl.contains(target)
      ) {
        setIsSelected(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDownOutside);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDownOutside);
    };
  }, [isSelected, figureEl]);

  const updateDOMConfig = (updates: Partial<IconConfig>) => {
    try {
      const raw = figureEl.getAttribute("data-icon-config");
      const current = raw ? JSON.parse(decodeURIComponent(raw)) : {};
      const updated = { ...current, ...updates };
      figureEl.setAttribute("data-icon-config", encodeURIComponent(JSON.stringify(updated)));
    } catch {
      // ignore
    }
  };

  const notifyDocumentChange = () => {
    const pageContainer = figureEl.closest('[contenteditable="true"]');
    if (pageContainer) {
      pageContainer.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  // Helper to get workspace zoom/scale factor dynamically
  const getWorkspaceScale = (): number => {
    const pageSection = figureEl.closest("section[data-page-id]") as HTMLElement | null;
    if (!pageSection) return 1;
    const rect = pageSection.getBoundingClientRect();
    const offsetWidth = pageSection.offsetWidth;
    if (offsetWidth > 0 && rect.width > 0) {
      return rect.width / offsetWidth;
    }
    return 1;
  };

  // Right-click context menu listener on figure element
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsSelected(true);
      setContextMenuPos({ x: e.clientX, y: e.clientY });
    };

    figureEl.addEventListener("contextmenu", handleContextMenu);
    return () => {
      figureEl.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [figureEl]);

  // Close context menu on outside click or escape
  useEffect(() => {
    if (!contextMenuPos) return;

    const handlePointerDown = () => {
      setContextMenuPos(null);
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setContextMenuPos(null);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [contextMenuPos]);

  // Keyboard Delete & Backspace listener when icon is selected
  useEffect(() => {
    if (!isSelected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        e.stopPropagation();
        handleDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isSelected, figureEl, onDelete]);

  const handleDelete = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsSelected(false);
    setContextMenuPos(null);

    if (onDelete) {
      onDelete();
    } else {
      const pageContainer = figureEl.closest('[contenteditable="true"]') as HTMLElement | null;
      figureEl.remove();
      if (pageContainer) {
        pageContainer.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  };

  const handleSizeChange = (delta: number) => {
    const newW = Math.max(24, Math.min(600, width + delta));
    const newH = Math.max(24, Math.min(600, height + delta));
    setWidth(newW);
    setHeight(newH);
    figureEl.style.width = `${newW}px`;
    figureEl.style.height = `${newH}px`;
    updateDOMConfig({ width: newW, height: newH });
    notifyDocumentChange();
  };

  // Pointer drag & move handler on icon body
  const handleDragPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;

    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Ignore drag start on interactive handles, buttons, inputs
    if (
      target.closest("button") ||
      target.closest("figcaption") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest(".resize-handle") ||
      target.closest(".rotate-handle") ||
      target.closest('[data-editor-ui="true"]')
    ) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    setIsSelected(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = x;
    const initialY = y;
    const scale = getWorkspaceScale();

    let isDraggingStarted = false;

    const targetEl = e.currentTarget;
    const pointerId = e.pointerId;

    try {
      targetEl.setPointerCapture(pointerId);
    } catch {
      // ignore
    }

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();

      const deltaScreenX = moveEv.clientX - startX;
      const deltaScreenY = moveEv.clientY - startY;

      if (!isDraggingStarted && Math.hypot(deltaScreenX, deltaScreenY) > 2) {
        isDraggingStarted = true;
        document.body.style.cursor = "move";
        document.body.style.userSelect = "none";
      }

      if (!isDraggingStarted) return;

      const deltaX = Math.round(deltaScreenX / scale);
      const deltaY = Math.round(deltaScreenY / scale);

      const newX = initialX + deltaX;
      const newY = initialY + deltaY;

      setX(newX);
      setY(newY);

      figureEl.style.transform = `translate(${newX}px, ${newY}px)`;
      updateDOMConfig({ x: newX, y: newY });
    };

    const onPointerUp = (upEv: PointerEvent) => {
      upEv.preventDefault();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      try {
        if (targetEl && targetEl.hasPointerCapture(pointerId)) {
          targetEl.releasePointerCapture(pointerId);
        }
      } catch {
        // ignore
      }

      document.body.style.cursor = "";
      document.body.style.userSelect = "";

      if (isDraggingStarted) {
        notifyDocumentChange();
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  // 8 Interactive resize handles with anchor corner stability
  const handleResizePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    handle: ResizeHandle
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSelected(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = width;
    const startH = height;
    const startXPos = x;
    const startYPos = y;
    const scale = getWorkspaceScale();

    const minW = 24;
    const minH = 24;

    const targetEl = e.currentTarget;
    const pointerId = e.pointerId;

    try {
      targetEl.setPointerCapture(pointerId);
    } catch {
      // ignore
    }

    document.body.style.userSelect = "none";

    let curW = startW;
    let curH = startH;
    let curX = startXPos;
    let curY = startYPos;

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const deltaX = Math.round((moveEv.clientX - startX) / scale);
      const deltaY = Math.round((moveEv.clientY - startY) / scale);

      let newW = startW;
      let newH = startH;
      let newX = startXPos;
      let newY = startYPos;

      if (handle.includes("e")) {
        newW = Math.max(minW, startW + deltaX);
      } else if (handle.includes("w")) {
        newW = Math.max(minW, startW - deltaX);
        newX = startXPos + (startW - newW);
      }

      if (handle.includes("s")) {
        newH = Math.max(minH, startH + deltaY);
      } else if (handle.includes("n")) {
        newH = Math.max(minH, startH - deltaY);
        newY = startYPos + (startH - newH);
      }

      curW = newW;
      curH = newH;
      curX = newX;
      curY = newY;

      setWidth(newW);
      setHeight(newH);
      setX(newX);
      setY(newY);

      figureEl.style.width = `${newW}px`;
      figureEl.style.height = `${newH}px`;
      figureEl.style.transform = `translate(${newX}px, ${newY}px)`;
      updateDOMConfig({ width: newW, height: newH, x: newX, y: newY });
    };

    const onPointerUp = (upEv: PointerEvent) => {
      upEv.preventDefault();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      try {
        if (targetEl && targetEl.hasPointerCapture(pointerId)) {
          targetEl.releasePointerCapture(pointerId);
        }
      } catch {
        // ignore
      }

      document.body.style.userSelect = "";

      updateDOMConfig({ width: curW, height: curH, x: curX, y: curY });
      notifyDocumentChange();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  // Rotation handle pointer handler
  const handleRotatePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSelected(true);

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const targetEl = e.currentTarget;
    const pointerId = e.pointerId;

    try {
      targetEl.setPointerCapture(pointerId);
    } catch {
      // ignore
    }

    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";

    let curRotate = rotate;

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const radians = Math.atan2(moveEv.clientY - centerY, moveEv.clientX - centerX);
      let deg = Math.round(radians * (180 / Math.PI) + 90);
      if (deg < 0) deg += 360;
      curRotate = deg;
      setRotate(deg);
      updateDOMConfig({ rotate: deg });
    };

    const onPointerUp = (upEv: PointerEvent) => {
      upEv.preventDefault();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      try {
        if (targetEl && targetEl.hasPointerCapture(pointerId)) {
          targetEl.releasePointerCapture(pointerId);
        }
      } catch {
        // ignore
      }

      document.body.style.userSelect = "";
      document.body.style.cursor = "";

      updateDOMConfig({ rotate: curRotate });
      notifyDocumentChange();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handleDragPointerDown}
      onClick={() => setIsSelected(true)}
      className="relative inline-flex flex-col items-center justify-center cursor-pointer select-none group"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
      }}
    >
      {/* SELECTION OVERLAY BOUNDING BOX WHEN SELECTED */}
      {isSelected && (
        <div className="absolute inset-0 border border-dashed border-blue-500/80 pointer-events-none rounded-xs z-20" />
      )}

      {/* RENDER ICON */}
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden rounded-xs [&_svg]:!text-black [&_svg_*[fill]:not([fill='none'])]:!fill-black [&_svg_*[stroke]:not([stroke='none'])]:!stroke-black">
        <Icon
          icon={config.icon}
          style={{ width: "100%", height: "100%", color: color }}
        />
      </div>

      {/* TOP ROTATION CONNECTOR & KNOB WHEN SELECTED */}
      {isSelected && (
        <>
          <div className="w-0.5 h-4 bg-slate-800 dark:bg-slate-200 absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none z-30" />
          <div
            onPointerDown={handleRotatePointerDown}
            className="rotate-handle absolute -top-8 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing z-40 hover:scale-110 transition-transform"
            title="Rotate icon"
          >
            <RotateCw className="w-3 h-3" />
          </div>
        </>
      )}

      {/* 8 INTERACTIVE RESIZE HANDLES WHEN SELECTED */}
      {isSelected && (
        <>
          {/* Top-Left */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "nw")}
            className="resize-handle absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 shadow-md cursor-nwse-resize z-50 hover:scale-125 transition-transform"
            title="Resize icon (Top-Left)"
          />
          {/* Top-Middle */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "n")}
            className="resize-handle absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 shadow-md cursor-ns-resize z-50 hover:scale-125 transition-transform"
            title="Resize icon height (Top-Center)"
          />
          {/* Top-Right */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "ne")}
            className="resize-handle absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 shadow-md cursor-nesw-resize z-50 hover:scale-125 transition-transform"
            title="Resize icon (Top-Right)"
          />
          {/* Middle-Right */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "e")}
            className="resize-handle absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 shadow-md cursor-ew-resize z-50 hover:scale-125 transition-transform"
            title="Resize icon width (Middle-Right)"
          />
          {/* Bottom-Right */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "se")}
            className="resize-handle absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 shadow-md cursor-nwse-resize z-50 hover:scale-125 transition-transform"
            title="Resize icon (Bottom-Right)"
          />
          {/* Bottom-Middle */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "s")}
            className="resize-handle absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 shadow-md cursor-ns-resize z-50 hover:scale-125 transition-transform"
            title="Resize icon height (Bottom-Center)"
          />
          {/* Bottom-Left */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "sw")}
            className="resize-handle absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 shadow-md cursor-nesw-resize z-50 hover:scale-125 transition-transform"
            title="Resize icon (Bottom-Left)"
          />
          {/* Middle-Left */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "w")}
            className="resize-handle absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 shadow-md cursor-ew-resize z-50 hover:scale-125 transition-transform"
            title="Resize icon width (Middle-Left)"
          />
        </>
      )}

      {/* Floating Toolbar Controls when selected */}
      {isSelected && (
        <div
          data-editor-ui="true"
          className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-slate-900/95 text-white p-1.5 rounded-xl shadow-xl text-[11px] backdrop-blur-xs z-50 whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Size controls */}
          <button
            type="button"
            title="Decrease size"
            onClick={() => handleSizeChange(-12)}
            className="px-1.5 py-0.5 rounded hover:bg-slate-700 font-bold"
          >
            -
          </button>
          <span className="text-[10px] text-slate-300">{width}px</span>
          <button
            type="button"
            title="Increase size"
            onClick={() => handleSizeChange(12)}
            className="px-1.5 py-0.5 rounded hover:bg-slate-700 font-bold"
          >
            +
          </button>

          <div className="w-px h-3.5 bg-slate-700 mx-0.5" />

          {/* Delete Button */}
          <button
            type="button"
            title="Delete Icon"
            onClick={handleDelete}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1 rounded text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Context Menu on Right Click */}
      {contextMenuPos && (
        <div
          data-editor-ui="true"
          className="fixed z-[99999] w-44 rounded-lg border border-slate-200 bg-white/98 backdrop-blur-md p-1 shadow-xl text-xs text-slate-800 animate-in fade-in zoom-in-95 duration-100 select-none dark:bg-[#111D29] dark:border-slate-800 dark:text-slate-200"
          style={{
            top: Math.max(8, Math.min(contextMenuPos.y, window.innerHeight - 80)),
            left: Math.max(8, Math.min(contextMenuPos.x, window.innerWidth - 180)),
          }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <button
            type="button"
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-red-50 text-red-600 dark:hover:bg-red-950/50 font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>Delete Icon</span>
          </button>
        </div>
      )}
    </div>
  );
}
