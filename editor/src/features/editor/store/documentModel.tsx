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

import type { StyleOverrides, StyleOverride } from "../modules/styles/types/styles.types";

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
}

export interface PageModel {
  id: string;
  sectionId: string;
}

export interface DocumentModel {
  id: string;
  title: string;
  pages: PageModel[];
  sections: SectionModel[];
  pageHtml: Record<string, string>;
  savedAt?: number;
  styleOverrides: StyleOverrides ;
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
});

function createEmptyDocument(): DocumentModel {
  const section = createDefaultSection();

  const page: PageModel = {
    id: "page_" + uid(),
    sectionId: section.id,
  };

  return {
    id: "doc_" + uid(),
    title: "Untitled Document",
    pages: [page],
    sections: [section],
    pageHtml: {
      [page.id]: DEFAULT_HTML,
    },
    styleOverrides: {},
  };
}

function isDocEmpty(doc?: DocumentModel | null): boolean {
  if (!doc || !Array.isArray(doc.pages) || doc.pages.length === 0) return true;
  if (doc.pages.length > 1) return false;
  const firstPageId = doc.pages[0]?.id || "";
  const html = doc.pageHtml?.[firstPageId] || "";
  const clean = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  return clean === "";
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
            unique.push(doc);
          }
        }
        return unique;
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
        if (!parsed.title) {
          parsed.title = "Untitled Document";
        }
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  const savedDocs = getStoredSavedDocuments();
  if (savedDocs.length > 0) {
    const firstDoc = savedDocs[0];
    if (!firstDoc.title) {
      firstDoc.title = "Untitled Document";
    }
    return firstDoc;
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
    afterPageId?: string
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
  resetDocument: () => void;
  refreshHistory: () => void;
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
    (afterPageId?: string) => {
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
            [newPageId]: DEFAULT_HTML,
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
      setModel((prev) => {
        const sectionId = "section_" + uid();
        const pageId = "page_" + uid();

        const index = afterPageId
          ? prev.pages.findIndex(
              (page) => page.id === afterPageId
            )
          : prev.pages.length - 1;

        const insertIndex =
          index >= 0 ? index : prev.pages.length - 1;

        const section =
          createDefaultSection(sectionId);

        section.header =
          "Section " +
          (prev.sections.length + 1);

        section.footer = "";

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

  /* ============================================================
     Save
  ============================================================ */

  const save = useCallback(
    (customTitle?: string) => {
      setModel((currentModel) => {
        const titleToSave =
          customTitle !== undefined && customTitle.trim() !== ""
            ? customTitle.trim()
            : currentModel.title || "Untitled Document";

        const saved: DocumentModel = {
          ...currentModel,
          title: titleToSave,
          savedAt: Date.now(),
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
        const saved: DocumentModel = {
          ...currentModel,
          id: "doc_" + uid(),
          title: title.trim() || "Untitled Document",
          savedAt: Date.now(),
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
          const nextSaved = [saved, ...existingSaved];
          localStorage.setItem(
            SAVED_DOCS_KEY,
            JSON.stringify(nextSaved)
          );
          setSavedDocuments(nextSaved);

          const historyItems = getInitialHistory();
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
        const savedList = getStoredSavedDocuments();
        const isCurrentEmpty = isDocEmpty(currentModel);

        // 1. Preserve current active model in list before switching only if it has content or was saved
        let nextSaved: DocumentModel[];
        if (currentModel.savedAt || !isCurrentEmpty) {
          const existingIdx = savedList.findIndex((d) => d.id === currentModel.id);
          if (existingIdx >= 0) {
            nextSaved = [...savedList];
            nextSaved[existingIdx] = currentModel;
          } else {
            nextSaved = [currentModel, ...savedList];
          }
        } else {
          nextSaved = savedList.filter((d) => d.id !== currentModel.id);
        }

        localStorage.setItem(SAVED_DOCS_KEY, JSON.stringify(nextSaved));
        setSavedDocuments(nextSaved);

        // 2. Find target document
        const target = nextSaved.find((d) => d.id === documentId);
        if (target) {
          setActivePage(target.pages[0]?.id ?? null);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(target));
          return target;
        }

        // 3. Fallback to snapshots
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key || !key.startsWith(`editor_snapshot.${documentId}.`)) continue;
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const snapshot = JSON.parse(raw) as DocumentModel;
          setActivePage(snapshot.pages[0]?.id ?? null);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
          return snapshot;
        }
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
     Create New Document (Temporary / Unsaved)
  ============================================================ */

  const createNewDocument = useCallback((customTitle?: string) => {
    setModel((currentModel) => {
      const fresh = createEmptyDocument();
      fresh.title = customTitle && customTitle.trim() ? customTitle.trim() : "Untitled Document";

      try {
        const savedList = getStoredSavedDocuments();
        const isCurrentEmpty = isDocEmpty(currentModel);

        let nextSaved: DocumentModel[];
        // If the current document has content or was saved, preserve it in the list!
        if (currentModel.savedAt || !isCurrentEmpty) {
          const existingIdx = savedList.findIndex((d) => d.id === currentModel.id);
          if (existingIdx >= 0) {
            nextSaved = [...savedList];
            nextSaved[existingIdx] = currentModel;
          } else {
            nextSaved = [currentModel, ...savedList];
          }
        } else {
          // If current document is empty and unsaved, discard the empty placeholder so only 1 new document is created
          nextSaved = savedList.filter((d) => d.id !== currentModel.id);
        }

        // Add exactly one fresh document to the top of list
        nextSaved = [fresh, ...nextSaved.filter((d) => d.id !== fresh.id)];

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
              localStorage.removeItem(STORAGE_KEY);
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
    if (model.id) {
      deleteDocument(model.id);
    } else {
      createNewDocument();
    }
  }, [model.id, deleteDocument, createNewDocument]);

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
        save,
        saveAs,
        restore,
        loadDocument,
        deleteDocument,
        createNewDocument,
        resetDocument,
        refreshHistory,
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