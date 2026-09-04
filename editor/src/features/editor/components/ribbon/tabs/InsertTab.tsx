/* ==========================================================================
   InsertTab.tsx
   --------------------------------------------------------------------------
   Purpose:
   Provides the comprehensive "Insert" ribbon tab for the Document Editor.

   Responsibilities:
   1. Page Operations:
      - Blank Page: Inserts a new empty page immediately after the active page.
      - Page Break: Splits document content at cursor or inserts a page break.
      - Delete Page: Safely deletes the currently active page.
   2. Page Numbers Dropdown:
      - Quick insertion of page numbers (Header, Footer, Inline at Cursor).
      - Formatting selection (Arabic, Roman, Alphabetic).
      - Page number removal option.
   3. Table Insertion:
      - Interactive Quick Grid Picker (hover up to 8x8 and click).
      - Custom Table Builder modal with configurable rows, columns, headers, and styles.
   4. Media & Symbols:
      - Image insertion via URL prompt.
      - Hyperlink creation on selected text.
      - Symbol insertion (mathematical & special characters).
   ========================================================================== */

import { useState, useRef, useEffect } from "react";
import {
  FileText,
  CornerDownLeft,
  Trash2,
  ChevronDown,
  Hash,
  Table as TableIcon,
  Image,
  Link,
  Sigma,
  AlignLeft,
  AlignCenter,
  AlignRight,
  X,
  Sliders,
} from "lucide-react";

// Ribbon UI control components
import RibbonButton from "../controls/RibbonButton";
import RibbonDivider from "../controls/RibbonDivider";

// Table Components
import { TableGridPicker, TableInsertDialog } from "../../../modules/tables/components";

// Document model and editor state hooks
import { useDocumentModel } from "../../../store/documentModel";
import { useEditor } from "../../../context/EditorContext";

