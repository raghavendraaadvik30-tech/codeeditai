/**
 * --------------------------------------------------------
 * Module: Figures / Figure
 * Feature: Figure Utility Functions
 * Description:
 * Helper utilities for generating figure HTML markup,
 * aspect ratio calculations, caption formatting, and container bounds.
 * --------------------------------------------------------
 */

import type { FigureModel } from '../types';

export const calculateAspectRatio = (width: number, height: number): number => {
  if (height === 0) return 1;
  return Number((width / height).toFixed(2));
};

export const generateFigureHTML = (figure: FigureModel): string => {
  const alignClass =
    figure.alignment === 'center'
      ? 'margin: 0 auto; text-align: center;'
      : figure.alignment === 'right'
      ? 'margin-left: auto; text-align: right;'
      : figure.alignment === 'left'
      ? 'margin-right: auto; text-align: left;'
      : 'display: inline-block;';

  const styleString = `max-width: 100%; width: ${figure.width}px; ${figure.height ? `height: ${figure.height}px;` : ''} object-fit: ${figure.fitMode}; border: ${figure.borderWidth}px solid ${figure.borderColor}; border-radius: ${figure.borderRadius}px; ${figure.shadow ? 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);' : ''}`;

  return `
<figure id="${figure.id}" class="editor-figure" style="${alignClass} padding: 1rem 0;">
  <img src="${figure.src}" alt="${figure.altText || figure.title}" style="${styleString}" />
  ${figure.caption ? `<figcaption contenteditable="true" style="font-size: 0.875rem; color: #64748b; margin-top: 0.5rem; font-style: italic; outline: none; cursor: text;" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}" onmousedown="event.stopPropagation();" onclick="event.stopPropagation();">${figure.caption}</figcaption>` : ''}
</figure>
<p><br/></p>
`.trim();
};

export const formatFigureCaptionIndex = (index: number, label: string = 'Figure'): string => {
  return `${label} ${index + 1}`;
};

export const generatePictureHTML = (options: {
  src: string;
  name?: string;
  mode?: "withTitle" | "withoutTitle" | "titleOnly";
  caption?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}): string => {
  const { src, name, mode = "withTitle", caption, width = 360, height = 240, x = 0, y = 0 } = options;
  const figureId = `figure-pic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const title = caption || (name ? name.replace(/\.[^/.]+$/, "") : "Picture");

  const config = {
    id: figureId,
    src,
    title,
    mode,
    x,
    y,
    width,
    height,
    rotate: 0,
    selected: true,
  };

  const encodedConfig = encodeURIComponent(JSON.stringify(config));

  if (mode === "titleOnly") {
    return `
<figure id="${figureId}" class="editor-figure editor-picture-figure" data-picture-figure="true" data-picture-id="${figureId}" data-picture-selected="true" data-picture-config="${encodedConfig}" contenteditable="false" oncontextmenu="event.preventDefault();" style="margin: 14px auto; text-align: center; width: ${width}px; max-width: 100%; display: inline-block; position: relative; user-select: none;">
  <div class="editor-picture-mount" data-picture-mount-id="${figureId}" style="width: 100%; display: block;"></div>
  <figcaption contenteditable="true" style="margin-top: 6px; font-size: 10.5pt; font-weight: 600; color: #475569; text-align: center; font-family: Calibri, 'Segoe UI', Arial, sans-serif; outline: none; border-bottom: 1px dashed transparent; cursor: text;" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}" onmousedown="event.stopPropagation();" onclick="event.stopPropagation();" onfocus="this.style.borderBottomColor='#3b82f6'" onblur="this.style.borderBottomColor='transparent'">${title}</figcaption>
</figure>
<p><br/></p>
`.trim();
  }

  if (mode === "withoutTitle") {
    return `
<figure id="${figureId}" class="editor-figure editor-picture-figure" data-picture-figure="true" data-picture-id="${figureId}" data-picture-selected="true" data-picture-config="${encodedConfig}" contenteditable="false" oncontextmenu="event.preventDefault();" style="margin: 14px auto; text-align: center; width: ${width}px; max-width: 100%; display: inline-block; position: relative; user-select: none;">
  <div class="editor-picture-mount" data-picture-mount-id="${figureId}" style="width: 100%; display: block;">
    <img src="${src}" alt="${title}" style="width: 100%; height: auto; border-radius: 4px; display: block;" />
  </div>
</figure>
<p><br/></p>
`.trim();
  }

  // Default: withTitle
  return `
<figure id="${figureId}" class="editor-figure editor-picture-figure" data-picture-figure="true" data-picture-id="${figureId}" data-picture-selected="true" data-picture-config="${encodedConfig}" contenteditable="false" oncontextmenu="event.preventDefault();" style="margin: 14px auto; text-align: center; width: ${width}px; max-width: 100%; display: inline-block; position: relative; user-select: none;">
  <div class="editor-picture-mount" data-picture-mount-id="${figureId}" style="width: 100%; display: block;">
    <img src="${src}" alt="${title}" style="width: 100%; height: auto; border-radius: 4px; display: block;" />
  </div>
  <figcaption contenteditable="true" style="margin-top: 6px; font-size: 10.5pt; font-weight: 600; color: #475569; text-align: center; font-family: Calibri, 'Segoe UI', Arial, sans-serif; outline: none; border-bottom: 1px dashed transparent; cursor: text;" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}" onmousedown="event.stopPropagation();" onclick="event.stopPropagation();" onfocus="this.style.borderBottomColor='#3b82f6'" onblur="this.style.borderBottomColor='transparent'">${title}</figcaption>
</figure>
<p><br/></p>
`.trim();
};


