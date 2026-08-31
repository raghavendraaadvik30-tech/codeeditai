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
  useEffect,
  useRef,
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
  Math.random().toString(36).substring(2, 10);

const STORAGE_KEY = "editor_document";

const HISTORY_KEY = "editor_document_history";

const DEFAULT_HTML = `
<p></p>
`;

const createDefaultSection = (
  id = "section_1"
): SectionModel => ({
  id,

  header: "CSR-2024-PXL-0921",

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

    title: "CSR-2024-PXL-0921",

    pages: [page],

    sections: [section],

    pageHtml: {
      [page.id]: DEFAULT_HTML,
    },
    styleOverrides : {},
  };
}

/* ============================================================
   Context
============================================================ */

interface DocumentContextType {
  model: DocumentModel;

  activePage: string | null;

  history: HistoryEntry[];

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
  styleId:string,
)=>void;

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

  save: () => void;

  saveAs: (
    title: string
  ) => void;

  restore: (
    documentId: string
  ) => void;

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
  const [model, setModel] =
    useState<DocumentModel>(
      createEmptyDocument
    );

  const [activePage, setActivePage] =
    useState<string | null>(null);

  const [history, setHistory] =
    useState<HistoryEntry[]>([]);

  const restored = useRef(false);


    /* ============================================================
     Style Overrides
  ============================================================ */

  const updateStyleOverride = useCallback(
    (
      styleId: string,
      update: StyleOverride,
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


  useEffect(() => {
    if (restored.current) return;

    restored.current = true;

    try {
      const raw =
        localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed =
          JSON.parse(raw) as DocumentModel;

        if (parsed.pages.length) {
          setModel(parsed);
        }
      }

      const historyRaw =
        localStorage.getItem(HISTORY_KEY);

      if (historyRaw) {
        setHistory(JSON.parse(historyRaw));
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

/* ============================================================
   Refresh History
============================================================ */

  const refreshHistory =
    useCallback(() => {
      try {
        const raw =
          localStorage.getItem(
            HISTORY_KEY
          );

        setHistory(
          raw ? JSON.parse(raw) : []
        );
      } catch {
        setHistory([]);
      }
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
        ? prev.pages.findIndex(
            (p) => p.id === afterPageId
          )
        : prev.pages.length - 1;

      const insertIndex =
        index >= 0 ? index : prev.pages.length - 1;

      const sectionId =
        prev.pages[insertIndex]?.sectionId ??
        prev.sections[0].id;

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

const save = useCallback(() => {
  try {
    const saved: DocumentModel = {
      ...model,
      savedAt: Date.now(),
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(saved)
    );

    localStorage.setItem(
      `editor_snapshot.${saved.id}.${saved.savedAt}`,
      JSON.stringify(saved)
    );

    const historyRaw =
      localStorage.getItem(HISTORY_KEY);

    const historyItems: HistoryEntry[] =
      historyRaw
        ? JSON.parse(historyRaw)
        : [];

    historyItems.unshift({
      id: saved.id,
      title: saved.title,
      savedAt: saved.savedAt!,
    });

    const latest =
      historyItems.slice(0, 50);

    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(latest)
    );

    setHistory(latest);

    setModel(saved);
  } catch {
    // ignore
  }
}, [model]);

/* ============================================================
   Save As
============================================================ */

const saveAs = useCallback(
  (title: string) => {
    const saved: DocumentModel = {
      ...model,
      id: "doc_" + uid(),
      title,
      savedAt: Date.now(),
    };

    setModel(saved);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(saved)
      );

      const historyRaw =
        localStorage.getItem(HISTORY_KEY);

      const historyItems: HistoryEntry[] =
        historyRaw
          ? JSON.parse(historyRaw)
          : [];

      historyItems.unshift({
        id: saved.id,
        title: saved.title,
        savedAt: saved.savedAt!,
      });

      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(
          historyItems.slice(0, 50)
        )
      );

      refreshHistory();
    } catch {
      // ignore
    }
  },
  [model, refreshHistory]
);
/* ============================================================
   Restore Document
============================================================ */

const restore = useCallback((documentId: string) => {
  try {
    let latest: DocumentModel | null = null;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (
        !key ||
        !key.startsWith(`editor_snapshot.${documentId}.`)
      ) {
        continue;
      }

      const raw = localStorage.getItem(key);

      if (!raw) continue;

      const snapshot = JSON.parse(raw) as DocumentModel;

      if (
        !latest ||
        (snapshot.savedAt ?? 0) >
          (latest.savedAt ?? 0)
      ) {
        latest = snapshot;
      }
    }

    if (latest) {
      setModel(latest);

      if (latest.pages.length) {
        setActivePage(latest.pages[0].id);
      }
    }
  } catch {
    // ignore
  }
}, []);

/* ============================================================
   Provider
============================================================ */

return (
  <DocumentContext.Provider
    value={{
      model,

      activePage,

      history,

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