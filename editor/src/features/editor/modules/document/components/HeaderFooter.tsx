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
        className="flex w-full items-center gap-2.5 rounded-lg border border-secondary bg-muted p-2.5 text-left text-xs font-medium text-secondary-foreground hover:bg-primary/10 dark:border-secondary-foreground dark:bg-[#111D29] dark:text-muted-foreground dark:hover:bg-muted"
      >
        <Heading className="h-4 w-4 text-muted-foreground" />
        Configure Header & Footer
      </button>

      <HeaderFooterDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
