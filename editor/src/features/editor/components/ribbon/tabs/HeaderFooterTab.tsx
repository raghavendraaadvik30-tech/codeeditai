/**
 * HeaderFooterTab.tsx
 *
 * Contextual Microsoft Word-style "Header & Footer" Ribbon Tab.
 * Displayed dynamically when the user is actively editing a Header or Footer.
 */

import React, { useState } from "react";
import {
  Calendar,
  ChevronDown,
  FileText,
  Hash,
  Link2,
  MoveDown,
  MoveUp,
  SkipBack,
  SkipForward,
  X,
} from "lucide-react";
import { useDocumentModel } from "@/features/editor/store/documentModel";
import { useHeaderFooter, type HFUnit } from "@/features/editor/modules/document/context/HeaderFooterContext";
import {
  HeaderGallery,
  FooterGallery,
} from "@/features/editor/modules/document/components/HeaderFooterGallery";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

// Unit conversion helpers (96 DPI base)
const CM_TO_PX = 37.795;
const IN_TO_PX = 96;

function pxToUnit(px: number, unit: HFUnit): number {
  if (unit === "cm") return parseFloat((px / CM_TO_PX).toFixed(2));
  if (unit === "in") return parseFloat((px / IN_TO_PX).toFixed(2));
  return Math.round(px);
}

function unitToPx(val: number, unit: HFUnit): number {
  if (unit === "cm") return Math.round(val * CM_TO_PX);
  if (unit === "in") return Math.round(val * IN_TO_PX);
  return Math.round(val);
}

