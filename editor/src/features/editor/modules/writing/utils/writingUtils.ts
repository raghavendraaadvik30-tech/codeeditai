import type {
  AlignmentTool,
  CaseAction,
  FormattingTool,
  ListTool,
} from "../types/writing.types";

/* ============================================================
   SEARCH
============================================================ */

export function matchesWritingSearch(
  name: string,
  query: string,
  tags: string[] = []
): boolean {
  if (!query.trim()) {
    return true;
  }

  const normalizedQuery = query.trim().toLowerCase();

  return (
    name.toLowerCase().includes(normalizedQuery) ||
    tags.some((tag) =>
      tag.toLowerCase().includes(normalizedQuery)
    )
  );
}

/* ============================================================
   FILTER CASE TOOLS
============================================================ */

export function filterCaseActions(
  actions: CaseAction[],
  query: string
): CaseAction[] {
  return actions.filter((action) =>
    matchesWritingSearch(
      action.label,
      query,
      action.tags
    )
  );
}

/* ============================================================
   FILTER FORMATTING TOOLS
============================================================ */

export function filterFormattingTools(
  tools: FormattingTool[],
  query: string
): FormattingTool[] {
  return tools.filter((tool) =>
    matchesWritingSearch(
      tool.name,
      query,
      tool.tags
    )
  );
}

/* ============================================================
   FILTER ALIGNMENT TOOLS
============================================================ */

export function filterAlignmentTools(
  tools: AlignmentTool[],
  query: string
): AlignmentTool[] {
  return tools.filter((tool) =>
    matchesWritingSearch(
      tool.name,
      query,
      tool.tags
    )
  );
}

/* ============================================================
   FILTER LIST TOOLS
============================================================ */

export function filterListTools(
  tools: ListTool[],
  query: string
): ListTool[] {
  return tools.filter((tool) =>
    matchesWritingSearch(
      tool.name,
      query,
      tool.tags
    )
  );
}

/* ============================================================
   TRANSFORM SELECTION
============================================================ */

export function transformCurrentSelection(
  transform: (value: string) => string
): boolean {
  const selection = window.getSelection();

  if (
    !selection ||
    selection.rangeCount === 0 ||
    selection.isCollapsed
  ) {
    return false;
  }

  document.execCommand(
    "insertText",
    false,
    transform(selection.toString())
  );

  return true;
}

/* ============================================================
   HIGHLIGHT SEARCH TEXT
============================================================ */

export function escapeRegExp(value: string): string {
  return value.replace(
    /[-/\\^$*+?.()|[\]{}]/g,
    "\\$&"
  );
}