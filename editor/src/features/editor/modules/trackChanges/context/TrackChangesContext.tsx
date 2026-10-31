/**
 * --------------------------------------------------------
 * Module: Track Changes
 * Feature: Track Changes Context Provider & Runtime Engine
 * Description:
 * Core state management provider handling track changes mode, inline DOM
 * markup delegation, change history syncing, acceptance/rejection workflows,
 * and comment threading.
 * --------------------------------------------------------
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useDocumentModel } from "@/features/editor/store/documentModel";
import { useEditor } from "@/features/editor/context/EditorContext";
import type {
  Comment,
  TrackedChange,
  TrackChangesContextType,
} from "../types";
import {
  TRACK_CHANGES_STORAGE_KEY,
  SHOW_MARKUP_STORAGE_KEY,
  DEFAULT_AUTHOR,
} from "../constants";
import {
  isInsideTcElement,
  generateChangeId,
  getHumanReadableChangeLabel,
} from "../utils";
import { trackChangesService } from "../services";

export const TrackChangesContext = createContext<TrackChangesContextType | null>(null);

export function TrackChangesProvider({ children }: { children: ReactNode }) {
  const { model, setPageHtml } = useDocumentModel();
  const { recordSnapshot } = useEditor();

  const [trackChanges, setTrackChangesState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(TRACK_CHANGES_STORAGE_KEY);
      return stored !== "false";
    } catch {
      return true;
    }
  });

  const trackRef = useRef<boolean>(trackChanges);

  const setTrackChanges = useCallback(
    (val: boolean | ((prev: boolean) => boolean)) => {
      setTrackChangesState((prev) => {
        const next = typeof val === "function" ? val(prev) : val;
        trackRef.current = next;
        try {
          localStorage.setItem(TRACK_CHANGES_STORAGE_KEY, String(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  const toggleTrackChanges = useCallback(() => {
    setTrackChanges((prev) => !prev);
  }, [setTrackChanges]);

  useEffect(() => {
    trackRef.current = trackChanges;
  }, [trackChanges]);

  const [showMarkup, setShowMarkupState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(SHOW_MARKUP_STORAGE_KEY);
      return stored !== null ? stored === "true" : true;
    } catch {
      return true;
    }
  });

  const setShowMarkup = useCallback(
    (val: boolean | ((prev: boolean) => boolean)) => {
      setShowMarkupState((prev) => {
        const next = typeof val === "function" ? val(prev) : val;
        try {
          localStorage.setItem(SHOW_MARKUP_STORAGE_KEY, String(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  const [trackedChanges, setTrackedChanges] = useState<TrackedChange[]>([]);
  const [activeChangeId, setActiveChangeId] = useState<string | null>(null);
  const [tcLoadedDocId, setTcLoadedDocId] = useState<string | null>(null);

  const user = DEFAULT_AUTHOR;
  const userRef = useRef(user);

  /**
   * Scans document page DOM nodes for <ins> and <del> tags,
   * auto-repairs missing IDs, extracts text, authors, timestamps,
   * and synchronizes trackedChanges state with 100% fidelity.
   */
  const syncTrackedChangesFromDOM = useCallback(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    // 1. Collect all unique tracked DOM elements strictly within editable page areas
    const domElements = Array.from(
      new Set(
        Array.from(
          document.querySelectorAll<HTMLElement>(
            '[contenteditable="true"] ins, [contenteditable="true"] del, [contenteditable="true"] [data-tc], [contenteditable="true"] [data-tc-id]'
          )
        )
      )
    );

    const changeMap: Record<
      string,
      {
        id: string;
        author: string;
        timestamp: number;
        insText?: string;
        delText?: string;
        contextTag?: string;
        pageId?: string;
      }
    > = {};

    domElements.forEach((el) => {
      // Auto-assign ID and tracking attributes if missing
      let id = el.getAttribute("data-tc-id");
      if (!id) {
        id = generateChangeId();
        el.setAttribute("data-tc-id", id);
      }
      if (!el.getAttribute("data-tc")) {
        el.setAttribute("data-tc", el.tagName.toLowerCase());
      }
      if (!el.getAttribute("data-user")) {
        el.setAttribute("data-user", userRef.current);
      }
      if (!el.getAttribute("data-ts")) {
        el.setAttribute("data-ts", String(Date.now()));
      }

      const tc = el.getAttribute("data-tc") || el.tagName.toLowerCase();
      const author = el.getAttribute("data-user") || DEFAULT_AUTHOR;
      const timestamp = Number(el.getAttribute("data-ts") || Date.now());
      const text = el.textContent || "";
      const pageEl = el.closest("[data-page-id], [data-editor-page]");
      const pageId =
        pageEl?.getAttribute("data-page-id") ||
        pageEl?.getAttribute("data-editor-page") ||
        undefined;
      const parentBlock = el.closest(
        "p, h1, h2, h3, h4, h5, h6, table, li, blockquote, div"
      );
      const contextTag = parentBlock?.tagName;

      if (!changeMap[id]) {
        changeMap[id] = { id, author, timestamp, contextTag, pageId };
      }

      if (tc.includes("ins") || el.tagName === "INS") {
        changeMap[id].insText = text;
      } else if (tc.includes("del") || el.tagName === "DEL") {
        changeMap[id].delText = text;
      }
    });

    // 2. Scan model.pageHtml ONLY for unmounted/off-screen pages
    const mountedPageIds = new Set(
      Array.from(document.querySelectorAll('[data-page-id], [data-editor-page]'))
        .map((el) => el.getAttribute("data-page-id") || el.getAttribute("data-editor-page"))
        .filter(Boolean)
    );

    if (model.pageHtml) {
      Object.entries(model.pageHtml).forEach(([pId, html]) => {
        if (mountedPageIds.has(pId)) return; // Already scanned live from DOM
        if (!html || (!html.includes("<ins") && !html.includes("<del") && !html.includes("data-tc"))) return;

        const temp = document.createElement("div");
        temp.innerHTML = html;
        const pageTcEls = Array.from(temp.querySelectorAll<HTMLElement>("ins, del, [data-tc], [data-tc-id]"));
        pageTcEls.forEach((el) => {
          const id = el.getAttribute("data-tc-id") || generateChangeId();
          if (changeMap[id]) return;
          const tc = el.getAttribute("data-tc") || el.tagName.toLowerCase();
          const author = el.getAttribute("data-user") || DEFAULT_AUTHOR;
          const timestamp = Number(el.getAttribute("data-ts") || Date.now());
          const text = el.textContent || "";
          const parentBlock = el.closest(
            "p, h1, h2, h3, h4, h5, h6, table, li, blockquote, div"
          );
          const contextTag = parentBlock?.tagName;

          if (!changeMap[id]) {
            changeMap[id] = { id, author, timestamp, contextTag, pageId: pId };
          }

          if (tc.includes("ins") || el.tagName === "INS") {
            changeMap[id].insText = text;
          } else if (tc.includes("del") || el.tagName === "DEL") {
            changeMap[id].delText = text;
          }
        });
      });
    }

    setTrackedChanges((prev) => {
      // Preserve accepted/rejected history
      const nextNonPending = prev.filter((c) => c.status !== "pending");
      const existingNonPendingIds = new Set(nextNonPending.map((c) => c.id));

      const pendingReconstructed = Object.values(changeMap)
        .filter((item) => !existingNonPendingIds.has(item.id))
        .map((item) => {
          let type: "insert" | "delete" | "edit" = "insert";
          let originalText = "";
          let newText = "";

          if (item.insText !== undefined && item.delText !== undefined) {
            type = "edit";
            originalText = item.delText;
            newText = item.insText;
          } else if (item.insText !== undefined) {
            type = "insert";
            newText = item.insText;
          } else if (item.delText !== undefined) {
            type = "delete";
            originalText = item.delText;
          }

          const label = getHumanReadableChangeLabel(
            type,
            originalText,
            newText,
            item.contextTag
          );
          const existingChange = prev.find((change) => change.id === item.id);

          return {
            id: item.id,
            author: item.author,
            timestamp: item.timestamp,
            type,
            originalText,
            newText,
            status: "pending" as const,
            label,
            pageId: item.pageId,
            comments: existingChange?.comments ?? [],
          };
        });

      const validPending = pendingReconstructed.filter(
        (c) =>
          c.type === "edit"
            ? Boolean((c.newText && c.newText.length > 0) || (c.originalText && c.originalText.length > 0))
            : c.type === "insert"
              ? Boolean(c.newText && c.newText.length > 0)
              : Boolean(c.originalText && c.originalText.length > 0)
      );

      return [...nextNonPending, ...validPending];
    });
  }, [model.pageHtml]);

  // Load changes on doc switch
  useEffect(() => {
    if (!model.id) return;
    const load = async () => {
      const list = await trackChangesService.getTrackedChanges(model.id);
      if (list && list.length > 0) {
        setTrackedChanges(list);
      }
      setTcLoadedDocId(model.id);
      setTimeout(() => {
        syncTrackedChangesFromDOM();
      }, 50);
    };
    load();
  }, [model.id, syncTrackedChangesFromDOM]);

  // Persist changes when updated
  useEffect(() => {
    if (!model.id || tcLoadedDocId !== model.id) return;
    trackChangesService.saveChanges(model.id, trackedChanges);
  }, [trackedChanges, model.id, tcLoadedDocId]);

  // Continuous MutationObserver: ensures any DOM mutation in editable areas syncs tracked changes immediately
  useEffect(() => {
    if (typeof window === "undefined" || typeof MutationObserver === "undefined") return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const observer = new MutationObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        syncTrackedChangesFromDOM();
      }, 20);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [syncTrackedChangesFromDOM]);

  useEffect(() => {
    const timer = setTimeout(() => {
      syncTrackedChangesFromDOM();
    }, 50);
    return () => clearTimeout(timer);
  }, [model.id, syncTrackedChangesFromDOM]);

  const addTrackedChange = useCallback((change: TrackedChange) => {
    setTrackedChanges((prev) => [...prev.filter((c) => c.id !== change.id), change]);
  }, []);

  const addCommentToChange = useCallback(
    (changeId: string, text: string) => {
      const trimmedText = text.trim();
      if (!trimmedText) return;

      const comment: Comment = {
        id: generateChangeId(),
        author: userRef.current,
        text: trimmedText,
        timestamp: Date.now(),
      };

      setTrackedChanges((prev) =>
        prev.map((change) =>
          change.id === changeId
            ? {
                ...change,
                comments: [...(change.comments ?? []), comment],
              }
            : change
        )
      );
    },
    []
  );

  /**
   * Accepts a specific tracked change by ID:
   * Leaves inserted text intact (unwrapping <ins>), removes deleted text (<del>),
   * syncs editor page HTML, updates status to "accepted", and records history snapshot.
   */
  const acceptChange = useCallback(
    (changeId: string) => {
      const els = Array.from(document.querySelectorAll(`[data-tc-id="${changeId}"]`));
      const pagesToUpdate = new Set<string>();

      els.forEach((el) => {
        const pageEl = el.closest("[data-editor-page], [data-page-id]");
        const pageId = pageEl?.getAttribute("data-page-id") || pageEl?.getAttribute("data-editor-page");
        const parent = el.parentNode;
        if (!parent) return;
        const tag = el.tagName;

        if (tag === "INS") {
          while (el.firstChild) {
            parent.insertBefore(el.firstChild, el);
          }
          parent.removeChild(el);
        } else if (tag === "DEL") {
          parent.removeChild(el);
        }

        if (pageId) {
          pagesToUpdate.add(pageId);
        }
      });

      pagesToUpdate.forEach((pageId) => {
        const pageEl = document.querySelector(`[data-editor-page="${pageId}"], [data-page-id="${pageId}"]`);
        const editorDiv = (pageEl?.hasAttribute("contenteditable")
          ? pageEl
          : pageEl?.querySelector("[contenteditable]")) as HTMLElement;
        if (editorDiv) {
          const html = editorDiv.innerHTML;
          setPageHtml(pageId, html);
          recordSnapshot(pageId, html, undefined, "Accept Change");
        }
      });

      setTrackedChanges((prev) =>
        prev.map((c) => (c.id === changeId ? { ...c, status: "accepted" as const } : c))
      );

      setTimeout(() => {
        syncTrackedChangesFromDOM();
      }, 50);
    },
    [setPageHtml, recordSnapshot, syncTrackedChangesFromDOM]
  );

  /**
   * Rejects a specific tracked change by ID:
   * Removes inserted elements (<ins>), restores deleted text (unwrapping <del>),
   * syncs editor page HTML, updates status to "rejected", and records history snapshot.
   */
  const rejectChange = useCallback(
    (changeId: string) => {
      const els = Array.from(document.querySelectorAll(`[data-tc-id="${changeId}"]`));
      const pagesToUpdate = new Set<string>();

      els.forEach((el) => {
        const pageEl = el.closest("[data-editor-page], [data-page-id]");
        const pageId = pageEl?.getAttribute("data-page-id") || pageEl?.getAttribute("data-editor-page");
        const parent = el.parentNode;
        if (!parent) return;
        const tag = el.tagName;

        if (tag === "DEL") {
          while (el.firstChild) {
            parent.insertBefore(el.firstChild, el);
          }
          parent.removeChild(el);
        } else if (tag === "INS") {
          parent.removeChild(el);
        }

        if (pageId) {
          pagesToUpdate.add(pageId);
        }
      });

      pagesToUpdate.forEach((pageId) => {
        const pageEl = document.querySelector(`[data-editor-page="${pageId}"], [data-page-id="${pageId}"]`);
        const editorDiv = (pageEl?.hasAttribute("contenteditable")
          ? pageEl
          : pageEl?.querySelector("[contenteditable]")) as HTMLElement;
        if (editorDiv) {
          const html = editorDiv.innerHTML;
          setPageHtml(pageId, html);
          recordSnapshot(pageId, html, undefined, "Reject Change");
        }
      });

      setTrackedChanges((prev) =>
        prev.map((c) => (c.id === changeId ? { ...c, status: "rejected" as const } : c))
      );

      setTimeout(() => {
        syncTrackedChangesFromDOM();
      }, 50);
    },
    [setPageHtml, recordSnapshot, syncTrackedChangesFromDOM]
  );

  /**
   * Accepts all pending tracked changes across all document pages.
   */
  const acceptAll = useCallback(() => {
    const pendingIds = Array.from(
      new Set(
        Array.from(document.querySelectorAll("ins, del, [data-tc-id]")).map((el) =>
          el.getAttribute("data-tc-id")
        )
      )
    ).filter(Boolean) as string[];

    pendingIds.forEach((id) => {
      acceptChange(id);
    });
  }, [acceptChange]);

  /**
   * Rejects all pending tracked changes across all document pages.
   */
  const rejectAll = useCallback(() => {
    const pendingIds = Array.from(
      new Set(
        Array.from(document.querySelectorAll("ins, del, [data-tc-id]")).map((el) =>
          el.getAttribute("data-tc-id")
        )
      )
    ).filter(Boolean) as string[];

    pendingIds.forEach((id) => {
      rejectChange(id);
    });
  }, [rejectChange]);

  /**
   * Navigates to previous tracked change in the document and selects it.
   */
  const prevChange = useCallback(() => {
    const els = Array.from(document.querySelectorAll("ins, del, [data-tc-id]"));
    if (els.length === 0) return;
    const sel = window.getSelection();
    let currentIdx = -1;
    if (sel && sel.rangeCount > 0) {
      const node = sel.getRangeAt(0).startContainer;
      const currentEl = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
      if (currentEl instanceof HTMLElement) {
        const tcEl = currentEl.closest("ins, del, [data-tc-id]");
        if (tcEl) {
          currentIdx = els.indexOf(tcEl as HTMLElement);
        }
      }
    }

    let targetIdx = els.length - 1;
    if (currentIdx > 0) {
      targetIdx = currentIdx - 1;
    }
    const targetEl = els[targetIdx] as HTMLElement;
    targetEl.scrollIntoView({ behavior: "smooth", block: "center" });

    const range = document.createRange();
    range.selectNodeContents(targetEl);
    sel?.removeAllRanges();
    sel?.addRange(range);

    const tcId = targetEl.getAttribute("data-tc-id");
    if (tcId) setActiveChangeId(tcId);
  }, []);

  /**
   * Navigates to next tracked change in the document and selects it.
   */
  const nextChange = useCallback(() => {
    const els = Array.from(document.querySelectorAll("ins, del, [data-tc-id]"));
    if (els.length === 0) return;
    const sel = window.getSelection();
    let currentIdx = -1;
    if (sel && sel.rangeCount > 0) {
      const node = sel.getRangeAt(0).startContainer;
      const currentEl = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
      if (currentEl instanceof HTMLElement) {
        const tcEl = currentEl.closest("ins, del, [data-tc-id]");
        if (tcEl) {
          currentIdx = els.indexOf(tcEl as HTMLElement);
        }
      }
    }

    let targetIdx = 0;
    if (currentIdx >= 0 && currentIdx < els.length - 1) {
      targetIdx = currentIdx + 1;
    }
    const targetEl = els[targetIdx] as HTMLElement;
    targetEl.scrollIntoView({ behavior: "smooth", block: "center" });

    const range = document.createRange();
    range.selectNodeContents(targetEl);
    sel?.removeAllRanges();
    sel?.addRange(range);

    const tcId = targetEl.getAttribute("data-tc-id");
    if (tcId) setActiveChangeId(tcId);
  }, []);

  /**
   * Delegated beforeinput handler for editable document pages.
   * Intercepts typing, paste, deletion, and cut when tracking is enabled,
   * injecting inline <ins data-tc="..."> and <del data-tc="..."> tags.
   */
  const handleBeforeInput = useCallback(
    (e: InputEvent, pageId: string) => {
      if (!trackRef.current) return;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);

      const inputType =
        e?.inputType ||
        (e as unknown as { nativeEvent?: { inputType?: string } })?.nativeEvent?.inputType ||
        "";
      if (!inputType) return;

      const isInsert =
        inputType === "insertText" ||
        inputType === "insertCompositionText" ||
        inputType === "insertFromPaste" ||
        inputType === "insertReplacementText";

      // -------------------------------------------------------------
      // 1. INSERTION / TYPING / PASTE / REPLACEMENT
      // -------------------------------------------------------------
      if (isInsert) {
        let text =
          e?.data ||
          (e as unknown as { nativeEvent?: { data?: string } })?.nativeEvent?.data ||
          "";
        if (
          inputType === "insertFromPaste" &&
          (e as unknown as { dataTransfer?: DataTransfer }).dataTransfer
        ) {
          text = (e as unknown as { dataTransfer: DataTransfer }).dataTransfer.getData("text/plain");
        }
        if (!text && inputType !== "insertCompositionText") return;

        // If caret is inside or touching a <del> element, reposition outside it
        const insideDel = isInsideTcElement(range.startContainer, "del, [data-tc*='del']");
        if (insideDel) {
          const r = document.createRange();
          r.setStartAfter(insideDel);
          r.collapse(true);
          sel.removeAllRanges();
          sel.addRange(r);
        }

        const activeRange = sel.getRangeAt(0);
        const activeInsEl = isInsideTcElement(activeRange.startContainer, "ins, [data-tc*='ins']");

        // If selection is collapsed and cursor is strictly inside an existing <ins>,
        // allow the browser to natively insert into that <ins> element.
        if (activeInsEl && activeRange.collapsed) {
          return;
        }

        // New insertion or replacement edit:
        e.preventDefault();
        const changeId = generateChangeId();
        const author = userRef.current;
        const ts = Date.now();

        const parentBlock = (
          activeRange.startContainer.nodeType === Node.ELEMENT_NODE
            ? (activeRange.startContainer as HTMLElement)
            : activeRange.startContainer.parentElement
        )?.closest("p, h1, h2, h3, h4, h5, h6, table, li, div");
        const contextTag = parentBlock?.tagName;

        const isEdit = !activeRange.collapsed;
        const origText = isEdit ? activeRange.toString() : "";
        const label = getHumanReadableChangeLabel(
          isEdit ? "edit" : "insert",
          origText,
          text,
          contextTag
        );

        const newChange: TrackedChange = {
          id: changeId,
          author,
          timestamp: ts,
          type: isEdit ? "edit" : "insert",
          originalText: origText,
          newText: text,
          status: "pending",
          label,
          pageId,
        };
        setTrackedChanges((prev) => [...prev.filter((c) => c.id !== changeId), newChange]);

        if (isEdit) {
          // Edit: create <del> and <ins> elements
          const delEl = document.createElement("del");
          delEl.setAttribute("data-tc", "edit-del");
          delEl.setAttribute("data-tc-id", changeId);
          delEl.setAttribute("data-user", author);
          delEl.setAttribute("data-ts", String(ts));
          delEl.textContent = origText;

          const insEl = document.createElement("ins");
          insEl.setAttribute("data-tc", "edit-ins");
          insEl.setAttribute("data-tc-id", changeId);
          insEl.setAttribute("data-user", author);
          insEl.setAttribute("data-ts", String(ts));
          insEl.textContent = text;

          activeRange.deleteContents();
          const frag = document.createDocumentFragment();
          frag.appendChild(delEl);
          frag.appendChild(insEl);
          activeRange.insertNode(frag);

          const r = document.createRange();
          if (insEl.firstChild) {
            r.setStart(insEl.firstChild, (insEl.firstChild as Text).length);
          } else {
            r.selectNodeContents(insEl);
          }
          r.collapse(true);
          sel.removeAllRanges();
          sel.addRange(r);
        } else {
          // Insertion: create <ins> element
          const insEl = document.createElement("ins");
          insEl.setAttribute("data-tc", "ins");
          insEl.setAttribute("data-tc-id", changeId);
          insEl.setAttribute("data-user", author);
          insEl.setAttribute("data-ts", String(ts));
          insEl.textContent = text;

          activeRange.insertNode(insEl);

          const r = document.createRange();
          if (insEl.firstChild) {
            r.setStart(insEl.firstChild, (insEl.firstChild as Text).length);
          } else {
            r.selectNodeContents(insEl);
          }
          r.collapse(true);
          sel.removeAllRanges();
          sel.addRange(r);
        }

        const targetEl = (
          (e.target instanceof Element ? e.target : activeRange.startContainer.parentElement) ||
          document.activeElement
        ) as HTMLElement | null;
        if (targetEl && typeof targetEl.dispatchEvent === "function") {
          targetEl.dispatchEvent(new Event("input", { bubbles: true }));
        }

        syncTrackedChangesFromDOM();
      }

      // -------------------------------------------------------------
      // 2. DELETION (BACKSPACE / DELETE / CUT)
      // -------------------------------------------------------------
      else if (inputType.startsWith("delete")) {
        const isBackspace = inputType.endsWith("Backward");

        if (inputType === "deleteByCut") {
          try {
            navigator.clipboard.writeText(range.toString());
          } catch (err) {
            console.error("Failed to copy cut text to clipboard", err);
          }
        }

        // Case 2A: Collapsed Caret Deletion
        if (range.collapsed) {
          // If caret is inside an <ins>:
          const activeIns = isInsideTcElement(range.startContainer, "ins, [data-tc*='ins']");
          if (activeIns) {
            const textContent = activeIns.textContent || "";
            // If <ins> only has 1 character, remove the <ins> element cleanly
            if (textContent.length <= 1) {
              e.preventDefault();
              const parent = activeIns.parentNode;
              if (parent) {
                const r = document.createRange();
                r.setStartBefore(activeIns);
                r.collapse(true);
                parent.removeChild(activeIns);
                sel.removeAllRanges();
                sel.addRange(r);

                const targetEl = (
                  (e.target instanceof Element ? e.target : parent) || document.activeElement
                ) as HTMLElement | null;
                if (targetEl && typeof targetEl.dispatchEvent === "function") {
                  targetEl.dispatchEvent(new Event("input", { bubbles: true }));
                }
                syncTrackedChangesFromDOM();
              }
              return;
            }
            // If <ins> has multiple characters, browser native deletion inside <ins> works cleanly
            return;
          }

          // Otherwise, deleting regular document text:
          const originalRange = range.cloneRange();
          const direction = isBackspace ? "backward" : "forward";
          const granularity = inputType.includes("Word") ? "word" : "character";
          sel.modify("extend", direction, granularity);

          const targetRange = sel.getRangeAt(0);
          const text = targetRange.toString();
          if (!text) {
            sel.removeAllRanges();
            sel.addRange(originalRange);
            return;
          }

          // If the extended range is completely inside an <ins>, let native handle
          const startIns = isInsideTcElement(targetRange.startContainer, "ins, [data-tc*='ins']");
          const endIns = isInsideTcElement(targetRange.endContainer, "ins, [data-tc*='ins']");
          if (startIns && endIns && startIns === endIns) {
            sel.removeAllRanges();
            sel.addRange(originalRange);
            return;
          }

          e.preventDefault();
          const changeId = generateChangeId();
          const author = userRef.current;
          const ts = Date.now();

          const parentBlock = (
            targetRange.startContainer.nodeType === Node.ELEMENT_NODE
              ? (targetRange.startContainer as HTMLElement)
              : targetRange.startContainer.parentElement
          )?.closest("p, h1, h2, h3, h4, h5, h6, table, li, div");
          const contextTag = parentBlock?.tagName;
          const label = getHumanReadableChangeLabel("delete", text, "", contextTag);

          const newChange: TrackedChange = {
            id: changeId,
            author,
            timestamp: ts,
            type: "delete",
            originalText: text,
            newText: "",
            status: "pending",
            label,
            pageId,
          };
          setTrackedChanges((prev) => [...prev.filter((c) => c.id !== changeId), newChange]);

          const delEl = document.createElement("del");
          delEl.setAttribute("data-tc", "del");
          delEl.setAttribute("data-tc-id", changeId);
          delEl.setAttribute("data-user", author);
          delEl.setAttribute("data-ts", String(ts));
          delEl.textContent = text;

          targetRange.deleteContents();
          targetRange.insertNode(delEl);

          const r = document.createRange();
          if (isBackspace) {
            r.setStartBefore(delEl);
          } else {
            r.setStartAfter(delEl);
          }
          r.collapse(true);
          sel.removeAllRanges();
          sel.addRange(r);

          const targetEl = (
            (e.target instanceof Element ? e.target : delEl.parentElement) ||
            document.activeElement
          ) as HTMLElement | null;
          if (targetEl && typeof targetEl.dispatchEvent === "function") {
            targetEl.dispatchEvent(new Event("input", { bubbles: true }));
          }
          syncTrackedChangesFromDOM();
        }

        // Case 2B: Non-Collapsed Range Deletion (Selected Text)
        else {
          const text = range.toString();
          if (!text) return;

          const startIns = isInsideTcElement(range.startContainer, "ins, [data-tc*='ins']");
          const endIns = isInsideTcElement(range.endContainer, "ins, [data-tc*='ins']");
          if (startIns && endIns && startIns === endIns) {
            const fullInsText = startIns.textContent || "";
            if (fullInsText.trim() === text.trim() || fullInsText.length <= text.length) {
              e.preventDefault();
              const parent = startIns.parentNode;
              if (parent) {
                const r = document.createRange();
                r.setStartBefore(startIns);
                r.collapse(true);
                parent.removeChild(startIns);
                sel.removeAllRanges();
                sel.addRange(r);

                const targetEl = (
                  (e.target instanceof Element ? e.target : parent) || document.activeElement
                ) as HTMLElement | null;
                if (targetEl && typeof targetEl.dispatchEvent === "function") {
                  targetEl.dispatchEvent(new Event("input", { bubbles: true }));
                }
                syncTrackedChangesFromDOM();
              }
              return;
            }
            return;
          }

          e.preventDefault();
          const changeId = generateChangeId();
          const author = userRef.current;
          const ts = Date.now();

          const parentBlock = (
            range.startContainer.nodeType === Node.ELEMENT_NODE
              ? (range.startContainer as HTMLElement)
              : range.startContainer.parentElement
          )?.closest("p, h1, h2, h3, h4, h5, h6, table, li, div");
          const contextTag = parentBlock?.tagName;
          const label = getHumanReadableChangeLabel("delete", text, "", contextTag);

          const newChange: TrackedChange = {
            id: changeId,
            author,
            timestamp: ts,
            type: "delete",
            originalText: text,
            newText: "",
            status: "pending",
            label,
            pageId,
          };
          setTrackedChanges((prev) => [...prev.filter((c) => c.id !== changeId), newChange]);

          const delEl = document.createElement("del");
          delEl.setAttribute("data-tc", "del");
          delEl.setAttribute("data-tc-id", changeId);
          delEl.setAttribute("data-user", author);
          delEl.setAttribute("data-ts", String(ts));
          delEl.textContent = text;

          range.deleteContents();
          range.insertNode(delEl);

          const r = document.createRange();
          r.setStartAfter(delEl);
          r.collapse(true);
          sel.removeAllRanges();
          sel.addRange(r);

          const targetEl = (
            (e.target instanceof Element ? e.target : delEl.parentElement) ||
            document.activeElement
          ) as HTMLElement | null;
          if (targetEl && typeof targetEl.dispatchEvent === "function") {
            targetEl.dispatchEvent(new Event("input", { bubbles: true }));
          }
          syncTrackedChangesFromDOM();
        }
      }
    },
    [syncTrackedChangesFromDOM]
  );

  /**
   * Delegated keydown handler for global shortcut (Ctrl+Shift+E).
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.shiftKey && (e.key === "e" || e.key === "E")) {
        e.preventDefault();
        toggleTrackChanges();
      }
    },
    [toggleTrackChanges]
  );

  /**
   * Delegated input handler for editable pages.
   */
  const handleInput = useCallback(() => {
    syncTrackedChangesFromDOM();
  }, [syncTrackedChangesFromDOM]);

  /**
   * Delegated mouse click handler for selecting changes & Alt+Click (Accept) / Shift+Click (Reject).
   */
  const handleClick = useCallback(
    (ev: MouseEvent) => {
      const target = ev.target as HTMLElement;
      const node = target.closest("ins, del, [data-tc-id]") as HTMLElement;
      if (!node) return;
      const changeId = node.getAttribute("data-tc-id");
      if (!changeId) return;

      setActiveChangeId(changeId);

      if (ev.altKey || ev.shiftKey) {
        ev.preventDefault();
        ev.stopPropagation();
        if (ev.altKey) {
          acceptChange(changeId);
        } else {
          rejectChange(changeId);
        }
      }
    },
    [acceptChange, rejectChange]
  );

  // Global Ctrl+Shift+E shortcut binding
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "e" || e.key === "E")) {
        e.preventDefault();
        toggleTrackChanges();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [toggleTrackChanges]);

  const pendingChanges = trackedChanges.filter((c) => c.status === "pending").length;

  return (
    <TrackChangesContext.Provider
      value={{
        trackChanges,
        setTrackChanges,
        toggleTrackChanges,

        showMarkup,
        setShowMarkup,

        trackedChanges,
        pendingChanges,
        activeChangeId,
        setActiveChangeId,


        addTrackedChange,
        addCommentToChange,
        acceptChange,
        rejectChange,
        acceptAll,
        rejectAll,
        prevChange,
        nextChange,

        handleBeforeInput,
        handleKeyDown,
        handleInput,
        handleClick,
        syncTrackedChangesFromDOM,
      }}
    >
      {children}
    </TrackChangesContext.Provider>
  );
}

export function useTrackChanges() {
  const context = useContext(TrackChangesContext);
  if (!context) {
    throw new Error("useTrackChanges must be used within TrackChangesProvider");
  }
  return context;
}

export default TrackChangesProvider;
