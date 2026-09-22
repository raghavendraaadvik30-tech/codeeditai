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
      <Search className="absolute left-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-8 pr-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
      />
    </div>
  );
}
