/**
 * Dedicated print and PDF generation service.
 * Clones document pages, removes editor chrome, and invokes native print.
 */

export const printService = {
  async printDocument(): Promise<void> {
    const pageElements = Array.from(document.querySelectorAll<HTMLElement>("section[data-page-id]"));
    if (pageElements.length === 0) {
      window.print();
      return;
    }

    document.getElementById("print-root")?.remove();

    const printRoot = document.createElement("div");
    printRoot.id = "print-root";
    printRoot.className = "print-area";
    const pageRules: string[] = [];

    pageElements.forEach((page, index) => {
      const clone = page.cloneNode(true) as HTMLElement;
      clone.style.transform = "none";
      clone.style.transformOrigin = "initial";
      clone.style.marginBottom = "0";
      clone.style.outline = "none";

      // Page dimensions are held in CSS pixels at 96 dpi. Convert them to
      // physical units so print uses the same paper size and orientation.
      const widthPx = Number.parseFloat(page.style.width);
      const heightPx = Number.parseFloat(page.style.height);
      if (Number.isFinite(widthPx) && Number.isFinite(heightPx) && widthPx > 0 && heightPx > 0) {
        const widthMm = (widthPx * 25.4) / 96;
        const heightMm = (heightPx * 25.4) / 96;
        const pageName = `editor-page-${index}`;
        for (const property of ["width", "min-width", "max-width"]) {
          clone.style.setProperty(property, `${widthMm}mm`, "important");
        }
        for (const property of ["height", "min-height", "max-height"]) {
          clone.style.setProperty(property, `${heightMm}mm`, "important");
        }
        clone.style.setProperty("page", pageName);
        pageRules.push(`@page ${pageName} { size: ${widthMm}mm ${heightMm}mm; margin: 0; }`);
      }

      const hasCustomBorder = Boolean(
        page.style.border || page.style.borderTop || page.style.borderBottom ||
        page.style.borderLeft || page.style.borderRight
      );
      if (!hasCustomBorder) {
        clone.style.border = "none";
        clone.style.boxShadow = "none";
      }

      clone.classList.add("print-page", "print-preview-page");
      if (index === pageElements.length - 1) clone.classList.add("print-last-page");

      clone.querySelectorAll(
        "[data-editor-ui], [data-table-control], .print\\:hidden, .absolute.-left-12, [data-no-print]"
      ).forEach((element) => element.remove());
      clone.querySelectorAll("[contenteditable]").forEach((element) => {
        element.removeAttribute("contenteditable");
        element.removeAttribute("suppresscontenteditablewarning");
      });

      // Canvas drawings are not copied by cloneNode. Snapshot them for print.
      const sourceCanvases = Array.from(page.querySelectorAll("canvas"));
      clone.querySelectorAll("canvas").forEach((canvas, canvasIndex) => {
        const source = sourceCanvases[canvasIndex];
        if (!source) return;
        try {
          const image = document.createElement("img");
          image.src = source.toDataURL("image/png");
          image.width = source.width;
          image.height = source.height;
          image.style.cssText = source.style.cssText;
          canvas.replaceWith(image);
        } catch {
          // A tainted canvas cannot be read; leave the canvas fallback in place.
        }
      });

      // Sanitize SmartArt figures for print/PDF export:
      // 1. Prevent editor SmartArtHydration from scanning and wiping cloned mounts.
      // 2. Remove floating action toolbar, text pane, and resize handles.
      // 3. Convert interactive inputs/textareas into styled typography spans carrying live user-edited values.
      const origSmartArts = Array.from(
        page.querySelectorAll<HTMLElement>(".editor-smartart-figure")
      );
      const cloneSmartArts = Array.from(
        clone.querySelectorAll<HTMLElement>(".editor-smartart-figure")
      );

      origSmartArts.forEach((origFig, figIdx) => {
        const cloneFig = cloneSmartArts[figIdx];
        if (!cloneFig) return;

        // Decouple from editor hydration so MutationObserver never wipes print clones
        cloneFig.classList.remove("editor-smartart-figure");
        cloneFig.classList.add("print-smartart-figure");
        const cloneMount = cloneFig.querySelector(".editor-smartart-mount");
        if (cloneMount) {
          cloneMount.classList.remove("editor-smartart-mount");
          cloneMount.classList.add("print-smartart-mount");
        }

        // Remove editor chrome overlays from the clone:
        // Contextual floating toolbar
        const chromeToolbars = cloneFig.querySelectorAll(
          ".absolute.-top-11, [class*=\"-top-11\"], [role=\"toolbar\"], .fixed.z-50"
        );
        chromeToolbars.forEach((el) => el.remove());

        // SmartArt side Text Pane
        const textPanes = cloneFig.querySelectorAll(".w-56, [class*=\"w-56\"]");
        textPanes.forEach((el) => el.remove());

        // Resize handles
        const resizeHandles = cloneFig.querySelectorAll(
          "[class*=\"cursor-\"][class*=\"-resize\"], .border-\\[\\#0078d4\\], [class*=\"cursor-nwse\"], [class*=\"cursor-nesw\"]"
        );
        resizeHandles.forEach((el) => el.remove());

        // Action buttons
        const buttons = cloneFig.querySelectorAll("button");
        buttons.forEach((el) => el.remove());

        // Clean selection outline and focus ring on the container
        const container = (cloneFig.querySelector(".group.select-none") ||
          cloneFig.firstElementChild?.firstElementChild) as HTMLElement | null;
        if (container) {
          container.classList.remove(
            "ring-2",
            "ring-[#0078d4]",
            "shadow-xl",
            "hover:ring-1",
            "hover:ring-slate-300"
          );
          container.style.outline = "none";
          container.style.boxShadow = "none";
        }

        // Parse fallback config nodes if available
        let configNodes: { text?: string; subtitle?: string }[] = [];
        const rawConfig = origFig.getAttribute("data-smartart-config");
        if (rawConfig) {
          try {
            const parsed = JSON.parse(decodeURIComponent(rawConfig));
            if (Array.isArray(parsed.nodes)) {
              configNodes = parsed.nodes;
            }
          } catch {
            // ignore
          }
        }

        // Pair diagram graphic inputs 1-to-1 in document order between original and clone
        const origDiagram =
          origFig.querySelector(".flex-1.min-w-0.h-full") || origFig;
        const cloneDiagram =
          cloneFig.querySelector(".flex-1.min-w-0.h-full") || cloneFig;

        const origInputs = Array.from(
          origDiagram.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
            "input, textarea"
          )
        );
        const cloneInputs = Array.from(
          cloneDiagram.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
            "input, textarea"
          )
        );

        cloneInputs.forEach((cloneInput, inputIdx) => {
          const origInput = origInputs[inputIdx];

          // Capture the current live edited text value
          let textValue = origInput ? origInput.value : "";
          if (!textValue && origInput) {
            textValue = origInput.getAttribute("value") || "";
          }
          if (!textValue && cloneInput) {
            textValue = cloneInput.value || cloneInput.getAttribute("value") || "";
          }
          if (!textValue && configNodes.length > 0) {
            const isSub =
              cloneInput.className.includes("text-[11px]") ||
              cloneInput.className.includes("mt-0.5");
            const nodeIdx = Math.floor(inputIdx / 2);
            if (configNodes[nodeIdx]) {
              textValue =
                (isSub
                  ? configNodes[nodeIdx].subtitle
                  : configNodes[nodeIdx].text) || "";
            }
          }

          // Create printable typography span preserving colors and styles
          const span = document.createElement("span");
          span.className = cloneInput.className;
          span.textContent = textValue;

          if (origInput) {
            try {
              const comp = window.getComputedStyle(origInput);
              span.style.fontSize = comp.fontSize;
              span.style.fontWeight = comp.fontWeight;
              span.style.fontFamily = comp.fontFamily;
              span.style.color = comp.color;
              span.style.textAlign = comp.textAlign;
              span.style.letterSpacing = comp.letterSpacing;
              span.style.lineHeight = comp.lineHeight;
            } catch {
              // fallback
            }
          }

          span.style.display = "block";
          span.style.width = "100%";
          span.style.wordBreak = "break-word";
          span.style.whiteSpace = "pre-wrap";
          span.style.border = "none";
          span.style.outline = "none";
          span.style.background = "transparent";
          span.style.boxSizing = "border-box";
          span.style.pointerEvents = "none";

          cloneInput.parentNode?.replaceChild(span, cloneInput);
        });

        // Replace any remaining unhandled inputs in the figure
        const remainingCloneInputs = Array.from(
          cloneFig.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
            "input, textarea"
          )
        );
        remainingCloneInputs.forEach((inp) => {
          const span = document.createElement("span");
          span.className = inp.className;
          span.textContent = inp.value || inp.getAttribute("value") || "";
          span.style.display = "block";
          span.style.width = "100%";
          span.style.wordBreak = "break-word";
          span.style.whiteSpace = "pre-wrap";
          inp.parentNode?.replaceChild(span, inp);
        });
      });

      // Decouple Chart figures so ChartHydration doesn't wipe cloned mounts
      const cloneCharts = clone.querySelectorAll<HTMLElement>(".editor-chart-figure");
      cloneCharts.forEach((chartFig) => {
        chartFig.classList.remove("editor-chart-figure");
        chartFig.classList.add("print-chart-figure");
        const chartMount = chartFig.querySelector(".editor-chart-mount");
        if (chartMount) {
          chartMount.classList.remove("editor-chart-mount");
          chartMount.classList.add("print-chart-mount");
        }
      });

      printRoot.appendChild(clone);
    });

    const pageStyle = document.createElement("style");
    pageStyle.dataset.printPageRules = "true";
    pageStyle.textContent = pageRules.join("\n");
    printRoot.appendChild(pageStyle);
    document.body.appendChild(printRoot);
    document.body.classList.add("printing-active");

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      printRoot.remove();
      document.body.classList.remove("printing-active");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);

    try {
      await document.fonts?.ready;
      await Promise.all(Array.from(printRoot.querySelectorAll("img")).map(async (image) => {
        if (!image.complete) {
          await new Promise<void>((resolve) => {
            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
          });
        }
        try { await image.decode(); } catch { /* retain broken image placeholder */ }
      }));
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      window.print();
    } finally {
      // afterprint is not fired by every browser or print destination.
      setTimeout(cleanup, 2000);
    }
  },
};
