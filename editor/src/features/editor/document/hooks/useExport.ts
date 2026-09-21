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
import { useDocumentModel, type PageModel } from "../../store/documentModel";
import { generateWordDocx } from "../../services/docxGeneratorService";
import { printService } from "../../services/printService";

export type ExportFormat = "pdf" | "docx" | "html" | "txt";

export function useExport() {
  const [exporting, setExporting] = useState(false);
  const { model } = useDocumentModel();

  const exportDocument = useCallback(async (format: ExportFormat, filename?: string) => {
    setExporting(true);
    const resolvedName = filename || (model.title || "document").replace(/[^a-zA-Z0-9_\-\s]/g, "").trim() || "document";
    try {
      if (format === "docx") {
        const updatedPageHtml: Record<string, string> = { ...model.pageHtml };
        model.pages.forEach((p: PageModel) => {
          const pageEl = document.querySelector(`[data-page-id="${p.id}"]`);
          const editable = pageEl?.querySelector("[contenteditable]");
          if (editable) {
            updatedPageHtml[p.id] = (editable as HTMLElement).innerHTML;
          }
        });
        const activeModel = { ...model, pageHtml: updatedPageHtml };
        const blob = await generateWordDocx(activeModel, {
          tableAutoFitMode: "fixed",
          exportMarkupMode: "markup",
        });
        const url = URL.createObjectURL(blob);
        const a = window.document.createElement("a");
        a.href = url;
        a.download = `${resolvedName}.docx`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else if (format === "html") {
        const editorElement = document.querySelector(".prose-doc") || document.body;
        const content = editorElement.innerHTML;
        const blob = new Blob([content], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = window.document.createElement("a");
        a.href = url;
        a.download = `${resolvedName}.html`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else if (format === "txt") {
        const editorElement = document.querySelector(".prose-doc") || document.body;
        const text = (editorElement as HTMLElement).innerText || "";
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = window.document.createElement("a");
        a.href = url;
        a.download = `${resolvedName}.txt`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        printService.printDocument();
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }, [model]);

  return {
    exporting,
    exportDocument,
  };
}