export default function HeaderFooterTab() {
  const { model, activePage, updateSection } = useDocumentModel();
  const {
    activeHFType,
    activeSectionId,
    showDocumentText,
    unit,
    exitHeaderFooterMode,
    goToHeader,
    goToFooter,
    goToPrevSection,
    goToNextSection,
    setShowDocumentText,
    setUnit,
  } = useHeaderFooter();

  const currentPage = model.pages.find((p) => p.id === activePage) || model.pages[0];
  const activeSection =
    model.sections.find((s) => s.id === (activeSectionId || currentPage?.sectionId)) ||
    model.sections[0];

  const sectionIndex = model.sections.findIndex((s) => s.id === activeSection?.id);
  const totalSections = model.sections.length;

  // Header & Footer distances from edges (default 48px ≈ 1.27 cm ≈ 0.5 in)
  const headerTopPx = activeSection?.headerTopDistance ?? 48;
  const footerBottomPx = activeSection?.footerBottomDistance ?? 48;

  const headerDisplayVal = pxToUnit(headerTopPx, unit);
  const footerDisplayVal = pxToUnit(footerBottomPx, unit);

  const [headerInputVal, setHeaderInputVal] = useState<string>(String(headerDisplayVal));
  const [footerInputVal, setFooterInputVal] = useState<string>(String(footerDisplayVal));

  // Sync state when section or unit changes
  React.useEffect(() => {
    setHeaderInputVal(String(pxToUnit(headerTopPx, unit)));
    setFooterInputVal(String(pxToUnit(footerBottomPx, unit)));
  }, [headerTopPx, footerBottomPx, unit]);

  const handleHeaderDistanceChange = (newVal: number) => {
    if (!activeSection) return;
    const px = Math.max(0, Math.min(200, unitToPx(newVal, unit)));
    updateSection(activeSection.id, { headerTopDistance: px });
  };

  const handleFooterDistanceChange = (newVal: number) => {
    if (!activeSection) return;
    const px = Math.max(0, Math.min(200, unitToPx(newVal, unit)));
    updateSection(activeSection.id, { footerBottomDistance: px });
  };

  const handleInsertDateTime = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // Insert at selection inside active header or footer
    document.execCommand("insertText", false, dateStr);
  };

  const handleInsertDocTitle = () => {
    const title = model.title || "Document Title";
    document.execCommand("insertText", false, title);
  };

  // Section Page Number shortcuts
  const handleSetHeaderPageNumber = (alignment: "left" | "center" | "right") => {
    if (activeSection) {
      updateSection(activeSection.id, {
        pageNumberPosition: "header",
        pageNumberAlignment: alignment,
        showPageNumbers: true,
      });
    }
  };

  const handleSetFooterPageNumber = (alignment: "left" | "center" | "right") => {
    if (activeSection) {
      updateSection(activeSection.id, {
        pageNumberPosition: "footer",
        pageNumberAlignment: alignment,
        showPageNumbers: true,
      });
    }
  };

  const handleRemovePageNumbers = () => {
    if (activeSection) {
      updateSection(activeSection.id, {
        showPageNumbers: false,
        pageNumberPosition: undefined,
      });
    }
  };

  const isDifferentFirstPage = activeSection?.differentFirstPage ?? false;
  const isDifferentOddEven = activeSection?.differentOddEven ?? false;
  const isLinkToPrevious = activeSection?.linkToPrevious ?? false;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 text-slate-700 dark:text-slate-200">
      {/* ============================================================
          GROUP 1: HEADER & FOOTER GALLERIES
      ============================================================ */}
      <div className="flex items-center gap-1 border-r border-slate-200 pr-2 dark:border-slate-800">
        <HeaderGallery />
        <FooterGallery />

        {/* Page Number Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
              title="Page Number Placement"
            >
              <Hash className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              <span>Page Number</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52 text-xs p-1">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <span>Top of Page (Header)</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-36 text-xs">
                <DropdownMenuItem onClick={() => handleSetHeaderPageNumber("left")}>
                  Left
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSetHeaderPageNumber("center")}>
                  Center
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSetHeaderPageNumber("right")}>
                  Right
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <span>Bottom of Page (Footer)</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-36 text-xs">
                <DropdownMenuItem onClick={() => handleSetFooterPageNumber("left")}>
                  Left
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSetFooterPageNumber("center")}>
                  Center
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSetFooterPageNumber("right")}>
                  Right
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem
              onClick={handleRemovePageNumbers}
              className="text-rose-600 cursor-pointer"
            >
              Remove Page Numbers
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ============================================================
          GROUP 2: INSERT QUICK FIELDS
      ============================================================ */}
      <div className="flex items-center gap-1 border-r border-slate-200 pr-2 dark:border-slate-800">
        <button
          type="button"
          onClick={handleInsertDateTime}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          title="Insert Current Date & Time"
        >
          <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Date & Time</span>
        </button>

        <button
          type="button"
          onClick={handleInsertDocTitle}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          title="Insert Document Title"
        >
          <FileText className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span>Document Title</span>
        </button>
      </div>

      {/* ============================================================
          GROUP 3: NAVIGATION
      ============================================================ */}
      <div className="flex items-center gap-1 border-r border-slate-200 pr-2 dark:border-slate-800">
        <button
          type="button"
          onClick={goToHeader}
          className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
            activeHFType === "header"
              ? "bg-blue-100 text-[#0078d4] font-semibold dark:bg-blue-950/70"
              : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          }`}
          title="Go to Header"
        >
          <MoveUp className="h-3.5 w-3.5 text-blue-600" />
          <span>Go to Header</span>
        </button>

        <button
          type="button"
          onClick={goToFooter}
          className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
            activeHFType === "footer"
              ? "bg-blue-100 text-[#0078d4] font-semibold dark:bg-blue-950/70"
              : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          }`}
          title="Go to Footer"
        >
          <MoveDown className="h-3.5 w-3.5 text-blue-600" />
          <span>Go to Footer</span>
        </button>

        <button
          type="button"
          onClick={goToPrevSection}
          disabled={sectionIndex <= 0}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          title="Previous Section"
        >
          <SkipBack className="h-3.5 w-3.5 text-slate-500" />
          <span>Prev Section</span>
        </button>

        <button
          type="button"
          onClick={goToNextSection}
          disabled={sectionIndex >= totalSections - 1}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          title="Next Section"
        >
          <SkipForward className="h-3.5 w-3.5 text-slate-500" />
          <span>Next Section</span>
        </button>

        {sectionIndex > 0 && (
          <button
            type="button"
            onClick={() =>
              updateSection(activeSection.id, {
                linkToPrevious: !isLinkToPrevious,
              })
            }
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors cursor-pointer ${
              isLinkToPrevious
                ? "bg-blue-100 text-[#0078d4] ring-1 ring-[#0078d4] dark:bg-blue-950"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
            title="Link Header/Footer to Previous Section"
          >
            <Link2 className="h-3.5 w-3.5" />
            <span>Link to Prev</span>
          </button>
        )}
      </div>

      {/* ============================================================
          GROUP 4: OPTIONS (CHECKBOXES)
      ============================================================ */}
      <div className="flex items-center gap-3 border-r border-slate-200 px-2 text-xs dark:border-slate-800">
        <label className="flex items-center gap-1.5 select-none cursor-pointer hover:text-slate-900 dark:hover:text-white">
          <input
            type="checkbox"
            checked={isDifferentFirstPage}
            onChange={(e) => {
              if (activeSection) {
                updateSection(activeSection.id, {
                  differentFirstPage: e.target.checked,
                });
              }
            }}
            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span>Different First Page</span>
        </label>

        <label className="flex items-center gap-1.5 select-none cursor-pointer hover:text-slate-900 dark:hover:text-white">
          <input
            type="checkbox"
            checked={isDifferentOddEven}
            onChange={(e) => {
              if (activeSection) {
                updateSection(activeSection.id, {
                  differentOddEven: e.target.checked,
                });
              }
            }}
            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span>Different Odd & Even</span>
        </label>

        <label className="flex items-center gap-1.5 select-none cursor-pointer hover:text-slate-900 dark:hover:text-white">
          <input
            type="checkbox"
            checked={showDocumentText}
            onChange={(e) => setShowDocumentText(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span>Show Doc Text</span>
        </label>
      </div>

      {/* ============================================================
          GROUP 5: POSITION (FROM TOP / FROM BOTTOM)
      ============================================================ */}
      <div className="flex items-center gap-2 border-r border-slate-200 px-2 text-xs dark:border-slate-800">
        {/* Header from Top */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-500">Header Top:</span>
          <input
            type="number"
            step={unit === "px" ? "1" : "0.1"}
            min="0"
            max={unit === "px" ? "200" : "5"}
            value={headerInputVal}
            onChange={(e) => {
              setHeaderInputVal(e.target.value);
              const num = parseFloat(e.target.value);
              if (!isNaN(num)) handleHeaderDistanceChange(num);
            }}
            className="w-13 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-center outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        {/* Footer from Bottom */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-500">Footer Bottom:</span>
          <input
            type="number"
            step={unit === "px" ? "1" : "0.1"}
            min="0"
            max={unit === "px" ? "200" : "5"}
            value={footerInputVal}
            onChange={(e) => {
              setFooterInputVal(e.target.value);
              const num = parseFloat(e.target.value);
              if (!isNaN(num)) handleFooterDistanceChange(num);
            }}
            className="w-13 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs text-center outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>

        {/* Unit toggle selector */}
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as HFUnit)}
          className="rounded border border-slate-200 bg-white px-1 py-0.5 text-[11px] outline-none text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 cursor-pointer"
          title="Change measurement unit"
        >
          <option value="cm">cm</option>
          <option value="in">inch</option>
          <option value="px">px</option>
        </select>
      </div>

      {/* ============================================================
          GROUP 6: CLOSE HEADER & FOOTER
      ============================================================ */}
      <div className="pl-1">
        <button
          type="button"
          onClick={exitHeaderFooterMode}
          className="flex items-center gap-1.5 rounded-md bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 border border-rose-200 shadow-xs hover:bg-rose-100 hover:text-rose-700 transition-colors dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-900/50 cursor-pointer"
          title="Close Header and Footer (Esc)"
        >
          <X className="h-4 w-4" />
          <span>Close Header and Footer</span>
        </button>
      </div>
    </div>
  );
}
