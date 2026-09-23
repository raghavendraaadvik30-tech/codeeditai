export interface StyleToken {
  name: string;

  family: string;
  font?: string;

  size: number;

  weight: number;

  color?: "primary" | string;

  italic?: boolean;

  underline?: boolean;

  alignment?: "left" | "center" | "right" | "justify";
  align?: "left" | "center" | "right" | "justify";

  lineHeight?: number;

  leftIndent?: number;

  rightIndent?: number;

  specialIndent?: "none" | "firstLine" | "hanging";

  specialIndentBy?: number;

  spaceBefore?: number;

  spaceAfter?: number;

  lineSpacing?: "single" | "multiple" | "exact";

  lineSpacingAt?: number;
}

export type StyleOverride = Partial<StyleToken>;

export type StyleOverrides = Record<string, StyleOverride>;

export interface StyleState {
  styles: StyleToken[];

  visibleStyles: StyleToken[];

  removedStyles: StyleToken[];

  query: string;

  openStyle: string | null;
}