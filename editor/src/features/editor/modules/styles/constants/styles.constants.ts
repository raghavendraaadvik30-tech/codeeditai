// import type { StyleToken } from "../types/styles.types";

// export const STYLE_FONTS = [
//   "Calibri",
//   "Arial",
//   "Times New Roman",
//   "Georgia",
//   "Helvetica",
//   "Verdana",
//   "Garamond",
//   "Tahoma",
//   "Trebuchet MS",
// ] as const;

// export const STYLE_WEIGHTS = [
//   100,
//   200,
//   300,
//   400,
//   500,
//   600,
//   700,
//   800,
//   900,
// ] as const;

// export const STYLE_ALIGNMENTS = [
//   "left",
//   "center",
//   "right",
//   "justify",
// ] as const;

// export const LINE_SPACING_OPTIONS = [
//   {
//     value: "single",
//     label: "Single",
//   },
//   {
//     value: "1.5lines",
//     label: "1.5 Lines",
//   },
//   {
//     value: "double",
//     label: "Double",
//   },
//   {
//     value: "atLeast",
//     label: "At Least",
//   },
//   {
//     value: "exactly",
//     label: "Exactly",
//   },
//   {
//     value: "multiple",
//     label: "Multiple",
//   },
// ] as const;

// export const SPECIAL_INDENT_OPTIONS = [
//   {
//     value: "none",
//     label: "(none)",
//   },
//   {
//     value: "hanging",
//     label: "Hanging",
//   },
//   {
//     value: "firstLine",
//     label: "First Line",
//   },
// ] as const;

// /**
//  * Default Microsoft Word-style gallery.
//  */
// export const DEFAULT_STYLE_TOKENS: StyleToken[] = [
//   {
//     name: "Title",
//     font: "Calibri",
//     size: 36,
//     weight: 700,
//     color: "primary",
//     align: "center",
//   },
//   {
//     name: "Table Title",
//     font: "Calibri",
//     size: 11,
//     weight: 700,
//   },
//   {
//     name: "Heading",
//     font: "Calibri",
//     size: 34,
//     weight: 700,
//     color: "primary",
//   },
//   {
//     name: "Heading 1",
//     font: "Calibri",
//     size: 30,
//     weight: 700,
//     color: "primary",
//   },
//   {
//     name: "Heading 2",
//     font: "Calibri",
//     size: 26,
//     weight: 700,
//     color: "primary",
//   },
//   {
//     name: "Heading 3",
//     font: "Calibri",
//     size: 24,
//     weight: 700,
//     color: "primary",
//   },
//   {
//     name: "Heading 4",
//     font: "Calibri",
//     size: 22,
//     weight: 700,
//     color: "primary",
//   },
//   {
//     name: "Heading 5",
//     font: "Calibri",
//     size: 18,
//     weight: 700,
//     color: "primary",
//   },
//   {
//     name: "Heading 6",
//     font: "Calibri",
//     size: 16,
//     weight: 700,
//     color: "primary",
//   },
//   {
//     name: "Heading 7",
//     font: "Calibri",
//     size: 14,
//     weight: 700,
//     color: "primary",
//   },
//   {
//     name: "Heading 8",
//     font: "Calibri",
//     size: 13,
//     weight: 700,
//     color: "primary",
//   },
//   {
//     name: "Heading 9",
//     font: "Calibri",
//     size: 12,
//     weight: 700,
//     color: "primary",
//   },
//   {
//     name: "Document Text",
//     font: "Calibri",
//     size: 11,
//     weight: 400,
//   },
//   {
//     name: "Caption",
//     font: "Calibri",
//     size: 10,
//     weight: 400,
//     italic: true,
//   },
//   {
//     name: "Figure Caption",
//     font: "Calibri",
//     size: 10,
//     weight: 600,
//     italic: true,
//   },
//   {
//     name: "Footnote",
//     font: "Calibri",
//     size: 9,
//     weight: 400,
//   },
// ];




import type { StyleToken } from "../types/styles.types";

export const DEFAULT_STYLES: StyleToken[] = [
  {
    name: "Title",
    family: "Calibri",
    size: 36,
    weight: 700,
    alignment: "left",
    lineHeight: 1.15,
    spaceBefore: 0,
    spaceAfter: 6,
  },

  {
    name: "Table Title",
    family: "Calibri",
    size: 11,
    weight: 400,
    alignment: "left",
    lineHeight: 1.15,
  },

  {
    name: "Heading",
    family: "Calibri",
    size: 34,
    weight: 700,
    alignment: "left",
    lineHeight: 1.25,
    spaceBefore: 6,
    spaceAfter: 6,
  },

  {
    name: "Heading 1",
    family: "Calibri",
    size: 30,
    weight: 700,
    alignment: "left",
    lineHeight: 1.25,
    spaceBefore: 6,
    spaceAfter: 6,
  },

  {
    name: "Heading 2",
    family: "Calibri",
    size: 26,
    weight: 700,
    alignment: "left",
    lineHeight: 1.25,
    spaceBefore: 6,
    spaceAfter: 6,
  },

  {
    name: "Heading 3",
    family: "Calibri",
    size: 24,
    weight: 700,
    alignment: "left",
    lineHeight: 1.25,
    spaceBefore: 6,
    spaceAfter: 6,
  },

  {
    name: "Heading 4",
    family: "Calibri",
    size: 22,
    weight: 700,
    alignment: "left",
    lineHeight: 1.25,
    spaceBefore: 6,
    spaceAfter: 6,
  },

  {
    name: "Heading 5",
    family: "Calibri",
    size: 18,
    weight: 700,
    alignment: "left",
    lineHeight: 1.25,
  },

  {
    name: "Heading 6",
    family: "Calibri",
    size: 16,
    weight: 700,
    alignment: "left",
    lineHeight: 1.25,
  },

  {
    name: "Heading 7",
    family: "Calibri",
    size: 14,
    weight: 700,
    alignment: "left",
    lineHeight: 1.25,
  },

  {
    name: "Heading 8",
    family: "Calibri",
    size: 13,
    weight: 700,
    alignment: "left",
    lineHeight: 1.25,
  },

  {
    name: "Heading 9",
    family: "Calibri",
    size: 12,
    weight: 700,
    alignment: "left",
    lineHeight: 1.25,
  },

  {
    name: "Document Text",
    family: "Calibri",
    size: 11,
    weight: 400,
    alignment: "left",
    lineHeight: 1.15,
  },

  {
    name: "Caption",
    family: "Calibri",
    size: 10,
    weight: 400,
    italic: true,
    alignment: "left",
  },

  {
    name: "Figure Caption",
    family: "Calibri",
    size: 10,
    weight: 400,
    italic: true,
    alignment: "center",
  },

  {
    name: "Footnote",
    family: "Calibri",
    size: 9,
    weight: 400,
    alignment: "left",
  },
];