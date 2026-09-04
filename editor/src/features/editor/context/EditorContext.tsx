import React, {
  createContext,
  useContext,
  useRef,
  useState,
} from "react";

import type { ReactNode, RefObject } from "react";

import type { StyleToken } from "@/features/editor/modules/styles/types/styles.types";

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
}

export const EditorContext =
  createContext<EditorContextType | null>(null);

export function EditorProvider({
  children,
}: {
  children: ReactNode;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  const [activePanel, setActivePanel] =
    useState<string>("writing");

  const [leftPanelOpen, setLeftPanelOpen] =
    useState<boolean>(false);

  const [aiPanelOpen, setAiPanelOpen] =
    useState<boolean>(false);

  const [zoom, setZoom] =
    useState<number>(100);

  const [isEditable, setIsEditable] =
    useState<boolean>(true);

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
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html);
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