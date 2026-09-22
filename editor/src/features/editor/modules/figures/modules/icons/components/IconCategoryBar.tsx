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
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
