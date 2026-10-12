
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import SymbolGroup from "./ui/SymbolGroup";
import { useSymbolsContext } from "../context/SymbolsContext";
import { useSymbols } from "../hooks/useSymbols";
import { SYMBOL_GROUPS } from "../constants/symbols.constants";

export default function SymbolsPanel() {
  const { visibleGroups } = useSymbolsContext();
  const { insertSymbol } = useSymbols();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return visibleGroups;
    }

    return SYMBOL_GROUPS.map((group) => ({
      ...group,
      symbols: group.symbols.filter((symbol) => {
        const value = symbol.value.toLowerCase();
        const name = (symbol.name ?? "").toLowerCase();

        return value.includes(query) || name.includes(query);
      }),
    })).filter((group) => group.symbols.length > 0);
  }, [searchQuery, visibleGroups]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-card dark:bg-[#07131E]">
      {/* Search bar */}
      <div className="shrink-0 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 focus-within:border-primary">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search symbols..."
            aria-label="Search symbols"
            className="h-9 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="rounded p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Symbol list */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 scrollbar-thin">
        {filteredGroups.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <Search className="h-6 w-6" />
            <p>No symbols found.</p>
            <p className="text-xs">Try another symbol or name.</p>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <SymbolGroup
              key={group.name}
              group={group}
              onSelect={insertSymbol}
            />
          ))
        )}
      </div>
    </div>
  );
}
