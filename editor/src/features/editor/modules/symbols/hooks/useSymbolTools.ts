import { useMemo, useState } from "react";

import { SYMBOL_GROUPS } from "../constants/symbols.constants";
import { filterSymbolGroups } from "../utils/symbolsUtils";

export function useSymbolTools() {
  const [searchQuery, setSearchQuery] =
    useState("");

  const visibleGroups = useMemo(
    () =>
      filterSymbolGroups(
        SYMBOL_GROUPS,
        searchQuery
      ),
    [searchQuery]
  );

  return {
    searchQuery,
    setSearchQuery,
    groups: SYMBOL_GROUPS,
    visibleGroups,
  };
}