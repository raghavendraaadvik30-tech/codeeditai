import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useEditor } from "../../../context/EditorContext";

import { transformCurrentSelection } from "../utils/writingUtils";

import type {
  CaseAction,
  FormattingTool,
  AlignmentTool,
} from "../types/writing.types";

export function useWriting() {
  const editor = useEditor();

  const {
    exec,
    applyNumberingStyle,
    applyMultilevelStyle,
    toggleMultilevelList,
    restoreEditorSelection,
    editorRef,
  } = editor;

  /*
   * Currently selected/applied case button.
   *
   * Example:
   *
   * UPPER CASE -> activeCase = "UPPER CASE"
   * lower case -> activeCase = "lower case"
   */
  const [activeCase, setActiveCase] =
    useState<string | null>(null);

  /*
   * Stores the actual text that is currently selected.
   *
   * This allows us to keep the active button while the
   * same text remains selected.
   */
  const activeSelectionTextRef =
    useRef<string>("");

  /**
   * Applies a case transformation.
   *
   * IMPORTANT:
   *
   * 1. Restore the editor selection.
   * 2. Transform the selected text.
   * 3. Restore the SAME selection.
   * 4. Keep the selected text active.
   * 5. Highlight the selected case button.
   */
  const applyCase = useCallback(
    (action: CaseAction) => {
      /*
       * Restore the selection because the mouse is now
       * interacting with the writing panel.
       */
      const restored = restoreEditorSelection();

      if (!restored) {
        return;
      }

      const selection = window.getSelection();

      if (
        !selection ||
        selection.rangeCount === 0 ||
        selection.isCollapsed
      ) {
        return;
      }

      /*
       * Save the selected text BEFORE transformation.
       */
      const selectedText = selection.toString();

      if (!selectedText) {
        return;
      }

      /*
       * Save it for active-case tracking.
       */
      activeSelectionTextRef.current =
        selectedText;

      /*
       * Transform the selected text.
       *
       * writingUtils is responsible for restoring
       * the actual browser selection after changing
       * the text.
       */
      const changed = transformCurrentSelection(
        action.transform,
        editorRef.current
      );

      if (!changed) {
        return;
      }

      /*
       * Mark this case button as active.
       */
      setActiveCase(action.label);

      /*
       * Notify React/editor that the content changed.
       */
      if (editorRef.current) {
        editorRef.current.dispatchEvent(
          new Event("input", {
            bubbles: true,
          })
        );
      }

      /*
       * Make absolutely sure the editor selection
       * remains active after the DOM update.
       */
      requestAnimationFrame(() => {
        restoreEditorSelection();
      });
    },
    [
      restoreEditorSelection,
      editorRef,
    ]
  );

  /**
   * Clear active case when the user selects
   * completely different text.
   *
   * If the same text is still selected, keep
   * the active case button highlighted.
   */
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();

      if (
        !selection ||
        selection.rangeCount === 0 ||
        selection.isCollapsed
      ) {
        return;
      }

      const currentText =
        selection.toString();

      if (!currentText) {
        return;
      }

      const previousText =
        activeSelectionTextRef.current;

      /*
       * Same selected text:
       * keep the active case.
       */
      if (
        previousText &&
        currentText === previousText
      ) {
        return;
      }

      /*
       * User selected different text.
       * Remove the previous active case.
       */
      setActiveCase(null);

      activeSelectionTextRef.current =
        currentText;
    };

    document.addEventListener(
      "selectionchange",
      handleSelectionChange
    );

    return () => {
      document.removeEventListener(
        "selectionchange",
        handleSelectionChange
      );
    };
  }, []);

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
/**
 * Applies font color while keeping the selected text active.
 *
 * Behavior:
 * Select text
 * → click color
 * → color is applied
 * → same text remains selected
 * → click another color
 * → same selection gets the new color
 */
const applyFontColor = useCallback(
  (color: string) => {
    /*
     * First restore the selection that was saved
     * before the user interacted with the Writing panel.
     */
    const restored = restoreEditorSelection();

    if (!restored) {
      return;
    }

    /*
     * Apply the color to the restored selection.
     */
    exec("foreColor", color);

    /*
     * Tell the editor that its content changed.
     */
    if (editorRef.current) {
      editorRef.current.dispatchEvent(
        new Event("input", {
          bubbles: true,
        })
      );
    }

    /*
     * execCommand can collapse the browser selection.
     *
     * Restore the exact saved selection after the
     * browser finishes updating the DOM.
     */
    requestAnimationFrame(() => {
      restoreEditorSelection();
    });

    /*
     * Extra restoration after the DOM/input event.
     * This helps when the editor rerenders after the
     * input event.
     */
    setTimeout(() => {
      restoreEditorSelection();
    }, 0);
  },
  [
    restoreEditorSelection,
    exec,
    editorRef,
  ]
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
   */
  const applyBullets = useCallback(
    (style?: string) => {
      const restored =
        restoreEditorSelection();

      if (!restored) {
        return;
      }

      if (!editorRef.current) {
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
          const selection =
            window.getSelection();

          if (
            !selection ||
            selection.rangeCount === 0
          ) {
            return;
          }

          let node: Node | null =
            selection
              .getRangeAt(0)
              .startContainer;

          while (
            node &&
            node !== editorRef.current
          ) {
            if (
              node instanceof
              HTMLUListElement
            ) {
              node.style.listStyleType =
                "circle";

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
          const selection =
            window.getSelection();

          if (
            !selection ||
            selection.rangeCount === 0
          ) {
            return;
          }

          let node: Node | null =
            selection
              .getRangeAt(0)
              .startContainer;

          while (
            node &&
            node !== editorRef.current
          ) {
            if (
              node instanceof
              HTMLUListElement
            ) {
              node.style.listStyleType =
                "square";

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
        const bulletChar =
          style.substring(7);

        exec("insertUnorderedList");

        setTimeout(() => {
          const selection =
            window.getSelection();

          if (
            !selection ||
            selection.rangeCount === 0
          ) {
            return;
          }

          let node: Node | null =
            selection
              .getRangeAt(0)
              .startContainer;

          while (
            node &&
            node !== editorRef.current
          ) {
            if (
              node instanceof
              HTMLUListElement
            ) {
              node.style.listStyleType =
                "none";

              node.setAttribute(
                "data-custom-bullet",
                bulletChar
              );

              node
                .querySelectorAll(
                  ":scope > li"
                )
                .forEach((li) => {
                  li.setAttribute(
                    "data-custom-bullet",
                    bulletChar
                  );

                  (
                    li as HTMLElement
                  ).style.listStyleType =
                    "none";
                });

              break;
            }

            node = node.parentNode;
          }
        }, 0);
      }
    },
    [
      restoreEditorSelection,
      exec,
      editorRef,
    ]
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

    /*
     * CASE
     */
    activeCase,
    applyCase,

    /*
     * FORMATTING
     */
    applyFormatting,
    applyAlignment,

    /*
     * COLORS
     */
    applyFontColor,
    applyHighlight,
    clearHighlight,

    /*
     * LISTS
     */
    applyBullets,
    applyNumbering,
    applyMultilevel,
    toggleMultilevel,
  };
}