/***Purpose:**
Defines the **static configuration and TypeScript types** used by the editor ribbon. It keeps tab names, available fonts, font sizes, and document block styles centralized instead of hardcoding them inside UI components.

**What each part does:**

* **`TABS`** – Defines the available ribbon tabs:
  `Home`, `Insert`, `Layout`, `References`, `Review`, and `View`.

* **`RibbonTab`** – Automatically creates a TypeScript type from the `TABS` values, so only valid tab names can be used.

* **`FONTS`** – Contains the fonts available in the editor's font selector.

* **`FONT_SIZES`** – Defines the available font sizes. Each option contains:

  * `command` → command/value used by the editor.
  * `label` → size displayed to the user.

* **`BlockOption`** – Defines the structure of a document block style with a `label` and HTML `tag`.

* **`BLOCKS`** – Provides available document styles such as:

  * Paragraph → `<p>`
  * Heading 1 → `<h1>`
  * Heading 2 → `<h2>`
  * Heading 3 → `<h3>`
  * Heading 4 → `<h4>`
  * Quote → `<blockquote>`

### In simple terms

> **`ribbonConfig.ts` is the configuration file for the editor ribbon. It defines what tabs, fonts, font sizes, and text/block styles are available. UI components can import these values and display them dynamically.**

**No backend/API call is made in this file.**
*/


export const TABS = [
  "Home",
  "Insert",
  "Layout",
  "References",
  "Review",
  "View",
] as const;

export type RibbonTab = (typeof TABS)[number];

export const FONTS = [
  "Calibri",
  "Arial",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Tahoma",
  "Courier New",
  "Garamond",
  "Trebuchet MS",
  "Comic Sans MS",
  "Impact",
];

export const FONT_SIZES = [
  { command: "1", label: "8" },
  { command: "1.5", label: "9" },
  { command: "2", label: "10" },
  { command: "2.5", label: "11" },
  { command: "3", label: "12" },
  { command: "4", label: "14" },
  { command: "4.5", label: "16" },
  { command: "5", label: "18" },
  { command: "5.5", label: "20" },
  { command: "6", label: "22" },
  { command: "6.5", label: "24" },
  { command: "6.8", label: "26" },
  { command: "7", label: "28" },
  { command: "7.5", label: "32" },
  { command: "8", label: "36" },
  { command: "8.5", label: "48" },
  { command: "9", label: "72" },
];

export interface BlockOption {
  label: string;
  tag: string;
}

export const BLOCKS: BlockOption[] = [
  {
    label: "Paragraph",
    tag: "p",
  },
  {
    label: "Heading 1",
    tag: "h1",
  },
  {
    label: "Heading 2",
    tag: "h2",
  },
  {
    label: "Heading 3",
    tag: "h3",
  },
  {
    label: "Heading 4",
    tag: "h4",
  },
  {
    label: "Quote",
    tag: "blockquote",
  },
];
