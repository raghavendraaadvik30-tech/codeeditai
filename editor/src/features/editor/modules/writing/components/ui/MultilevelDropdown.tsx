interface MultilevelDropdownProps {
  onSelect: (style: string) => void;
}

const MULTILEVEL_STYLES = [
  {
    name: "1 → 1.1 → 1.1.1",
    value: "decimal",
    preview: (
      <>
        <div>1. Heading</div>
        <div className="pl-3">1.1 Subheading</div>
        <div className="pl-6">1.1.1 Section</div>
      </>
    ),
  },
  {
    name: "1 → 1.1 → 1.1.1 (Nested)",
    value: "nested-decimal",
    preview: (
      <>
        <div>1. Heading</div>
        <div className="pl-3">1.1 Subheading</div>
        <div className="pl-6">1.1.1 Section</div>
      </>
    ),
  },
];

export default function MultilevelDropdown({
  onSelect,
}: MultilevelDropdownProps) {
  return (
    <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-md border border-gray-200 bg-white p-1 shadow-lg">
      {MULTILEVEL_STYLES.map((style) => (
        <button
          key={style.value}
          type="button"
          onClick={() => onSelect(style.value)}
          className="w-full rounded px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          <div className="mb-1 font-medium">
            {style.name}
          </div>

          <div className="text-xs leading-5 text-gray-500">
            {style.preview}
          </div>
        </button>
      ))}
    </div>
  );
}