export default function InsertTab() {
  // ------------------------------------------------------------------------
  // State and Store Hooks
  // ------------------------------------------------------------------------
  const {
    model,
    activePage,
    setActivePage,
    addPage,
    removePage,
    setPageHtml,
    updateSection,
  } = useDocumentModel();

  const { editorRef, insertHTML } = useEditor();

  // Dropdown states
  const [pageNumberMenuOpen, setPageNumberMenuOpen] = useState(false);
  const [tableMenuOpen, setTableMenuOpen] = useState(false);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);

  // References for click-outside detection
  const pageNumberRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);

  // ------------------------------------------------------------------------
  // Click-Outside Listener to close dropdown menus
  // ------------------------------------------------------------------------
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (pageNumberRef.current && !pageNumberRef.current.contains(target)) {
        setPageNumberMenuOpen(false);
      }
      if (tableRef.current && !tableRef.current.contains(target)) {
        setTableMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Active section identification for header/footer and page number configuration
  const currentPageObj = model.pages.find((p) => p.id === activePage);
  const activeSectionId = currentPageObj?.sectionId || model.sections[0]?.id;

  // Active page index (1-based)
  const activePageIndex = model.pages.findIndex((p) => p.id === activePage);
  const currentPageNumber = activePageIndex >= 0 ? activePageIndex + 1 : 1;
  const totalPages = model.pages.length || 1;

  // ------------------------------------------------------------------------
  // Helper: Execute Raw HTML insertion into the active editor
  // ------------------------------------------------------------------------
  const handleInsertHTML = (html: string) => {
    if (insertHTML) {
      insertHTML(html);
    } else {
      editorRef.current?.focus();
      document.execCommand("insertHTML", false, html);
    }
  };

  // ------------------------------------------------------------------------
  // Action 1: Add Blank Page
  // Inserts a new blank page directly after current active page
  // and smoothly focuses into it.
  // ------------------------------------------------------------------------
  const handleBlankPage = () => {
    const targetPageId = activePage || model.pages[model.pages.length - 1]?.id;
    addPage(targetPageId ?? undefined);

    setTimeout(() => {
      const pageElements = document.querySelectorAll("section[data-page-id]");
      const lastPageEl = pageElements[pageElements.length - 1];
      const editable = lastPageEl?.querySelector('[contenteditable="true"]') as HTMLElement | null;
      if (editable) {
        editable.focus();
        editable.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 80);
  };

  // ------------------------------------------------------------------------
  // Action 2: Page Break
  // If cursor is inside text, splits trailing content onto a new page.
  // Otherwise, inserts a visible page break separator.
  // ------------------------------------------------------------------------
  const handlePageBreak = () => {
    const sel = window.getSelection();
    const targetPageId = activePage || model.pages[model.pages.length - 1]?.id;

    if (sel && sel.rangeCount > 0 && targetPageId) {
      const range = sel.getRangeAt(0);
      const node = range.startContainer;
      const el = (node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement) as HTMLElement | null;
      const pageEditable = el?.closest('[contenteditable="true"]') as HTMLElement | null;

      if (pageEditable && pageEditable.contains(range.commonAncestorContainer)) {
        const splitRange = document.createRange();
        splitRange.setStart(range.endContainer, range.endOffset);
        splitRange.setEndAfter(pageEditable.lastChild || pageEditable);

        const fragment = splitRange.extractContents();
        const tempContainer = document.createElement("div");
        tempContainer.appendChild(fragment);

        const remainingHtml = pageEditable.innerHTML.trim() || "<p><br/></p>";
        const splitHtml = tempContainer.innerHTML.trim() || "<p><br/></p>";

        setPageHtml(targetPageId, remainingHtml);
        addPage(targetPageId);

        setTimeout(() => {
          const allPages = model.pages;
          const currentIdx = allPages.findIndex((p) => p.id === targetPageId);
          const nextTarget = allPages[currentIdx + 1]?.id || allPages[allPages.length - 1]?.id;
          if (nextTarget) {
            setPageHtml(nextTarget, splitHtml);
            const nextEl = document.querySelector(`section[data-page-id="${nextTarget}"] [contenteditable="true"]`) as HTMLElement | null;
            if (nextEl) {
              nextEl.focus();
              nextEl.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }
        }, 80);
        return;
      }
    }

    // Default fallback: Insert visual page-break divider line
    handleInsertHTML(
      `<div class="page-break" contenteditable="false" data-page-break="1" style="break-before:page;page-break-before:always;border-top:1.5px dashed #94a3b8;margin:24px 0;text-align:center;color:#94a3b8;font-size:10pt;user-select:none;">— Page Break —</div><p><br/></p>`
    );
  };

  // ------------------------------------------------------------------------
  // Action 3: Delete Current Page
  // Safely removes currently active page (disabled when only 1 page left)
  // ------------------------------------------------------------------------
  const handleDeletePage = () => {
    if (!activePage || model.pages.length <= 1) return;

    const activeIndex = model.pages.findIndex((p) => p.id === activePage);
    const fallbackIdx = activeIndex > 0 ? activeIndex - 1 : 0;
    const fallbackPageId = model.pages[fallbackIdx]?.id || model.pages[0]?.id;

    removePage(activePage);

    if (fallbackPageId) {
      setActivePage(fallbackPageId);
    }
  };

  // ------------------------------------------------------------------------
  // Action 4: Page Number Positioning & Formatting Handlers
  // ------------------------------------------------------------------------
  const setPageNumberPosition = (position: "header" | "footer", alignment: "left" | "center" | "right") => {
    if (activeSectionId) {
      updateSection(activeSectionId, {
        pageNumberPosition: position,
        pageNumberAlignment: alignment,
      });
    }
    setPageNumberMenuOpen(false);
  };

  const setPageNumberFormat = (format: "1" | "i" | "a") => {
    if (activeSectionId) {
      updateSection(activeSectionId, {
        pageNumberFormat: format,
      });
    }
    setPageNumberMenuOpen(false);
  };

  const removePageNumbers = () => {
    if (activeSectionId) {
      updateSection(activeSectionId, {
        pageNumberPosition: undefined,
      });
    }
    setPageNumberMenuOpen(false);
  };

  const insertInlinePageNumberField = (type: "current" | "page-x-of-y") => {
    const htmlSnippet =
      type === "page-x-of-y"
        ? `<span class="page-number-field" data-field="page-x-of-y" contenteditable="false" style="padding:1px 6px;border-radius:4px;background-color:#e0f2fe;color:#0369a1;font-weight:600;font-size:10pt;user-select:none;">Page ${currentPageNumber} of ${totalPages}</span>&nbsp;`
        : `<span class="page-number-field" data-field="page-number" contenteditable="false" style="padding:1px 6px;border-radius:4px;background-color:#e0f2fe;color:#0369a1;font-weight:600;font-size:10pt;user-select:none;">Page ${currentPageNumber}</span>&nbsp;`;

    handleInsertHTML(htmlSnippet);
    setPageNumberMenuOpen(false);
  };

  // ========================================================================
  // RENDER RIBBON CONTROLS
  // ========================================================================
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
      {/* ------------------------------------------------------------------
          1. BLANK PAGE BUTTON
          ------------------------------------------------------------------ */}
      <RibbonButton
        icon={<FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
        onClick={handleBlankPage}
      >
        Blank Page
      </RibbonButton>

      {/* ------------------------------------------------------------------
          2. PAGE BREAK BUTTON
          ------------------------------------------------------------------ */}
      <RibbonButton
        icon={<CornerDownLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
        onClick={handlePageBreak}
      >
        Page Break
      </RibbonButton>

      {/* ------------------------------------------------------------------
          3. DELETE PAGE BUTTON (Disabled if document has only 1 page)
          ------------------------------------------------------------------ */}
      <RibbonButton
        icon={<Trash2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />}
        onClick={handleDeletePage}
        disabled={model.pages.length <= 1}
      >
        Delete Page
      </RibbonButton>

      {/* ------------------------------------------------------------------
          DIVIDER
          ------------------------------------------------------------------ */}
      <RibbonDivider />

      {/* ------------------------------------------------------------------
          4. PAGE NUMBER DROPDOWN BUTTON
          Styled with rounded light-blue badge matching Microsoft Word
          ------------------------------------------------------------------ */}
      <div className="relative inline-block" ref={pageNumberRef}>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setPageNumberMenuOpen((prev) => !prev)}
          className={`
            inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 h-8 text-xs font-medium transition-colors
            border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 hover:border-sky-300
            dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-950/60
          `}
          title="Configure Page Numbering"
        >
          <Hash className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
          <span>Page Number</span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-sky-600 dark:text-sky-400 transition-transform ${pageNumberMenuOpen ? "rotate-180" : ""
              }`}
          />
        </button>

        {/* Dropdown Menu */}
        {pageNumberMenuOpen && (
          <div
            className="
              absolute left-0 top-full mt-1.5 z-50 w-64 rounded-lg border border-slate-200 bg-white p-2 shadow-xl
              dark:border-slate-800 dark:bg-[#0f172a] text-xs space-y-2
            "
          >
            {/* Header Menu Title */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 px-1 dark:border-slate-800">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Page Numbering</span>
              <button
                type="button"
                onClick={() => setPageNumberMenuOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Section A: Current Position / Inline */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
                Insert At Cursor
              </div>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertInlinePageNumberField("current")}
                className="w-full text-left flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <span>Page Number</span>
                <span className="text-[10px] text-slate-400">Page {currentPageNumber}</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertInlinePageNumberField("page-x-of-y")}
                className="w-full text-left flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <span>Page X of Y</span>
                <span className="text-[10px] text-slate-400">{currentPageNumber} of {totalPages}</span>
              </button>
            </div>

            {/* Section B: Document Layout Location */}
            <div className="border-t border-slate-100 pt-1.5 dark:border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
                Header / Footer Position
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setPageNumberPosition("header", "left")}
                  className="flex flex-col items-center p-1.5 rounded border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                  title="Top Left Header"
                >
                  <AlignLeft className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-[10px] mt-0.5">Top Left</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setPageNumberPosition("header", "center")}
                  className="flex flex-col items-center p-1.5 rounded border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                  title="Top Center Header"
                >
                  <AlignCenter className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-[10px] mt-0.5">Top Center</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setPageNumberPosition("header", "right")}
                  className="flex flex-col items-center p-1.5 rounded border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                  title="Top Right Header"
                >
                  <AlignRight className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-[10px] mt-0.5">Top Right</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1 mt-1">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setPageNumberPosition("footer", "left")}
                  className="flex flex-col items-center p-1.5 rounded border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                  title="Bottom Left Footer"
                >
                  <AlignLeft className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-[10px] mt-0.5">Btm Left</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setPageNumberPosition("footer", "center")}
                  className="flex flex-col items-center p-1.5 rounded border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                  title="Bottom Center Footer"
                >
                  <AlignCenter className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-[10px] mt-0.5">Btm Center</span>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setPageNumberPosition("footer", "right")}
                  className="flex flex-col items-center p-1.5 rounded border border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                  title="Bottom Right Footer"
                >
                  <AlignRight className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-[10px] mt-0.5">Btm Right</span>
                </button>
              </div>
            </div>

            {/* Section C: Format Style */}
            <div className="border-t border-slate-100 pt-1.5 dark:border-slate-800">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
                Number Format
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setPageNumberFormat("1")}
                  className="flex-1 py-1 px-2 rounded border border-slate-100 hover:bg-slate-50 dark:border-slate-800 text-center font-medium"
                >
                  1, 2, 3
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setPageNumberFormat("i")}
                  className="flex-1 py-1 px-2 rounded border border-slate-100 hover:bg-slate-50 dark:border-slate-800 text-center font-medium"
                >
                  i, ii, iii
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setPageNumberFormat("a")}
                  className="flex-1 py-1 px-2 rounded border border-slate-100 hover:bg-slate-50 dark:border-slate-800 text-center font-medium"
                >
                  a, b, c
                </button>
              </div>
            </div>

            {/* Section D: Remove Page Numbers */}
            <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={removePageNumbers}
                className="w-full text-left py-1 px-2 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors"
              >
                Remove Page Numbers
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------
          DIVIDER
          ------------------------------------------------------------------ */}
      <RibbonDivider />

      {/* ------------------------------------------------------------------
          5. TABLE BUTTON & QUICK GRID DROPDOWN
          ------------------------------------------------------------------ */}
      <div className="relative inline-block" ref={tableRef}>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setTableMenuOpen((prev) => !prev)}
          className={`
            inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 h-8 text-xs font-medium transition-colors
            border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300
            dark:border-slate-700 dark:bg-[#111D29] dark:text-slate-200 dark:hover:bg-[#162534]
          `}
          title="Insert Table"
        >
          <TableIcon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span>Table</span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-400 transition-transform ${tableMenuOpen ? "rotate-180" : ""
              }`}
          />
        </button>

        {/* Table Dropdown Menu */}
        {tableMenuOpen && (
          <div
            className="
              absolute left-0 top-full mt-1.5 z-50 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-2xl
              dark:border-slate-800 dark:bg-[#0c1929] space-y-3
            "
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Insert Table
              </span>
              <button
                type="button"
                onClick={() => setTableMenuOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Quick Grid Picker */}
            <div onClick={() => setTableMenuOpen(false)}>
              <TableGridPicker />
            </div>

            {/* Custom Table Dialog Trigger */}
            <div className="border-t border-slate-100 pt-2 dark:border-slate-800">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setTableMenuOpen(false);
                  setTableDialogOpen(true);
                }}
                className="
                  flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50
                  py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-300
                  dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800
                "
              >
                <Sliders className="h-3.5 w-3.5 text-blue-500" />
                <span>Custom Table Builder...</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Table Modal Dialog */}
      <TableInsertDialog
        open={tableDialogOpen}
        onClose={() => setTableDialogOpen(false)}
      />

      {/* ------------------------------------------------------------------
          6. IMAGE INSERTION
          ------------------------------------------------------------------ */}
      <RibbonButton
        icon={<Image className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
        onClick={() => {
          const url = window.prompt("Enter image URL (PNG, JPG, SVG)");
          if (!url) return;
          handleInsertHTML(
            `<img src="${url}" alt="Inserted Image" style="max-width:100%;border-radius:4px;margin:8px 0;" />`
          );
        }}
      >
        Image
      </RibbonButton>

      {/* ------------------------------------------------------------------
          DIVIDER
          ------------------------------------------------------------------ */}
      <RibbonDivider />

      {/* ------------------------------------------------------------------
          7. HYPERLINK
          ------------------------------------------------------------------ */}
      <RibbonButton
        icon={<Link className="h-4 w-4 text-sky-600 dark:text-sky-400" />}
        onClick={() => {
          const url = window.prompt("Enter URL (https://...)");
          if (!url) return;
          editorRef.current?.focus();
          document.execCommand("createLink", false, url);
        }}
      >
        Link
      </RibbonButton>

      {/* ------------------------------------------------------------------
          8. SPECIAL SYMBOL
          ------------------------------------------------------------------ */}
      <RibbonButton
        icon={<Sigma className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
        onClick={() => handleInsertHTML("&Sigma;")}
      >
        Symbol
      </RibbonButton>
    </div>
  );
}
