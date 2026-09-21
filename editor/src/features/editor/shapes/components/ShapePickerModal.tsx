import { useState } from "react";
import { X, Check } from "lucide-react";
import ShapePicker from "./ShapePicker";
import type { ShapeItem } from "../types/shape";

interface ShapePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectShape: (shapeType: string) => void;
}

export default function ShapePickerModal({
  isOpen,
  onClose,
  onSelectShape,
}: ShapePickerModalProps) {
  const [selectedShape, setSelectedShape] = useState<ShapeItem | null>(null);

  if (!isOpen) return null;

  const handleInsert = () => {
    if (!selectedShape) return;
    onSelectShape(selectedShape.id);
    setSelectedShape(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedShape(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in-0 duration-150">
      <div className="flex flex-col w-full max-w-md rounded-2xl bg-white dark:bg-[#111D29] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Insert Shape
          </h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <ShapePicker
            selectedShape={selectedShape}
            onSelect={(shape) => setSelectedShape(shape)}
            onDoubleClickInsert={(shape) => {
              onSelectShape(shape.id);
              setSelectedShape(null);
              onClose();
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500">
            {selectedShape ? `Selected: ${selectedShape.label}` : "Select a shape to insert"}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedShape}
              onClick={handleInsert}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0078d4] text-xs font-semibold text-white shadow-xs hover:bg-[#005a9e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

