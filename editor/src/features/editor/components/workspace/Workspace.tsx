/*
### `Workspace.tsx` — Description

**Purpose:**
`Workspace.tsx` is the **main document editing workspace**. It displays document pages,
manages page editing, synchronizes content with the document model, handles zoom,
and provides true Word-style content-overflow pagination across pages.

**Pagination Rules:**
1. Enter does NOT mean "create a new page". Normal Enter only creates a normal new paragraph.
2. Content stays on the current page as long as there is available writing space.
3. Next page is created/used ONLY when actual document content genuinely exceeds the usable writing area.
4. If next page already exists, overflowing content is moved to that page.
5. If current page is the last page and content genuinely overflows, exactly ONE new page is created via addPage().
6. Ctrl + Enter remains dedicated to immediate manual Page Breaks.
7. Backspace at the beginning of a page navigates cleanly back to the previous page.
8. Dynamic page numbers in footers are based on actual page order (Page 1, Page 2, Page 3...).
*/

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useEditor } from "../../context/EditorContext";
import { useDocumentModel, type PageModel, type SectionModel, type PageBorderConfig } from "../../store/documentModel";
import { useHeaderFooter } from "../../modules/document/context/HeaderFooterContext";
import {
  TableControlsOverlay,
  TableFloatingFormatToolbar,
  TableContextMenu,
  type TableContextMenuState,
} from "../../modules/tables/components";
import DocumentRuler from "./DocumentRuler";

