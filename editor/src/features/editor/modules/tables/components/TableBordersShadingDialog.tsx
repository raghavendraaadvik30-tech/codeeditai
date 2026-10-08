/**
 * --------------------------------------------------------------------------
 * Module: Tables
 * Feature: TableBordersShadingDialog Component
 * Description:
 * Microsoft Word-style Borders & Shading dialog specifically for tables and cells.
 * Supports setting borders (All, Box/Outside, Inside, None, Custom), line styles,
 * colors, widths, and cell background shading for the active table or cell.
 * --------------------------------------------------------------------------
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";

interface TableBordersShadingDialogProps {
  open: boolean;
  onClose: () => void;
  table: HTMLTableElement | null;
  cell: HTMLTableCellElement | null;
  onApplied?: () => void;
}

const PRESET_COLORS = [
  { name: "Automatic (Black)", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Gray", hex: "#6B7280" },
  { name: "Light Slate", hex: "#CBD5E1" },
  { name: "Red", hex: "#EF4444" },
  { name: "Blue", hex: "#2563EB" },
  { name: "Emerald", hex: "#10B981" },
  { name: "Amber", hex: "#F59E0B" },
];

const SHADING_COLORS = [
  { name: "No Color", hex: "transparent" },
  { name: "Light Gray", hex: "#F1F5F9" },
  { name: "Slate 100", hex: "#E2E8F0" },
  { name: "Light Blue", hex: "#EFF6FF" },
  { name: "Ice Blue", hex: "#E0F2FE" },
  { name: "Light Green", hex: "#ECFDF5" },
  { name: "Light Amber", hex: "#FEF3C7" },
  { name: "Light Rose", hex: "#FFE4E6" },
];

export function TableBordersShadingDialog({
  open,
  onClose,
  table,
  cell,
  onApplied,
}: TableBordersShadingDialogProps) {
  const [activeTab, setActiveTab] = useState<"borders" | "shading">("borders");
  const [borderSetting, setBorderSetting] = useState<"all" | "box" | "inside" | "none" | "custom">("all");
  const [borderStyle, setBorderStyle] = useState<"solid" | "dashed" | "dotted" | "double">("solid");
  const [borderColor, setBorderColor] = useState<string>("#cbd5e1");
  const [borderWidth, setBorderWidth] = useState<number>(1);
  const [shadingColor, setShadingColor] = useState<string>("transparent");
  const [applyTo, setApplyTo] = useState<"cell" | "table">("cell");

  // Read current cell/table styles when dialog opens
  useEffect(() => {
    if (!open) return;

    if (cell) {
      setShadingColor(cell.style.backgroundColor || "transparent");
      if (cell.style.borderColor) {
        setBorderColor(cell.style.borderColor);
      }
    } else if (table) {
      const firstCell = table.querySelector("td, th") as HTMLTableCellElement | null;
      if (firstCell) {
        setShadingColor(firstCell.style.backgroundColor || "transparent");
        if (firstCell.style.borderColor) {
          setBorderColor(firstCell.style.borderColor);
        }
      }
    }
  }, [open, cell, table]);

  const handleApply = () => {
    if (!table && !cell) {
      onClose();
      return;
    }

    const borderCss =
      borderSetting === "none"
        ? "none"
        : `${borderWidth}px ${borderStyle} ${borderColor}`;

    const targetCells: HTMLTableCellElement[] = [];

    if (applyTo === "cell" && cell) {
      targetCells.push(cell);
    } else if (table) {
      const cells = Array.from(table.querySelectorAll("td, th")) as HTMLTableCellElement[];
      targetCells.push(...cells);
    }

    targetCells.forEach((c) => {
      // 1. Shading
      if (shadingColor === "transparent") {
        c.style.backgroundColor = "";
      } else {
        c.style.backgroundColor = shadingColor;
      }

      // 2. Borders
      if (borderSetting === "all") {
        c.style.border = borderCss;
      } else if (borderSetting === "none") {
        c.style.border = "none";
      } else if (borderSetting === "box") {
        if (applyTo === "cell") {
          c.style.border = borderCss;
        } else if (table) {
          // Perimeter cells receive outer borders
          const rows = Array.from(table.rows);
          const firstRow = rows[0];
          const lastRow = rows[rows.length - 1];
          const tr = c.closest("tr");
          const isTop = tr === firstRow;
          const isBottom = tr === lastRow;
          const isLeft = c.cellIndex === 0;
          const isRight = tr ? c.cellIndex === tr.cells.length - 1 : false;

          c.style.borderTop = isTop ? borderCss : "none";
          c.style.borderBottom = isBottom ? borderCss : "none";
          c.style.borderLeft = isLeft ? borderCss : "none";
          c.style.borderRight = isRight ? borderCss : "none";
        }
      } else if (borderSetting === "inside") {
        if (table && applyTo === "table") {
          const rows = Array.from(table.rows);
          const firstRow = rows[0];
          const lastRow = rows[rows.length - 1];
          const tr = c.closest("tr");
          const isTop = tr === firstRow;
          const isBottom = tr === lastRow;
          const isLeft = c.cellIndex === 0;
          const isRight = tr ? c.cellIndex === tr.cells.length - 1 : false;

          c.style.borderTop = isTop ? "none" : borderCss;
          c.style.borderBottom = isBottom ? "none" : borderCss;
          c.style.borderLeft = isLeft ? "none" : borderCss;
          c.style.borderRight = isRight ? "none" : borderCss;
        } else {
          c.style.border = borderCss;
        }
      }
    });

    // Notify contentEditable container of DOM change
    const targetElement = cell || table;
    const editable = targetElement?.closest('[contenteditable="true"]') as HTMLElement | null;
    if (editable) {
      editable.dispatchEvent(new Event("input", { bubbles: true }));
    }

    onApplied?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-[540px] p-0 overflow-hidden bg-card dark:bg-secondary rounded-xl border border-secondary dark:border-muted shadow-2xl">
        <DialogHeader className="px-5 py-3.5 border-b border-muted dark:border-muted flex flex-row items-center justify-between">
          <DialogTitle className="text-sm font-semibold text-foreground dark:text-muted">
            Table Borders and Shading
          </DialogTitle>
        </DialogHeader>

        {/* Tab Switcher */}
        <div className="flex border-b border-secondary dark:border-muted bg-muted/60 dark:bg-secondary/40 px-5 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("borders")}
            className={`px-4 py-1.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === "borders"
                ? "border-primary text-primary dark:border-primary dark:text-primary"
                : "border-transparent text-muted0 hover:text-foreground dark:text-muted-foreground"
            }`}
          >
            Borders
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("shading")}
            className={`px-4 py-1.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === "shading"
                ? "border-primary text-primary dark:border-primary dark:text-primary"
                : "border-transparent text-muted0 hover:text-foreground dark:text-muted-foreground"
            }`}
          >
            Shading
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
          {activeTab === "borders" ? (
            <div className="space-y-4">
              {/* Border Setting Options */}
              <div>
                <Label className="text-xs font-semibold text-secondary-foreground dark:text-muted-foreground mb-1.5 block">
                  Setting
                </Label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(
                    [
                      { id: "all", label: "All" },
                      { id: "box", label: "Box" },
                      { id: "inside", label: "Inside" },
                      { id: "none", label: "None" },
                      { id: "custom", label: "Custom" },
                    ] as const
                  ).map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setBorderSetting(id)}
                      className={`h-8 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        borderSetting === id
                          ? "bg-primary/10 border-primary text-primary/90 dark:bg-blue-950/50 dark:border-primary dark:text-primary/30"
                          : "border-secondary bg-card text-secondary-foreground hover:bg-muted dark:border-muted dark:bg-secondary dark:text-muted-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style, Width, and Color */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold text-secondary-foreground dark:text-muted-foreground mb-1 block">
                    Style
                  </Label>
                  <select
                    value={borderStyle}
                    onChange={(e) =>
                      setBorderStyle(e.target.value as "solid" | "dashed" | "dotted" | "double")
                    }
                    className="w-full h-8 px-2.5 rounded-lg border border-secondary dark:border-secondary-foreground bg-card dark:bg-muted text-xs text-foreground dark:text-muted-foreground outline-none"
                  >
                    <option value="solid">───── Solid</option>
                    <option value="dashed">- - - - - Dashed</option>
                    <option value="dotted">········· Dotted</option>
                    <option value="double">═════ Double</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-secondary-foreground dark:text-muted-foreground mb-1 block">
                    Width
                  </Label>
                  <select
                    value={borderWidth}
                    onChange={(e) => setBorderWidth(parseInt(e.target.value, 10))}
                    className="w-full h-8 px-2.5 rounded-lg border border-secondary dark:border-secondary-foreground bg-card dark:bg-muted text-xs text-foreground dark:text-muted-foreground outline-none"
                  >
                    <option value={1}>1/2 pt (1px)</option>
                    <option value={2}>1 pt (2px)</option>
                    <option value={3}>1 1/2 pt (3px)</option>
                    <option value={4}>2 1/4 pt (4px)</option>
                  </select>
                </div>
              </div>

              {/* Border Color */}
              <div>
                <Label className="text-xs font-semibold text-secondary-foreground dark:text-muted-foreground mb-1.5 block">
                  Color
                </Label>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.name}
                      onClick={() => setBorderColor(c.hex)}
                      className={`h-5 w-5 rounded-full border transition-transform hover:scale-110 cursor-pointer ${
                        borderColor.toLowerCase() === c.hex.toLowerCase()
                          ? "ring-2 ring-primary scale-110"
                          : "border-border dark:border-secondary-foreground"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="h-7 w-9 rounded border border-secondary cursor-pointer"
                  />
                  <input
                    type="text"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="h-7 w-28 px-2 rounded border border-secondary dark:border-secondary-foreground text-xs font-mono bg-card dark:bg-muted text-foreground dark:text-muted-foreground"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Shading / Fill Color */}
              <div>
                <Label className="text-xs font-semibold text-secondary-foreground dark:text-muted-foreground mb-1.5 block">
                  Fill Shading
                </Label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {SHADING_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setShadingColor(c.hex)}
                      className={`flex items-center gap-2 p-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                        shadingColor.toLowerCase() === c.hex.toLowerCase()
                          ? "ring-2 ring-primary border-primary bg-primary/40 dark:bg-blue-950/40"
                          : "border-secondary bg-card dark:border-muted dark:bg-muted"
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-xs border border-border dark:border-secondary-foreground shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[11px] truncate text-secondary-foreground dark:text-muted-foreground">
                        {c.name}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-[11px] text-muted0">Custom Color:</Label>
                  <input
                    type="color"
                    value={shadingColor === "transparent" ? "#ffffff" : shadingColor}
                    onChange={(e) => setShadingColor(e.target.value)}
                    className="h-7 w-9 rounded border border-secondary cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setShadingColor("transparent")}
                    className="h-7 px-2.5 rounded border border-secondary dark:border-secondary-foreground text-[11px] text-secondary-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-muted"
                  >
                    Clear Fill
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Apply To Scope */}
          <div className="border-t border-muted dark:border-muted pt-3">
            <Label className="text-xs font-semibold text-secondary-foreground dark:text-muted-foreground mb-1 block">
              Apply To
            </Label>
            <select
              value={applyTo}
              onChange={(e) => setApplyTo(e.target.value as "cell" | "table")}
              className="w-full h-8 px-2.5 rounded-lg border border-secondary dark:border-secondary-foreground bg-card dark:bg-muted text-xs text-foreground dark:text-muted-foreground outline-none"
            >
              <option value="cell">Selected Cell</option>
              <option value="table">Whole Table</option>
            </select>
          </div>
        </div>

        <DialogFooter className="px-5 py-3 border-t border-muted dark:border-muted bg-muted/70 dark:bg-secondary/50 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleApply}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TableBordersShadingDialog;
