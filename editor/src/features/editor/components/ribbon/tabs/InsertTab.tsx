/* ==========================================================================
   InsertTab.tsx
   --------------------------------------------------------------------------
   Purpose:
   Provides the comprehensive "Insert" ribbon tab for the Document Editor,
   featuring authentic Microsoft Word-style Page Number galleries, formatting dialog,
   and document page operations.

   Responsibilities:
   1. Page Operations:
      - Blank Page: Inserts a new empty page immediately after the active page.
      - Page Break: Splits document content at cursor or inserts a page break.
      - Delete Page: Safely deletes the currently active page.
   2. Microsoft Word-Style Page Numbers:
      - Top of Page (Header) with visual Plain Number 1 (Left), Plain Number 2 (Center), Plain Number 3 (Right) thumbnails.
      - Bottom of Page (Footer) with visual Plain Number 1 (Left), Plain Number 2 (Center), Plain Number 3 (Right) thumbnails.
      - Current Position (Inline) with Plain Number and Page X of Y options.
      - Authentic MS Word "Page Number Format" modal dialog (1,2,3 / i,ii,iii / a,b,c).
      - Remove Page Numbers option to instantly clear headers/footers.
   ========================================================================== */

import { useState, useRef, useEffect } from "react";
import {
  FileText,
  CornerDownLeft,
  Trash2,
  ChevronDown,
  ChevronRight,
  Hash,
  ArrowUp,
  ArrowDown,
  Settings,
  X,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";

// Ribbon UI control components
import RibbonButton from "../controls/RibbonButton";
import RibbonDivider from "../controls/RibbonDivider";

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

  const {
    editorRef,
    insertHTML,
  } = useEditor();

  // Page Number dropdown & submenu states
  const [pageNumberMenuOpen, setPageNumberMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<"top" | "bottom" | "current" | null>(null);

  // Format modal dialog state
  const [formatModalOpen, setFormatModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"1" | "i" | "a">("1");
  const [numberingOption, setNumberingOption] = useState<"continue" | "startAt">("continue");
  const [startAtValue, setStartAtValue] = useState<number>(1);

  // References for click-outside detection
  const pageNumberRef = useRef<HTMLDivElement | null>(null);

  // ------------------------------------------------------------------------
  // Click-Outside Listener to close dropdown menus
  // ------------------------------------------------------------------------
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (pageNumberRef.current && !pageNumberRef.current.contains(target)) {
        setPageNumberMenuOpen(false);
        setActiveSubmenu(null);
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
  // Action 4: MS Word Page Number Handlers
  // ------------------------------------------------------------------------
  const handleSelectTop = (alignment: "left" | "center" | "right") => {
    if (activeSectionId) {
      updateSection(activeSectionId, {
        pageNumberPosition: "header",
        pageNumberAlignment: alignment,
      });
    }
    setPageNumberMenuOpen(false);
    setActiveSubmenu(null);
  };

  const handleSelectBottom = (alignment: "left" | "center" | "right") => {
    if (activeSectionId) {
      updateSection(activeSectionId, {
        pageNumberPosition: "footer",
        pageNumberAlignment: alignment,
      });
    }
    setPageNumberMenuOpen(false);
    setActiveSubmenu(null);
  };

  const handleSelectCurrent = (type: "current" | "page-x-of-y") => {
    const htmlSnippet =
      type === "page-x-of-y"
        ? `<span class="page-number-field" data-field="page-x-of-y" contenteditable="false" style="padding:1px 6px;border-radius:4px;background-color:#e0f2fe;color:#0369a1;font-weight:600;font-size:10pt;user-select:none;">Page ${currentPageNumber} of ${totalPages}</span>&nbsp;`
        : `<span class="page-number-field" data-field="page-number" contenteditable="false" style="padding:1px 6px;border-radius:4px;background-color:#e0f2fe;color:#0369a1;font-weight:600;font-size:10pt;user-select:none;">Page ${currentPageNumber}</span>&nbsp;`;

    handleInsertHTML(htmlSnippet);
    setPageNumberMenuOpen(false);
    setActiveSubmenu(null);
  };

  const handleRemovePageNumbers = () => {
    if (activeSectionId) {
      updateSection(activeSectionId, {
        pageNumberPosition: undefined,
      });
    }
    setPageNumberMenuOpen(false);
    setActiveSubmenu(null);
  };

  const handleApplyFormat = () => {
    if (activeSectionId) {
      updateSection(activeSectionId, {
        pageNumberFormat: selectedFormat,
      });
    }
    setFormatModalOpen(false);
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
          3. DELETE PAGE BUTTON
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
          4. MICROSOFT WORD-STYLE PAGE NUMBER DROPDOWN
          ------------------------------------------------------------------ */}
      <div className="relative inline-block" ref={pageNumberRef}>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setPageNumberMenuOpen((prev) => !prev);
            setActiveSubmenu(null);
          }}
          className={`
            inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 h-8 text-xs font-medium transition-colors
            border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 hover:border-sky-300
            dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-950/60
          `}
          title="Insert Page Number (Microsoft Word Style)"
        >
          <Hash className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
          <span>Page Number</span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-sky-600 dark:text-sky-400 transition-transform ${
              pageNumberMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Main MS Word Page Number Menu with Cascading Submenus */}
        {pageNumberMenuOpen && (
          <div
            className="
              absolute left-0 top-full mt-1.5 z-50 flex shadow-2xl rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0c1622]
            "
          >
            {/* Primary Word Menu List */}
            <div className="w-56 p-1.5 text-xs space-y-0.5">
              {/* Header Menu Title */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 px-2 mb-1 dark:border-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Page Number</span>
                <button
                  type="button"
                  onClick={() => {
                    setPageNumberMenuOpen(false);
                    setActiveSubmenu(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* 1. Top of Page Item */}
              <button
                type="button"
                onMouseEnter={() => setActiveSubmenu("top")}
                onClick={() => setActiveSubmenu(activeSubmenu === "top" ? null : "top")}
                className={`
                  w-full flex items-center justify-between px-2.5 py-2 rounded text-left transition-colors
                  ${
                    activeSubmenu === "top"
                      ? "bg-sky-50 text-sky-700 font-medium dark:bg-sky-950/60 dark:text-sky-300"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <ArrowUp className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Top of Page</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* 2. Bottom of Page Item */}
              <button
                type="button"
                onMouseEnter={() => setActiveSubmenu("bottom")}
                onClick={() => setActiveSubmenu(activeSubmenu === "bottom" ? null : "bottom")}
                className={`
                  w-full flex items-center justify-between px-2.5 py-2 rounded text-left transition-colors
                  ${
                    activeSubmenu === "bottom"
                      ? "bg-sky-50 text-sky-700 font-medium dark:bg-sky-950/60 dark:text-sky-300"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <ArrowDown className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Bottom of Page</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* 3. Current Position Item */}
              <button
                type="button"
                onMouseEnter={() => setActiveSubmenu("current")}
                onClick={() => setActiveSubmenu(activeSubmenu === "current" ? null : "current")}
                className={`
                  w-full flex items-center justify-between px-2.5 py-2 rounded text-left transition-colors
                  ${
                    activeSubmenu === "current"
                      ? "bg-sky-50 text-sky-700 font-medium dark:bg-sky-950/60 dark:text-sky-300"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Current Position</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* Divider */}
              <div className="my-1 border-t border-slate-200 dark:border-slate-800" />

              {/* 4. Format Page Numbers */}
              <button
                type="button"
                onMouseEnter={() => setActiveSubmenu(null)}
                onClick={() => {
                  setPageNumberMenuOpen(false);
                  setActiveSubmenu(null);
                  setFormatModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded text-left text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60 transition-colors"
              >
                <Settings className="h-3.5 w-3.5 text-slate-500" />
                <span>Format Page Numbers...</span>
              </button>

              {/* 5. Remove Page Numbers */}
              <button
                type="button"
                onMouseEnter={() => setActiveSubmenu(null)}
                onClick={handleRemovePageNumbers}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded text-left text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove Page Numbers</span>
              </button>
            </div>

            {/* Cascading Submenu Flyout for MS Word Visual Thumbnails */}
            {activeSubmenu && (
              <div className="w-60 border-l border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50/70 dark:bg-[#081018] space-y-2 max-h-[380px] overflow-y-auto">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  {activeSubmenu === "top"
                    ? "Top of Page (Header)"
                    : activeSubmenu === "bottom"
                    ? "Bottom of Page (Footer)"
                    : "Current Position"}
                </div>

                {/* Submenu Gallery: Top of Page */}
                {activeSubmenu === "top" && (
                  <div className="space-y-2">
                    {/* Plain Number 1 (Top Left) */}
                    <button
                      type="button"
                      onClick={() => handleSelectTop("left")}
                      className="group flex flex-col items-start gap-1 p-1.5 w-full rounded border border-slate-200 hover:border-sky-400 bg-white hover:bg-sky-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-sky-950/30 transition-all text-left"
                      title="Plain Number 1 (Header Left)"
                    >
                      <div className="w-full h-12 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xs p-1.5 flex flex-col justify-between shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">1</span>
                          <div className="w-16 h-0.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        </div>
                        <div className="space-y-1">
                          <div className="w-full h-0.5 bg-slate-200 dark:bg-slate-800/80 rounded-full" />
                          <div className="w-4/5 h-0.5 bg-slate-200 dark:bg-slate-800/80 rounded-full" />
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                        Plain Number 1
                      </span>
                    </button>

                    {/* Plain Number 2 (Top Center) */}
                    <button
                      type="button"
                      onClick={() => handleSelectTop("center")}
                      className="group flex flex-col items-start gap-1 p-1.5 w-full rounded border border-slate-200 hover:border-sky-400 bg-white hover:bg-sky-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-sky-950/30 transition-all text-left"
                      title="Plain Number 2 (Header Center)"
                    >
                      <div className="w-full h-12 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xs p-1.5 flex flex-col justify-between shadow-2xs">
                        <div className="flex items-center justify-center">
                          <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">1</span>
                        </div>
                        <div className="space-y-1">
                          <div className="w-full h-0.5 bg-slate-200 dark:bg-slate-800/80 rounded-full" />
                          <div className="w-4/5 h-0.5 bg-slate-200 dark:bg-slate-800/80 rounded-full" />
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                        Plain Number 2
                      </span>
                    </button>

                    {/* Plain Number 3 (Top Right) */}
                    <button
                      type="button"
                      onClick={() => handleSelectTop("right")}
                      className="group flex flex-col items-start gap-1 p-1.5 w-full rounded border border-slate-200 hover:border-sky-400 bg-white hover:bg-sky-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-sky-950/30 transition-all text-left"
                      title="Plain Number 3 (Header Right)"
                    >
                      <div className="w-full h-12 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xs p-1.5 flex flex-col justify-between shadow-2xs">
                        <div className="flex items-center justify-end">
                          <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">1</span>
                        </div>
                        <div className="space-y-1">
                          <div className="w-full h-0.5 bg-slate-200 dark:bg-slate-800/80 rounded-full" />
                          <div className="w-4/5 h-0.5 bg-slate-200 dark:bg-slate-800/80 rounded-full" />
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                        Plain Number 3
                      </span>
                    </button>
                  </div>
                )}

                {/* Submenu Gallery: Bottom of Page */}
                {activeSubmenu === "bottom" && (
                  <div className="space-y-2">
                    {/* Plain Number 1 (Bottom Left) */}
                    <button
                      type="button"
                      onClick={() => handleSelectBottom("left")}
                      className="group flex flex-col items-start gap-1 p-1.5 w-full rounded border border-slate-200 hover:border-sky-400 bg-white hover:bg-sky-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-sky-950/30 transition-all text-left"
                      title="Plain Number 1 (Footer Left)"
                    >
                      <div className="w-full h-12 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xs p-1.5 flex flex-col justify-between shadow-2xs">
                        <div className="space-y-1">
                          <div className="w-full h-0.5 bg-slate-200 dark:bg-slate-800/80 rounded-full" />
                          <div className="w-4/5 h-0.5 bg-slate-200 dark:bg-slate-800/80 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">1</span>
                          <div className="w-16 h-0.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                        Plain Number 1
                      </span>
                    </button>

                    {/* Plain Number 2 (Bottom Center) */}
                    <button
                      type="button"
                      onClick={() => handleSelectBottom("center")}
                      className="group flex flex-col items-start gap-1 p-1.5 w-full rounded border border-slate-200 hover:border-sky-400 bg-white hover:bg-sky-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-sky-950/30 transition-all text-left"
                      title="Plain Number 2 (Footer Center)"
                    >
                      <div className="w-full h-12 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xs p-1.5 flex flex-col justify-between shadow-2xs">
                        <div className="space-y-1">
                          <div className="w-full h-0.5 bg-slate-200 dark:bg-slate-800/80 rounded-full" />
                          <div className="w-4/5 h-0.5 bg-slate-200 dark:bg-slate-800/80 rounded-full" />
                        </div>
                        <div className="flex items-center justify-center">
                          <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">1</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                        Plain Number 2
                      </span>
                    </button>

                    {/* Plain Number 3 (Bottom Right) */}
                    <button
                      type="button"
                      onClick={() => handleSelectBottom("right")}
                      className="group flex flex-col items-start gap-1 p-1.5 w-full rounded border border-slate-200 hover:border-sky-400 bg-white hover:bg-sky-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-sky-950/30 transition-all text-left"
                      title="Plain Number 3 (Footer Right)"
                    >
                      <div className="w-full h-12 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xs p-1.5 flex flex-col justify-between shadow-2xs">
                        <div className="space-y-1">
                          <div className="w-full h-0.5 bg-slate-200 dark:bg-slate-800/80 rounded-full" />
                          <div className="w-4/5 h-0.5 bg-slate-200 dark:bg-slate-800/80 rounded-full" />
                        </div>
                        <div className="flex items-center justify-end">
                          <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">1</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                        Plain Number 3
                      </span>
                    </button>
                  </div>
                )}

                {/* Submenu Gallery: Current Position */}
                {activeSubmenu === "current" && (
                  <div className="space-y-2">
                    {/* Plain Number */}
                    <button
                      type="button"
                      onClick={() => handleSelectCurrent("current")}
                      className="group flex flex-col items-start gap-1 p-1.5 w-full rounded border border-slate-200 hover:border-sky-400 bg-white hover:bg-sky-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-sky-950/30 transition-all text-left"
                      title="Insert Current Page Number at cursor"
                    >
                      <div className="w-full h-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xs px-2 flex items-center gap-1.5 shadow-2xs">
                        <span className="text-slate-300">abc</span>
                        <span className="h-4 w-0.5 bg-sky-500 animate-pulse" />
                        <span className="px-1 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-[10px] rounded">
                          {currentPageNumber}
                        </span>
                        <span className="text-slate-300">xyz</span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                        Plain Number
                      </span>
                    </button>

                    {/* Page X of Y */}
                    <button
                      type="button"
                      onClick={() => handleSelectCurrent("page-x-of-y")}
                      className="group flex flex-col items-start gap-1 p-1.5 w-full rounded border border-slate-200 hover:border-sky-400 bg-white hover:bg-sky-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-sky-950/30 transition-all text-left"
                      title="Insert Page X of Y at cursor"
                    >
                      <div className="w-full h-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xs px-2 flex items-center justify-center shadow-2xs">
                        <span className="px-1.5 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-[10px] rounded">
                          Page {currentPageNumber} of {totalPages}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                        Page X of Y (Bold Numbers)
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------
          PAGE NUMBER FORMAT MODAL DIALOG (Microsoft Word Style)
          ------------------------------------------------------------------ */}
      <Dialog open={formatModalOpen} onOpenChange={setFormatModalOpen}>
        <DialogContent className="max-w-md bg-white p-5 text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-[#0f172a] dark:text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold">
              <Hash className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              Page Number Format
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Number Format Select */}
            <div>
              <label className="mb-1.5 block font-semibold text-slate-700 dark:text-slate-300">
                Number format:
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value as "1" | "i" | "a")}
                className="w-full h-8 rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-800 shadow-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="1">1, 2, 3, ...</option>
                <option value="i">i, ii, iii, ...</option>
                <option value="a">a, b, c, ...</option>
              </select>
            </div>

            {/* Page Numbering Mode */}
            <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
              <span className="mb-2 block font-semibold text-slate-700 dark:text-slate-300">
                Page numbering:
              </span>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="pageNumberingType"
                    checked={numberingOption === "continue"}
                    onChange={() => setNumberingOption("continue")}
                    className="text-sky-600 focus:ring-sky-500"
                  />
                  <span>Continue from previous section</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="pageNumberingType"
                    checked={numberingOption === "startAt"}
                    onChange={() => setNumberingOption("startAt")}
                    className="text-sky-600 focus:ring-sky-500"
                  />
                  <span>Start at:</span>
                  <input
                    type="number"
                    min={1}
                    value={startAtValue}
                    onChange={(e) => setStartAtValue(Math.max(1, Number(e.target.value) || 1))}
                    disabled={numberingOption !== "startAt"}
                    className="w-16 h-6 px-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-50"
                  />
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFormatModalOpen(false)}
              className="h-8 px-3 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApplyFormat}
              className="h-8 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
