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
    <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-[#111D29]">
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        Document Overview
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">Document Title:</span>
          <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">
            {model.title || "Untitled Document"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Document ID:</span>
          <span className="font-mono text-[10px] text-slate-400 truncate max-w-[160px]">
            {model.id}
          </span>
        </div>
      </div>
    </div>
  );
}
