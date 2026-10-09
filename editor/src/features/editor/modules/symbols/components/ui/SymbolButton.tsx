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
        border-secondary
        bg-card
        px-2
        text-foreground
        transition
        hover:border-navy-300
        hover:bg-primary/10
        hover:text-primary
        active:scale-95
        dark:border-secondary-foreground
        dark:bg-[#111D29]
        dark:text-primary-foreground
        dark:hover:border-primary
        dark:hover:bg-navy-950
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
