/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Export Document Dialog
 * Description:
 * Modal interface allowing users to download documents as HTML, Plain Text, or Print formats.
 * --------------------------------------------------------
 */

import { Download } from "lucide-react";
import { useExport } from "../hooks/useExport";

export function ExportDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { exportDocument, exporting } = useExport();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="w-full max-w-sm rounded-xl border border-secondary bg-card p-5 shadow-xl dark:border-muted dark:bg-[#111D29]">
        <div className="flex items-center gap-2 mb-3">
          <Download className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground dark:text-primary-foreground">Export Document</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Choose a file format to download your document.
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            disabled={exporting}
            onClick={() => {
              exportDocument("docx");
              onClose();
            }}
            className="rounded-lg border border-secondary p-2.5 hover:bg-muted dark:border-secondary-foreground dark:hover:bg-muted font-medium text-left"
          >
            <div className="font-semibold text-foreground dark:text-muted">Word (.docx)</div>
            <div className="text-[10px] text-muted-foreground">Microsoft Word document</div>
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={() => {
              exportDocument("pdf");
              onClose();
            }}
            className="rounded-lg border border-secondary p-2.5 hover:bg-muted dark:border-secondary-foreground dark:hover:bg-muted font-medium text-left"
          >
            <div className="font-semibold text-foreground dark:text-muted">PDF Document</div>
            <div className="text-[10px] text-muted-foreground">Print to PDF format</div>
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={() => {
              exportDocument("html");
              onClose();
            }}
            className="rounded-lg border border-secondary p-2.5 hover:bg-muted dark:border-secondary-foreground dark:hover:bg-muted font-medium text-left"
          >
            <div className="font-semibold text-foreground dark:text-muted">HTML File</div>
            <div className="text-[10px] text-muted-foreground">Web page format</div>
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={() => {
              exportDocument("txt");
              onClose();
            }}
            className="rounded-lg border border-secondary p-2.5 hover:bg-muted dark:border-secondary-foreground dark:hover:bg-muted font-medium text-left"
          >
            <div className="font-semibold text-foreground dark:text-muted">Plain Text (.txt)</div>
            <div className="text-[10px] text-muted-foreground">Unformatted text</div>
          </button>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-xs text-secondary-foreground hover:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
