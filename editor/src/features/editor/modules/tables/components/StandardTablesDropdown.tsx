/**
 * --------------------------------------------------------------------------
 * Module: Tables
 * Feature: StandardTablesDropdown Component
 * Description:
 * Microsoft Word-style Standard Tables Ribbon Dropdown button and menu.
 * Provides the 4 standard clinical table configurations in exact order:
 * 1. Insert Table (Heading 12pt, Text 12pt)
 * 2. Insert Table (Heading 10pt, Text 10pt)
 * 3. Insert Table (Title Only)
 * 4. Insert Table (No Title 12pt)
 * --------------------------------------------------------------------------
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Table2, ChevronDown } from "lucide-react";
import { useTable } from "../hooks";
import { buildCustomTableHTML } from "./TableInsertDialog";


export function StandardTablesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [alignRight, setAlignRight] = useState(false);
  const savedRangeRef = useRef<Range | null>(null);

  const { insertCustomTableHTML } = useTable();

  // Save current editor caret position
  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const el =
        container.nodeType === Node.ELEMENT_NODE
          ? (container as Element)
          : container.parentElement;
      if (el?.closest('[contenteditable="true"]')) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  }, []);

  // Restore caret position before inserting
  const restoreSelection = useCallback(() => {
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }
  }, []);

  // Viewport-aware alignment check
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      if (rect.right > window.innerWidth - 12) {
        setAlignRight(true);
      } else {
        setAlignRight(false);
      }
    }
  }, [isOpen]);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectOption = useCallback(
    (optionIndex: number) => {
      setIsOpen(false);
      restoreSelection();

      switch (optionIndex) {
        case 1: {
          // OPTION 1: Insert Table (Heading 12pt, Text 12pt)
          const html = buildCustomTableHTML({
            rows: 3,
            columns: 3,
            headingSize: "12pt",
            textSize: "12pt",
            titleOption: "with",
            autoFit: true,
          });
          insertCustomTableHTML(html);
          break;
        }

        case 2: {
          // OPTION 2: Insert Table (Heading 10pt, Text 10pt)
          const html = buildCustomTableHTML({
            rows: 3,
            columns: 3,
            headingSize: "10pt",
            textSize: "10pt",
            titleOption: "with",
            autoFit: true,
          });
          insertCustomTableHTML(html);
          break;
        }

        case 3: {
          // OPTION 3: Insert Table (Title Only)
          const html = buildCustomTableHTML({
            rows: 0,
            columns: 0,
            headingSize: "10pt",
            textSize: "10pt",
            titleOption: "only",
            autoFit: true,
          });
          insertCustomTableHTML(html);
          break;
        }

        case 4: {
          // OPTION 4: Insert Table (No Title 12pt)
          const html = buildCustomTableHTML({
            rows: 3,
            columns: 3,
            headingSize: "12pt",
            textSize: "12pt",
            titleOption: "without",
            autoFit: true,
          });
          insertCustomTableHTML(html);
          break;
        }

        default:
          break;
      }
    },
    [insertCustomTableHTML, restoreSelection]
  );

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* =======================================================
          STANDARD TABLES BUTTON (Matching Reference Layout)
          ┌─────────────────────────────────┐
          │  ▣  Standard Tables          ˄  │
          │     Tables                       │
          └─────────────────────────────────┘
      ======================================================= */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          saveSelection();
        }}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-left transition-colors cursor-pointer border ${
          isOpen
            ? "bg-blue-50/80 border-blue-300 text-blue-900 dark:bg-blue-950/60 dark:border-blue-700 dark:text-blue-200"
            : "border-transparent hover:bg-slate-100 hover:border-slate-200 dark:hover:bg-slate-800 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200"
        }`}
        title="Standard Tables"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
          <Table2 className="h-4 w-4" />
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-semibold leading-tight text-slate-800 dark:text-slate-100">
            Standard Tables
          </span>
          <span className="text-[10px] leading-tight text-slate-400 font-normal">
            Tables
          </span>
        </div>

        <ChevronDown
          className={`ml-1 h-3 w-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* =======================================================
          STANDARD TABLES DROPDOWN CARD (6 Options in Exact Order)
      ======================================================= */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute top-full mt-1 z-50 min-w-[270px] rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-[#0B1523] animate-in fade-in-0 zoom-in-95 duration-100 select-none ${
            alignRight ? "right-0" : "left-0"
          }`}
        >
          <div className="space-y-1">
            {/* OPTION 1: Insert Table (Heading 12pt, Text 12pt) */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelectOption(1)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer group"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                <Table2 className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  Insert Table
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Heading 12pt, Text 12pt
                </span>
              </div>
            </button>

            {/* OPTION 2: Insert Table (Heading 10pt, Text 10pt) */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelectOption(2)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer group"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                <Table2 className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  Insert Table
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Heading 10pt, Text 10pt
                </span>
              </div>
            </button>

            {/* OPTION 3: Insert Table (Title Only) */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelectOption(3)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer group"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                <Table2 className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  Insert Table
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Title Only
                </span>
              </div>
            </button>

            {/* OPTION 4: Insert Table (No Title 12pt) */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelectOption(4)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer group"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                <Table2 className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  Insert Table
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  No Title 12pt
                </span>
              </div>
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

export default StandardTablesDropdown;
