import { useMemo, useState } from "react";

import {
  CASE_ACTIONS,
  FORMATTING_TOOLS,
  ALIGNMENT_TOOLS,
  LIST_TOOLS,
} from "../constants/writing.constants";

import type {
  AlignmentTool,
  CaseAction,
  FormattingTool,
  ListTool,
  ActiveDropdown,
} from "../types/writing.types";

/**
 * Generic search helper.
 *
 * Different writing tools use different properties:
 * - CaseAction -> label
 * - FormattingTool -> name / type / tags
 * - AlignmentTool -> name / type / tags
 * - ListTool -> name / type / tags
 *
 * This helper searches all useful text fields without
 * changing the original objects.
 */
function matchesSearch(
  item: {
    label?: string;
    name?: string;
    type?: string;
    tags?: string[];
  },
  query: string
): boolean {
  const search = query.trim().toLowerCase();

  if (!search) {
    return true;
  }

  const searchableText = [
    item.label ?? "",
    item.name ?? "",
    item.type ?? "",
    ...(item.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(search);
}

/**
 * Filters case actions.
 */
function filterCaseActions(
  actions: CaseAction[],
  query: string
): CaseAction[] {
  return actions.filter((action) =>
    matchesSearch(action, query)
  );
}

/**
 * Filters formatting tools.
 */
function filterFormattingTools(
  tools: FormattingTool[],
  query: string
): FormattingTool[] {
  return tools.filter((tool) =>
    matchesSearch(tool, query)
  );
}

/**
 * Filters alignment tools.
 */
function filterAlignmentTools(
  tools: AlignmentTool[],
  query: string
): AlignmentTool[] {
  return tools.filter((tool) =>
    matchesSearch(tool, query)
  );
}

/**
 * Filters list tools.
 */
function filterListTools(
  tools: ListTool[],
  query: string
): ListTool[] {
  return tools.filter((tool) =>
    matchesSearch(tool, query)
  );
}

export function useWritingTools() {
  const [searchQuery, setSearchQuery] = useState("");

  const [activeDropdown, setActiveDropdown] =
    useState<ActiveDropdown>(null);

  const [showShortcutsModal, setShowShortcutsModal] =
    useState(false);

  /**
   * Case tools
   */
  const caseActions = useMemo(
    () =>
      filterCaseActions(
        CASE_ACTIONS,
        searchQuery
      ),
    [searchQuery]
  );

  /**
   * Formatting tools
   */
  const formattingTools = useMemo(
    () =>
      filterFormattingTools(
        FORMATTING_TOOLS,
        searchQuery
      ),
    [searchQuery]
  );

  /**
   * Alignment tools
   */
  const alignmentTools = useMemo(
    () =>
      filterAlignmentTools(
        ALIGNMENT_TOOLS,
        searchQuery
      ),
    [searchQuery]
  );

  /**
   * List tools
   */
  const listTools = useMemo(
    () =>
      filterListTools(
        LIST_TOOLS,
        searchQuery
      ),
    [searchQuery]
  );

  /**
   * Toggle dropdown.
   */
  const toggleDropdown = (
    dropdown: Exclude<
      ActiveDropdown,
      null
    >
  ) => {
    setActiveDropdown((current) =>
      current === dropdown
        ? null
        : dropdown
    );
  };

  /**
   * Close dropdown.
   */
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