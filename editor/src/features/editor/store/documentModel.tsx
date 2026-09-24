/*
This file is the **central document-state management system** for the editor. It uses React Context to store and manage the complete document model, including pages, sections, HTML content, document title, active page, and document history.

### Main responsibilities

* **Document structure:** Defines `DocumentModel`, `PageModel`, and `SectionModel` for representing the document, pages, headers, footers, and sections. 
* **Initial document:** Creates a default document with one page, one section, default header/footer, and empty HTML content. 
* **Page management:** Provides functions to add and remove pages while maintaining their HTML content and section relationships.  
* **Section management:** Allows sections to be created and their properties such as headers, footers, and page-number settings to be updated. 
* **Content management:** `setPageHtml()` updates the editable HTML content of individual pages. 
* **Save / Save As:** Stores documents and snapshots in browser `localStorage` and maintains up to 50 history entries.  
* **Restore:** Searches saved snapshots and restores the latest version of a document. 
* **Context provider:** `DocumentModelProvider` makes all document state and operations available to components throughout the editor. 
* **Custom hook:** `useDocumentModel()` provides a safe way for components such as `Workspace` to access the document model. 

### In simple words

**`DocumentModel.tsx` = the brain/storage layer of your document editor.**

It controls:

`Document → Sections → Pages → HTML Content → Save → History → Restore`

It is **not mainly a UI file**. It provides the data and functions that your UI components use to display and modify the document.



*/


import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

import type { StyleOverrides, StyleOverride } from "../styles/types/styles.types";

/* ============================================================
   Types
============================================================ */

export interface SectionModel {
  id: string;
  header: string;
  footer: string;
  differentFirstPage: boolean;
  differentOddEven: boolean;
  firstHeader: string;
  firstFooter: string;
  evenHeader: string;
  evenFooter: string;
  showPageNumbers: boolean;
  pageNumberPosition?: "header" | "footer" | "margin-left" | "margin-right";
  pageNumberAlignment?: "left" | "center" | "right";
  pageNumberFormat?: "1" | "i" | "I" | "a" | "A";
  pageNumberStartAt?: number;
  pageNumberStyle?: string;
  orientation?: "portrait" | "landscape";
  marginPreset?: "normal" | "narrow" | "moderate" | "wide" | "mirrored" | "custom";
  marginConfig?: { top: number; bottom: number; left: number; right: number };
  paperSize?: { name: string; width: number; height: number };
  columns?: { type: "one" | "two" | "three" | "left" | "right" | "custom"; count: number; gap?: number };
  watermark?: {
    text?: string;
    image?: string;
    opacity?: number;
    color?: string;
    font?: string;
    fontSize?: number | "auto";
    rotation?: "diagonal" | "horizontal" | number;
    layout?: string;
    scale?: number | string;
  };
  pageColor?: string;
  pageBorders?: PageBorderConfig;
  // Reference-compatible rich HTML header/footer fields
  headerHtml?: string;
  footerHtml?: string;
  firstHeaderHtml?: string;
  firstFooterHtml?: string;
  evenHeaderHtml?: string;
  evenFooterHtml?: string;

  // Extended page number & section linking config
  pageNumberConfig?: {
    format: "arabic" | "roman-lower" | "roman-upper" | "alpha-lower" | "alpha-upper";
    startAt?: number;
    includeChapterNumber?: boolean;
    showPageX?: boolean;
    showPageXofY?: boolean;
  };
  pageNumberStart?: number;
  linkToPrevious?: boolean;
  headerTopDistance?: number;
  footerBottomDistance?: number;

  // Reference-compatible extended layout configs
  paperSizeConfig?: { name: string; width: number; height: number };
  columnsConfig?: { type: "one" | "two" | "three" | "left" | "right" | "custom"; count: number; gap?: number };
  pageBordersConfig?: PageBorderConfig;
}

export interface PageBorderDistance {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface PageBorderConfig {
  setting?: "none" | "box" | "shadow" | "3d" | "custom";
  lineStyle?: "solid" | "dashed" | "dotted" | "double" | "dash-dot" | "thick-solid";
  style?: "none" | "box" | "shadow" | "dashed" | "dotted" | "double" | "3d" | "solid" | "dash-dot" | "thick-solid" | string;
  color?: string;
  width?: number;
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  distance?: PageBorderDistance;
  applyTo?: "document" | "section" | "page" | "firstPage" | "exceptFirstPage" | "whole";
  art?: string;
}

export interface PageModel {
  id: string;
  sectionId: string;
  pageBorders?: PageBorderConfig;
}

export interface DocumentModel {
  id: string;
  title: string;
  pages: PageModel[];
  sections: SectionModel[];
  pageHtml: Record<string, string>;
  savedAt?: number;
  styleOverrides: StyleOverrides;
  watermarkConfig?: {
    type: "none" | "text" | "image";
    text?: string;
    imageSrc?: string;
    opacity?: number;
    rotation?: number;
    scale?: number;
    color?: string;
    fontFamily?: string;
  };
  pageColor?: string;
  metadata?: {
    title: string;
    subject?: string;
    author: string;
    keywords?: string;
    category?: string;
    createdDate?: number;
    modifiedDate?: number;
    company?: string;
    manager?: string;
  };
}

export interface HistoryEntry {
  id: string;
  title: string;
  savedAt: number;
}

/* ============================================================
   Helpers
============================================================ */

const uid = () =>
  Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 8);

const STORAGE_KEY = "editor_document";
const SAVED_DOCS_KEY = "editor_saved_documents";
const HISTORY_KEY = "editor_document_history";

const DEFAULT_HTML = `
<p></p>
`;

