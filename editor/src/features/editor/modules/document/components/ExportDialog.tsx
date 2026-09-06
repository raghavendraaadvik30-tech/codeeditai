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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111D29]">
        <div className="flex items-center gap-2 mb-3">
          <Download className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Export Document</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
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
            className="rounded-lg border border-slate-200 p-2.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 font-medium text-left"
          >
            <div className="font-semibold text-slate-800 dark:text-slate-100">Word (.docx)</div>
            <div className="text-[10px] text-slate-400">Microsoft Word document</div>
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={() => {
              exportDocument("pdf");
              onClose();
            }}
            className="rounded-lg border border-slate-200 p-2.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 font-medium text-left"
          >
            <div className="font-semibold text-slate-800 dark:text-slate-100">PDF Document</div>
            <div className="text-[10px] text-slate-400">Print to PDF format</div>
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={() => {
              exportDocument("html");
              onClose();
            }}
            className="rounded-lg border border-slate-200 p-2.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 font-medium text-left"
          >
            <div className="font-semibold text-slate-800 dark:text-slate-100">HTML File</div>
            <div className="text-[10px] text-slate-400">Web page format</div>
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={() => {
              exportDocument("txt");
              onClose();
            }}
            className="rounded-lg border border-slate-200 p-2.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 font-medium text-left"
          >
            <div className="font-semibold text-slate-800 dark:text-slate-100">Plain Text (.txt)</div>
            <div className="text-[10px] text-slate-400">Unformatted text</div>
          </button>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
