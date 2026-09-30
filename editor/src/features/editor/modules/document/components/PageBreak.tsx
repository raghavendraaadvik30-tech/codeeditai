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
  const { insertPageBreak } = useEditor();

  const handleInsert = () => {
    insertPageBreak();
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
