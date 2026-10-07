/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Page Numbers Pagination Widget
 * Description:
 * Displays active document total page count and dynamic pagination information.
 * --------------------------------------------------------
 */

import { Hash } from "lucide-react";
import { useDocumentModel } from "@/features/editor/store/documentModel";

export function PageNumbers() {
  const { model } = useDocumentModel();

  return (
    <div className="rounded-lg border border-secondary bg-card p-3 dark:border-muted dark:bg-[#111D29]">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        <Hash className="h-3.5 w-3.5 text-primary" />
        Pagination
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Current Page Count:</span>
          <span className="font-semibold text-foreground dark:text-primary-foreground">
            {model.pages.length || 1}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Page numbering updates dynamically as content expands.
        </p>
      </div>
    </div>
  );
}
