export type SmartArtCategory =
  | 'List'
  | 'Process'
  | 'Cycle'
  | 'Hierarchy'
  | 'Matrix'
  | 'Pyramid'
  | 'Text Card';

export interface SmartArtNode {
  id: string;
  text: string;
  subtitle?: string;
  level?: number;
  color?: string;
  icon?: string;
}

export type SmartArtStyle = 'flat' | 'gradient' | 'glass' | 'outline';

export interface SmartArtColorScheme {
  id: string;
  name: string;
  colors: string[];
}

export type SmartArtLayoutId = string;

export interface SmartArtLayoutConfig {
  id: string;
  name: string;
  category: SmartArtCategory;
  description: string;
  defaultNodes: SmartArtNode[];
}

export interface SmartArtModel {
  id: string;
  category: SmartArtCategory;
  layout: string;
  layoutId?: string;
  title: string;
  nodes: SmartArtNode[];
  colorScheme: string;
  style: SmartArtStyle;
  direction?: 'ltr' | 'rtl';
  width: number;
  height: number;
  alignment: 'left' | 'center' | 'right';
  backgroundColor?: string;
  caption?: string;
  createdAt: string;
  updatedAt: string;
}
