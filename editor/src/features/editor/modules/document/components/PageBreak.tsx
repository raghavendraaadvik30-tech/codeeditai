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
      className="flex w-full items-center gap-2.5 rounded-lg border border-secondary bg-muted p-2.5 text-left text-xs font-medium text-secondary-foreground hover:bg-primary/10 dark:border-secondary-foreground dark:bg-[#111D29] dark:text-muted-foreground dark:hover:bg-muted"
    >
      <CornerDownLeft className="h-4 w-4 text-muted-foreground" />
      Insert Page Break
    </button>
  );
}
