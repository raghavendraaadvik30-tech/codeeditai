/**
 * --------------------------------------------------------
 * Module: Figures / Figure
 * Feature: Figures Page / Main Figures Management Panel
 * Description:
 * Primary presentation container for figures management, displaying
 * Pictures, Chart, SmartArt, Icons, and Shapes sections in order.
 * --------------------------------------------------------
 */

import { Layers } from "lucide-react";
import {
  PicturesSection,
  ChartSection,
  SmartArtSection,
  IconsSection,
  ShapesSection,
} from "../components";

export default function FiguresPage() {
  return (
    <div className="flex h-full w-full flex-col select-none overflow-hidden bg-background text-foreground">
      {/* TOP HEADER */}
      <div className="border-b border-slate-200/80 p-3.5 space-y-1 dark:border-slate-800/80">
        <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400 flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-blue-500" />
          Figures & Graphics
        </h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Insert pictures, charts, SmartArt, icons, and shapes into your document.
        </p>
      </div>

      {/* SCROLLABLE PANEL BODY */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* 1. PICTURES */}
        <PicturesSection />

        {/* 2. CHART */}
        <ChartSection />

        {/* 3. SMARTART */}
        <SmartArtSection />

        {/* 4. ICONS */}
        <IconsSection />

        {/* 5. SHAPES */}
        <ShapesSection />
      </div>
    </div>
  );
}
