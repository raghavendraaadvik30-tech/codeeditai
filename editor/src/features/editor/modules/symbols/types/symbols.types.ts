export interface SymbolItem {
  value: string;
  name?: string;
}

export interface SymbolGroup {
  name: string;
  symbols: SymbolItem[];
}

export interface SymbolsState {
  searchQuery: string;
  groups: SymbolGroup[];
  visibleGroups: SymbolGroup[];
}

export interface SymbolsSearchState {
  query: string;
}