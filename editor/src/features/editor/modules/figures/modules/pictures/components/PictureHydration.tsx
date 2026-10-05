import React, { useEffect, useState, useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import { DocumentPictureRenderer } from "./DocumentPictureRenderer";
import type { CanvasPicture, PictureMountInfo, PictureInsertEventDetail } from "../types";
import { extractPictureTitle, generatePictureHTML } from "../utils";
import { PICTURE_INSERT_EVENT } from "../constants";

export type { PictureMountInfo };

export const PictureHydration: React.FC = () => {
  const [mounts, setMounts] = useState<PictureMountInfo[]>([]);
  const mountsRef = useRef<PictureMountInfo[]>([]);
  mountsRef.current = mounts;

  const scanDocumentForPictures = useCallback(() => {
    // PDF imports are full-page content, not floating pictures. Older saved
    // imports may already have been wrapped before this exclusion existed;
    // unwrap them so the original page-sized image and dimensions survive.
    document.querySelectorAll("figure.editor-picture-figure").forEach((figure) => {
      const importedPage = figure.querySelector<HTMLImageElement>("img[data-imported-pdf-page='true']");
      if (importedPage?.parentElement) {
        figure.replaceWith(importedPage);
      }
    });

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

    // Also look for un-annotated figures and standalone <img> tags inside contenteditable pages (excluding shapes/icons)
    const editablePages = document.querySelectorAll('[contenteditable="true"]');
    editablePages.forEach((page) => {
      const allImgs = Array.from(page.querySelectorAll("img")) as HTMLImageElement[];
      allImgs.forEach((img) => {
        // Keep a PDF page image at the page's physical size. Picture hydration
        // assigns ordinary inserted pictures a fixed canvas size and caption.
        if (img.matches("img[data-imported-pdf-page='true']")) return;

        // Skip images inside React portal mounts of non-picture modules
        if (
          img.closest(".editor-shape-mount") ||
          img.closest(".editor-icon-mount") ||
          img.closest(".editor-chart-mount") ||
          img.closest(".editor-smartart-mount")
        ) {
          return;
        }

        let fig = img.closest("figure") as HTMLElement | null;
        if (!fig) {
          // Auto-wrap standalone <img> in figure structure for full interactive editor hydration
          fig = document.createElement("figure");
          fig.className = "editor-figure editor-picture-figure";
          fig.setAttribute("data-picture-figure", "true");
          const picId = `figure-pic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          fig.id = picId;
          fig.setAttribute("data-picture-id", picId);
          fig.setAttribute("data-picture-selected", "true");
          fig.setAttribute("contenteditable", "false");
          fig.style.margin = "14px auto";
          fig.style.textAlign = "center";
          fig.style.display = "inline-block";
          fig.style.position = "relative";
          fig.style.userSelect = "none";
          fig.style.maxWidth = "100%";

          const parent = img.parentNode;
          if (parent) {
            parent.insertBefore(fig, img);
            const mount = document.createElement("div");
            mount.className = "editor-picture-mount";
            mount.setAttribute("data-picture-mount-id", picId);
            mount.style.width = "100%";
            mount.style.display = "block";
            mount.appendChild(img);
            fig.appendChild(mount);

            // Add editable figcaption for dynamic image title
            const figcaption = document.createElement("figcaption");
            figcaption.setAttribute("contenteditable", "true");
            figcaption.style.marginTop = "6px";
            figcaption.style.fontSize = "10.5pt";
            figcaption.style.fontWeight = "600";
            figcaption.style.color = "#475569";
            figcaption.style.textAlign = "center";
            figcaption.style.fontFamily = "Calibri, 'Segoe UI', Arial, sans-serif";
            figcaption.style.outline = "none";
            figcaption.style.borderBottom = "1px dashed transparent";
            figcaption.style.cursor = "text";
            figcaption.onkeydown = (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                (e.target as HTMLElement).blur();
              }
            };
            figcaption.onmousedown = (e) => e.stopPropagation();
            figcaption.onclick = (e) => e.stopPropagation();
            figcaption.onfocus = (e) => {
              (e.target as HTMLElement).style.borderBottomColor = "#3b82f6";
            };
            figcaption.onblur = (e) => {
              (e.target as HTMLElement).style.borderBottomColor = "transparent";
            };

            const titleText = extractPictureTitle(img.src || "", img.alt?.trim());
            figcaption.textContent = titleText;
            fig.appendChild(figcaption);
          }
        }

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

      const pictureSelectedAttr = figEl.getAttribute("data-picture-selected");
      const isSel = pictureSelectedAttr !== "false";

      const rawConfig = figEl.getAttribute("data-picture-config");
      const imgEl = figEl.querySelector("img");

      let config: CanvasPicture = {
        id: pictureId,
        x: 0,
        y: 0,
        width: figEl.offsetWidth || (imgEl?.naturalWidth ? Math.min(imgEl.naturalWidth, 600) : 360),
        height: 240,
        rotate: 0,
        selected: isSel,
      };

      if (imgEl && imgEl.src) {
        config.src = imgEl.src;
        config.title = imgEl.alt || "Picture";
      }

      if (rawConfig) {
        try {
          config = { ...config, ...JSON.parse(decodeURIComponent(rawConfig)) };
          if (pictureSelectedAttr !== null) {
            config.selected = isSel;
          }
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
            p.config.src === newMounts[i].config.src &&
            p.config.selected === newMounts[i].config.selected
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

  // Ensure pf-insert-picture events are inserted into the editor document even if PicturesSection is unmounted
  useEffect(() => {
    const handleInsertPictureFallback = (event: Event) => {
      if ((window as unknown as { __hasPicturesSection?: boolean }).__hasPicturesSection) {
        return; // PicturesSection is actively handling this event; do not duplicate
      }
      const customEvent = event as CustomEvent<PictureInsertEventDetail>;
      if (!customEvent.detail) return;
      if (customEvent.detail.mode !== "titleOnly" && !customEvent.detail.src) return;

      const { src, name, mode, caption } = customEvent.detail;
      const html = generatePictureHTML({
        src: src || "",
        name: name || "Image",
        mode: mode || "withTitle",
        caption,
      });

      const activeEl = document.activeElement;
      const editable = (activeEl?.closest('[contenteditable="true"]') ||
        document.querySelector('[contenteditable="true"]')) as HTMLElement | null;

      if (editable) {
        editable.focus();
        document.execCommand("insertHTML", false, html);
      }
    };

    window.addEventListener(PICTURE_INSERT_EVENT, handleInsertPictureFallback);
    return () => {
      window.removeEventListener(PICTURE_INSERT_EVENT, handleInsertPictureFallback);
    };
  }, []);

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
