/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Print Preview Action Component
 * Description:
 * Action trigger button launching the native system print dialogue.
 * --------------------------------------------------------
 */

import { Printer } from "lucide-react";
import { usePrint } from "../hooks/usePrint";

export function PrintPreview() {
  const { printDocument, isPrinting } = usePrint();

  return (
    <button
      type="button"
      disabled={isPrinting}
      onClick={printDocument}
      className="flex w-full items-center gap-2.5 rounded-lg border border-secondary bg-muted p-2.5 text-left text-xs font-medium text-secondary-foreground hover:bg-primary/10 dark:border-secondary-foreground dark:bg-[#111D29] dark:text-muted-foreground dark:hover:bg-muted"
    >
      <Printer className="h-4 w-4 text-muted-foreground" />
      Print Document
    </button>
  );
}
