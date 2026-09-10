/*
### `DocumentRuler.tsx` — Description

**Purpose:**
Provides an authentic Microsoft Word-style horizontal document ruler positioned directly below
the ribbon toolbar and above document pages. Renders millimeter/centimeter tick marks,
numbers, left/right margin zones, first-line indent, hanging indent, left indent, and right indent handles.

**Features:**
- Dynamic pixel-perfect scaling matching active section's paperSize, orientation, margins, and zoom.
- Centimeter ticks and numbering:
  - Left margin: countdown ticks & numbers (2, 1) to margin boundary.
  - Active printable area: pure white track with cm ticks & numbers (1, 2, 3 ... 16).
  - Right margin: gray area continuing cm ticks & numbers (17, 18).
  - Authentic Word indent markers (First Line Indent ▼, Hanging Indent ▲, Left Indent ■, Right Indent ▲).
- Interactive drag support with vertical guide line across workspace and tooltip feedback.
- Dark mode compatibility.
*/

import React, { useState, useRef, useCallback } from "react";

export interface DocumentRulerProps {
  pageWidth: number;
  zoom: number;
  marginLeft: number;
  marginRight: number;
  firstLineIndent?: number;
  hangingIndent?: number;
  onMarginChange?: (left: number, right: number) => void;
}

const PX_PER_CM = 96 / 2.54; // ~37.79527559 px per cm

