import React, { useState } from 'react';
import { Smile, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui/dropdown-menu';
import { useEditor } from '@/features/editor/context/EditorContext';
import { IconGallery, generateIconHTML } from '@/features/editor/icons';

export const IconsSection: React.FC = () => {
  const { insertHTML } = useEditor();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInsertIcon = (iconName: string) => {
    const html = generateIconHTML(iconName);
    insertHTML(html);
  };

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-[#111D29]">
        <div className="flex items-center justify-between">
          {/* Header Icon + Title & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Smile className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Icons
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Icons
              </p>
            </div>
          </div>

          {/* Insert Dropdown Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-md bg-[#0078d4] px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#005a9e] focus:outline-none"
              >
                <span>Insert</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer font-medium text-slate-700 dark:text-slate-200"
              >
                <Smile className="mr-2 h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Browse Icons...</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Icon Gallery Modal */}
      <IconGallery
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInsertIcon={handleInsertIcon}
      />
    </>
  );
};
