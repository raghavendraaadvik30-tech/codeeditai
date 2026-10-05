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
