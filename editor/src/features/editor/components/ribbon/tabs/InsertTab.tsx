/* ==========================================================================
   InsertTab.tsx
   --------------------------------------------------------------------------
   Purpose:
   Provides insert options in the editor ribbon for adding pages, page numbers,
   tables, images, links, and symbols.
   ========================================================================== */

import { useState, useRef } from "react";
import {
  FilePlus,
  CornerDownLeft,
  Trash2,
  Hash,
  ChevronDown,
  Check,
  Columns2,
  WrapText,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/shared/components/ui/dropdown-menu";

import RibbonButton from "../controls/RibbonButton";
import RibbonDivider from "../controls/RibbonDivider";

import { useDocumentModel } from "../../../store/documentModel";
import { useEditor } from "../../../context/EditorContext";


export default function InsertTab() {
  const {
    model,
    activePage,
    setActivePage,
    addPage,
    removePage,
    updateSection,
  } = useDocumentModel();

  const {
    editorRef,
    insertHTML,
    insertPageBreak,
    insertLineBreak,
    insertColumnBreak,
  } = useEditor();

  const savedRangeRef = useRef<Range | null>(null);

  // Format modal dialog state
  const [formatModalOpen, setFormatModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"1" | "a" | "A" | "i" | "I">("1");
  const [numberingOption, setNumberingOption] = useState<"continue" | "startAt">("continue");
  const [startAtValue, setStartAtValue] = useState<number>(1);

  // Active section identification
  const currentPageObj = model.pages.find((p) => p.id === activePage);
  const activeSectionId = currentPageObj?.sectionId || model.sections[0]?.id;
  const activeSection = model.sections.find((s) => s.id === activeSectionId);

  // Active page index (1-based)
  const activePageIndex = model.pages.findIndex((p) => p.id === activePage);

  // ------------------------------------------------------------------------
  // Helper: HTML insertion
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
  // Cursor Preservation
  // ------------------------------------------------------------------------
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const el =
        container.nodeType === Node.ELEMENT_NODE
          ? (container as Element)
          : container.parentElement;
      if (el?.closest('[contenteditable="true"]')) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
  };

  // ------------------------------------------------------------------------
  // Page Number Handlers
  // ------------------------------------------------------------------------
  const handleSetHeaderPageNumber = (alignment: "left" | "center" | "right") => {
    if (activeSectionId) {
      updateSection(activeSectionId, {
        pageNumberPosition: "header",
        pageNumberAlignment: alignment,
        showPageNumbers: true,
      });
    }
  };

  const handleSetFooterPageNumber = (alignment: "left" | "center" | "right") => {
    if (activeSectionId) {
      updateSection(activeSectionId, {
        pageNumberPosition: "footer",
        pageNumberAlignment: alignment,
        showPageNumbers: true,
      });
    }
  };

  const handleInsertCurrentPosition = (alignment: "left" | "center" | "right") => {
    restoreSelection();
    const pageIndex = activePageIndex >= 0 ? activePageIndex : 0;
    const pNum = pageIndex + 1;
    const htmlSnippet = `<p style="text-align: ${alignment};"><span class="page-number-field" data-field="page-number" contenteditable="false" style="padding: 1px 6px; border-radius: 4px; background-color: #e0f2fe; color: #0369a1; font-weight: 600; font-size: 10pt; user-select: none;">Page ${pNum}</span></p>`;

    handleInsertHTML(htmlSnippet);
  };

  const handleRemovePageNumbers = () => {
    if (activeSectionId) {
      updateSection(activeSectionId, {
        showPageNumbers: false,
        pageNumberPosition: undefined,
      });
    }
  };

  const handleOpenFormatModal = () => {
    setSelectedFormat(
      (activeSection?.pageNumberFormat as "1" | "a" | "A" | "i" | "I") || "1"
    );
    setNumberingOption(
      activeSection?.pageNumberStartAt !== undefined ? "startAt" : "continue"
    );
    setStartAtValue(activeSection?.pageNumberStartAt ?? 1);
    setFormatModalOpen(true);
  };

  const handleApplyFormat = () => {
    if (activeSectionId) {
      updateSection(activeSectionId, {
        pageNumberFormat: selectedFormat,
        pageNumberStartAt:
          numberingOption === "startAt" ? Math.max(1, startAtValue) : undefined,
      });
    }
    setFormatModalOpen(false);
  };

  const isTopActive = (alignment: "left" | "center" | "right") =>
    activeSection?.showPageNumbers !== false &&
    activeSection?.pageNumberPosition === "header" &&
    activeSection?.pageNumberAlignment === alignment;

  const isBottomActive = (alignment: "left" | "center" | "right") =>
    activeSection?.showPageNumbers !== false &&
    activeSection?.pageNumberPosition === "footer" &&
    activeSection?.pageNumberAlignment === alignment;

  // ------------------------------------------------------------------------
  // Other Insert Handlers
  // ------------------------------------------------------------------------
  const handlePageBreak = () => {
    insertPageBreak();
  };

  const handleDeletePage = () => {
    if (!activePage || model.pages.length <= 1) return;

    const currentIdx = model.pages.findIndex((p) => p.id === activePage);
    const fallbackIdx = currentIdx > 0 ? currentIdx - 1 : currentIdx + 1;
    const fallbackPageId = model.pages[fallbackIdx]?.id || model.pages[0]?.id;

    removePage(activePage);

    if (fallbackPageId) {
      setActivePage(fallbackPageId);
    }
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 text-slate-700 dark:text-slate-200">
      {/* ------------------------------------------------------------------
          1. PAGES GROUP
          ------------------------------------------------------------------ */}
      <RibbonButton
        icon={<FilePlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
        onClick={() => addPage()}
      >
        Add Page
      </RibbonButton>

      {/* Page Break button: splits content to next page (Ctrl+Enter) */}
      <RibbonButton
        icon={<CornerDownLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
        onClick={handlePageBreak}
      >
        Page Break
      </RibbonButton>

      {/* Column Break button: advances content to next column or page (Ctrl+Shift+Enter) */}
      <RibbonButton
        icon={<Columns2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
        onClick={() => insertColumnBreak()}
      >
        Column Break
      </RibbonButton>

      {/* Line Break button: inserts soft break (<br>) within current paragraph (Shift+Enter) */}
      <RibbonButton
        icon={<WrapText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
        onClick={() => insertLineBreak()}
      >
        Line Break
      </RibbonButton>

      <RibbonButton
        icon={<Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />}
        onClick={handleDeletePage}
        disabled={model.pages.length <= 1}
      >
        Delete Page
      </RibbonButton>

      <RibbonDivider />

      {/* ------------------------------------------------------------------
          2. PAGE NUMBER DROPDOWN MENU (Matches Exact Structure and Styling)
          ------------------------------------------------------------------ */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onMouseDown={saveSelection}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 h-8 text-xs font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 text-slate-700 dark:text-slate-200 cursor-pointer"
            title="Page Number"
          >
            <Hash className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span>Page Number</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 text-xs p-1">
          {/* 1. Top of Page Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <span>Top of Page</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-40 text-xs">
              <DropdownMenuItem
                onClick={() => handleSetHeaderPageNumber("left")}
                className="cursor-pointer flex justify-between items-center"
              >
                <span>Left</span>
                {isTopActive("left") && (
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSetHeaderPageNumber("center")}
                className="cursor-pointer flex justify-between items-center"
              >
                <span>Center</span>
                {isTopActive("center") && (
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSetHeaderPageNumber("right")}
                className="cursor-pointer flex justify-between items-center"
              >
                <span>Right</span>
                {isTopActive("right") && (
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                )}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* 2. Bottom of Page Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <span>Bottom of Page</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-40 text-xs">
              <DropdownMenuItem
                onClick={() => handleSetFooterPageNumber("left")}
                className="cursor-pointer flex justify-between items-center"
              >
                <span>Left</span>
                {isBottomActive("left") && (
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSetFooterPageNumber("center")}
                className="cursor-pointer flex justify-between items-center"
              >
                <span>Center</span>
                {isBottomActive("center") && (
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSetFooterPageNumber("right")}
                className="cursor-pointer flex justify-between items-center"
              >
                <span>Right</span>
                {isBottomActive("right") && (
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                )}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* 3. Current Position Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <span>Current Position</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-40 text-xs">
              <DropdownMenuItem
                onClick={() => handleInsertCurrentPosition("left")}
                className="cursor-pointer"
              >
                <span>Left</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleInsertCurrentPosition("center")}
                className="cursor-pointer"
              >
                <span>Center</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleInsertCurrentPosition("right")}
                className="cursor-pointer"
              >
                <span>Right</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {/* 4. Format Page Numbers */}
          <DropdownMenuItem
            onClick={handleOpenFormatModal}
            className="cursor-pointer text-blue-600 font-medium"
          >
            Format Page Numbers...
          </DropdownMenuItem>

          {/* 5. Remove Page Numbers */}
          <DropdownMenuItem
            onClick={handleRemovePageNumbers}
            className="cursor-pointer text-red-600"
          >
            Remove Page Numbers
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ------------------------------------------------------------------
          PAGE NUMBER FORMAT MODAL DIALOG
          ------------------------------------------------------------------ */}
      <Dialog open={formatModalOpen} onOpenChange={setFormatModalOpen}>
        <DialogContent className="max-w-xs bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              Page Number Format
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Number Format Select */}
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">
                Number format:
              </Label>
              <select
                value={selectedFormat}
                onChange={(e) =>
                  setSelectedFormat(e.target.value as "1" | "a" | "A" | "i" | "I")
                }
                className="w-full h-8 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              >
                <option value="1">1, 2, 3, ...</option>
                <option value="a">a, b, c, ...</option>
                <option value="A">A, B, C, ...</option>
                <option value="i">i, ii, iii, ...</option>
                <option value="I">I, II, III, ...</option>
              </select>
            </div>

            {/* Page Numbering Mode */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <Label className="text-xs font-semibold mb-2 block">
                Page numbering:
              </Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pageNumberingOption"
                    checked={numberingOption === "continue"}
                    onChange={() => setNumberingOption("continue")}
                    className="text-blue-600"
                  />
                  <span>Continue from previous section</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pageNumberingOption"
                    checked={numberingOption === "startAt"}
                    onChange={() => setNumberingOption("startAt")}
                    className="text-blue-600"
                  />
                  <span>Start at:</span>
                  <input
                    type="number"
                    min={1}
                    value={startAtValue}
                    onChange={(e) =>
                      setStartAtValue(Math.max(1, parseInt(e.target.value, 10) || 1))
                    }
                    disabled={numberingOption !== "startAt"}
                    className="w-16 h-7 px-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 disabled:opacity-50"
                  />
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFormatModalOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleApplyFormat}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
