import type {
  SymbolGroup,
  SymbolItem,
} from "../types/symbols.types";

export function matchesSymbolSearch(
  symbol: SymbolItem,
  query: string
): boolean {
  if (!query.trim()) {
    return true;
  }

  const normalizedQuery = query
    .trim()
    .toLowerCase();

  return (
    symbol.value
      .toLowerCase()
      .includes(normalizedQuery) ||
    symbol.name
      ?.toLowerCase()
      .includes(normalizedQuery)
  ) ?? false;
}

export function filterSymbolGroups(
  groups: SymbolGroup[],
  query: string
): SymbolGroup[] {
  if (!query.trim()) {
    return groups;
  }

  return groups
    .map((group) => ({
      ...group,
      symbols: group.symbols.filter((symbol) =>
        matchesSymbolSearch(symbol, query)
      ),
    }))
    .filter((group) => group.symbols.length > 0);
}

export function getSymbolCount(
  group: SymbolGroup
): number {
  return group.symbols.length;
}
