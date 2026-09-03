/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: useExport React Hook
 * Description:
 * Client-side file exporting hook supporting HTML, plain text,
 * and print pipeline document generation.
 * --------------------------------------------------------
 */

import { useState, useCallback } from "react";

export type ExportFormat = "pdf" | "docx" | "html" | "txt";

export function useExport() {
  const [exporting, setExporting] = useState(false);

  const exportDocument = useCallback(async (format: ExportFormat, filename = "document") => {
    setExporting(true);
    try {
      const editorElement = document.querySelector(".prose-doc") || document.body;
      const content = editorElement.innerHTML;

      if (format === "html") {
        const blob = new Blob([content], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = window.document.createElement("a");
        a.href = url;
        a.download = `${filename}.html`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === "txt") {
        const text = (editorElement as HTMLElement).innerText || "";
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = window.document.createElement("a");
        a.href = url;
        a.download = `${filename}.txt`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        window.print();
      }
    } finally {
      setExporting(false);
    }
  }, []);

  return {
    exporting,
    exportDocument,
  };
}
