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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111D29]">
        <div className="flex items-center gap-2 mb-3">
          <Save className="h-5 w-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Save Document</h3>
        </div>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Document Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-1.5 outline-none dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
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
