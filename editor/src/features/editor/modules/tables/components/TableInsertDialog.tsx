/**
 * --------------------------------------------------------
 * Module: Tables
 * Feature: TableInsertDialog Component
 * Description:
 * Precision Custom Table Builder Dialog with Live Preview,
 * Heading & Text size typography, Title options, Steppers,
 * and Auto-fit width controls.
 * --------------------------------------------------------
 */

import { useState } from "react";
import { Minus, Plus, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { useEditor } from "@/features/editor/context/EditorContext";
import { useDocumentModel } from "@/features/editor/store/documentModel";

interface TableInsertDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert?: (html: string) => void;
}

export function buildCustomTableHTML(config: {
  rows: number;
  columns: number;
  headingSize: string;
  textSize: string;
  titleOption: "with" | "without" | "only";
  autoFit: boolean;
  tableNumber?: number;
}): string {
  const { rows, columns, headingSize, textSize, titleOption, autoFit, tableNumber = 1 } = config;

  const captionText = `Table ${tableNumber}: Table Title`;
  const captionHtml = `<p class="doc-table-caption font-bold" style="font-size: 11pt; font-weight: 700; margin: 12px 0 4px 0; font-family: Calibri, 'Segoe UI', Arial, sans-serif;">${captionText}</p>`;

  if (titleOption === "only") {
    return captionHtml;
  }

  const widthStyle = autoFit
    ? "width: 100%; table-layout: fixed;"
    : "width: auto; table-layout: auto;";
  const tableStyle = `border-collapse: collapse; margin: 8px 0; ${widthStyle} margin-left: 0; margin-right: auto;`;

  const hSize = headingSize === "auto" ? "10pt" : headingSize;
  const tSize = textSize === "auto" ? "10pt" : textSize;

  const cellWidth = `width: ${100 / columns}%;`;
  const baseCellBorder = `border: 1px solid #8a8886;`;

  const headerCSS = `${baseCellBorder} font-size: ${hSize}; font-weight: 700; padding: 6px 8px; vertical-align: middle; line-height: 1.15; font-family: Calibri, 'Segoe UI', Arial, sans-serif; background-color: #f3f2f1; box-sizing: border-box; min-width: 0; overflow: hidden; word-break: break-word; overflow-wrap: anywhere; ${cellWidth}`;
  const bodyCSS = `border: 1px solid #a19f9d; font-size: ${tSize}; font-weight: 400; padding: 6px 8px; vertical-align: middle; line-height: 1.15; font-family: Calibri, 'Segoe UI', Arial, sans-serif; box-sizing: border-box; min-width: 0; overflow: hidden; word-break: break-word; overflow-wrap: anywhere; ${cellWidth}`;

  // Headers
  const headerCells = Array.from({ length: columns })
    .map(
      () =>
        `<th style="${headerCSS}"><p style="margin:0;padding:0;line-height:1.15;"><br/></p></th>`
    )
    .join("");
  const theadHtml = `<thead><tr>${headerCells}</tr></thead>`;

  // Body
  let tbodyHtml = "<tbody>";
  for (let r = 0; r < rows; r++) {
    tbodyHtml += "<tr>";
    for (let c = 0; c < columns; c++) {
      tbodyHtml += `<td style="${bodyCSS}"><p style="margin:0;padding:0;line-height:1.15;"><br/></p></td>`;
    }
    tbodyHtml += "</tr>";
  }
  tbodyHtml += "</tbody>";

  const tableHtml = `<table class="editor-table editor-table-clinical" data-table="true" style="${tableStyle}">${theadHtml}${tbodyHtml}</table>`;

  if (titleOption === "with") {
    return `${captionHtml}${tableHtml}<p><br/></p>`;
  }

  return `${tableHtml}<p><br/></p>`;
}

