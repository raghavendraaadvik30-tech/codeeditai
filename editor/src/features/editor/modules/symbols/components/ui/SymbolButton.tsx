import type { SymbolItem } from "../../types/symbols.types";

interface SymbolButtonProps {
  symbol: SymbolItem;
  onSelect: (symbol: SymbolItem) => void;
}

export default function SymbolButton({
  symbol,
  onSelect,
}: SymbolButtonProps) {
  const isLong =
    symbol.value.length >= 4 ||
    symbol.value.includes("/");

  return (
    <button
      type="button"
      title={symbol.name ?? symbol.value}
      onClick={() => onSelect(symbol)}
      className="
        flex
        h-12
        w-full
        min-w-0
        items-center
        justify-center
        overflow-hidden
        rounded-lg
        border
        border-slate-200
        bg-white
        px-2
        text-slate-900
        transition
        hover:border-blue-300
        hover:bg-blue-50
        hover:text-blue-600
        active:scale-95
        dark:border-slate-700
        dark:bg-[#111D29]
        dark:text-white
        dark:hover:border-blue-500
        dark:hover:bg-blue-950
      "
    >
      <span
        className={`
          block
          whitespace-nowrap
          text-center
          leading-none
          ${
            isLong
              ? "text-xs font-medium"
              : "text-lg"
          }
        `}
      >
        {symbol.value}
      </span>
    </button>
  );
}