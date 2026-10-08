import React, { useRef, useState, useLayoutEffect, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import type { ChartModel, TextWrapMode, ChartPositionMode } from '../types/chart.types';
export type { TextWrapMode, ChartPositionMode };

interface ChartLayoutOptionsProps {
  chart: ChartModel;
  isOpen: boolean;
  onClose: () => void;
  onUpdateChart: (updated: ChartModel) => void;
  onSeeMore?: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export const ChartLayoutOptions: React.FC<ChartLayoutOptionsProps> = ({
  chart,
  isOpen,
  onClose,
  onUpdateChart,
  onSeeMore,
  anchorRef,
}) => {
  const selectedWrap: TextWrapMode = chart.wrapMode || 'inline';
  const positionMode: ChartPositionMode = chart.positionMode || 'moveWithText';

  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    side: 'right' | 'left';
    notchTop: number;
  } | null>(null);

  const updatePosition = useCallback(() => {
    if (!isOpen) {
      setPos(null);
      return;
    }

    const anchorEl = anchorRef?.current;
    if (!anchorEl) return;

    const anchorRect = anchorEl.getBoundingClientRect();
    if (anchorRect.width === 0 && anchorRect.height === 0) return;

    const panelEl = panelRef.current;
    const panelWidth = panelEl?.offsetWidth || 230;
    const panelHeight = panelEl?.offsetHeight || 260;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const viewportPadding = 12;
    const gap = 8;

    // Detect top boundary: keep below top ribbon/header if present
    const headerEl = document.querySelector('header');
    const minTop = headerEl ? Math.max(viewportPadding, headerEl.getBoundingClientRect().bottom + 4) : 48;
    const maxBottom = viewportHeight - viewportPadding;

    // Available space on the right and left of the anchor button
    const spaceOnRight = viewportWidth - anchorRect.right;
    const spaceOnLeft = anchorRect.left;

    let side: 'right' | 'left' = 'right';
    let left = anchorRect.right + gap;

    // If there is not enough room on the right, but enough on the left -> flip to left
    if (spaceOnRight < panelWidth + gap + viewportPadding && spaceOnLeft >= panelWidth + gap + viewportPadding) {
      side = 'left';
      left = anchorRect.left - panelWidth - gap;
    } else if (spaceOnRight < panelWidth + gap + viewportPadding && spaceOnLeft < panelWidth + gap + viewportPadding) {
      // If neither side has full space, choose the side with more space and clamp
      if (spaceOnLeft > spaceOnRight) {
        side = 'left';
        left = Math.max(viewportPadding, anchorRect.left - panelWidth - gap);
      } else {
        side = 'right';
        left = Math.min(anchorRect.right + gap, viewportWidth - panelWidth - viewportPadding);
      }
    }

    // Horizontal viewport clamp
    if (left < viewportPadding) {
      left = viewportPadding;
    } else if (left + panelWidth > viewportWidth - viewportPadding) {
      left = viewportWidth - panelWidth - viewportPadding;
    }

    // Vertical placement: align top with anchor button top
    let top = anchorRect.top;

    // Bottom viewport clamp (shift upward if close to bottom)
    if (top + panelHeight > maxBottom) {
      top = maxBottom - panelHeight;
    }

    // Top viewport clamp (keep below header/ribbon)
    if (top < minTop) {
      top = minTop;
    }

    // Triangular notch alignment to the center of the anchor button
    const anchorCenterY = anchorRect.top + anchorRect.height / 2;
    const notchTop = Math.max(12, Math.min(anchorCenterY - top - 6, panelHeight - 20));

    setPos({
      top: Math.round(top),
      left: Math.round(left),
      side,
      notchTop: Math.round(notchTop),
    });
  }, [isOpen, anchorRef]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPos(null);
      return;
    }

    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updatePosition, chart.position?.x, chart.position?.y, chart.width, chart.height]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent | PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        panelRef.current &&
        !panelRef.current.contains(target as Node) &&
        (!anchorRef?.current || !anchorRef.current.contains(target as Node))
      ) {
        onClose();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  const handleSelectWrap = (mode: TextWrapMode) => {
    onUpdateChart({
      ...chart,
      wrapMode: mode,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSelectPositionMode = (mode: ChartPositionMode) => {
    onUpdateChart({
      ...chart,
      positionMode: mode,
      updatedAt: new Date().toISOString(),
    });
  };

  return ReactDOM.createPortal(
    <div
      ref={panelRef}
      data-editor-ui="true"
      style={{
        top: pos ? `${pos.top}px` : '0px',
        left: pos ? `${pos.left}px` : '0px',
        visibility: pos ? 'visible' : 'hidden',
      }}
      className="fixed w-57.5 bg-[#242424] border border-[#444444] rounded-xs shadow-2xl p-3 z-50 text-primary-foreground font-sans select-none animate-in fade-in zoom-in-95 duration-100"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Notch pointing to the Layout Options button */}
      {pos && pos.side === 'right' && (
        <>
          <div
            className="absolute -left-2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-[#242424]"
            style={{ top: `${pos.notchTop}px` }}
          />
          <div
            className="absolute -left-2.25 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-[#444444] -z-10"
            style={{ top: `${pos.notchTop}px` }}
          />
        </>
      )}
      {pos && pos.side === 'left' && (
        <>
          <div
            className="absolute -right-2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-[#242424]"
            style={{ top: `${pos.notchTop}px` }}
          />
          <div
            className="absolute -right-2.25 w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-[#444444] -z-10"
            style={{ top: `${pos.notchTop}px` }}
          />
        </>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-[#383838]">
        <h4 className="text-[13px] font-medium text-primary tracking-wide">
          Layout Options
        </h4>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-primary-foreground p-0.5 rounded transition-colors"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Section 1: In Line with Text */}
      <div className="mt-2.5">
        <p className="text-[11px] font-bold text-primary-foreground mb-1.5">
          In Line with Text
        </p>
        <button
          type="button"
          onClick={() => handleSelectWrap('inline')}
          className={`p-1 rounded-xs border transition-all ${selectedWrap === 'inline'
            ? 'border-primary bg-[#1a1a1a] ring-1 ring-primary'
            : 'border-[#555555] hover:border-border bg-[#1e1e1e]'
            }`}
          title="In Line with Text"
        >
          <svg width="42" height="30" viewBox="0 0 42 30" fill="none">
            {/* Top horizontal blue line */}
            <line x1="4" y1="7" x2="38" y2="7" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            {/* Arch on the left */}
            <path d="M 6 25 C 6 15, 20 15, 20 25" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Two horizontal blue lines beside arch */}
            <line x1="24" y1="19" x2="38" y2="19" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            <line x1="24" y1="25" x2="38" y2="25" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Section 2: With Text Wrapping */}
      <div className="mt-3">
        <p className="text-[11px] font-bold text-primary-foreground mb-1.5">
          With Text Wrapping
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {/* Top and Bottom */}
          <button
            type="button"
            onClick={() => handleSelectWrap('topBottom')}
            className={`p-1 rounded-xs border transition-all flex items-center justify-center ${selectedWrap === 'topBottom'
              ? 'border-primary bg-[#1a1a1a] ring-1 ring-primary'
              : 'border-[#555555] hover:border-border bg-[#1e1e1e]'
              }`}
            title="Top and Bottom"
          >
            <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
              <line x1="3" y1="6" x2="37" y2="6" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 13 22 C 13 12, 27 12, 27 22" stroke="#ffffff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
              <line x1="3" y1="25" x2="37" y2="25" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          {/* 5. Behind Text */}
          <button
            type="button"
            onClick={() => handleSelectWrap('behind')}
            className={`p-1 rounded-xs border transition-all flex items-center justify-center ${selectedWrap === 'behind'
              ? 'border-primary bg-[#1a1a1a] ring-1 ring-primary'
              : 'border-[#555555] hover:border-border bg-[#1e1e1e]'
              }`}
            title="Behind Text"
          >
            <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
              {/* Shaded gray arch in background */}
              <path d="M 13 24 C 13 13, 27 13, 27 24" stroke="#6b7280" strokeWidth="3.2" fill="#3f3f46" strokeLinecap="round" />
              {/* Blue lines over it */}
              <line x1="3" y1="6" x2="37" y2="6" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="12" x2="37" y2="12" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="18" x2="37" y2="18" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="24" x2="37" y2="24" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          {/* 6. In Front of Text */}
          <button
            type="button"
            onClick={() => handleSelectWrap('inFront')}
            className={`p-1 rounded-xs border transition-all flex items-center justify-center ${selectedWrap === 'inFront'
              ? 'border-primary bg-[#1a1a1a] ring-1 ring-primary'
              : 'border-[#555555] hover:border-border bg-[#1e1e1e]'
              }`}
            title="In Front of Text"
          >
            <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
              {/* Blue lines in background */}
              <line x1="3" y1="6" x2="37" y2="6" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="12" x2="37" y2="12" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="18" x2="37" y2="18" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="3" y1="24" x2="37" y2="24" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              {/* White opaque arch in front */}
              <path d="M 13 24 C 13 13, 27 13, 27 24" stroke="#ffffff" strokeWidth="3" fill="#242424" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Section 3: Radio Options */}
      <div className="mt-3.5 space-y-2 text-[11px] text-muted-foreground">
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name={`layout-pos-${chart.id}`}
            checked={positionMode === 'moveWithText'}
            onChange={() => handleSelectPositionMode('moveWithText')}
            className="accent-primary w-3 h-3 cursor-pointer"
          />
          <span className="group-hover:text-primary-foreground flex-1">
            <span className="underline">M</span>ove with text
          </span>
          <span className="text-[10px] text-muted-foreground border border-secondary-foreground rounded-full w-3.5 h-3.5 flex items-center justify-center font-serif">
            i
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio"
            name={`layout-pos-${chart.id}`}
            checked={positionMode === 'fixPosition'}
            onChange={() => handleSelectPositionMode('fixPosition')}
            className="accent-primary w-3 h-3 cursor-pointer"
          />
          <span className="group-hover:text-primary-foreground flex-1">
            Fix positio<span className="underline">n</span> on page
          </span>
          <span className="text-[10px] text-muted-foreground border border-secondary-foreground rounded-full w-3.5 h-3.5 flex items-center justify-center font-serif">
            i
          </span>
        </label>
      </div>

      {/* Bottom Link: See more... */}
      <div className="mt-3 pt-1 text-right">
        <button
          type="button"
          onClick={() => {
            if (onSeeMore) {
              onSeeMore();
            }
          }}
          className="text-[11px] text-primary hover:underline cursor-pointer"
        >
          See more...
        </button>
      </div>
    </div>,
    document.body
  );
};