const createDefaultSection = (
  id = "section_1"
): SectionModel => ({
  id,
  header: "",
  footer: "Parexel Smart Authoring Suite",
  differentFirstPage: false,
  differentOddEven: false,
  firstHeader: "",
  firstFooter: "",
  evenHeader: "",
  evenFooter: "",
  showPageNumbers: true,
  pageNumberPosition: "footer",
  pageNumberAlignment: "right",
  pageNumberFormat: "1",
  marginPreset: "normal",
  marginConfig: { top: 96, bottom: 96, left: 96, right: 96 },
  columns: { type: "one", count: 1 },
});

function normalizeBorderConfig(b?: PageBorderConfig): PageBorderConfig | undefined {
  if (!b) return undefined;
  const setting =
    b.setting ||
    (b.style === "none"
      ? "none"
      : b.style === "shadow"
        ? "shadow"
        : b.style === "3d"
          ? "3d"
          : b.top === false || b.bottom === false || b.left === false || b.right === false
            ? "custom"
            : "box");

  const lineStyle =
    b.lineStyle ||
    (b.style === "dashed"
      ? "dashed"
      : b.style === "dotted"
        ? "dotted"
        : b.style === "double"
          ? "double"
          : b.style === "dash-dot"
            ? "dash-dot"
            : b.style === "thick-solid"
              ? "thick-solid"
              : "solid");

  const distance: PageBorderDistance = {
    top: typeof b.distance?.top === "number" ? b.distance.top : 24,
    bottom: typeof b.distance?.bottom === "number" ? b.distance.bottom : 24,
    left: typeof b.distance?.left === "number" ? b.distance.left : 24,
    right: typeof b.distance?.right === "number" ? b.distance.right : 24,
  };

  return {
    ...b,
    setting,
    lineStyle,
    style:
      b.style ||
      (setting === "none"
        ? "none"
        : setting === "shadow"
          ? "shadow"
          : setting === "3d"
            ? "3d"
            : lineStyle),
    color: b.color || "#000000",
    width: b.width ?? 2,
    top: setting !== "none" ? (b.top ?? true) : false,
    bottom: setting !== "none" ? (b.bottom ?? true) : false,
    left: setting !== "none" ? (b.left ?? true) : false,
    right: setting !== "none" ? (b.right ?? true) : false,
    distance,
    applyTo: b.applyTo || "document",
  };
}

function normalizeDoc(doc: DocumentModel): DocumentModel {
  if (!doc) return createEmptyDocument();
  const sections = (
    Array.isArray(doc.sections) && doc.sections.length > 0
      ? doc.sections
      : [createDefaultSection()]
  ).map((sec) => ({
    ...sec,
    pageBorders: sec.pageBorders ? normalizeBorderConfig(sec.pageBorders) : undefined,
  }));
  const pages = (
    Array.isArray(doc.pages) && doc.pages.length > 0
      ? doc.pages
      : [{ id: "page_" + uid(), sectionId: sections[0]?.id || "section_1" }]
  ).map((p) => ({
    ...p,
    pageBorders: p.pageBorders ? normalizeBorderConfig(p.pageBorders) : undefined,
  }));
  const pageHtml =
    doc.pageHtml && typeof doc.pageHtml === "object" ? { ...doc.pageHtml } : {};
  pages.forEach((p) => {
    if (pageHtml[p.id] === undefined) {
      pageHtml[p.id] = DEFAULT_HTML;
    }
  });
  return {
    ...doc,
    title: doc.title || "Untitled Document",
    pages,
    sections,
    pageHtml,
    styleOverrides: doc.styleOverrides || {},
  };
}

export const MAX_DOCUMENTS = 10;

/**
 * Derives a reliable creation timestamp (in milliseconds) for a document.
 * Checks in order:
 * 1. metadata.createdDate
 * 2. Timestamp encoded in ID (format: doc_<base36_timestamp>_...)
 * 3. savedAt
 * 4. Inverse of list position as fallback
 */
export function getDocumentCreationTime(doc: DocumentModel, fallbackIndex: number = 0): number {
  let baseTime = 0;
  if (doc?.metadata?.createdDate && typeof doc.metadata.createdDate === "number" && !isNaN(doc.metadata.createdDate)) {
    baseTime = doc.metadata.createdDate;
  } else if (doc?.id && typeof doc.id === "string") {
    const raw = doc.id.startsWith("doc_") ? doc.id.slice(4) : doc.id;
    const timePart = raw.split("_")[0];
    const parsed = parseInt(timePart, 36);
    if (!isNaN(parsed) && parsed > 0) {
      baseTime = parsed;
    }
  } else if (doc?.savedAt && typeof doc.savedAt === "number" && !isNaN(doc.savedAt)) {
    baseTime = doc.savedAt;
  }
  // Tie-breaker: documents with a larger fallbackIndex (further down in list) were inserted earlier, so they are older
  return baseTime > 0 ? baseTime - fallbackIndex * 0.001 : -fallbackIndex;
}

/**
 * Identifies the single oldest document from a document list.
 */
export function findOldestDocument(docs: DocumentModel[]): DocumentModel | null {
  if (!docs || docs.length === 0) return null;
  let oldest = docs[0];
  let oldestTime = getDocumentCreationTime(oldest, 0);

  for (let i = 1; i < docs.length; i++) {
    const doc = docs[i];
    const time = getDocumentCreationTime(doc, i);
    if (time < oldestTime) {
      oldest = doc;
      oldestTime = time;
    }
  }
  return oldest;
}

/**
 * Synchronizes any live content in the active DOM contenteditable page elements
 * into the DocumentModel so uncommitted edits are never lost on document switches or creation.
 */
