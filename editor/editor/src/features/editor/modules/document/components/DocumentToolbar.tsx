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
      <div className="flex items-center justify-between border-b border-slate-200 p-2 dark:border-slate-800">
        <div className="flex items-center gap-1">
          {/* Save */}
          <button
            type="button"
            onClick={() => setSaveOpen(true)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Save className="h-3.5 w-3.5 text-blue-600" />
            Save
          </button>

          {/* Export */}
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5 text-blue-600" />
            Export
          </button>

          {/* Print */}
          <button
            type="button"
            onClick={printDocument}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Printer className="h-3.5 w-3.5 text-blue-600" />
            Print
          </button>

          <div className="mx-1 h-4 w-px bg-slate-200 dark:bg-slate-800" />

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
                ? "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/60"
            }`}
          >
            {isEditable ? (
              <>
                <Shield className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Permissions</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
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
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
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
