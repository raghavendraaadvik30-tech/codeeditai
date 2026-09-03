/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Delete Document Confirmation Dialog
 * Description:
 * Confirmation modal allowing users to safely discard and delete
 * the current active document and reset the canvas.
 * --------------------------------------------------------
 */

import { AlertTriangle, Trash2 } from "lucide-react";
import { useDocumentModel } from "@/features/editor/store/documentModel";

export function DeleteDocumentDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { model, resetDocument } = useDocumentModel();

  if (!isOpen) return null;

  const handleDelete = () => {
    resetDocument();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-xl border border-red-200 bg-white p-5 shadow-2xl dark:border-red-900/50 dark:bg-[#111D29]">
        <div className="flex items-center gap-2.5 mb-3 text-red-600 dark:text-red-400">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/60">
            <Trash2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Delete Document
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Permanent action warning
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <span>
              Are you sure you want to delete <strong>"{model.title || "Untitled Document"}"</strong>? This will clear all pages and reset the workspace.
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors shadow-sm"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Document
          </button>
        </div>
      </div>
    </div>
  );
}