export function TableInsertDialog({ open, onClose, onInsert }: TableInsertDialogProps) {
  const { editorRef, insertHTML } = useEditor();
  const { setPageHtml, activePage, model } = useDocumentModel();

  // Config state
  const [headingSize, setHeadingSize] = useState<string>("auto");
  const [textSize, setTextSize] = useState<string>("auto");
  const [titleOption, setTitleOption] = useState<"with" | "without" | "only">("with");
  const [rows, setRows] = useState<number>(5);
  const [rowText, setRowText] = useState<string>("5");
  const [columns, setColumns] = useState<number>(4);
  const [colText, setColText] = useState<string>("4");
  const [autoFit, setAutoFit] = useState<boolean>(true);

  if (!open) return null;

  // Stepper handlers
  const adjustRows = (delta: number) => {
    const current = parseInt(rowText, 10) || rows;
    const next = Math.max(1, Math.min(100, current + delta));
    setRows(next);
    setRowText(String(next));
  };

  const adjustColumns = (delta: number) => {
    const current = parseInt(colText, 10) || columns;
    const next = Math.max(1, Math.min(20, current + delta));
    setColumns(next);
    setColText(String(next));
  };

  const handleRowTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    if (!/^\d*$/.test(text)) return;
    setRowText(text);
    if (text !== "") {
      const val = parseInt(text, 10);
      if (!isNaN(val) && val >= 1 && val <= 100) {
        setRows(val);
      }
    }
  };

  const handleRowBlur = () => {
    let val = parseInt(rowText, 10);
    if (isNaN(val) || val < 1) {
      val = 1;
    } else if (val > 100) {
      val = 100;
    }
    setRows(val);
    setRowText(String(val));
  };

  const handleColTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    if (!/^\d*$/.test(text)) return;
    setColText(text);
    if (text !== "") {
      const val = parseInt(text, 10);
      if (!isNaN(val) && val >= 1 && val <= 20) {
        setColumns(val);
      }
    }
  };

  const handleColBlur = () => {
    let val = parseInt(colText, 10);
    if (isNaN(val) || val < 1) {
      val = 1;
    } else if (val > 20) {
      val = 20;
    }
    setColumns(val);
    setColText(String(val));
  };

  const handleInsert = () => {
    let existingTables = 0;
    if (typeof document !== 'undefined') {
      existingTables = document.querySelectorAll('table[data-table="true"], table.editor-table').length;
    }
    const tableNumber = existingTables + 1;

    const html = buildCustomTableHTML({
      rows,
      columns,
      headingSize,
      textSize,
      titleOption,
      autoFit,
      tableNumber,
    });

    if (onInsert) {
      onInsert(html);
    } else {
      const pageId = activePage || model.pages[0]?.id;
      const pageSection = pageId ? document.querySelector(`section[data-page-id="${pageId}"]`) : null;
      const editable =
        (pageSection?.querySelector('[contenteditable="true"]') as HTMLElement | null) ||
        editorRef.current ||
        (document.querySelector('[contenteditable="true"]') as HTMLElement | null);

      if (editable) {
        editable.focus();
        const sel = window.getSelection();
        let inserted = false;
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          if (editable.contains(range.commonAncestorContainer)) {
            document.execCommand("insertHTML", false, html);
            inserted = true;
          }
        }
        if (!inserted) {
          editable.insertAdjacentHTML("beforeend", html);
        }
        editable.dispatchEvent(new Event("input", { bubbles: true }));
        if (pageId && setPageHtml) {
          setPageHtml(pageId, editable.innerHTML);
        }
      } else if (insertHTML) {
        insertHTML(html);
      }
    }
    onClose();
  };

  const getFontSizeStyle = (sz: string) => {
    if (sz === "auto") return "11px";
    return sz;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="w-full max-w-4xl rounded-xl border border-secondary bg-card shadow-2xl overflow-hidden dark:border-muted dark:bg-[#0c1929] flex flex-col max-h-[90vh]">
        {/* Main Grid: Left Settings (5 cols) & Right Preview (7 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 overflow-y-auto">
          {/* Settings Panel (Left Column) */}
          <div className="md:col-span-5 space-y-4">
            <div className="pb-1">
              <h3 className="text-xs font-bold text-foreground dark:text-muted uppercase tracking-wider">
                TABLE SETTINGS
              </h3>
            </div>

            {/* Heading Size */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground dark:text-muted-foreground">
                Heading Size
              </Label>
              <div className="relative">
                <select
                  value={headingSize}
                  onChange={(e) => setHeadingSize(e.target.value)}
                  className="w-full h-9 text-xs rounded-md border border-border dark:border-secondary-foreground bg-card dark:bg-secondary px-3 pr-8 text-foreground dark:text-muted-foreground shadow-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand appearance-none cursor-pointer"
                >
                  <option value="auto">Auto (Recommended)</option>
                  <option value="8pt">8pt</option>
                  <option value="9pt">9pt</option>
                  <option value="10pt">10pt</option>
                  <option value="11pt">11pt</option>
                  <option value="12pt">12pt</option>
                  <option value="14pt">14pt</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Text Size */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground dark:text-muted-foreground">
                Text Size
              </Label>
              <div className="relative">
                <select
                  value={textSize}
                  onChange={(e) => setTextSize(e.target.value)}
                  className="w-full h-9 text-xs rounded-md border border-border dark:border-secondary-foreground bg-card dark:bg-secondary px-3 pr-8 text-foreground dark:text-muted-foreground shadow-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand appearance-none cursor-pointer"
                >
                  <option value="auto">Auto (Recommended)</option>
                  <option value="8pt">8pt</option>
                  <option value="9pt">9pt</option>
                  <option value="10pt">10pt</option>
                  <option value="11pt">11pt</option>
                  <option value="12pt">12pt</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Title Option */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground dark:text-muted-foreground">
                Title Option
              </Label>
              <div className="relative">
                <select
                  value={titleOption}
                  onChange={(e) =>
                    setTitleOption(e.target.value as "with" | "without" | "only")
                  }
                  className="w-full h-9 text-xs rounded-md border border-border dark:border-secondary-foreground bg-card dark:bg-secondary px-3 pr-8 text-foreground dark:text-muted-foreground shadow-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand appearance-none cursor-pointer"
                >
                  <option value="with">With Title</option>
                  <option value="without">Without Title</option>
                  <option value="only">Title Only</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Rows Stepper */}
            <div className="flex items-center justify-between border-t border-muted dark:border-muted pt-3">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground dark:text-muted-foreground">
                  Rows
                </span>
                <span className="text-[10px] text-muted0">Range: 1 – 100</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustRows(-1)}
                  disabled={rows <= 1}
                  className="h-8 w-8 rounded-full border border-border dark:border-secondary-foreground bg-card dark:bg-muted hover:bg-muted dark:hover:bg-secondary-foreground disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5 text-secondary-foreground dark:text-muted-foreground" />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={rowText}
                  onChange={handleRowTextChange}
                  onBlur={handleRowBlur}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      adjustRows(1);
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      adjustRows(-1);
                    } else if (e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-12 h-8 text-xs text-center font-semibold border border-border dark:border-secondary-foreground rounded-md bg-card dark:bg-secondary text-foreground dark:text-muted-foreground outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                />
                <button
                  type="button"
                  onClick={() => adjustRows(1)}
                  disabled={rows >= 100}
                  className="h-8 w-8 rounded-full border border-border dark:border-secondary-foreground bg-card dark:bg-muted hover:bg-muted dark:hover:bg-secondary-foreground disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 text-secondary-foreground dark:text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Columns Stepper */}
            <div className="flex items-center justify-between border-t border-muted dark:border-muted pt-3">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground dark:text-muted-foreground">
                  Columns
                </span>
                <span className="text-[10px] text-muted0">Range: 1 – 20</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustColumns(-1)}
                  disabled={columns <= 1}
                  className="h-8 w-8 rounded-full border border-border dark:border-secondary-foreground bg-card dark:bg-muted hover:bg-muted dark:hover:bg-secondary-foreground disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5 text-secondary-foreground dark:text-muted-foreground" />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={colText}
                  onChange={handleColTextChange}
                  onBlur={handleColBlur}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      adjustColumns(1);
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      adjustColumns(-1);
                    } else if (e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-12 h-8 text-xs text-center font-semibold border border-border dark:border-secondary-foreground rounded-md bg-card dark:bg-secondary text-foreground dark:text-muted-foreground outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                />
                <button
                  type="button"
                  onClick={() => adjustColumns(1)}
                  disabled={columns >= 20}
                  className="h-8 w-8 rounded-full border border-border dark:border-secondary-foreground bg-card dark:bg-muted hover:bg-muted dark:hover:bg-secondary-foreground disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 text-secondary-foreground dark:text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Auto Fit to Page Width */}
            <div className="flex items-center justify-between border-t border-muted dark:border-muted pt-3">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground dark:text-muted-foreground">
                  Auto Fit to Page Width
                </span>
                <span className="text-[10px] text-muted0">
                  Stretch table fully to margins
                </span>
              </div>
              <Switch
                checked={autoFit}
                onCheckedChange={setAutoFit}
                className="data-[state=checked]:bg-brand"
              />
            </div>
          </div>

          {/* Live Preview Panel (Right Column) */}
          <div className="md:col-span-7 flex flex-col">
            <div className="pb-1 mb-2">
              <h3 className="text-xs font-bold text-foreground dark:text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-destructive" />
                <span>PREVIEW</span>
              </h3>
            </div>

            {/* Page Sheet Container */}
            <div className="flex-1 bg-muted dark:bg-secondary/60 border border-secondary dark:border-muted rounded-lg p-6 flex items-center justify-center min-h-85 select-none">
              <div className="w-full bg-card dark:bg-muted shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-secondary dark:border-secondary-foreground p-6 rounded-md min-h-60 flex flex-col justify-start">
                {/* Caption Preview */}
                {(titleOption === "with" || titleOption === "only") && (
                  <p className="font-bold text-xs text-foreground dark:text-primary-foreground leading-tight mb-3">
                    Table 1: Table Title
                  </p>
                )}

                {/* Table Preview */}
                {titleOption !== "only" && (
                  <div className="overflow-x-auto w-full">
                    <table
                      className="border-collapse text-foreground dark:text-muted-foreground font-sans"
                      style={{
                        width: autoFit ? "100%" : "auto",
                        minWidth: autoFit ? "100%" : "60%",
                      }}
                    >
                      <thead>
                        <tr>
                          {Array.from({ length: columns }).map((_, i) => (
                            <th
                              key={i}
                              className="border border-[#8a8886] bg-muted dark:bg-secondary-foreground/60 px-2.5 py-2 text-left font-bold text-foreground dark:text-muted"
                              style={{
                                fontSize: getFontSizeStyle(headingSize),
                                width: `${100 / columns}%`,
                              }}
                            ></th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: Math.min(5, rows) }).map((_, rIdx) => (
                          <tr key={rIdx}>
                            {Array.from({ length: columns }).map((_, cIdx) => (
                              <td
                                key={cIdx}
                                className="border border-[#a19f9d] dark:border-secondary-foreground px-2.5 py-2.5 text-secondary-foreground dark:text-muted-foreground"
                                style={{
                                  fontSize: getFontSizeStyle(textSize),
                                  width: `${100 / columns}%`,
                                }}
                              >
                                &nbsp;
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {rows > 5 && (
                      <div className="text-[10px] text-center text-muted-foreground italic mt-2.5">
                        ... and {rows - 5} more row(s)
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3 bg-muted dark:bg-secondary border-t border-secondary dark:border-muted">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-8 px-4 text-xs font-semibold border-border dark:border-secondary-foreground bg-card dark:bg-muted hover:bg-muted dark:hover:bg-secondary-foreground text-secondary-foreground dark:text-muted-foreground rounded-md transition-colors"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleInsert}
            className="h-8 px-5 text-xs font-semibold bg-brand hover:bg-brand active:bg-brand-deep text-primary-foreground rounded-md transition-colors shadow-sm"
          >
            Insert Table
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TableInsertDialog;
