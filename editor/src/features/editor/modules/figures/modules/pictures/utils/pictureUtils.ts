/**
 * --------------------------------------------------------
 * Module: Figures / Pictures
 * Feature: Picture Utilities
 * Description:
 * Helper functions for generating picture HTML markup, extracting titles,
 * validating image URLs, and reading image files.
 * --------------------------------------------------------
 */

import type { PictureGenerateOptions } from '../types';
import { DEFAULT_PICTURE_WIDTH, DEFAULT_PICTURE_HEIGHT, DEFAULT_PICTURE_TITLE } from '../constants';

/**
 * Generates the HTML string for inserting ONLY a title/caption without any picture or image figure.
 */
export const generateTitleOnlyHTML = (customTitle?: string): string => {
  const title = customTitle || DEFAULT_PICTURE_TITLE;
  return `
<p class="editor-figure-caption" style="margin: 8px auto; font-size: 10.5pt; font-weight: 600; color: #475569; text-align: center; font-family: Calibri, 'Segoe UI', Arial, sans-serif; line-height: 1.5; outline: none; user-select: text;">${title}</p>
<p><br/></p>
`.trim();
};

/**
 * Generates the HTML string for inserting a picture into the editor DOM.
 */
export const generatePictureHTML = (options: PictureGenerateOptions): string => {
  const {
    src,
    name,
    mode = "withTitle",
    caption,
    width = DEFAULT_PICTURE_WIDTH,
    height = DEFAULT_PICTURE_HEIGHT,
    x = 0,
    y = 0,
  } = options;

  const figureId = `figure-pic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const title = caption || (name ? name.replace(/\.[^/.]+$/, "") : DEFAULT_PICTURE_TITLE);

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
    return generateTitleOnlyHTML(title);
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

/**
 * Validates whether an image URL format is acceptable.
 */
export const validateImageUrl = (url: string): { isValid: boolean; error?: string } => {
  const trimmed = url.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Please enter or paste a valid image URL' };
  }
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image/')) {
    return { isValid: false, error: 'Image URL must begin with http:// or https://' };
  }
  return { isValid: true };
};

/**
 * Extracts a human-readable title from an image URL or filename.
 */
export const extractPictureTitle = (src: string, fallback?: string): string => {
  if (fallback && fallback !== "Picture" && fallback !== "Image") {
    return fallback;
  }
  if (src && !src.startsWith("data:")) {
    const match = src.match(/\/([^\/?#]+?)(?:\.[a-zA-Z0-9]+)?(?:\?|#|$)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]).replace(/[-_]/g, " ");
    }
  }
  return DEFAULT_PICTURE_TITLE;
};

/**
 * Helper to calculate workspace scale factor dynamically for element.
 */
export const getWorkspaceScale = (figureEl: HTMLElement): number => {
  const pageSection = figureEl.closest("section[data-page-id]") as HTMLElement | null;
  if (!pageSection) return 1;
  const rect = pageSection.getBoundingClientRect();
  const offsetWidth = pageSection.offsetWidth;
  if (offsetWidth > 0 && rect.width > 0) {
    return rect.width / offsetWidth;
  }
  return 1;
};

/**
 * Reads a File as a base64 Data URL.
 */
export const readImageFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error(`Selected file is not an image: ${file.type}`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsDataURL(file);
  });
};
