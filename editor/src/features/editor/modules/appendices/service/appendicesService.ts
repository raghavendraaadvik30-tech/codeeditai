// appendicesService.ts
// Scans the active editor document to extract TOC, TOT, and TOF entries dynamically.

export interface AppendixItem {
  id: string;
  title: string;
  page: number;
  type: "toc" | "tot" | "tof";
  level?: number;
}

// Helper to get exactly ONE container element per page in the document
function getDocumentPageList(): HTMLElement[] {
  // Query only the unique section container per page
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>('section[data-page-id]')
  );
  if (sections.length > 0) return sections;

  // Fallback to data-editor-page if sections are not used
  const editorPages = Array.from(
    document.querySelectorAll<HTMLElement>('div[data-editor-page]')
  );
  if (editorPages.length > 0) return editorPages;

  // Fallback to distinct contenteditable elements
  return Array.from(
    document.querySelectorAll<HTMLElement>('div[contenteditable="true"]')
  );
}

function resolvePageNumber(el: HTMLElement, pages: HTMLElement[]): number {
  if (pages.length === 0) return 1;

  // 1. Direct contains check: does any page element contain el?
  const idx = pages.findIndex((p) => p === el || p.contains(el));
  if (idx !== -1) return idx + 1;

  // 2. Check closest section or container with data-page-id
  const pageContainer = el.closest<HTMLElement>(
    'section[data-page-id], div[data-page-id], div[data-editor-page]'
  );
  const pageId =
    pageContainer?.getAttribute("data-page-id") ||
    pageContainer?.getAttribute("data-editor-page");

  if (pageId) {
    const idIdx = pages.findIndex(
      (p) =>
        p.getAttribute("data-page-id") === pageId ||
        p.getAttribute("data-editor-page") === pageId
    );
    if (idIdx !== -1) return idIdx + 1;
  }

  // 3. Fallback: data-page-index attribute
  const pIndexAttr = pageContainer?.getAttribute("data-page-index");
  if (pIndexAttr) {
    const parsed = parseInt(pIndexAttr, 10);
    if (!isNaN(parsed)) return parsed + 1;
  }

  return 1;
}

