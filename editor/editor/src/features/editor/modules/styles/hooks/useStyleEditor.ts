import {
  useCallback,
  useState,
} from "react";

import type {
  StyleToken,
} from "../types/styles.types";

import {
  styleToModifyValues,
} from "../utils/styleUtil";

export function useStyleEditor() {
  const [target, setTarget] =
    useState<string | null>(null);

  const openEditor = useCallback(
    (style: StyleToken) => {
      setTarget(style.name);
    },
    [],
  );

  const closeEditor =
    useCallback(() => {
      setTarget(null);
    }, []);

  return {
    target,
    openEditor,
    closeEditor,
    styleToValues: styleToModifyValues,
  };
}