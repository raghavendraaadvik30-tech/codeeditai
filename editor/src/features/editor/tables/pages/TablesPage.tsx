/**
 * --------------------------------------------------------
 * Module: Tables
 * Feature: Tables Page / Main Tables Panel
 * Description:
 * Primary presentation container for table creation, quick grid
 * picking, template selection, and row/column manipulation.
 * --------------------------------------------------------
 */

import { useState } from "react";
import {
  Table2,
  Plus,
  Search,
  ChevronRight,
  Sliders,
} from "lucide-react";
import {
  TableGridPicker,
  TableInsertDialog,
  TableActionsToolbar,
} from "../components";
import { cn } from "@/lib/utils";

function TablesPageContent() {
  const [insertDialogOpen, setInsertDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    quickGrid: false,
    actions: false,
    templates: false,
    styles: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => {
      const isCurrentlyOpen = !!prev[section];
      return {
        quickGrid: false,
        actions: false,
        templates: false,
        styles: false,
        [section]: !isCurrentlyOpen,
      };
    });
  };

  return (
    <div className="flex h-full w-full flex-col select-none overflow-hidden bg-background text-foreground">
      {/* 1. TOP HEADER: TABLES MANAGER & NEW BUTTON */}
      <div className="border-b border-slate-200/80 p-3.5 space-y-3 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
            Tables Manager
          </h3>
          <button
            type="button"
            onClick={() => setInsertDialogOpen(true)}
            className="flex h-7 items-center gap-1 rounded-md bg-[#0078d4] px-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#005a9e]"
          >
            <Plus className="h-3.5 w-3.5" />
            Custom Table
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates & tools..."
            className="h-8 w-full rounded-md border border-slate-200 bg-slate-50/60 pl-8 pr-3 text-xs outline-none transition-colors placeholder:text-slate-400 focus:border-[#0078d4] dark:border-slate-800 dark:bg-[#07131E] dark:text-slate-200"
          />
        </div>
      </div>

      {/* 2. SCROLLABLE SIDEBAR BODY */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* QUICK GRID PICKER */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => toggleSection("quickGrid")}
            className="flex w-full items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <div className="flex items-center gap-1.5">
              <Table2 className="h-3.5 w-3.5 text-[#0078d4]" />
              <span>Interactive Grid</span>
            </div>
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                openSections.quickGrid ? "rotate-90" : ""
              )}
            />
          </button>

          {openSections.quickGrid && <TableGridPicker />}
        </div>

        {/* TABLE ACTIONS */}
        <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => toggleSection("actions")}
            className="flex w-full items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <div className="flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-[#0078d4]" />
              <span>Table Tools & Rows</span>
            </div>
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                openSections.actions ? "rotate-90" : ""
              )}
            />
          </button>

          {openSections.actions && <TableActionsToolbar />}
        </div>
      </div>

      <TableInsertDialog
        open={insertDialogOpen}
        onClose={() => setInsertDialogOpen(false)}
      />
    </div>
  );
}

export default function TablesPage() {
  return <TablesPageContent />;
}
