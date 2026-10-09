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
          absolute
          left-3
          top-1/2
          -translate-y-1/2
          h-4
          w-4
          text-muted-foreground
        "
      />

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder="Search styles..."
        className="
          h-10
          w-full
          rounded-lg
          border
          border-border
          bg-background
          dark:bg-card
          pl-9
          pr-3
          text-sm
          text-foreground
          placeholder:text-muted-foreground
          dark:text-foreground
          dark:placeholder:text-muted-foreground
          outline-none
          transition
          focus:border-primary
          focus:ring-2
          focus:ring-primary/10
        "
      />
    </div>
  );
}