export default function Workspace() {
  const {
    model,
    activePage,
    setActivePage,
    setPageHtml,
    addPage,
    removePage,
    updateSection,
  } = useDocumentModel();

  const {
    isHeaderFooterActive,
    exitHeaderFooterMode,
  } = useHeaderFooter();

  useEffect(() => {
    const handleGlobalEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isHeaderFooterActive) {
        exitHeaderFooterMode();
      }
    };
    window.addEventListener("keydown", handleGlobalEscape);
    return () => window.removeEventListener("keydown", handleGlobalEscape);
  }, [isHeaderFooterActive, exitHeaderFooterMode]);

  const {
    zoom,
    isEditable,
    editorRef,
    aiPanelOpen,
    setAiPanelOpen,
  } = useEditor();

  const [activeTable, setActiveTable] = useState<HTMLTableElement | null>(null);
  const [tableContextMenu, setTableContextMenu] = useState<TableContextMenuState>({
    open: false,
    x: 0,
    y: 0,
    table: null,
    cell: null,
    savedRange: null,
  });

  // Unified global table selection tracking across all document pages
  useEffect(() => {
    const handleGlobalTableSelection = (e?: Event) => {
      // Do not clear activeTable if interacting with move/resize handle or table toolbar
      if (e && e.target instanceof Element) {
        if (e.target.closest("[data-editor-ui]") || e.target.closest("[data-table-control]")) {
          return;
        }

        const clickedTable = e.target.closest("table") as HTMLTableElement | null;
        if (clickedTable) {
          const pageContainer = clickedTable.closest('[contenteditable="true"]');
          if (pageContainer) {
            setActiveTable(clickedTable);
            const pageSection = clickedTable.closest("section[data-page-id]");
            const pageId = pageSection?.getAttribute("data-page-id");
            if (pageId && activePage !== pageId) {
              setActivePage(pageId);
            }
            return;
          }
        }
      }

      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const anchor = sel.anchorNode;
        const el = anchor?.nodeType === Node.ELEMENT_NODE ? (anchor as HTMLElement) : anchor?.parentElement;
        const table = el?.closest("table") as HTMLTableElement | null;
        if (table && table.closest('[contenteditable="true"]')) {
          setActiveTable(table);
          const pageSection = table.closest("section[data-page-id]");
          const pageId = pageSection?.getAttribute("data-page-id");
          if (pageId && activePage !== pageId) {
            setActivePage(pageId);
          }
          return;
        }
      }

      if (document.activeElement) {
        const table = document.activeElement.closest("table") as HTMLTableElement | null;
        if (table && table.closest('[contenteditable="true"]')) {
          setActiveTable(table);
          const pageSection = table.closest("section[data-page-id]");
          const pageId = pageSection?.getAttribute("data-page-id");
          if (pageId && activePage !== pageId) {
            setActivePage(pageId);
          }
          return;
        }
      }

      setActiveTable(null);
    };

    document.addEventListener("selectionchange", handleGlobalTableSelection);
    document.addEventListener("pointerdown", handleGlobalTableSelection);

    return () => {
      document.removeEventListener("selectionchange", handleGlobalTableSelection);
      document.removeEventListener("pointerdown", handleGlobalTableSelection);
    };
  }, [activePage, setActivePage]);

  // Close table context menu when navigating pages
  useEffect(() => {
    setTableContextMenu((prev) => (prev.open ? { ...prev, open: false } : prev));
  }, [activePage]);

  // Native contextmenu detection specifically for table cells (td, th)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Determine clicked element using closest("td, th")
      const cell = target.closest("td, th") as HTMLTableCellElement | null;
      const table = cell?.closest("table") as HTMLTableElement | null;

      if (cell && table) {
        const pageSection = table.closest("section[data-page-id]");
        if (pageSection) {
          // 1. Prevent browser's default context menu
          e.preventDefault();

          // 2. Update active table and active page
          setActiveTable(table);
          const pageId = pageSection.getAttribute("data-page-id");
          if (pageId && activePage !== pageId) {
            setActivePage(pageId);
          }

          // 3. Preserve text selection range if inside cell
          let savedRange: Range | null = null;
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const r = sel.getRangeAt(0);
            if (cell.contains(r.commonAncestorContainer)) {
              savedRange = r.cloneRange();
            }
          }

          // 4. Open table context menu at pointer position
          setTableContextMenu({
            open: true,
            x: e.clientX,
            y: e.clientY,
            table,
            cell,
            savedRange,
          });
          return;
        }
      }

      // If clicked outside a table cell, close any open table context menu and leave default behavior
      setTableContextMenu((prev) => (prev.open ? { ...prev, open: false } : prev));
    };

    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [activePage, setActivePage]);

  const activePageObj =
    model.pages.find((p) => p.id === activePage) ?? model.pages[0];
  const activeSection =
    model.sections.find((s) => s.id === activePageObj?.sectionId) ??
    model.sections[0];

  const isLandscape = activeSection?.orientation === "landscape";
  const baseWidth = activeSection?.paperSize?.width ?? 816;
  const baseHeight = activeSection?.paperSize?.height ?? 1056;
  const activePageWidth = isLandscape ? baseHeight : baseWidth;
  const activeMarginLeft = activeSection?.marginConfig?.left ?? 96;
  const activeMarginRight = activeSection?.marginConfig?.right ?? 96;

  return (
    <main
      className="
        relative
        flex
        h-full
        w-full
        min-w-0
        min-h-0
        flex-1
        flex-col
        overflow-x-auto
        overflow-y-auto
        bg-[#EEF4FA]
        dark:bg-[#050B11]
      "
    >
      {/* WORD HORIZONTAL RULER */}
      <DocumentRuler
        pageWidth={activePageWidth}
        zoom={zoom}
        marginLeft={activeMarginLeft}
        marginRight={activeMarginRight}
        onMarginChange={(newLeft, newRight) => {
          if (activeSection?.id) {
            updateSection(activeSection.id, {
              marginConfig: {
                top: activeSection.marginConfig?.top ?? 96,
                bottom: activeSection.marginConfig?.bottom ?? 96,
                left: newLeft,
                right: newRight,
              },
            });
          }
        }}
      />

      {/* DOCUMENT AREA */}
      <div
        className="
          flex
          w-full
          min-w-0
          flex-col
          items-center
          gap-8
          px-8
          py-8
          pb-16
        "
      >
        {(() => {
          const pageNumbersMap: Record<string, number> = {};
          let currentNum = 1;
          let currentSecId = "";

          model.pages.forEach((p, idx) => {
            const pSec =
              model.sections.find((s) => s.id === p.sectionId) ??
              model.sections[0];
            if (pSec && pSec.id !== currentSecId) {
              currentSecId = pSec.id;
              if (pSec.pageNumberStartAt !== undefined && pSec.pageNumberStartAt > 0) {
                currentNum = pSec.pageNumberStartAt;
              } else if (idx === 0) {
                currentNum = 1;
              }
            }
            pageNumbersMap[p.id] = currentNum;
            currentNum++;
          });

          return model.pages.map((page, index) => {
            const section =
              model.sections.find((s) => s.id === page.sectionId) ??
              model.sections[0];
            const isEffectiveActive = activePage
              ? activePage === page.id
              : index === 0;

            const sectionPages = model.pages.filter(
              (p) => p.sectionId === section?.id
            );
            const isFirstPageOfSection = sectionPages[0]?.id === page.id;

            let effectivePageBorders: PageBorderConfig | undefined = undefined;
            if (page.pageBorders !== undefined) {
              effectivePageBorders = page.pageBorders;
            } else if (section?.pageBorders) {
              const applyTo = section.pageBorders.applyTo;
              if (applyTo === "firstPage") {
                if (isFirstPageOfSection) {
                  effectivePageBorders = section.pageBorders;
                }
              } else if (applyTo === "exceptFirstPage") {
                if (!isFirstPageOfSection) {
                  effectivePageBorders = section.pageBorders;
                }
              } else {
                effectivePageBorders = section.pageBorders;
              }
            }

            return (
              <DocumentPage
                key={page.id}
                pageId={page.id}
                pageIndex={index}
                pageNumber={pageNumbersMap[page.id] ?? (index + 1)}
                totalPages={model.pages.length}
                section={section}
                pageBorders={effectivePageBorders}
                headerText={section?.header || ""}
                footerText={section?.footer || "Parexel Smart Authoring Suite"}
                pageNumberPosition={section?.pageNumberPosition}
                pageNumberAlignment={section?.pageNumberAlignment}
                pageNumberFormat={section?.pageNumberFormat}
                pageNumberStyle={section?.pageNumberStyle}
                html={model.pageHtml?.[page.id] ?? ""}
                active={isEffectiveActive}
                editable={isEditable}
                editorRef={editorRef}
                allPages={model.pages}
                pageHtmlMap={model.pageHtml}
                activeTable={activeTable}
                onSetActiveTable={setActiveTable}
                onActivate={() => {
                  if (activePage !== page.id) {
                    setActivePage(page.id);
                  }
                }}
                onChange={(html) => setPageHtml(page.id, html)}
                onAddPage={addPage}
                onRemovePage={removePage}
                onSetPageHtml={setPageHtml}
                onSetActivePage={setActivePage}
                zoom={zoom}
              />
            );
          });
        })()}
      </div>

      {/* WORD-STYLE CONTEXTUAL TABLE TEXT FORMATTING TOOLBAR
          Appears automatically near selection when text inside a table cell is selected
      */}
      {isEditable && <TableFloatingFormatToolbar />}

      {/* MICROSOFT WORD-STYLE TABLE CELL CONTEXT MENU
          Appears exclusively when right-clicking inside a table cell (td, th)
      */}
      {isEditable && (
        <TableContextMenu
          state={tableContextMenu}
          onClose={() => setTableContextMenu((prev) => ({ ...prev, open: false }))}
          onUpdateTable={() => {
            if (tableContextMenu.table) {
              const editable = tableContextMenu.table.closest('[contenteditable="true"]') as HTMLElement | null;
              if (editable) {
                editable.dispatchEvent(new Event("input", { bubbles: true }));
                const pageSection = editable.closest("section[data-page-id]");
                const pageId = pageSection?.getAttribute("data-page-id");
                if (pageId) {
                  setPageHtml(pageId, editable.innerHTML);
                }
              }
            }
          }}
        />
      )}

      {/* AI FLOATING BUTTON
          Only show when AI panel is closed
      */}
      {!aiPanelOpen && (
        <button
          type="button"
          onClick={() => setAiPanelOpen(true)}
          title="Open AI Assistant"
          aria-label="Open AI Assistant"
          className="
            fixed
            right-6
            top-[88%]
            z-50
            flex
            h-14
            w-14
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            bg-gradient-to-br
            from-blue-500
            to-indigo-500
            text-white
            shadow-lg
            transition-all
            hover:scale-105
            hover:shadow-xl
          "
        >
          <Sparkles className="h-6 w-6" />

          <span
            className="
              absolute
              right-0
              top-0
              h-3.5
              w-3.5
              rounded-full
              border-2
              border-background
              bg-green-500
            "
          />
        </button>
      )}
    </main>
  );
}

// --------------------------------------------------------------------------
// Helper: Focus Page & Place Cursor
// --------------------------------------------------------------------------
function focusPage(pageId: string, position: "start" | "end" = "start") {
  const section = document.querySelector(`section[data-page-id="${pageId}"]`);
  if (!section) return;

  const editable = section.querySelector('[contenteditable="true"]') as HTMLDivElement | null;
  if (!editable) return;

  editable.focus();

  try {
    const sel = window.getSelection();
    if (!sel) return;

    const range = document.createRange();

    if (position === "start") {
      const target = editable.firstElementChild || editable.firstChild || editable;
      range.selectNodeContents(target);
      range.collapse(true);
    } else {
      const target = editable.lastElementChild || editable.lastChild || editable;
      range.selectNodeContents(target);
      range.collapse(false);
    }

    sel.removeAllRanges();
    sel.addRange(range);
  } catch {
    // ignore
  }

  section.scrollIntoView({ behavior: "smooth", block: "center" });
}

// --------------------------------------------------------------------------
// Helper: Focus Table Cell & Place Caret
// --------------------------------------------------------------------------
function focusTableCell(cell: HTMLElement) {
  try {
    const sel = window.getSelection();
    if (!sel) return;
    const range = document.createRange();
    const p = cell.querySelector("p") || cell;
    range.selectNodeContents(p);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    cell.focus();
  } catch {
    // ignore
  }
}

// --------------------------------------------------------------------------
// Helper: Check if cursor is at the very beginning of the editable container
// --------------------------------------------------------------------------
function isCursorAtStart(container: HTMLElement): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const range = sel.getRangeAt(0);
  if (!range.collapsed) return false;
  if (range.startOffset !== 0) return false;

  let node: Node | null = range.startContainer;
  while (node && node !== container) {
    if (node.previousSibling) return false;
    node = node.parentNode;
  }
  return true;
}

interface DocumentPageProps {
  pageId: string;
  pageIndex: number;
  pageNumber: number;
  totalPages: number;
  headerText: string;
  footerText: string;
  section?: SectionModel;
  pageBorders?: PageBorderConfig;
  pageNumberPosition?: "header" | "footer" | "margin-left" | "margin-right";
  pageNumberAlignment?: "left" | "center" | "right";
  pageNumberFormat?: "1" | "i" | "I" | "a" | "A";
  pageNumberStyle?: string;
  html: string;
  active: boolean;
  editable: boolean;
  editorRef: React.RefObject<HTMLDivElement | null>;
  allPages: PageModel[];
  pageHtmlMap: Record<string, string>;
  activeTable: HTMLTableElement | null;
  onSetActiveTable: (table: HTMLTableElement | null) => void;
  onActivate: () => void;
  onChange: (html: string) => void;
  onAddPage: (afterPageId?: string, initialHtml?: string) => string;
  onRemovePage: (pageId: string) => void;
  onSetPageHtml: (pageId: string, html: string) => void;
  onSetActivePage: (id: string | null) => void;
  zoom: number;
}

