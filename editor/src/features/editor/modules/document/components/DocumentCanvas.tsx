/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Document Canvas Overview Widget
 * Description:
 * Summary card displaying the active document title and identifier.
 * --------------------------------------------------------
 */

import { useDocumentModel } from "@/features/editor/store/documentModel";

export function DocumentCanvas() {
  const { model } = useDocumentModel();

  return (
    <div className="rounded-lg border border-secondary bg-card p-3 dark:border-muted dark:bg-[#111D29]">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Document Overview
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Document Title:</span>
          <span className="font-semibold text-foreground dark:text-primary-foreground truncate max-w-40">
            {model.title || "Untitled Document"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Document ID:</span>
          <span className="font-mono text-[10px] text-muted-foreground truncate max-w-40">
            {model.id}
          </span>
        </div>
      </div>
    </div>
  );
}
