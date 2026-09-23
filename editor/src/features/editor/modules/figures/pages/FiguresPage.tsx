/**
 * --------------------------------------------------------
 * Module: Figures / Figure
 * Feature: Figures Page / Main Figures Management Panel
 * Description:
 * Primary presentation container for figures management, displaying
 * Pictures, Chart, SmartArt, Icons, and Shapes sections in order.
 * --------------------------------------------------------
 */

import { PicturesSection } from "../modules/pictures";
import { ChartSection } from "../modules/chart";
import { SmartArtSection } from "../modules/smartart";
import { IconsSection } from "../modules/icons";
import { ShapesSection } from "../modules/shapes";

export default function FiguresPage() {
  return (
    <div className="flex h-full w-full flex-col select-none overflow-hidden bg-background text-foreground">
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
