import React, { useState, useEffect, useRef } from "react";
import { Trash2, RotateCw } from "lucide-react";
import ShapeIcon from "./ShapeIcon";
import type { CanvasShape } from "../types/shape";

interface DocumentShapeRendererProps {
  config: CanvasShape;
  figureEl: HTMLElement;
}

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export default function DocumentShapeRenderer({
  config,
  figureEl,
}: DocumentShapeRendererProps) {
  const [x, setX] = useState<number>(config.x || 0);
  const [y, setY] = useState<number>(config.y || 0);
  const [width, setWidth] = useState<number>(config.width || 140);
  const [height, setHeight] = useState<number>(config.height || 100);
  const [fillColor] = useState<string>(config.fillColor || "transparent");
  const [strokeColor] = useState<string>(config.strokeColor || "#000000");
  const [strokeWidth] = useState<number>(config.strokeWidth || 1.5);
  const [rotate, setRotate] = useState<number>(config.rotate || 0);
  const [text, setText] = useState<string>(config.text || "");
  const initialSelected =
    config.selected !== undefined
      ? config.selected
      : figureEl.getAttribute("data-shape-selected") !== "false";

  const [isSelected, setIsSelectedState] = useState<boolean>(initialSelected);

  const containerRef = useRef<HTMLDivElement>(null);

  const setIsSelected = (val: boolean) => {
    setIsSelectedState(val);
    figureEl.setAttribute("data-shape-selected", String(val));
    updateDOMConfig({ selected: val });

    if (val) {
      // Deselect all other shapes when this shape is selected
      const allShapes = document.querySelectorAll(".editor-shape-figure");
      allShapes.forEach((otherFig) => {
        if (otherFig !== figureEl) {
          otherFig.setAttribute("data-shape-selected", "false");
        }
      });
    }
  };

  // Synchronize figure element styles (position, transform, dimensions)
  useEffect(() => {
    figureEl.style.width = `${width}px`;
    figureEl.style.height = `${height}px`;
    figureEl.style.position = "relative";
    figureEl.style.display = "inline-block";
    figureEl.style.transform = `translate(${x}px, ${y}px)`;

    const mountEl = figureEl.querySelector(".editor-shape-mount") as HTMLElement | null;
    if (mountEl) {
      mountEl.style.width = "100%";
      mountEl.style.height = "100%";
      mountEl.style.minHeight = `${height}px`;
    }
  }, [width, height, x, y, figureEl]);

  // Pointer listener on figure element to select shape when clicked
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

  // Click outside listener to deselect shape
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

  const updateDOMConfig = (updates: Partial<CanvasShape>) => {
    try {
      const raw = figureEl.getAttribute("data-shape-config");
      const current = raw ? JSON.parse(decodeURIComponent(raw)) : {};
      const updated = { ...current, ...updates };
      figureEl.setAttribute("data-shape-config", encodeURIComponent(JSON.stringify(updated)));
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    figureEl.remove();
    notifyDocumentChange();
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    updateDOMConfig({ text: newText });
    notifyDocumentChange();
  };

  const handleSizeChange = (deltaW: number, deltaH: number) => {
    const newW = Math.max(30, Math.min(800, width + deltaW));
    const newH = Math.max(30, Math.min(600, height + deltaH));
    setWidth(newW);
    setHeight(newH);
    updateDOMConfig({ width: newW, height: newH });
    notifyDocumentChange();
  };

  // Pointer drag & move handler on shape body
  const handleDragPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;

    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Ignore drag start on interactive controls, handles, buttons, inputs
    if (
      target.closest("button") ||
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

  // 8 Interactive resize handles with anchor stability
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

    const minW = 20;
    const minH = 20;

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

      {/* SHAPE ICON SVG */}
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        <ShapeIcon
          type={config.type}
          className="w-full h-full"
          fill={fillColor}
          stroke={strokeColor || "#000000"}
          strokeWidth={strokeWidth || 1.5}
        />

        {/* Optional Editable Text inside shape */}
        <input
          type="text"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute inset-0 w-full h-full text-center bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none border-none px-2 pointer-events-auto"
          placeholder=""
        />
      </div>

      {/* TOP ROTATION CONNECTOR & KNOB WHEN SELECTED */}
      {isSelected && (
        <>
          <div className="w-0.5 h-4 bg-slate-800 dark:bg-slate-200 absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none z-30" />
          <div
            onPointerDown={handleRotatePointerDown}
            className="rotate-handle absolute -top-8 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing z-40 hover:scale-110 transition-transform"
            title="Rotate shape"
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
            title="Resize shape (Top-Left)"
          />
          {/* Top-Middle */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "n")}
            className="resize-handle absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 shadow-md cursor-ns-resize z-50 hover:scale-125 transition-transform"
            title="Resize shape height (Top-Center)"
          />
          {/* Top-Right */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "ne")}
            className="resize-handle absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 shadow-md cursor-nesw-resize z-50 hover:scale-125 transition-transform"
            title="Resize shape (Top-Right)"
          />
          {/* Middle-Right */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "e")}
            className="resize-handle absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 shadow-md cursor-ew-resize z-50 hover:scale-125 transition-transform"
            title="Resize shape width (Middle-Right)"
          />
          {/* Bottom-Right */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "se")}
            className="resize-handle absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 shadow-md cursor-nwse-resize z-50 hover:scale-125 transition-transform"
            title="Resize shape (Bottom-Right)"
          />
          {/* Bottom-Middle */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "s")}
            className="resize-handle absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 shadow-md cursor-ns-resize z-50 hover:scale-125 transition-transform"
            title="Resize shape height (Bottom-Center)"
          />
          {/* Bottom-Left */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "sw")}
            className="resize-handle absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 shadow-md cursor-nesw-resize z-50 hover:scale-125 transition-transform"
            title="Resize shape (Bottom-Left)"
          />
          {/* Middle-Left */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "w")}
            className="resize-handle absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 shadow-md cursor-ew-resize z-50 hover:scale-125 transition-transform"
            title="Resize shape width (Middle-Left)"
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
            onClick={() => handleSizeChange(-16, -12)}
            className="px-1.5 py-0.5 rounded hover:bg-slate-700 font-bold"
          >
            -
          </button>
          <span className="text-[10px] text-slate-300">
            {width}x{height}
          </span>
          <button
            type="button"
            title="Increase size"
            onClick={() => handleSizeChange(16, 12)}
            className="px-1.5 py-0.5 rounded hover:bg-slate-700 font-bold"
          >
            +
          </button>

          <div className="w-px h-3.5 bg-slate-700 mx-0.5" />

          {/* Delete Button */}
          <button
            type="button"
            title="Delete Shape"
            onClick={handleDelete}
            className="p-1 rounded text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}


