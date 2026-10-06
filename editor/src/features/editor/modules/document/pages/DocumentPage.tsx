/**
 * --------------------------------------------------------
 * Module: Document
 * Feature: Document Page / Main Document Management Panel
 * Description:
 * Primary presentation container for document management, displaying
 * document search, all documents list, active document selector,
 * and collapsible accordions for breaks, navigation, and document utilities.
 * --------------------------------------------------------
 */

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Plus,
  ChevronRight,
  FileText,
  List,
  CornerDownLeft,
  Sparkles,
  X,
  Trash2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { useEditor } from "@/features/editor/context/EditorContext";
import { useDocumentModel } from "@/features/editor/store/documentModel";
import { cn } from "@/lib/utils";

interface DocListItem {
  id: string;
  title: string;
  pagesCount: number;
  savedTime?: string;
  isUnsaved?: boolean;
  isActive: boolean;
}

export default function DocumentPage() {
  const { editorRef, insertPageBreak, insertLineBreak, insertColumnBreak } = useEditor();
  const {
    model,
    savedDocuments,
    loadDocument,
    deleteDocument,
    createNewDocument,
  } = useDocumentModel();

  const [searchQuery, setSearchQuery] = useState("");
  const [docToDelete, setDocToDelete] = useState<DocListItem | null>(null);
  const [showLimitAlert, setShowLimitAlert] = useState(false);

  // Accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    breaks: false,
    navigation: false,
    utilities: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => {
      const willOpen = !prev[section];
      return {
        breaks: section === "breaks" ? willOpen : false,
        navigation: section === "navigation" ? willOpen : false,
        utilities: section === "utilities" ? willOpen : false,
      };
    });
  };

  const allDocs = useMemo<DocListItem[]>(() => {
    const list: DocListItem[] = [];
    const seen = new Set<string>();

    // 1. Maintain the exact order from savedDocuments
    savedDocuments.forEach((doc) => {
      const isCurrent = doc.id === model.id;
      const currentDoc = isCurrent ? model : doc;
      seen.add(doc.id);
      list.push({
        id: currentDoc.id,
        title: currentDoc.title || "Untitled Document",
        pagesCount: currentDoc.pages?.length || 1,
        savedTime: currentDoc.savedAt
          ? new Date(currentDoc.savedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : undefined,
        isUnsaved: !currentDoc.savedAt,
        isActive: isCurrent,
      });
    });

    // 2. If the active model was not yet in savedDocuments, append it
    if (!seen.has(model.id)) {
      list.push({
        id: model.id,
        title: model.title || "Untitled Document",
        pagesCount: model.pages?.length || 1,
        savedTime: model.savedAt
          ? new Date(model.savedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : undefined,
        isUnsaved: !model.savedAt,
        isActive: true,
      });
    }

    return list.slice(0, 10);
  }, [model, savedDocuments]);

  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return allDocs;
    return allDocs.filter((d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allDocs, searchQuery]);

  const executeCreateDoc = () => {
    createNewDocument();
    setTimeout(() => {
      const editable = document.querySelector('[contenteditable="true"]') as HTMLElement | null;
      if (editable) {
        editable.focus();
        try {
          const sel = window.getSelection();
          if (sel) {
            const range = document.createRange();
            const target = editable.querySelector("p") || editable.firstChild || editable;
            if (document.contains(target)) {
              range.selectNodeContents(target);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }
        } catch {
          // ignore
        }
      }
    }, 60);
  };

  const handleCreateDoc = () => {
    if (allDocs.length >= 10) {
      setShowLimitAlert(true);
      return;
    }
    executeCreateDoc();
  };

  const handleConfirmCreateDoc = () => {
    setShowLimitAlert(false);
    executeCreateDoc();
  };

  const handleSelectDoc = (doc: { id: string }) => {
    loadDocument(doc.id);
    setTimeout(() => {
      const editable = document.querySelector('[contenteditable="true"]') as HTMLElement | null;
      if (editable) {
        editable.focus();
      }
    }, 60);
  };

  const handleDeleteDoc = (e: React.MouseEvent, doc: DocListItem) => {
    e.stopPropagation();
    setDocToDelete(doc);
  };

  // Find & Replace State with Microsoft Word-Style Navigation & Replace
  const [navTab, setNavTab] = useState<"find" | "replace">("replace");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [searchStatus, setSearchStatus] = useState<string>("");
  const [isFindReplaceDialogOpen, setIsFindReplaceDialogOpen] = useState(false);
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

    // Identify all editable page containers in the workspace
    const containers = Array.from(
      document.querySelectorAll<HTMLElement>('[contenteditable="true"][data-page-id]')
    );
    if (containers.length === 0 && editorRef.current) {
      containers.push(editorRef.current);
    }

    // Re-highlight when a new search string is entered or no marks exist
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

            // Create standard yellow highlight mark
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

    // Query all yellow highlighted occurrences
    const marks = Array.from(
      document.querySelectorAll<HTMLElement>('mark[data-find-highlight="true"]')
    );

    if (marks.length === 0) {
      setSearchStatus(`No matches found for "${query}".`);
      return;
    }

    // Reset all highlights to soft yellow, emphasize active match
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

    // If not searched yet or marks cleared, find first match
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

    // Reset lastSearch to re-index DOM and jump to next match
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
    setIsFindReplaceDialogOpen(false);
  };

  // Document Statistics calculation
  const stats = useMemo(() => {
    let words = 0;
    let characters = 0;
    let charactersNoSpaces = 0;
    let paragraphs = 0;
    let tables = 0;
    let images = 0;

    if (typeof window === "undefined" || typeof DOMParser === "undefined") {
      return {
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        paragraphs: 0,
        pages: model.pages?.length || 1,
        tables: 0,
        images: 0,
        sections: model.sections?.length || 1,
      };
    }

    const parser = new DOMParser();
    const pages = model.pages && model.pages.length > 0 ? model.pages : [{ id: "page_1" }];

    pages.forEach((page) => {
      const html = model.pageHtml?.[page.id];
      if (!html || !html.trim()) return;

      const doc = parser.parseFromString(html, "text/html");

      // 1. Remove editor UI markers, page breaks, and overlays from stats
      doc.querySelectorAll(
        "[data-editor-ui], [data-table-control], .page-break, .column-break, script, style"
      ).forEach((el) => el.remove());

      tables += doc.querySelectorAll("table").length;
      images += doc.querySelectorAll("img").length;

      // 2. Query all text-bearing block elements
      const allCandidateBlocks = Array.from(
        doc.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th")
      );

      // Keep only leaf block elements so nested blocks (e.g. td > p) are never double counted
      const leafBlocks = allCandidateBlocks.filter((block) => {
        return block.querySelector("p, h1, h2, h3, h4, h5, h6, li, blockquote, td, th") === null;
      });

      const blocks = leafBlocks.length > 0 ? leafBlocks : [doc.body];

      blocks.forEach((block) => {
        // Clone block to safely remove trailing placeholder <br> elements inserted by contentEditable
        const clone = block.cloneNode(true) as HTMLElement;
        while (clone.lastChild && clone.lastChild.nodeName === "BR") {
          clone.removeChild(clone.lastChild);
        }

        // Clean out zero-width characters and normalize non-breaking spaces
        const rawText = (clone.textContent || "")
          .replace(/[\u200B\u200C\u200D\uFEFF\u00AD]/g, "")
          .replace(/\u00A0/g, " ");

        // Trim leading and trailing whitespace to determine if block has genuine content
        const trimmed = rawText.trim();
        if (!trimmed) {
          // Empty paragraph or whitespace-only block: does not count towards words, characters, or paragraphs
          return;
        }

        paragraphs++;

        // Words: count words delimited by whitespace
        const blockWords = trimmed.split(/\s+/).filter(Boolean);
        words += blockWords.length;

        // Characters (no spaces): count of non-whitespace characters
        const noSpacesCount = trimmed.replace(/\s+/g, "").length;
        charactersNoSpaces += noSpacesCount;

        // Characters (with spaces): length of content without phantom placeholder newlines
        const cleanContent = rawText.replace(/^[\r\n]+|[\r\n]+$/g, "");
        characters += cleanContent.length;
      });
    });

    return {
      words,
      characters,
      charactersNoSpaces,
      paragraphs,
      pages: model.pages?.length || 1,
      tables,
      images,
      sections: model.sections?.length || 1,
    };
  }, [model.pageHtml, model.pages, model.sections]);

  return (
    <div className="flex h-full w-full flex-col select-none overflow-hidden bg-background text-foreground">
      {/* 1. TOP HEADER: DOCUMENT MANAGER & NEW BUTTON */}
      <div className="border-b border-slate-200/80 p-3.5 space-y-3 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
            Document Manager
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCreateDoc}
              className="flex h-7 items-center gap-1 rounded-md bg-[#0078d4] px-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#005a9e]"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="h-8 w-full rounded-md border border-slate-200 bg-slate-50/60 pl-8 pr-3 text-xs outline-none transition-colors placeholder:text-slate-400 focus:border-[#0078d4] dark:border-slate-800 dark:bg-[#07131E] dark:text-slate-200"
          />
        </div>
      </div>

      {/* 2. SCROLLABLE SIDEBAR BODY */}
      <div className="document-page-scroll flex-1 overflow-y-auto p-3 space-y-4">
        {/* ALL DOCUMENTS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
              All Documents
            </h3>
            <span className="rounded-full bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {filteredDocs.length}
            </span>
          </div>

          {/* Document Cards List */}
          <div className="space-y-1.5">
            {filteredDocs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-slate-800">
                No documents found
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isActive = doc.isActive;
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc)}
                    className={cn(
                      "group flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition-all",
                      isActive
                        ? "border-[#0078d4] bg-[#0078d4]/10 text-[#0078d4]"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800/80 dark:bg-[#091524] dark:hover:border-slate-700"
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                          isActive
                            ? "bg-[#0078d4]/20 text-[#0078d4]"
                            : "bg-slate-100 text-slate-400 dark:bg-slate-800/80 dark:text-slate-500"
                        )}
                      >
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={cn(
                            "truncate text-xs font-semibold leading-tight",
                            isActive
                              ? "text-[#0078d4]"
                              : "text-slate-900 dark:text-slate-100"
                          )}
                        >
                          {doc.title}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                          <span>
                            {doc.pagesCount}{" "}
                            {doc.pagesCount === 1 ? "page" : "pages"}
                          </span>
                          <span>·</span>
                          {doc.savedTime ? (
                            <span className="text-emerald-500 font-medium">
                              Saved {doc.savedTime}
                            </span>
                          ) : (
                            <span className="text-amber-500 font-medium">
                              Unsaved
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete Button matching screenshot */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteDoc(e, doc)}
                      title="Delete Document"
                      className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100/80 text-red-500 hover:bg-red-200 hover:text-red-700 dark:bg-red-950/60 dark:text-red-400 dark:hover:bg-red-900/80 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 3. COLLAPSIBLE ACCORDIONS */}
        <div className="space-y-2 border-t border-slate-200/80 pt-3 dark:border-slate-800/80">
          {/* BREAKS ACCORDION */}
          <div className="border-b border-slate-100 pb-1 dark:border-slate-800/60">
            <button
              type="button"
              onClick={() => toggleSection("breaks")}
              className="flex w-full items-center gap-1.5 py-1 text-left text-[11px] font-bold uppercase tracking-wider text-slate-700 transition-colors hover:text-slate-900 focus:outline-none dark:text-slate-300 dark:hover:text-white"
            >
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 text-slate-500 transition-transform duration-200",
                  openSections.breaks && "rotate-90"
                )}
              />
              Breaks
            </button>
            {openSections.breaks && (
              <div className="mt-2 space-y-1.5 pl-5">
                {/* Column Break: advances cursor to next column on same page, or next page if last column */}
                <button
                  type="button"
                  onClick={() => {
                    insertColumnBreak();
                    setOpenSections((prev) => ({ ...prev, breaks: false }));
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50/70 p-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 dark:border-slate-800 dark:bg-[#111D29] dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <List className="h-4 w-4 text-slate-500" />
                  Column Break
                </button>
                {/* Line Break: soft break (<br>) within current paragraph block */}
                <button
                  type="button"
                  onClick={() => {
                    insertLineBreak();
                    setOpenSections((prev) => ({ ...prev, breaks: false }));
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50/70 p-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 dark:border-slate-800 dark:bg-[#111D29] dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <CornerDownLeft className="h-4 w-4 text-slate-500" />
                  Line Break
                </button>
                {/* Page Break: splits content at cursor and creates next page */}
                <button
                  type="button"
                  onClick={() => {
                    insertPageBreak();
                    setOpenSections((prev) => ({ ...prev, breaks: false }));
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50/70 p-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 dark:border-slate-800 dark:bg-[#111D29] dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <FileText className="h-4 w-4 text-slate-500" />
                  Page Break
                </button>
              </div>
            )}
          </div>

          {/* NAVIGATION ACCORDION */}
          <div className="border-b border-slate-100 pb-1 dark:border-slate-800/60">
            <button
              type="button"
              onClick={() => toggleSection("navigation")}
              className="flex w-full items-center gap-1.5 py-1 text-left text-[11px] font-bold uppercase tracking-wider text-slate-700 transition-colors hover:text-slate-900 focus:outline-none dark:text-slate-300 dark:hover:text-white"
            >
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 text-slate-500 transition-transform duration-200",
                  openSections.navigation && "rotate-90"
                )}
              />
              Navigation
            </button>
            {openSections.navigation && (
              <div className="mt-2 space-y-2.5 pl-5">
                {/* Find & Replace Card */}
                <div className="rounded-lg border border-slate-200 bg-white p-2.5 space-y-2.5 dark:border-slate-800 dark:bg-[#0E1A29] shadow-2xs">
                  {/* Card Header & Mode Switcher */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 dark:border-slate-800">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setNavTab("find");
                          setSearchStatus("");
                        }}
                        className={cn(
                          "px-2.5 py-1 text-xs font-semibold rounded-t transition-colors cursor-pointer",
                          navTab === "find"
                            ? "border-b-2 border-[#0078d4] text-[#0078d4] bg-blue-50/50 dark:bg-blue-950/40 dark:text-blue-400"
                            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
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
                          "px-2.5 py-1 text-xs font-semibold rounded-t transition-colors cursor-pointer",
                          navTab === "replace"
                            ? "border-b-2 border-[#0078d4] text-[#0078d4] bg-blue-50/50 dark:bg-blue-950/40 dark:text-blue-400"
                            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                        )}
                      >
                        Replace
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsFindReplaceDialogOpen(true)}
                      title="Open Microsoft Word Find and Replace Dialog"
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Input Fields */}
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">
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
                        className="h-7 w-full rounded border border-slate-200 bg-slate-50 px-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-[#07131E] dark:text-white"
                      />
                    </div>

                    {navTab === "replace" && (
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">
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
                          className="h-7 w-full rounded border border-slate-200 bg-slate-50 px-2 text-xs outline-none focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-[#07131E] dark:text-white"
                        />
                      </div>
                    )}
                  </div>

                  {/* Search / Replace Feedback Message */}
                  {searchStatus && (
                    <div className="text-[11px] text-blue-600 dark:text-blue-400 italic px-0.5">
                      {searchStatus}
                    </div>
                  )}

                  {/* Action Buttons matching Microsoft Word */}
                  {navTab === "replace" ? (
                    <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={handleReplace}
                        disabled={!findText.trim()}
                        className={cn(
                          "rounded-[3px] border py-1 px-1 text-center text-[11px] transition-colors font-normal select-none",
                          !findText.trim()
                            ? "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                            : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
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
                            ? "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                            : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
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
                            ? "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                            : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
                        )}
                      >
                        Find Next
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="rounded-[3px] border border-blue-400/80 bg-white py-1 px-1 text-center text-[11px] font-medium text-slate-900 shadow-2xs hover:bg-slate-50 hover:border-blue-500 active:bg-slate-100 dark:border-blue-500 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 cursor-pointer select-none"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={handleFindNext}
                        disabled={!findText.trim()}
                        className={cn(
                          "flex-1 rounded-[3px] border py-1 text-center text-[11px] font-normal transition-colors select-none",
                          !findText.trim()
                            ? "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                            : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
                        )}
                      >
                        Find Next
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 rounded-[3px] border border-blue-400/80 bg-white py-1 text-center text-[11px] font-medium text-slate-900 shadow-2xs hover:bg-slate-50 hover:border-blue-500 active:bg-slate-100 dark:border-blue-500 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 cursor-pointer select-none"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* DOCUMENT UTILITIES ACCORDION */}
          <div className="border-b border-slate-100 pb-1 dark:border-slate-800/60">
            <button
              type="button"
              onClick={() => toggleSection("utilities")}
              className="flex w-full items-center gap-1.5 py-1 text-left text-[11px] font-bold uppercase tracking-wider text-slate-700 transition-colors hover:text-slate-900 focus:outline-none dark:text-slate-300 dark:hover:text-white"
            >
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 text-slate-500 transition-transform duration-200",
                  openSections.utilities && "rotate-90"
                )}
              />
              Document Utilities
            </button>
            {openSections.utilities && (
              <div className="mt-2 space-y-2.5 pl-5">
                {/* Statistics Card */}
                <div className="rounded-lg border border-slate-200 bg-white p-2.5 space-y-2 text-xs dark:border-slate-800 dark:bg-[#0E1A29]">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                    Word & Document Statistics
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-b border-slate-100 pb-2 text-[11px] dark:border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Words:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {stats.words}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Characters:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {stats.characters}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Paragraphs:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {stats.paragraphs}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sections:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {stats.sections}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Pages:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {stats.pages}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          DELETE PERMISSION / CONFIRMATION MODAL
      ============================================================ */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-red-200 bg-white p-5 shadow-2xl dark:border-red-950/60 dark:bg-[#0c1929]">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Delete Document
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Permission confirmation
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/40">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <span>
                  Are you sure you want to delete <strong>"{docToDelete.title}"</strong>? This will permanently remove this document.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteDocument(docToDelete.id);
                  setDocToDelete(null);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors shadow-sm"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          DOCUMENT LIMIT REACHED MODAL (MAX 10 DOCUMENTS)
      ============================================================ */}
      {showLimitAlert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="limit-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-5 shadow-2xl dark:border-amber-900/60 dark:bg-[#0c1929]">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 id="limit-dialog-title" className="text-sm font-bold text-slate-900 dark:text-white">
                  Document Limit Reached
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Maximum 10 documents allowed
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-xl bg-amber-50/80 p-3.5 text-xs leading-relaxed text-amber-950 dark:bg-amber-950/30 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/40">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <span>
                  You have reached the maximum limit of 10 documents. To insert a new document, the oldest document will be removed. If you want to keep any existing document, please save it in the File Manager before continuing.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLimitAlert(false)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateDoc}
                className="flex items-center gap-1.5 rounded-xl bg-[#0078d4] px-4 py-2 text-xs font-semibold text-white hover:bg-[#005a9e] transition-colors shadow-sm"
              >
                <span>Continue</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Microsoft Word-Style Find & Replace Dialog */}
      {isFindReplaceDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[0.5px]">
          <div className="w-[500px] rounded-lg border border-slate-300 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#111D29] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Window Title Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-[#f3f4f6] px-3.5 py-1.5 dark:border-slate-800 dark:bg-[#07131E]">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 select-none">
                Find and Replace
              </span>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Dialog Tabs */}
            <div className="flex border-b border-slate-200 bg-[#f8fafc] px-3.5 pt-1.5 dark:border-slate-800 dark:bg-[#0d1824]">
              <button
                type="button"
                onClick={() => {
                  setNavTab("find");
                  setSearchStatus("");
                }}
                className={cn(
                  "px-4 py-1.5 text-xs font-medium border-t-2 transition-colors cursor-pointer select-none",
                  navTab === "find"
                    ? "border-t-blue-600 bg-white text-blue-700 border-x border-b-0 border-slate-200 -mb-px dark:border-slate-700 dark:bg-[#111D29] dark:text-blue-400"
                    : "border-t-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
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
                  "px-4 py-1.5 text-xs font-medium border-t-2 transition-colors cursor-pointer select-none",
                  navTab === "replace"
                    ? "border-t-blue-600 bg-white text-blue-700 border-x border-b-0 border-slate-200 -mb-px dark:border-slate-700 dark:bg-[#111D29] dark:text-blue-400"
                    : "border-t-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                Replace
              </button>
            </div>

            {/* Dialog Body */}
            <div className="p-4 space-y-3 bg-white dark:bg-[#111D29]">
              <div className="flex items-center gap-3">
                <label className="w-24 text-xs font-normal text-slate-600 dark:text-slate-300 text-right shrink-0 select-none">
                  Find what:
                </label>
                <input
                  type="text"
                  autoFocus
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
                  className="flex-1 h-7 rounded border border-slate-300 bg-white px-2.5 text-xs outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {navTab === "replace" && (
                <div className="flex items-center gap-3">
                  <label className="w-24 text-xs font-normal text-slate-600 dark:text-slate-300 text-right shrink-0 select-none">
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
                    className="flex-1 h-7 rounded border border-slate-300 bg-white px-2.5 text-xs outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>
              )}

              {searchStatus && (
                <div className="text-xs text-blue-600 dark:text-blue-400 pl-27 italic">
                  {searchStatus}
                </div>
              )}
            </div>

            {/* Dialog Bottom Button Bar matching user screenshot exactly */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-[#f3f4f6] px-4 py-2.5 dark:border-slate-800 dark:bg-[#07131E]">
              {navTab === "replace" ? (
                <>
                  <button
                    type="button"
                    onClick={handleReplace}
                    disabled={!findText.trim()}
                    className={cn(
                      "min-w-[76px] rounded-[2px] border px-3 py-1 text-center text-xs transition-colors select-none",
                      !findText.trim()
                        ? "border-[#d1d5db] bg-white text-[#9ca3af] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                        : "border-[#d1d5db] bg-white text-[#1e293b] hover:bg-[#f3f4f6] hover:border-[#94a3b8] active:bg-[#e5e7eb] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
                    )}
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleReplaceAll}
                    disabled={!findText.trim()}
                    className={cn(
                      "min-w-[86px] rounded-[2px] border px-3 py-1 text-center text-xs transition-colors select-none",
                      !findText.trim()
                        ? "border-[#d1d5db] bg-white text-[#9ca3af] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                        : "border-[#d1d5db] bg-white text-[#1e293b] hover:bg-[#f3f4f6] hover:border-[#94a3b8] active:bg-[#e5e7eb] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
                    )}
                  >
                    Replace All
                  </button>
                  <button
                    type="button"
                    onClick={handleFindNext}
                    disabled={!findText.trim()}
                    className={cn(
                      "min-w-[76px] rounded-[2px] border px-3 py-1 text-center text-xs transition-colors select-none",
                      !findText.trim()
                        ? "border-[#d1d5db] bg-white text-[#9ca3af] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                        : "border-[#d1d5db] bg-white text-[#1e293b] hover:bg-[#f3f4f6] hover:border-[#94a3b8] active:bg-[#e5e7eb] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
                    )}
                  >
                    Find Next
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="min-w-[76px] rounded-[2px] border border-[#0078d4] bg-white px-3 py-1 text-center text-xs font-normal text-[#1e293b] shadow-2xs hover:bg-[#f3f4f6] active:bg-[#e5e7eb] dark:border-blue-500 dark:bg-slate-800 dark:text-white cursor-pointer select-none"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleFindNext}
                    disabled={!findText.trim()}
                    className={cn(
                      "min-w-[80px] rounded-[2px] border px-3 py-1 text-center text-xs transition-colors select-none",
                      !findText.trim()
                        ? "border-[#d1d5db] bg-white text-[#9ca3af] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed"
                        : "border-[#d1d5db] bg-white text-[#1e293b] hover:bg-[#f3f4f6] hover:border-[#94a3b8] active:bg-[#e5e7eb] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
                    )}
                  >
                    Find Next
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="min-w-[80px] rounded-[2px] border border-[#0078d4] bg-white px-3 py-1 text-center text-xs font-normal text-[#1e293b] shadow-2xs hover:bg-[#f3f4f6] active:bg-[#e5e7eb] dark:border-blue-500 dark:bg-slate-800 dark:text-white cursor-pointer select-none"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
