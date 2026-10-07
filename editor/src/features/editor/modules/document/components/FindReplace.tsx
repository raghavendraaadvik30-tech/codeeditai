/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Find & Replace Navigation Tool
 * Description:
 * TreeWalker-based string discovery and node replacement utility for editor content.
 * --------------------------------------------------------
 */

import { useState, useRef, useEffect } from "react";
import { useEditor } from "@/features/editor/context/EditorContext";
import { cn } from "@/lib/utils";

export function FindReplace() {
  const { editorRef } = useEditor();
  const [navTab, setNavTab] = useState<"find" | "replace">("replace");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [searchStatus, setSearchStatus] = useState<string>("");
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

  const handleFindNext = () => {
    const query = findText.trim();
    if (!query) {
      clearFindHighlights();
      lastSearchRef.current = "";
      setSearchStatus("");
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
            mark.style.backgroundColor = "#fef08a";
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

    if (marks.length === 0) {
      setSearchStatus(`No matches found for "${query}".`);
      return;
    }

    marks.forEach((m) => {
      m.style.backgroundColor = "#fef08a";
      m.style.outline = "none";
    });

    const activeIndex = matchIndexRef.current % marks.length;
    const activeMark = marks[activeIndex];
    activeMark.style.backgroundColor = "#facc15";
    activeMark.style.outline = "2px solid #ca8a04";
    activeMark.scrollIntoView({ behavior: "smooth", block: "center" });

    setSearchStatus(`Match ${activeIndex + 1} of ${marks.length}`);
    matchIndexRef.current = (activeIndex + 1) % marks.length;
  };

  const handleReplace = () => {
    const query = findText.trim();
    if (!query) return;

    let marks = Array.from(
      document.querySelectorAll<HTMLElement>('mark[data-find-highlight="true"]')
    );

    if (query !== lastSearchRef.current || marks.length === 0) {
      handleFindNext();
      marks = Array.from(
        document.querySelectorAll<HTMLElement>('mark[data-find-highlight="true"]')
      );
      if (marks.length === 0) {
        setSearchStatus(`No matches found to replace.`);
        return;
      }
    }

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
    handleFindNext();
  };

  const handleReplaceAll = () => {
    const query = findText.trim();
    if (!query) return;

    clearFindHighlights();
    lastSearchRef.current = "";
    matchIndexRef.current = 0;

    const containers = Array.from(
      document.querySelectorAll<HTMLElement>('[contenteditable="true"][data-page-id]')
    );
    if (containers.length === 0 && editorRef.current) {
      containers.push(editorRef.current);
    }

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "gi");
    let totalReplacements = 0;

    containers.forEach((container) => {
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];
      let n: Node | null;
      while ((n = walker.nextNode())) {
        textNodes.push(n as Text);
      }

      let containerReplaced = 0;
      textNodes.forEach((node) => {
        const val = node.nodeValue;
        if (!val) return;

        regex.lastIndex = 0;
        if (!regex.test(val)) return;

        const count = (val.match(regex) || []).length;
        containerReplaced += count;
        regex.lastIndex = 0;
        const newVal = val.replace(regex, replaceText);
        node.nodeValue = newVal;
      });

      if (containerReplaced > 0) {
        totalReplacements += containerReplaced;
        container.normalize();
        container.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });

    if (totalReplacements === 0) {
      setSearchStatus(`Finished searching. 0 replacements made.`);
    } else {
      setSearchStatus(
        `All done. Made ${totalReplacements} replacement${totalReplacements === 1 ? "" : "s"}.`
      );
    }
  };

  const handleCancel = () => {
    clearFindHighlights();
    lastSearchRef.current = "";
    matchIndexRef.current = 0;
    setSearchStatus("");
  };

  return (
    <div className="rounded-lg border border-secondary bg-card p-3 dark:border-muted dark:bg-[#111D29] shadow-2xs">
      {/* Header Tabs */}
      <div className="flex items-center justify-between border-b border-muted pb-2 mb-2 dark:border-muted">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setNavTab("find");
              setSearchStatus("");
            }}
            className={cn(
              "px-3 py-1 text-xs font-semibold rounded-t transition-colors cursor-pointer",
              navTab === "find"
                ? "border-b-2 border-[#0078d4] text-[#0078d4] bg-primary/50 dark:bg-blue-950/40 dark:text-primary"
                : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-muted-foreground"
            )}
          >
            Find
          </button>
          <button
            type="button"
            onClick={() => {
              setNavTab("replace");
              setSearchStatus("");
            }}
            className={cn(
              "px-3 py-1 text-xs font-semibold rounded-t transition-colors cursor-pointer",
              navTab === "replace"
                ? "border-b-2 border-[#0078d4] text-[#0078d4] bg-primary/50 dark:bg-blue-950/40 dark:text-primary"
                : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-muted-foreground"
            )}
          >
            Replace
          </button>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground dark:text-muted-foreground mb-0.5">
            Find what:
          </label>
          <input
            type="text"
            value={findText}
            onChange={(e) => {
              setFindText(e.target.value);
              if (!e.target.value.trim()) {
                clearFindHighlights();
                lastSearchRef.current = "";
                setSearchStatus("");
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleFindNext();
              }
            }}
            placeholder="Find text..."
            className="w-full rounded border border-secondary bg-muted px-2 py-1.5 outline-none focus:border-primary focus:bg-card dark:border-secondary-foreground dark:bg-secondary dark:text-primary-foreground"
          />
        </div>

        {navTab === "replace" && (
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground dark:text-muted-foreground mb-0.5">
              Replace with:
            </label>
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleReplace();
                }
              }}
              placeholder="Replace with..."
              className="w-full rounded border border-secondary bg-muted px-2 py-1.5 outline-none focus:border-primary focus:bg-card dark:border-secondary-foreground dark:bg-secondary dark:text-primary-foreground"
            />
          </div>
        )}

        {searchStatus && (
          <div className="text-[11px] text-primary dark:text-primary italic">
            {searchStatus}
          </div>
        )}

        {navTab === "replace" ? (
          <div className="grid grid-cols-4 gap-1.5 pt-1.5 border-t border-muted dark:border-muted">
            <button
              type="button"
              onClick={handleReplace}
              disabled={!findText.trim()}
              className={cn(
                "rounded-[3px] border py-1 px-1 text-center text-[11px] transition-colors font-normal select-none",
                !findText.trim()
                  ? "border-secondary bg-card text-muted-foreground dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground cursor-not-allowed"
                  : "border-border bg-card text-foreground hover:bg-muted hover:border-muted-foreground active:bg-muted dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground dark:hover:bg-secondary-foreground cursor-pointer shadow-2xs"
              )}
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleReplaceAll}
              disabled={!findText.trim()}
              className={cn(
                "rounded-[3px] border py-1 px-1 text-center text-[11px] transition-colors font-normal select-none whitespace-nowrap",
                !findText.trim()
                  ? "border-secondary bg-card text-muted-foreground dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground cursor-not-allowed"
                  : "border-border bg-card text-foreground hover:bg-muted hover:border-muted-foreground active:bg-muted dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground dark:hover:bg-secondary-foreground cursor-pointer shadow-2xs"
              )}
            >
              Replace All
            </button>
            <button
              type="button"
              onClick={handleFindNext}
              disabled={!findText.trim()}
              className={cn(
                "rounded-[3px] border py-1 px-1 text-center text-[11px] transition-colors font-normal select-none whitespace-nowrap",
                !findText.trim()
                  ? "border-secondary bg-card text-muted-foreground dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground cursor-not-allowed"
                  : "border-border bg-card text-foreground hover:bg-muted hover:border-muted-foreground active:bg-muted dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground dark:hover:bg-secondary-foreground cursor-pointer shadow-2xs"
              )}
            >
              Find Next
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-[3px] border border-primary/80 bg-card py-1 px-1 text-center text-[11px] font-medium text-foreground shadow-2xs hover:bg-muted hover:border-primary active:bg-muted dark:border-primary dark:bg-muted dark:text-muted dark:hover:bg-secondary-foreground cursor-pointer select-none"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex gap-2 pt-1.5 border-t border-muted dark:border-muted">
            <button
              type="button"
              onClick={handleFindNext}
              disabled={!findText.trim()}
              className={cn(
                "flex-1 rounded-[3px] border py-1 text-center text-[11px] font-normal transition-colors select-none",
                !findText.trim()
                  ? "border-secondary bg-card text-muted-foreground dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground cursor-not-allowed"
                  : "border-border bg-card text-foreground hover:bg-muted hover:border-muted-foreground active:bg-muted dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground dark:hover:bg-secondary-foreground cursor-pointer shadow-2xs"
              )}
            >
              Find Next
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-[3px] border border-primary/80 bg-card py-1 text-center text-[11px] font-medium text-foreground shadow-2xs hover:bg-muted hover:border-primary active:bg-muted dark:border-primary dark:bg-muted dark:text-muted dark:hover:bg-secondary-foreground cursor-pointer select-none"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
