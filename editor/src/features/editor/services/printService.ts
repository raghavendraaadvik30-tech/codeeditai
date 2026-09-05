/**
 * printService.ts
 *
 * Dedicated Print and PDF generation service.
 * Clones document pages into a clean #print-root container,
 * removes zoom transforms and editor chrome, and triggers native print.
 */

export const printService = {
  printDocument(): void {
    // 1. Locate all document pages rendered in the workspace
    const pageElements = document.querySelectorAll("section[data-page-id]");
    if (pageElements.length === 0) {
      window.print();
      return;
    }

    // 2. Clean up any existing print root
    const existing = document.getElementById("print-root");
    if (existing) {
      existing.remove();
    }

    // 3. Create the dedicated print root container
    const printRoot = document.createElement("div");
    printRoot.id = "print-root";
    printRoot.className = "print-area";

    // 4. Clone and sanitize each document page
    pageElements.forEach((pageEl) => {
      const clone = pageEl.cloneNode(true) as HTMLElement;

      // Remove editor zoom transforms and margins
      clone.style.transform = "none";
      clone.style.transformOrigin = "initial";
      clone.style.marginBottom = "0";
      clone.style.outline = "none";

      // Preserve custom page borders while removing default editor focus border
      const pageElHtml = pageEl as HTMLElement;
      const hasCustomBorder =
        pageElHtml.style.border ||
        pageElHtml.style.borderTop ||
        pageElHtml.style.borderBottom ||
        pageElHtml.style.borderLeft ||
        pageElHtml.style.borderRight;

      if (!hasCustomBorder) {
        clone.style.border = "none";
        clone.style.boxShadow = "none";
      }

      // Apply print classes
      clone.classList.add("print-page", "print-preview-page");

      // Remove editor-only overlays and handles
      const editorElements = clone.querySelectorAll(
        "[data-editor-ui], [data-table-control], .print\\:hidden, .absolute.-left-12, [data-no-print]"
      );
      editorElements.forEach((el) => el.remove());

      // Ensure editable attributes are cleaned
      const editables = clone.querySelectorAll("[contenteditable]");
      editables.forEach((el) => {
        el.removeAttribute("contenteditable");
        el.removeAttribute("suppresscontenteditablewarning");
      });

      printRoot.appendChild(clone);
    });

    // 5. Append print root to body and set active flag
    document.body.appendChild(printRoot);
    document.body.classList.add("printing-active");

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      if (printRoot.parentNode) {
        printRoot.parentNode.removeChild(printRoot);
      }
      document.body.classList.remove("printing-active");
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);

    // 6. Launch native print on the next animation frame
    requestAnimationFrame(() => {
      window.print();
      // Fallback cleanup in case afterprint does not fire
      setTimeout(cleanup, 2000);
    });
  },
};
