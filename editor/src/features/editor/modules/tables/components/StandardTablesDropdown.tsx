/**
 * --------------------------------------------------------------------------
 * Module: Tables
 * Feature: StandardTablesDropdown Component
 * Description:
 * Microsoft Word-style Standard Tables Ribbon Dropdown button and menu.
 * Provides the 6 standard clinical table configurations in exact order:
 * 1. Insert Table (Heading 12pt, Text 12pt)
 * 2. Insert Table (Heading 10pt, Text 10pt)
 * 3. Insert Table (Title Only)
 * 4. Insert Table (No Title 12pt)
 * 5. Split Table (Continue Table Title)
 * 6. Insert Table (History Signature)
 * --------------------------------------------------------------------------
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Table2, ChevronDown } from "lucide-react";
import { useTable } from "../hooks";
import { buildCustomTableHTML } from "./TableInsertDialog";

export function buildHistorySignatureTableHTML(): string {
  const captionHtml = `<p class="doc-table-caption font-bold" style="font-size: 11pt; font-weight: 700; margin: 12px 0 4px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif;">Document Revision History &amp; Signatures</p>`;
  const tableStyle = `border-collapse: collapse; margin: 8px 0; width: 100%; table-layout: fixed; margin-left: 0; margin-right: auto;`;
  const baseCellBorder = `border: 1px solid #8a8886;`;
  const headerCSS = `${baseCellBorder} font-size: 10pt; font-weight: 700; padding: 6px 8px; vertical-align: middle; line-height: 1.15; font-family: Calibri, 'Segoe UI', Arial, sans-serif; background-color: #f3f2f1;`;
  const bodyCSS = `border: 1px solid #a19f9d; font-size: 10pt; font-weight: 400; padding: 6px 8px; vertical-align: middle; line-height: 1.15; font-family: Calibri, 'Segoe UI', Arial, sans-serif;`;

  const headers = [
    { text: "Version", width: "12%" },
    { text: "Effective Date", width: "16%" },
    { text: "Author / Signer", width: "24%" },
    { text: "Role / Signature", width: "20%" },
    { text: "Summary of Changes", width: "28%" },
  ];

  const theadHtml = `<thead><tr>${headers
    .map(
      (h) =>
        `<th style="${headerCSS} width: ${h.width};"><p style="margin:0;padding:0;line-height:1.15;">${h.text}</p></th>`
    )
    .join("")}</tr></thead>`;

  const sampleRows = [
    ["1.0", "15-Jan-2026", "Principal Investigator", "Electronically Signed", "Initial Protocol Approval"],
    ["1.1", "02-Feb-2026", "Lead Biostatistician", "Electronically Signed", "Updated Sample Size Calculations"],
    ["2.0", "10-Mar-2026", "Medical Director", "Pending Signature", "Interim Safety Cohort Update"],
  ];

  let tbodyHtml = "<tbody>";
  sampleRows.forEach((row) => {
    tbodyHtml += "<tr>";
    row.forEach((val, idx) => {
      tbodyHtml += `<td style="${bodyCSS} width: ${headers[idx].width};"><p style="margin:0;padding:0;line-height:1.15;">${val}</p></td>`;
    });
    tbodyHtml += "</tr>";
  });
  tbodyHtml += "</tbody>";

  const tableHtml = `<table class="editor-table editor-table-clinical" data-table="true" style="${tableStyle}">${theadHtml}${tbodyHtml}</table><p><br/></p>`;
  return `${captionHtml}${tableHtml}`;
}

export function StandardTablesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [alignRight, setAlignRight] = useState(false);
  const savedRangeRef = useRef<Range | null>(null);

  const { insertCustomTableHTML, splitCurrentTable } = useTable();

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

        case 5: {
          // OPTION 5: Split Table (Continue Table Title)
          const sel = window.getSelection();
          const targetTable = sel?.anchorNode
            ? (sel.anchorNode.nodeType === Node.ELEMENT_NODE
                ? (sel.anchorNode as HTMLElement)
                : sel.anchorNode.parentElement
              )?.closest("table")
            : null;

          if (targetTable || document.querySelector('[contenteditable="true"] table')) {
            splitCurrentTable();
          } else {
            const contCaption = `<p class="doc-table-caption font-bold" style="font-size: 11pt; font-weight: 700; margin: 12px 0 4px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif;">Table 1: Table Title (Continued)</p>`;
            const tablePart = buildCustomTableHTML({
              rows: 3,
              columns: 3,
              headingSize: "10pt",
              textSize: "10pt",
              titleOption: "without",
              autoFit: true,
            });
            insertCustomTableHTML(`${contCaption}${tablePart}`);
          }
          break;
        }

        case 6: {
          // OPTION 6: Insert Table (History Signature)
          const html = buildHistorySignatureTableHTML();
          insertCustomTableHTML(html);
          break;
        }

        default:
          break;
      }
    },
    [insertCustomTableHTML, restoreSelection, splitCurrentTable]
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

            <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />

            {/* OPTION 5: Split Table (Continue Table Title) */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelectOption(5)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer group"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                <Table2 className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  Split Table
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Continue Table Title
                </span>
              </div>
            </button>

            {/* OPTION 6: Insert Table (History Signature) */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelectOption(6)}
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
                  History Signature
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
