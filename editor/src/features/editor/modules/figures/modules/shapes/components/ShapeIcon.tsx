interface ShapeIconProps {
  type: string;
  className?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export default function ShapeIcon({
  type,
  className = "w-5 h-5",
  fill: fillVal = "none",
  stroke = "#000000",
  strokeWidth = 1.5,
}: ShapeIconProps) {
  const t = type.toLowerCase();

  // --------------------------------------------------------------------------
  // 1. LINES & CONNECTORS (Group: "Lines")
  // --------------------------------------------------------------------------
  if (t === "line") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill="none" stroke={stroke} strokeWidth={strokeWidth}>
        <line x1="2" y1="22" x2="22" y2="2" />
      </svg>
    );
  }
  if (t === "arrow-line") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill="none" stroke={stroke} strokeWidth={strokeWidth}>
        <line x1="2" y1="22" x2="22" y2="2" />
        <polyline points="14 2 22 2 22 10" />
      </svg>
    );
  }
  if (t === "double-arrow-line") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill="none" stroke={stroke} strokeWidth={strokeWidth}>
        <line x1="2" y1="22" x2="22" y2="2" />
        <polyline points="14 2 22 2 22 10" />
        <polyline points="2 14 2 22 10 22" />
      </svg>
    );
  }
  if (t === "elbow") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill="none" stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M2 4 v14 h18" />
      </svg>
    );
  }
  if (t === "elbow-arrow") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill="none" stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M2 4 v14 h18" />
        <polyline points="15 13 20 18 15 23" />
      </svg>
    );
  }
  if (t === "elbow-double-arrow") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill="none" stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M2 4 v14 h18" />
        <polyline points="15 13 20 18 15 23" />
        <polyline points="7 4 2 4 2 9" />
      </svg>
    );
  }
  if (t === "curved-connector") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill="none" stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M2 4 C 12 4, 12 20, 22 20" />
      </svg>
    );
  }
  if (t === "curved-arrow") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill="none" stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M2 4 C 12 4, 12 20, 22 20" />
        <polyline points="16 15 22 20 17 23" />
      </svg>
    );
  }
  if (t === "curved-double-arrow") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill="none" stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M2 4 C 12 4, 12 20, 22 20" />
        <polyline points="16 15 22 20 17 23" />
        <polyline points="8 4 2 4 2 9" />
      </svg>
    );
  }
  if (t === "curve") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill="none" stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M2 18 Q 12 2, 22 18" />
      </svg>
    );
  }
  if (t === "freeform") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill="none" stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M2 18 L 8 6 L 14 16 L 22 4" />
      </svg>
    );
  }
  if (t === "scribble") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill="none" stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M2 16 Q 7 2 12 16 T 22 8" />
      </svg>
    );
  }

  // --------------------------------------------------------------------------
  // 2. RECTANGLES (Group: "Rectangles")
  // --------------------------------------------------------------------------
  if (t === "rectangle") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <rect x="1" y="1" width="22" height="22" rx="1" />
      </svg>
    );
  }
  if (t === "rounded-rectangle") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <rect x="1" y="1" width="22" height="22" rx="6" />
      </svg>
    );
  }
  if (t === "rounded-single-corner") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M1 7 A 6 6 0 0 1 7 1 H 23 V 23 H 1 Z" />
      </svg>
    );
  }
  if (t === "snipped-single-corner") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M1 7 L 7 1 H 23 V 23 H 1 Z" />
      </svg>
    );
  }
  if (t === "snipped-same-side") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M1 7 L 7 1 H 17 L 23 7 V 23 H 1 Z" />
      </svg>
    );
  }
  if (t === "snipped-diagonal") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M1 7 L 7 1 H 23 V 17 L 17 23 H 1 Z" />
      </svg>
    );
  }
  if (t === "snip-round-single") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M1 7 L 7 1 H 17 A 6 6 0 0 1 23 7 V 23 H 1 Z" />
      </svg>
    );
  }

  // --------------------------------------------------------------------------
  // 3. BLOCK ARROWS (Group: "Block Arrows")
  // --------------------------------------------------------------------------
  if (t === "right-arrow") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M1 8 h12 V4 l10 8 -10 8 v-4 H1 Z" />
      </svg>
    );
  }
  if (t === "left-arrow") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M23 8 h-12 V4 l-10 8 10 8 v-4 H23 Z" />
      </svg>
    );
  }
  if (t === "up-arrow") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M8 23 v-12 H4 l8-10 8 10 h-4 v12 Z" />
      </svg>
    );
  }
  if (t === "down-arrow") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M8 1 v12 H4 l8 10 8-10 h-4 V1 Z" />
      </svg>
    );
  }
  if (t === "left-right-arrow") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M7 8 h10 V4 l6 8 -6 8 v-4 H7 v4 l-6-8 6-8 Z" />
      </svg>
    );
  }
  if (t === "up-down-arrow") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M8 7 v10 H4 l8 6 8-6 h-4 V7 h4 l-8-6 -8 6 Z" />
      </svg>
    );
  }
  if (t === "quad-arrow") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M9 9 V4 L5 4 L12 0 L19 4 H15 V9 H20 V5 L24 12 L20 19 V15 H15 V20 H19 L12 24 L5 20 H9 V15 H4 V19 L0 12 L4 5 H9 Z" />
      </svg>
    );
  }
  if (t === "bent-up-arrow") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M1 22 V9 h8 V4 l8 8 -8 8 v-4 H5 v7 Z" />
      </svg>
    );
  }
  if (t === "uturn-arrow") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M22 22 V9 A 7 7 0 0 0 8 9 v4 H4 l6 8 6-8 h-4 V9 a 3 3 0 0 1 6 0 v13 Z" />
      </svg>
    );
  }
  if (t === "chevron") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <polygon points="1,2 16,12 1,22 8,12" />
      </svg>
    );
  }
  if (t === "pentagon-arrow") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <polygon points="1,4 16,4 23,12 16,20 1,20" />
      </svg>
    );
  }

  // --------------------------------------------------------------------------
  // 4. BASIC SHAPES (Group: "Basic Shapes")
  // --------------------------------------------------------------------------
  if (t === "text-box") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <rect x="1" y="1" width="22" height="22" rx="1" strokeDasharray="3 3" />
        <text x="12" y="15" textAnchor="middle" fontSize="10" fill={stroke} stroke="none" fontWeight="bold">A</text>
      </svg>
    );
  }
  if (t === "oval" || t === "circle") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <ellipse cx="12" cy="12" rx="11" ry="11" />
      </svg>
    );
  }
  if (t === "triangle") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <polygon points="12,1 1,23 23,23" />
      </svg>
    );
  }
  if (t === "right-triangle") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <polygon points="1,1 1,23 23,23" />
      </svg>
    );
  }
  if (t === "diamond") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <polygon points="12,1 23,12 12,23 1,12" />
      </svg>
    );
  }
  if (t === "parallelogram") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <polygon points="5,1 23,1 19,23 1,23" />
      </svg>
    );
  }
  if (t === "trapezoid") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <polygon points="5,1 19,1 23,23 1,23" />
      </svg>
    );
  }
  if (t === "pentagon") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <polygon points="12,1 23,8 19,23 5,23 1,8" />
      </svg>
    );
  }
  if (t === "hexagon") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <polygon points="12,1 23,6 23,18 12,23 1,18 1,6" />
      </svg>
    );
  }
  if (t === "heptagon") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <polygon points="12,1 21,5 23,15 17,23 7,23 1,15 3,5" />
      </svg>
    );
  }
  if (t === "octagon") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <polygon points="7,1 17,1 23,7 23,17 17,23 7,23 1,17 1,7" />
      </svg>
    );
  }
  if (t === "decagon") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <polygon points="12,1 18,3 23,8 23,16 18,21 12,23 6,21 1,16 1,8 6,3" />
      </svg>
    );
  }
  if (t === "pie") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M12 12 L12 1 A11 11 0 1 1 1 12 Z" />
      </svg>
    );
  }
  if (t === "chord") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M1 12 A11 11 0 0 1 23 12 Z" />
      </svg>
    );
  }
  if (t === "teardrop") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M12 1 A11 11 0 0 1 23 12 C23 18.07 18.07 23 12 23 C5.93 23 1 18.07 1 12 A11 11 0 0 1 12 1 Z" />
      </svg>
    );
  }
  if (t === "frame") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <rect x="1" y="1" width="22" height="22" />
        <rect x="5" y="5" width="14" height="14" />
      </svg>
    );
  }
  if (t === "half-frame") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M1 23 V1 H23 V5 H5 V23 Z" />
      </svg>
    );
  }
  if (t === "corner") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M1 1 H23 V5 H5 V23 H1 Z" />
      </svg>
    );
  }
  if (t === "l-shape") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M1 1 H9 V15 H23 V23 H1 Z" />
      </svg>
    );
  }
  if (t === "arc") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill="none" stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M1 23 A22 22 0 0 1 23 1" />
      </svg>
    );
  }
  if (t === "donut") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <circle cx="12" cy="12" r="11" />
        <circle cx="12" cy="12" r="5" />
      </svg>
    );
  }
  if (t === "smiley") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <circle cx="12" cy="12" r="11" />
        <path d="M7 14s1.5 3 5 3 5-3 5-3" />
        <line x1="8.5" y1="8.5" x2="8.51" y2="8.5" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="15.5" y1="8.5" x2="15.51" y2="8.5" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (t === "heart") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    );
  }
  if (t === "lightning") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <polygon points="14,1 3,13 13,13 10,23 21,11 11,11" />
      </svg>
    );
  }
  if (t === "sun") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    );
  }
  if (t === "moon") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    );
  }
  if (t === "cloud") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M19 11h-1.26A7 7 0 1 0 8 21h11a4.5 4.5 0 0 0 0-9z" />
      </svg>
    );
  }

  // --------------------------------------------------------------------------
  // 5. EQUATION SHAPES (Group: "Equation Shapes")
  // --------------------------------------------------------------------------
  if (t === "plus") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <line x1="1" y1="12" x2="23" y2="12" />
      </svg>
    );
  }
  if (t === "minus") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <line x1="1" y1="12" x2="23" y2="12" />
      </svg>
    );
  }
  if (t === "multiply") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <line x1="2" y1="2" x2="22" y2="22" />
        <line x1="22" y1="2" x2="2" y2="22" />
      </svg>
    );
  }
  if (t === "divide") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <circle cx="12" cy="4" r="2" fill={stroke} />
        <line x1="1" y1="12" x2="23" y2="12" />
        <circle cx="12" cy="20" r="2" fill={stroke} />
      </svg>
    );
  }
  if (t === "equal") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <line x1="1" y1="8" x2="23" y2="8" />
        <line x1="1" y1="16" x2="23" y2="16" />
      </svg>
    );
  }

  // --------------------------------------------------------------------------
  // 6. FLOWCHART (Group: "Flowchart")
  // --------------------------------------------------------------------------
  if (t === "flow-process") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <rect x="1" y="4" width="22" height="16" rx="1" />
      </svg>
    );
  }
  if (t === "flow-decision") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <polygon points="12,1 23,12 12,23 1,12" />
      </svg>
    );
  }
  if (t === "flow-data") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <polygon points="5,4 23,4 19,20 1,20" />
      </svg>
    );
  }
  if (t === "flow-document") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M1 2 V19 C6 23 12 17 18 21 C21 23 23 21 23 19 V2 Z" />
      </svg>
    );
  }
  if (t === "flow-terminator") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <rect x="1" y="4" width="22" height="16" rx="8" />
      </svg>
    );
  }
  if (t === "flow-database") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <ellipse cx="12" cy="5" rx="11" ry="4" />
        <path d="M1 5 v14 c0 2.2 4.9 4 11 4 s11-1.8 11-4 V5" />
        <path d="M1 12 c0 2.2 4.9 4 11 4 s11-1.8 11-4" />
      </svg>
    );
  }

  // --------------------------------------------------------------------------
  // 7. STARS AND BANNERS (Group: "Stars and Banners")
  // --------------------------------------------------------------------------
  if (t.includes("star")) {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <polygon points="12,1 15,8 23,8 17,13 19,23 12,18 5,23 7,13 1,8 9,8" />
      </svg>
    );
  }
  if (t === "up-ribbon" || t === "down-ribbon") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M1 6 H23 V14 H1 Z M1 14 L5 18 L1 22 V14 Z M23 14 L19 18 L23 22 V14 Z" />
      </svg>
    );
  }
  if (t === "wave") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M1 4 C7 1 13 9 19 6 L23 7 V19 C17 22 11 14 5 17 L1 16 Z" />
      </svg>
    );
  }

  // --------------------------------------------------------------------------
  // 8. CALLOUTS (Group: "Callouts")
  // --------------------------------------------------------------------------
  if (t.includes("callout")) {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M23 15 a2 2 0 0 1-2 2 H7 l-6 6 V3 a2 2 0 0 1 2-2 h18 a2 2 0 0 1 2 2 z" />
      </svg>
    );
  }

  // Default fallback
  return (
    <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
      <rect x="1" y="1" width="22" height="22" rx="2" />
    </svg>
  );
}
