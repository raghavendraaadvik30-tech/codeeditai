import type { CanvasShape } from "../types/shape";

export function createShapeId(): string {
  return `shape-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function generateShapeHTML(
  shapeType: string,
  options?: {
    width?: number;
    height?: number;
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    alignment?: "left" | "center" | "right";
    caption?: string;
  }
): string {
  const id = createShapeId();
  const width = options?.width || 140;
  const height = options?.height || 100;
  const fillColor = options?.fillColor || "transparent";
  const strokeColor = options?.strokeColor || "#000000";
  const strokeWidth = options?.strokeWidth || 1.5;
  const alignment = options?.alignment || "center";
  const caption = options?.caption || "";

  const alignStyle =
    alignment === "left"
      ? "margin-left: 0; margin-right: auto; text-align: left;"
      : alignment === "right"
      ? "margin-left: auto; margin-right: 0; text-align: right;"
      : "margin-left: auto; margin-right: auto; text-align: center;";

  const config: CanvasShape = {
    id,
    type: shapeType,
    x: 0,
    y: 0,
    width,
    height,
    rotate: 0,
    fillColor,
    strokeColor,
    strokeWidth,
    alignment,
    caption,
    selected: true,
  };

  const encodedConfig = encodeURIComponent(JSON.stringify(config));

  return `
<figure id="${id}" class="editor-figure editor-shape-figure" data-shape-figure="true" data-shape-id="${id}" data-shape-type="${shapeType}" data-shape-selected="true" data-shape-config="${encodedConfig}" contenteditable="false" oncontextmenu="event.preventDefault();" style="${alignStyle} width: ${width}px; max-width: 100%; margin-top: 14px; margin-bottom: 14px; display: inline-block; position: relative; user-select: none;">
  <div class="editor-shape-mount" data-shape-mount-id="${id}" style="width: 100%; min-height: ${height}px; display: flex; align-items: center; justify-content: center;"></div>
  ${caption ? `<figcaption style="margin-top: 6px; font-size: 10.5pt; font-weight: 600; color: #475569; text-align: center; font-family: Calibri, 'Segoe UI', Arial, sans-serif;">${caption}</figcaption>` : ""}
</figure>
<p><br/></p>
`.trim();
}
