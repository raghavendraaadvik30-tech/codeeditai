import { Search } from "lucide-react";

interface WritingSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function WritingSearch({
  value,
  onChange,
}: WritingSearchProps) {
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
        bg-slate-50
        px-3
        shadow-sm
        focus-within:border-blue-300
        focus-within:ring-2
        focus-within:ring-blue-100
      "
    >
      <Search className="h-4 w-4 shrink-0 text-slate-400" />

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search writing tools..."
        className="
          min-w-0
          flex-1
          bg-transparent
          text-sm
          text-slate-700
          outline-none
          placeholder:text-slate-400
        "
      />

      <span
        className="
          hidden
          rounded
          border
          border-slate-200
          bg-white
          px-1.5
          py-0.5
          text-[9px]
          text-slate-400
          sm:block
        "
      >
        Ctrl+F
      </span>
    </div>
  );
}