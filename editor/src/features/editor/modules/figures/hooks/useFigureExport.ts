/**
 * --------------------------------------------------------
 * Module: Figures / Figure
 * Feature: useFigureExport React Hook
 * Description:
 * Custom hook providing export utilities to generate figures as standalone HTML,
 * copy figure snippets to clipboard, or download figure data JSON.
 * --------------------------------------------------------
 */

import { useState } from "react";
import type { FigureModel } from "../types";
import { figureService } from "../services";

export function useFigureExport() {
  const [exporting, setExporting] = useState(false);

  const copyHTMLToClipboard = async (figure: FigureModel): Promise<boolean> => {
    try {
      setExporting(true);
      const html = figureService.exportToHTML(figure);
      await navigator.clipboard.writeText(html);
      return true;
    } catch {
      return false;
    } finally {
      setExporting(false);
    }
  };

  const downloadFigureJSON = (figure: FigureModel) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(figure, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${figure.title.toLowerCase().replace(/\s+/g, "-")}-figure.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return {
    exporting,
    copyHTMLToClipboard,
    downloadFigureJSON,
  };
}
