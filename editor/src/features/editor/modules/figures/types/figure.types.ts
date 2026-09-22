/**
 * --------------------------------------------------------
 * Module: Figures / Figure
 * Feature: Figure Type Definitions
 * Description:
 * Data models, DTO interfaces, and request payload contracts
 * defining type safety rules for figures, images, and captions.
 * --------------------------------------------------------
 */

export type FigureAlignment = 'left' | 'center' | 'right' | 'inline' | 'wrap';
export type FigureFitMode = 'contain' | 'cover' | 'fill' | 'none';

export interface FigureModel {
  id: string;
  title: string;
  caption: string;
  altText: string;
  src: string;
  width: number; // in pixels or percentage
  height?: number;
  alignment: FigureAlignment;
  fitMode: FigureFitMode;
  aspectRatioLock: boolean;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  shadow: boolean;
  author: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FigureDTO {
  figure_id: string;
  title_text: string;
  caption_text: string;
  alt_text: string;
  image_url: string;
  img_width: number;
  img_height?: number;
  align_mode: FigureAlignment;
  fit_mode: FigureFitMode;
  lock_aspect_ratio: boolean;
  border_width: number;
  border_color: string;
  border_radius: number;
  has_shadow: boolean;
  creator: string;
  cat_tag: string;
  tags_list: string[];
  created_timestamp: string;
  updated_timestamp: string;
}

export interface CreateFigurePayload {
  title: string;
  caption?: string;
  altText?: string;
  src: string;
  width?: number;
  height?: number;
  alignment?: FigureAlignment;
  fitMode?: FigureFitMode;
  category?: string;
  tags?: string[];
  author?: string;
}

export interface UpdateFigurePayload {
  title?: string;
  caption?: string;
  altText?: string;
  src?: string;
  width?: number;
  height?: number;
  alignment?: FigureAlignment;
  fitMode?: FigureFitMode;
  aspectRatioLock?: boolean;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  shadow?: boolean;
  category?: string;
  tags?: string[];
}

export interface FigureFilterParams {
  category?: string;
  search?: string;
  tags?: string[];
}
