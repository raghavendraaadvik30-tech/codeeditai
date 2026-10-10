import { useState } from "react";
import { X, Check } from "lucide-react";
import IconSearch from "./IconSearch";
import IconCategoryBar from "./IconCategoryBar";
import IconPicker from "./IconPicker";
import IconService from "../services/IconService";
import type { IconItem, IconCategory } from "../types/icon";

interface IconGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertIcon: (iconName: string) => void;
}

export default function IconGallery({
  isOpen,
  onClose,
  onInsertIcon,
}: IconGalleryProps) {
  const [category, setCategory] = useState<IconCategory>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<IconItem | null>(null);

  if (!isOpen) return null;

  let icons =
    search.trim() === ""
      ? IconService.getAllIcons()
      : IconService.searchIcons(search);

  if (category !== "All") {
    icons = icons.filter((i) => i.category === category);
  }

  const handleInsert = () => {
    if (!selected) return;
    onInsertIcon(selected.id);
    IconService.insertIcon(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs p-4 animate-in fade-in-0 duration-150">
      <div className="flex flex-col w-full max-w-md rounded-2xl bg-card dark:bg-[#111D29] border border-secondary dark:border-muted shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-muted dark:border-muted">
          <h3 className="text-sm font-bold text-foreground dark:text-muted">
            Insert Icon
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-secondary-foreground dark:hover:text-muted-foreground hover:bg-muted dark:hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <IconSearch value={search} onChange={setSearch} />
          <IconCategoryBar value={category} onChange={setCategory} />
          <IconPicker
            icons={icons}
            selected={selected}
            onSelect={setSelected}
            onDoubleClickInsert={(item) => {
              setSelected(item);
              onInsertIcon(item.id);
              IconService.insertIcon(item);
              onClose();
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-muted dark:bg-secondary/50 border-t border-muted dark:border-muted">
          <span className="text-xs text-muted-foreground">
            {selected ? `Selected: ${selected.name}` : "Select an icon to insert"}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-secondary-foreground dark:text-muted-foreground hover:bg-secondary/60 dark:hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selected}
              onClick={handleInsert}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-button-primary text-xs font-semibold text-button-primary-foreground shadow-xs hover:bg-button-primary-hover active:bg-button-primary-active disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Insert</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
