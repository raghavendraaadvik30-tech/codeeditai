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
    <div className="relative">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search writing tools..."
        className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-gray-300 focus:bg-white"
      />
    </div>
  );
}