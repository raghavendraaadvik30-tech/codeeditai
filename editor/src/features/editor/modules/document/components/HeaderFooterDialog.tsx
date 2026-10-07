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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="w-full max-w-sm rounded-xl border border-secondary bg-card p-5 shadow-xl dark:border-muted dark:bg-[#111D29]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heading className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground dark:text-primary-foreground">
              Header & Footer
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-secondary-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1">
              Header Text
            </label>
            <input
              type="text"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              placeholder="Enter document header..."
              className="w-full rounded border border-secondary px-3 py-1.5 outline-none dark:border-secondary-foreground dark:bg-secondary"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1">
              Footer Text
            </label>
            <input
              type="text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="Enter document footer..."
              className="w-full rounded border border-secondary px-3 py-1.5 outline-none dark:border-secondary-foreground dark:bg-secondary"
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
              onClick={handleApply}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
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
