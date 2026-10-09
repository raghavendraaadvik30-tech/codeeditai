import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import type { SmartArtCategory, SmartArtLayoutId } from '@/features/editor/modules/figures/modules/smartart/types';
import {
  SMARTART_CATEGORIES,
  SMARTART_LAYOUTS,
  ALL_SMARTART_LAYOUTS,
} from '@/features/editor/modules/figures/modules/smartart/constants';
import { SmartArtPreview } from './SmartArtPreviews';

interface ChooseSmartArtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (layoutId: SmartArtLayoutId) => void;
}

/**
 * Custom SmartArt Vector SVG Icons (No container boxes, 32px x 32px colorful graphics)
 */
const SmartArtCategoryIcon: React.FC<{
  category: SmartArtCategory | 'header';
  isSelected?: boolean;
}> = ({ category, isSelected = false }) => {
  if (category === 'header') {
    return (
      <svg className="w-9 h-9 shrink-0" viewBox="0 0 36 36" fill="none">
        <rect x="12" y="3" width="12" height="9" rx="2" fill="#0078d4" />
        <text x="18" y="9.5" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">A</text>
        <path d="M18 12v4M9 16h18M9 16v3M27 16v3" stroke="#0078d4" strokeWidth="2" strokeLinecap="round" />
        <rect x="3" y="19" width="12" height="9" rx="2" fill="#107c41" />
        <text x="9" y="25.5" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">B</text>
        <rect x="21" y="19" width="12" height="9" rx="2" fill="#d83b01" />
        <text x="27" y="25.5" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">C</text>
      </svg>
    );
  }

  if (category === 'List') {
    return (
      <svg className="w-8 h-8 shrink-0" viewBox="0 0 32 32" fill="none">
        <rect x="2" y="4" width="7" height="6" rx="1.5" fill="#0078d4" />
        <rect x="11" y="4" width="19" height="6" rx="1.5" fill="#5b9bd5" fillOpacity={isSelected ? "1" : "0.85"} />
        <rect x="2" y="13" width="7" height="6" rx="1.5" fill="#107c41" />
        <rect x="11" y="13" width="19" height="6" rx="1.5" fill="#70ad47" fillOpacity={isSelected ? "1" : "0.85"} />
        <rect x="2" y="22" width="7" height="6" rx="1.5" fill="#d83b01" />
        <rect x="11" y="22" width="19" height="6" rx="1.5" fill="#ed7d31" fillOpacity={isSelected ? "1" : "0.85"} />
      </svg>
    );
  }

  if (category === 'Process') {
    return (
      <svg className="w-8 h-8 shrink-0" viewBox="0 0 32 32" fill="none">
        <path d="M2 8h7.5l4 8-4 8H2l4-8-4-8z" fill="#0078d4" opacity={isSelected ? "1" : "0.9"} />
        <path d="M10.5 8h7.5l4 8-4 8h-7.5l4-8-4-8z" fill="#107c41" opacity={isSelected ? "1" : "0.9"} />
        <path d="M19 8h7.5l4 8-4 8H19l4-8-4-8z" fill="#d83b01" opacity={isSelected ? "1" : "0.9"} />
      </svg>
    );
  }

  if (category === 'Cycle') {
    return (
      <svg className="w-8 h-8 shrink-0" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="6" r="4.5" fill="#0078d4" />
        <circle cx="24.5" cy="21" r="4.5" fill="#107c41" />
        <circle cx="7.5" cy="21" r="4.5" fill="#d83b01" />
        <path d="M21 7.5a10 10 0 0 1 4 9" stroke="#0078d4" strokeWidth="2" strokeLinecap="round" />
        <path d="M22 25a10 10 0 0 1 -12 0" stroke="#107c41" strokeWidth="2" strokeLinecap="round" />
        <path d="M7 16.5a10 10 0 0 1 4 -9" stroke="#d83b01" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (category === 'Hierarchy') {
    return (
      <svg className="w-8 h-8 shrink-0" viewBox="0 0 32 32" fill="none">
        <rect x="10.5" y="3" width="11" height="7" rx="1.5" fill="#0078d4" />
        <path d="M16 10v6M6 16h20M6 16v4M16 16v4M26 16v4" stroke="#0078d4" strokeWidth="2" strokeLinecap="round" />
        <rect x="1.5" y="20" width="9" height="7" rx="1.5" fill="#5b9bd5" />
        <rect x="11.5" y="20" width="9" height="7" rx="1.5" fill="#107c41" />
        <rect x="21.5" y="20" width="9" height="7" rx="1.5" fill="#d83b01" />
      </svg>
    );
  }

  if (category === 'Matrix') {
    return (
      <svg className="w-8 h-8 shrink-0" viewBox="0 0 32 32" fill="none">
        <rect x="3" y="3" width="12" height="12" rx="2" fill="#0078d4" />
        <rect x="17" y="3" width="12" height="12" rx="2" fill="#107c41" />
        <rect x="3" y="17" width="12" height="12" rx="2" fill="#d83b01" />
        <rect x="17" y="17" width="12" height="12" rx="2" fill="#7030a0" />
      </svg>
    );
  }

  if (category === 'Pyramid') {
    return (
      <svg className="w-8 h-8 shrink-0" viewBox="0 0 32 32" fill="none">
        <path d="M16 3L21.5 11H10.5L16 3Z" fill="#0078d4" />
        <path d="M9.2 12.5H22.8L26.5 19.5H5.5L9.2 12.5Z" fill="#107c41" />
        <path d="M4.2 21H27.8L31 28H1L4.2 21Z" fill="#d83b01" />
      </svg>
    );
  }

  // Text Card
  return (
    <svg className="w-8 h-8 shrink-0" viewBox="0 0 32 32" fill="none">
      <rect x="3" y="3" width="26" height="26" rx="3" fill="#f2f4f7" stroke="#0078d4" strokeWidth="2" />
      <rect x="7" y="7" width="18" height="5" rx="1" fill="#0078d4" />
      <rect x="7" y="15" width="18" height="3" rx="0.5" fill="#70ad47" />
      <rect x="7" y="21" width="12" height="3" rx="0.5" fill="#ed7d31" />
    </svg>
  );
};

export const ChooseSmartArtModal: React.FC<ChooseSmartArtModalProps> = ({
  isOpen,
  onClose,
  onInsert,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SmartArtCategory>('List');
  const [selectedLayoutId, setSelectedLayoutId] = useState<SmartArtLayoutId>('basicList');

  // Sync selected layout if current selection is not in selected category
  const categoryLayouts = useMemo(() => {
    return SMARTART_LAYOUTS[selectedCategory] || [];
  }, [selectedCategory]);

  useEffect(() => {
    if (categoryLayouts.length > 0) {
      const exists = categoryLayouts.some((l) => l.id === selectedLayoutId);
      if (!exists) {
        setSelectedLayoutId(categoryLayouts[0].id);
      }
    }
  }, [selectedCategory, categoryLayouts, selectedLayoutId]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const activeLayout = useMemo(() => {
    return (
      ALL_SMARTART_LAYOUTS.find((l) => l.id === selectedLayoutId) ||
      ALL_SMARTART_LAYOUTS[0]
    );
  }, [selectedLayoutId]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedLayoutId) {
      onInsert(selectedLayoutId);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="smartart-modal-title"
    >
      <div
        className="relative flex flex-col w-full max-w-5xl h-150 bg-card rounded-xl shadow-2xl border border-secondary overflow-hidden text-foreground dark:bg-[#111D29] dark:border-muted dark:text-muted animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL TOP BAR */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-secondary dark:border-muted bg-muted/60 dark:bg-secondary/40">
          <div className="flex items-center gap-2">
            <span id="smartart-modal-title" className="font-bold text-sm text-secondary-foreground dark:text-muted-foreground">
              Choose a SmartArt Graphic
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-secondary-foreground hover:bg-muted dark:hover:text-muted-foreground dark:hover:bg-muted transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-COLUMN BODY */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* COLUMN 1: CATEGORIES SIDEBAR */}
          <div className="w-64 shrink-0 border-r border-secondary dark:border-muted bg-card dark:bg-[#111D29] flex flex-col min-h-0 overflow-hidden">
            {/* Category Header */}
            <div className="p-4 border-b border-secondary/80 dark:border-muted bg-card dark:bg-[#111D29]">
              <div className="flex items-center gap-3">
                <SmartArtCategoryIcon category="header" />
                <div>
                  <h2 className="text-xl font-bold text-navy-900 dark:text-primary-foreground leading-tight">
                    SmartArt
                  </h2>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground font-normal mt-0.5">
                    Choose a SmartArt graphic
                  </p>
                </div>
              </div>
            </div>

            {/* Category List */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2.5 space-y-1">
              {SMARTART_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center justify-between w-full h-13.5 px-3.5 rounded-[10px] transition-colors duration-150 text-left outline-none cursor-pointer ${
                      isSelected
                        ? 'bg-[#EEF5FF] dark:bg-navy-950/70'
                        : 'bg-transparent hover:bg-[#F5F8FC] dark:hover:bg-muted/60'
                    }`}
                    aria-label={`Select ${cat.label} SmartArt category`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <SmartArtCategoryIcon category={cat.id} isSelected={isSelected} />
                      <span
                        className={`text-base leading-tight truncate ${
                          isSelected
                            ? 'font-bold text-brand dark:text-primary'
                            : 'font-semibold text-foreground dark:text-muted-foreground'
                        }`}
                      >
                        {cat.label}
                      </span>
                    </div>

                    <span
                      className={`text-lg font-bold shrink-0 transition-colors ${
                        isSelected
                          ? 'text-brand dark:text-primary'
                          : 'text-muted-foreground'
                      }`}
                    >
                      ›
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2: LAYOUT THUMBNAILS GRID */}
          <div className="flex-1 min-w-0 border-r border-secondary dark:border-muted p-4 overflow-y-auto bg-card dark:bg-[#111D29]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-muted dark:border-muted/80">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
                {selectedCategory} Layouts ({categoryLayouts.length})
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {categoryLayouts.map((layout) => {
                const isSelected = selectedLayoutId === layout.id;

                return (
                  <button
                    key={layout.id}
                    type="button"
                    onClick={() => setSelectedLayoutId(layout.id)}
                    onDoubleClick={() => {
                      setSelectedLayoutId(layout.id);
                      onInsert(layout.id);
                      onClose();
                    }}
                    className={`group flex flex-col items-center justify-between p-2 rounded-lg border transition-all text-center aspect-[4/3] ${
                      isSelected
                        ? 'border-primary bg-primary/60 ring-2 ring-primary/20 shadow-xs dark:border-primary dark:bg-navy-950/30'
                        : 'border-secondary bg-muted/30 hover:border-border hover:bg-muted/50 dark:border-muted dark:bg-secondary/30 dark:hover:border-secondary-foreground'
                    }`}
                    title={layout.name}
                  >
                    <div className="w-full flex-1 flex items-center justify-center p-1 overflow-hidden">
                      <SmartArtPreview
                        layoutId={layout.id}
                        category={layout.category}
                        size="thumbnail"
                        className="w-full h-full max-h-16"
                      />
                    </div>
                    <span
                      className={`mt-1 text-11px leading-tight line-clamp-2 w-full font-medium ${
                        isSelected
                          ? 'text-primary/90 dark:text-navy-300 font-semibold'
                          : 'text-secondary-foreground dark:text-muted-foreground'
                      }`}
                    >
                      {layout.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* COLUMN 3: LARGE PREVIEW & DESCRIPTION */}
          <div className="w-72 shrink-0 p-4 flex flex-col justify-between bg-muted/20 dark:bg-foreground/10 overflow-y-auto">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground mb-3 block">
                Preview
              </span>

              {/* Large graphic preview */}
              <div className="w-full h-44 rounded-lg border border-secondary dark:border-muted bg-card dark:bg-[#0d1620] p-3 flex items-center justify-center shadow-inner">
                {activeLayout && (
                  <SmartArtPreview
                    layoutId={activeLayout.id}
                    category={activeLayout.category}
                    size="large"
                    className="w-full h-full max-h-36"
                  />
                )}
              </div>

              {/* Layout Name & Description */}
              <div className="mt-4">
                <h4 className="text-sm font-bold text-foreground dark:text-primary-foreground">
                  {activeLayout?.name}
                </h4>
                <p className="mt-2 text-xs text-secondary-foreground dark:text-muted-foreground leading-relaxed">
                  {activeLayout?.description}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-secondary/80 dark:border-muted/80 text-11px text-muted-foreground">
              Double-click any layout to insert directly.
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-3 border-t border-secondary dark:border-muted bg-muted/50 dark:bg-secondary/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-md border border-border bg-card text-secondary-foreground hover:bg-muted hover:text-foreground dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground dark:hover:bg-secondary-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-1.5 text-xs font-semibold rounded-md bg-brand text-primary-foreground hover:bg-brand-deep shadow-xs transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
