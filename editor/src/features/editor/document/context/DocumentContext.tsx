/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Document Feature Context
 * Description:
 * React Context provider managing local document instance state,
 * title modifications, and UI binding for document-level components.
 * --------------------------------------------------------
 */

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { DocumentModel } from "../types";
import { DEFAULT_DOCUMENT } from "../constants";

interface DocumentContextValue {
  currentDocument: DocumentModel;
  setCurrentDocument: (doc: DocumentModel) => void;
  updateDocumentTitle: (title: string) => void;
}

const DocumentContext = createContext<DocumentContextValue | null>(null);

export function DocumentProvider({
  children,
  initialDocument = DEFAULT_DOCUMENT,
}: {
  children: ReactNode;
  initialDocument?: DocumentModel;
}) {
  const [currentDocument, setCurrentDocument] = useState<DocumentModel>(initialDocument);

  const updateDocumentTitle = (title: string) => {
    setCurrentDocument((prev) => ({
      ...prev,
      title,
      updatedAt: new Date().toISOString(),
    }));
  };

  const value = useMemo(
    () => ({
      currentDocument,
      setCurrentDocument,
      updateDocumentTitle,
    }),
    [currentDocument],
  );

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocumentContext() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocumentContext must be used within DocumentProvider");
  }
  return context;
}
