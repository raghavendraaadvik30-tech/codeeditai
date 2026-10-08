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
        border-secondary
        bg-muted
        px-3
        shadow-sm
        focus-within:border-navy-300
        focus-within:ring-2
        focus-within:ring-primary/15
      "
    >
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />

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
          text-secondary-foreground
          outline-none
          placeholder:text-muted-foreground
        "
      />

      <span
        className="
          hidden
          rounded
          border
          border-secondary
          bg-card
          px-1.5
          py-0.5
          text-[9px]
          text-muted-foreground
          sm:block
        "
      >
        Ctrl+F
      </span>
    </div>
  );
}