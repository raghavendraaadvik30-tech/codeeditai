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
  TrackedChange,
  Comment,
  TrackChangesContextType,
} from "../types";
import {
  TRACK_CHANGES_STORAGE_KEY,
  SHOW_MARKUP_STORAGE_KEY,
  DEFAULT_AUTHOR,
} from "../constants";
import {
  escapeAttr,
  escapeHtml,
  getClosestTcElement,
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

  const trackRef = useRef<boolean>(true);

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

  // Load changes on doc switch
  useEffect(() => {
    if (!model.id) return;
    const load = async () => {
      const list = await trackChangesService.getTrackedChanges(model.id);
      if (list && list.length > 0) {
        setTrackedChanges(list);
      }
      setTcLoadedDocId(model.id);
    };
    load();
  }, [model.id]);

  // Persist changes when updated
  useEffect(() => {
    if (!model.id || tcLoadedDocId !== model.id) return;
    trackChangesService.saveChanges(model.id, trackedChanges);
  }, [trackedChanges, model.id, tcLoadedDocId]);

  /**
   * Scans document page DOM nodes and model.pageHtml for <ins> and <del> tags with data-tc-id,
   * extracting text, authors, timestamps, and updating trackedChanges state.
   */
  const syncTrackedChangesFromDOM = useCallback(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const domElements = Array.from(
      document.querySelectorAll("[data-tc-id]")
    ) as HTMLElement[];

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

    // 1. Scan live DOM elements
    domElements.forEach((el) => {
      const id = el.getAttribute("data-tc-id");
      if (!id) return;
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
        "p, h1, h2, h3, h4, h5, h6, table, li, blockquote"
      );
      const contextTag = parentBlock?.tagName;

      if (!changeMap[id]) {
        changeMap[id] = { id, author, timestamp, contextTag, pageId };
      }

      if (tc.includes("ins") || el.tagName === "INS") {
        changeMap[id].insText = (changeMap[id].insText || "") + text;
      } else if (tc.includes("del") || el.tagName === "DEL") {
        changeMap[id].delText = (changeMap[id].delText || "") + text;
      }
    });

    // 2. Scan model.pageHtml to guarantee no changes are missed during render cycles
    if (model.pageHtml) {
      Object.entries(model.pageHtml).forEach(([pageId, html]) => {
        if (!html || !html.includes("data-tc-id")) return;
        const temp = document.createElement("div");
        temp.innerHTML = html;
        const pageTcEls = Array.from(temp.querySelectorAll("[data-tc-id]")) as HTMLElement[];
        pageTcEls.forEach((el) => {
          const id = el.getAttribute("data-tc-id");
          if (!id) return;
          const tc = el.getAttribute("data-tc") || el.tagName.toLowerCase();
          const author = el.getAttribute("data-user") || DEFAULT_AUTHOR;
          const timestamp = Number(el.getAttribute("data-ts") || Date.now());
          const text = el.textContent || "";
          const parentBlock = el.closest(
            "p, h1, h2, h3, h4, h5, h6, table, li, blockquote"
          );
          const contextTag = parentBlock?.tagName;

          if (!changeMap[id]) {
            changeMap[id] = { id, author, timestamp, contextTag, pageId };
          }

          if (tc.includes("ins") || el.tagName === "INS") {
            if (changeMap[id].insText === undefined) changeMap[id].insText = text;
          } else if (tc.includes("del") || el.tagName === "DEL") {
            if (changeMap[id].delText === undefined) changeMap[id].delText = text;
          }
        });
      });
    }

    setTrackedChanges((prev) => {
      const nextNonPending = prev.filter((c) => c.status !== "pending");

      const pendingReconstructed = Object.values(changeMap).map((item) => {
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

        const existing = prev.find((c) => c.id === item.id);
        const comments = existing ? existing.comments : [];
        const label =
          getHumanReadableChangeLabel(
            type,
            originalText,
            newText,
            item.contextTag
          );

        return {
          id: item.id,
          author: item.author,
          timestamp: item.timestamp,
          type,
          originalText,
          newText,
          status: "pending" as const,
          comments,
          label,
          pageId: item.pageId,
        };
      });

      const validPending = pendingReconstructed.filter(
        (c) =>
          c.type === "edit"
            ? (c.newText !== undefined && c.newText.length > 0) || (c.originalText !== undefined && c.originalText.length > 0)
            : c.type === "insert"
            ? c.newText !== undefined && c.newText.length > 0
            : c.originalText !== undefined && c.originalText.length > 0
      );

      return [...nextNonPending, ...validPending];
    });
  }, [model.pageHtml]);

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
    }, 100);
    return () => clearTimeout(timer);
  }, [model.id, syncTrackedChangesFromDOM]);

  const addTrackedChange = useCallback((change: TrackedChange) => {
    setTrackedChanges((prev) => [...prev.filter((c) => c.id !== change.id), change]);
  }, []);

  const addCommentToChange = useCallback((changeId: string, text: string) => {
    if (!text.trim()) return;
    const newComment: Comment = {
      id: `c-${Math.random().toString(36).slice(2, 9)}`,
      author: userRef.current,
      text: text.trim(),
      timestamp: Date.now(),
    };
    setTrackedChanges((prev) =>
      prev.map((c) => (c.id === changeId ? { ...c, comments: [...c.comments, newComment] } : c))
    );
  }, []);

  /**
   * Accepts a specific tracked change by ID:
   * Leaves inserted text intact (unwrapping <ins>), removes deleted text (<del>),
   * syncs editor page HTML, updates status to "accepted", and records history snapshot.
   */
  const acceptChange = useCallback(
    (changeId: string) => {
      const els = document.querySelectorAll(`[data-tc-id="${changeId}"]`);
      const pagesToUpdate = new Set<string>();

      els.forEach((el) => {
        const pageEl = el.closest("[data-editor-page], [data-page-id]");
        const pageId = pageEl?.getAttribute("data-page-id") || pageEl?.getAttribute("data-editor-page");
        const parent = el.parentNode!;
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
      const els = document.querySelectorAll(`[data-tc-id="${changeId}"]`);
      const pagesToUpdate = new Set<string>();

      els.forEach((el) => {
        const pageEl = el.closest("[data-editor-page], [data-page-id]");
        const pageId = pageEl?.getAttribute("data-page-id") || pageEl?.getAttribute("data-editor-page");
        const parent = el.parentNode!;
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
        Array.from(document.querySelectorAll("[data-tc-id]")).map((el) =>
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
        Array.from(document.querySelectorAll("[data-tc-id]")).map((el) =>
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
    const els = Array.from(document.querySelectorAll("[data-tc-id]"));
    if (els.length === 0) return;
    const sel = window.getSelection();
    let currentIdx = -1;
    if (sel && sel.rangeCount > 0) {
      const node = sel.getRangeAt(0).startContainer;
      const currentEl = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
      if (currentEl instanceof HTMLElement) {
        const tcEl = currentEl.closest("[data-tc-id]");
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
    const els = Array.from(document.querySelectorAll("[data-tc-id]"));
    if (els.length === 0) return;
    const sel = window.getSelection();
    let currentIdx = -1;
    if (sel && sel.rangeCount > 0) {
      const node = sel.getRangeAt(0).startContainer;
      const currentEl = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
      if (currentEl instanceof HTMLElement) {
        const tcEl = currentEl.closest("[data-tc-id]");
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

      const inputType = e?.inputType || (e as unknown as { nativeEvent?: { inputType?: string } })?.nativeEvent?.inputType || "";
      if (!inputType) return;

      const isInsert =
        inputType === "insertText" ||
        inputType === "insertCompositionText" ||
        inputType === "insertFromPaste" ||
        inputType === "insertReplacementText";

      if (isInsert) {
        let text = e?.data || (e as unknown as { nativeEvent?: { data?: string } })?.nativeEvent?.data || "";
        if (inputType === "insertFromPaste" && (e as unknown as { dataTransfer?: DataTransfer }).dataTransfer) {
          text = (e as unknown as { dataTransfer: DataTransfer }).dataTransfer.getData("text/plain");
        }
        if (!text && inputType !== "insertCompositionText") return;

        const delEl = getClosestTcElement(range.startContainer, range.startOffset, "del[data-tc]");

        if (delEl) {
          const r = document.createRange();
          r.setStartAfter(delEl);
          r.collapse(true);
          sel.removeAllRanges();
          sel.addRange(r);
        }

        const activeRange = sel.getRangeAt(0);
        const activeInsEl = getClosestTcElement(
          activeRange.startContainer,
          activeRange.startOffset,
          "ins[data-tc]"
        );

        if (!activeInsEl) {
          e.preventDefault();
          const changeId = generateChangeId();
          const author = userRef.current;
          const ts = Date.now();

          const parentBlock = (activeRange.startContainer.nodeType === Node.ELEMENT_NODE
            ? (activeRange.startContainer as HTMLElement)
            : activeRange.startContainer.parentElement
          )?.closest("p, h1, h2, h3, h4, h5, h6, table, li");
          const contextTag = parentBlock?.tagName;

          const isEdit = !activeRange.collapsed;
          const label = getHumanReadableChangeLabel(
            isEdit ? "edit" : "insert",
            isEdit ? activeRange.toString() : "",
            text,
            contextTag
          );

          const newChange: TrackedChange = {
            id: changeId,
            author,
            timestamp: ts,
            type: isEdit ? "edit" : "insert",
            originalText: isEdit ? activeRange.toString() : "",
            newText: text,
            status: "pending",
            comments: [],
            label,
            pageId,
          };
          setTrackedChanges((prev) => [...prev.filter((c) => c.id !== changeId), newChange]);

          const html = activeRange.collapsed
            ? `<ins data-tc="ins" data-tc-id="${changeId}" data-user="${escapeAttr(
                author
              )}" data-ts="${ts}">${escapeHtml(text)}</ins>`
            : `<del data-tc="edit-del" data-tc-id="${changeId}" data-user="${escapeAttr(
                author
              )}" data-ts="${ts}">${escapeHtml(
                activeRange.toString()
              )}</del><ins data-tc="edit-ins" data-tc-id="${changeId}" data-user="${escapeAttr(
                author
              )}" data-ts="${ts}">${escapeHtml(text)}</ins>`;

          const success = document.execCommand("insertHTML", false, html);
          if (!success) {
            if (!activeRange.collapsed) {
              activeRange.deleteContents();
            }
            const temp = document.createElement("div");
            temp.innerHTML = html;
            const frag = document.createDocumentFragment();
            while (temp.firstChild) {
              frag.appendChild(temp.firstChild);
            }
            activeRange.insertNode(frag);
          }

          const el = document.querySelector(`ins[data-tc-id="${changeId}"]`);
          if (el) {
            const textChild = el.firstChild || el;
            const r = document.createRange();
            if (textChild.nodeType === Node.TEXT_NODE) {
              r.setStart(textChild, (textChild as Text).length);
              r.collapse(true);
            } else {
              r.selectNodeContents(el);
              r.collapse(false);
            }
            sel.removeAllRanges();
            sel.addRange(r);
          }

          const targetEl = ((e.target instanceof Element ? e.target : activeRange.startContainer.parentElement) || document.activeElement) as HTMLElement | null;
          if (targetEl && typeof targetEl.dispatchEvent === "function") {
            targetEl.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }
      } else if (inputType.startsWith("delete")) {
        const isBackspace = inputType.endsWith("Backward");

        if (inputType === "deleteByCut") {
          try {
            navigator.clipboard.writeText(range.toString());
          } catch (err) {
            console.error("Failed to copy cut text to clipboard", err);
          }
        }

        if (range.collapsed) {
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

          const startIns = getClosestTcElement(
            targetRange.startContainer,
            targetRange.startOffset,
            "ins[data-tc]"
          );
          const endIns = getClosestTcElement(
            targetRange.endContainer,
            targetRange.endOffset,
            "ins[data-tc]"
          );

          if (startIns && endIns && startIns === endIns) {
            sel.removeAllRanges();
            sel.addRange(originalRange);
            return;
          }

          const startDel = getClosestTcElement(
            targetRange.startContainer,
            targetRange.startOffset,
            "del[data-tc]"
          );
          const endDel = getClosestTcElement(
            targetRange.endContainer,
            targetRange.endOffset,
            "del[data-tc]"
          );
          const delEl = startDel || endDel;

          if (delEl) {
            e.preventDefault();
            const r = document.createRange();
            if (isBackspace) {
              r.setStartBefore(delEl);
            } else {
              r.setStartAfter(delEl);
            }
            r.collapse(true);
            sel.removeAllRanges();
            sel.addRange(r);
            return;
          }

          e.preventDefault();
          const changeId = generateChangeId();
          const author = userRef.current;
          const ts = Date.now();

          const parentBlock = (targetRange.startContainer.nodeType === Node.ELEMENT_NODE
            ? (targetRange.startContainer as HTMLElement)
            : targetRange.startContainer.parentElement
          )?.closest("p, h1, h2, h3, h4, h5, h6, table, li");
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
            comments: [],
            label,
            pageId,
          };
          setTrackedChanges((prev) => [...prev.filter((c) => c.id !== changeId), newChange]);

          const html = `<del data-tc="del" data-tc-id="${changeId}" data-user="${escapeAttr(
            author
          )}" data-ts="${ts}">${escapeHtml(text)}</del>`;

          const success = document.execCommand("insertHTML", false, html);
          if (!success) {
            targetRange.deleteContents();
            const temp = document.createElement("div");
            temp.innerHTML = html;
            const frag = document.createDocumentFragment();
            while (temp.firstChild) {
              frag.appendChild(temp.firstChild);
            }
            targetRange.insertNode(frag);
          }

          const el = document.querySelector(`del[data-tc-id="${changeId}"]`);
          if (el) {
            const r = document.createRange();
            if (isBackspace) {
              r.setStartBefore(el);
            } else {
              r.setStartAfter(el);
            }
            r.collapse(true);
            sel.removeAllRanges();
            sel.addRange(r);
          }

          const targetEl = ((e.target instanceof Element ? e.target : targetRange.startContainer.parentElement) || document.activeElement) as HTMLElement | null;
          if (targetEl && typeof targetEl.dispatchEvent === "function") {
            targetEl.dispatchEvent(new Event("input", { bubbles: true }));
          }
        } else {
          const frag = range.cloneContents();
          const hasBlocks =
            frag.querySelector("p, h1, h2, h3, h4, h5, h6, li, ul, ol, table, tr, td, th, div") !==
            null;

          if (hasBlocks) {
            return;
          }

          const startIns = getClosestTcElement(
            range.startContainer,
            range.startOffset,
            "ins[data-tc]"
          );
          const endIns = getClosestTcElement(
            range.endContainer,
            range.endOffset,
            "ins[data-tc]"
          );

          if (startIns && endIns && startIns === endIns) {
            return;
          }

          e.preventDefault();
          const text = range.toString();
          if (!text) return;

          const changeId = generateChangeId();
          const author = userRef.current;
          const ts = Date.now();

          const parentBlock = (range.startContainer.nodeType === Node.ELEMENT_NODE
            ? (range.startContainer as HTMLElement)
            : range.startContainer.parentElement
          )?.closest("p, h1, h2, h3, h4, h5, h6, table, li");
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
            comments: [],
            label,
            pageId,
          };
          setTrackedChanges((prev) => [...prev.filter((c) => c.id !== changeId), newChange]);

          const html = `<del data-tc="del" data-tc-id="${changeId}" data-user="${escapeAttr(
            author
          )}" data-ts="${ts}">${escapeHtml(text)}</del>`;

          const success = document.execCommand("insertHTML", false, html);
          if (!success) {
            range.deleteContents();
            const temp = document.createElement("div");
            temp.innerHTML = html;
            const frag = document.createDocumentFragment();
            while (temp.firstChild) {
              frag.appendChild(temp.firstChild);
            }
            range.insertNode(frag);
          }

          const el = document.querySelector(`del[data-tc-id="${changeId}"]`);
          if (el) {
            const r = document.createRange();
            r.setStartAfter(el);
            r.collapse(true);
            sel.removeAllRanges();
            sel.addRange(r);
          }

          const targetEl = ((e.target instanceof Element ? e.target : range.startContainer.parentElement) || document.activeElement) as HTMLElement | null;
          if (targetEl && typeof targetEl.dispatchEvent === "function") {
            targetEl.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }
      }
    },
    []
  );

  /**
   * Delegated keydown handler for global shortcut (Ctrl+Shift+E).
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent, _pageId: string) => {
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
  const handleInput = useCallback((_e: Event, _pageId: string) => {
    syncTrackedChangesFromDOM();
  }, [syncTrackedChangesFromDOM]);

  /**
   * Delegated mouse click handler for inline Alt+Click (Accept) & Shift+Click (Reject).
   */
  const handleClick = useCallback(
    (ev: MouseEvent, _pageId: string) => {
      const target = ev.target as HTMLElement;
      const node = target.closest("[data-tc-id]") as HTMLElement;
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
