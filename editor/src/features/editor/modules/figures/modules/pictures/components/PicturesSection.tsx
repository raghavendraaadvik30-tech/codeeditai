import React, { useRef, useState, useEffect } from 'react';
import { Image as ImageIcon, ChevronDown, HardDrive, Globe, Type, FileImage } from 'lucide-react';
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
import { generatePictureHTML } from '@/features/editor/modules/figures/utils/figureUtil';

export type PictureInsertMode = "withTitle" | "withoutTitle" | "titleOnly";

export const PicturesSection: React.FC = () => {
  const { insertHTML } = useEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMode, setSelectedMode] = useState<PictureInsertMode>("withTitle");
  const [isDragOver, setIsDragOver] = useState(false);

  // Listen for pf-insert-picture CustomEvents across the window
  useEffect(() => {
    const handleInsertPictureEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        src?: string;
        name?: string;
        mode?: PictureInsertMode;
        caption?: string;
      }>;

      if (!customEvent.detail || !customEvent.detail.src) return;

      const { src, name, mode, caption } = customEvent.detail;
      const html = generatePictureHTML({
        src,
        name: name || "Image",
        mode: mode || "withTitle",
        caption,
      });

      insertHTML(html);
    };

    window.addEventListener("pf-insert-picture", handleInsertPictureEvent);
    return () => {
      window.removeEventListener("pf-insert-picture", handleInsertPictureEvent);
    };
  }, [insertHTML]);

  const processImageFile = (file: File, mode: PictureInsertMode = selectedMode) => {
    if (!file.type.startsWith("image/")) {
      console.warn("Selected file is not a valid image format:", file.type);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result as string;
      if (!imageData) return;

      // Create & dispatch the standard pf-insert-picture event payload
      window.dispatchEvent(
        new CustomEvent("pf-insert-picture", {
          detail: {
            src: imageData,
            name: file.name,
            mode: mode,
          },
        })
      );
    };

    reader.onerror = (err) => {
      console.error("FileReader error reading local image:", err);
    };

    reader.readAsDataURL(file);
  };

  const triggerFilePicker = (mode: PictureInsertMode) => {
    setSelectedMode(mode);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return; // User canceled file picker
    }
    processImageFile(files[0]);
  };

  // Drag and Drop handlers for picture panel
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processImageFile(files[0], selectedMode);
    }
  };

  const handleOnlinePicturesClick = () => {
    window.open(
      'https://www.google.com/search?tbm=isch',
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-xl border p-3.5 shadow-xs transition-all duration-200 ${
        isDragOver
          ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-400/30"
          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111D29]"
      }`}
    >
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
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Pictures
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Insert Pictures
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

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2 text-xs">
                <HardDrive className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>This Device...</span>
              </DropdownMenuSubTrigger>

              <DropdownMenuSubContent className="w-52">
                <DropdownMenuItem
                  onClick={() => triggerFilePicker("withTitle")}
                  className="cursor-pointer text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2"
                >
                  <FileImage className="h-3.5 w-3.5 text-slate-500" />
                  <span>Insert image with title</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => triggerFilePicker("withoutTitle")}
                  className="cursor-pointer text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2"
                >
                  <ImageIcon className="h-3.5 w-3.5 text-slate-500" />
                  <span>Insert image without title</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => triggerFilePicker("titleOnly")}
                  className="cursor-pointer text-xs text-slate-700 dark:text-slate-200 flex items-center gap-2"
                >
                  <Type className="h-3.5 w-3.5 text-slate-500" />
                  <span>Title only</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem
              onClick={handleOnlinePicturesClick}
              className="cursor-pointer font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2 text-xs"
            >
              <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Online Pictures...</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