function DocumentPage({
  pageId,
  pageIndex,
  pageNumber,
  totalPages,
  headerText: _headerText,
  footerText: _footerText,
  section,
  pageBorders,
  pageNumberPosition,
  pageNumberAlignment,
  pageNumberFormat,
  pageNumberStyle,
  html,
  active,
  editable,
  editorRef,
  allPages,
  pageHtmlMap,
  activeTable,
  onSetActiveTable,
  onActivate,
  onChange,
  onAddPage,
  onRemovePage,
  onSetPageHtml,
  onSetActivePage,
  zoom,
}: DocumentPageProps) {
  const localEditorRef = useRef<HTMLDivElement | null>(null);
  const lastHtmlRef = useRef<string>(html);

  const marginL = section?.marginConfig?.left ?? 96;
  const marginR = section?.marginConfig?.right ?? 96;
  const marginT = Math.max(16, (section?.marginConfig?.top ?? 96) - 24);
  const marginB = Math.max(16, (section?.marginConfig?.bottom ?? 96) - 24);

  const { model: docModel, updateSection: docUpdateSection } = useDocumentModel();
  const {
    isHeaderFooterActive,
    showDocumentText,
    enterHeaderFooterMode,
    exitHeaderFooterMode,
    setActiveHFType,
  } = useHeaderFooter();

  const sectionIndex = docModel.sections.findIndex((s) => s.id === section?.id);
  const secNumber = sectionIndex >= 0 ? sectionIndex + 1 : 1;

  // Link to previous section resolution
  const isLinked = (section?.linkToPrevious ?? false) && sectionIndex > 0;
  const effectiveSection = isLinked && sectionIndex > 0 ? docModel.sections[sectionIndex - 1] : section;

  // Section pages for first-page check
  const sectionPages = docModel.pages.filter((p) => p.sectionId === section?.id);
  const isFirstPageOfSection = (sectionPages[0]?.id === pageId) || pageIndex === 0;
  const isEvenPage = pageNumber % 2 === 0;

  // Header resolution
  let headerKind: "first" | "even" | "odd" | "normal" = "normal";
  let headerLabel = `HEADER - SECTION ${secNumber}`;
  let effectiveHeaderText = effectiveSection?.header || "";
  let effectiveHeaderHtml = effectiveSection?.headerHtml || "";

  if (effectiveSection?.differentFirstPage && isFirstPageOfSection) {
    headerKind = "first";
    headerLabel = `FIRST PAGE HEADER - SECTION ${secNumber}`;
    effectiveHeaderText = effectiveSection.firstHeader || effectiveSection.header || "";
    effectiveHeaderHtml = effectiveSection.firstHeaderHtml || effectiveSection.headerHtml || "";
  } else if (effectiveSection?.differentOddEven && isEvenPage) {
    headerKind = "even";
    headerLabel = `EVEN PAGE HEADER - SECTION ${secNumber}`;
    effectiveHeaderText = effectiveSection.evenHeader || effectiveSection.header || "";
    effectiveHeaderHtml = effectiveSection.evenHeaderHtml || effectiveSection.headerHtml || "";
  } else if (effectiveSection?.differentOddEven && !isEvenPage) {
    headerKind = "odd";
    headerLabel = `ODD PAGE HEADER - SECTION ${secNumber}`;
    effectiveHeaderText = effectiveSection.header || "";
    effectiveHeaderHtml = effectiveSection.headerHtml || "";
  }

  // Footer resolution
  let footerKind: "first" | "even" | "odd" | "normal" = "normal";
  let footerLabel = `FOOTER - SECTION ${secNumber}`;
  let effectiveFooterText = effectiveSection?.footer || "Parexel Smart Authoring Suite";
  let effectiveFooterHtml = effectiveSection?.footerHtml || "";

  if (effectiveSection?.differentFirstPage && isFirstPageOfSection) {
    footerKind = "first";
    footerLabel = `FIRST PAGE FOOTER - SECTION ${secNumber}`;
    effectiveFooterText = effectiveSection.firstFooter || effectiveSection.footer || "";
    effectiveFooterHtml = effectiveSection.firstFooterHtml || effectiveSection.footerHtml || "";
  } else if (effectiveSection?.differentOddEven && isEvenPage) {
    footerKind = "even";
    footerLabel = `EVEN PAGE FOOTER - SECTION ${secNumber}`;
    effectiveFooterText = effectiveSection.evenFooter || effectiveSection.footer || "";
    effectiveFooterHtml = effectiveSection.evenFooterHtml || effectiveSection.footerHtml || "";
  } else if (effectiveSection?.differentOddEven && !isEvenPage) {
    footerKind = "odd";
    footerLabel = `ODD PAGE FOOTER - SECTION ${secNumber}`;
    effectiveFooterText = effectiveSection.footer || "";
    effectiveFooterHtml = effectiveSection.footerHtml || "";
  }

  const headerContentRef = useRef<HTMLDivElement | null>(null);
  const footerContentRef = useRef<HTMLDivElement | null>(null);
  const isEditingHeaderRef = useRef(false);
  const isEditingFooterRef = useRef(false);

  useEffect(() => {
    if (headerContentRef.current && !isEditingHeaderRef.current) {
      headerContentRef.current.innerHTML = effectiveHeaderHtml || effectiveHeaderText || "";
    }
  }, [effectiveHeaderHtml, effectiveHeaderText, isHeaderFooterActive]);

  useEffect(() => {
    if (footerContentRef.current && !isEditingFooterRef.current) {
      footerContentRef.current.innerHTML = effectiveFooterHtml || effectiveFooterText || "";
    }
  }, [effectiveFooterHtml, effectiveFooterText, isHeaderFooterActive]);

  const handleHeaderUpdate = useCallback(
    (newText: string, newHtml: string) => {
      if (!section) return;
      const targetSecId = isLinked && sectionIndex > 0 ? docModel.sections[sectionIndex - 1]?.id : section.id;
      if (!targetSecId) return;

      if (headerKind === "first") {
        docUpdateSection(targetSecId, { firstHeader: newText, firstHeaderHtml: newHtml });
      } else if (headerKind === "even") {
        docUpdateSection(targetSecId, { evenHeader: newText, evenHeaderHtml: newHtml });
      } else {
        docUpdateSection(targetSecId, { header: newText, headerHtml: newHtml });
      }
    },
    [section, isLinked, sectionIndex, docModel.sections, headerKind, docUpdateSection]
  );

  const handleFooterUpdate = useCallback(
    (newText: string, newHtml: string) => {
      if (!section) return;
      const targetSecId = isLinked && sectionIndex > 0 ? docModel.sections[sectionIndex - 1]?.id : section.id;
      if (!targetSecId) return;

      if (footerKind === "first") {
        docUpdateSection(targetSecId, { firstFooter: newText, firstFooterHtml: newHtml });
      } else if (footerKind === "even") {
        docUpdateSection(targetSecId, { evenFooter: newText, evenFooterHtml: newHtml });
      } else {
        docUpdateSection(targetSecId, { footer: newText, footerHtml: newHtml });
      }
    },
    [section, isLinked, sectionIndex, docModel.sections, footerKind, docUpdateSection]
  );

  /*
   * Keep dynamic page number fields inside document content synchronized
   * with current pageNumber, totalPages, and format across all pages.
   */
  useEffect(() => {
    const element = localEditorRef.current;
    if (!element) return;

    const dynamicFields = element.querySelectorAll<HTMLElement>(".page-number-field, [data-field]");
    if (dynamicFields.length === 0) return;

    let hasChange = false;
    const formattedNum = formatPageNumber(pageNumber, pageNumberFormat);
    const formattedTotal = formatPageNumber(totalPages, pageNumberFormat);

    dynamicFields.forEach((field) => {
      if (field.getAttribute("data-static") === "true") return;

      const fieldType = field.getAttribute("data-field");
      let expectedText = "";

      if (fieldType === "page-number") {
        expectedText = formattedNum;
      } else if (fieldType === "page-x") {
        expectedText = `Page ${formattedNum}`;
      } else if (fieldType === "page-x-of-y") {
        expectedText = `Page ${formattedNum} of ${formattedTotal}`;
      } else if (fieldType === "x-of-y") {
        expectedText = `${formattedNum} of ${formattedTotal}`;
      } else if (fieldType === "total-pages") {
        expectedText = formattedTotal;
      }

      if (expectedText && field.textContent !== expectedText) {
        field.textContent = expectedText;
        hasChange = true;
      }
    });

    if (hasChange) {
      lastHtmlRef.current = element.innerHTML;
      onChange(element.innerHTML);
    }
  }, [pageNumber, totalPages, pageNumberFormat, onChange]);

  /*
   * Keep the page HTML synchronized with the document model
   * only when external updates occur.
   */
  useEffect(() => {
    const element = localEditorRef.current;
    if (!element) return;

    const normalize = (s: string) => s.replace(/<br\s*\/?>/gi, "<br>").replace(/\s+/g, " ").trim();

    // If active element is inside this editor, avoid destroying the user's cursor
    const hasFocus = element === document.activeElement || element.contains(document.activeElement);
    if (hasFocus) {
      if (normalize(lastHtmlRef.current) === normalize(html)) {
        return;
      }
    }

    if (normalize(element.innerHTML) !== normalize(html)) {
      element.innerHTML = html || "<p><br></p>";
      lastHtmlRef.current = html;
    }
  }, [html]);

  // Initial focus only when activated externally and focus is not already inside
  useEffect(() => {
    if (active && editable && localEditorRef.current) {
      const el = localEditorRef.current;
      if (document.activeElement !== el && !el.contains(document.activeElement)) {
        el.focus();
        try {
          const sel = window.getSelection();
          if (sel && sel.rangeCount === 0) {
            const range = document.createRange();
            const target = el.querySelector("p") || el.firstChild || el;
            range.selectNodeContents(target);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        } catch {
          // ignore
        }
      }
    }
  }, [active, pageId, editable]);

  // ------------------------------------------------------------------------
  // True Content-Overflow Pagination Engine
  // Checks if the actual content inside this page exceeds its usable writing area.
  // If content fits -> DOES ABSOLUTELY NOTHING.
  // If content overflows -> moves ONLY the overflowing children to next page.
  // ------------------------------------------------------------------------
  const checkAndPaginateOverflow = useCallback(() => {
    const container = localEditorRef.current;
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];
    if (children.length <= 1) return;

    const containerRect = container.getBoundingClientRect();
    if (containerRect.height === 0) return;

    // Available writing boundary: container bottom minus bottom margin tolerance
    const maxBottom = containerRect.bottom - Math.max(16, marginB);

    const columnCount = section?.columns?.count ?? 1;
    const isMultiColumn = columnCount > 1;

    // Find the first child whose boundary exceeds the writing area
    let splitIdx = -1;
    for (let i = 0; i < children.length; i++) {
      const childRect = children[i].getBoundingClientRect();

      if (isMultiColumn) {
        // Multi-column layout overflow check:
        // 1. Child spilled past the right edge of container into an overflow column
        const isPastRightBoundary =
          childRect.right > containerRect.right - marginR + 10 ||
          childRect.left >= containerRect.right - marginR;

        // 2. Child is in the last column and exceeds bottom boundary
        const approxColWidth =
          (containerRect.width - marginL - marginR - (columnCount - 1) * (section?.columns?.gap ?? 32)) /
          columnCount;
        const lastColLeftThreshold = containerRect.right - marginR - approxColWidth - 15;
        const isInLastColumn = childRect.left >= lastColLeftThreshold;
        const isPastBottomInLastCol = isInLastColumn && childRect.bottom > maxBottom;

        if (isPastRightBoundary || isPastBottomInLastCol) {
          splitIdx = i;
          break;
        }
      } else {
        // Single column layout
        if (childRect.bottom > maxBottom) {
          splitIdx = i;
          break;
        }
      }
    }

    // If all children fit within available writing space, do nothing!
    if (splitIdx <= 0) {
      return;
    }

    // Keep at least the first child on the page
    const safeSplitIdx = Math.max(1, splitIdx);
    if (safeSplitIdx >= children.length) {
      return;
    }

    const overflowNodes = children.slice(safeSplitIdx);
    if (overflowNodes.length === 0) return;

    // Build HTML for overflowing content
    const tempDiv = document.createElement("div");
    overflowNodes.forEach((node) => tempDiv.appendChild(node.cloneNode(true)));
    const overflowHtml = tempDiv.innerHTML.trim();

    // Remove overflowing content from current page
    overflowNodes.forEach((node) => node.remove());
    const remainingHtml = container.innerHTML.trim() || "<p><br/></p>";
    lastHtmlRef.current = remainingHtml;
    onChange(remainingHtml);

    // Distribute overflowing content to next page
    const currentIdx = allPages.findIndex((p) => p.id === pageId);
    const nextPage = allPages[currentIdx + 1];

    if (!nextPage) {
      // Current page is the LAST page and genuinely overflowed:
      // Create EXACTLY ONE new page using existing addPage function
      const newPageId = onAddPage(pageId, overflowHtml);
      setTimeout(() => {
        onSetActivePage(newPageId);
        focusPage(newPageId, "start");
      }, 50);
    } else {
      // Next page already exists: prepend overflowing content to next page
      const existingNextHtml = pageHtmlMap[nextPage.id] || "";
      const cleanExisting =
        existingNextHtml.trim() === "<p><br/></p>" || existingNextHtml.trim() === "<p><br></p>"
          ? ""
          : existingNextHtml;
      const mergedHtml = overflowHtml + (cleanExisting ? cleanExisting : "");
      onSetPageHtml(nextPage.id, mergedHtml);
      setTimeout(() => {
        onSetActivePage(nextPage.id);
        focusPage(nextPage.id, "start");
      }, 50);
    }
  }, [allPages, marginB, marginL, marginR, onAddPage, onChange, onSetPageHtml, pageHtmlMap, pageId, section]);

  // ------------------------------------------------------------------------
  // KeyDown: Enter, Ctrl+Enter, and Backspace Handlers
  // ------------------------------------------------------------------------
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const container = localEditorRef.current;
    if (!container) return;

    // ------------------------------------------------------------------
    // 1. Manual Page Break: Ctrl + Enter / Cmd + Enter
    // Intentionally splits content at cursor and creates a new page immediately
    // ------------------------------------------------------------------
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleManualPageBreak();
      return;
    }

    // ------------------------------------------------------------------
    // 2. Normal Enter:
    // Enter does NOT mean "create a new page"!
    // Allow normal browser paragraph creation.
    // If inside a table cell, allow creating a new line in the cell without paginating!
    // ------------------------------------------------------------------
    if (e.key === "Enter" && !e.shiftKey) {
      const sel = window.getSelection();
      const node = sel?.anchorNode;
      const el = node?.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node?.parentElement;
      const cell = el?.closest("td, th") as HTMLTableCellElement | null;
      if (cell) {
        // Normal Enter in table cell: keep typing inside the cell without pagination
        return;
      }

      setTimeout(() => {
        checkAndPaginateOverflow();
      }, 20);
      return;
    }

    // ------------------------------------------------------------------
    // 3. Tab key inside table cell: navigate to next cell, or add row on last cell
    // ------------------------------------------------------------------
    if (e.key === "Tab") {
      const sel = window.getSelection();
      const node = sel?.anchorNode;
      const el = node?.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node?.parentElement;
      const currentCell = el?.closest("td, th") as HTMLTableCellElement | null;

      if (currentCell) {
        e.preventDefault();
        const table = currentCell.closest("table");
        if (table) {
          const allCells = Array.from(table.querySelectorAll("td, th")) as HTMLTableCellElement[];
          const currentIndex = allCells.indexOf(currentCell);

          if (e.shiftKey) {
            if (currentIndex > 0) {
              focusTableCell(allCells[currentIndex - 1]);
            }
          } else {
            if (currentIndex < allCells.length - 1) {
              focusTableCell(allCells[currentIndex + 1]);
            } else {
              // Last cell: Append a new row to the table (MS Word standard behavior)
              const lastRow = table.rows[table.rows.length - 1];
              if (lastRow) {
                const newRow = lastRow.cloneNode(true) as HTMLTableRowElement;
                Array.from(newRow.cells).forEach((c) => {
                  c.innerHTML = "<p><br></p>";
                  c.style.height = "auto";
                });
                lastRow.parentElement?.appendChild(newRow);
                const firstNewCell = newRow.cells[0];
                if (firstNewCell) {
                  focusTableCell(firstNewCell);
                }
                handleInput();
              }
            }
          }
          return;
        }
      }
    }

    // ------------------------------------------------------------------
    // 4. Backspace at start of page (Page N > 1)
    // ------------------------------------------------------------------
    if (e.key === "Backspace") {
      handleBackspaceKey(e);
      return;
    }
  };

  // ------------------------------------------------------------------------
  // Manual Page Break (Ctrl + Enter)
  // ------------------------------------------------------------------------
  const handleManualPageBreak = () => {
    const container = localEditorRef.current;
    if (!container) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const splitRange = document.createRange();
    splitRange.setStart(range.endContainer, range.endOffset);
    splitRange.setEndAfter(container.lastChild || container);

    const fragment = splitRange.extractContents();
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(fragment);

    let trailingHtml = tempDiv.innerHTML.trim();
    if (!trailingHtml || trailingHtml === "<br>" || trailingHtml === "<p></p>") {
      trailingHtml = "<p><br/></p>";
    }

    const remainingHtml = container.innerHTML.trim() || "<p><br/></p>";
    lastHtmlRef.current = remainingHtml;
    onChange(remainingHtml);

    const nextPage = allPages[pageIndex + 1];

    if (!nextPage) {
      const newPageId = onAddPage(pageId, trailingHtml);
      setTimeout(() => {
        onSetActivePage(newPageId);
        focusPage(newPageId, "start");
      }, 50);
    } else {
      const existingNextHtml = pageHtmlMap[nextPage.id] || "";
      const cleanExisting =
        existingNextHtml.trim() === "<p><br/></p>" || existingNextHtml.trim() === "<p><br></p>"
          ? ""
          : existingNextHtml;
      const mergedHtml = trailingHtml + cleanExisting;
      onSetPageHtml(nextPage.id, mergedHtml);
      setTimeout(() => {
        onSetActivePage(nextPage.id);
        focusPage(nextPage.id, "start");
      }, 50);
    }
  };

  // ------------------------------------------------------------------------
  // Backspace at Beginning of Page
  // ------------------------------------------------------------------------
  const handleBackspaceKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const container = localEditorRef.current;
    if (!container) return;

    if (pageIndex <= 0) return; // Only applies to Page 2, Page 3, etc.

    const isAtStart = isCursorAtStart(container);
    if (!isAtStart) return;

    const text = container.textContent?.trim() || "";
    const hasMedia = container.querySelector("table, img, video, iframe");

    if (text === "" && !hasMedia) {
      // Empty page: delete this page and return to previous page
      e.preventDefault();
      const prevPageId = allPages[pageIndex - 1].id;
      onRemovePage(pageId);
      setTimeout(() => {
        onSetActivePage(prevPageId);
        focusPage(prevPageId, "end");
      }, 50);
      return;
    }

    // Non-empty page with cursor at beginning: navigate to end of previous page
    e.preventDefault();
    const prevPageId = allPages[pageIndex - 1].id;
    onSetActivePage(prevPageId);
    focusPage(prevPageId, "end");
  };

  const handleInput = () => {
    const element = localEditorRef.current;
    if (!element) return;
    const currentHtml = element.innerHTML;
    lastHtmlRef.current = currentHtml;
    onChange(currentHtml);
  };

  const handleFocus = () => {
    onActivate();

    if (!editorRef.current) {
      (
        editorRef as React.MutableRefObject<HTMLDivElement | null>
      ).current = localEditorRef.current;
    }
  };

  // ------------------------------------------------------------------------
  // Word-style Click-to-Position-Cursor (Click & Type)
  // Ensures clicking anywhere on the page moves the text caret '|' to that position
  // ------------------------------------------------------------------------
  const handlePageMouseDown = (e: React.MouseEvent<HTMLElement>) => {
    onActivate();

    const container = localEditorRef.current;
    if (!container || !editable) return;

    // Do not interfere with interactive buttons, tables, or table resize/move handles
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.closest("button") ||
        target.closest("table") ||
        target.closest("[data-table-control]"))
    ) {
      return;
    }

    // If the click is directly on an existing text block (p, h1, h2, li, etc.)
    if (
      target &&
      target !== container &&
      target.closest("p, h1, h2, h3, ul, ol, li, blockquote")
    ) {
      // Allow browser native caret placement to handle direct text clicks
      return;
    }

    // Otherwise, the user clicked on empty space on the page (container whitespace, margins, etc.)
    e.preventDefault();
    container.focus();

    if (!container.firstElementChild) {
      container.innerHTML = "<p><br></p>";
    }

    const containerRect = container.getBoundingClientRect();
    const children = Array.from(container.children) as HTMLElement[];
    const lastChild = children[children.length - 1];

    if (!lastChild) {
      focusPage(pageId, "start");
      return;
    }

    const lastChildRect = lastChild.getBoundingClientRect();
    const effectiveLineHeight = 28 * (zoom / 100);

    // Case 1: Click is below the last paragraph on the page
    if (e.clientY > lastChildRect.bottom + 6) {
      const maxAllowedBottom = containerRect.bottom - 28;
      const diffY = e.clientY - lastChildRect.bottom;
      let linesToAdd = Math.max(1, Math.round(diffY / effectiveLineHeight));

      // Ensure we don't exceed the page boundary
      const maxPossibleLines = Math.max(
        1,
        Math.floor((maxAllowedBottom - lastChildRect.bottom) / effectiveLineHeight)
      );
      linesToAdd = Math.min(linesToAdd, maxPossibleLines);

      let targetP: HTMLElement = lastChild;
      const isLastEmpty =
        lastChild.tagName === "P" &&
        (lastChild.innerHTML === "<br>" ||
          lastChild.innerHTML === "<br/>" ||
          lastChild.textContent?.trim() === "");

      const startCount = isLastEmpty ? 1 : 0;
      for (let i = startCount; i < linesToAdd; i++) {
        const p = document.createElement("p");
        p.innerHTML = "<br>";
        container.appendChild(p);
        targetP = p;
      }

      if (isLastEmpty && linesToAdd === 1) {
        targetP = lastChild;
      }

      const updatedHtml = container.innerHTML;
      lastHtmlRef.current = updatedHtml;
      onChange(updatedHtml);

      // Place caret '|' inside target paragraph
      const sel = window.getSelection();
      if (sel) {
        const range = document.createRange();
        range.selectNodeContents(targetP);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      return;
    }

    // Case 2: Click is alongside or between existing paragraphs
    let closestChild: HTMLElement = children[0];
    let minDistance = Infinity;

    for (const child of children) {
      const rect = child.getBoundingClientRect();
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        closestChild = child;
        minDistance = 0;
        break;
      }
      const dist = Math.min(
        Math.abs(e.clientY - rect.top),
        Math.abs(e.clientY - rect.bottom)
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestChild = child;
      }
    }

    const sel = window.getSelection();
    if (sel && closestChild) {
      const range = document.createRange();
      const rect = closestChild.getBoundingClientRect();
      const isLeft = e.clientX < rect.left + 20;

      range.selectNodeContents(closestChild);
      range.collapse(isLeft);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  const isLandscape = section?.orientation === "landscape";
  const baseWidth = section?.paperSize?.width ?? 816;
  const baseHeight = section?.paperSize?.height ?? 1056;
  const pageWidth = isLandscape ? baseHeight : baseWidth;
  const pageHeight = isLandscape ? baseWidth : baseHeight;
  const headerHeight = Math.max(45, section?.headerTopDistance ?? 48);
  const footerHeight = Math.max(45, section?.footerBottomDistance ?? 48);
  const contentHeight = Math.max(100, pageHeight - headerHeight - footerHeight);

  return (
    <section
      data-page-id={pageId}
      onMouseDown={handlePageMouseDown}
      onDoubleClick={(e) => {
        if (isHeaderFooterActive && !(e.target as HTMLElement).closest('[data-hf-container]')) {
          e.stopPropagation();
          exitHeaderFooterMode();
        }
      }}
      className={`
        relative
        overflow-hidden
        shrink-0
        cursor-text
        shadow-[0_4px_20px_rgba(0,0,0,0.12)]
        box-border
        border
        ${
          active
            ? "border-blue-300 ring-1 ring-blue-300/40"
            : "border-slate-200"
        }
      `}
      style={{
        width: `${pageWidth}px`,
        minWidth: `${pageWidth}px`,
        height: `${pageHeight}px`,
        maxHeight: `${pageHeight}px`,
        transform: `scale(${zoom / 100})`,
        transformOrigin: "top center",
        marginBottom: `${(pageHeight * zoom) / 100 - pageHeight}px`,
        backgroundColor: section?.pageColor || "#ffffff",
      }}
    >
      {/* WORD-STYLE PAGE BORDER OVERLAY */}
      {(() => {
        if (!pageBorders || pageBorders.setting === "none" || pageBorders.style === "none") {
          return null;
        }

        const {
          setting = "box",
          lineStyle,
          style,
          color = "#000000",
          width = 2,
          top = true,
          bottom = true,
          left = true,
          right = true,
          distance,
        } = pageBorders;

        if (!top && !bottom && !left && !right) {
          return null;
        }

        const effectiveLineStyle =
          lineStyle ||
          (style === "dashed"
            ? "dashed"
            : style === "dotted"
            ? "dotted"
            : style === "double"
            ? "double"
            : style === "dash-dot"
            ? "dash-dot"
            : style === "thick-solid"
            ? "thick-solid"
            : "solid");

        const effectiveBorderWidth =
          effectiveLineStyle === "thick-solid"
            ? Math.max(4, width * 1.5)
            : effectiveLineStyle === "double"
            ? Math.max(3, width)
            : width;

        const effectiveBorderType =
          setting === "3d"
            ? "inset"
            : effectiveLineStyle === "dash-dot"
            ? "dashed"
            : effectiveLineStyle === "thick-solid"
            ? "solid"
            : effectiveLineStyle;

        const borderVal = `${effectiveBorderWidth}px ${effectiveBorderType} ${color}`;

        const distTop = distance?.top ?? 24;
        const distBottom = distance?.bottom ?? 24;
        const distLeft = distance?.left ?? 24;
        const distRight = distance?.right ?? 24;

        const borderOverlayStyles: React.CSSProperties = {
          position: "absolute",
          top: `${distTop}px`,
          bottom: `${distBottom}px`,
          left: `${distLeft}px`,
          right: `${distRight}px`,
          pointerEvents: "none",
          zIndex: 15,
          boxSizing: "border-box",
          borderTop: top ? borderVal : "none",
          borderBottom: bottom ? borderVal : "none",
          borderLeft: left ? borderVal : "none",
          borderRight: right ? borderVal : "none",
        };

        if (setting === "shadow") {
          borderOverlayStyles.filter = `drop-shadow(4px 4px 0px ${color || "#000000"})`;
        }

        return (
          <div
            data-page-border="true"
            className="pointer-events-none absolute z-15 select-none"
            style={borderOverlayStyles}
          />
        );
      })()}

      {/* WATERMARK OVERLAY */}
      {section?.watermark?.text && (
        <div
          className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center select-none overflow-hidden"
          style={{ opacity: section.watermark.opacity ?? 0.12 }}
        >
          <span
            className="font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100"
            style={{
              fontSize:
                section.watermark.fontSize === "auto" || !section.watermark.fontSize
                  ? isLandscape
                    ? "80px"
                    : "64px"
                  : `${section.watermark.fontSize}px`,
              fontFamily: section.watermark.font || "inherit",
              transform: `rotate(${
                section.watermark.rotation === "horizontal"
                  ? 0
                  : typeof section.watermark.rotation === "number"
                  ? section.watermark.rotation
                  : -35
              }deg)`,
              color: section.watermark.color || "currentColor",
            }}
          >
            {section.watermark.text}
          </span>
        </div>
      )}
      {section?.watermark?.image && (
        <div
          className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center select-none overflow-hidden p-12"
          style={{ opacity: section.watermark.opacity ?? 0.15 }}
        >
          <img
            src={section.watermark.image}
            alt="Watermark"
            className="max-h-full max-w-full object-contain"
            style={{
              transform: `rotate(${
                typeof section.watermark.rotation === "number"
                  ? section.watermark.rotation
                  : section.watermark.rotation === "horizontal"
                  ? 0
                  : -45
              }deg) scale(${
                section.watermark.scale === "auto" || !section.watermark.scale
                  ? 1
                  : Number(section.watermark.scale) / 100
              })`,
            }}
          />
        </div>
      )}

      {/* PAGE NUMBER BADGE */}
      <div
        className="
          absolute
          -left-12
          top-2
          select-none
          text-[10px]
          text-slate-400
        "
      >
        {pageNumber}
      </div>

      {/* DOCUMENT HEADER */}
      <div
        data-hf-container="header"
        data-page-id={pageId}
        onDoubleClick={(e) => {
          e.stopPropagation();
          enterHeaderFooterMode("header", section?.id, pageId);
        }}
        className={`
          relative
          box-border
          text-[10px]
          text-slate-500
          transition-all
          ${
            isHeaderFooterActive
              ? "border-b border-dashed border-[#0078d4] bg-blue-50/20 ring-1 ring-blue-300/40 dark:border-blue-500 dark:bg-blue-950/20"
              : "border-b border-slate-100 hover:bg-blue-50/15 cursor-pointer dark:border-slate-800"
          }
        `}
        style={{
          paddingLeft: `${marginL}px`,
          paddingRight: `${marginR}px`,
          paddingTop: `${Math.max(8, (section?.headerTopDistance ?? 48) - 34)}px`,
          paddingBottom: "8px",
          minHeight: `${headerHeight}px`,
        }}
      >
        {/* Editor-only Header Section Label */}
        {isHeaderFooterActive && (
          <div
            data-editor-ui="true"
            className="absolute -top-3 left-4 px-2 py-0.5 bg-[#0078d4] text-white text-[9px] font-bold uppercase tracking-wider rounded shadow-xs print:hidden select-none pointer-events-none z-20 flex items-center gap-1.5"
          >
            <span>{headerLabel}</span>
            {isLinked && (
              <span className="opacity-80 font-normal text-[8px]">(Same as Previous)</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between w-full h-full">
          {section?.showPageNumbers !== false && pageNumberPosition === "header" ? (
            <>
              {pageNumberAlignment === "left" ? (
                <>
                  <div className="font-semibold text-slate-700 dark:text-slate-300 mr-3 shrink-0">
                    {renderPageNumberContent(pageNumber, totalPages, pageNumberFormat, pageNumberStyle || section?.pageNumberStyle)}
                  </div>
                  {isHeaderFooterActive ? (
                    <div
                      ref={headerContentRef}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setActiveHFType("header")}
                      onInput={(e) => {
                        isEditingHeaderRef.current = true;
                        handleHeaderUpdate(e.currentTarget.innerText, e.currentTarget.innerHTML);
                        setTimeout(() => { isEditingHeaderRef.current = false; }, 300);
                      }}
                      className="w-full outline-none text-[10px] cursor-text select-text"
                    />
                  ) : effectiveHeaderHtml ? (
                    <div className="w-full" dangerouslySetInnerHTML={{ __html: effectiveHeaderHtml }} />
                  ) : (
                    <span>{effectiveHeaderText}</span>
                  )}
                </>
              ) : pageNumberAlignment === "center" ? (
                <>
                  {isHeaderFooterActive ? (
                    <div
                      ref={headerContentRef}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setActiveHFType("header")}
                      onInput={(e) => {
                        isEditingHeaderRef.current = true;
                        handleHeaderUpdate(e.currentTarget.innerText, e.currentTarget.innerHTML);
                        setTimeout(() => { isEditingHeaderRef.current = false; }, 300);
                      }}
                      className="w-full outline-none text-[10px] cursor-text select-text"
                    />
                  ) : effectiveHeaderHtml ? (
                    <div className="w-full" dangerouslySetInnerHTML={{ __html: effectiveHeaderHtml }} />
                  ) : (
                    <span>{effectiveHeaderText}</span>
                  )}
                  <div className="font-semibold text-slate-700 dark:text-slate-300 absolute left-1/2 -translate-x-1/2">
                    {renderPageNumberContent(pageNumber, totalPages, pageNumberFormat, pageNumberStyle || section?.pageNumberStyle)}
                  </div>
                  <span />
                </>
              ) : (
                <>
                  {isHeaderFooterActive ? (
                    <div
                      ref={headerContentRef}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setActiveHFType("header")}
                      onInput={(e) => {
                        isEditingHeaderRef.current = true;
                        handleHeaderUpdate(e.currentTarget.innerText, e.currentTarget.innerHTML);
                        setTimeout(() => { isEditingHeaderRef.current = false; }, 300);
                      }}
                      className="w-full outline-none text-[10px] cursor-text select-text"
                    />
                  ) : effectiveHeaderHtml ? (
                    <div className="w-full" dangerouslySetInnerHTML={{ __html: effectiveHeaderHtml }} />
                  ) : (
                    <span>{effectiveHeaderText}</span>
                  )}
                  <div className="font-semibold text-slate-700 dark:text-slate-300 ml-3 shrink-0">
                    {renderPageNumberContent(pageNumber, totalPages, pageNumberFormat, pageNumberStyle || section?.pageNumberStyle)}
                  </div>
                </>
              )}
            </>
          ) : (
            isHeaderFooterActive ? (
              <div
                ref={headerContentRef}
                contentEditable
                suppressContentEditableWarning
                onFocus={() => setActiveHFType("header")}
                onInput={(e) => {
                  isEditingHeaderRef.current = true;
                  handleHeaderUpdate(e.currentTarget.innerText, e.currentTarget.innerHTML);
                  setTimeout(() => { isEditingHeaderRef.current = false; }, 300);
                }}
                className="w-full outline-none text-[10px] cursor-text select-text"
              />
            ) : effectiveHeaderHtml ? (
              <div className="w-full" dangerouslySetInnerHTML={{ __html: effectiveHeaderHtml }} />
            ) : (
              <span>{effectiveHeaderText}</span>
            )
          )}
        </div>
      </div>

      {/* EDITABLE DOCUMENT WRITING AREA (Dynamically calculated based on paper dimensions & margins) */}
      <div
        ref={(element) => {
          localEditorRef.current = element;

          if (active && element) {
            (
              editorRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = element;
          }
        }}
        contentEditable={editable && !isHeaderFooterActive}
        suppressContentEditableWarning
        onFocus={handleFocus}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onMouseDown={handlePageMouseDown}
        onPointerDown={(e) => {
          if (isHeaderFooterActive) return;
          const clickedTable = (e.target as HTMLElement).closest("table");
          if (clickedTable) {
            onSetActiveTable(clickedTable);
            onActivate();
          }
        }}
        style={{
          height: `${contentHeight}px`,
          maxHeight: `${contentHeight}px`,
          paddingTop: `${marginT}px`,
          paddingBottom: `${marginB}px`,
          paddingLeft: `${marginL}px`,
          paddingRight: `${marginR}px`,
          opacity: isHeaderFooterActive ? (showDocumentText ? 0.35 : 0) : 1,
          pointerEvents: isHeaderFooterActive ? "none" : "auto",
          userSelect: isHeaderFooterActive ? "none" : "text",
          transition: "opacity 0.2s ease",
          ...(section?.columns && section.columns.count > 1
            ? {
                columnCount: section.columns.count,
                columnGap: `${section.columns.gap ?? 32}px`,
                columnFill: "balance",
                WebkitColumnFill: "balance",
              }
            : {}),
        }}
        className="
          overflow-hidden
          box-border
          outline-none
          cursor-text
          text-[14px]
          leading-7
          text-slate-800

          [&_p]:my-2
          [&_p]:break-inside-avoid-column
          [&_table]:break-inside-avoid-column
          [&_h1]:break-after-avoid
          [&_h2]:break-after-avoid
          [&_h3]:break-after-avoid

          [&_h1]:mb-4
          [&_h1]:mt-6
          [&_h1]:text-2xl
          [&_h1]:font-bold

          [&_h2]:mb-3
          [&_h2]:mt-5
          [&_h2]:text-xl
          [&_h2]:font-semibold

          [&_h3]:mb-2
          [&_h3]:mt-4
          [&_h3]:text-lg
          [&_h3]:font-semibold

          [&_ul]:my-3
          [&_ul]:list-disc
          [&_ul]:pl-6

          [&_ol]:my-3
          [&_ol]:list-decimal
          [&_ol]:pl-6

          [&_table]:my-4
          [&_table]:box-border
          [&_table]:border-collapse
          [&_table]:table-fixed

          [&_td]:border
          [&_td]:border-slate-300
          [&_td]:p-2.5
          [&_td]:text-left
          [&_td]:align-top
          [&_td]:min-w-[32px]
          [&_td]:break-words
          [&_td]:whitespace-normal

          [&_th]:border
          [&_th]:border-slate-300
          [&_th]:p-2.5
          [&_th]:text-left
          [&_th]:align-top
          [&_th]:font-semibold
          [&_th]:min-w-[32px]
          [&_th]:break-words
          [&_th]:whitespace-normal
        "
      />

      {/* WORD-STYLE TABLE MOVE & RESIZE OVERLAY (Editor UI only, not in saved document) */}
      {editable && activeTable && localEditorRef.current && localEditorRef.current.contains(activeTable) && (
        <TableControlsOverlay
          table={activeTable}
          container={localEditorRef.current}
          zoom={zoom}
          onUpdate={() => {
            if (localEditorRef.current) {
              const updatedHtml = localEditorRef.current.innerHTML;
              lastHtmlRef.current = updatedHtml;
              onChange(updatedHtml);
            }
          }}
          onActivateTable={onSetActiveTable}
          onDeactivateTable={() => onSetActiveTable(null)}
        />
      )}

      {/* DOCUMENT FOOTER */}
      <div
        data-hf-container="footer"
        data-page-id={pageId}
        onDoubleClick={(e) => {
          e.stopPropagation();
          enterHeaderFooterMode("footer", section?.id, pageId);
        }}
        className={`
          relative
          box-border
          text-[10px]
          text-slate-400
          transition-all
          ${
            isHeaderFooterActive
              ? "border-t border-dashed border-[#0078d4] bg-blue-50/20 ring-1 ring-blue-300/40 dark:border-blue-500 dark:bg-blue-950/20"
              : "border-t border-slate-100 hover:bg-blue-50/15 cursor-pointer dark:border-slate-800"
          }
        `}
        style={{
          paddingLeft: `${marginL}px`,
          paddingRight: `${marginR}px`,
          paddingTop: "10px",
          paddingBottom: `${Math.max(8, (section?.footerBottomDistance ?? 48) - 34)}px`,
          minHeight: `${footerHeight}px`,
        }}
      >
        {/* Editor-only Footer Section Label */}
        {isHeaderFooterActive && (
          <div
            data-editor-ui="true"
            className="absolute -top-3 left-4 px-2 py-0.5 bg-[#0078d4] text-white text-[9px] font-bold uppercase tracking-wider rounded shadow-xs print:hidden select-none pointer-events-none z-20 flex items-center gap-1.5"
          >
            <span>{footerLabel}</span>
            {isLinked && (
              <span className="opacity-80 font-normal text-[8px]">(Same as Previous)</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between w-full h-full">
          {section?.showPageNumbers !== false && pageNumberPosition === "footer" ? (
            <>
              {pageNumberAlignment === "left" ? (
                <>
                  <div className="font-medium text-slate-600 dark:text-slate-300 mr-3 shrink-0">
                    {renderPageNumberContent(pageNumber, totalPages, pageNumberFormat, pageNumberStyle || section?.pageNumberStyle)}
                  </div>
                  {isHeaderFooterActive ? (
                    <div
                      ref={footerContentRef}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setActiveHFType("footer")}
                      onInput={(e) => {
                        isEditingFooterRef.current = true;
                        handleFooterUpdate(e.currentTarget.innerText, e.currentTarget.innerHTML);
                        setTimeout(() => { isEditingFooterRef.current = false; }, 300);
                      }}
                      className="w-full outline-none text-[10px] cursor-text select-text"
                    />
                  ) : effectiveFooterHtml ? (
                    <div className="w-full" dangerouslySetInnerHTML={{ __html: effectiveFooterHtml }} />
                  ) : (
                    <span>{effectiveFooterText}</span>
                  )}
                </>
              ) : pageNumberAlignment === "center" ? (
                <>
                  {isHeaderFooterActive ? (
                    <div
                      ref={footerContentRef}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setActiveHFType("footer")}
                      onInput={(e) => {
                        isEditingFooterRef.current = true;
                        handleFooterUpdate(e.currentTarget.innerText, e.currentTarget.innerHTML);
                        setTimeout(() => { isEditingFooterRef.current = false; }, 300);
                      }}
                      className="w-full outline-none text-[10px] cursor-text select-text"
                    />
                  ) : effectiveFooterHtml ? (
                    <div className="w-full" dangerouslySetInnerHTML={{ __html: effectiveFooterHtml }} />
                  ) : (
                    <span>{effectiveFooterText}</span>
                  )}
                  <div className="font-medium text-slate-600 dark:text-slate-300 absolute left-1/2 -translate-x-1/2">
                    {renderPageNumberContent(pageNumber, totalPages, pageNumberFormat, pageNumberStyle || section?.pageNumberStyle)}
                  </div>
                  <span />
                </>
              ) : (
                <>
                  {isHeaderFooterActive ? (
                    <div
                      ref={footerContentRef}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setActiveHFType("footer")}
                      onInput={(e) => {
                        isEditingFooterRef.current = true;
                        handleFooterUpdate(e.currentTarget.innerText, e.currentTarget.innerHTML);
                        setTimeout(() => { isEditingFooterRef.current = false; }, 300);
                      }}
                      className="w-full outline-none text-[10px] cursor-text select-text"
                    />
                  ) : effectiveFooterHtml ? (
                    <div className="w-full" dangerouslySetInnerHTML={{ __html: effectiveFooterHtml }} />
                  ) : (
                    <span>{effectiveFooterText}</span>
                  )}
                  <div className="font-medium text-slate-600 dark:text-slate-300 ml-3 shrink-0">
                    {renderPageNumberContent(pageNumber, totalPages, pageNumberFormat, pageNumberStyle || section?.pageNumberStyle)}
                  </div>
                </>
              )}
            </>
          ) : (
            isHeaderFooterActive ? (
              <div
                ref={footerContentRef}
                contentEditable
                suppressContentEditableWarning
                onFocus={() => setActiveHFType("footer")}
                onInput={(e) => {
                  isEditingFooterRef.current = true;
                  handleFooterUpdate(e.currentTarget.innerText, e.currentTarget.innerHTML);
                  setTimeout(() => { isEditingFooterRef.current = false; }, 300);
                }}
                className="w-full outline-none text-[10px] cursor-text select-text"
              />
            ) : effectiveFooterHtml ? (
              <div className="w-full" dangerouslySetInnerHTML={{ __html: effectiveFooterHtml }} />
            ) : (
              <span>{effectiveFooterText}</span>
            )
          )}
        </div>
      </div>
    </section>
  );
}

function toRoman(num: number): string {
  if (num <= 0) return String(num);
  const lookup: [number, string][] = [
    [1000, "m"],
    [900, "cm"],
    [500, "d"],
    [400, "cd"],
    [100, "c"],
    [90, "xc"],
    [50, "l"],
    [40, "xl"],
    [10, "x"],
    [9, "ix"],
    [5, "v"],
    [4, "iv"],
    [1, "i"],
  ];
  let result = "";
  let val = num;
  for (const [k, v] of lookup) {
    while (val >= k) {
      result += v;
      val -= k;
    }
  }
  return result;
}

function toAlpha(num: number): string {
  if (num <= 0) return String(num);
  let res = "";
  let n = num;
  while (n > 0) {
    const rem = (n - 1) % 26;
    res = String.fromCharCode(97 + rem) + res;
    n = Math.floor((n - 1) / 26);
  }
  return res;
}

function formatPageNumber(n: number, format?: "1" | "i" | "I" | "a" | "A"): string {
  if (format === "i") {
    return toRoman(n).toLowerCase();
  }
  if (format === "I") {
    return toRoman(n).toUpperCase();
  }
  if (format === "a") {
    return toAlpha(n).toLowerCase();
  }
  if (format === "A") {
    return toAlpha(n).toUpperCase();
  }
  return String(n);
}

function renderPageNumberContent(
  pageNumber: number,
  totalPages: number,
  format?: "1" | "i" | "I" | "a" | "A",
  style?: string,
): React.ReactNode {
  const formattedNum = formatPageNumber(pageNumber, format);
  const formattedTotal = formatPageNumber(totalPages, format);

  switch (style) {
    case "plain":
    case "plain-1":
    case "plain-2":
    case "plain-3":
      return <span>{formattedNum}</span>;

    case "page-x":
      return <span>Page {formattedNum}</span>;

    case "page-x-of-y":
      return (
        <span>
          Page {formattedNum} of {formattedTotal}
        </span>
      );

    case "x-of-y":
      return (
        <span>
          {formattedNum} of {formattedTotal}
        </span>
      );

    case "accent-bar":
      return (
        <span className="inline-flex items-center border-b-2 border-sky-500 pb-0.5 font-bold tracking-wider text-[10px] text-slate-800 dark:text-slate-100">
          PAGE {formattedNum}
        </span>
      );

    case "circle":
      return (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-600 text-white text-[10px] font-bold shadow-xs">
          {formattedNum}
        </span>
      );

    case "modern":
      return (
        <span className="inline-flex items-center gap-1.5">
          <span className="text-[9px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
            CONFIDENTIAL
          </span>
          <span className="text-slate-300 dark:text-slate-600 font-normal">|</span>
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {formattedNum}
          </span>
        </span>
      );

    case "bold-numbers":
      return (
        <span>
          Page <strong className="font-bold text-slate-900 dark:text-white">{formattedNum}</strong> of{" "}
          <strong className="font-bold text-slate-900 dark:text-white">{formattedTotal}</strong>
        </span>
      );

    case "brackets":
      return <span>[ {formattedNum} ]</span>;

    default:
      return <span>{formattedNum}</span>;
  }
}
