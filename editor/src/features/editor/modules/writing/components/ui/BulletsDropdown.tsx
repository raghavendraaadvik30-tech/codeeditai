interface BulletsDropdownProps {
  onSelect: (style: string) => void;
}

const BULLET_STYLES = [
  {
    name: "Disc",
    value: "disc",
    symbol: "●",
  },
  {
    name: "Circle",
    value: "circle",
    symbol: "○",
  },
  {
    name: "Square",
    value: "square",
    symbol: "■",
  },
];

export default function BulletsDropdown({
  onSelect,
}: BulletsDropdownProps) {
  return (
    <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-md border border-gray-200 bg-white p-1 shadow-lg">
      {BULLET_STYLES.map((style) => (
        <button
          key={style.value}
          type="button"
          onClick={() => onSelect(style.value)}
          className="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
        >
          <span className="w-5 text-center">{style.symbol}</span>
          <span>{style.name}</span>
        </button>
      ))}
    </div>
  );
}