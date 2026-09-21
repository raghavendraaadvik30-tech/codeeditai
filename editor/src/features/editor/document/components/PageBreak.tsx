/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Insert Page Break Action
 * Description:
 * Inserts CSS page-break container element directly into editor DOM structure.
 * --------------------------------------------------------
 */

import { CornerDownLeft } from "lucide-react";
import { useEditor } from "@/features/editor/context/EditorContext";

export function PageBreak() {
  const { insertHTML } = useEditor();

  const handleInsert = () => {
    insertHTML?.(
      `<div class="page-break" contenteditable="false" style="break-before:page;page-break-before:always;border-top:1px dashed #94a3b8;margin:24px 0;text-align:center;color:#94a3b8;font-size:10pt;user-select:none;">— Page Break —</div><p><br/></p>`
    );
  };

  return (
    <button
      type="button"
      onClick={handleInsert}
      className="flex w-full items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 dark:border-slate-700 dark:bg-[#111D29] dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <CornerDownLeft className="h-4 w-4 text-slate-500" />
      Insert Page Break
    </button>
  );
}
