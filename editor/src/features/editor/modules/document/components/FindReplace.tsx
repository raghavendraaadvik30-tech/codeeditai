
/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Find & Replace Navigation Tool
 * Description:
 * TreeWalker-based string discovery and node replacement utility.
 * Responsive layout for desktop, tablet and narrow sidebars.
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

  // Responsive button styling
  const actionButtonClass = cn(
    "min-h-10 sm:min-h-[46px] w-full min-w-0",
    "rounded-lg border border-[#243B82]",
    "bg-white px-2 py-2",
    "text-center text-xs sm:text-sm font-semibold",
    "whitespace-normal break-words leading-tight",
    "text-[#243B82] shadow-sm transition-colors",
    "hover:bg-[#F3F5FB]",
    "active:bg-[#E8ECF8]",
    "disabled:cursor-not-allowed",
    "disabled:border-slate-300",
    "disabled:bg-white",
    "disabled:text-slate-400"
  );

  // Responsive button grid
  const buttonGridStyle = {
    gridTemplateColumns:
      "repeat(auto-fit, minmax(min(100%, 105px), 1fr))",
  };

  // Clear existing search highlights
  const clearFindHighlights = () => {
    const oldMarks = document.querySelectorAll<HTMLElement>(
      'mark[data-find-highlight="true"]'
    );

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

  // Cleanup highlights when component unmounts
  useEffect(() => {
    return () => {
      clearFindHighlights();
    };
  }, []);

  // Get editor content containers
  const getEditorContainers = () => {
    const containers = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[contenteditable="true"][data-page-id]'
      )
    );

    if (containers.length === 0 && editorRef.current) {
      containers.push(editorRef.current);
    }

    return containers;
  };

  // Escape special regex characters
  const escapeRegex = (value: string) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  // Find next matching text
  const handleFindNext = () => {
    const query = findText.trim();

    if (!query) {
      clearFindHighlights();
      lastSearchRef.current = "";
      setSearchStatus("");
      return;
    }

    const containers = getEditorContainers();

    const existingMarks = document.querySelectorAll<HTMLElement>(
      'mark[data-find-highlight="true"]'
    );

    if (
      query !== lastSearchRef.current ||
      existingMarks.length === 0
    ) {
      clearFindHighlights();

      lastSearchRef.current = query;
      matchIndexRef.current = 0;

      const regex = new RegExp(escapeRegex(query), "gi");

      containers.forEach((container) => {
        const walker = document.createTreeWalker(
          container,
          NodeFilter.SHOW_TEXT
        );

        const textNodes: Text[] = [];
        let n: Node | null;

        while ((n = walker.nextNode())) {
          if (
            n.parentElement &&
            !n.parentElement.closest(
              'mark[data-find-highlight="true"]'
            )
          ) {
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
              frag.appendChild(
                document.createTextNode(
                  val.substring(lastIndex, start)
                )
              );
            }

            const mark = document.createElement("mark");

            mark.setAttribute(
              "data-find-highlight",
              "true"
            );

            mark.style.backgroundColor = "#fef08a";
            mark.style.color = "black";
            mark.style.padding = "0 1px";
            mark.style.borderRadius = "2px";

            mark.textContent = val.substring(start, end);

            frag.appendChild(mark);

            lastIndex = end;
          }

          if (lastIndex < val.length) {
            frag.appendChild(
              document.createTextNode(
                val.substring(lastIndex)
              )
            );
          }

          node.parentNode?.replaceChild(frag, node);
        });
      });
    }

    const marks = Array.from(
      document.querySelectorAll<HTMLElement>(
        'mark[data-find-highlight="true"]'
      )
    );

    if (marks.length === 0) {
      setSearchStatus(`No matches found for "${query}".`);
      return;
    }

    marks.forEach((mark) => {
      mark.style.backgroundColor = "#fef08a";
      mark.style.outline = "none";
    });

    const activeIndex =
      matchIndexRef.current % marks.length;

    const activeMark = marks[activeIndex];

    activeMark.style.backgroundColor = "#facc15";
    activeMark.style.outline = "2px solid #ca8a04";

    activeMark.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    setSearchStatus(
      `Match ${activeIndex + 1} of ${marks.length}`
    );

    matchIndexRef.current =
      (activeIndex + 1) % marks.length;
  };

  // Replace current matching text
  const handleReplace = () => {
    const query = findText.trim();

    if (!query) return;

    let marks = Array.from(
      document.querySelectorAll<HTMLElement>(
        'mark[data-find-highlight="true"]'
      )
    );

    if (
      query !== lastSearchRef.current ||
      marks.length === 0
    ) {
      handleFindNext();

      marks = Array.from(
        document.querySelectorAll<HTMLElement>(
          'mark[data-find-highlight="true"]'
        )
      );

      if (marks.length === 0) {
        setSearchStatus("No matches found to replace.");
        return;
      }
    }

    const activeIdx = Math.max(
      0,
      (matchIndexRef.current - 1 + marks.length) %
        marks.length
    );

    const targetMark = marks[activeIdx] || marks[0];

    const pageContainer =
      targetMark.closest<HTMLElement>(
        '[contenteditable="true"]'
      );

    const textNode = document.createTextNode(replaceText);

    targetMark.parentNode?.replaceChild(
      textNode,
      targetMark
    );

    if (pageContainer) {
      pageContainer.normalize();

      pageContainer.dispatchEvent(
        new Event("input", { bubbles: true })
      );
    }

    lastSearchRef.current = "";
    handleFindNext();
  };

  // Replace all matching text
  const handleReplaceAll = () => {
    const query = findText.trim();

    if (!query) return;

    clearFindHighlights();

    lastSearchRef.current = "";
    matchIndexRef.current = 0;

    const containers = getEditorContainers();

    const regex = new RegExp(
      escapeRegex(query),
      "gi"
    );

    let totalReplacements = 0;

    containers.forEach((container) => {
      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT
      );

      const textNodes: Text[] = [];
      let n: Node | null;

      while ((n = walker.nextNode())) {
        if (
          n.parentElement &&
          !n.parentElement.closest(
            'mark[data-find-highlight="true"]'
          )
        ) {
          textNodes.push(n as Text);
        }
      }

      let containerReplaced = 0;

      textNodes.forEach((node) => {
        const val = node.nodeValue;

        if (!val) return;

        regex.lastIndex = 0;

        const matches = val.match(regex);

        if (!matches) return;

        containerReplaced += matches.length;

        regex.lastIndex = 0;

        node.nodeValue = val.replace(
          regex,
          () => replaceText
        );
      });

      if (containerReplaced > 0) {
        totalReplacements += containerReplaced;

        container.normalize();

        container.dispatchEvent(
          new Event("input", { bubbles: true })
        );
      }
    });

    if (totalReplacements === 0) {
      setSearchStatus(
        "Finished searching. 0 replacements made."
      );
    } else {
      setSearchStatus(
        `All done. Made ${totalReplacements} replacement${
          totalReplacements === 1 ? "" : "s"
        }.`
      );
    }
  };

  // Cancel search and clear highlights
  const handleCancel = () => {
    clearFindHighlights();

    lastSearchRef.current = "";
    matchIndexRef.current = 0;

    setSearchStatus("");
  };

  return (
    <div
      className={cn(
        "w-full min-w-0 max-w-full",
        "rounded-lg border border-secondary",
        "bg-card p-3 shadow-2xs",
        "dark:border-muted dark:bg-[#111D29]"
      )}
    >
      {/* Header Tabs */}
      <div className="mb-3 flex min-w-0 items-center justify-between border-b border-muted pb-2 dark:border-muted">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setNavTab("find");
              setSearchStatus("");
            }}
            className={cn(
              "cursor-pointer rounded-t-md",
              "px-3 sm:px-4 py-2 text-sm font-semibold",
              "transition-colors",
              navTab === "find"
                ? "border-b-[3px] border-[#243B82] bg-[#E9ECF7] text-[#243B82]"
                : "text-muted-foreground hover:text-[#243B82]"
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
              "cursor-pointer rounded-t-md",
              "px-3 sm:px-4 py-2 text-sm font-semibold",
              "transition-colors",
              navTab === "replace"
                ? "border-b-[3px] border-[#243B82] bg-[#E9ECF7] text-[#243B82]"
                : "text-muted-foreground hover:text-[#243B82]"
            )}
          >
            Replace
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0 space-y-3 text-sm">

        {/* Find Input */}
        <div className="min-w-0">
          <label className="mb-1.5 block font-medium text-[#526681]">
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
            className={cn(
              "w-full min-w-0 max-w-full",
              "rounded-lg border-2 border-[#DFE5EF]",
              "bg-[#F0F3F8] px-3 py-2.5",
              "text-sm text-[#334155]",
              "outline-none transition-colors",
              "placeholder:text-[#91A2C1]",
              "focus:border-[#243B82] focus:bg-white"
            )}
          />
        </div>

        {/* Replace Input */}
        {navTab === "replace" && (
          <div className="min-w-0">
            <label className="mb-1.5 block font-medium text-[#526681]">
              Replace with:
            </label>

            <input
              type="text"
              value={replaceText}
              onChange={(e) =>
                setReplaceText(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleReplace();
                }
              }}
              placeholder="Replace with..."
              className={cn(
                "w-full min-w-0 max-w-full",
                "rounded-lg border-2 border-[#DFE5EF]",
                "bg-[#F0F3F8] px-3 py-2.5",
                "text-sm text-[#334155]",
                "outline-none transition-colors",
                "placeholder:text-[#91A2C1]",
                "focus:border-[#243B82] focus:bg-white"
              )}
            />
          </div>
        )}

        {/* Search Status */}
        {searchStatus && (
          <div className="break-words text-xs italic text-[#243B82]">
            {searchStatus}
          </div>
        )}

        {/* Replace Buttons */}
        {navTab === "replace" ? (
          <div
            className="grid min-w-0 gap-2 border-t border-muted pt-3 dark:border-muted"
            style={buttonGridStyle}
          >
            <button
              type="button"
              onClick={handleReplace}
              disabled={!findText.trim()}
              className={actionButtonClass}
            >
              Replace
            </button>

            <button
              type="button"
              onClick={handleReplaceAll}
              disabled={!findText.trim()}
              className={actionButtonClass}
            >
              Replace All
            </button>

            <button
              type="button"
              onClick={handleFindNext}
              disabled={!findText.trim()}
              className={actionButtonClass}
            >
              Find Next
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className={actionButtonClass}
            >
              Cancel
            </button>
          </div>
        ) : (

          /* Find Buttons */
          <div
            className="grid min-w-0 gap-2 border-t border-muted pt-3 dark:border-muted"
            style={buttonGridStyle}
          >
            <button
              type="button"
              onClick={handleFindNext}
              disabled={!findText.trim()}
              className={actionButtonClass}
            >
              Find Next
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className={actionButtonClass}
            >
              Cancel
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
