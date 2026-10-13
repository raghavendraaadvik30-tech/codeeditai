/**
 * --------------------------------------------------------
 * Module: Links / Navigation
 * Component: PagesStrip
 * Displays document pages matching Microsoft Word Navigation Pages view
 * and user's reference screenshot:
 * - 2-column grid of portrait miniature paper sheets (A4 aspect ratio)
 * - White page card with crisp border and scaled miniature page preview
 * - Centered page number / label printed directly beneath (e.g. "vii", "12", "16", "17")
 * - Currently selected page highlighted with warm amber/gold border & background
 * - Smooth scroll & center document on click
 * --------------------------------------------------------
 */

import { useEffect, useRef, useState } from 'react';
import { File } from 'lucide-react';
import type { PageThumbnailItem } from '../../types/navigation.types';
import { cn } from '@/lib/utils';

interface PagesStripProps {
  pages: PageThumbnailItem[];
  activePageNumber: number;
  activePageId?: string | null;
  onSelectPage: (page: PageThumbnailItem) => void;
  className?: string;
}

/**
 * Thumbnail miniature page preview that dynamically measures
 * its container width and scales the 794x1123 document layout
 * to fit 100% of the miniature paper card perfectly.
 */
function ThumbnailPaperPreview({ html }: { html?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState<number>(0.15);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const width = el.clientWidth;
      if (width > 0) {
        setScale(width / 794);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-white select-none pointer-events-none"
    >
      {html && html.trim().length > 0 ? (
        <div
          className="absolute top-0 left-0 origin-top-left pointer-events-none text-black select-none overflow-hidden p-6 text-[11px] leading-snug [&_table]:border-collapse [&_table]:border [&_table]:border-slate-700 [&_td]:border [&_td]:border-slate-600 [&_td]:p-0.5 [&_th]:border [&_th]:border-slate-700 [&_th]:p-0.5 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-1.5 [&_h3]:text-sm [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
          style={{
            width: '794px',
            height: '1123px',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        /* Fallback realistic mini page lines when raw HTML is not yet populated */
        <div className="flex flex-col w-full h-full p-2.5 space-y-1.5 opacity-60">
          <div className="w-1/2 h-1.5 bg-slate-800 rounded-xs mb-1" />
          <div className="w-full h-1 bg-slate-300 rounded-xs" />
          <div className="w-5/6 h-1 bg-slate-300 rounded-xs" />
          <div className="w-full h-1 bg-slate-300 rounded-xs" />
          <div className="w-4/6 h-1 bg-slate-300 rounded-xs" />
          <div className="my-1.5 w-full border border-slate-300 rounded-xs p-1">
            <div className="w-full h-1 bg-slate-400 mb-1" />
            <div className="w-full h-1 bg-slate-200" />
          </div>
          <div className="w-full h-1 bg-slate-300 rounded-xs" />
          <div className="w-3/4 h-1 bg-slate-300 rounded-xs" />
        </div>
      )}
    </div>
  );
}

export function PagesStrip({
  pages,
  activePageNumber,
  activePageId,
  onSelectPage,
  className,
}: PagesStripProps) {
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  // Auto-scroll active thumbnail card into view within the navigation pane
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [activePageNumber, activePageId]);

  if (pages.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500', className)}>
        <File className="h-8 w-8 mb-2 opacity-40 stroke-[1.5]" />
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          No pages detected
        </p>
        <p className="text-[11px] mt-1 text-slate-500">
          Document pages will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col w-full py-1 space-y-2 select-none', className)}>
      {/* Responsive Grid of Realistic Miniature Pages (Adapts columns dynamically as navigation panel width changes) */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(115px,1fr))] gap-2.5 p-1">
        {pages.map((p) => {
          const isActive =
            (activePageId && p.pageId === activePageId) ||
            p.pageNumber === activePageNumber ||
            p.isActive;

          return (
            <button
              key={p.pageId || p.pageNumber}
              ref={isActive ? activeItemRef : null}
              type="button"
              onClick={() => onSelectPage(p)}
              className={cn(
                'group flex flex-col items-center p-1.5 rounded border-2 transition-all duration-150 cursor-pointer select-none text-center',
                isActive
                  ? 'border-[#F59E0B] bg-[#FEF3C7] shadow-sm dark:bg-amber-950/40 dark:border-[#D97706]'
                  : 'border-transparent hover:border-slate-300 hover:bg-slate-50 dark:hover:border-slate-700 dark:hover:bg-slate-800/40'
              )}
            >
              {/* Miniature Portrait Paper Sheet (White Paper with Crisp Dark Border) */}
              <div
                className="w-full aspect-[1/1.414] bg-white border border-slate-700/80 shadow-xs relative overflow-hidden flex flex-col pointer-events-none select-none rounded-[1px]"
                style={{ backgroundColor: '#ffffff' }}
              >
                <ThumbnailPaperPreview html={p.html} />
              </div>

              {/* Centered Page Number / Label Printed Beneath the Paper Sheet */}
              <div
                className={cn(
                  'mt-1.5 text-xs font-bold transition-colors select-none text-center',
                  isActive
                    ? 'text-slate-900 dark:text-amber-200'
                    : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900'
                )}
              >
                {p.pageLabel || `${p.pageNumber}`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

