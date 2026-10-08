/**
 * --------------------------------------------------------
 * Module: Tables
 * Feature: TableActionsToolbar Component
 * Description:
 * Quick table manipulation toolbar providing row/column additions,
 * deletions, cell merge/split, table split/merge, and table cleanup.
 * --------------------------------------------------------
 */

import {
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  Trash2,
  Rows,
  Columns,
  Merge,
  Split,
  Scissors,
  Combine,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown,
  MoveVertical,
  RotateCw,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useTable } from "../hooks";
import { cn } from "@/lib/utils";

export function TableActionsToolbar() {
  const {
    insertRowAbove,
    insertRowBelow,
    insertColLeft,
    insertColRight,
    deleteCurrentRow,
    deleteCurrentCol,
    deleteCurrentTable,
    mergeCells,
    splitCell,
    splitCurrentTable,
    mergeWithNextTable,
    setCellHorizontalAlign,
    setCellVerticalAlign,
    toggleCellTextDirection,
    activeCellFormat,
    autoFitWindow,
    autoFitContent,
  } = useTable();

  return (
    <div className="rounded-xl border border-secondary/80 bg-card p-3 shadow-sm dark:border-muted/80 dark:bg-[#091524] space-y-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Table Actions (Active Selection)
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertRowAbove}
          className="flex items-center gap-2 rounded-lg border border-muted bg-muted/70 px-2.5 py-1.5 text-xs text-secondary-foreground hover:bg-muted dark:border-muted dark:bg-secondary/60 dark:text-muted-foreground transition-colors"
        >
          <ArrowUpToLine className="h-3.5 w-3.5 text-primary" />
          <span>Row Above</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertRowBelow}
          className="flex items-center gap-2 rounded-lg border border-muted bg-muted/70 px-2.5 py-1.5 text-xs text-secondary-foreground hover:bg-muted dark:border-muted dark:bg-secondary/60 dark:text-muted-foreground transition-colors"
        >
          <ArrowDownToLine className="h-3.5 w-3.5 text-primary" />
          <span>Row Below</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertColLeft}
          className="flex items-center gap-2 rounded-lg border border-muted bg-muted/70 px-2.5 py-1.5 text-xs text-secondary-foreground hover:bg-muted dark:border-muted dark:bg-secondary/60 dark:text-muted-foreground transition-colors"
        >
          <ArrowLeftToLine className="h-3.5 w-3.5 text-primary" />
          <span>Col Left</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertColRight}
          className="flex items-center gap-2 rounded-lg border border-muted bg-muted/70 px-2.5 py-1.5 text-xs text-secondary-foreground hover:bg-muted dark:border-muted dark:bg-secondary/60 dark:text-muted-foreground transition-colors"
        >
          <ArrowRightToLine className="h-3.5 w-3.5 text-primary" />
          <span>Col Right</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={deleteCurrentRow}
          className="flex items-center gap-2 rounded-lg border border-muted bg-muted/70 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 dark:border-muted dark:bg-secondary/60 dark:text-destructive transition-colors"
        >
          <Rows className="h-3.5 w-3.5" />
          <span>Delete Row</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={deleteCurrentCol}
          className="flex items-center gap-2 rounded-lg border border-muted bg-muted/70 px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 dark:border-muted dark:bg-secondary/60 dark:text-destructive transition-colors"
        >
          <Columns className="h-3.5 w-3.5" />
          <span>Delete Col</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={mergeCells}
          className="flex items-center gap-2 rounded-lg border border-muted bg-muted/70 px-2.5 py-1.5 text-xs text-secondary-foreground hover:bg-muted dark:border-muted dark:bg-secondary/60 dark:text-muted-foreground transition-colors"
        >
          <Merge className="h-3.5 w-3.5 text-success-500" />
          <span>Merge Cells</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={splitCell}
          className="flex items-center gap-2 rounded-lg border border-muted bg-muted/70 px-2.5 py-1.5 text-xs text-secondary-foreground hover:bg-muted dark:border-muted dark:bg-secondary/60 dark:text-muted-foreground transition-colors"
        >
          <Split className="h-3.5 w-3.5 text-warning-500" />
          <span>Split Cell</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={splitCurrentTable}
          className="flex items-center gap-2 rounded-lg border border-purple-200/70 bg-purple-50/50 px-2.5 py-1.5 text-xs text-purple-700 hover:bg-purple-100 dark:border-purple-900/60 dark:bg-purple-950/30 dark:text-purple-300 transition-colors"
        >
          <Scissors className="h-3.5 w-3.5 text-purple-500" />
          <span>Split Table</span>
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={mergeWithNextTable}
          className="flex items-center gap-2 rounded-lg border border-primary/70 bg-primary/50 px-2.5 py-1.5 text-xs text-primary/90 hover:bg-primary/15 dark:border-primary/60 dark:bg-primary/30 dark:text-primary transition-colors"
        >
          <Combine className="h-3.5 w-3.5 text-primary" />
          <span>Merge Table</span>
        </button>
      </div>

      {/* -----------------------------------------------------------
          CELL ALIGNMENT & ORIENTATION CONTROLS (Word-style)
          ----------------------------------------------------------- */}
      <div className="border-t border-muted pt-2.5 dark:border-muted space-y-2.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Cell Alignment & Orientation
        </div>

        {/* Horizontal Alignment */}
        <div className="space-y-1">
          <div className="text-[10px] font-medium text-muted0 dark:text-muted-foreground">Horizontal Align</div>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setCellHorizontalAlign("left")}
              className={cn(
                "flex h-8 items-center justify-center gap-1 rounded-md border text-xs font-medium transition-colors",
                activeCellFormat?.horizontalAlign === "left"
                  ? "border-primary bg-primary/10 text-primary/90 font-semibold dark:border-primary dark:bg-navy-950/60 dark:text-navy-300 shadow-xs"
                  : "border-secondary bg-muted text-secondary-foreground hover:bg-muted dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground"
              )}
              title="Align Left"
            >
              <AlignLeft className="h-3.5 w-3.5" />
              <span>Left</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setCellHorizontalAlign("center")}
              className={cn(
                "flex h-8 items-center justify-center gap-1 rounded-md border text-xs font-medium transition-colors",
                activeCellFormat?.horizontalAlign === "center"
                  ? "border-primary bg-primary/10 text-primary/90 font-semibold dark:border-primary dark:bg-navy-950/60 dark:text-navy-300 shadow-xs"
                  : "border-secondary bg-muted text-secondary-foreground hover:bg-muted dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground"
              )}
              title="Align Center"
            >
              <AlignCenter className="h-3.5 w-3.5" />
              <span>Center</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setCellHorizontalAlign("right")}
              className={cn(
                "flex h-8 items-center justify-center gap-1 rounded-md border text-xs font-medium transition-colors",
                activeCellFormat?.horizontalAlign === "right"
                  ? "border-primary bg-primary/10 text-primary/90 font-semibold dark:border-primary dark:bg-navy-950/60 dark:text-navy-300 shadow-xs"
                  : "border-secondary bg-muted text-secondary-foreground hover:bg-muted dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground"
              )}
              title="Align Right"
            >
              <AlignRight className="h-3.5 w-3.5" />
              <span>Right</span>
            </button>
          </div>
        </div>

        {/* Vertical Alignment */}
        <div className="space-y-1">
          <div className="text-[10px] font-medium text-muted0 dark:text-muted-foreground">Vertical Align</div>
          <div className="grid grid-cols-3 gap-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setCellVerticalAlign("top")}
              className={cn(
                "flex h-8 items-center justify-center gap-1 rounded-md border text-xs font-medium transition-colors",
                activeCellFormat?.verticalAlign === "top"
                  ? "border-primary bg-primary/10 text-primary/90 font-semibold dark:border-primary dark:bg-navy-950/60 dark:text-navy-300 shadow-xs"
                  : "border-secondary bg-muted text-secondary-foreground hover:bg-muted dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground"
              )}
              title="Align Top"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              <span>Top</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setCellVerticalAlign("middle")}
              className={cn(
                "flex h-8 items-center justify-center gap-1 rounded-md border text-xs font-medium transition-colors",
                activeCellFormat?.verticalAlign === "middle"
                  ? "border-primary bg-primary/10 text-primary/90 font-semibold dark:border-primary dark:bg-navy-950/60 dark:text-navy-300 shadow-xs"
                  : "border-secondary bg-muted text-secondary-foreground hover:bg-muted dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground"
              )}
              title="Align Middle (Center)"
            >
              <MoveVertical className="h-3.5 w-3.5" />
              <span>Middle</span>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setCellVerticalAlign("bottom")}
              className={cn(
                "flex h-8 items-center justify-center gap-1 rounded-md border text-xs font-medium transition-colors",
                activeCellFormat?.verticalAlign === "bottom"
                  ? "border-primary bg-primary/10 text-primary/90 font-semibold dark:border-primary dark:bg-navy-950/60 dark:text-navy-300 shadow-xs"
                  : "border-secondary bg-muted text-secondary-foreground hover:bg-muted dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground"
              )}
              title="Align Bottom"
            >
              <ArrowDown className="h-3.5 w-3.5" />
              <span>Bottom</span>
            </button>
          </div>
        </div>

        {/* Text Direction */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggleCellTextDirection}
          className={cn(
            "flex h-8 w-full items-center justify-center gap-2 rounded-md border text-xs font-medium transition-colors",
            activeCellFormat?.isVerticalText
              ? "border-primary bg-primary/10 text-primary/90 font-semibold dark:border-primary dark:bg-navy-950/60 dark:text-navy-300 shadow-xs"
              : "border-secondary bg-muted text-secondary-foreground hover:bg-muted dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground"
          )}
          title={
            activeCellFormat?.isVerticalText
              ? "Current: Vertical (Click to switch to Horizontal)"
              : "Toggle Text Direction (Horizontal / Vertical)"
          }
        >
          <RotateCw
            className={cn(
              "h-3.5 w-3.5 text-primary transition-transform duration-200",
              activeCellFormat?.isVerticalText && "rotate-90 text-primary dark:text-primary"
            )}
          />
          <span>{activeCellFormat?.isVerticalText ? "Vertical Text (Active)" : "Toggle Text Direction"}</span>
        </button>
      </div>

      {/* -----------------------------------------------------------
          TABLE SIZING & AUTOFIT CONTROLS (Word-style)
          ----------------------------------------------------------- */}
      <div className="border-t border-muted pt-2.5 dark:border-muted space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Table Sizing & AutoFit
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={autoFitWindow}
            className="flex items-center gap-1.5 rounded-lg border border-secondary bg-muted px-2.5 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-muted dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground transition-colors"
            title="Fit Table to Page Width (100%)"
          >
            <Maximize2 className="h-3.5 w-3.5 text-primary" />
            <span>Fit to Page</span>
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={autoFitContent}
            className="flex items-center gap-1.5 rounded-lg border border-secondary bg-muted px-2.5 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-muted dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground transition-colors"
            title="Fit Table to Content snuggly"
          >
            <Minimize2 className="h-3.5 w-3.5 text-warning-500" />
            <span>Fit Content</span>
          </button>

        </div>
      </div>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={deleteCurrentTable}
        className="w-full flex items-center justify-center gap-2 rounded-lg border border-destructive/80 bg-destructive/60 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 dark:border-destructive/40 dark:bg-destructive/40 dark:text-destructive transition-colors"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>Delete Selected Table</span>
      </button>
    </div>
  );
}
