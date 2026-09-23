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
      return { words: 0, characters: 0, paragraphs: 0, pages: model.pages?.length || 1 };
    }

    const parser = new DOMParser();
    const pages = model.pages && model.pages.length > 0 ? model.pages : [{ id: "page_1" }];

    pages.forEach((page) => {
      const html = model.pageHtml?.[page.id];
      if (!html || !html.trim()) return;

      const doc = parser.parseFromString(html, "text/html");

      doc.querySelectorAll(
        "[data-editor-ui], [data-table-control], .page-break, .column-break, script, style"
      ).forEach((el) => el.remove());

      const allCandidateBlocks = Array.from(
        doc.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th")
      );

      const leafBlocks = allCandidateBlocks.filter((block) => {
        return block.querySelector("p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th") === null;
      });

      const blocks = leafBlocks.length > 0 ? leafBlocks : [doc.body];

      blocks.forEach((block) => {
        const clone = block.cloneNode(true) as HTMLElement;
        while (clone.lastChild && clone.lastChild.nodeName === "BR") {
          clone.removeChild(clone.lastChild);
        }

        const rawText = (clone.textContent || "")
          .replace(/[\u200B\u200C\u200D\uFEFF\u00AD]/g, "")
          .replace(/\u00A0/g, " ");

        const trimmed = rawText.trim();
        if (!trimmed) return;

        paragraphs++;
        words += trimmed.split(/\s+/).filter(Boolean).length;
        const cleanContent = rawText.replace(/^[\r\n]+|[\r\n]+$/g, "");
        characters += cleanContent.length;
      });
    });

    return {
      words,
      characters,
      paragraphs,
      pages: model.pages?.length || 1,
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
