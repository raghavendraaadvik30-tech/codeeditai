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
    <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-md border border-gray-200 bg-white p-1 shadow-lg">
      {NUMBERING_STYLES.map((style) => (
        <button
          key={style.value}
          type="button"
          onClick={() => onSelect(style.value)}
          className="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          <span className="w-7 text-center font-medium">
            {style.preview}
          </span>

          <span>{style.name}</span>
        </button>
      ))}
    </div>
  );
}