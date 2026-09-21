import type { CanvasIcon } from "../types/canvasIcon";

export function createCanvasIconFromShape(shape: {
  id: string;
  iconName?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
  strokeColor?: string;
  selected?: boolean;
  zIndex?: number;
}): CanvasIcon {
  return {
    id: shape.id,
    icon: shape.iconName || "mdi:star",
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
    rotate: shape.rotate ?? 0,
    color: "#000000",
    selected: !!shape.selected,
    zIndex: shape.zIndex ?? 1,
  };
}

export function updateShapeFromCanvasIcon(icon: CanvasIcon) {
  return {
    x: icon.x,
    y: icon.y,
    width: icon.width,
    height: icon.height,
    rotate: icon.rotate,
    iconName: icon.icon,
    strokeColor: "#000000",
    selected: icon.selected,
  };
}

export function generateIconHTML(
  iconName: string,
  options?: {
    size?: number;
    color?: string;
    alignment?: "left" | "center" | "right";
    caption?: string;
  }
): string {
  const id = `icon-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const size = options?.size || 64;
  const alignment = options?.alignment || "center";
  const caption = options?.caption || "";

  const alignStyle =
    alignment === "left"
      ? "margin-left: 0; margin-right: auto; text-align: left;"
      : alignment === "right"
      ? "margin-left: auto; margin-right: 0; text-align: right;"
      : "margin-left: auto; margin-right: auto; text-align: center;";

  const encodedConfig = encodeURIComponent(
    JSON.stringify({
      id,
      icon: iconName,
      width: size,
      height: size,
      color: "#000000",
      alignment,
      caption,
    })
  );

  return `
<figure id="${id}" class="editor-figure editor-icon-figure" data-icon-figure="true" data-icon-id="${id}" data-icon-name="${iconName}" data-icon-config="${encodedConfig}" contenteditable="false" oncontextmenu="event.preventDefault();" style="${alignStyle} width: ${size}px; max-width: 100%; margin-top: 14px; margin-bottom: 14px; display: block; user-select: none;">
  <div class="editor-icon-mount" data-icon-mount-id="${id}" style="width: 100%; min-height: ${size}px; display: flex; align-items: center; justify-content: center;"></div>
  ${caption ? `<figcaption style="margin-top: 6px; font-size: 10.5pt; font-weight: 600; color: #475569; text-align: center; font-family: Calibri, 'Segoe UI', Arial, sans-serif;">${caption}</figcaption>` : ""}
</figure>
<p><br/></p>
`.trim();
}
