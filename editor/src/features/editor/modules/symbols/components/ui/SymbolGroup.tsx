import type { SymbolGroup as SymbolGroupType } from "../../types/symbols.types";

import SymbolGrid from "./SymbolGrid";

interface SymbolGroupProps {
  group: SymbolGroupType;
  onSelect: (
    symbol: SymbolGroupType["symbols"][number]
  ) => void;
}

export default function SymbolGroup({
  group,
  onSelect,
}: SymbolGroupProps) {
  return (
    <section className="mb-6">
      {/* GROUP HEADER */}
      <div className="mb-3 flex items-center justify-between">
        <h3
          className="
            text-xs
            font-medium
            uppercase
            tracking-wide
            text-slate-500
          "
        >
          {group.name}
        </h3>

        <span
          className="
            text-xs
            text-slate-400
          "
        >
          {group.symbols.length}
        </span>
      </div>

      {/* SYMBOLS */}
      <SymbolGrid
        symbols={group.symbols}
        onSelect={onSelect}
      />
    </section>
  );
}