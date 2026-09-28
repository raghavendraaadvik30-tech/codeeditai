/**
 * --------------------------------------------------------
 * Module: Figures / Pictures
 * Feature: Picture Type Definitions
 * Description:
 * TypeScript interfaces, types, and contract definitions for
 * pictures, canvas picture states, dialog properties, and insert events.
 * --------------------------------------------------------
 */

export type PictureInsertMode = "withTitle" | "withoutTitle" | "titleOnly";

export interface CanvasPicture {
  id: string;
  src?: string;
  title?: string;
  mode?: PictureInsertMode;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotate?: number;
  selected?: boolean;
}

export type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export interface PictureMountInfo {
  id: string;
  figureEl: HTMLElement;
  mountEl: HTMLElement;
  config: CanvasPicture;
}

export interface OnlinePicturesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
  isPopupBlocked?: boolean;
}

export interface SampleOnlineImage {
  title: string;
  url: string;
}

export interface PictureGenerateOptions {
  src: string;
  name?: string;
  mode?: PictureInsertMode;
  caption?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
}

export interface PictureInsertEventDetail {
  src?: string;
  name?: string;
  mode?: PictureInsertMode;
  caption?: string;
}
