import { Search } from "lucide-react";

interface IconSearchProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function IconSearch({
  value,
  onChange,
  placeholder = "Search icons...",
}: IconSearchProps) {
  return (
    <div className="relative flex items-center w-full">
      <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-8 pr-3 text-xs bg-card dark:bg-secondary border border-secondary dark:border-muted rounded-lg outline-none focus:ring-1 focus:ring-primary text-foreground dark:text-muted placeholder:text-muted-foreground"
      />
    </div>
  );
}
