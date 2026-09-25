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
   * Applies a case transformation to the current editor selection.
   */
  const applyCase = useCallback(
    (action: CaseAction) => {
      // Restore the selection before the toolbar button takes focus.
      const restored = restoreEditorSelection();

      if (!restored) {
        return;
      }

      const changed = transformCurrentSelection(action.transform);

      if (changed && editorRef.current) {
        editorRef.current.dispatchEvent(
          new Event("input", { bubbles: true })
        );
      }
    },
    [restoreEditorSelection, editorRef]
  );

  /**
   * Applies text formatting such as bold, italic,
   * underline, strikethrough, subscript and superscript.
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
   * Applies text highlight color.
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
    exec("hiliteColor", "transparent");
  }, [exec]);

  /**
   * Applies bullet list style.
   */
  const applyBullets = useCallback(
    (style?: string) => {
      if (style) {
        applyBulletStyle(style);
        return;
      }

      exec("insertUnorderedList");
    },
    [applyBulletStyle, exec]
  );

  /**
   * Applies numbered list style.
   */
  const applyNumbering = useCallback(
    (style?: string) => {
      if (style) {
        applyNumberingStyle(style);
        return;
      }

      exec("insertOrderedList");
    },
    [applyNumberingStyle, exec]
  );

  /**
   * Applies multilevel list style.
   */
  const applyMultilevel = useCallback(
    (style: string) => {
      applyMultilevelStyle(style);
    },
    [applyMultilevelStyle]
  );

  /**
   * Toggles multilevel list mode.
   */
  const toggleMultilevel = useCallback(() => {
    toggleMultilevelList();
  }, [toggleMultilevelList]);

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