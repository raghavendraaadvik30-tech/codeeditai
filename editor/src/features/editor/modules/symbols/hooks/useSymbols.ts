import { useCallback } from "react";

import { useEditor } from "../../../context/EditorContext";

import type { SymbolItem } from "../types/symbols.types";

export function useSymbols() {
  const editor = useEditor();

  const insertSymbol = useCallback(
    (symbol: SymbolItem) => {
      editor.insertHTML(symbol.value);
    },
    [editor]
  );

  return {
    editor,
    insertSymbol,
  };
}