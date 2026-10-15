/**
 * =============================================================================
 * DocumentRuler.tsx
 * =============================================================================
 *
 * PURPOSE
 *   A Microsoft Word-style horizontal ruler that sits directly above the
 *   document page(s). It shows centimetre ticks and numbers, the grey margin
 *   zones, and the indent / margin handles that the user can drag.
 *
 * HOW TO USE
 *   Mount it ONCE, as the first child of the scrolling workspace (the grey area
 *   that holds the pages), before the pages themselves:
 *
 *       <DocumentRuler zoom={zoom} />
 *
 *   Only `zoom` is normally needed. Everything else has a default
 *   (A4 page, 2.54 cm margins). Pass real values when you have them:
 *
 *       <DocumentRuler
 *         zoom={zoom}
 *         pageWidth={794}
 *         marginLeft={96}
 *         marginRight={96}
 *         onMarginChange={(left, right) => updateSectionMargins(left, right)}
 *       />
 *
 * UNITS
 *   All props are in CSS pixels at 100% zoom (96 px = 1 inch = 2.54 cm).
 *   The component multiplies by `zoom / 100` internally, so you never have to
 *   pre-scale the values you pass in.
 *
 * LAYOUT OF THE RULER (left to right)
 *   | grey left margin | white printable area | grey right margin |
 *   Numbers count DOWN in the left margin (2, 1), UP inside the printable area
 *   (1, 2, 3 ...) and keep counting in the right margin (17, 18 ...), exactly
 *   like Word.
 *
 * MARKERS (all draggable)
 *   - First-line indent  (down triangle, top left)
 *   - Hanging indent     (up triangle, bottom left)
 *   - Left indent        (small box, bottom left)
 *   - Right indent       (up triangle, bottom right)
 *   NOTE: at the moment every left-side marker drags the LEFT MARGIN and the
 *   right marker drags the RIGHT MARGIN. Per-paragraph indent dragging is not
 *   implemented yet (see the TODO near the markers).
 *
 * DRAGGING
 *   While dragging we show a tooltip ("Left Margin: 2.54 cm") and a dashed
 *   vertical guide line across the whole screen. The new margins are only
 *   reported to the parent (onMarginChange) when the mouse button is released.
 *
 * DARK MODE
 *   Light colours are set with normal attributes; dark colours with Tailwind
 *   `dark:` classes on the same SVG element.
 * =============================================================================
 */

import React, { useState, useRef, useCallback, useEffect } from "react";

/* -------------------------------------------------------------------------- */
/* Props                                                                      */
/* -------------------------------------------------------------------------- */

export interface DocumentRulerProps {
  /** Zoom in percent (100 = actual size). Default 100. */
  zoom?: number;
  /** Page width in px at 100% zoom. Default 794 (A4 portrait). */
  pageWidth?: number;
  /** Left margin in px at 100% zoom. Default 96 (2.54 cm). */
  marginLeft?: number;
  /** Right margin in px at 100% zoom. Default 96 (2.54 cm). */
  marginRight?: number;
  /** First-line indent in px, measured from the left margin. Default 0. */
  firstLineIndent?: number;
  /** Hanging / left indent in px, measured from the left margin. Default 0. */
  hangingIndent?: number;
  /**
   * Called ONCE when the user releases a dragged margin handle.
   * Values are px at 100% zoom. Optional: without it the ruler still works
   * but only remembers the margins internally.
   */
  onMarginChange?: (left: number, right: number) => void;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

/** CSS pixels per centimetre (96 dpi / 2.54 cm per inch). ~37.795 */
const PX_PER_CM = 96 / 2.54;

/** Which part of the ruler a tick belongs to (controls its colours). */
type Zone = "left" | "body" | "right";

/** Which margin handle is currently being dragged. */
type DragTarget = "left-margin" | "right-margin";

export default function DocumentRuler({
  zoom = 100,
  pageWidth = 794,
  marginLeft = 96,
  marginRight = 96,
  firstLineIndent = 0,
  hangingIndent = 0,
  onMarginChange,
}: DocumentRulerProps) {
  /* ------------------------------------------------------------------------ */
  /* 1. Scaling                                                               */
  /* ------------------------------------------------------------------------ */

  // 100% zoom -> 1, 150% zoom -> 1.5 ...
  const scale = zoom / 100;

  // Width of the ruler on screen. Must equal the on-screen page width so the
  // numbers line up with the page below.
  const scaledWidth = Math.round(pageWidth * scale);

  // On-screen size of 1 cm, and of a quarter cm (the smallest tick spacing).
  const cmWidth = PX_PER_CM * scale;
  const quarterCm = cmWidth / 4;

  /* ------------------------------------------------------------------------ */
  /* 2. State                                                                 */
  /* ------------------------------------------------------------------------ */

  // Local copy of the margins, so dragging still works when the parent does not
  // control the margins. It is re-synced whenever the parent passes new values.
  const [margins, setMargins] = useState({
    left: marginLeft,
    right: marginRight,
  });
  useEffect(() => {
    setMargins({ left: marginLeft, right: marginRight });
  }, [marginLeft, marginRight]);

  // Which handle is being dragged (null = nothing is being dragged).
  const [isDragging, setIsDragging] = useState<DragTarget | null>(null);

  // Live margins while dragging. Shown on screen but NOT sent to the parent
  // until the pointer is released (keeps the editor from re-rendering on every
  // mouse move).
  const [dragPreview, setDragPreview] = useState<{
    left: number;
    right: number;
  } | null>(null);

  // Screen X position of the mouse, used to draw the dashed guide line.
  const [guideScreenX, setGuideScreenX] = useState<number | null>(null);

  // Remembered at the moment a drag starts so every move is measured from the
  // same starting point (prevents drift).
  const startXRef = useRef(0);
  const startMarginsRef = useRef({ left: margins.left, right: margins.right });

  // The margins we actually draw: the live preview while dragging, otherwise
  // the committed values.
  const currentLeft = dragPreview ? dragPreview.left : margins.left;
  const currentRight = dragPreview ? dragPreview.right : margins.right;

  // Same values converted to on-screen pixels.
  const effectiveScaledLeft = Math.round(currentLeft * scale);
  const effectiveScaledRight = Math.round(currentRight * scale);
  // X position where the printable area ends (start of the right margin).
  const effectiveScaledContentEnd = scaledWidth - effectiveScaledRight;

  /* ------------------------------------------------------------------------ */
  /* 3. Dragging handlers                                                     */
  /* ------------------------------------------------------------------------ */

  /** Mouse/touch pressed on a marker: start a drag. */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent, type: DragTarget) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(type);
      startXRef.current = e.clientX;
      setGuideScreenX(e.clientX);
      startMarginsRef.current = { left: currentLeft, right: currentRight };

