/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: useDocument React Hook
 * Description:
 * Hook encapsulating asynchronous document fetching, reload cycles,
 * error state handling, and title mutation operations.
 * --------------------------------------------------------
 */

import { useState, useEffect } from "react";
import { documentService } from "../services";
import type { DocumentModel } from "../types";
import { DEFAULT_DOCUMENT } from "../constants";

export function useDocument(documentId?: string) {
  const [document, setDocument] = useState<DocumentModel>(DEFAULT_DOCUMENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchDoc = async () => {
      try {
        setLoading(true);
        setError(null);
        if (documentId) {
          const doc = await documentService.getDocumentDetails(documentId);
          if (!ignore) setDocument(doc);
        } else {
          const docs = await documentService.listDocuments();
          if (!ignore && docs.length > 0) {
            setDocument(docs[0]);
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err : new Error("Failed to load document"));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchDoc();

    return () => {
      ignore = true;
    };
  }, [documentId]);

  return {
    document,
    loading,
    error,
    updateTitle: (title: string) => {
      setDocument((prev) => ({ ...prev, title }));
    },
  };
}
