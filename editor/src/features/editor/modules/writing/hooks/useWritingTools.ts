import { useMemo, useState } from "react";

import {
  ALIGNMENT_TOOLS,
  CASE_ACTIONS,
  FORMATTING_TOOLS,
  LIST_TOOLS,
} from "../constants/writing.constants";

import {
  filterAlignmentTools,
  filterCaseActions,
  filterFormattingTools,
  filterListTools,
} from "../utils/writingUtils";

import type { ActiveDropdown } from "../types/writing.types";

export function useWritingTools() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] =
    useState<ActiveDropdown>(null);
  const [showShortcutsModal, setShowShortcutsModal] =
    useState(false);

  const caseActions = useMemo(
    () => filterCaseActions(CASE_ACTIONS, searchQuery),
    [searchQuery]
  );

  const formattingTools = useMemo(
    () =>
      filterFormattingTools(
        FORMATTING_TOOLS,
        searchQuery
      ),
    [searchQuery]
  );

  const alignmentTools = useMemo(
    () =>
      filterAlignmentTools(
        ALIGNMENT_TOOLS,
        searchQuery
      ),
    [searchQuery]
  );

  const listTools = useMemo(
    () => filterListTools(LIST_TOOLS, searchQuery),
    [searchQuery]
  );

  const toggleDropdown = (
    dropdown: Exclude<ActiveDropdown, null>
  ) => {
    setActiveDropdown((current) =>
      current === dropdown ? null : dropdown
    );
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  return {
    searchQuery,
    setSearchQuery,

    activeDropdown,
    setActiveDropdown,
    toggleDropdown,
    closeDropdown,

    showShortcutsModal,
    setShowShortcutsModal,

    caseActions,
    formattingTools,
    alignmentTools,
    listTools,
  };
}