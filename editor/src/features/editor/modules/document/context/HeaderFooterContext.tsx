/**
 * HeaderFooterContext.tsx
 *
 * Dedicated context and state manager for Microsoft Word-style
 * Header and Footer editing mode, navigation, positioning, and options.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { useDocumentModel } from "@/features/editor/store/documentModel";

export type HFType = "header" | "footer";
export type HFUnit = "cm" | "in" | "px";

export interface HeaderFooterContextType {
  isHeaderFooterActive: boolean;
  activeHFType: HFType;
  activeSectionId: string | null;
  activePageId: string | null;
  showDocumentText: boolean;
  unit: HFUnit;
  enterHeaderFooterMode: (type?: HFType, sectionId?: string, pageId?: string) => void;
  exitHeaderFooterMode: () => void;
  setActiveHFType: (type: HFType) => void;
  setShowDocumentText: (show: boolean) => void;
  setUnit: (u: HFUnit) => void;
  goToHeader: () => void;
  goToFooter: () => void;
  goToPrevSection: () => void;
  goToNextSection: () => void;
  headerInputRef: React.MutableRefObject<HTMLElement | null>;
  footerInputRef: React.MutableRefObject<HTMLElement | null>;
}

const HeaderFooterContext = createContext<HeaderFooterContextType | null>(null);

export function HeaderFooterProvider({ children }: { children: ReactNode }) {
  const { model, activePage, setActivePage } = useDocumentModel();

  const [isHeaderFooterActive, setIsHeaderFooterActive] = useState<boolean>(false);
  const [activeHFType, setActiveHFType] = useState<HFType>("header");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [showDocumentText, setShowDocumentText] = useState<boolean>(true);
  const [unit, setUnit] = useState<HFUnit>("cm");

  const headerInputRef = useRef<HTMLElement | null>(null);
  const footerInputRef = useRef<HTMLElement | null>(null);

  const enterHeaderFooterMode = useCallback(
    (type: HFType = "header", sectionId?: string, pageId?: string) => {
      setIsHeaderFooterActive(true);
      setActiveHFType(type);

      const targetPageId = pageId || activePage || model.pages[0]?.id || null;
      const targetPage = model.pages.find((p) => p.id === targetPageId) || model.pages[0];
      const targetSecId = sectionId || targetPage?.sectionId || model.sections[0]?.id || null;

      setActivePageId(targetPageId);
      setActiveSectionId(targetSecId);

      // Focus the corresponding header/footer container after DOM paints if not already focused
      setTimeout(() => {
        const selector =
          type === "header"
            ? `[data-hf-container="header"][data-page-id="${targetPageId}"] [contenteditable="true"]`
            : `[data-hf-container="footer"][data-page-id="${targetPageId}"] [contenteditable="true"]`;

        const el = document.querySelector(selector) as HTMLElement | null;
        if (el) {
          const sel = window.getSelection();
          const alreadyInside =
            el.contains(document.activeElement) ||
            (Boolean(sel && sel.rangeCount > 0 && sel.anchorNode && el.contains(sel.anchorNode)));
          if (!alreadyInside) {
            el.focus();
            const range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            if (sel) {
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }
        }
      }, 50);
    },
    [activePage, model.pages, model.sections]
  );

  const exitHeaderFooterMode = useCallback(() => {
    setIsHeaderFooterActive(false);
  }, []);

  const goToHeader = useCallback(() => {
    setActiveHFType("header");
    const targetPageId = activePageId || activePage || model.pages[0]?.id;
    if (!targetPageId) return;

    const el = document.querySelector(
      `[data-hf-container="header"][data-page-id="${targetPageId}"] [contenteditable="true"]`
    ) as HTMLElement | null;

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus();
    }
  }, [activePageId, activePage, model.pages]);

  const goToFooter = useCallback(() => {
    setActiveHFType("footer");
    const targetPageId = activePageId || activePage || model.pages[0]?.id;
    if (!targetPageId) return;

    const el = document.querySelector(
      `[data-hf-container="footer"][data-page-id="${targetPageId}"] [contenteditable="true"]`
    ) as HTMLElement | null;

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus();
    }
  }, [activePageId, activePage, model.pages]);

  const goToPrevSection = useCallback(() => {
    const sections = model.sections || [];
    if (sections.length <= 1) return;

    const currentIndex = sections.findIndex((s) => s.id === activeSectionId);
    if (currentIndex > 0) {
      const prevSec = sections[currentIndex - 1];
      if (prevSec) {
        setActiveSectionId(prevSec.id);
        const firstPageInSec = model.pages.find((p) => p.sectionId === prevSec.id);
        if (firstPageInSec) {
          setActivePageId(firstPageInSec.id);
          setActivePage(firstPageInSec.id);
        }
      }
    }
  }, [activeSectionId, model.sections, model.pages, setActivePage]);

  const goToNextSection = useCallback(() => {
    const sections = model.sections || [];
    if (sections.length <= 1) return;

    const currentIndex = sections.findIndex((s) => s.id === activeSectionId);
    if (currentIndex >= 0 && currentIndex < sections.length - 1) {
      const nextSec = sections[currentIndex + 1];
      if (nextSec) {
        setActiveSectionId(nextSec.id);
        const firstPageInSec = model.pages.find((p) => p.sectionId === nextSec.id);
        if (firstPageInSec) {
          setActivePageId(firstPageInSec.id);
          setActivePage(firstPageInSec.id);
        }
      }
    }
  }, [activeSectionId, model.sections, model.pages, setActivePage]);

  return (
    <HeaderFooterContext.Provider
      value={{
        isHeaderFooterActive,
        activeHFType,
        activeSectionId,
        activePageId,
        showDocumentText,
        unit,
        enterHeaderFooterMode,
        exitHeaderFooterMode,
        setActiveHFType,
        setShowDocumentText,
        setUnit,
        goToHeader,
        goToFooter,
        goToPrevSection,
        goToNextSection,
        headerInputRef,
        footerInputRef,
      }}
    >
      {children}
    </HeaderFooterContext.Provider>
  );
}

export function useHeaderFooter(): HeaderFooterContextType {
  const ctx = useContext(HeaderFooterContext);
  if (!ctx) {
    throw new Error("useHeaderFooter must be used inside a HeaderFooterProvider");
  }
  return ctx;
}
