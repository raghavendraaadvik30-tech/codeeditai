interface NumberingDropdownProps {
  onSelect: (style: string) => void;
}

const NUMBERING_STYLES = [
  {
    name: "1, 2, 3",
    value: "decimal",
    preview: "1.",
  },
  {
    name: "a, b, c",
    value: "lower-alpha",
    preview: "a.",
  },
  {
    name: "A, B, C",
    value: "upper-alpha",
    preview: "A.",
  },
  {
    name: "i, ii, iii",
    value: "lower-roman",
    preview: "i.",
  },
  {
    name: "I, II, III",
    value: "upper-roman",
    preview: "I.",
  },
];

export default function NumberingDropdown({
  onSelect,
}: NumberingDropdownProps) {
  return (
    <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-md border border-secondary bg-card p-1 shadow-lg">
      {NUMBERING_STYLES.map((item) => (
        <button
          key={item.value}
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onSelect(item.value)}
          className="flex w-full items-center gap-4 rounded px-3 py-2 text-left text-sm text-secondary-foreground hover:bg-muted"
        >
          <span className="w-6">
            {item.preview}
          </span>

          <span>
            {item.name}
          </span>
        </button>
      ))}
    </div>
  );
}