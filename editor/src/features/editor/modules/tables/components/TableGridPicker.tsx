/**
 * --------------------------------------------------------
 * Module: Tables
 * Feature: TableGridPicker Component
 * Description:
 * Visual interactive grid picker allowing users to hover and
 * click to instantly generate and insert tables up to 8x8.
 * --------------------------------------------------------
 */

import { useState } from "react";
import { useTable } from "../hooks";
import { cn } from "@/lib/utils";

const MAX_ROWS = 8;
const MAX_COLS = 8;

export function TableGridPicker() {
  const { insertQuickTable } = useTable();
  const [hoveredRow, setHoveredRow] = useState<number>(0);
  const [hoveredCol, setHoveredCol] = useState<number>(0);

  const handleSelect = (r: number, c: number) => {
    insertQuickTable(r, c);
    setHoveredRow(0);
    setHoveredCol(0);
  };

  return (
    <div className="rounded-xl border border-secondary/80 bg-card p-3 shadow-sm dark:border-muted/80 dark:bg-[#091524]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-secondary-foreground dark:text-muted-foreground">
          Quick Grid
        </span>
        <span className="text-[11px] font-medium text-[#0078d4]">
          {hoveredRow > 0 && hoveredCol > 0
            ? `${hoveredRow} × ${hoveredCol} Table`
            : "Hover to select"}
        </span>
      </div>

      <div
        className="grid grid-cols-8 gap-1 p-1 bg-muted rounded-lg dark:bg-secondary/50"
        onMouseLeave={() => {
          setHoveredRow(0);
          setHoveredCol(0);
        }}
      >
        {Array.from({ length: MAX_ROWS }).map((_, rIdx) => {
          const rowNum = rIdx + 1;
          return Array.from({ length: MAX_COLS }).map((_, cIdx) => {
            const colNum = cIdx + 1;
            const isHighlighted = rowNum <= hoveredRow && colNum <= hoveredCol;

            return (
              <button
                key={`${rowNum}-${colNum}`}
                type="button"
                onMouseEnter={() => {
                  setHoveredRow(rowNum);
                  setHoveredCol(colNum);
                }}
                onClick={() => handleSelect(rowNum, colNum)}
                className={cn(
                  "h-5 w-5 rounded-sm border transition-all duration-75",
                  isHighlighted
                    ? "border-[#0078d4] bg-[#0078d4]/30 dark:border-[#0078d4] dark:bg-[#0078d4]/40"
                    : "border-secondary bg-card hover:border-border dark:border-muted dark:bg-secondary"
                )}
                title={`${rowNum} × ${colNum}`}
              />
            );
          });
        })}
      </div>
    </div>
  );
}
