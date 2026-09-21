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

  // Lines
  if (t === "line") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <line x1="1" y1="23" x2="23" y2="1" />
      </svg>
    );
  }
  if (t.includes("arrow-line") || t.includes("right-arrow") || t === "arrow") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <line x1="1" y1="12" x2="23" y2="12" />
        <polyline points="16 5 23 12 16 19" />
      </svg>
    );
  }
  if (t.includes("left-arrow")) {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <line x1="23" y1="12" x2="1" y2="12" />
        <polyline points="8 5 1 12 8 19" />
      </svg>
    );
  }
  if (t.includes("up-arrow")) {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <line x1="12" y1="23" x2="12" y2="1" />
        <polyline points="5 8 12 1 19 8" />
      </svg>
    );
  }
  if (t.includes("down-arrow")) {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <polyline points="5 16 12 23 19 16" />
      </svg>
    );
  }
  if (t.includes("double-arrow")) {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <line x1="2" y1="12" x2="22" y2="12" />
        <polyline points="8 5 1 12 8 19" />
        <polyline points="16 5 23 12 16 19" />
      </svg>
    );
  }

  // Rectangles
  if (t === "rectangle" || t === "text-box") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <rect x="1" y="1" width="22" height="22" rx="1" />
      </svg>
    );
  }
  if (t.includes("rounded")) {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <rect x="1" y="1" width="22" height="22" rx="4" />
      </svg>
    );
  }

  // Basic Shapes
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
  if (t === "pentagon" || t === "pentagon-arrow") {
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
  if (t === "octagon") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <polygon points="7,1 17,1 23,7 23,17 17,23 7,23 1,17 1,7" />
      </svg>
    );
  }
  if (t.includes("star")) {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <polygon points="12,1 15,8 23,8 17,13 19,23 12,18 5,23 7,13 1,8 9,8" />
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
  if (t === "donut") {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <circle cx="12" cy="12" r="11" />
        <circle cx="12" cy="12" r="5" />
      </svg>
    );
  }

  // Equations & Callouts & Fallback
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
  if (t.includes("callout")) {
    return (
      <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
        <path d="M23 15a2 2 0 0 1-2 2H7l-6 6V3a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2z" />
      </svg>
    );
  }

  // Default fallback: geometric rounded rect shape
  return (
    <svg className={className} viewBox="0 0 24 24" preserveAspectRatio="none" fill={fillVal} stroke={stroke} strokeWidth={strokeWidth}>
      <rect x="1" y="1" width="22" height="22" rx="2" />
    </svg>
  );
}
