import React, {
  createContext,
  useContext,
  useRef,
  useState,
} from "react";

import type { ReactNode, RefObject } from "react";

import type { StyleToken } from "@/features/editor/styles/types/styles.types";

export interface EditorContextType {
  activePanel: string;
  setActivePanel: React.Dispatch<React.SetStateAction<string>>;

  leftPanelOpen: boolean;
  setLeftPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;

  aiPanelOpen: boolean;
  setAiPanelOpen: React.Dispatch<React.SetStateAction<boolean>>;

  editorRef: RefObject<HTMLDivElement | null>;

  /**
   * Applies a style token to the current editor selection.
   */
  applyStyleToken: (token: StyleToken) => void;

  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;

  isEditable: boolean;
  setIsEditable: React.Dispatch<React.SetStateAction<boolean>>;

  selection: Selection | null;
  setSelection: React.Dispatch<React.SetStateAction<Selection | null>>;

  focusEditor: () => void;
  insertHTML: (html: string) => void;

  pendingPermissionFile: { fileName: string } | null;
  setPendingPermissionFile: React.Dispatch<React.SetStateAction<{ fileName: string } | null>>;
}

export const EditorContext =
  createContext<EditorContextType | null>(null);

export function EditorProvider({
  children,
}: {
  children: ReactNode;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  const [activePanel, setActivePanelState] = useState<string>(() => {
    try {
      return localStorage.getItem("editor_active_panel") || "document";
    } catch {
      return "document";
    }
  });

  const [leftPanelOpen, setLeftPanelOpenState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("editor_left_panel_open");
      return stored !== null ? stored === "true" : true;
    } catch {
      return true;
    }
  });

  const setActivePanel: React.Dispatch<React.SetStateAction<string>> = (action) => {
    setActivePanelState((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      try {
        localStorage.setItem("editor_active_panel", next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  const setLeftPanelOpen: React.Dispatch<React.SetStateAction<boolean>> = (action) => {
    setLeftPanelOpenState((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      try {
        localStorage.setItem("editor_left_panel_open", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const [aiPanelOpen, setAiPanelOpen] =
    useState<boolean>(false);

  const [zoom, setZoom] =
    useState<number>(100);

  const [isEditable, setIsEditable] =
    useState<boolean>(true);

  const [pendingPermissionFile, setPendingPermissionFile] =
    useState<{ fileName: string } | null>(null);

  const [selection, setSelection] =
    useState<Selection | null>(null);

  const applyStyleToken = (
    token: StyleToken,
  ) => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();

    const selection =
      window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range =
      selection.getRangeAt(0);

    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }

    const span =
      document.createElement("span");

    span.dataset.style = token.name;

    span.style.fontFamily =
      `${token.font}, Calibri, sans-serif`;

    span.style.fontSize =
      `${token.size}pt`;

    span.style.fontWeight =
      String(token.weight);

    if (token.italic) {
      span.style.fontStyle = "italic";
    }

    if (token.underline) {
      span.style.textDecoration =
        "underline";
    }

    if (token.color === "primary") {
      span.style.color =
        "hsl(var(--primary))";
    } else if (token.color) {
      span.style.color = token.color;
    }

    if (token.align) {
      span.style.textAlign =
        token.align;
    }

    if (token.lineHeight) {
      span.style.lineHeight =
        String(token.lineHeight);
    }

    if (token.leftIndent) {
      span.style.paddingLeft =
        `${token.leftIndent}pt`;
    }

    if (token.rightIndent) {
      span.style.paddingRight =
        `${token.rightIndent}pt`;
    }

    if (token.spaceBefore) {
      span.style.marginTop =
        `${token.spaceBefore}pt`;
    }

    if (token.spaceAfter) {
      span.style.marginBottom =
        `${token.spaceAfter}pt`;
    }

    try {
      range.surroundContents(span);
    } catch {
      const fragment =
        range.extractContents();

      span.appendChild(fragment);

      range.insertNode(span);
    }

    selection.removeAllRanges();

    const newRange =
      document.createRange();

    newRange.selectNodeContents(span);

    selection.addRange(newRange);
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const insertHTML = (html: string) => {
    const el = editorRef.current;
    if (el) {
      el.focus();
      document.execCommand("insertHTML", false, html);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      document.execCommand("insertHTML", false, html);
    }
  };

  const value: EditorContextType = {
    activePanel,
    setActivePanel,

    leftPanelOpen,
    setLeftPanelOpen,

    aiPanelOpen,
    setAiPanelOpen,

    editorRef,

    applyStyleToken,

    zoom,
    setZoom,

    isEditable,
    setIsEditable,

    selection,
    setSelection,

    focusEditor,
    insertHTML,

    pendingPermissionFile,
    setPendingPermissionFile,
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context =
    useContext(EditorContext);

  if (!context) {
    throw new Error(
      "useEditor must be used inside EditorProvider",
    );
  }

  return context;
}