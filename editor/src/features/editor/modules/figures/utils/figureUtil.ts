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

export { generatePictureHTML, generateTitleOnlyHTML } from '../modules/pictures/utils';



