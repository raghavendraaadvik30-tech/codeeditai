/**
 * --------------------------------------------------------------------------
 * Module: Tables
 * Feature: TablePropertiesDialog Component
 * Description:
 * Microsoft Word-style Table Properties dialog. Provides alignment,
 * preferred width, cell padding, and structural metadata for the active table.
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

interface TablePropertiesDialogProps {
  open: boolean;
  onClose: () => void;
  table: HTMLTableElement | null;
  onApplied?: () => void;
}

export function TablePropertiesDialog({
  open,
  onClose,
  table,
  onApplied,
}: TablePropertiesDialogProps) {
  const [alignment, setAlignment] = useState<"left" | "center" | "right">("left");
  const [widthMode, setWidthMode] = useState<"100%" | "auto" | "custom">("100%");
  const [customWidthPx, setCustomWidthPx] = useState<number>(600);
  const [cellPadding, setCellPadding] = useState<number>(8);
  const [rowCount, setRowCount] = useState<number>(0);
  const [colCount, setColCount] = useState<number>(0);

  useEffect(() => {
    if (!open || !table) return;

    // Detect alignment from table margins or parent style
    const mLeft = table.style.marginLeft;
    const mRight = table.style.marginRight;
    if (mLeft === "auto" && mRight === "auto") {
      setAlignment("center");
    } else if (mLeft === "auto") {
      setAlignment("right");
    } else {
      setAlignment("left");
    }

    // Detect width mode
    const curWidth = table.style.width;
    if (curWidth === "100%") {
      setWidthMode("100%");
    } else if (curWidth === "auto" || !curWidth) {
      setWidthMode("auto");
    } else if (curWidth.endsWith("px")) {
      setWidthMode("custom");
      setCustomWidthPx(parseInt(curWidth, 10) || 600);
    } else {
      setWidthMode("100%");
    }

    // Detect cell padding from first cell
    const firstCell = table.querySelector("td, th") as HTMLTableCellElement | null;
    if (firstCell && firstCell.style.padding) {
      const match = firstCell.style.padding.match(/(\d+)px/);
      if (match) {
        setCellPadding(parseInt(match[1], 10));
      }
    }

    // Measure table dimensions
    setRowCount(table.rows.length);
    if (table.rows.length > 0) {
      setColCount(Math.max(...Array.from(table.rows).map((r) => r.cells.length)));
    }
  }, [open, table]);

  const handleApply = () => {
    if (!table) {
      onClose();
      return;
    }

    // 1. Table Alignment
    if (alignment === "center") {
      table.style.marginLeft = "auto";
      table.style.marginRight = "auto";
    } else if (alignment === "right") {
      table.style.marginLeft = "auto";
      table.style.marginRight = "0";
    } else {
      table.style.marginLeft = "0";
      table.style.marginRight = "auto";
    }

    // 2. Table Width
    if (widthMode === "100%") {
      table.style.width = "100%";
      table.style.tableLayout = "fixed";
    } else if (widthMode === "auto") {
      table.style.width = "auto";
      table.style.tableLayout = "auto";
    } else {
      table.style.width = `${customWidthPx}px`;
      table.style.tableLayout = "fixed";
    }

    // 3. Cell Padding
    const allCells = table.querySelectorAll<HTMLTableCellElement>("td, th");
    allCells.forEach((c) => {
      c.style.padding = `${cellPadding}px ${Math.round(cellPadding * 1.5)}px`;
    });

    // Notify contentEditable container of DOM change
    const editable = table.closest('[contenteditable="true"]') as HTMLElement | null;
    if (editable) {
      editable.dispatchEvent(new Event("input", { bubbles: true }));
    }

    onApplied?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-[460px] p-0 overflow-hidden bg-card dark:bg-secondary rounded-xl border border-secondary dark:border-muted shadow-2xl">
        <DialogHeader className="px-5 py-3.5 border-b border-muted dark:border-muted flex flex-row items-center justify-between">
          <DialogTitle className="text-sm font-semibold text-foreground dark:text-muted">
            Table Properties
          </DialogTitle>
        </DialogHeader>

        <div className="p-5 space-y-4 text-xs">
          {/* Alignment */}
          <div>
            <Label className="text-xs font-semibold text-secondary-foreground dark:text-muted-foreground mb-1.5 block">
              Alignment
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: "left", label: "Left" },
                  { id: "center", label: "Center" },
                  { id: "right", label: "Right" },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAlignment(id)}
                  className={`h-8 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    alignment === id
                      ? "bg-primary/10 border-primary/100 text-primary/90 dark:bg-blue-950/50 dark:border-primary dark:text-primary/30"
                      : "border-secondary bg-card text-secondary-foreground hover:bg-muted dark:border-muted dark:bg-secondary dark:text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Width */}
          <div>
            <Label className="text-xs font-semibold text-secondary-foreground dark:text-muted-foreground mb-1.5 block">
              Preferred Width
            </Label>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setWidthMode("100%")}
                  className={`h-8 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    widthMode === "100%"
                      ? "bg-primary/10 border-primary/100 text-primary/90 dark:bg-blue-950/50 dark:border-primary dark:text-primary/30"
                      : "border-secondary bg-card text-secondary-foreground hover:bg-muted dark:border-muted dark:bg-secondary dark:text-muted-foreground"
                  }`}
                >
                  100% (Page)
                </button>
                <button
                  type="button"
                  onClick={() => setWidthMode("auto")}
                  className={`h-8 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    widthMode === "auto"
                      ? "bg-primary/10 border-primary/100 text-primary/90 dark:bg-blue-950/50 dark:border-primary dark:text-primary/30"
                      : "border-secondary bg-card text-secondary-foreground hover:bg-muted dark:border-muted dark:bg-secondary dark:text-muted-foreground"
                  }`}
                >
                  Auto Fit
                </button>
                <button
                  type="button"
                  onClick={() => setWidthMode("custom")}
                  className={`h-8 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                    widthMode === "custom"
                      ? "bg-primary/10 border-primary/100 text-primary/90 dark:bg-blue-950/50 dark:border-primary dark:text-primary/30"
                      : "border-secondary bg-card text-secondary-foreground hover:bg-muted dark:border-muted dark:bg-secondary dark:text-muted-foreground"
                  }`}
                >
                  Custom
                </button>
              </div>

              {widthMode === "custom" && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-muted0">Width (px):</span>
                  <input
                    type="number"
                    min={100}
                    max={1200}
                    value={customWidthPx}
                    onChange={(e) => setCustomWidthPx(Math.max(100, parseInt(e.target.value, 10) || 600))}
                    className="w-24 h-7 px-2 rounded border border-secondary dark:border-secondary-foreground text-xs bg-card dark:bg-muted text-foreground dark:text-muted-foreground"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Cell Padding */}
          <div>
            <Label className="text-xs font-semibold text-secondary-foreground dark:text-muted-foreground mb-1.5 block">
              Cell Padding (Margins)
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={2}
                max={20}
                value={cellPadding}
                onChange={(e) => setCellPadding(parseInt(e.target.value, 10))}
                className="flex-1 accent-primary cursor-pointer"
              />
              <span className="w-12 text-right font-mono text-[11px] text-secondary-foreground dark:text-muted-foreground">
                {cellPadding} px
              </span>
            </div>
          </div>

          {/* Table Summary Info */}
          <div className="rounded-lg border border-muted dark:border-muted bg-muted/70 dark:bg-secondary/50 p-2.5 flex items-center justify-between text-[11px] text-muted0 dark:text-muted-foreground">
            <span>Rows: <strong className="text-secondary-foreground dark:text-muted-foreground">{rowCount}</strong></span>
            <span>Columns: <strong className="text-secondary-foreground dark:text-muted-foreground">{colCount}</strong></span>
            <span>Layout: <strong className="text-secondary-foreground dark:text-muted-foreground">{table?.style.tableLayout || "fixed"}</strong></span>
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

export default TablePropertiesDialog;
