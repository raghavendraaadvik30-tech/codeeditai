import React, { useState, useEffect, useRef } from "react";
import { Trash2, Type } from "lucide-react";
import ShapeIcon from "./ShapeIcon";
import type { CanvasShape } from "../types/shape";

interface DocumentShapeRendererProps {
  config: CanvasShape;
  figureEl: HTMLElement;
  onDelete?: () => void;
}

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export default function DocumentShapeRenderer({
  config,
  figureEl,
  onDelete,
}: DocumentShapeRendererProps) {
  const [x, setX] = useState<number>(config.x || 0);
  const [y, setY] = useState<number>(config.y || 0);
  const [width, setWidth] = useState<number>(config.width || 140);
  const [height, setHeight] = useState<number>(config.height || 100);
  const [fillColor] = useState<string>(config.fillColor || "transparent");
  const [strokeColor] = useState<string>(config.strokeColor || "#000000");
  const [strokeWidth] = useState<number>(config.strokeWidth || 1.5);
  const [rotate] = useState<number>(config.rotate || 0);
  const [text, setText] = useState<string>(config.text || "");
  const [isEditingText, setIsEditingText] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const initialSelected =
    config.selected !== undefined
      ? config.selected
      : figureEl.getAttribute("data-shape-selected") !== "false";

  const [isSelected, setIsSelectedState] = useState<boolean>(initialSelected);

  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    x: config.x || 0,
    y: config.y || 0,
    width: config.width || 140,
    height: config.height || 100,
  });

  // Sync state if config prop updates
  useEffect(() => {
    if (config.width) {
      setWidth(config.width);
      stateRef.current.width = config.width;
    }
    if (config.height) {
      setHeight(config.height);
      stateRef.current.height = config.height;
    }
    if (config.x !== undefined) {
      setX(config.x);
      stateRef.current.x = config.x;
    }
    if (config.y !== undefined) {
      setY(config.y);
      stateRef.current.y = config.y;
    }
  }, [config.width, config.height, config.x, config.y]);

  // On mount, if initialSelected is true, notify other shapes to deselect
  useEffect(() => {
    if (initialSelected) {
      window.dispatchEvent(new CustomEvent("editor-shape-select", { detail: config.id }));
    }
  }, []);

  const setIsSelected = (val: boolean) => {
    setIsSelectedState(val);
    figureEl.setAttribute("data-shape-selected", String(val));
    updateDOMConfig({ selected: val });

    if (val) {
      window.dispatchEvent(new CustomEvent("editor-shape-select", { detail: config.id }));
      // Deselect all other shapes when this shape is selected
      const allShapes = document.querySelectorAll(".editor-shape-figure");
      allShapes.forEach((otherFig) => {
        if (otherFig !== figureEl) {
          otherFig.setAttribute("data-shape-selected", "false");
        }
      });
    }
  };

  // Listen for other shapes being selected to deselect this one
  useEffect(() => {
    const handleOtherSelect = (e: Event) => {
      const custom = e as CustomEvent<string>;
      if (custom.detail !== config.id) {
        setIsSelectedState(false);
        figureEl.setAttribute("data-shape-selected", "false");
        updateDOMConfig({ selected: false });
      }
    };
    window.addEventListener("editor-shape-select", handleOtherSelect);
    return () => {
      window.removeEventListener("editor-shape-select", handleOtherSelect);
    };
  }, [config.id]);

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

  const handleTextChange = (val: string) => {
    setText(val);
    updateDOMConfig({ text: val });
    notifyDocumentChange();
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

  // Keyboard Delete & Backspace listener when shape is selected
  useEffect(() => {
    if (!isSelected || isEditingText) return;

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
  }, [isSelected, isEditingText, figureEl, onDelete]);

  useEffect(() => {
    if (isEditingText && textInputRef.current) {
      textInputRef.current.focus();
      textInputRef.current.select();
    }
  }, [isEditingText]);

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

  // Click outside listener to deselect shape (use capture to catch all outside clicks)
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

    window.addEventListener("pointerdown", handlePointerDownOutside, true);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDownOutside, true);
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
    const initialX = stateRef.current.x;
    const initialY = stateRef.current.y;
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

      stateRef.current.x = newX;
      stateRef.current.y = newY;
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
    const startW = stateRef.current.width;
    const startH = stateRef.current.height;
    const startXPos = stateRef.current.x;
    const startYPos = stateRef.current.y;
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

      stateRef.current.width = newW;
      stateRef.current.height = newH;
      stateRef.current.x = newX;
      stateRef.current.y = newY;

      setWidth(newW);
      setHeight(newH);
      setX(newX);
      setY(newY);

      if (containerRef.current) {
        containerRef.current.style.width = `${newW}px`;
        containerRef.current.style.height = `${newH}px`;
      }
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

      setWidth(curW);
      setHeight(curH);
      setX(curX);
      setY(curY);

      updateDOMConfig({ width: curW, height: curH, x: curX, y: curY });
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
      className="relative inline-flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none group"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
      }}
    >
      {/* EXACTLY ONE SELECTION CONTAINER OVERLAY WHEN SELECTED */}
      {isSelected && (
        <div className="absolute inset-0 border border-dashed border-primary/100/90 pointer-events-none rounded-xs z-20" />
      )}

      {/* SHAPE ICON SVG */}
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden pointer-events-none">
        <ShapeIcon
          type={config.type}
          className="w-full h-full"
          fill={fillColor}
          stroke={strokeColor || "#000000"}
          strokeWidth={strokeWidth || 1.5}
        />

        {/* Optional Text inside shape (editable on demand or read-only) */}
        {isEditingText ? (
          <input
            ref={textInputRef}
            type="text"
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            onBlur={() => setIsEditingText(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Escape") {
                setIsEditingText(false);
              }
              e.stopPropagation();
            }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute inset-x-2 text-center text-xs font-semibold bg-card/90 dark:bg-muted/90 text-foreground dark:text-muted rounded px-1 py-0.5 border border-primary/100 shadow-xs z-30 outline-hidden pointer-events-auto"
          />
        ) : text ? (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground dark:text-muted pointer-events-none px-2 select-none">
            {text}
          </span>
        ) : null}
      </div>

      {/* EXACTLY 8 INTERACTIVE RESIZE HANDLES WHEN SELECTED */}
      {isSelected && (
        <>
          {/* 1. Top-Left */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "nw")}
            className="resize-handle absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-card border-2 border-primary shadow-md cursor-nwse-resize z-50 hover:scale-125 transition-transform"
            title="Resize shape (Top-Left)"
          />
          {/* 2. Top-Center */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "n")}
            className="resize-handle absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-card border-2 border-primary shadow-md cursor-ns-resize z-50 hover:scale-125 transition-transform"
            title="Resize shape height (Top-Center)"
          />
          {/* 3. Top-Right */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "ne")}
            className="resize-handle absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-card border-2 border-primary shadow-md cursor-nesw-resize z-50 hover:scale-125 transition-transform"
            title="Resize shape (Top-Right)"
          />
          {/* 4. Middle-Right */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "e")}
            className="resize-handle absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-card border-2 border-primary shadow-md cursor-ew-resize z-50 hover:scale-125 transition-transform"
            title="Resize shape width (Middle-Right)"
          />
          {/* 5. Bottom-Right */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "se")}
            className="resize-handle absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 rounded-full bg-card border-2 border-primary shadow-md cursor-nwse-resize z-50 hover:scale-125 transition-transform"
            title="Resize shape (Bottom-Right)"
          />
          {/* 6. Bottom-Center */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "s")}
            className="resize-handle absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 rounded-full bg-card border-2 border-primary shadow-md cursor-ns-resize z-50 hover:scale-125 transition-transform"
            title="Resize shape height (Bottom-Center)"
          />
          {/* 7. Bottom-Left */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "sw")}
            className="resize-handle absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 rounded-full bg-card border-2 border-primary shadow-md cursor-nesw-resize z-50 hover:scale-125 transition-transform"
            title="Resize shape (Bottom-Left)"
          />
          {/* 8. Middle-Left */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "w")}
            className="resize-handle absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-card border-2 border-primary shadow-md cursor-ew-resize z-50 hover:scale-125 transition-transform"
            title="Resize shape width (Middle-Left)"
          />
        </>
      )}

      {/* Floating Toolbar Controls when selected */}
      {isSelected && (
        <div
          data-editor-ui="true"
          className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-foreground/95 text-primary-foreground p-1.5 rounded-xl shadow-xl text-[11px] backdrop-blur-xs z-50 whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Edit Button */}
          <button
            type="button"
            title="Edit Text"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingText(true);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-secondary-foreground text-secondary hover:text-primary-foreground transition-colors cursor-pointer"
          >
            <Type className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <div className="w-px h-3.5 bg-secondary-foreground mx-0.5" />

          {/* Delete Button */}
          <button
            type="button"
            title="Delete Shape"
            onClick={handleDelete}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-red-400 hover:bg-destructive/100/20 hover:text-red-300 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Context Menu on Right Click */}
      {contextMenuPos && (
        <div
          data-editor-ui="true"
          className="fixed z-[99999] w-40 rounded-lg border border-secondary bg-card/98 backdrop-blur-md p-1 shadow-xl text-xs text-foreground animate-in fade-in zoom-in-95 duration-100 select-none dark:bg-[#111D29] dark:border-muted dark:text-muted-foreground"
          style={{
            top: Math.max(8, Math.min(contextMenuPos.y, window.innerHeight - 90)),
            left: Math.max(8, Math.min(contextMenuPos.x, window.innerWidth - 170)),
          }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setContextMenuPos(null);
              setIsEditingText(true);
            }}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-muted dark:hover:bg-muted text-secondary-foreground dark:text-muted-foreground font-medium transition-colors cursor-pointer"
          >
            <Type className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          <div className="my-1 h-px bg-muted dark:bg-muted" />
          <button
            type="button"
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-destructive/10 text-destructive dark:hover:bg-red-950/50 font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}


