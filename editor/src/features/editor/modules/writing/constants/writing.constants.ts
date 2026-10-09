import type {
  AlignmentTool,
  CaseAction,
  FormattingTool,
  ListTool,
  WritingColor,
} from "../types/writing.types";

/* ============================================================
   CASE TOOLS
============================================================ */

export const CASE_ACTIONS: CaseAction[] = [
  {
    label: "Sentence case",
    tags: ["sentence", "case"],
    transform: (value) =>
      value
        .toLowerCase()
        .replace(
          /(^\s*\w|[.!?]\s+\w)/g,
          (character) => character.toUpperCase()
        ),
  },
  {
    label: "Title Case",
    tags: ["title", "case"],
    transform: (value) =>
      value.replace(
        /\w\S*/g,
        (word) =>
          word[0].toUpperCase() +
          word.slice(1).toLowerCase()
      ),
  },
  {
    label: "UPPER CASE",
    tags: ["upper", "case", "capitalize"],
    transform: (value) => value.toUpperCase(),
  },
  {
    label: "lower case",
    tags: ["lower", "case"],
    transform: (value) => value.toLowerCase(),
  },
  {
    label: "Toggle Case",
    tags: ["toggle", "case", "invert"],
    transform: (value) =>
      value
        .split("")
        .map((character) =>
          character === character.toUpperCase()
            ? character.toLowerCase()
            : character.toUpperCase()
        )
        .join(""),
  },
  {
    label: "Normalize",
    tags: ["normalize", "case", "space", "whitespace", "clean"],
    transform: (value) =>
      value.replace(/\s+/g, " ").trim(),
  },
];

/* ============================================================
   TEXT FORMATTING
============================================================ */

export const FORMATTING_TOOLS: FormattingTool[] = [
  {
    name: "Bold",
    cmd: "bold",
    shortcut: "Ctrl+B",
    tags: ["bold", "emphasis", "formatting", "strong"],
  },
  {
    name: "Italic",
    cmd: "italic",
    shortcut: "Ctrl+I",
    tags: ["italic", "emphasis", "formatting", "slant"],
  },
  {
    name: "Underline",
    cmd: "underline",
    shortcut: "Ctrl+U",
    tags: ["underline", "emphasis", "formatting"],
  },
  {
    name: "Strikethrough",
    cmd: "strikeThrough",
    tags: ["strikethrough", "formatting", "line", "cross"],
  },
  {
    name: "Subscript",
    cmd: "subscript",
    shortcut: "Ctrl+=",
    tags: ["subscript", "formatting", "lower", "math"],
  },
  {
    name: "Superscript",
    cmd: "superscript",
    shortcut: "Ctrl+Shift+=",
    tags: ["superscript", "formatting", "upper", "math", "power"],
  },
];

/* ============================================================
   FONT COLORS
============================================================ */

export const THEME_COLORS: WritingColor[] = [
  {
    name: "Black",
    value: "#000000",
  },
  {
    name: "Dark Gray",
    value: "#4b5563",
  },
  {
    name: "Light Gray",
    value: "#d1d5db",
  },
  {
    name: "Blue",
    value: "#3b82f6",
  },
  {
    name: "Red",
    value: "#ef4444",
  },
  {
    name: "Green",
    value: "#10b981",
  },
  {
    name: "Purple",
    value: "#8b5cf6",
  },
];

/* ============================================================
   HIGHLIGHT COLORS
============================================================ */

export const HIGHLIGHT_COLORS: WritingColor[] = [
  {
    name: "Yellow",
    value: "#fef08a",
  },
  {
    name: "Light Green",
    value: "#bbf7d0",
  },
  {
    name: "Cyan",
    value: "#a5f3fc",
  },
  {
    name: "Pink",
    value: "#fbcfe8",
  },
  {
    name: "Orange",
    value: "#fed7aa",
  },
];

/* ============================================================
   ALIGNMENT
============================================================ */

export const ALIGNMENT_TOOLS: AlignmentTool[] = [
  {
    name: "Align Left",
    cmd: "justifyLeft",
    tags: ["align", "left", "justify"],
  },
  {
    name: "Align Center",
    cmd: "justifyCenter",
    tags: ["align", "center", "middle"],
  },
  {
    name: "Align Right",
    cmd: "justifyRight",
    tags: ["align", "right"],
  },
  {
    name: "Justify",
    cmd: "justifyFull",
    tags: ["align", "justify", "full"],
  },
];

/* ============================================================
   LISTS
============================================================ */

export const LIST_TOOLS: ListTool[] = [
  {
    name: "Bullets",
    cmd: "insertUnorderedList",
    type: "bullets",
    tags: ["bullets", "list", "unordered"],
  },
  {
    name: "Numbering",
    cmd: "insertOrderedList",
    type: "numbering",
    tags: ["numbering", "list", "ordered"],
  },
  {
    name: "Multilevel List",
    type: "multilevel",
    tags: ["multilevel", "list", "headings"],
  },
];

/* ============================================================
   DEFAULT VALUES
============================================================ */

export const DEFAULT_HIGHLIGHT_COLOR = "#fef08a";

export const NO_HIGHLIGHT_COLOR = "transparent";

export const DEFAULT_BULLET_SYMBOL = "●";

export const DEFAULT_BULLET_STYLE = "disc";

export const DEFAULT_NUMBERING_STYLE = "decimal";
