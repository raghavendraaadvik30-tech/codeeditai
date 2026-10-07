import React, { useState } from 'react';
import { Shapes, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui/dropdown-menu';
import { useEditor } from '@/features/editor/context/EditorContext';
import ShapePickerModal from './ShapePickerModal';
import { generateShapeHTML } from '../utils/shapeUtils';

export const ShapesSection: React.FC = () => {
  const { insertHTML } = useEditor();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInsertShape = (shapeType: string) => {
    const html = generateShapeHTML(shapeType);
    insertHTML(html);
  };

  return (
    <>
      <div className="rounded-xl border border-secondary bg-card p-3.5 shadow-xs dark:border-muted dark:bg-[#111D29]">
        <div className="flex items-center justify-between">
          {/* Header Icon + Title & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400">
              <Shapes className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground dark:text-muted-foreground">
                Shapes
              </h4>
              <p className="text-xs text-muted0 dark:text-muted-foreground">
                Basic Shapes
              </p>
            </div>
          </div>

          {/* Insert Dropdown Button */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<button
                type="button"
                className="flex items-center gap-1.5 rounded-md bg-[#0078d4] px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-[#005a9e] focus:outline-none cursor-pointer"
              >
                <span>Insert</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>} />

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer font-medium text-secondary-foreground dark:text-muted-foreground"
              >
                <Shapes className="mr-2 h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <span>Browse Shapes...</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Insert Shape Modal Dialog (Matches Icon gallery modal workflow) */}
      <ShapePickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectShape={handleInsertShape}
      />
    </>
  );
};
