import {
  Search,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (
    value: string,
  ) => void;
}

export function StyleSearch({
  value,
  onChange,
}: Props) {
  return (
    <div className="relative">
      <Search
        className="
          size-3.5
          absolute
          left-2.5
          top-1/2
          -translate-y-1/2
          text-muted-foreground
        "
      />

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder="Search styles..."
        className="
          w-full
          h-10
          pl-8
          pr-3
          text-sm
          rounded-lg
          border
          border-border
          bg-surface-muted
          outline-none
          focus:ring-1
          focus:ring-primary
        "
      />
    </div>
  );
}