import React, { useEffect, useState, useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import { DocumentPictureRenderer, type CanvasPicture } from "./DocumentPictureRenderer";

interface PictureMountInfo {
  id: string;
  figureEl: HTMLElement;
  mountEl: HTMLElement;
  config: CanvasPicture;
}

export const PictureHydration: React.FC = () => {
  const [mounts, setMounts] = useState<PictureMountInfo[]>([]);
  const mountsRef = useRef<PictureMountInfo[]>([]);
  mountsRef.current = mounts;

  const scanDocumentForPictures = useCallback(() => {
    // Find all picture figures inside contenteditable containers (excluding shapes and icons)
    const rawFound = Array.from(
      document.querySelectorAll(
        '.editor-picture-figure, figure[data-picture-figure="true"]'
      )
    ) as HTMLElement[];

    const foundFigureEls: HTMLElement[] = rawFound.filter(
      (fig) =>
        !fig.classList.contains("editor-shape-figure") &&
        !fig.classList.contains("editor-icon-figure") &&
        !fig.hasAttribute("data-shape-figure") &&
        !fig.hasAttribute("data-icon-figure")
    );

    // Also look for un-annotated figures that contain images inside contenteditable pages (and are not shapes/icons)
    const editablePages = document.querySelectorAll('[contenteditable="true"]');
    editablePages.forEach((page) => {
      const figureImgs = page.querySelectorAll("figure img");
      figureImgs.forEach((img) => {
        const fig = img.closest("figure") as HTMLElement | null;
        if (
          fig &&
          !fig.classList.contains("editor-shape-figure") &&
          !fig.classList.contains("editor-icon-figure") &&
          !fig.hasAttribute("data-shape-figure") &&
          !fig.hasAttribute("data-icon-figure") &&
          !foundFigureEls.includes(fig)
        ) {
          foundFigureEls.push(fig);
        }
      });
    });

    const newMounts: PictureMountInfo[] = [];

    foundFigureEls.forEach((figEl) => {
      figEl.oncontextmenu = (e) => e.preventDefault();
      figEl.classList.add("editor-picture-figure");
      figEl.setAttribute("data-picture-figure", "true");
      figEl.setAttribute("contenteditable", "false");

      let pictureId = figEl.getAttribute("data-picture-id") || figEl.id;
      if (!pictureId) {
        pictureId = `figure-pic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        figEl.id = pictureId;
        figEl.setAttribute("data-picture-id", pictureId);
      }

      let mountEl = figEl.querySelector(".editor-picture-mount") as HTMLElement | null;
      if (!mountEl) {
        mountEl = document.createElement("div");
        mountEl.className = "editor-picture-mount";
        mountEl.setAttribute("data-picture-mount-id", pictureId);
        mountEl.style.width = "100%";
        mountEl.style.display = "block";

        const existingImg = figEl.querySelector("img");
        if (existingImg) {
          mountEl.appendChild(existingImg);
          figEl.insertBefore(mountEl, figEl.firstChild);
        } else {
          figEl.appendChild(mountEl);
        }
      }

      const rawConfig = figEl.getAttribute("data-picture-config");
      let config: CanvasPicture = {
        id: pictureId,
        x: 0,
        y: 0,
        width: figEl.offsetWidth || 360,
        height: 240,
        rotate: 0,
      };

      const imgEl = mountEl.querySelector("img");
      if (imgEl && imgEl.src) {
        config.src = imgEl.src;
        config.title = imgEl.alt || "Picture";
      }

      if (rawConfig) {
        try {
          config = { ...config, ...JSON.parse(decodeURIComponent(rawConfig)) };
        } catch {
          // fallback
        }
      } else {
        figEl.setAttribute("data-picture-config", encodeURIComponent(JSON.stringify(config)));
      }

      const existing = mountsRef.current.find(
        (m) => m.id === pictureId && m.mountEl === mountEl
      );

      if (!existing && mountEl) {
        mountEl.innerHTML = "";
      }

      newMounts.push({
        id: pictureId,
        figureEl: figEl,
        mountEl,
        config,
      });
    });

    setMounts((prev) => {
      if (
        prev.length === newMounts.length &&
        prev.every(
          (p, i) =>
            p.id === newMounts[i].id &&
            p.mountEl === newMounts[i].mountEl &&
            p.config.src === newMounts[i].config.src
        )
      ) {
        return prev;
      }
      return newMounts;
    });
  }, []);

  useEffect(() => {
    scanDocumentForPictures();
    const interval = setInterval(scanDocumentForPictures, 800);
    const observer = new MutationObserver(scanDocumentForPictures);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, [scanDocumentForPictures]);

  return (
    <>
      {mounts.map((m) =>
        ReactDOM.createPortal(
          <DocumentPictureRenderer key={m.id} config={m.config} figureEl={m.figureEl} />,
          m.mountEl
        )
      )}
    </>
  );
};