      // Pointer capture keeps the drag working even if the mouse leaves the
      // tiny marker while moving fast.
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [currentLeft, currentRight]
  );

  /** Pointer moved: work out the new margin and store it as a preview. */
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      e.preventDefault();

      // How far the mouse moved, converted back to "100% zoom" pixels.
      const deltaUnscaledPx = (e.clientX - startXRef.current) / scale;

      setGuideScreenX(e.clientX);

      // Limits: at least ~0.5 cm, and never more than just under half the page
      // (so the two margins can never cross over each other).
      const minMargin = 18;
      const maxMargin = Math.round(pageWidth / 2 - 30);

      if (isDragging === "left-margin") {
        // Dragging right makes the left margin larger.
        const newLeft = Math.max(
          minMargin,
          Math.min(
            maxMargin,
            Math.round(startMarginsRef.current.left + deltaUnscaledPx)
          )
        );
        setDragPreview((prev) => ({
          left: newLeft,
          right: prev ? prev.right : startMarginsRef.current.right,
        }));
      } else {
        // Dragging right makes the right margin SMALLER, so subtract.
        const newRight = Math.max(
          minMargin,
          Math.min(
            maxMargin,
            Math.round(startMarginsRef.current.right - deltaUnscaledPx)
          )
        );
        setDragPreview((prev) => ({
          left: prev ? prev.left : startMarginsRef.current.left,
          right: newRight,
        }));
      }
    },
    [isDragging, scale, pageWidth]
  );

  /** Pointer released: commit the preview and tell the parent. */
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;

      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Capture may already be released; safe to ignore.
      }

      if (dragPreview) {
        setMargins(dragPreview); // remember locally
        onMarginChange?.(dragPreview.left, dragPreview.right); // tell parent
      }

      // Reset all drag state.
      setIsDragging(null);
      setDragPreview(null);
      setGuideScreenX(null);
    },
    [isDragging, dragPreview, onMarginChange]
  );

  /* ------------------------------------------------------------------------ */
  /* 4. Tick marks and numbers                                                */
  /* ------------------------------------------------------------------------ */

  /**
   * Draws ONE tick (and a number for whole centimetres).
   *
   * @param zone  which part of the ruler ("left" | "body" | "right")
   * @param k     tick index counted in quarter-cm steps from the left margin
   *              edge (so k = 4 is 1 cm, k = 2 is half a cm, odd k = quarter)
   * @param x     horizontal position of the tick in on-screen px
   *
   * Tick style by size:
   *   - whole cm : longest tick + number
   *   - half cm  : medium tick
   *   - quarter  : short tick
   * Ticks are drawn at the top AND bottom of the ruler, with the number in the
   * middle, like Word.
   */
  const renderTick = (zone: Zone, k: number, x: number) => {
    const isCm = k % 4 === 0;
    const isHalf = k % 2 === 0;
    const cmVal = k / 4; // the number printed on whole-cm ticks
    const key = `${zone}-${k}`;

    // The printable area uses darker colours than the grey margins.
    const cmStroke = zone === "body" ? "#1E293B" : "#334155";
    const numberClass =
      zone === "body"
        ? "fill-foreground dark:fill-muted-foreground select-none font-sans"
        : "fill-secondary-foreground dark:fill-muted-foreground select-none font-sans";

    if (isCm) {
      return (
        <g key={key}>
          <line x1={x} y1={0} x2={x} y2={4} stroke={cmStroke} strokeWidth={1} className="dark:stroke-muted-foreground" />
          <line x1={x} y1={12} x2={x} y2={16} stroke={cmStroke} strokeWidth={1} className="dark:stroke-muted-foreground" />
          <text
            x={x}
            y={11.5}
            textAnchor="middle"
            className={numberClass}
            style={{ fontSize: "9.5px", fontWeight: 600 }}
          >
            {cmVal}
          </text>
        </g>
      );
    }

    if (isHalf) {
      return (
        <g key={key}>
          <line x1={x} y1={0} x2={x} y2={3.5} stroke="#475569" strokeWidth={0.9} className="dark:stroke-muted-foreground" />
          <line x1={x} y1={12.5} x2={x} y2={16} stroke="#475569" strokeWidth={0.9} className="dark:stroke-muted-foreground" />
        </g>
      );
    }

    // Quarter-cm tick
    return (
      <g key={key}>
        <line x1={x} y1={0} x2={x} y2={2} stroke="#64748B" strokeWidth={0.7} className="dark:stroke-muted-foreground" />
        <line x1={x} y1={14} x2={x} y2={16} stroke="#64748B" strokeWidth={0.7} className="dark:stroke-muted-foreground" />
      </g>
    );
  };

  /** Builds every tick for the three zones of the ruler. */
  const renderTicks = () => {
    const ticks: React.ReactNode[] = [];

    // ZONE 1 - LEFT MARGIN
    // Start at the margin edge and walk LEFT until we hit the ruler's edge.
    // The numbers here count down towards the margin (2, 1).
    for (let k = 1; ; k++) {
      const x = effectiveScaledLeft - k * quarterCm;
      if (x < 1) break;
      ticks.push(renderTick("left", k, x));
    }

    // ZONE 2 - PRINTABLE AREA (white)
    // Start at the margin edge and walk RIGHT until the right margin begins.
    // The numbers count up (1, 2, 3 ...).
    let contentK = 1;
    for (; ; contentK++) {
      const x = effectiveScaledLeft + contentK * quarterCm;
      if (x >= effectiveScaledContentEnd) break;
      ticks.push(renderTick("body", contentK, x));
    }

    // ZONE 3 - RIGHT MARGIN
    // Carry on from where the printable area stopped so the numbers keep
    // counting (17, 18 ...) until the ruler's right edge.
    for (let k = contentK; ; k++) {
      const x = effectiveScaledLeft + k * quarterCm;
      if (x >= scaledWidth - 1) break;
      ticks.push(renderTick("right", k, x));
    }

    return ticks;
  };

  /**
   * Props shared by every draggable marker: cursor, shadow and the three
   * pointer handlers. `type` says which margin the marker controls.
   */
  const markerProps = (type: DragTarget) => ({
    className: "cursor-ew-resize hover:brightness-105",
    filter: "url(#markerShadow)",
    onPointerDown: (e: React.PointerEvent) => handlePointerDown(e, type),
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
  });

  /* ------------------------------------------------------------------------ */
  /* 5. Render                                                                */
  /* ------------------------------------------------------------------------ */

  return (
    // Outer bar: full width, centres the ruler, and sticks to the top of the
    // scrolling workspace so it stays visible while the pages scroll.
    // `print:hidden` keeps it out of printed output.
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
        dark:border-muted
        dark:bg-[#080E16]
        flex
        justify-center
        min-w-fit
        px-8
        print:hidden
      "
      style={{ height: "28px" }}
    >
      {/* Inner box: exactly as wide as the page, so ticks align with it. */}
      <div
        className="relative flex items-center"
        style={{
          width: `${scaledWidth}px`,
          minWidth: `${scaledWidth}px`,
          height: "18px",
        }}
      >
        {/* The ruler itself is one SVG (crisp lines, easy to scale). */}
        <svg
          width={scaledWidth}
          height={18}
          className="overflow-visible"
          style={{ shapeRendering: "crispEdges" }}
        >
          {/* Reusable gradient + shadow for the indent markers (Word look). */}
          <defs>
            <linearGradient id="wordMarkerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#E6ECF2" />
              <stop offset="100%" stopColor="#BAC3CE" />
            </linearGradient>
            <filter id="markerShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0.75" stdDeviation="0.75" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* --- BACKGROUND ZONES ------------------------------------------ */}

          {/* Left margin: grey */}
          <rect x={0} y={1} width={effectiveScaledLeft} height={16} fill="#D4DCE6" className="dark:fill-[#1E293B]" />

          {/* Printable area: white */}
          <rect
            x={effectiveScaledLeft}
            y={1}
            width={Math.max(0, effectiveScaledContentEnd - effectiveScaledLeft)}
            height={16}
            fill="#FFFFFF"
            className="dark:fill-[#0F172A]"
          />

          {/* Right margin: grey */}
          <rect
            x={effectiveScaledContentEnd}
            y={1}
            width={Math.max(0, scaledWidth - effectiveScaledContentEnd)}
            height={16}
            fill="#D4DCE6"
            className="dark:fill-[#1E293B]"
          />

          {/* Thin lines where the grey margins meet the white area */}
          <line x1={effectiveScaledLeft} y1={0} x2={effectiveScaledLeft} y2={17} stroke="#7B8798" strokeWidth={1} className="dark:stroke-muted-foreground" />
          <line x1={effectiveScaledContentEnd} y1={0} x2={effectiveScaledContentEnd} y2={17} stroke="#7B8798" strokeWidth={1} className="dark:stroke-muted-foreground" />

          {/* --- TICKS AND NUMBERS ----------------------------------------- */}
          {renderTicks()}

          {/* Outer border drawn on top of everything */}
          <rect
            x={0.5}
            y={0.5}
            width={Math.max(0, scaledWidth - 1)}
            height={16}
            fill="none"
            stroke="#7B8798"
            strokeWidth={1}
            className="dark:stroke-muted-foreground"
          />

          {/* --- MARKERS ----------------------------------------------------
              TODO: first-line / hanging / left indent markers currently drag
              the LEFT MARGIN. To support real paragraph indents, give them
              their own drag type and callbacks (e.g. onIndentChange).        */}

          {/* First-line indent: down triangle at the top */}
          <g
            transform={`translate(${effectiveScaledLeft + Math.round(firstLineIndent * scale)}, 0)`}
            {...markerProps("left-margin")}
          >
            <title>First Line Indent</title>
            <polygon points="-5,0 5,0 0,6" fill="url(#wordMarkerGrad)" stroke="#374151" strokeWidth={0.9} />
          </g>

          {/* Hanging indent: up triangle at the bottom */}
          <g
            transform={`translate(${effectiveScaledLeft + Math.round(hangingIndent * scale)}, 12)`}
            {...markerProps("left-margin")}
          >
            <title>Hanging Indent</title>
            <polygon points="0,-6 5,0 -5,0" fill="url(#wordMarkerGrad)" stroke="#374151" strokeWidth={0.9} />
          </g>

          {/* Left indent: small box under the hanging indent triangle */}
          <g
            transform={`translate(${effectiveScaledLeft + Math.round(hangingIndent * scale)}, 12)`}
            {...markerProps("left-margin")}
          >
            <title>Left Indent</title>
            <rect x={-5} y={0} width={10} height={5} fill="url(#wordMarkerGrad)" stroke="#374151" strokeWidth={0.9} rx={0.5} />
          </g>

          {/* Right indent: up triangle at the right edge of the printable area */}
          <g
            transform={`translate(${effectiveScaledContentEnd}, 16)`}
            {...markerProps("right-margin")}
          >
            <title>Right Indent</title>
            <polygon points="0,-7 5,0 -5,0" fill="url(#wordMarkerGrad)" stroke="#374151" strokeWidth={0.9} />
          </g>
        </svg>

        {/* Tooltip shown only while dragging, e.g. "Left Margin: 2.54 cm".
            Positioned under the handle being dragged. */}
        {isDragging && (
          <div
            className="
              absolute
              top-7
              z-50
              rounded
              bg-foreground/95
              px-2.5
              py-0.5
              text-[11px]
              font-semibold
              text-primary-foreground
              shadow-lg
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

      {/* Dashed vertical guide line across the whole screen while dragging
          (like Word), so the user can see where the new margin will fall on
          the page. `fixed` + screen X makes it ignore scrolling/zoom. */}
      {isDragging && guideScreenX !== null && (
        <div
          className="fixed top-0 bottom-0 pointer-events-none z-50 border-l border-dashed border-primary/80"
          style={{ left: `${guideScreenX}px` }}
        />
      )}
    </div>
  );
}