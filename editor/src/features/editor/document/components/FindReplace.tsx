/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Find & Replace Navigation Tool
 * Description:
 * TreeWalker-based string discovery and node replacement utility for editor content.
 * --------------------------------------------------------
 */

import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { useEditor } from "@/features/editor/context/EditorContext";

export function FindReplace() {
  const { editorRef } = useEditor();
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const matchIndexRef = useRef<number>(0);
  const lastSearchRef = useRef<string>("");

  const clearFindHighlights = () => {
    const oldMarks = document.querySelectorAll<HTMLElement>('mark[data-find-highlight="true"]');
    oldMarks.forEach((mark) => {
      const parent = mark.parentNode;
      if (!parent) return;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      mark.remove();
      parent.normalize();
    });
  };

  useEffect(() => {
    return () => {
      clearFindHighlights();
    };
  }, []);

  const handleFind = () => {
    const query = findText.trim();
    if (!query) {
      clearFindHighlights();
      lastSearchRef.current = "";
      return;
    }

    const containers = Array.from(
      document.querySelectorAll<HTMLElement>('[contenteditable="true"][data-page-id]')
    );
    if (containers.length === 0 && editorRef.current) {
      containers.push(editorRef.current);
    }

    const existingMarks = document.querySelectorAll<HTMLElement>('mark[data-find-highlight="true"]');
    if (query !== lastSearchRef.current || existingMarks.length === 0) {
      clearFindHighlights();
      lastSearchRef.current = query;
      matchIndexRef.current = 0;

      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "gi");

      containers.forEach((container) => {
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
        const textNodes: Text[] = [];
        let n: Node | null;
        while ((n = walker.nextNode())) {
          if (n.parentElement && !n.parentElement.closest('[data-find-highlight="true"]')) {
            textNodes.push(n as Text);
          }
        }

        textNodes.forEach((node) => {
          const val = node.nodeValue;
          if (!val) return;

          regex.lastIndex = 0;
          if (!regex.test(val)) return;
          regex.lastIndex = 0;

          const frag = document.createDocumentFragment();
          let lastIndex = 0;
          let match: RegExpExecArray | null;

          while ((match = regex.exec(val)) !== null) {
            const start = match.index;
            const end = regex.lastIndex;

            if (start > lastIndex) {
              frag.appendChild(document.createTextNode(val.substring(lastIndex, start)));
            }

            const mark = document.createElement("mark");
            mark.setAttribute("data-find-highlight", "true");
            mark.style.backgroundColor = "yellow";
            mark.style.color = "black";
            mark.style.padding = "0 1px";
            mark.style.borderRadius = "2px";
            mark.textContent = val.substring(start, end);
            frag.appendChild(mark);

            lastIndex = end;
          }

          if (lastIndex < val.length) {
            frag.appendChild(document.createTextNode(val.substring(lastIndex)));
          }

          node.parentNode?.replaceChild(frag, node);
        });
      });
    }

    const marks = Array.from(
      document.querySelectorAll<HTMLElement>('mark[data-find-highlight="true"]')
    );

    if (marks.length === 0) return;

    marks.forEach((m) => {
      m.style.backgroundColor = "yellow";
      m.style.outline = "none";
    });

    const activeIndex = matchIndexRef.current % marks.length;
    const activeMark = marks[activeIndex];
    activeMark.style.backgroundColor = "#facc15";
    activeMark.style.outline = "2px solid #ca8a04";
    activeMark.scrollIntoView({ behavior: "smooth", block: "center" });

    matchIndexRef.current = (activeIndex + 1) % marks.length;
  };

  const handleReplace = () => {
    if (!findText.trim()) return;

    const marks = Array.from(
      document.querySelectorAll<HTMLElement>('mark[data-find-highlight="true"]')
    );

    if (marks.length > 0) {
      const activeIdx = Math.max(0, (matchIndexRef.current - 1 + marks.length) % marks.length);
      const targetMark = marks[activeIdx] || marks[0];
      const pageContainer = targetMark.closest<HTMLElement>('[contenteditable="true"]');
      const textNode = document.createTextNode(replaceText);
      targetMark.parentNode?.replaceChild(textNode, targetMark);

      if (pageContainer) {
        pageContainer.normalize();
        pageContainer.dispatchEvent(new Event("input", { bubbles: true }));
      }

      lastSearchRef.current = "";
      handleFind();
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
          onChange={(e) => {
            setFindText(e.target.value);
            if (!e.target.value.trim()) {
              clearFindHighlights();
              lastSearchRef.current = "";
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleFind();
            }
          }}
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
            className="flex-1 rounded bg-blue-600 py-1 font-medium text-white hover:bg-blue-700 cursor-pointer"
          >
            Find
          </button>
          <button
            type="button"
            onClick={handleReplace}
            className="flex-1 rounded border border-slate-200 bg-slate-100 py-1 font-medium hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
          >
            Replace
          </button>
        </div>
      </div>
    </div>
  );
}
