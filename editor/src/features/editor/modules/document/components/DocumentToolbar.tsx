/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Document Action Toolbar
 * Description:
 * Action toolbar triggering document save, export modal, print,
 * permission access settings, and delete document confirmation.
 * --------------------------------------------------------
 */

import { Download, Lock, Printer, Save, Shield, Trash2 } from "lucide-react";
import { useState } from "react";

import { useEditor } from "@/features/editor/context/EditorContext";

import { DeleteDocumentDialog } from "./DeleteDocumentDialog";
import { ExportDialog } from "./ExportDialog";
import { PermissionsDialog } from "./PermissionsDialog";
import { SaveDialog } from "./SaveDialog";

import { usePrint } from "../hooks/usePrint";

export function DocumentToolbar() {
  const { printDocument } = usePrint();
  const { isEditable } = useEditor();

  const [exportOpen, setExportOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between border-b border-secondary p-2 dark:border-muted">
        <div className="flex items-center gap-1">
          {/* Save */}
          <button
            type="button"
            onClick={() => setSaveOpen(true)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
          >
            <Save className="h-3.5 w-3.5 text-primary" />
            Save
          </button>

          {/* Export */}
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5 text-primary" />
            Export
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={printDocument}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
          >
            <Printer className="h-3.5 w-3.5 text-primary" />
            Print
          </button>

          <div className="mx-1 h-4 w-px bg-secondary dark:bg-muted" />

          {/* Permissions / Access Control */}
          <button
            type="button"
            onClick={() => setPermissionsOpen(true)}
            title={
              isEditable
                ? "Document is editable. Click to configure permissions."
                : "Document is locked (Read-Only). Click to change."
            }
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              isEditable
                ? "text-secondary-foreground hover:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
                : "bg-warning-50 text-warning-700 hover:bg-warning-100 dark:bg-warning-950/40 dark:text-warning-300 dark:hover:bg-warning-950/60"
            }`}
          >
            {isEditable ? (
              <>
                <Shield className="h-3.5 w-3.5 text-success-600 dark:text-success-400" />
                <span>Permissions</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-warning-600 dark:text-warning-400" />
                <span>Read-Only</span>
              </>
            )}
          </button>
        </div>

        {/* Delete Document */}
        <div>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            title="Delete Document"
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 dark:text-destructive dark:hover:bg-destructive/40"
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive dark:text-destructive" />
            Delete
          </button>
        </div>
      </div>

      {/* Dialogs */}
      <ExportDialog
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
      />

      <SaveDialog
        isOpen={saveOpen}
        onClose={() => setSaveOpen(false)}
      />

      <PermissionsDialog
        isOpen={permissionsOpen}
        onClose={() => setPermissionsOpen(false)}
      />

      <DeleteDocumentDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
    </>
  );
}
