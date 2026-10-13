/**
 * HeaderFooterTab.tsx
 *
 * Microsoft Word-style "Header & Footer Tools - Design" Ribbon Tab.
 * Formatted with 6 functional ribbon groups, vertical group separators,
 * large command buttons with authentic Office-style icons, and bottom group labels.
 */

import { useState, useEffect } from "react";
import {
  ChevronDown,
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
  DropdownMenuSeparator,
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

/* ==========================================================================
   AUTHENTIC MICROSOFT WORD RIBBON ICONS (SVGs)
   ========================================================================== */

/** 1. Word Header Icon: Document page with bold orange top banner */
function WordHeaderIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="docShadow" x="-2" y="0" width="36" height="36" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0.5" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.18" />
        </filter>
        <linearGradient id="headerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff8c00" />
          <stop offset="100%" stopColor="#e65100" />
        </linearGradient>
      </defs>
      {/* Paper Sheet */}
      <rect x="5" y="3" width="22" height="26" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" filter="url(#docShadow)" />
      {/* Folded Top-Right Corner Accent */}
      <path d="M22 3L27 8H23.5C22.7 8 22 7.3 22 6.5V3Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
      {/* Bold Orange Header Bar */}
      <rect x="7.5" y="5.5" width="13.5" height="4.5" rx="0.8" fill="url(#headerGrad)" stroke="#c2410c" strokeWidth="0.6" />
      {/* Document Body Text Lines */}
      <line x1="8" y1="13.5" x2="24" y2="13.5" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="17.5" x2="24" y2="17.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="21.5" x2="20" y2="21.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="25.5" x2="16" y2="25.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** 2. Word Footer Icon: Document page with bold orange bottom banner */
function WordFooterIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="footerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff8c00" />
          <stop offset="100%" stopColor="#e65100" />
        </linearGradient>
      </defs>
      {/* Paper Sheet */}
      <rect x="5" y="3" width="22" height="26" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
      {/* Folded Top-Right Corner */}
      <path d="M22 3L27 8H23.5C22.7 8 22 7.3 22 6.5V3Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
      {/* Document Body Text Lines */}
      <line x1="8" y1="7.5" x2="19" y2="7.5" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="11.5" x2="24" y2="11.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="15.5" x2="24" y2="15.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="19.5" x2="18" y2="19.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
      {/* Bold Orange Footer Bar */}
      <rect x="7.5" y="22.5" width="17" height="4.5" rx="0.8" fill="url(#footerGrad)" stroke="#c2410c" strokeWidth="0.6" />
    </svg>
  );
}

/** 3. Word Page Number Icon: Document page with # tag at bottom */
function WordPageNumberIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="3" width="22" height="26" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
      <path d="M22 3L27 8H23.5C22.7 8 22 7.3 22 6.5V3Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
      {/* Text Lines */}
      <line x1="8" y1="7.5" x2="19" y2="7.5" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="11.5" x2="24" y2="11.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="15.5" x2="24" y2="15.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
      {/* Page Number Tag (#) */}
      <rect x="10.5" y="19.5" width="11" height="7.5" rx="1" fill="#eff6ff" stroke="#2563eb" strokeWidth="1" />
      <text x="16" y="25.5" fontSize="7" fontWeight="bold" fill="#1d4ed8" textAnchor="middle" fontFamily="monospace">
        #
      </text>
    </svg>
  );
}

/** 4. Word Date & Time Icon: Wall Calendar with Clock Badge */
function WordDateTimeIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Calendar Body */}
      <rect x="4" y="5" width="21" height="21" rx="2" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.4" />
      {/* Top Header Bar */}
      <rect x="4" y="5" width="21" height="6.5" rx="1" fill="#2563eb" />
      {/* Rings */}
      <rect x="8" y="3" width="2" height="3.5" rx="0.5" fill="#64748b" />
      <rect x="19" y="3" width="2" height="3.5" rx="0.5" fill="#64748b" />
      {/* Grid Lines */}
      <line x1="4" y1="16" x2="25" y2="16" stroke="#e2e8f0" strokeWidth="1" />
      <line x1="4" y1="21" x2="16" y2="21" stroke="#e2e8f0" strokeWidth="1" />
      <line x1="11" y1="11.5" x2="11" y2="26" stroke="#e2e8f0" strokeWidth="1" />
      <line x1="18" y1="11.5" x2="18" y2="17" stroke="#e2e8f0" strokeWidth="1" />
      {/* Day '5' Accent */}
      <text x="14.5" y="19.5" fontSize="6.5" fontWeight="bold" fill="#2563eb" textAnchor="middle">
        5
      </text>
      {/* Clock Badge (Bottom Right) */}
      <circle cx="22" cy="22" r="6.5" fill="#ffffff" stroke="#475569" strokeWidth="1.2" />
      <path d="M22 18v4l2.5 1.5" stroke="#0284c7" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** 5. Word Quick Parts Icon: Document with Orange/Blue Modular Sections */
function WordQuickPartsIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="3" width="22" height="26" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
      <path d="M22 3L27 8H23.5C22.7 8 22 7.3 22 6.5V3Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
      {/* Top Header/Property Block */}
      <rect x="7.5" y="5.5" width="13.5" height="4" rx="0.5" fill="#3b82f6" />
      {/* Orange Callout/Sidebar Block */}
      <rect x="7.5" y="11.5" width="6" height="13.5" rx="0.5" fill="#f97316" />
      {/* Text Lines */}
      <line x1="15.5" y1="13.5" x2="24" y2="13.5" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="15.5" y1="17.5" x2="24" y2="17.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="15.5" y1="21.5" x2="22" y2="21.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}



/** 8. Word Go to Header Icon: Document with orange header highlight & up indicator */
function WordGoToHeaderIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="3" width="22" height="26" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
      <path d="M22 3L27 8H23.5C22.7 8 22 7.3 22 6.5V3Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
      {/* Top Header Highlight */}
      <rect x="7.5" y="5.5" width="13.5" height="4.5" rx="0.8" fill="#f97316" stroke="#c2410c" strokeWidth="0.6" />
      {/* Up Arrow Marker */}
      <path d="M14 18L14 13M14 13L11.5 15.5M14 13L16.5 15.5" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8" y1="21.5" x2="24" y2="21.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="25.5" x2="18" y2="25.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** 9. Word Go to Footer Icon: Document with orange footer highlight & down indicator */
function WordGoToFooterIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="3" width="22" height="26" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
      <path d="M22 3L27 8H23.5C22.7 8 22 7.3 22 6.5V3Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
      <line x1="8" y1="7.5" x2="19" y2="7.5" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="11.5" x2="24" y2="11.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
      {/* Down Arrow Marker */}
      <path d="M14 14L14 19M14 19L11.5 16.5M14 19L16.5 16.5" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Bottom Footer Highlight */}
      <rect x="7.5" y="22.5" width="17" height="4.5" rx="0.8" fill="#f97316" stroke="#c2410c" strokeWidth="0.6" />
    </svg>
  );
}



/** 13. Word Header from Top Margin Icon */
function WordHeaderTopIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="12" height="12" rx="1" fill="#ffffff" stroke="#64748b" strokeWidth="1" />
      <line x1="2" y1="5.5" x2="14" y2="5.5" stroke="#f97316" strokeWidth="1.2" strokeDasharray="1.5 1" />
      <path d="M8 2.5V5M8 5L6.5 3.8M8 5L9.5 3.8" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 14. Word Footer from Bottom Margin Icon */
function WordFooterBottomIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="12" height="12" rx="1" fill="#ffffff" stroke="#64748b" strokeWidth="1" />
      <line x1="2" y1="10.5" x2="14" y2="10.5" stroke="#f97316" strokeWidth="1.2" strokeDasharray="1.5 1" />
      <path d="M8 13.5V11M8 11L6.5 12.2M8 11L9.5 12.2" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 15. Word Insert Alignment Tab Icon */
function WordAlignmentTabIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="2" y1="8" x2="11" y2="8" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 5.5L11.5 8L9 10.5" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="14" y1="4" x2="14" y2="12" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** 16. Word Close Header & Footer Icon: Iconic Red Square with Bold White 'X' */
function WordCloseIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className} rounded bg-gradient-to-b from-destructive to-destructive border border-destructive shadow-xs`}>
      {/* Subtle glossy top highlight */}
      <div className="absolute top-0.5 inset-x-1 h-1.5 rounded-t bg-card/35" />
      <X className="w-4 h-4 text-primary-foreground stroke-[2.8]" />
    </div>
  );
}



/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */
export default function HeaderFooterTab() {
  const { model, activePage, updateSection } = useDocumentModel();
  const {
    activeHFType,
    activeSectionId,
    activePageId,
    showDocumentText,
    unit,
    exitHeaderFooterMode,
    goToHeader,
    goToFooter,
    setShowDocumentText,
    setUnit,
  } = useHeaderFooter();

  const currentPage = model.pages.find((p) => p.id === activePage) || model.pages[0];
  const activeSection =
    model.sections.find((s) => s.id === (activeSectionId || currentPage?.sectionId)) ||
    model.sections[0];

  // Header & Footer distances (default 48px ≈ 1.25 cm ≈ 0.5 in)
  const headerTopPx = activeSection?.headerTopDistance ?? 48;
  const footerBottomPx = activeSection?.footerBottomDistance ?? 48;

  const headerDisplayVal = pxToUnit(headerTopPx, unit);
  const footerDisplayVal = pxToUnit(footerBottomPx, unit);

  const [headerInputVal, setHeaderInputVal] = useState<string>(String(headerDisplayVal));
  const [footerInputVal, setFooterInputVal] = useState<string>(String(footerDisplayVal));

  // Sync state when section or unit changes
  useEffect(() => {
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

  const stepDistance = (type: "header" | "footer", delta: number) => {
    const currentVal = type === "header" ? parseFloat(headerInputVal) : parseFloat(footerInputVal);
    const validCurrent = isNaN(currentVal) ? (unit === "px" ? 48 : 1.25) : currentVal;
    const step = unit === "px" ? 1 : 0.1;
    const nextVal = Math.max(0, parseFloat((validCurrent + delta * step).toFixed(2)));

    if (type === "header") {
      setHeaderInputVal(String(nextVal));
      handleHeaderDistanceChange(nextVal);
    } else {
      setFooterInputVal(String(nextVal));
      handleFooterDistanceChange(nextVal);
    }
  };

  // Helper to insert HTML directly into the currently active Header or Footer
  const insertHtmlIntoActiveHF = (htmlSnippet: string) => {
    const targetPageId = activePageId || activePage || model.pages[0]?.id;
    const selector = `[data-hf-container="${activeHFType}"][data-page-id="${targetPageId}"] [contenteditable="true"]`;
    const targetEl = document.querySelector(selector) as HTMLElement | null;

    if (targetEl) {
      targetEl.focus();
      const sel = window.getSelection();
      let inserted = false;
      if (sel && sel.rangeCount > 0 && targetEl.contains(sel.anchorNode)) {
        try {
          inserted = document.execCommand("insertHTML", false, htmlSnippet);
        } catch {
          inserted = false;
        }
      }
      if (!inserted) {
        const wrapper = document.createElement("span");
        wrapper.innerHTML = htmlSnippet;
        targetEl.appendChild(wrapper);
      }
      targetEl.dispatchEvent(new Event("input", { bubbles: true }));

      if (activeSection) {
        const targetPage = model.pages.find((p) => p.id === targetPageId) || model.pages[0];
        const pageIdx = targetPage ? model.pages.indexOf(targetPage) : 0;
        const isFirstPage = pageIdx === 0 || model.pages.filter((p) => p.sectionId === activeSection.id)[0]?.id === targetPage?.id;
        const isEvenPage = (pageIdx + 1) % 2 === 0;

        let kind: "first" | "even" | "normal" = "normal";
        if (activeSection.differentFirstPage && isFirstPage) {
          kind = "first";
        } else if (activeSection.differentOddEven && isEvenPage) {
          kind = "even";
        }

        const patch: Partial<SectionModel> = {};
        if (activeHFType === "header") {
          if (kind === "first") {
            patch.firstHeader = targetEl.innerText;
            patch.firstHeaderHtml = targetEl.innerHTML;
          } else if (kind === "even") {
            patch.evenHeader = targetEl.innerText;
            patch.evenHeaderHtml = targetEl.innerHTML;
          } else {
            patch.header = targetEl.innerText;
            patch.headerHtml = targetEl.innerHTML;
          }
        } else {
          if (kind === "first") {
            patch.firstFooter = targetEl.innerText;
            patch.firstFooterHtml = targetEl.innerHTML;
          } else if (kind === "even") {
            patch.evenFooter = targetEl.innerText;
            patch.evenFooterHtml = targetEl.innerHTML;
          } else {
            patch.footer = targetEl.innerText;
            patch.footerHtml = targetEl.innerHTML;
          }
        }
        updateSection(activeSection.id, patch);
      }
    } else {
      document.execCommand("insertHTML", false, htmlSnippet);
    }
  };

  const handleInsertDateTime = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    insertHtmlIntoActiveHF(`<span>${dateStr}</span>&nbsp;`);
  };

  const handleInsertDocTitle = () => {
    const title = model.title || "Document Title";
    insertHtmlIntoActiveHF(`<span>${title}</span>&nbsp;`);
  };

  const handleInsertAuthor = () => {
    insertHtmlIntoActiveHF(`<span>Author</span>&nbsp;`);
  };

  const handleInsertAlignmentTab = (alignment: "center" | "right") => {
    if (alignment === "right") {
      insertHtmlIntoActiveHF('<span style="display:inline-block; margin-left:auto; width:60px;">&nbsp;</span>');
    } else {
      insertHtmlIntoActiveHF('<span style="display:inline-block; margin:0 auto; width:30px;">&nbsp;</span>');
    }
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

  return (
    <div className="flex items-stretch h-22 text-secondary-foreground dark:text-muted-foreground select-none overflow-x-auto">

      {/* ============================================================
          GROUP 1: HEADER & FOOTER
      ============================================================ */}
      <div className="flex flex-col justify-between items-center px-1.5 shrink-0">
        <div className="flex items-center gap-1 flex-1">
          {/* 1. Header Dropdown Button */}
          <HeaderGallery
            customTrigger={
              <button
                type="button"
                className="flex flex-col items-center justify-center w-12 h-15 rounded hover:bg-muted hover:border hover:border-border dark:hover:bg-muted dark:hover:border-secondary-foreground active:bg-secondary/70 transition-colors p-0.5 cursor-pointer group"
                title="Header: Add or change header"
              >
                <WordHeaderIcon className="w-7 h-7 group-hover:scale-105 transition-transform" />
                <span className="text-11px leading-tight text-foreground dark:text-muted mt-1 flex items-center gap-0.5">
                  Header
                  <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
                </span>
              </button>
            }
          />

          {/* 2. Footer Dropdown Button */}
          <FooterGallery
            customTrigger={
              <button
                type="button"
                className="flex flex-col items-center justify-center w-12 h-15 rounded hover:bg-muted hover:border hover:border-border dark:hover:bg-muted dark:hover:border-secondary-foreground active:bg-secondary/70 transition-colors p-0.5 cursor-pointer group"
                title="Footer: Add or change footer"
              >
                <WordFooterIcon className="w-7 h-7 group-hover:scale-105 transition-transform" />
                <span className="text-11px leading-tight text-foreground dark:text-muted mt-1 flex items-center gap-0.5">
                  Footer
                  <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
                </span>
              </button>
            }
          />

          {/* 3. Page Number Dropdown Button */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<button
                type="button"
                className="flex flex-col items-center justify-center w-13 h-15 rounded hover:bg-muted hover:border hover:border-border dark:hover:bg-muted dark:hover:border-secondary-foreground active:bg-secondary/70 transition-colors p-0.5 cursor-pointer group"
                title="Page Number: Insert page numbers into document"
              >
                <WordPageNumberIcon className="w-7 h-7 group-hover:scale-105 transition-transform" />
                <span className="text-10px leading-3 text-foreground dark:text-muted mt-0.5 text-center flex flex-col items-center">
                  <span>Page</span>
                  <span className="flex items-center gap-0.5">
                    Number
                    <ChevronDown className="w-2.5 h-2.5 text-muted-foreground" />
                  </span>
                </span>
              </button>} />
            <DropdownMenuContent align="start" className="w-56 text-xs p-1 shadow-lg bg-card dark:bg-[#0B1620]">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <span>Top of Page</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-36 text-xs">
                  <DropdownMenuItem onClick={() => handleSetHeaderPageNumber("left")}>
                    Plain Number 1 (Left)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSetHeaderPageNumber("center")}>
                    Plain Number 2 (Center)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSetHeaderPageNumber("right")}>
                    Plain Number 3 (Right)
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <span>Bottom of Page</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-36 text-xs">
                  <DropdownMenuItem onClick={() => handleSetFooterPageNumber("left")}>
                    Plain Number 1 (Left)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSetFooterPageNumber("center")}>
                    Plain Number 2 (Center)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSetFooterPageNumber("right")}>
                    Plain Number 3 (Right)
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleRemovePageNumbers}
                className="text-destructive dark:text-destructive cursor-pointer"
              >
                Remove Page Numbers
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Group 1 Label */}
        <div className="text-10px text-muted-foreground dark:text-muted-foreground font-normal tracking-tight text-center py-0.5 select-none">
          Header &amp; Footer
        </div>
      </div>

      {/* Vertical Group Divider */}
      <div className="w-0.25 bg-secondary dark:bg-muted self-stretch my-1 shrink-0" />

      {/* ============================================================
          GROUP 2: INSERT
      ============================================================ */}
      <div className="flex flex-col justify-between items-center px-1.5 shrink-0">
        <div className="flex items-center gap-1 flex-1">
          {/* Date & Time */}
          <button
            type="button"
            onClick={handleInsertDateTime}
            className="flex flex-col items-center justify-center w-12 h-15 rounded hover:bg-muted hover:border hover:border-border dark:hover:bg-muted dark:hover:border-secondary-foreground active:bg-secondary/70 transition-colors p-0.5 cursor-pointer group"
            title="Date & Time: Insert current date or time"
          >
            <WordDateTimeIcon className="w-7 h-7 group-hover:scale-105 transition-transform" />
            <span className="text-10px leading-3 text-foreground dark:text-muted mt-0.5 text-center flex flex-col items-center">
              <span>Date &amp;</span>
              <span>Time</span>
            </span>
          </button>

          {/* Quick Parts Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<button
                type="button"
                className="flex flex-col items-center justify-center w-12 h-15 rounded hover:bg-muted hover:border hover:border-border dark:hover:bg-muted dark:hover:border-secondary-foreground active:bg-secondary/70 transition-colors p-0.5 cursor-pointer group"
                title="Quick Parts: Insert reusable pieces of content"
              >
                <WordQuickPartsIcon className="w-7 h-7 group-hover:scale-105 transition-transform" />
                <span className="text-10px leading-3 text-foreground dark:text-muted mt-0.5 text-center flex flex-col items-center">
                  <span>Quick</span>
                  <span className="flex items-center gap-0.5">
                    Parts
                    <ChevronDown className="w-2 h-2 text-muted-foreground" />
                  </span>
                </span>
              </button>} />
            <DropdownMenuContent align="start" className="w-48 text-xs p-1 shadow-lg bg-card dark:bg-[#0B1620]">
              <DropdownMenuItem onClick={handleInsertDocTitle} className="cursor-pointer">
                Document Title
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleInsertAuthor} className="cursor-pointer">
                Author
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleInsertDateTime} className="cursor-pointer">
                Date Field
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Group 2 Label */}
        <div className="text-10px text-muted-foreground dark:text-muted-foreground font-normal tracking-tight text-center py-0.5 select-none">
          Insert
        </div>
      </div>

      {/* Vertical Group Divider */}
      <div className="w-0.25 bg-secondary dark:bg-muted self-stretch my-1 shrink-0" />

      {/* ============================================================
          GROUP 3: NAVIGATION
      ============================================================ */}
      <div className="flex flex-col justify-between items-center px-1.5 shrink-0">
        <div className="flex items-center gap-1 flex-1">
          {/* Go to Header */}
          <button
            type="button"
            onClick={goToHeader}
            className={`flex flex-col items-center justify-center w-12 h-15 rounded p-0.5 transition-colors cursor-pointer group ${
              activeHFType === "header"
                ? "bg-primary/10 border border-navy-300 dark:bg-navy-950/60 dark:border-primary/90"
                : "hover:bg-muted hover:border hover:border-border dark:hover:bg-muted dark:hover:border-secondary-foreground"
            }`}
            title="Go to Header"
          >
            <WordGoToHeaderIcon className="w-7 h-7 group-hover:scale-105 transition-transform" />
            <span className="text-10px leading-3 text-foreground dark:text-muted mt-0.5 text-center flex flex-col items-center">
              <span>Go to</span>
              <span>Header</span>
            </span>
          </button>

          {/* Go to Footer */}
          <button
            type="button"
            onClick={goToFooter}
            className={`flex flex-col items-center justify-center w-12 h-15 rounded p-0.5 transition-colors cursor-pointer group ${
              activeHFType === "footer"
                ? "bg-primary/10 border border-navy-300 dark:bg-navy-950/60 dark:border-primary/90"
                : "hover:bg-muted hover:border hover:border-border dark:hover:bg-muted dark:hover:border-secondary-foreground"
            }`}
            title="Go to Footer"
          >
            <WordGoToFooterIcon className="w-7 h-7 group-hover:scale-105 transition-transform" />
            <span className="text-10px leading-3 text-foreground dark:text-muted mt-0.5 text-center flex flex-col items-center">
              <span>Go to</span>
              <span>Footer</span>
            </span>
          </button>


        </div>

        {/* Group 3 Label */}
        <div className="text-10px text-muted-foreground dark:text-muted-foreground font-normal tracking-tight text-center py-0.5 select-none">
          Navigation
        </div>
      </div>

      {/* Vertical Group Divider */}
      <div className="w-0.25 bg-secondary dark:bg-muted self-stretch my-1 shrink-0" />

      {/* ============================================================
          GROUP 4: OPTIONS (CHECKBOXES)
      ============================================================ */}
      <div className="flex flex-col justify-between items-start px-2 shrink-0">
        <div className="flex flex-col justify-center gap-1.5 flex-1 pt-1 text-11px">
          <label className="flex items-center gap-1.5 select-none cursor-pointer hover:text-foreground dark:hover:text-primary-foreground">
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
              className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-0 cursor-pointer"
            />
            <span>Different First Page</span>
          </label>

          <label className="flex items-center gap-1.5 select-none cursor-pointer hover:text-foreground dark:hover:text-primary-foreground">
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
              className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-0 cursor-pointer"
            />
            <span>Different Odd &amp; Even Pages</span>
          </label>

          <label className="flex items-center gap-1.5 select-none cursor-pointer hover:text-foreground dark:hover:text-primary-foreground">
            <input
              type="checkbox"
              checked={showDocumentText}
              onChange={(e) => setShowDocumentText(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-0 cursor-pointer"
            />
            <span>Show Document Text</span>
          </label>
        </div>

        {/* Group 4 Label */}
        <div className="text-10px text-muted-foreground dark:text-muted-foreground font-normal tracking-tight text-center w-full py-0.5 select-none">
          Options
        </div>
      </div>

      {/* Vertical Group Divider */}
      <div className="w-0.25 bg-secondary dark:bg-muted self-stretch my-1 shrink-0" />

      {/* ============================================================
          GROUP 5: POSITION (STEPPERS & ALIGNMENT TAB)
      ============================================================ */}
      <div className="flex flex-col justify-between items-start px-2 shrink-0">
        <div className="flex flex-col justify-center gap-1 flex-1 pt-0.5 text-11px">
          {/* Header from Top */}
          <div className="flex items-center justify-between gap-1.5 w-full">
            <div className="flex items-center gap-1 text-secondary-foreground dark:text-muted-foreground text-11px">
              <WordHeaderTopIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Header from Top:</span>
            </div>
            <div className="relative flex items-center border border-border dark:border-secondary-foreground rounded bg-card dark:bg-secondary overflow-hidden h-5.5">
              <input
                type="text"
                value={`${headerInputVal} ${unit}`}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d.]/g, "");
                  setHeaderInputVal(raw);
                  const num = parseFloat(raw);
                  if (!isNaN(num)) handleHeaderDistanceChange(num);
                }}
                className="w-16 px-1.5 text-11px text-foreground dark:text-muted outline-none bg-transparent"
              />
              <div className="flex flex-col border-l border-secondary dark:border-muted h-full">
                <button
                  type="button"
                  onClick={() => stepDistance("header", 1)}
                  className="px-1 text-8px leading-none hover:bg-muted dark:hover:bg-muted flex items-center justify-center h-1/2 cursor-pointer"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => stepDistance("header", -1)}
                  className="px-1 text-8px leading-none hover:bg-muted dark:hover:bg-muted flex items-center justify-center h-1/2 border-t border-secondary dark:border-muted cursor-pointer"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>

          {/* Footer from Bottom */}
          <div className="flex items-center justify-between gap-1.5 w-full">
            <div className="flex items-center gap-1 text-secondary-foreground dark:text-muted-foreground text-11px">
              <WordFooterBottomIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Footer from Bottom:</span>
            </div>
            <div className="relative flex items-center border border-border dark:border-secondary-foreground rounded bg-card dark:bg-secondary overflow-hidden h-5.5">
              <input
                type="text"
                value={`${footerInputVal} ${unit}`}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d.]/g, "");
                  setFooterInputVal(raw);
                  const num = parseFloat(raw);
                  if (!isNaN(num)) handleFooterDistanceChange(num);
                }}
                className="w-16 px-1.5 text-11px text-foreground dark:text-muted outline-none bg-transparent"
              />
              <div className="flex flex-col border-l border-secondary dark:border-muted h-full">
                <button
                  type="button"
                  onClick={() => stepDistance("footer", 1)}
                  className="px-1 text-8px leading-none hover:bg-muted dark:hover:bg-muted flex items-center justify-center h-1/2 cursor-pointer"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => stepDistance("footer", -1)}
                  className="px-1 text-8px leading-none hover:bg-muted dark:hover:bg-muted flex items-center justify-center h-1/2 border-t border-secondary dark:border-muted cursor-pointer"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>

          {/* Insert Alignment Tab Button / Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<button
                type="button"
                className="flex items-center gap-1 px-1 py-0.5 rounded text-11px text-secondary-foreground hover:bg-muted dark:text-muted-foreground dark:hover:bg-muted cursor-pointer transition-colors"
                title="Insert Alignment Tab"
              >
                <WordAlignmentTabIcon className="w-3.5 h-3.5 text-primary" />
                <span>Insert Alignment Tab</span>
              </button>} />
            <DropdownMenuContent align="start" className="w-44 text-xs p-1 shadow-lg bg-card dark:bg-[#0B1620]">
              <DropdownMenuItem onClick={() => handleInsertAlignmentTab("center")} className="cursor-pointer">
                Center Tab
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleInsertAlignmentTab("right")} className="cursor-pointer">
                Right Tab
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1 text-10px text-muted-foreground">
                Unit:{" "}
                <button
                  type="button"
                  onClick={() => setUnit(unit === "cm" ? "in" : unit === "in" ? "px" : "cm")}
                  className="text-primary font-semibold hover:underline"
                >
                  {unit} (click to toggle)
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Group 5 Label */}
        <div className="text-10px text-muted-foreground dark:text-muted-foreground font-normal tracking-tight text-center w-full py-0.5 select-none">
          Position
        </div>
      </div>

      {/* Vertical Group Divider */}
      <div className="w-0.25 bg-secondary dark:bg-muted self-stretch my-1 shrink-0" />

      {/* ============================================================
          GROUP 6: CLOSE HEADER AND FOOTER
      ============================================================ */}
      <div className="flex flex-col justify-between items-center px-2 shrink-0">
        <div className="flex items-center justify-center flex-1">
          <button
            type="button"
            onClick={exitHeaderFooterMode}
            className="flex flex-col items-center justify-center w-13.5 h-15 rounded hover:bg-destructive/10 hover:border hover:border-destructive/30 dark:hover:bg-destructive/40 dark:hover:border-destructive/60 active:bg-destructive/10 transition-colors p-0.5 cursor-pointer group"
            title="Close Header and Footer (Esc)"
          >
            <WordCloseIcon className="w-6 h-6 group-hover:scale-105 transition-transform" />
            <span className="text-10px leading-3 text-foreground dark:text-muted mt-1 text-center flex flex-col items-center font-medium">
              <span>Close Header</span>
              <span>and Footer</span>
            </span>
          </button>
        </div>

        {/* Group 6 Label */}
        <div className="text-10px text-muted-foreground dark:text-muted-foreground font-normal tracking-tight text-center py-0.5 select-none">
          Close
        </div>
      </div>

    </div>
  );
}
