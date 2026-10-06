import React, { useEffect, useState, useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import DocumentIconRenderer from "./DocumentIconRenderer";

interface IconMountInfo {
  id: string;
  figureEl: HTMLElement;
  mountEl: HTMLElement;
  config: {
    id: string;
    icon: string;
    width: number;
    height: number;
    color: string;
    alignment?: "left" | "center" | "right";
    caption?: string;
  };
}

export const IconHydration: React.FC = () => {
  const [mounts, setMounts] = useState<IconMountInfo[]>([]);
  const mountsRef = useRef<IconMountInfo[]>([]);
  mountsRef.current = mounts;

  const scanDocumentForIcons = useCallback(() => {
    const foundFigureEls = Array.from(
      document.querySelectorAll(".editor-icon-figure")
    ) as HTMLElement[];

    const newMounts: IconMountInfo[] = [];

    foundFigureEls.forEach((figEl) => {
      const iconId = figEl.getAttribute("data-icon-id");
      const mountEl = figEl.querySelector(".editor-icon-mount") as HTMLElement | null;
      const rawConfig = figEl.getAttribute("data-icon-config");
      const iconName = figEl.getAttribute("data-icon-name") || "mdi:star";

      if (iconId && mountEl) {
        let config = {
          id: iconId,
          icon: iconName,
          width: 64,
          height: 64,
          color: "#000000",
        };
        if (rawConfig) {
          try {
            config = { ...config, ...JSON.parse(decodeURIComponent(rawConfig)) };
          } catch {
            // fallback
          }
        }
        config.color = "#000000";

        const existing = mountsRef.current.find(
          (m) => m.id === iconId && m.mountEl === mountEl
        );

        if (!existing) {
          mountEl.innerHTML = "";
        }

        newMounts.push({
          id: iconId,
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
            p.config.icon === newMounts[i].config.icon
        )
      ) {
        return prev;
      }
      return newMounts;
    });
  }, []);

  useEffect(() => {
    scanDocumentForIcons();
    const interval = setInterval(scanDocumentForIcons, 1000);
    const observer = new MutationObserver(scanDocumentForIcons);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, [scanDocumentForIcons]);

  const handleDeleteIcon = useCallback((iconId: string, figEl: HTMLElement) => {
    const pageContainer = figEl.closest('[contenteditable="true"]') as HTMLElement | null;
    figEl.remove();
    if (pageContainer) {
      pageContainer.dispatchEvent(new Event("input", { bubbles: true }));
    }
    setMounts((prev) => prev.filter((m) => m.id !== iconId));
  }, []);

  return (
    <>
      {mounts.map((m) =>
        ReactDOM.createPortal(
          <DocumentIconRenderer
            key={m.id}
            config={m.config}
            figureEl={m.figureEl}
            onDelete={() => handleDeleteIcon(m.id, m.figureEl)}
          />,
          m.mountEl
        )
      )}
    </>
  );
};
