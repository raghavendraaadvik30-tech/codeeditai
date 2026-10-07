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
  const { model, deleteDocument } = useDocumentModel();

  if (!isOpen) return null;

  const handleDelete = () => {
    if (model.id) {
      deleteDocument(model.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-xl border border-destructive/20 bg-card p-5 shadow-2xl dark:border-red-900/50 dark:bg-[#111D29]">
        <div className="flex items-center gap-2.5 mb-3 text-destructive dark:text-red-400">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 dark:bg-red-950/60">
            <Trash2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground dark:text-primary-foreground">
              Delete Document
            </h3>
            <p className="text-[11px] text-muted-foreground dark:text-muted-foreground">
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
            className="rounded-md border border-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-muted dark:border-secondary-foreground dark:text-muted-foreground dark:hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-red-700 transition-colors shadow-sm"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Document
          </button>
        </div>
      </div>
    </div>
  );
}
