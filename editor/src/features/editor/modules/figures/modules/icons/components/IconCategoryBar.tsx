import type { IconCategory } from "../types/icon";
import { ICON_CATEGORIES } from "../data/iconCategories";

interface IconCategoryBarProps {
  value: IconCategory;
  onChange: (cat: IconCategory) => void;
}

export default function IconCategoryBar({ value, onChange }: IconCategoryBarProps) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-thin">
      {ICON_CATEGORIES.map((cat) => {
        const active = value === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors border ${
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted dark:bg-muted text-secondary-foreground dark:text-muted-foreground border-secondary dark:border-secondary-foreground hover:bg-muted dark:hover:bg-secondary-foreground"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