function syncActiveDomToDoc(doc: DocumentModel): DocumentModel {
  if (typeof document === "undefined") return doc;
  const pageNodes = document.querySelectorAll<HTMLElement>(
    '[data-editor-page], [contenteditable][data-page-id]'
  );
  if (!pageNodes || pageNodes.length === 0) return doc;

  const nextHtml = { ...doc.pageHtml };
  let changed = false;

  pageNodes.forEach((node) => {
    const pageId =
      node.getAttribute("data-editor-page") ||
      node.getAttribute("data-page-id");
    if (pageId && node.innerHTML !== undefined) {
      if (nextHtml[pageId] !== node.innerHTML) {
        nextHtml[pageId] = node.innerHTML;
        changed = true;
      }
    }
  });

  return changed ? { ...doc, pageHtml: nextHtml } : doc;
}

function createEmptyDocument(): DocumentModel {
  const section = createDefaultSection();

  const page: PageModel = {
    id: "page_" + uid(),
    sectionId: section.id,
  };

  const now = Date.now();
  return {
    id: "doc_" + uid(),
    title: "Untitled Document",
    pages: [page],
    sections: [section],
    pageHtml: {
      [page.id]: DEFAULT_HTML,
    },
    styleOverrides: {},
    metadata: {
      title: "Untitled Document",
      author: "User",
      createdDate: now,
      modifiedDate: now,
    },
  };
}

function getStoredSavedDocuments(): DocumentModel[] {
  try {
    const raw = localStorage.getItem(SAVED_DOCS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const seen = new Set<string>();
        const unique: DocumentModel[] = [];
        for (const doc of parsed) {
          if (doc && doc.id && !seen.has(doc.id)) {
            seen.add(doc.id);
            unique.push(normalizeDoc(doc));
          }
        }
        return unique.slice(0, MAX_DOCUMENTS);
      }
    }
  } catch {
    // ignore
  }
  return [];
}

function getInitialDocument(): DocumentModel {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DocumentModel;
      if (parsed && Array.isArray(parsed.pages) && parsed.pages.length > 0) {
        return normalizeDoc(parsed);
      }
    }
  } catch {
    // ignore
  }
  const savedDocs = getStoredSavedDocuments();
  if (savedDocs.length > 0) {
    return normalizeDoc(savedDocs[0]);
  }
  const fresh = createEmptyDocument();
  try {
    localStorage.setItem(SAVED_DOCS_KEY, JSON.stringify([fresh]));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch {
    // ignore
  }
  return fresh;
}

function getInitialHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

/* ============================================================
   Context
============================================================ */

interface DocumentContextType {
  model: DocumentModel;
  activePage: string | null;
  history: HistoryEntry[];
  savedDocuments: DocumentModel[];
  setActivePage: (id: string | null) => void;
  setPageHtml: (
    pageId: string,
    html: string
  ) => void;
  updateStyleOverride: (
    styleId: string,
    update: Partial<StyleOverride>
  ) => void;
  revertStyleOverride: (
    styleId: string
  ) => void;
  updateTitle: (
    title: string
  ) => void;
  addPage: (
    afterPageId?: string,
    initialHtml?: string
  ) => string;
  removePage: (
    pageId: string
  ) => void;
  addSection: (
    afterPageId?: string
  ) => void;
  updateSection: (
    sectionId: string,
    patch: Partial<SectionModel>
  ) => void;
  updateAllSections: (
    patch: Partial<SectionModel>
  ) => void;
  updatePage: (
    pageId: string,
    patch: Partial<PageModel>
  ) => void;
  applySectionPatchToPage: (
    pageId: string,
    patch: Partial<SectionModel>
  ) => void;
  applyPageBorders: (
    borderConfig: PageBorderConfig,
    applyTo: "document" | "section" | "page" | "firstPage" | "exceptFirstPage",
    targetPageId?: string,
    targetSectionId?: string
  ) => void;
  save: (customTitle?: string) => void;
  saveAs: (
    title: string
  ) => void;
  restore: (
    documentId: string
  ) => void;
  loadDocument: (
    documentId: string
  ) => void;
  deleteDocument: (
    documentId: string
  ) => void;
  createNewDocument: (title?: string) => void;
  insertDocument: (title?: string) => void;
  insertUploadedDocument: (
    title: string,
    pagesHtml: string[]
  ) => DocumentModel;
  resetDocument: () => void;
  refreshHistory: () => void;
  importDocumentPages: (
    title: string,
    pagesHtml: string[],
    options?: {
      insertPosition?: "append" | "afterActive" | "replace";
      autoEnablePageNumbers?: boolean;
    }
  ) => void;
}

const DocumentContext =
  createContext<DocumentContextType | null>(
    null
  );

/* ============================================================
   Provider
============================================================ */

