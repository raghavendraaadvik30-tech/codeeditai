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
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <p className="text-xs">No icons found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-70 overflow-y-auto p-1 scrollbar-thin">
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
                ? "bg-primary/10 dark:bg-navy-950/60 border-primary text-primary dark:text-primary shadow-sm ring-1 ring-primary/30"
                : "bg-card dark:bg-secondary border-secondary dark:border-muted text-secondary-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-muted/60 hover:border-border"
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
