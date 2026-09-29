// appendicesApi.ts
// Formats dynamic TOC, TOT, and TOF entries as Word-styled HTML blocks for document insertion.
import { appendicesService, type AppendixItem } from "./appendicesService";

function getEditorFontFamily(): string {
  const root = document.querySelector('[contenteditable="true"]') as HTMLElement | null;
  if (!root) return "Calibri, sans-serif";
  const inline = root.style.fontFamily;
  if (inline) return inline;
  const computed = getComputedStyle(root).fontFamily;
  return computed || "Calibri, sans-serif";
}

function generateList(items: AppendixItem[], className: string): string {
  const font = getEditorFontFamily();

  const entriesHtml = items
    .map((item) => {
      const indent = item.level && item.level > 1 ? `padding-left: ${(item.level - 1) * 20}px;` : "";
      return `
        <p class="${className}-item" style="margin: 3px 0; font-family: ${font}; font-size: 11pt; line-height: 1.5; ${indent}">
          <a href="#${item.id}" style="text-decoration: none; color: inherit; display: flex; align-items: baseline; justify-content: space-between; width: 100%;">
            <span style="font-weight: ${item.level === 1 ? '600' : '400'}; color: #0f172a; white-space: nowrap;">${item.title}</span>
            <span style="flex: 1; border-bottom: 1.5px dotted #64748b; margin: 0 6px 3px 8px; min-width: 20px;"></span>
            <span style="font-weight: ${item.level === 1 ? '600' : '400'}; color: #0f172a;">${item.page}</span>
          </a>
        </p>
      `;
    })
    .join("");

  return `<div class="${className}" data-appendix="true" data-appendix-type="${className}" contenteditable="false" style="margin: 12px 0; font-family: ${font}; user-select: all;">${entriesHtml}</div>`;
}

export const appendicesApi = {
  name: "appendicesApi" as const,

  insertTOC: () => {
    const tocItems = appendicesService.getTOC();
    if (!tocItems?.length) {
      const font = getEditorFontFamily();
      return `<div class="toc" data-appendix="true" data-appendix-type="toc" contenteditable="false" style="margin: 8px 0; font-family: ${font}; user-select: all;"><p style="margin: 3px 0; font-size: 11pt; color: #0f172a;">No table of contents entries found.</p></div>`;
    }
    return generateList(tocItems, "toc");
  },

  insertTOT: () => {
    const totItems = appendicesService.getTOT();
    const font = getEditorFontFamily();
    if (!totItems?.length) {
      return `<div class="tot" data-appendix="true" data-appendix-type="tot" contenteditable="false" style="margin: 8px 0; font-family: ${font}; user-select: all;"><p style="margin: 3px 0; font-size: 11pt; color: #0f172a;">No table entries found.</p></div>`;
    }
    return generateList(totItems, "tot");
  },

  insertTOF: () => {
    const tofItems = appendicesService.getTOF();
    const font = getEditorFontFamily();
    if (!tofItems?.length) {
      return `<div class="tof" data-appendix="true" data-appendix-type="tof" contenteditable="false" style="margin: 8px 0; font-family: ${font}; user-select: all;"><p style="margin: 3px 0; font-size: 11pt; color: #0f172a;">No table of figures entries found.</p></div>`;
    }
    return generateList(tofItems, "tof");
  },

  insertAll: () => {
    const font = getEditorFontFamily();
    const tocItems = appendicesService.getTOC();
    const totItems = appendicesService.getTOT();
    const tofItems = appendicesService.getTOF();

    let bodyHtml = "";

    // TOC section
    if (tocItems.length > 0) {
      const tocEntries = tocItems
        .map((item) => {
          const indent = item.level && item.level > 1 ? `padding-left: ${(item.level - 1) * 20}px;` : "";
          return `
            <p class="toc-item" style="margin: 3px 0; font-size: 11pt; line-height: 1.5; ${indent}">
              <a href="#${item.id}" style="text-decoration: none; color: inherit; display: flex; align-items: baseline; justify-content: space-between; width: 100%;">
                <span style="font-weight: ${item.level === 1 ? '600' : '400'}; color: #0f172a; white-space: nowrap;">${item.title}</span>
                <span style="flex: 1; border-bottom: 1.5px dotted #64748b; margin: 0 6px 3px 8px; min-width: 20px;"></span>
                <span style="font-weight: ${item.level === 1 ? '600' : '400'}; color: #0f172a;">${item.page}</span>
              </a>
            </p>
          `;
        })
        .join("");
      bodyHtml += `<div class="toc-section" style="margin-bottom: 6px;">${tocEntries}</div>`;
    } else {
      bodyHtml += `<p style="margin: 3px 0; font-size: 11pt; color: #0f172a;">No table of contents entries found.</p>`;
    }

    // TOT section
    if (totItems.length > 0) {
      const totEntries = totItems
        .map((item) => `
          <p class="tot-item" style="margin: 3px 0; font-size: 11pt; line-height: 1.5;">
            <a href="#${item.id}" style="text-decoration: none; color: inherit; display: flex; align-items: baseline; justify-content: space-between; width: 100%;">
              <span style="font-weight: 500; color: #0f172a; white-space: nowrap;">${item.title}</span>
              <span style="flex: 1; border-bottom: 1.5px dotted #64748b; margin: 0 6px 3px 8px; min-width: 20px;"></span>
              <span style="font-weight: 500; color: #0f172a;">${item.page}</span>
            </a>
          </p>
        `)
        .join("");
      bodyHtml += `<div class="tot-section" style="margin-bottom: 6px;">${totEntries}</div>`;
    } else {
      bodyHtml += `<p style="margin: 3px 0; font-size: 11pt; color: #0f172a;">No table entries found.</p>`;
    }

    // TOF section
    if (tofItems.length > 0) {
      const tofEntries = tofItems
        .map((item) => `
          <p class="tof-item" style="margin: 3px 0; font-size: 11pt; line-height: 1.5;">
            <a href="#${item.id}" style="text-decoration: none; color: inherit; display: flex; align-items: baseline; justify-content: space-between; width: 100%;">
              <span style="font-weight: 500; color: #0f172a; white-space: nowrap;">${item.title}</span>
              <span style="flex: 1; border-bottom: 1.5px dotted #64748b; margin: 0 6px 3px 8px; min-width: 20px;"></span>
              <span style="font-weight: 500; color: #0f172a;">${item.page}</span>
            </a>
          </p>
        `)
        .join("");
      bodyHtml += `<div class="tof-section" style="margin-bottom: 6px;">${tofEntries}</div>`;
    } else {
      bodyHtml += `<p style="margin: 3px 0; font-size: 11pt; color: #0f172a;">No table of figures entries found.</p>`;
    }

    return `<div class="appendices-block" data-appendix="true" data-appendix-type="all" contenteditable="false" style="margin: 14px 0; font-family: ${font}; user-select: all;">${bodyHtml}</div>`;
  },
};
