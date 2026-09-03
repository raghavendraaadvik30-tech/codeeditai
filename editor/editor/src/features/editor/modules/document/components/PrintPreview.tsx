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
      className="flex w-full items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 dark:border-slate-700 dark:bg-[#111D29] dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <Printer className="h-4 w-4 text-slate-500" />
      Print Document
    </button>
  );
}
