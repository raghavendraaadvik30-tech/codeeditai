export interface CanvasIcon {
  id: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  color: string;
  selected: boolean;
  zIndex: number;
  alignment?: 'left' | 'center' | 'right';
  caption?: string;
}
