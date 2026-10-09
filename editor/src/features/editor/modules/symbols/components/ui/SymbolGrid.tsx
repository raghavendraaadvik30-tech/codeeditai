import type { SymbolItem } from "../../types/symbols.types";

import SymbolButton from "./SymbolButton";

interface SymbolGridProps {
  symbols: SymbolItem[];
  onSelect: (symbol: SymbolItem) => void;
}

export default function SymbolGrid({
  symbols,
  onSelect,
}: SymbolGridProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {symbols.map((symbol, index) => (
        <SymbolButton
          key={`${symbol.value}-${index}`}
          symbol={symbol}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
