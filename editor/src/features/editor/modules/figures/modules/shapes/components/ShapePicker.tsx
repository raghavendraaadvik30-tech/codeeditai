import { useState } from "react";
import { Search, Check } from "lucide-react";
import { WORD_SHAPES, SHAPE_CATEGORIES } from "../data/wordShapes";
import type { ShapeCategory, ShapeItem } from "../types/shape";
import ShapeIcon from "./ShapeIcon";

interface ShapePickerProps {
  selectedShape?: ShapeItem | null;
  onSelect?: (shape: ShapeItem) => void;
  onDoubleClickInsert?: (shape: ShapeItem) => void;
  onSelectShape?: (shapeType: string) => void;
}

export default function ShapePicker({
  selectedShape,
  onSelect,
  onDoubleClickInsert,
  onSelectShape,
}: ShapePickerProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ShapeCategory | "All">("All");

  const isSearching = search.trim().length > 0;
  const filterQuery = search.toLowerCase();

  const handleCardClick = (shape: ShapeItem) => {
    if (onSelect) {
      onSelect(shape);
    }
    if (onSelectShape) {
      onSelectShape(shape.id);
    }
  };

  const handleCardDoubleClick = (shape: ShapeItem) => {
    if (onDoubleClickInsert) {
      onDoubleClickInsert(shape);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative flex items-center w-full">
        <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search shapes..."
          className="w-full h-8 pl-8 pr-3 text-xs bg-card dark:bg-secondary border border-secondary dark:border-muted rounded-lg outline-none focus:ring-1 focus:ring-primary text-foreground dark:text-muted placeholder:text-muted-foreground"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setSelectedCategory("All")}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors border ${
            selectedCategory === "All"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted dark:bg-muted text-secondary-foreground dark:text-muted-foreground border-secondary dark:border-secondary-foreground hover:bg-muted"
          }`}
        >
          All
        </button>
        {SHAPE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors border ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted dark:bg-muted text-secondary-foreground dark:text-muted-foreground border-secondary dark:border-secondary-foreground hover:bg-muted"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Shapes Grid by Category */}
      <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
        {SHAPE_CATEGORIES.map((cat) => {
          if (selectedCategory !== "All" && selectedCategory !== cat) return null;

          const categoryShapes = WORD_SHAPES.filter((s) => s.group === cat);
          const filtered = isSearching
            ? categoryShapes.filter(
                (s) =>
                  s.label.toLowerCase().includes(filterQuery) ||
                  s.id.toLowerCase().includes(filterQuery)
              )
            : categoryShapes;

          if (filtered.length === 0) return null;

          return (
            <div key={cat} className="space-y-1.5">
              <div className="text-[10px] font-bold tracking-wider text-muted0 uppercase dark:text-muted-foreground">
                {cat}
              </div>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
                {filtered.map((shape) => {
                  const isSelected = selectedShape?.id === shape.id;

                  return (
                    <button
                      key={`${cat}-${shape.id}`}
                      type="button"
                      title={shape.label}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleCardClick(shape)}
                      onDoubleClick={() => handleCardDoubleClick(shape)}
                      className={`relative flex flex-col items-center justify-center p-2 h-9 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/80 dark:bg-blue-950/60 ring-2 ring-primary/20 text-primary dark:text-primary"
                          : "border-secondary dark:border-muted bg-card dark:bg-secondary text-secondary-foreground dark:text-muted-foreground hover:border-primary hover:bg-primary/60 dark:hover:bg-blue-950/40 hover:text-primary dark:hover:text-primary"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                          <Check className="w-2 h-2 stroke-[3]" />
                        </div>
                      )}
                      <ShapeIcon type={shape.id} className="w-5 h-5 shrink-0" strokeWidth={1.75} />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

