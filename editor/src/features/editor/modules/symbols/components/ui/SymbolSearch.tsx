import { Search } from "lucide-react";

interface SymbolSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SymbolSearch({
  value,
  onChange,
}: SymbolSearchProps) {
  return (
    <div
      className="
        flex
        h-10
        items-center
        gap-2
        rounded-lg
        border
        border-slate-200
        bg-white
        px-3
        shadow-sm
        dark:border-slate-700
        dark:bg-[#111D29]
      "
    >
      <Search
        className="
          h-4
          w-4
          shrink-0
          text-slate-400
        "
      />

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder="Search symbols..."
        className="
          w-full
          bg-transparent
          text-sm
          text-slate-900
          outline-none
          placeholder:text-slate-400
          dark:text-white
        "
      />
    </div>
  );
}