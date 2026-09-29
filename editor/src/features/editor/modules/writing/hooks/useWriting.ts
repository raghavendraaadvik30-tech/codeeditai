import { useCallback } from "react";

import { useEditor } from "../../../context/EditorContext";

import { transformCurrentSelection } from "../utils/writingUtils";

import type {
  AlignmentTool,
  CaseAction,
  FormattingTool,
} from "../types/writing.types";

export function useWriting() {
  const editor = useEditor();

  const {
    exec,
    applyBulletStyle,
    applyNumberingStyle,
    applyMultilevelStyle,
    toggleMultilevelList,
    restoreEditorSelection,
    editorRef,
  } = editor;

  /**
   * Applies a case transformation.
   */
  const applyCase = useCallback(
    (action: CaseAction) => {
      const restored = restoreEditorSelection();

      if (!restored) {
        return;
      }

      const changed = transformCurrentSelection(
        action.transform
      );

      if (changed && editorRef.current) {
        editorRef.current.dispatchEvent(
          new Event("input", {
            bubbles: true,
          })
        );
      }
    },
    [
      restoreEditorSelection,
      editorRef,
    ]
  );

  /**
   * Applies text formatting.
   */
  const applyFormatting = useCallback(
    (tool: FormattingTool) => {
      exec(tool.cmd);
    },
    [exec]
  );

  /**
   * Applies paragraph alignment.
   */
  const applyAlignment = useCallback(
    (tool: AlignmentTool) => {
      exec(tool.cmd);
    },
    [exec]
  );

  /**
   * Applies font color.
   */
  const applyFontColor = useCallback(
    (color: string) => {
      exec("foreColor", color);
    },
    [exec]
  );

  /**
   * Applies text highlight.
   */
  const applyHighlight = useCallback(
    (color: string) => {
      exec("hiliteColor", color);
    },
    [exec]
  );

  /**
   * Removes text highlight.
   */
  const clearHighlight = useCallback(() => {
    exec(
      "hiliteColor",
      "transparent"
    );
  }, [exec]);

  /**
   * Applies bullet list.
   *
   * Values:
   *
   * disc
   * circle
   * square
   *
   * custom:★
   * custom:✓
   * custom:◆
   * custom:➤
   */
  const applyBullets = useCallback(
  (style?: string) => {
    console.log("applyBullets called:", style);

    const restored = restoreEditorSelection();

    console.log("selection restored:", restored);

    if (!restored) {
      console.log("NO SELECTION");
      return;
    }

    if (!editorRef.current) {
      console.log("NO EDITOR REF");
      return;
    }

    /*
     * Normal bullet
     */
    if (!style || style === "disc") {
      exec("insertUnorderedList");
      return;
    }

    /*
     * Circle
     */
    if (style === "circle") {
      exec("insertUnorderedList");

      setTimeout(() => {
        const selection = window.getSelection();

        if (!selection || selection.rangeCount === 0) {
          return;
        }

        let node: Node | null =
          selection.getRangeAt(0).startContainer;

        while (node && node !== editorRef.current) {
          if (node instanceof HTMLUListElement) {
            node.style.listStyleType = "circle";
            break;
          }

          node = node.parentNode;
        }
      }, 0);

      return;
    }

    /*
     * Square
     */
    if (style === "square") {
      exec("insertUnorderedList");

      setTimeout(() => {
        const selection = window.getSelection();

        if (!selection || selection.rangeCount === 0) {
          return;
        }

        let node: Node | null =
          selection.getRangeAt(0).startContainer;

        while (node && node !== editorRef.current) {
          if (node instanceof HTMLUListElement) {
            node.style.listStyleType = "square";
            break;
          }

          node = node.parentNode;
        }
      }, 0);

      return;
    }

    /*
     * Custom bullet
     */
    if (style.startsWith("custom:")) {
      const bulletChar = style.substring(7);

      exec("insertUnorderedList");

      setTimeout(() => {
        const selection = window.getSelection();

        if (!selection || selection.rangeCount === 0) {
          return;
        }

        let node: Node | null =
          selection.getRangeAt(0).startContainer;

        while (node && node !== editorRef.current) {
          if (node instanceof HTMLUListElement) {
            node.style.listStyleType = "none";
            node.setAttribute(
              "data-custom-bullet",
              bulletChar
            );

            node
              .querySelectorAll(":scope > li")
              .forEach((li) => {
                li.setAttribute(
                  "data-custom-bullet",
                  bulletChar
                );

                (li as HTMLElement).style.listStyleType =
                  "none";
              });

            break;
          }

          node = node.parentNode;
        }
      }, 0);
    }
  },
  [restoreEditorSelection, exec, editorRef]
);
  /**
   * Applies numbered list style.
   */
  const applyNumbering = useCallback(
    (style?: string) => {
      const restored =
        restoreEditorSelection();

      if (!restored) {
        return;
      }

      if (style) {
        applyNumberingStyle(style);
        return;
      }

      exec("insertOrderedList");
    },
    [
      restoreEditorSelection,
      applyNumberingStyle,
      exec,
    ]
  );

  /**
   * Applies multilevel list style.
   */
  const applyMultilevel = useCallback(
    (style: string) => {
      const restored =
        restoreEditorSelection();

      if (!restored) {
        return;
      }

      applyMultilevelStyle(style);
    },
    [
      restoreEditorSelection,
      applyMultilevelStyle,
    ]
  );

  /**
   * Toggles multilevel list mode.
   */
  const toggleMultilevel = useCallback(
    () => {
      restoreEditorSelection();
      toggleMultilevelList();
    },
    [
      restoreEditorSelection,
      toggleMultilevelList,
    ]
  );

  return {
    editor,

    applyCase,
    applyFormatting,
    applyAlignment,

    applyFontColor,
    applyHighlight,
    clearHighlight,

    applyBullets,
    applyNumbering,
    applyMultilevel,
    toggleMultilevel,
  };
}