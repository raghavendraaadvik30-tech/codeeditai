export type ShapeCategory =
  | "Lines"
  | "Rectangles"
  | "Basic Shapes"
  | "Block Arrows"
  | "Equation Shapes"
  | "Flowchart"
  | "Stars and Banners"
  | "Callouts";

export interface ShapeItem {
  id: string;
  label: string;
  group: ShapeCategory;
}

export interface CanvasShape {
  id: string;
  type: string;
  label?: string;
  group?: ShapeCategory;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity?: number;
  text?: string;
  alignment?: "left" | "center" | "right";
  caption?: string;
  selected?: boolean;
}
