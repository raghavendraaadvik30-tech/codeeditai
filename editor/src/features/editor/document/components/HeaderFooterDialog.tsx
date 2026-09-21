/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Header & Footer Configuration Dialog
 * Description:
 * Modal dialog for modifying default document header and footer text.
 * --------------------------------------------------------
 */

import { Heading, X } from "lucide-react";
import { useState } from "react";
import { useDocumentModel } from "@/features/editor/store/documentModel";

function HeaderFooterDialogContent({ onClose }: { onClose: () => void }) {
  const { model, updateSection } = useDocumentModel();
  const firstSection = model.sections?.[0];
  const [headerText, setHeaderText] = useState(firstSection?.header || "");
  const [footerText, setFooterText] = useState(firstSection?.footer || "");

  const handleApply = () => {
    if (firstSection) {
      updateSection(firstSection.id, {
        header: headerText,
        footer: footerText,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#111D29]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heading className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Header & Footer
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Header Text
            </label>
            <input
              type="text"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              placeholder="Enter document header..."
              className="w-full rounded border border-slate-200 px-3 py-1.5 outline-none dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              Footer Text
            </label>
            <input
              type="text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="Enter document footer..."
              className="w-full rounded border border-slate-200 px-3 py-1.5 outline-none dark:border-slate-700 dark:bg-slate-900"
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
              onClick={handleApply}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeaderFooterDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return <HeaderFooterDialogContent onClose={onClose} />;
}
