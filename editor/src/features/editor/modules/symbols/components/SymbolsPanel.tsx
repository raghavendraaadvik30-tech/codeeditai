import SymbolSearch from "./ui/SymbolSearch";
import SymbolGroup from "./ui/SymbolGroup";

import { useSymbolsContext } from "../context/SymbolsContext";
import { useSymbols } from "../hooks/useSymbols";

export default function SymbolsPanel() {
  const {
    searchQuery,
    setSearchQuery,
    visibleGroups,
  } = useSymbolsContext();

  const { insertSymbol } = useSymbols();

  return (
    <div
      className="
        flex
        h-full
        min-h-0
        flex-col
        bg-white
        dark:bg-[#07131E]
      "
    >
      {/* SEARCH */}
      <div className="shrink-0 px-4 py-4">
        <SymbolSearch
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* SYMBOL CONTENT */}
      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          px-4
          pb-6
          scrollbar-thin
        "
      >
        {visibleGroups.length === 0 ? (
          <div
            className="
              flex
              h-40
              items-center
              justify-center
              text-sm
              text-slate-500
            "
          >
            No symbols found.
          </div>
        ) : (
          visibleGroups.map((group) => (
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