import type { ShapeItem, ShapeCategory } from "../types/shape";

export const SHAPE_CATEGORIES: ShapeCategory[] = [
  "Lines",
  "Rectangles",
  "Basic Shapes",
  "Block Arrows",
  "Equation Shapes",
  "Flowchart",
  "Stars and Banners",
  "Callouts",
];

export const WORD_SHAPES: ShapeItem[] = [
  // Lines
  { id: "line", label: "Line", group: "Lines" },
  { id: "arrow-line", label: "Arrow", group: "Lines" },
  { id: "double-arrow-line", label: "Double Arrow", group: "Lines" },
  { id: "elbow", label: "Elbow Connector", group: "Lines" },
  { id: "elbow-arrow", label: "Elbow Arrow Connector", group: "Lines" },
  { id: "elbow-double-arrow", label: "Elbow Double Arrow Connector", group: "Lines" },
  { id: "curved-connector", label: "Curved Connector", group: "Lines" },
  { id: "curved-arrow", label: "Curved Arrow Connector", group: "Lines" },
  { id: "curved-double-arrow", label: "Curved Double Arrow Connector", group: "Lines" },
  { id: "curve", label: "Curve", group: "Lines" },
  { id: "freeform", label: "Freeform", group: "Lines" },
  { id: "scribble", label: "Scribble", group: "Lines" },

  // Rectangles
  { id: "rectangle", label: "Rectangle", group: "Rectangles" },
  { id: "rounded-rectangle", label: "Rounded Rectangle", group: "Rectangles" },
  { id: "rounded-single-corner", label: "Rounded Single Corner", group: "Rectangles" },
  { id: "snipped-single-corner", label: "Snipped Single Corner", group: "Rectangles" },
  { id: "snipped-same-side", label: "Snipped Same Side Corner", group: "Rectangles" },
  { id: "snipped-diagonal", label: "Snipped Diagonal Corner", group: "Rectangles" },
  { id: "snip-round-single", label: "Snip & Round Single Corner", group: "Rectangles" },

  // Basic Shapes
  { id: "text-box", label: "Text Box", group: "Basic Shapes" },
  { id: "oval", label: "Oval", group: "Basic Shapes" },
  { id: "triangle", label: "Triangle", group: "Basic Shapes" },
  { id: "right-triangle", label: "Right Triangle", group: "Basic Shapes" },
  { id: "parallelogram", label: "Parallelogram", group: "Basic Shapes" },
  { id: "trapezoid", label: "Trapezoid", group: "Basic Shapes" },
  { id: "diamond", label: "Diamond", group: "Basic Shapes" },
  { id: "pentagon", label: "Pentagon", group: "Basic Shapes" },
  { id: "hexagon", label: "Hexagon", group: "Basic Shapes" },
  { id: "heptagon", label: "Heptagon", group: "Basic Shapes" },
  { id: "octagon", label: "Octagon", group: "Basic Shapes" },
  { id: "decagon", label: "Decagon", group: "Basic Shapes" },
  { id: "pie", label: "Pie", group: "Basic Shapes" },
  { id: "chord", label: "Chord", group: "Basic Shapes" },
  { id: "teardrop", label: "Teardrop", group: "Basic Shapes" },
  { id: "frame", label: "Frame", group: "Basic Shapes" },
  { id: "half-frame", label: "Half Frame", group: "Basic Shapes" },
  { id: "corner", label: "Corner", group: "Basic Shapes" },
  { id: "l-shape", label: "L Shape", group: "Basic Shapes" },
  { id: "arc", label: "Arc", group: "Basic Shapes" },
  { id: "donut", label: "Donut", group: "Basic Shapes" },
  { id: "smiley", label: "Smiley Face", group: "Basic Shapes" },
  { id: "heart", label: "Heart", group: "Basic Shapes" },
  { id: "lightning", label: "Lightning Bolt", group: "Basic Shapes" },
  { id: "sun", label: "Sun", group: "Basic Shapes" },
  { id: "moon", label: "Moon", group: "Basic Shapes" },
  { id: "cloud", label: "Cloud", group: "Basic Shapes" },

  // Block Arrows
  { id: "right-arrow", label: "Right Arrow", group: "Block Arrows" },
  { id: "left-arrow", label: "Left Arrow", group: "Block Arrows" },
  { id: "up-arrow", label: "Up Arrow", group: "Block Arrows" },
  { id: "down-arrow", label: "Down Arrow", group: "Block Arrows" },
  { id: "left-right-arrow", label: "Left-Right Arrow", group: "Block Arrows" },
  { id: "up-down-arrow", label: "Up-Down Arrow", group: "Block Arrows" },
  { id: "quad-arrow", label: "Quad Arrow", group: "Block Arrows" },
  { id: "bent-up-arrow", label: "Bent Arrow", group: "Block Arrows" },
  { id: "uturn-arrow", label: "U-Turn Arrow", group: "Block Arrows" },
  { id: "chevron", label: "Chevron", group: "Block Arrows" },
  { id: "pentagon-arrow", label: "Pentagon Arrow", group: "Block Arrows" },

  // Equation Shapes
  { id: "plus", label: "Plus", group: "Equation Shapes" },
  { id: "minus", label: "Minus", group: "Equation Shapes" },
  { id: "multiply", label: "Multiply", group: "Equation Shapes" },
  { id: "divide", label: "Divide", group: "Equation Shapes" },
  { id: "equal", label: "Equal", group: "Equation Shapes" },

  // Flowchart
  { id: "flow-process", label: "Process", group: "Flowchart" },
  { id: "flow-decision", label: "Decision", group: "Flowchart" },
  { id: "flow-data", label: "Data", group: "Flowchart" },
  { id: "flow-document", label: "Document", group: "Flowchart" },
  { id: "flow-terminator", label: "Terminator", group: "Flowchart" },
  { id: "flow-database", label: "Magnetic Disk", group: "Flowchart" },

  // Stars and Banners
  { id: "star-4", label: "4 Point Star", group: "Stars and Banners" },
  { id: "star", label: "5 Point Star", group: "Stars and Banners" },
  { id: "star-6", label: "6 Point Star", group: "Stars and Banners" },
  { id: "star-8", label: "8 Point Star", group: "Stars and Banners" },
  { id: "star-12", label: "12 Point Star", group: "Stars and Banners" },
  { id: "up-ribbon", label: "Up Ribbon", group: "Stars and Banners" },
  { id: "down-ribbon", label: "Down Ribbon", group: "Stars and Banners" },
  { id: "wave", label: "Wave", group: "Stars and Banners" },

  // Callouts
  { id: "callout", label: "Rectangular Callout", group: "Callouts" },
  { id: "round-callout", label: "Rounded Rectangular Callout", group: "Callouts" },
  { id: "oval-callout", label: "Oval Callout", group: "Callouts" },
  { id: "cloud-callout", label: "Cloud Callout", group: "Callouts" },
];