export const appendicesService = {
  getTOC(): AppendixItem[] {
    const pages = getDocumentPageList();
    const items: AppendixItem[] = [];
    const seenTitles = new Set<string>();

    if (pages.length > 0) {
      pages.forEach((pageEl, pageIdx) => {
        const pageNum = pageIdx + 1;

        // Find genuine headings only
        const headings = pageEl.querySelectorAll<HTMLElement>(
          'h1, h2, h3, h4, h5, h6, [data-heading], .heading-1, .heading-2, .heading-3, [data-style*="Heading"]'
        );

        headings.forEach((el, index) => {
          // EXCLUDE any element inside an appendix, table of contents, table, citation, bibliography, header/footer
          if (
            el.closest(
              '[data-appendix], .toc, .tot, .tof, .appendices-block, .document-appendix, .citation, .bibliography-section, header, footer, table, [data-table-control]'
            )
          ) {
            return;
          }

          let text = el.textContent?.trim() || "";
          if (!text) return;

          // Normalize whitespace
          text = text.replace(/\s+/g, " ");

          // Ignore any appendix titles, notices or dot leaders
          if (
            text.startsWith("No table") ||
            text.startsWith("Table of") ||
            text.includes("......") ||
            text.startsWith("QUICK INSERT") ||
            text.startsWith("REGISTERED SOURCES")
          ) {
            return;
          }

          if (seenTitles.has(text)) {
            return;
          }
          seenTitles.add(text);

          const tag = el.tagName.toLowerCase();
          let level = 1;
          if (tag === "h2" || /^\d+\.\d+\s+/.test(text)) {
            level = 2;
          } else if (tag === "h3" || /^\d+\.\d+\.\d+\s+/.test(text)) {
            level = 3;
          }

          const id = el.id || `heading-toc-${pageNum}-${index + 1}`;
          if (!el.id) el.id = id;

          items.push({
            id,
            title: text,
            page: pageNum,
            type: "toc",
            level,
          });
        });
      });
    }

    return items;
  },

  getTOT(): AppendixItem[] {
    // Scan across all document pages and editable regions
    const tables = Array.from(
      document.querySelectorAll<HTMLTableElement>(
        'section[data-page-id] table, [contenteditable="true"] table, .editor-page table, table'
      )
    );

    const pages = getDocumentPageList();

    // If no tables found in DOM, check for standalone table captions
    if (tables.length === 0) {
      const captions = Array.from(document.querySelectorAll<HTMLElement>('.doc-table-caption'));
      if (captions.length === 0) return [];

      return captions.map((cap, idx) => {
        const title = cap.textContent?.trim() || `Table ${idx + 1}`;
        const page = resolvePageNumber(cap, pages);
        const id = cap.id || `table-tot-${idx + 1}`;
        if (!cap.id) cap.id = id;
        return {
          id,
          title,
          page,
          type: "tot",
        };
      });
    }

    const items: AppendixItem[] = [];
    const seenTables = new Set<HTMLTableElement>();

    tables.forEach((el) => {
      // Exclude tables inside sidebar, dialogs, or UI controls only
      const isUiElement = Boolean(
        el.closest('[role="dialog"], aside, nav, .sidebar, .left-overlay, .modal, [data-sidebar]')
      );
      if (seenTables.has(el) || isUiElement) {
        return;
      }
      seenTables.add(el);

      // 1. Look for preceding sibling with .doc-table-caption or text like "Table 1: ..."
      let title = "";
      let foundCapElement: HTMLElement | null = null;
      let prev = el.previousElementSibling;
      let count = 0;
      while (prev && count < 6) {
        const capChild = prev.classList.contains("doc-table-caption")
          ? (prev as HTMLElement)
          : prev.querySelector<HTMLElement>(".doc-table-caption");
        if (capChild && capChild.textContent?.trim()) {
          title = capChild.textContent.trim();
          foundCapElement = capChild;
          break;
        }
        const text = prev.textContent?.trim() || "";
        if (/^\s*Table\s+\d+/i.test(text) && text.length < 150) {
          title = text;
          foundCapElement = prev as HTMLElement;
          break;
        }
        if (prev.tagName === "TABLE" || prev.tagName === "H1" || prev.tagName === "H2") break;
        prev = prev.previousElementSibling;
        count++;
      }

      // 2. Check parent wrapper's previous sibling
      if (!title && el.parentElement) {
        let parentPrev = el.parentElement.previousElementSibling;
        let pCount = 0;
        while (parentPrev && pCount < 4) {
          const capChild = parentPrev.classList.contains("doc-table-caption")
            ? (parentPrev as HTMLElement)
            : parentPrev.querySelector<HTMLElement>(".doc-table-caption");
          if (capChild && capChild.textContent?.trim()) {
            title = capChild.textContent.trim();
            foundCapElement = capChild;
            break;
          }
          const text = parentPrev.textContent?.trim() || "";
          if (/^\s*Table\s+\d+/i.test(text) && text.length < 150) {
            title = text;
            foundCapElement = parentPrev as HTMLElement;
            break;
          }
          parentPrev = parentPrev.previousElementSibling;
          pCount++;
        }
      }

      // 3. Check table caption element or attributes
      if (!title) {
        title = el.querySelector("caption")?.textContent?.trim() || "";
      }
      if (!title) {
        title = el.getAttribute("data-title") || el.getAttribute("title") || "";
      }

      // 4. Check parent container for .doc-table-caption
      if (!title && el.parentElement) {
        const cap = el.parentElement.querySelector<HTMLElement>(".doc-table-caption");
        if (cap && cap.textContent?.trim()) {
          title = cap.textContent.trim();
          foundCapElement = cap;
        }
      }

      // Enforce sequential table numbering (Table 1, Table 2, Table 3...)
      const tableNum = items.length + 1;
      if (!title) {
        title = `Table ${tableNum}`;
      } else if (/^Table\s+\d+/i.test(title)) {
        title = title.replace(/^Table\s+\d+/i, `Table ${tableNum}`);
      } else if (/^Table\b/i.test(title)) {
        title = title.replace(/^Table\b/i, `Table ${tableNum}`);
      } else {
        title = `Table ${tableNum}: ${title}`;
      }

      // Keep the DOM caption synchronized so the editor text itself displays Table 1, Table 2...
      if (foundCapElement && /^Table\s+\d+/i.test(foundCapElement.textContent || "")) {
        foundCapElement.textContent = foundCapElement.textContent!.replace(
          /^Table\s+\d+/i,
          `Table ${tableNum}`
        );
      }

      // Determine page number accurately across multi-page document
      const page = resolvePageNumber(el, pages);

      const id = el.id || el.previousElementSibling?.id || `table-tot-${page}-${items.length + 1}`;
      if (!el.id) el.id = id;

      items.push({
        id,
        title,
        page,
        type: "tot",
      });
    });

    return items;
  },

  getTOF(): AppendixItem[] {
    const rawElements = Array.from(
      document.querySelectorAll<HTMLElement>(
        'section[data-page-id] figure, section[data-page-id] .editor-figure, section[data-page-id] img:not([data-ui]), [contenteditable="true"] figure, [contenteditable="true"] .editor-figure, [contenteditable="true"] img:not([data-ui])'
      )
    );

    if (rawElements.length === 0) {
      return [];
    }

    const pages = getDocumentPageList();

    const items: AppendixItem[] = [];
    const seenElements = new Set<HTMLElement>();
    const seenSrcs = new Set<string>();

    rawElements.forEach((el) => {
      const isUiElement = Boolean(
        el.closest('[role="dialog"], aside, nav, .sidebar, .left-overlay, .modal, [data-sidebar], header, footer')
      );
      if (isUiElement) return;

      // Skip img elements that are inside a figure container (figure container handles it)
      if (el.tagName.toLowerCase() === "img" && el.closest("figure, .editor-figure")) {
        return;
      }

      if (seenElements.has(el)) return;
      seenElements.add(el);

      const img =
        el.tagName.toLowerCase() === "img"
          ? (el as HTMLImageElement)
          : el.querySelector<HTMLImageElement>("img");
      const src = img?.src || "";
      if (src && seenSrcs.has(src)) {
        return;
      }
      if (src) seenSrcs.add(src);

      const figNumber = items.length + 1;
      const caption = el.querySelector("figcaption, .doc-figure-caption")?.textContent?.trim();
      const alt =
        img?.getAttribute("alt") ||
        img?.getAttribute("title") ||
        el.getAttribute("data-title") ||
        el.getAttribute("title");
      let title = caption || alt || "";

      if (!title) {
        let prev = el.previousElementSibling;
        let count = 0;
        while (prev && count < 4) {
          const text = prev.textContent?.trim() || "";
          if (/^\s*Figure\s+\d+/i.test(text)) {
            title = text;
            break;
          }
          prev = prev.previousElementSibling;
          count++;
        }
      }

      if (!title) {
        title = `Figure ${figNumber}`;
      }

      const page = resolvePageNumber(el, pages);

      const id = el.id || `fig-tof-${page}-${figNumber}`;
      if (!el.id) el.id = id;

      items.push({
        id,
        title,
        page,
        type: "tof",
      });
    });

    return items;
  },
};
