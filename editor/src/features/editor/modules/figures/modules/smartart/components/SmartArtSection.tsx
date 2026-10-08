/**
 * --------------------------------------------------------
 * Module: Figures / SmartArt
 * Feature: SmartArt Section Card in Figures Panel
 * Description:
 * Card component for the Figures panel containing the
 * [ Insert ▼ ] dropdown -> "Choose a SmartArt Graphic..."
 * which opens the ChooseSmartArtModal dialog.
 * --------------------------------------------------------
 */

import React, { useState } from 'react';
import { Boxes, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui/dropdown-menu';
import { useEditor } from '@/features/editor/context/EditorContext';
import type { SmartArtLayoutId } from '@/features/editor/modules/figures/modules/smartart/types';
import { createDefaultSmartArtModel, generateSmartArtHTML } from '@/features/editor/modules/figures/modules/smartart/utils';
import { ChooseSmartArtModal } from './ChooseSmartArtModal';

export const SmartArtSection: React.FC = () => {
  const { insertHTML } = useEditor();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInsertSmartArt = (layoutId: SmartArtLayoutId) => {
    const model = createDefaultSmartArtModel(layoutId);
    const html = generateSmartArtHTML(model);
    insertHTML(html);
  };

  return (
    <>
      <div className="rounded-xl border border-secondary bg-card p-3.5 shadow-xs dark:border-muted dark:bg-[#111D29]">
        <div className="flex items-center justify-between">
          {/* SmartArt Header Icon + Title & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground dark:text-muted-foreground">
                SmartArt
              </h4>
              <p className="text-xs text-muted0 dark:text-muted-foreground">
                SmartArt
              </p>
            </div>
          </div>

          {/* Insert Dropdown Button */}
          <DropdownMenu>
            <DropdownMenuTrigger render={<button
                type="button"
                className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-brand-deep focus:outline-none"
              >
                <span>Insert</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>} />

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer font-medium text-secondary-foreground dark:text-muted-foreground"
              >
                <Boxes className="mr-2 h-4 w-4 text-violet-600 dark:text-violet-400" />
                <span>Choose a SmartArt Graphic...</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Choose SmartArt Modal */}
      <ChooseSmartArtModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInsert={handleInsertSmartArt}
      />
    </>
  );
};
