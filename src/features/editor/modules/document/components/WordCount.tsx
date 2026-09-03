/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Word Count & Metrics Statistics Widget
 * Description:
 * Analyzes document DOM HTML to calculate real-time word, character, and paragraph counts.
 * --------------------------------------------------------
 */

import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { useDocumentModel } from "@/features/editor/store/documentModel";

export function WordCount() {
  const { model } = useDocumentModel();

  const stats = useMemo(() => {
    let words = 0;
    let characters = 0;
    let paragraphs = 0;

    if (typeof window === "undefined" || typeof DOMParser === "undefined") {
      return { words: 0, characters: 0, paragraphs: 0, pages: 1 };
    }

    const parser = new DOMParser();
    Object.values(model.pageHtml || {}).forEach((html) => {
      if (!html) return;
      const doc = parser.parseFromString(html, "text/html");
      const text = doc.body.textContent || "";
      const trimmed = text.trim();
      words += trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
      characters += text.length;

      const nodes = doc.querySelectorAll("p, li, h1, h2, h3, h4, h5, h6");
      nodes.forEach((n) => {
        if ((n.textContent || "").trim().length > 0) paragraphs++;
      });
    });

    return {
      words,
      characters,
      paragraphs,
      pages: model.pages.length || 1,
    };
  }, [model.pageHtml, model.pages]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-[#111D29]">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        <Sparkles className="h-3.5 w-3.5 text-blue-500" />
        Document Statistics
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between border-b border-slate-100 pb-1 dark:border-slate-800">
          <span className="text-slate-500">Words:</span>
          <span className="font-semibold text-slate-900 dark:text-white">{stats.words}</span>
        </div>
        <div className="flex justify-between border-b border-slate-100 pb-1 dark:border-slate-800">
          <span className="text-slate-500">Characters:</span>
          <span className="font-semibold text-slate-900 dark:text-white">{stats.characters}</span>
        </div>
        <div className="flex justify-between pt-1">
          <span className="text-slate-500">Paragraphs:</span>
          <span className="font-semibold text-slate-900 dark:text-white">{stats.paragraphs}</span>
        </div>
        <div className="flex justify-between pt-1">
          <span className="text-slate-500">Pages:</span>
          <span className="font-semibold text-slate-900 dark:text-white">{stats.pages}</span>
        </div>
      </div>
    </div>
  );
}
