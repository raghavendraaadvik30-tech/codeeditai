import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Image as ImageIcon, ChevronDown, HardDrive, Globe, FileImage } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/shared/components/ui/dropdown-menu';
import { useEditor } from '@/features/editor/context/EditorContext';
import type { PictureInsertMode, PictureInsertEventDetail } from '../types';
import { generatePictureHTML, generateTitleOnlyHTML } from '../utils';
import { pictureService } from '../services';
import { usePictureEvents } from '../hooks';
import { openExternal } from '@/shared/platform';

export type { PictureInsertMode };

export const PicturesSection: React.FC = () => {
  const { insertHTML } = useEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMode, setSelectedMode] = useState<PictureInsertMode>("withTitle");

  useEffect(() => {
    (window as unknown as { __hasPicturesSection?: boolean }).__hasPicturesSection = true;
    return () => {
      (window as unknown as { __hasPicturesSection?: boolean }).__hasPicturesSection = false;
    };
  }, []);

  const handleOnlinePicturesClick = () => {
    void openExternal('https://www.google.com/search?tbm=isch');
  };

  // Listen for pf-insert-picture CustomEvents across the window using the pictures hook
  const handleInsertPictureEvent = useCallback((detail: PictureInsertEventDetail) => {
    const { src, name, mode, caption } = detail;

    if (mode === "titleOnly") {
      const html = generateTitleOnlyHTML(caption || name);
      insertHTML(html);
      return;
    }

    if (!src) return;

    const html = generatePictureHTML({
      src,
      name: name || "Image",
      mode: mode || "withTitle",
      caption,
    });

    insertHTML(html);
  }, [insertHTML]);

  usePictureEvents(handleInsertPictureEvent);

  const processImageFile = (file: File, mode: PictureInsertMode = selectedMode) => {
    pictureService.processImageFile(file, mode);
  };

  const triggerFilePicker = (mode: PictureInsertMode) => {
    setSelectedMode(mode);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };


  const insertPictureOnly = () => {
    triggerFilePicker("withoutTitle");
  };

  const insertPictureAndTitle = () => {
    triggerFilePicker("withTitle");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return; // User canceled file picker
    }
    processImageFile(files[0], selectedMode);
  };

  return (
    <div className="rounded-xl border border-secondary bg-card p-3.5 shadow-xs transition-all duration-200 dark:border-muted dark:bg-[#111D29]">
      {/* Hidden File Input for Native Picture File Selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-center justify-between">
        {/* Header Icon + Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-navy-950/60 dark:text-primary shadow-2xs">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground dark:text-muted-foreground">
              Pictures
            </h4>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground">
              Insert &amp; manage images
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

          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border border-secondary dark:border-muted">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer font-medium text-secondary-foreground dark:text-muted-foreground flex items-center gap-2 text-xs">
                <HardDrive className="h-4 w-4 text-primary dark:text-primary" />
                <span>This Device...</span>
              </DropdownMenuSubTrigger>

              <DropdownMenuSubContent className="w-52 rounded-xl shadow-lg border border-secondary dark:border-muted">
                <DropdownMenuItem
                  onClick={insertPictureAndTitle}
                  className="cursor-pointer text-xs text-secondary-foreground dark:text-muted-foreground flex items-center gap-2"
                >
                  <FileImage className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Insert image with title</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={insertPictureOnly}
                  className="cursor-pointer text-xs text-secondary-foreground dark:text-muted-foreground flex items-center gap-2"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Insert image without title</span>
                </DropdownMenuItem>

              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem
              onClick={handleOnlinePicturesClick}
              className="cursor-pointer font-medium text-secondary-foreground dark:text-muted-foreground flex items-center gap-2 text-xs"
            >
              <Globe className="h-4 w-4 text-primary dark:text-primary" />
              <span>Online Pictures...</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
