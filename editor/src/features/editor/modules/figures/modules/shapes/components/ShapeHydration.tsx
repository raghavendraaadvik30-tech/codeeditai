import React, { useEffect, useState, useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import DocumentShapeRenderer from "./DocumentShapeRenderer";
import type { CanvasShape } from "../types/shape";

interface ShapeMountInfo {
  id: string;
  figureEl: HTMLElement;
  mountEl: HTMLElement;
  config: CanvasShape;
}

export const ShapeHydration: React.FC = () => {
  const [mounts, setMounts] = useState<ShapeMountInfo[]>([]);
  const mountsRef = useRef<ShapeMountInfo[]>([]);
  mountsRef.current = mounts;

  const scanDocumentForShapes = useCallback(() => {
    const foundFigureEls = Array.from(
      document.querySelectorAll(".editor-shape-figure")
    ) as HTMLElement[];

    const newMounts: ShapeMountInfo[] = [];

    foundFigureEls.forEach((figEl) => {
      // Remove any erroneous picture/icon mounts that were mistakenly attached
      figEl.querySelectorAll(".editor-picture-mount, .editor-icon-mount").forEach((badMount) => badMount.remove());

      const shapeId = figEl.getAttribute("data-shape-id");
      const mountEl = figEl.querySelector(".editor-shape-mount") as HTMLElement | null;
      const rawConfig = figEl.getAttribute("data-shape-config");
      const shapeType = figEl.getAttribute("data-shape-type") || "rectangle";

      if (shapeId && mountEl) {
        const shapeSelectedAttr = figEl.getAttribute("data-shape-selected");
        let isSel = shapeSelectedAttr !== "false";

        let config: CanvasShape = {
          id: shapeId,
          type: shapeType,
          x: 0,
          y: 0,
          width: 140,
          height: 100,
          rotate: 0,
          fillColor: "transparent",
          strokeColor: "#000000",
          strokeWidth: 1.5,
          selected: isSel,
        };

        if (rawConfig) {
          try {
            config = { ...config, ...JSON.parse(decodeURIComponent(rawConfig)) };
            if (shapeSelectedAttr !== null) {
              config.selected = isSel;
            }
          } catch {
            // fallback
          }
        }

        const existing = mountsRef.current.find(
          (m) => m.id === shapeId && m.mountEl === mountEl
        );

        if (!existing) {
          mountEl.innerHTML = "";
        }

        newMounts.push({
          id: shapeId,
          figureEl: figEl,
          mountEl,
          config,
        });
      }
    });

    setMounts((prev) => {
      if (
        prev.length === newMounts.length &&
        prev.every(
          (p, i) =>
            p.id === newMounts[i].id &&
            p.mountEl === newMounts[i].mountEl &&
            p.config.type === newMounts[i].config.type
        )
      ) {
        return prev;
      }
      return newMounts;
    });
  }, []);

  useEffect(() => {
    scanDocumentForShapes();
    const interval = setInterval(scanDocumentForShapes, 1000);
    const observer = new MutationObserver(scanDocumentForShapes);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, [scanDocumentForShapes]);

  const handleDeleteShape = useCallback((shapeId: string, figEl: HTMLElement) => {
    const pageContainer = figEl.closest('[contenteditable="true"]') as HTMLElement | null;
    figEl.remove();
    if (pageContainer) {
      pageContainer.dispatchEvent(new Event("input", { bubbles: true }));
    }
    setMounts((prev) => prev.filter((m) => m.id !== shapeId));
  }, []);

  return (
    <>
      {mounts.map((m) =>
        ReactDOM.createPortal(
          <DocumentShapeRenderer
            key={m.id}
            config={m.config}
            figureEl={m.figureEl}
            onDelete={() => handleDeleteShape(m.id, m.figureEl)}
          />,
          m.mountEl
        )
      )}
    </>
  );
};
