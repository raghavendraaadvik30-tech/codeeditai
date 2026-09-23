import { useCallback } from "react";

import { useEditor } from "../../../context/EditorContext";

import {
  transformCurrentSelection,
} from "../utils/writingUtils";

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
  } = editor;

  const applyCase = useCallback(
    (action: CaseAction) => {
      transformCurrentSelection(action.transform);
    },
    []
  );

  const applyFormatting = useCallback(
    (tool: FormattingTool) => {
      exec(tool.cmd);
    },
    [exec]
  );

  const applyAlignment = useCallback(
    (tool: AlignmentTool) => {
      exec(tool.cmd);
    },
    [exec]
  );

  const applyFontColor = useCallback(
    (color: string) => {
      exec("foreColor", color);
    },
    [exec]
  );

  const applyHighlight = useCallback(
    (color: string) => {
      exec("hiliteColor", color);
    },
    [exec]
  );

  const clearHighlight = useCallback(() => {
    exec("hiliteColor", "transparent");
  }, [exec]);

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

  const applyMultilevel = useCallback(
    (style: string) => {
      applyMultilevelStyle(style);
    },
    [applyMultilevelStyle]
  );

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
