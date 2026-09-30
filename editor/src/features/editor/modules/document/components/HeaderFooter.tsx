/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Header & Footer Launcher Component
 * Description:
 * Action trigger button opening the Header & Footer configuration modal.
 * --------------------------------------------------------
 */

import { useState } from "react";
import { Heading } from "lucide-react";
import { HeaderFooterDialog } from "./HeaderFooterDialog";

export function HeaderFooter() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className="flex w-full items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 dark:border-slate-700 dark:bg-[#111D29] dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Heading className="h-4 w-4 text-slate-500" />
        Configure Header & Footer
      </button>

      <HeaderFooterDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
