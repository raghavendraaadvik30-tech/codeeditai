import React, { useState } from 'react';
import { Smile, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui/dropdown-menu';
import { useEditor } from '@/features/editor/context/EditorContext';
import IconGallery from './IconGallery';
import { generateIconHTML } from '../utils/iconUtils';

export const IconsSection: React.FC = () => {
  const { insertHTML } = useEditor();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInsertIcon = (iconName: string) => {
    const html = generateIconHTML(iconName);
    insertHTML(html);
  };

  return (
    <>
      <div className="rounded-xl border border-secondary bg-card p-3.5 shadow-xs dark:border-muted dark:bg-[#111D29]">
        <div className="flex items-center justify-between">
          {/* Header Icon + Title & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-50 text-warning-600 dark:bg-warning-950/60 dark:text-warning-400">
              <Smile className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground dark:text-muted-foreground">
                Icons
              </h4>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                Icons
              </p>
            </div>
          </div>

          {/* Insert Dropdown Button */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<button
                type="button"
                className="flex items-center gap-1.5 rounded-lg bg-button-primary px-3 py-1.5 text-xs font-semibold text-button-primary-foreground shadow-xs transition-all hover:bg-button-primary-hover active:bg-button-primary-active focus:outline-none cursor-pointer"
              >
                <span>Insert</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>} />

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer font-medium text-secondary-foreground dark:text-muted-foreground"
              >
                <Smile className="mr-2 h-4 w-4 text-warning-600 dark:text-warning-400" />
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
