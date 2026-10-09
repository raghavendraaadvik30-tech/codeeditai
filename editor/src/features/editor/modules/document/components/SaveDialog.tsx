/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Save Document Modal Dialog
 * Description:
 * Modal prompt allowing users to rename and commit document titles to storage.
 * --------------------------------------------------------
 */

import { Save } from "lucide-react";
import { useState } from "react";
import { useDocumentModel } from "@/features/editor/store/documentModel";

function SaveDialogContent({ onClose }: { onClose: () => void }) {
  const { model, save } = useDocumentModel();
  const [title, setDocTitle] = useState(model.title || "Untitled Document");

  const handleSave = () => {
    save(title);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="w-full max-w-sm rounded-xl border border-secondary bg-card p-5 shadow-xl dark:border-muted dark:bg-[#111D29]">
        <div className="flex items-center gap-2 mb-3">
          <Save className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground dark:text-primary-foreground">Save Document</h3>
        </div>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-11px font-medium text-muted-foreground mb-1">
              Document Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full rounded-md border border-secondary px-3 py-1.5 outline-none dark:border-secondary-foreground dark:bg-secondary"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-xs text-secondary-foreground hover:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SaveDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return <SaveDialogContent onClose={onClose} />;
}