export default function DocumentRuler({
  pageWidth,
  zoom,
  marginLeft,
  marginRight,
  firstLineIndent = 0,
  hangingIndent = 0,
  onMarginChange,
}: DocumentRulerProps) {
  const scale = zoom / 100;
  const scaledWidth = Math.round(pageWidth * scale);

  const cmWidth = PX_PER_CM * scale;
  const quarterCm = cmWidth / 4;

  const [isDragging, setIsDragging] = useState<"left-margin" | "right-margin" | null>(null);
  const [dragPreview, setDragPreview] = useState<{ left: number; right: number } | null>(null);
  const [guideScreenX, setGuideScreenX] = useState<number | null>(null);
  const startXRef = useRef(0);
  const startMarginsRef = useRef({ left: marginLeft, right: marginRight });

  const currentLeft = dragPreview ? dragPreview.left : marginLeft;
  const currentRight = dragPreview ? dragPreview.right : marginRight;

  const effectiveScaledLeft = Math.round(currentLeft * scale);
  const effectiveScaledRight = Math.round(currentRight * scale);
  const effectiveScaledContentEnd = scaledWidth - effectiveScaledRight;

  // Handle Dragging Margins
  const handlePointerDown = useCallback(
    (e: React.PointerEvent, type: "left-margin" | "right-margin") => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(type);
      startXRef.current = e.clientX;
      setGuideScreenX(e.clientX);
      startMarginsRef.current = { left: currentLeft, right: currentRight };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [currentLeft, currentRight]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const deltaScreenPx = e.clientX - startXRef.current;
      const deltaUnscaledPx = deltaScreenPx / scale;

      setGuideScreenX(e.clientX);

      if (isDragging === "left-margin") {
        const minL = 18; // ~0.5 cm
        const maxL = Math.round(pageWidth / 2 - 30);
        const newL = Math.max(minL, Math.min(maxL, Math.round(startMarginsRef.current.left + deltaUnscaledPx)));
        setDragPreview((prev) => ({
          left: newL,
          right: prev ? prev.right : startMarginsRef.current.right,
        }));
      } else if (isDragging === "right-margin") {
        const minR = 18;
        const maxR = Math.round(pageWidth / 2 - 30);
        const newR = Math.max(minR, Math.min(maxR, Math.round(startMarginsRef.current.right - deltaUnscaledPx)));
        setDragPreview((prev) => ({
          left: prev ? prev.left : startMarginsRef.current.left,
          right: newR,
        }));
      }
    },
    [isDragging, scale, pageWidth]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      if (dragPreview && onMarginChange) {
        onMarginChange(dragPreview.left, dragPreview.right);
      }
      setIsDragging(null);
      setDragPreview(null);
      setGuideScreenX(null);
    },
    [isDragging, dragPreview, onMarginChange]
  );

  // Generate Ticks & Numbers matching Word screenshot
  const renderTicks = () => {
    const ticks: React.ReactNode[] = [];

    // 1. LEFT MARGIN (Countdown from 1, 2, 3... backwards from left margin)
    let leftK = 1;
    while (true) {
      const x = effectiveScaledLeft - leftK * quarterCm;
      if (x < 1) break;

      const isCm = leftK % 4 === 0;
      const isHalf = leftK % 2 === 0;
      const cmVal = leftK / 4;

      if (isCm) {
        ticks.push(
          <g key={`left-cm-${cmVal}`}>
            <line x1={x} y1={0} x2={x} y2={4} stroke="#334155" strokeWidth={1} className="dark:stroke-slate-300" />
            <line x1={x} y1={12} x2={x} y2={16} stroke="#334155" strokeWidth={1} className="dark:stroke-slate-300" />
            <text
              x={x}
              y={11.5}
              textAnchor="middle"
              className="fill-slate-700 dark:fill-slate-200 select-none font-sans"
              style={{ fontSize: "9.5px", fontWeight: 600 }}
            >
              {cmVal}
            </text>
          </g>
        );
      } else if (isHalf) {
        ticks.push(
          <g key={`left-half-${leftK}`}>
            <line x1={x} y1={0} x2={x} y2={3.5} stroke="#475569" strokeWidth={0.9} className="dark:stroke-slate-400" />
            <line x1={x} y1={12.5} x2={x} y2={16} stroke="#475569" strokeWidth={0.9} className="dark:stroke-slate-400" />
          </g>
        );
      } else {
        ticks.push(
          <g key={`left-quarter-${leftK}`}>
            <line x1={x} y1={0} x2={x} y2={2} stroke="#64748B" strokeWidth={0.7} className="dark:stroke-slate-500" />
            <line x1={x} y1={14} x2={x} y2={16} stroke="#64748B" strokeWidth={0.7} className="dark:stroke-slate-500" />
          </g>
        );
      }

      leftK++;
    }

    // 2. CONTENT AREA (Numbers 1, 2, 3... up to right margin)
    let contentK = 1;
    while (true) {
      const x = effectiveScaledLeft + contentK * quarterCm;
      if (x >= effectiveScaledContentEnd) break;

      const isCm = contentK % 4 === 0;
      const isHalf = contentK % 2 === 0;
      const cmVal = contentK / 4;

      if (isCm) {
        ticks.push(
          <g key={`body-cm-${cmVal}`}>
            <line x1={x} y1={0} x2={x} y2={4} stroke="#1E293B" strokeWidth={1} className="dark:stroke-slate-200" />
            <line x1={x} y1={12} x2={x} y2={16} stroke="#1E293B" strokeWidth={1} className="dark:stroke-slate-200" />
            <text
              x={x}
              y={11.5}
              textAnchor="middle"
              className="fill-slate-900 dark:fill-slate-100 select-none font-sans"
              style={{ fontSize: "9.5px", fontWeight: 600 }}
            >
              {cmVal}
            </text>
          </g>
        );
      } else if (isHalf) {
        ticks.push(
          <g key={`body-half-${contentK}`}>
            <line x1={x} y1={0} x2={x} y2={3.5} stroke="#475569" strokeWidth={0.9} className="dark:stroke-slate-400" />
            <line x1={x} y1={12.5} x2={x} y2={16} stroke="#475569" strokeWidth={0.9} className="dark:stroke-slate-400" />
          </g>
        );
      } else {
        ticks.push(
          <g key={`body-quarter-${contentK}`}>
            <line x1={x} y1={0} x2={x} y2={2} stroke="#64748B" strokeWidth={0.7} className="dark:stroke-slate-500" />
            <line x1={x} y1={14} x2={x} y2={16} stroke="#64748B" strokeWidth={0.7} className="dark:stroke-slate-500" />
          </g>
        );
      }

      contentK++;
    }

    // 3. RIGHT MARGIN (Continues cm counting past content area)
    let rightK = contentK;
    while (true) {
      const x = effectiveScaledLeft + rightK * quarterCm;
      if (x >= scaledWidth - 1) break;

      const isCm = rightK % 4 === 0;
      const isHalf = rightK % 2 === 0;
      const cmVal = rightK / 4;

      if (isCm) {
        ticks.push(
          <g key={`right-cm-${cmVal}`}>
            <line x1={x} y1={0} x2={x} y2={4} stroke="#334155" strokeWidth={1} className="dark:stroke-slate-300" />
            <line x1={x} y1={12} x2={x} y2={16} stroke="#334155" strokeWidth={1} className="dark:stroke-slate-300" />
            <text
              x={x}
              y={11.5}
              textAnchor="middle"
              className="fill-slate-700 dark:fill-slate-200 select-none font-sans"
              style={{ fontSize: "9.5px", fontWeight: 600 }}
            >
              {cmVal}
            </text>
          </g>
        );
      } else if (isHalf) {
        ticks.push(
          <g key={`right-half-${rightK}`}>
            <line x1={x} y1={0} x2={x} y2={3.5} stroke="#475569" strokeWidth={0.9} className="dark:stroke-slate-400" />
            <line x1={x} y1={12.5} x2={x} y2={16} stroke="#475569" strokeWidth={0.9} className="dark:stroke-slate-400" />
          </g>
        );
      } else {
        ticks.push(
          <g key={`right-quarter-${rightK}`}>
            <line x1={x} y1={0} x2={x} y2={2} stroke="#64748B" strokeWidth={0.7} className="dark:stroke-slate-500" />
            <line x1={x} y1={14} x2={x} y2={16} stroke="#64748B" strokeWidth={0.7} className="dark:stroke-slate-500" />
          </g>
        );
      }

      rightK++;
    }

    return ticks;
  };

  return (
    <div
      className="
        sticky
        top-0
        z-30
        w-full
        shrink-0
        select-none
        border-b
        border-[#CCD3DE]
        bg-[#ECEFF4]
        py-1
        shadow-[0_1px_3px_rgba(0,0,0,0.05)]
        dark:border-slate-800
        dark:bg-[#080E16]
        flex
        justify-center
        min-w-fit
        px-8
      "
      style={{ height: "28px" }}
    >
      <div
        className="relative flex items-center"
        style={{
          width: `${scaledWidth}px`,
          minWidth: `${scaledWidth}px`,
          height: "18px",
        }}
      >
        {/* RULER TRACK SVG */}
        <svg
          width={scaledWidth}
          height={18}
          className="overflow-visible"
          style={{ shapeRendering: "crispEdges" }}
        >
          <defs>
            {/* Indent Marker Metallic Gradient */}
            <linearGradient id="wordMarkerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#E6ECF2" />
              <stop offset="100%" stopColor="#BAC3CE" />
            </linearGradient>
            <filter id="markerShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0.75" stdDeviation="0.75" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* LEFT MARGIN BACKGROUND (Gray) */}
          <rect
            x={0}
            y={1}
            width={effectiveScaledLeft}
            height={16}
            fill="#D4DCE6"
            className="dark:fill-[#1E293B]"
          />

          {/* CONTENT AREA BACKGROUND (Pure White) */}
          <rect
            x={effectiveScaledLeft}
            y={1}
            width={Math.max(0, effectiveScaledContentEnd - effectiveScaledLeft)}
            height={16}
            fill="#FFFFFF"
            className="dark:fill-[#0F172A]"
          />

          {/* RIGHT MARGIN BACKGROUND (Gray) */}
          <rect
            x={effectiveScaledContentEnd}
            y={1}
            width={Math.max(0, scaledWidth - effectiveScaledContentEnd)}
            height={16}
            fill="#D4DCE6"
            className="dark:fill-[#1E293B]"
          />

          {/* MARGIN BOUNDARY DIVIDER LINES */}
          <line
            x1={effectiveScaledLeft}
            y1={0}
            x2={effectiveScaledLeft}
            y2={17}
            stroke="#7B8798"
            strokeWidth={1}
            className="dark:stroke-slate-500"
          />
          <line
            x1={effectiveScaledContentEnd}
            y1={0}
            x2={effectiveScaledContentEnd}
            y2={17}
            stroke="#7B8798"
            strokeWidth={1}
            className="dark:stroke-slate-500"
          />

          {/* TICK MARKS & NUMBERS */}
          {renderTicks()}

          {/* OUTER RULER BORDER */}
          <rect
            x={0.5}
            y={0.5}
            width={scaledWidth - 1}
            height={16}
            fill="none"
            stroke="#7B8798"
            strokeWidth={1}
            className="dark:stroke-slate-600"
          />

          {/* FIRST LINE INDENT MARKER (Top Left Downward Triangle ▼) */}
          <g
            transform={`translate(${effectiveScaledLeft + Math.round(firstLineIndent * scale)}, 0)`}
            className="cursor-ew-resize hover:brightness-105"
            filter="url(#markerShadow)"
            onPointerDown={(e) => handlePointerDown(e, "left-margin")}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <title>First Line Indent</title>
            <polygon
              points="-5,0 5,0 0,6"
              fill="url(#wordMarkerGrad)"
              stroke="#374151"
              strokeWidth={0.9}
            />
          </g>

          {/* HANGING INDENT MARKER (Bottom Left Upward Triangle ▲) */}
          <g
            transform={`translate(${effectiveScaledLeft + Math.round(hangingIndent * scale)}, 12)`}
            className="cursor-ew-resize hover:brightness-105"
            filter="url(#markerShadow)"
            onPointerDown={(e) => handlePointerDown(e, "left-margin")}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <title>Hanging Indent</title>
            <polygon
              points="0,-6 5,0 -5,0"
              fill="url(#wordMarkerGrad)"
              stroke="#374151"
              strokeWidth={0.9}
            />
          </g>

          {/* LEFT INDENT MARKER (Bottom Left Small Box ■) */}
          <g
            transform={`translate(${effectiveScaledLeft + Math.round(hangingIndent * scale)}, 12)`}
            className="cursor-ew-resize hover:brightness-105"
            filter="url(#markerShadow)"
            onPointerDown={(e) => handlePointerDown(e, "left-margin")}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <title>Left Indent</title>
            <rect
              x={-5}
              y={0}
              width={10}
              height={5}
              fill="url(#wordMarkerGrad)"
              stroke="#374151"
              strokeWidth={0.9}
              rx={0.5}
            />
          </g>

          {/* RIGHT INDENT MARKER (Bottom Right Upward Triangle ▲) */}
          <g
            transform={`translate(${effectiveScaledContentEnd}, 16)`}
            className="cursor-ew-resize hover:brightness-105"
            filter="url(#markerShadow)"
            onPointerDown={(e) => handlePointerDown(e, "right-margin")}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <title>Right Indent</title>
            <polygon
              points="0,-7 5,0 -5,0"
              fill="url(#wordMarkerGrad)"
              stroke="#374151"
              strokeWidth={0.9}
            />
          </g>
        </svg>

        {/* ACTIVE MARGIN DRAGGING TOOLTIP */}
        {isDragging && (
          <div
            className="
              absolute
              top-7
              z-50
              rounded
              bg-slate-900/95
              px-2.5
              py-0.5
              text-[11px]
              font-semibold
              text-white
              shadow-lg
              backdrop-blur-xs
              pointer-events-none
              whitespace-nowrap
            "
            style={{
              left:
                isDragging === "left-margin"
                  ? `${effectiveScaledLeft}px`
                  : `${effectiveScaledContentEnd}px`,
              transform: "translateX(-50%)",
            }}
          >
            {isDragging === "left-margin"
              ? `Left Margin: ${(currentLeft / PX_PER_CM).toFixed(2)} cm`
              : `Right Margin: ${(currentRight / PX_PER_CM).toFixed(2)} cm`}
          </div>
        )}
      </div>

      {/* WORD VERTICAL DRAG GUIDELINE */}
      {isDragging && guideScreenX !== null && (
        <div
          className="fixed top-0 bottom-0 pointer-events-none z-50 border-l border-dashed border-blue-600/80 dark:border-blue-400/80"
          style={{ left: `${guideScreenX}px` }}
        />
      )}
    </div>
  );
}
