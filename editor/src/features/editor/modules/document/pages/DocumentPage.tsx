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
          .replace(/[\u200B\u200C\uFEFF\u00AD]/g, "").replace(/\u200D/g, "")
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
      <div className="border-b border-secondary/80 p-3.5 space-y-3 dark:border-muted/80">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider dark:text-muted-foreground">
            Document Manager
          </h3>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCreateDoc}
              className="flex h-7 items-center gap-1 rounded-md bg-brand px-2.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-brand-deep"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="h-8 w-full rounded-md border border-secondary bg-muted/60 pl-8 pr-3 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-brand dark:border-muted dark:bg-[#07131E] dark:text-muted-foreground"
          />
        </div>
      </div>

      {/* 2. SCROLLABLE SIDEBAR BODY */}
      <div className="document-page-scroll flex-1 overflow-y-auto p-3 space-y-4">
        {/* ALL DOCUMENTS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider dark:text-muted-foreground">
              All Documents
            </h3>
            <span className="rounded-full bg-secondary/70 px-1.5 py-0.5 text-[10px] font-semibold text-secondary-foreground dark:bg-muted dark:text-muted-foreground">
              {filteredDocs.length}
            </span>
          </div>

          {/* Document Cards List */}
          <div className="space-y-1.5">
            {filteredDocs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-secondary p-4 text-center text-xs text-muted-foreground dark:border-muted">
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
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-secondary bg-card hover:border-border dark:border-muted/80 dark:bg-[#091524] dark:hover:border-secondary-foreground"
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                          isActive
                            ? "bg-brand/20 text-brand"
                            : "bg-muted text-muted-foreground dark:bg-muted/80 dark:text-muted-foreground"
                        )}
                      >
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={cn(
                            "truncate text-xs font-semibold leading-tight",
                            isActive
                              ? "text-brand"
                              : "text-foreground dark:text-muted"
                          )}
                        >
                          {doc.title}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                          <span>
                            {doc.pagesCount}{" "}
                            {doc.pagesCount === 1 ? "page" : "pages"}
                          </span>
                          <span>·</span>
                          {doc.savedTime ? (
                            <span className="text-success-500 font-medium">
                              Saved {doc.savedTime}
                            </span>
                          ) : (
                            <span className="text-warning-500 font-medium">
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
                      className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-destructive/80 text-destructive hover:bg-destructive/20 hover:text-destructive dark:bg-destructive/60 dark:text-destructive dark:hover:bg-destructive/80 transition-colors"
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
        <div className="space-y-2 border-t border-secondary/80 pt-3 dark:border-muted/80">
          {/* BREAKS ACCORDION */}
          <div className="border-b border-muted pb-1 dark:border-muted/60">
            <button
              type="button"
              onClick={() => toggleSection("breaks")}
              className="flex w-full items-center gap-1.5 py-1 text-left text-[11px] font-bold uppercase tracking-wider text-secondary-foreground transition-colors hover:text-foreground focus:outline-none dark:text-muted-foreground dark:hover:text-primary-foreground"
            >
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
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
                  className="flex w-full items-center gap-2.5 rounded-lg border border-secondary bg-muted/70 p-2 text-left text-xs font-semibold text-secondary-foreground hover:bg-primary/10 dark:border-muted dark:bg-[#111D29] dark:text-muted-foreground dark:hover:bg-muted"
                >
                  <List className="h-4 w-4 text-muted-foreground" />
                  Column Break
                </button>
                {/* Line Break: soft break (<br>) within current paragraph block */}
                <button
                  type="button"
                  onClick={() => {
                    insertLineBreak();
                    setOpenSections((prev) => ({ ...prev, breaks: false }));
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-secondary bg-muted/70 p-2 text-left text-xs font-semibold text-secondary-foreground hover:bg-primary/10 dark:border-muted dark:bg-[#111D29] dark:text-muted-foreground dark:hover:bg-muted"
                >
                  <CornerDownLeft className="h-4 w-4 text-muted-foreground" />
                  Line Break
                </button>
                {/* Page Break: splits content at cursor and creates next page */}
                <button
                  type="button"
                  onClick={() => {
                    insertPageBreak();
                    setOpenSections((prev) => ({ ...prev, breaks: false }));
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-secondary bg-muted/70 p-2 text-left text-xs font-semibold text-secondary-foreground hover:bg-primary/10 dark:border-muted dark:bg-[#111D29] dark:text-muted-foreground dark:hover:bg-muted"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Page Break
                </button>
              </div>
            )}
          </div>

          {/* NAVIGATION ACCORDION */}
          <div className="border-b border-muted pb-1 dark:border-muted/60">
            <button
              type="button"
              onClick={() => toggleSection("navigation")}
              className="flex w-full items-center gap-1.5 py-1 text-left text-[11px] font-bold uppercase tracking-wider text-secondary-foreground transition-colors hover:text-foreground focus:outline-none dark:text-muted-foreground dark:hover:text-primary-foreground"
            >
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                  openSections.navigation && "rotate-90"
                )}
              />
              Navigation
            </button>
            {openSections.navigation && (
              <div className="mt-2 space-y-2.5 pl-5">
                {/* Find & Replace Card */}
                <div className="rounded-lg border border-secondary bg-card p-2.5 space-y-2.5 dark:border-muted dark:bg-[#0E1A29] shadow-2xs">
                  {/* Card Header & Mode Switcher */}
                  <div className="flex items-center justify-between border-b border-muted pb-1.5 dark:border-muted">
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
                            ? "border-b-2 border-brand text-brand bg-primary/50 dark:bg-navy-950/40 dark:text-primary"
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
                          "px-2.5 py-1 text-xs font-semibold rounded-t transition-colors cursor-pointer",
                          navTab === "replace"
                            ? "border-b-2 border-brand text-brand bg-primary/50 dark:bg-navy-950/40 dark:text-primary"
                            : "text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-muted-foreground"
                        )}
                      >
                        Replace
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsFindReplaceDialogOpen(true)}
                      title="Open Microsoft Word Find and Replace Dialog"
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-secondary-foreground dark:hover:bg-muted dark:hover:text-muted-foreground transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Input Fields */}
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-medium text-muted-foreground dark:text-muted-foreground mb-0.5">
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
                        className="h-7 w-full rounded border border-secondary bg-muted px-2 text-xs outline-none focus:border-primary focus:bg-card dark:border-secondary-foreground dark:bg-[#07131E] dark:text-primary-foreground"
                      />
                    </div>

                    {navTab === "replace" && (
                      <div>
                        <label className="block text-[10px] font-medium text-muted-foreground dark:text-muted-foreground mb-0.5">
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
                          className="h-7 w-full rounded border border-secondary bg-muted px-2 text-xs outline-none focus:border-primary focus:bg-card dark:border-secondary-foreground dark:bg-[#07131E] dark:text-primary-foreground"
                        />
                      </div>
                    )}
                  </div>

                  {/* Search / Replace Feedback Message */}
                  {searchStatus && (
                    <div className="text-[11px] text-primary dark:text-primary italic px-0.5">
                      {searchStatus}
                    </div>
                  )}

                  {/* Action Buttons matching Microsoft Word */}
                  {navTab === "replace" ? (
                    <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-muted dark:border-muted">
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
                    <div className="flex items-center gap-2 pt-1 border-t border-muted dark:border-muted">
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
            )}
          </div>

          {/* DOCUMENT UTILITIES ACCORDION */}
          <div className="border-b border-muted pb-1 dark:border-muted/60">
            <button
              type="button"
              onClick={() => toggleSection("utilities")}
              className="flex w-full items-center gap-1.5 py-1 text-left text-[11px] font-bold uppercase tracking-wider text-secondary-foreground transition-colors hover:text-foreground focus:outline-none dark:text-muted-foreground dark:hover:text-primary-foreground"
            >
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                  openSections.utilities && "rotate-90"
                )}
              />
              Document Utilities
            </button>
            {openSections.utilities && (
              <div className="mt-2 space-y-2.5 pl-5">
                {/* Statistics Card */}
                <div className="rounded-lg border border-secondary bg-card p-2.5 space-y-2 text-xs dark:border-muted dark:bg-[#0E1A29]">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Word & Document Statistics
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-b border-muted pb-2 text-[11px] dark:border-muted">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Words:</span>
                      <span className="font-bold text-foreground dark:text-primary-foreground">
                        {stats.words}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Characters:</span>
                      <span className="font-bold text-foreground dark:text-primary-foreground">
                        {stats.characters}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paragraphs:</span>
                      <span className="font-bold text-foreground dark:text-primary-foreground">
                        {stats.paragraphs}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sections:</span>
                      <span className="font-bold text-foreground dark:text-primary-foreground">
                        {stats.sections}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Pages:</span>
                      <span className="font-bold text-foreground dark:text-primary-foreground">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-destructive/20 bg-card p-5 shadow-2xl dark:border-destructive/60 dark:bg-[#0c1929]">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive dark:bg-destructive/60 dark:text-destructive">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground dark:text-primary-foreground">
                  Delete Document
                </h3>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                  Permission confirmation
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-xl bg-warning-50 p-3 text-xs text-warning-900 dark:bg-warning-950/40 dark:text-warning-300 border border-warning-200/80 dark:border-warning-900/40">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-warning-600 dark:text-warning-400 mt-0.5" />
                <span>
                  Are you sure you want to delete <strong>"{docToDelete.title}"</strong>? This will permanently remove this document.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="rounded-xl border border-secondary bg-card px-3.5 py-2 text-xs font-semibold text-secondary-foreground hover:bg-muted dark:border-secondary-foreground dark:bg-secondary dark:text-muted-foreground dark:hover:bg-muted transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteDocument(docToDelete.id);
                  setDocToDelete(null);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-destructive px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-destructive transition-colors shadow-sm"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-md rounded-2xl border border-warning-200 bg-card p-5 shadow-2xl dark:border-warning-900/60 dark:bg-[#0c1929]">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-100 text-warning-600 dark:bg-warning-950/60 dark:text-warning-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 id="limit-dialog-title" className="text-sm font-bold text-foreground dark:text-primary-foreground">
                  Document Limit Reached
                </h3>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                  Maximum 10 documents allowed
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-xl bg-warning-50/80 p-3.5 text-xs leading-relaxed text-warning-950 dark:bg-warning-950/30 dark:text-warning-200 border border-warning-200/80 dark:border-warning-900/40">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-warning-600 dark:text-warning-400 mt-0.5" />
                <span>
                  You have reached the maximum limit of 10 documents. To insert a new document, the oldest document will be removed. If you want to keep any existing document, please save it in the File Manager before continuing.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowLimitAlert(false)}
                className="rounded-xl border border-secondary bg-card px-3.5 py-2 text-xs font-semibold text-secondary-foreground hover:bg-muted dark:border-secondary-foreground dark:bg-secondary dark:text-muted-foreground dark:hover:bg-muted transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateDoc}
                className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-brand-deep transition-colors shadow-sm"
              >
                <span>Continue</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Microsoft Word-Style Find & Replace Dialog */}
      {isFindReplaceDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-[0.5px]">
          <div className="w-[500px] rounded-lg border border-border bg-card shadow-2xl dark:border-secondary-foreground dark:bg-[#111D29] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            {/* Window Title Bar */}
            <div className="flex items-center justify-between border-b border-secondary bg-muted px-3.5 py-1.5 dark:border-muted dark:bg-[#07131E]">
              <span className="text-xs font-semibold text-foreground dark:text-muted-foreground select-none">
                Find and Replace
              </span>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-secondary-foreground dark:hover:bg-muted dark:hover:text-muted-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Dialog Tabs */}
            <div className="flex border-b border-secondary bg-muted px-3.5 pt-1.5 dark:border-muted dark:bg-[#0d1824]">
              <button
                type="button"
                onClick={() => {
                  setNavTab("find");
                  setSearchStatus("");
                }}
                className={cn(
                  "px-4 py-1.5 text-xs font-medium border-t-2 transition-colors cursor-pointer select-none",
                  navTab === "find"
                    ? "border-t-primary bg-card text-primary/90 border-x border-b-0 border-secondary -mb-px dark:border-secondary-foreground dark:bg-[#111D29] dark:text-primary"
                    : "border-t-transparent text-secondary-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-primary-foreground"
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
                    ? "border-t-primary bg-card text-primary/90 border-x border-b-0 border-secondary -mb-px dark:border-secondary-foreground dark:bg-[#111D29] dark:text-primary"
                    : "border-t-transparent text-secondary-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-primary-foreground"
                )}
              >
                Replace
              </button>
            </div>

            {/* Dialog Body */}
            <div className="p-4 space-y-3 bg-card dark:bg-[#111D29]">
              <div className="flex items-center gap-3">
                <label className="w-24 text-xs font-normal text-secondary-foreground dark:text-muted-foreground text-right shrink-0 select-none">
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
                  className="flex-1 h-7 rounded border border-border bg-card px-2.5 text-xs outline-none focus:border-primary dark:border-secondary-foreground dark:bg-secondary dark:text-primary-foreground"
                />
              </div>

              {navTab === "replace" && (
                <div className="flex items-center gap-3">
                  <label className="w-24 text-xs font-normal text-secondary-foreground dark:text-muted-foreground text-right shrink-0 select-none">
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
                    className="flex-1 h-7 rounded border border-border bg-card px-2.5 text-xs outline-none focus:border-primary dark:border-secondary-foreground dark:bg-secondary dark:text-primary-foreground"
                  />
                </div>
              )}

              {searchStatus && (
                <div className="text-xs text-primary dark:text-primary pl-27 italic">
                  {searchStatus}
                </div>
              )}
            </div>

            {/* Dialog Bottom Button Bar matching user screenshot exactly */}
            <div className="flex items-center justify-end gap-2 border-t border-secondary bg-muted px-4 py-2.5 dark:border-muted dark:bg-[#07131E]">
              {navTab === "replace" ? (
                <>
                  <button
                    type="button"
                    onClick={handleReplace}
                    disabled={!findText.trim()}
                    className={cn(
                      "min-w-[76px] rounded-xs border px-3 py-1 text-center text-xs transition-colors select-none",
                      !findText.trim()
                        ? "border-border bg-card text-muted-foreground dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground cursor-not-allowed"
                        : "border-border bg-card text-foreground hover:bg-muted hover:border-[#94a3b8] active:bg-secondary dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground dark:hover:bg-secondary-foreground cursor-pointer shadow-2xs"
                    )}
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleReplaceAll}
                    disabled={!findText.trim()}
                    className={cn(
                      "min-w-[86px] rounded-xs border px-3 py-1 text-center text-xs transition-colors select-none",
                      !findText.trim()
                        ? "border-border bg-card text-muted-foreground dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground cursor-not-allowed"
                        : "border-border bg-card text-foreground hover:bg-muted hover:border-[#94a3b8] active:bg-secondary dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground dark:hover:bg-secondary-foreground cursor-pointer shadow-2xs"
                    )}
                  >
                    Replace All
                  </button>
                  <button
                    type="button"
                    onClick={handleFindNext}
                    disabled={!findText.trim()}
                    className={cn(
                      "min-w-[76px] rounded-xs border px-3 py-1 text-center text-xs transition-colors select-none",
                      !findText.trim()
                        ? "border-border bg-card text-muted-foreground dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground cursor-not-allowed"
                        : "border-border bg-card text-foreground hover:bg-muted hover:border-[#94a3b8] active:bg-secondary dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground dark:hover:bg-secondary-foreground cursor-pointer shadow-2xs"
                    )}
                  >
                    Find Next
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="min-w-[76px] rounded-xs border border-brand bg-card px-3 py-1 text-center text-xs font-normal text-foreground shadow-2xs hover:bg-muted active:bg-secondary dark:border-primary dark:bg-muted dark:text-primary-foreground cursor-pointer select-none"
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
                      "min-w-[80px] rounded-xs border px-3 py-1 text-center text-xs transition-colors select-none",
                      !findText.trim()
                        ? "border-border bg-card text-muted-foreground dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground cursor-not-allowed"
                        : "border-border bg-card text-foreground hover:bg-muted hover:border-[#94a3b8] active:bg-secondary dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground dark:hover:bg-secondary-foreground cursor-pointer shadow-2xs"
                    )}
                  >
                    Find Next
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="min-w-[80px] rounded-xs border border-brand bg-card px-3 py-1 text-center text-xs font-normal text-foreground shadow-2xs hover:bg-muted active:bg-secondary dark:border-primary dark:bg-muted dark:text-primary-foreground cursor-pointer select-none"
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
