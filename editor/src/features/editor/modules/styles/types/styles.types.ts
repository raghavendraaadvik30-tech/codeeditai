// export type StyleAlignment =
//   | "left"
//   | "center"
//   | "right"
//   | "justify";

// export type LineSpacingType =
//   | "single"
//   | "1.5lines"
//   | "double"
//   | "atLeast"
//   | "exactly"
//   | "multiple";

// export type SpecialIndent =
//   | "none"
//   | "hanging"
//   | "firstLine";

// export interface StyleToken {
//   name: string;
//   font: string;
//   size: number;
//   weight: number;

//   color?: "primary" | string;
//   italic?: boolean;
//   underline?: boolean;

//   align?: StyleAlignment;
//   lineHeight?: number;

//   leftIndent?: number;
//   rightIndent?: number;

//   specialIndent?: SpecialIndent;
//   specialIndentBy?: number;

//   spaceBefore?: number;
//   spaceAfter?: number;

//   lineSpacingType?: LineSpacingType;
//   lineSpacingAt?: number;

//   hiddenFromGallery?: boolean;
// }

// export type StyleOverride = Partial<StyleToken>;

// export type StyleOverrides = Record<
//   string,
//   StyleOverride
// >;

// export interface ModifyStyleValues {
//   font: string;
//   size: number;
//   weight: number;

//   bold: boolean;
//   italic: boolean;
//   underline: boolean;

//   align: StyleAlignment;
//   lineHeight: number;

//   leftIndent: number;
//   rightIndent: number;

//   specialIndent: SpecialIndent;
//   specialIndentBy: number;

//   spaceBefore: number;
//   spaceAfter: number;

//   lineSpacingType: LineSpacingType;
//   lineSpacingAt: number;
// }

// export interface StylesState {
//   query: string;
//   openStyle: string | null;
//   modifiedStyle: string | null;
//   hiddenStyles: Set<string>;
// }

// export interface StylesContextValue {
//   styles: StyleToken[];
//   visibleStyles: StyleToken[];
//   removedStyles: StyleToken[];

//   query: string;
//   setQuery: (query: string) => void;

//   openStyle: string | null;
//   setOpenStyle: (name: string | null) => void;

//   applyStyle: (style: StyleToken) => void;

//   updateToMatchSelection: (name: string) => void;

//   selectAllInstances: (name: string) => void;

//   clearFormatting: (name: string) => void;

//   revertStyle: (name: string) => void;

//   removeStyle: (name: string) => void;
  
//   restoreStyle: (name: string) => void;

//   modifyStyle: (name: string) => void;
// }




export interface StyleToken {
  name: string;

  family: string;

  size: number;

  weight: number;

  italic?: boolean;

  underline?: boolean;

  alignment?: "left" | "center" | "right" | "justify";

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

export interface StyleState {
  styles: StyleToken[];

  visibleStyles: StyleToken[];

  removedStyles: StyleToken[];

  query: string;

  openStyle: string | null;
}