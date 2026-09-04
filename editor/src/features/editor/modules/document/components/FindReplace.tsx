/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Find & Replace Navigation Tool
 * Description:
 * TreeWalker-based string discovery and node replacement utility for editor content.
 * --------------------------------------------------------
 */

import { useState } from "react";
import { Search } from "lucide-react";
import { useEditor } from "@/features/editor/context/EditorContext";

export function FindReplace() {
  const { editorRef } = useEditor();
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  const handleFind = () => {
    if (!findText || !editorRef.current) return;
    const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = walker.nextNode())) {
      if (n.nodeValue && n.nodeValue.toLowerCase().includes(findText.toLowerCase())) {
        const parent = n.parentElement;
        parent?.scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      }
    }
  };

  const handleReplace = () => {
    if (!findText || !editorRef.current) return;
    const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = walker.nextNode())) {
      if (n.nodeValue && n.nodeValue.includes(findText)) {
        n.nodeValue = n.nodeValue.replace(findText, replaceText);
        break;
      }
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-[#111D29]">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        <Search className="h-3.5 w-3.5 text-blue-500" />
        Find & Replace
      </div>
      <div className="space-y-2 text-xs">
        <input
          type="text"
          value={findText}
          onChange={(e) => setFindText(e.target.value)}
          placeholder="Find text..."
          className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1.5 outline-none dark:border-slate-700 dark:bg-slate-900"
        />
        <input
          type="text"
          value={replaceText}
          onChange={(e) => setReplaceText(e.target.value)}
          placeholder="Replace with..."
          className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1.5 outline-none dark:border-slate-700 dark:bg-slate-900"
        />
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleFind}
            className="flex-1 rounded bg-blue-600 py-1 font-medium text-white hover:bg-blue-700"
          >
            Find
          </button>
          <button
            type="button"
            onClick={handleReplace}
            className="flex-1 rounded border border-slate-200 bg-slate-100 py-1 font-medium hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800"
          >
            Replace
          </button>
        </div>
      </div>
    </div>
  );
}
