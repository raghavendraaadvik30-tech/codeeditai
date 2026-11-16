/* ==========================================================================
   InsertTab.tsx
   --------------------------------------------------------------------------
   Purpose:
   Provides insert options in the editor ribbon for adding pages, page numbers,
   tables, images, links, and symbols.
   ========================================================================== */

import { useState } from "react";
import {
  FilePlus,
  Trash2,
  Hash,
  ChevronDown,
  Check,
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


export default function InsertTab() {
  const {
    model,
    activePage,
    setActivePage,
    addPage,
    removePage,
    updateSection,
  } = useDocumentModel();

  // Format modal dialog state
  const [formatModalOpen, setFormatModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"1" | "a" | "A" | "i" | "I">("1");
  const [numberingOption, setNumberingOption] = useState<"continue" | "startAt">("continue");
  const [startAtValue, setStartAtValue] = useState<number>(1);

  // Active section identification
  const currentPageObj = model.pages.find((p) => p.id === activePage);
  const activeSectionId = currentPageObj?.sectionId || model.sections[0]?.id;
  const activeSection = model.sections.find((s) => s.id === activeSectionId);


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
    Boolean(activeSection?.showPageNumbers) &&
    activeSection?.pageNumberPosition === "header" &&
    activeSection?.pageNumberAlignment === alignment;

  const isBottomActive = (alignment: "left" | "center" | "right") =>
    Boolean(activeSection?.showPageNumbers) &&
    activeSection?.pageNumberPosition === "footer" &&
    activeSection?.pageNumberAlignment === alignment;

  // ------------------------------------------------------------------------
  // Other Insert Handlers
  // ------------------------------------------------------------------------
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
    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 text-secondary-foreground dark:text-muted-foreground">
      {/* ------------------------------------------------------------------
          1. PAGES GROUP
          ------------------------------------------------------------------ */}
      <RibbonButton
        icon={<FilePlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
        onClick={() => addPage()}
      >
        Add Page
      </RibbonButton>

      <RibbonButton
        icon={<Trash2 className="h-4 w-4 text-destructive dark:text-destructive" />}
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
        <DropdownMenuTrigger render={<button
            type="button"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 h-8 text-xs font-medium transition-colors hover:bg-muted dark:hover:bg-muted active:bg-secondary text-secondary-foreground dark:text-muted-foreground cursor-pointer"
            title="Page Number"
          >
            <Hash className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span>Page Number</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>} />
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
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSetHeaderPageNumber("center")}
                className="cursor-pointer flex justify-between items-center"
              >
                <span>Center</span>
                {isTopActive("center") && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSetHeaderPageNumber("right")}
                className="cursor-pointer flex justify-between items-center"
              >
                <span>Right</span>
                {isTopActive("right") && (
                  <Check className="h-3.5 w-3.5 text-primary" />
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
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSetFooterPageNumber("center")}
                className="cursor-pointer flex justify-between items-center"
              >
                <span>Center</span>
                {isBottomActive("center") && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSetFooterPageNumber("right")}
                className="cursor-pointer flex justify-between items-center"
              >
                <span>Right</span>
                {isBottomActive("right") && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {/* 3. Format Page Numbers */}
          <DropdownMenuItem
            onClick={handleOpenFormatModal}
            className="cursor-pointer text-primary font-medium"
          >
            Format Page Numbers...
          </DropdownMenuItem>

          {/* 5. Remove Page Numbers */}
          <DropdownMenuItem
            onClick={handleRemovePageNumbers}
            className="cursor-pointer text-destructive"
          >
            Remove Page Numbers
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ------------------------------------------------------------------
          PAGE NUMBER FORMAT MODAL DIALOG
          ------------------------------------------------------------------ */}
      <Dialog open={formatModalOpen} onOpenChange={setFormatModalOpen}>
        <DialogContent className="max-w-xs bg-card text-foreground dark:bg-secondary dark:text-muted">
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
                className="w-full h-8 px-2 rounded border border-border dark:border-secondary-foreground bg-card dark:bg-secondary text-xs"
              >
                <option value="1">1, 2, 3, ...</option>
                <option value="a">a, b, c, ...</option>
                <option value="A">A, B, C, ...</option>
                <option value="i">i, ii, iii, ...</option>
                <option value="I">I, II, III, ...</option>
              </select>
            </div>

            {/* Page Numbering Mode */}
            <div className="border-t border-muted dark:border-muted pt-3">
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
                    className="text-primary"
                  />
                  <span>Continue from previous section</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pageNumberingOption"
                    checked={numberingOption === "startAt"}
                    onChange={() => setNumberingOption("startAt")}
                    className="text-primary"
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
                    className="w-16 h-7 px-1.5 text-xs rounded border border-border dark:border-secondary-foreground disabled:opacity-50"
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