export function DocumentModelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [model, setModel] = useState<DocumentModel>(getInitialDocument);
  const [activePage, setActivePage] = useState<string | null>(
    () => model.pages[0]?.id ?? null
  );
  const [history, setHistory] = useState<HistoryEntry[]>(getInitialHistory);
  const [savedDocuments, setSavedDocuments] = useState<DocumentModel[]>(getStoredSavedDocuments);

  /* ============================================================
     Style Overrides
  ============================================================ */

  const updateStyleOverride = useCallback(
    (
      styleId: string,
      update: Partial<StyleOverride>,
    ) => {
      setModel((prev) => ({
        ...prev,
        styleOverrides: {
          ...(prev.styleOverrides ?? {}),
          [styleId]: {
            ...(prev.styleOverrides?.[styleId] ?? {}),
            ...update,
          },
        },
      }));
    },
    [],
  );

  const revertStyleOverride = useCallback(
    (styleId: string) => {
      setModel((prev) => {
        const nextOverrides = {
          ...(prev.styleOverrides ?? {}),
        };

        delete nextOverrides[styleId];

        return {
          ...prev,
          styleOverrides: nextOverrides,
        };
      });
    },
    [],
  );

  /* ============================================================
     Refresh History & Saved Docs
  ============================================================ */

  const refreshHistory = useCallback(() => {
    setHistory(getInitialHistory());
    setSavedDocuments(getStoredSavedDocuments());
  }, []);

  /* ============================================================
     Update Page HTML
  ============================================================ */

  const setPageHtml = useCallback(
    (pageId: string, html: string) => {
      setModel((prev) => {
        if (prev.pageHtml[pageId] === html) {
          return prev;
        }

        return {
          ...prev,
          pageHtml: {
            ...prev.pageHtml,
            [pageId]: html,
          },
        };
      });
    },
    []
  );

  /* ============================================================
     Update Title
  ============================================================ */

  const updateTitle = useCallback((title: string) => {
    setModel((prev) => ({
      ...prev,
      title,
    }));
  }, []);

  /* ============================================================
     Add Page
  ============================================================ */

  const addPage = useCallback(
    (afterPageId?: string, initialHtml?: string) => {
      const newPageId = "page_" + uid();

      setModel((prev) => {
        const index = afterPageId
          ? prev.pages.findIndex((p) => p.id === afterPageId)
          : prev.pages.length - 1;

        const insertIndex =
          index >= 0 ? index : prev.pages.length - 1;

        const sectionId =
          prev.pages[insertIndex]?.sectionId ??
          prev.sections[0]?.id ??
          "section_1";

        const newPage: PageModel = {
          id: newPageId,
          sectionId,
        };

        return {
          ...prev,
          pages: [
            ...prev.pages.slice(0, insertIndex + 1),
            newPage,
            ...prev.pages.slice(insertIndex + 1),
          ],
          pageHtml: {
            ...prev.pageHtml,
            [newPageId]: initialHtml !== undefined ? initialHtml : DEFAULT_HTML,
          },
        };
      });

      setActivePage(newPageId);
      return newPageId;
    },
    []
  );

  /* ============================================================
     Remove Page
  ============================================================ */

  const removePage = useCallback(
    (pageId: string) => {
      setModel((prev) => {
        if (prev.pages.length <= 1) {
          return prev;
        }

        const nextPages = prev.pages.filter(
          (page) => page.id !== pageId
        );

        const nextHtml = {
          ...prev.pageHtml,
        };

        delete nextHtml[pageId];

        return {
          ...prev,
          pages: nextPages,
          pageHtml: nextHtml,
        };
      });

      setActivePage((prev) => (prev === pageId ? null : prev));
    },
    []
  );

  /* ============================================================
     Add Section
  ============================================================ */

  const addSection = useCallback(
    (afterPageId?: string) => {
      const sectionId = "section_" + uid();
      const pageId = "page_" + uid();

      setModel((prev) => {
        const index = afterPageId
          ? prev.pages.findIndex(
            (page) => page.id === afterPageId
          )
          : prev.pages.length - 1;

        const insertIndex =
          index >= 0 ? index : prev.pages.length - 1;

        const prevPage = prev.pages[insertIndex];
        const prevSection =
          prev.sections.find((s) => s.id === prevPage?.sectionId) ??
          prev.sections[0];

        const section: SectionModel = {
          ...createDefaultSection(sectionId),
          header: "Section " + (prev.sections.length + 1),
          footer: prevSection?.footer ?? "",
          orientation: prevSection?.orientation,
          marginPreset: prevSection?.marginPreset,
          marginConfig: prevSection?.marginConfig ? { ...prevSection.marginConfig } : undefined,
          paperSize: prevSection?.paperSize ? { ...prevSection.paperSize } : undefined,
          columns: prevSection?.columns ? { ...prevSection.columns } : undefined,
          watermark: prevSection?.watermark ? { ...prevSection.watermark } : undefined,
          pageColor: prevSection?.pageColor,
          pageBorders: prevSection?.pageBorders ? { ...prevSection.pageBorders } : undefined,
          pageNumberFormat: prevSection?.pageNumberFormat,
          pageNumberPosition: prevSection?.pageNumberPosition,
          pageNumberAlignment: prevSection?.pageNumberAlignment,
          pageNumberStyle: prevSection?.pageNumberStyle,
          showPageNumbers: prevSection?.showPageNumbers ?? true,
        };

        const page: PageModel = {
          id: pageId,
          sectionId,
        };

        return {
          ...prev,
          sections: [
            ...prev.sections,
            section,
          ],
          pages: [
            ...prev.pages.slice(0, insertIndex + 1),
            page,
            ...prev.pages.slice(insertIndex + 1),
          ],
          pageHtml: {
            ...prev.pageHtml,
            [pageId]: DEFAULT_HTML,
          },
        };
      });

      setActivePage(pageId);
    },
    []
  );

  /* ============================================================
     Update Section
  ============================================================ */

  const updateSection = useCallback(
    (
      sectionId: string,
      patch: Partial<SectionModel>
    ) => {
      setModel((prev) => ({
        ...prev,
        sections: prev.sections.map(
          (section) =>
            section.id === sectionId
              ? {
                ...section,
                ...patch,
              }
              : section
        ),
      }));
    },
    []
  );

  const updateAllSections = useCallback(
    (patch: Partial<SectionModel>) => {
      setModel((prev) => ({
        ...prev,
        sections: prev.sections.map((section) => ({
          ...section,
          ...patch,
        })),
      }));
    },
    []
  );

  const updatePage = useCallback((pageId: string, patch: Partial<PageModel>) => {
    setModel((prev) => ({
      ...prev,
      pages: prev.pages.map((p) =>
        p.id === pageId ? { ...p, ...patch } : p
      ),
    }));
  }, []);

  /* ============================================================
     Apply Section Patch to a Single Page (Isolating Page Section)
  ============================================================ */

  const applySectionPatchToPage = useCallback(
    (pageId: string, patch: Partial<SectionModel>) => {
      setModel((prev) => {
        const pageIndex = prev.pages.findIndex((p) => p.id === pageId);
        if (pageIndex === -1) return prev;

        const targetPage = prev.pages[pageIndex];
        const currentSection =
          prev.sections.find((s) => s.id === targetPage.sectionId) ??
          prev.sections[0];

        const pagesInThisSection = prev.pages.filter(
          (p) => p.sectionId === targetPage.sectionId
        );

        // Case 1: Target page is already the ONLY page in its section
        if (pagesInThisSection.length <= 1) {
          return {
            ...prev,
            sections: prev.sections.map((sec) =>
              sec.id === targetPage.sectionId ? { ...sec, ...patch } : sec
            ),
          };
        }

        // Case 2: Target page shares section with other pages
        // Create an isolated section specifically for targetPage
        const newSectionId = "section_" + uid();
        const newSection: SectionModel = {
          ...currentSection,
          ...patch,
          id: newSectionId,
          header: "Section " + (prev.sections.length + 1),
        };

        const pagesBefore = prev.pages.slice(0, pageIndex);
        const pagesAfter = prev.pages.slice(pageIndex + 1);

        const hasBeforeInSameSection = pagesBefore.some(
          (p) => p.sectionId === targetPage.sectionId
        );
        const hasAfterInSameSection = pagesAfter.some(
          (p) => p.sectionId === targetPage.sectionId
        );

        let postSection: SectionModel | null = null;
        let postSectionId: string | null = null;

        if (hasAfterInSameSection) {
          if (hasBeforeInSameSection) {
            // Target was in the middle of this section:
            // pagesBefore keeps currentSection, target gets newSection, pagesAfter gets postSection
            postSectionId = "section_" + uid();
            postSection = {
              ...currentSection,
              id: postSectionId,
              header: "Section " + (prev.sections.length + 2),
            };
          }
        }

        const newPages = prev.pages.map((p, idx) => {
          if (idx === pageIndex) {
            return { ...p, sectionId: newSectionId };
          }
          if (idx > pageIndex && postSectionId && p.sectionId === targetPage.sectionId) {
            return { ...p, sectionId: postSectionId };
          }
          return p;
        });

        const newSections = [...prev.sections, newSection];
        if (postSection) {
          newSections.push(postSection);
        }

        return {
          ...prev,
          pages: newPages,
          sections: newSections,
        };
      });
    },
    []
  );

  const applyPageBorders = useCallback(
    (
      borderConfig: PageBorderConfig,
      applyTo: "document" | "section" | "page" | "firstPage" | "exceptFirstPage",
      targetPageId?: string,
      targetSectionId?: string
    ) => {
      setModel((prev) => {
        const pageId = targetPageId || activePage || prev.pages[0]?.id;
        const targetPage = prev.pages.find((p) => p.id === pageId);
        const sectionId =
          targetSectionId || targetPage?.sectionId || prev.sections[0]?.id;

        if (applyTo === "document") {
          return {
            ...prev,
            sections: prev.sections.map((sec) => ({
              ...sec,
              pageBorders: { ...borderConfig, applyTo: "document" },
            })),
            pages: prev.pages.map((p) => {
              if (p.pageBorders) {
                const { pageBorders: _, ...rest } = p;
                return rest;
              }
              return p;
            }),
          };
        }

        if (
          applyTo === "section" ||
          applyTo === "firstPage" ||
          applyTo === "exceptFirstPage"
        ) {
          return {
            ...prev,
            sections: prev.sections.map((sec) =>
              sec.id === sectionId
                ? { ...sec, pageBorders: { ...borderConfig, applyTo } }
                : sec
            ),
            pages: prev.pages.map((p) => {
              if (p.sectionId === sectionId && p.pageBorders) {
                const { pageBorders: _, ...rest } = p;
                return rest;
              }
              return p;
            }),
          };
        }

        if (applyTo === "page") {
          return {
            ...prev,
            pages: prev.pages.map((p) =>
              p.id === pageId
                ? { ...p, pageBorders: { ...borderConfig, applyTo: "page" } }
                : p
            ),
          };
        }

        return prev;
      });
    },
    [activePage]
  );

  /* ============================================================
     Save
  ============================================================ */

  const save = useCallback(
    (customTitle?: string) => {
      setModel((currentModel) => {
        const synced = syncActiveDomToDoc(currentModel);
        const titleToSave =
          customTitle !== undefined && customTitle.trim() !== ""
            ? customTitle.trim()
            : synced.title || "Untitled Document";

        const now = Date.now();
        const saved: DocumentModel = {
          ...synced,
          title: titleToSave,
          savedAt: now,
          metadata: {
            ...(synced.metadata || {}),
            title: titleToSave,
            author: synced.metadata?.author || "User",
            createdDate: synced.metadata?.createdDate || now,
            modifiedDate: now,
          },
        };

        try {
          // 1. Save active document
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(saved)
          );

          // 2. Snapshot
          localStorage.setItem(
            `editor_snapshot.${saved.id}.${saved.savedAt}`,
            JSON.stringify(saved)
          );

          // 3. Update saved documents list without duplicates
          const existingSaved = getStoredSavedDocuments();
          const docIndex = existingSaved.findIndex((d) => d.id === saved.id);
          let nextSaved: DocumentModel[];
          if (docIndex >= 0) {
            nextSaved = [
              ...existingSaved.slice(0, docIndex),
              saved,
              ...existingSaved.slice(docIndex + 1),
            ];
          } else {
            nextSaved = [saved, ...existingSaved];
          }
          nextSaved = nextSaved.slice(0, MAX_DOCUMENTS);

          localStorage.setItem(
            SAVED_DOCS_KEY,
            JSON.stringify(nextSaved)
          );
          setSavedDocuments(nextSaved);

          // 4. Update history without duplicate IDs
          const historyItems = getInitialHistory().filter((h) => h.id !== saved.id);
          historyItems.unshift({
            id: saved.id,
            title: saved.title,
            savedAt: saved.savedAt!,
          });

          const latest = historyItems.slice(0, 50);
          localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(latest)
          );
          setHistory(latest);
        } catch {
          // ignore
        }

        return saved;
      });
    },
    []
  );

  /* ============================================================
     Save As
  ============================================================ */

  const saveAs = useCallback(
    (title: string) => {
      setModel((currentModel) => {
        const synced = syncActiveDomToDoc(currentModel);
        const titleToSave = title.trim() || "Untitled Document";
        const now = Date.now();

        const saved: DocumentModel = {
          ...synced,
          title: titleToSave,
          savedAt: now,
          metadata: {
            ...(synced.metadata || {}),
            title: titleToSave,
            author: synced.metadata?.author || "User",
            createdDate: synced.metadata?.createdDate || now,
            modifiedDate: now,
          },
        };

        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(saved)
          );

          localStorage.setItem(
            `editor_snapshot.${saved.id}.${saved.savedAt}`,
            JSON.stringify(saved)
          );

          const existingSaved = getStoredSavedDocuments();
          const docIndex = existingSaved.findIndex((d) => d.id === currentModel.id);
          let nextSaved: DocumentModel[];
          if (docIndex >= 0) {
            // Update current document in place - prevents creating an extra duplicate document in Document Section
            nextSaved = [
              ...existingSaved.slice(0, docIndex),
              saved,
              ...existingSaved.slice(docIndex + 1),
            ];
          } else {
            // If not found in existingSaved, filter out any unsaved entry with matching id before adding
            const filtered = existingSaved.filter((d) => d.id !== currentModel.id);
            nextSaved = [saved, ...filtered];
            if (nextSaved.length > MAX_DOCUMENTS) {
              const oldestDoc = findOldestDocument(nextSaved.filter((d) => d.id !== saved.id));
              if (oldestDoc) {
                nextSaved = nextSaved.filter((d) => d.id !== oldestDoc.id);
              }
            }
          }
          nextSaved = nextSaved.slice(0, MAX_DOCUMENTS);

          localStorage.setItem(
            SAVED_DOCS_KEY,
            JSON.stringify(nextSaved)
          );
          setSavedDocuments(nextSaved);

          const historyItems = getInitialHistory().filter((h) => h.id !== saved.id);
          historyItems.unshift({
            id: saved.id,
            title: saved.title,
            savedAt: saved.savedAt!,
          });

          const latest = historyItems.slice(0, 50);
          localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(latest)
          );
          setHistory(latest);
        } catch {
          // ignore
        }

        return saved;
      });
    },
    []
  );

  /* ============================================================
     Load Document
  ============================================================ */

  const loadDocument = useCallback((documentId: string) => {
    setModel((currentModel) => {
      try {
        const syncedCurrent = syncActiveDomToDoc(currentModel);
        const savedList = getStoredSavedDocuments();

        // 1. Always preserve current active model in list before switching
        const existingIdx = savedList.findIndex((d) => d.id === syncedCurrent.id);
        let nextSaved: DocumentModel[];
        if (existingIdx >= 0) {
          nextSaved = [...savedList];
          nextSaved[existingIdx] = syncedCurrent;
        } else {
          nextSaved = [syncedCurrent, ...savedList];
        }

        // 2. Find target document to load
        let target = nextSaved.find((d) => d.id === documentId);
        if (!target) {
          // Fallback to snapshots
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || !key.startsWith(`editor_snapshot.${documentId}.`)) continue;
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            target = JSON.parse(raw) as DocumentModel;
            nextSaved = [...nextSaved, target];
            break;
          }
        }

        if (target) {
          const normalizedTarget = normalizeDoc(target);
          localStorage.setItem(SAVED_DOCS_KEY, JSON.stringify(nextSaved));
          setSavedDocuments(nextSaved);
          setActivePage(normalizedTarget.pages[0]?.id ?? null);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedTarget));
          return normalizedTarget;
        }

        localStorage.setItem(SAVED_DOCS_KEY, JSON.stringify(nextSaved));
        setSavedDocuments(nextSaved);
      } catch {
        // ignore
      }
      return currentModel;
    });
  }, []);

  /* ============================================================
     Restore Document
  ============================================================ */

  const restore = useCallback((documentId: string) => {
    loadDocument(documentId);
  }, [loadDocument]);

  /* ============================================================
     Create New Document (Temporary / Unsaved) - Max 10 Documents
  ============================================================ */

  const createNewDocument = useCallback((customTitle?: string) => {
    const fresh = createEmptyDocument();
    fresh.title =
      customTitle && customTitle.trim() ? customTitle.trim() : "Untitled Document";
    if (fresh.metadata) {
      fresh.metadata.title = fresh.title;
    }

    setModel((currentModel) => {
      try {
        const syncedCurrent = syncActiveDomToDoc(currentModel);
        const savedList = getStoredSavedDocuments();

        // 1. Preserve current document in list with latest content
        const existingIdx = savedList.findIndex((d) => d.id === syncedCurrent.id);
        let baseList: DocumentModel[];
        if (existingIdx >= 0) {
          baseList = [...savedList];
          baseList[existingIdx] = syncedCurrent;
        } else {
          baseList = [syncedCurrent, ...savedList];
        }

        // Deduplicate baseList and exclude any doc matching fresh.id
        const seenIds = new Set<string>();
        const uniqueBaseList: DocumentModel[] = [];
        for (const doc of baseList) {
          if (doc && doc.id && doc.id !== fresh.id && !seenIds.has(doc.id)) {
            seenIds.add(doc.id);
            uniqueBaseList.push(doc);
          }
        }

        // 2. Enforce MAX_DOCUMENTS (10):
        // If current count is >= 10, identify and delete the single oldest document(s)
        // so that adding fresh leaves the total count at exactly MAX_DOCUMENTS (10).
        const targetRetainCount = MAX_DOCUMENTS - 1; // 9
        let prunedList = [...uniqueBaseList];

        while (prunedList.length > targetRetainCount) {
          const oldestDoc = findOldestDocument(prunedList);
          if (!oldestDoc) break;

          // Remove only the oldest document
          prunedList = prunedList.filter((d) => d.id !== oldestDoc.id);

          // Clean up snapshots for the deleted oldest document
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`editor_snapshot.${oldestDoc.id}.`)) {
              localStorage.removeItem(key);
            }
          }

          // Clean up history for the deleted oldest document
          try {
            const nextHistory = getInitialHistory().filter((h) => h.id !== oldestDoc.id);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
            setHistory(nextHistory);
          } catch {
            // ignore
          }
        }

        // 3. Prepend fresh document to the document list
        const nextSaved = [fresh, ...prunedList].slice(0, MAX_DOCUMENTS);

        localStorage.setItem(SAVED_DOCS_KEY, JSON.stringify(nextSaved));
        setSavedDocuments(nextSaved);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      } catch {
        // ignore
      }

      setActivePage(fresh.pages[0]?.id ?? null);
      return fresh;
    });
  }, []);

  /* ============================================================
     Insert Uploaded Document (Max 10 Documents, Oldest Pruned)
  ============================================================ */

  const insertUploadedDocument = useCallback(
    (title: string, pagesHtml: string[]): DocumentModel => {
      const section = createDefaultSection("section_1");
      const validPages =
        pagesHtml.length > 0
          ? pagesHtml.map((h) => (h && h.trim() ? h.trim() : DEFAULT_HTML))
          : [DEFAULT_HTML];

      const newPages: PageModel[] = validPages.map(() => ({
        id: "page_" + uid(),
        sectionId: section.id,
      }));

      const newPageHtml: Record<string, string> = {};
      newPages.forEach((p, idx) => {
        newPageHtml[p.id] = validPages[idx];
      });

      const docTitle = title && title.trim() ? title.trim() : "Uploaded Document";
      const now = Date.now();

      const freshDoc: DocumentModel = {
        id: "doc_" + uid(),
        title: docTitle,
        pages: newPages,
        sections: [
          {
            ...section,
            showPageNumbers: true,
            pageNumberPosition: "footer",
            pageNumberAlignment: "right",
            pageNumberFormat: "1",
          },
        ],
        pageHtml: newPageHtml,
        styleOverrides: {},
        savedAt: now,
        metadata: {
          title: docTitle,
          author: "User",
          createdDate: now,
          modifiedDate: now,
        },
      };

      setModel((currentModel) => {
        try {
          const syncedCurrent = syncActiveDomToDoc(currentModel);
          const savedList = getStoredSavedDocuments();

          // 1. Preserve current document in list with latest content
          const existingIdx = savedList.findIndex((d) => d.id === syncedCurrent.id);
          let baseList: DocumentModel[];
          if (existingIdx >= 0) {
            baseList = [...savedList];
            baseList[existingIdx] = syncedCurrent;
          } else {
            baseList = [syncedCurrent, ...savedList];
          }

          // Deduplicate baseList and exclude any doc matching freshDoc.id
          const seenIds = new Set<string>();
          const uniqueBaseList: DocumentModel[] = [];
          for (const doc of baseList) {
            if (doc && doc.id && doc.id !== freshDoc.id && !seenIds.has(doc.id)) {
              seenIds.add(doc.id);
              uniqueBaseList.push(doc);
            }
          }

          // 2. Enforce MAX_DOCUMENTS (10)
          const targetRetainCount = MAX_DOCUMENTS - 1; // 9
          let prunedList = [...uniqueBaseList];

          while (prunedList.length > targetRetainCount) {
            const oldestDoc = findOldestDocument(prunedList);
            if (!oldestDoc) break;

            prunedList = prunedList.filter((d) => d.id !== oldestDoc.id);

            // Clean up snapshots for the deleted oldest document
            for (let i = localStorage.length - 1; i >= 0; i--) {
              const key = localStorage.key(i);
              if (key && key.startsWith(`editor_snapshot.${oldestDoc.id}.`)) {
                localStorage.removeItem(key);
              }
            }

            // Clean up history
            try {
              const nextHistory = getInitialHistory().filter((h) => h.id !== oldestDoc.id);
              localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
              setHistory(nextHistory);
            } catch {
              // ignore
            }
          }

          // 3. Prepend freshDoc to list
          const nextSaved = [freshDoc, ...prunedList].slice(0, MAX_DOCUMENTS);

          localStorage.setItem(SAVED_DOCS_KEY, JSON.stringify(nextSaved));
          setSavedDocuments(nextSaved);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(freshDoc));

          // Save snapshot and update history
          try {
            localStorage.setItem(
              `editor_snapshot.${freshDoc.id}.${freshDoc.savedAt}`,
              JSON.stringify(freshDoc)
            );
            const historyItems = getInitialHistory().filter((h) => h.id !== freshDoc.id);
            historyItems.unshift({
              id: freshDoc.id,
              title: freshDoc.title,
              savedAt: freshDoc.savedAt!,
            });
            const latest = historyItems.slice(0, 50);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(latest));
            setHistory(latest);
          } catch {
            // ignore
          }
        } catch {
          // ignore
        }

        setActivePage(freshDoc.pages[0]?.id ?? null);
        return freshDoc;
      });

      return freshDoc;
    },
    []
  );

  /* ============================================================
     Delete Document
  ============================================================ */

  const deleteDocument = useCallback(
    (documentId: string) => {
      try {
        const savedList = getStoredSavedDocuments();
        const nextSaved = savedList.filter((d) => d.id !== documentId);
        localStorage.setItem(SAVED_DOCS_KEY, JSON.stringify(nextSaved));
        setSavedDocuments(nextSaved);

        // Remove snapshots
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`editor_snapshot.${documentId}.`)) {
            localStorage.removeItem(key);
          }
        }

        // Clean from history
        const nextHistory = getInitialHistory().filter((h) => h.id !== documentId);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
        setHistory(nextHistory);

        // If the deleted document is currently active
        setModel((currentModel) => {
          if (currentModel.id === documentId) {
            if (nextSaved.length > 0) {
              const nextDoc = nextSaved[0];
              setActivePage(nextDoc.pages[0]?.id ?? null);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDoc));
              return nextDoc;
            } else {
              const fresh = createEmptyDocument();
              setActivePage(fresh.pages[0]?.id ?? null);
              localStorage.setItem(SAVED_DOCS_KEY, JSON.stringify([fresh]));
              setSavedDocuments([fresh]);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
              return fresh;
            }
          }
          return currentModel;
        });
      } catch {
        // ignore
      }
    },
    []
  );

  /* ============================================================
     Reset Document
  ============================================================ */

  const resetDocument = useCallback(() => {
    setModel((prev) => {
      const section = createDefaultSection();
      const page: PageModel = {
        id: "page_" + uid(),
        sectionId: section.id,
      };
      const resetModel: DocumentModel = {
        ...prev,
        pages: [page],
        sections: [section],
        pageHtml: {
          [page.id]: DEFAULT_HTML,
        },
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resetModel));
      } catch {
        // ignore
      }
      setActivePage(page.id);
      return resetModel;
    });
  }, []);

  /* ============================================================
     Import Document Pages (Atomic multi-page document insertion)
  ============================================================ */

  const importDocumentPages = useCallback(
    (
      title: string,
      pagesHtml: string[],
      options?: {
        insertPosition?: "append" | "afterActive" | "replace";
        autoEnablePageNumbers?: boolean;
      }
    ) => {
      setModel((prev) => {
        const section = prev.sections[0] || createDefaultSection();
        const validPages =
          pagesHtml.length > 0
            ? pagesHtml.map((h) => (h && h.trim() ? h.trim() : DEFAULT_HTML))
            : [DEFAULT_HTML];

        const targetSectionId = section.id;
        const newPages: PageModel[] = validPages.map(() => ({
          id: "page_" + uid(),
          sectionId: targetSectionId,
        }));

        const newPageHtml: Record<string, string> = {};
        newPages.forEach((p, idx) => {
          newPageHtml[p.id] = validPages[idx];
        });

        // Determine if existing document has user-added content
        const isDocEmpty = (doc: DocumentModel): boolean => {
          if (doc.pages.length > 1) return false;
          const firstId = doc.pages[0]?.id;
          if (!firstId) return true;
          const html = doc.pageHtml[firstId];
          if (!html) return true;
          const clean = html
            .replace(/<[^>]+>/g, "")
            .replace(/&nbsp;/g, " ")
            .trim();
          const hasMedia = /<img|<table|<iframe|<svg/i.test(html);
          return clean.length === 0 && !hasMedia;
        };

        const existingIsEmpty = isDocEmpty(prev);
        const mode = options?.insertPosition || (existingIsEmpty ? "replace" : "afterActive");

        let combinedPages: PageModel[];
        let combinedPageHtml: Record<string, string>;

        if (mode === "replace" || existingIsEmpty) {
          combinedPages = newPages;
          combinedPageHtml = newPageHtml;
        } else if (mode === "afterActive") {
          const activeIdx = prev.pages.findIndex((p) => p.id === activePage);
          if (activeIdx >= 0) {
            combinedPages = [
              ...prev.pages.slice(0, activeIdx + 1),
              ...newPages,
              ...prev.pages.slice(activeIdx + 1),
            ];
          } else {
            combinedPages = [...prev.pages, ...newPages];
          }
          combinedPageHtml = { ...prev.pageHtml, ...newPageHtml };
        } else {
          // "append"
          combinedPages = [...prev.pages, ...newPages];
          combinedPageHtml = { ...prev.pageHtml, ...newPageHtml };
        }

        // Always enable inbuilt page number on all sections
        const updatedSections = (
          prev.sections.length > 0 ? prev.sections : [section]
        ).map((sec) => ({
          ...sec,
          showPageNumbers: true,
          pageNumberPosition: sec.pageNumberPosition || "footer",
          pageNumberAlignment: sec.pageNumberAlignment || "right",
          pageNumberFormat: sec.pageNumberFormat || "1",
        }));

        const newModel: DocumentModel = {
          ...prev,
          title: existingIsEmpty
            ? title.trim() || prev.title || "Uploaded Document"
            : prev.title,
          pages: combinedPages,
          sections: updatedSections,
          pageHtml: combinedPageHtml,
          savedAt: Date.now(),
        };

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newModel));
        } catch {
          // ignore
        }

        setActivePage(newPages[0]?.id || combinedPages[0]?.id || null);
        return newModel;
      });
    },
    [activePage]
  );

  /* ============================================================
     Provider Return
  ============================================================ */

  return (
    <DocumentContext.Provider
      value={{
        model,
        activePage,
        history,
        savedDocuments,
        setActivePage,
        setPageHtml,
        updateTitle,
        updateStyleOverride,
        revertStyleOverride,
        addPage,
        removePage,
        addSection,
        updateSection,
        updateAllSections,
        updatePage,
        applySectionPatchToPage,
        applyPageBorders,
        save,
        saveAs,
        restore,
        loadDocument,
        deleteDocument,
        createNewDocument,
        insertDocument: createNewDocument,
        insertUploadedDocument,
        resetDocument,
        refreshHistory,
        importDocumentPages,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );

}

/* ============================================================
   Hook
============================================================ */

export function useDocumentModel() {
  const context = useContext(DocumentContext);

  if (!context) {
    throw new Error(
      "useDocumentModel must be used inside DocumentModelProvider"
    );
  }

  return context;
}