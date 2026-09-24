import { Icon } from "@iconify/react";
import type { IconItem } from "../types/icon";

interface IconPickerProps {
  icons: IconItem[];
  selected: IconItem | null;
  onSelect: (icon: IconItem) => void;
  onDoubleClickInsert?: (icon: IconItem) => void;
}

export default function IconPicker({
  icons,
  selected,
  onSelect,
  onDoubleClickInsert,
}: IconPickerProps) {
  if (icons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <p className="text-xs">No icons found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-[280px] overflow-y-auto p-1 scrollbar-thin">
      {icons.map((item) => {
        const isSelected = selected?.id === item.id;
        return (
          <button
            key={item.id}
            type="button"
            title={item.name}
            onClick={() => onSelect(item)}
            onDoubleClick={() => onDoubleClickInsert?.(item)}
            className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border transition-all ${
              isSelected
                ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-500/30"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-300"
            }`}
          >
            <Icon icon={item.svg} className="h-6 w-6 shrink-0" />
            <span className="text-[10px] font-medium truncate max-w-full leading-none">
              {item.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
