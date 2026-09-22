/**
 * --------------------------------------------------------
 * Module: Figures / Figure
 * Feature: Figure Constants & Enums
 * Description:
 * Global configuration constants, default figure layouts,
 * and alignment definitions.
 * --------------------------------------------------------
 */

import type { FigureModel } from '../types';

export const DEFAULT_FIGURE_WIDTH = 600;
export const DEFAULT_BORDER_COLOR = '#e2e8f0';
export const DEFAULT_BORDER_WIDTH = 0;
export const DEFAULT_BORDER_RADIUS = 12;

export enum FigureAlignmentEnum {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  INLINE = 'inline',
  WRAP = 'wrap',
}

export const ALIGNMENT_LABELS: Record<FigureAlignmentEnum, string> = {
  [FigureAlignmentEnum.LEFT]: 'Left Aligned',
  [FigureAlignmentEnum.CENTER]: 'Center Aligned',
  [FigureAlignmentEnum.RIGHT]: 'Right Aligned',
  [FigureAlignmentEnum.INLINE]: 'Inline with Text',
  [FigureAlignmentEnum.WRAP]: 'Wrap Text Around',
};

export const FIGURE_CATEGORIES = [
  'Diagram',
  'Chart',
  'Illustration',
  'Screenshot',
  'Photo',
  'Flowchart',
  'Architecture',
  'Other',
] as const;

export const DEFAULT_FIGURE: FigureModel = {
  id: 'fig-sample-1',
  title: 'Sample Diagram',
  caption: 'Figure 1: Standard document diagram.',
  altText: 'Sample diagram',
  src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
  width: 600,
  height: 380,
  alignment: 'center',
  fitMode: 'contain',
  aspectRatioLock: true,
  borderWidth: 0,
  borderColor: '#e2e8f0',
  borderRadius: 8,
  shadow: true,
  author: 'Author',
  category: 'Diagram',
  tags: ['diagram', 'figure'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
