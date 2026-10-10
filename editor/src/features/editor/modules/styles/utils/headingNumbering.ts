export type HeadingLevel =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9;

const HEADING_NAMES: Record<HeadingLevel, string> = {
  1: "Heading 1",
  2: "Heading 2",
  3: "Heading 3",
  4: "Heading 4",
  5: "Heading 5",
  6: "Heading 6",
  7: "Heading 7",
  8: "Heading 8",
  9: "Heading 9",
};

const NUMBER_CLASS = "editor-heading-number";

/**
 * Injects CSS used by the generated heading numbers into document head if missing.
 */
export function injectHeadingNumberingStyles(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById("editor-heading-numbering-styles")) return;
  const style = document.createElement("style");
  style.id = "editor-heading-numbering-styles";
  style.textContent = HEADING_NUMBERING_CSS;
  document.head.appendChild(style);
}

/**
 * Returns the heading level from a style name or tag name.
 */
export function getHeadingLevel(
  styleName: string | null | undefined
): HeadingLevel | null {
  if (!styleName) {
    return null;
  }

  const match = styleName.match(/^Heading\s*([1-9])$/i);
  if (match) {
    return Number(match[1]) as HeadingLevel;
  }

  const tagMatch = styleName.match(/^H([1-6])$/i);
  if (tagMatch) {
    return Number(tagMatch[1]) as HeadingLevel;
  }

  return null;
}

/**
 * Returns the style name for a heading level.
 */
export function getHeadingStyleName(
  level: HeadingLevel
): string {
  return HEADING_NAMES[level];
}

/**
 * Checks whether a style is one of Heading 1-9.
 */
export function isHeadingStyle(
  styleName: string | null | undefined
): boolean {
  return getHeadingLevel(styleName) !== null;
}

/**
 * Finds the editable blocks in the editor across contenteditable pages.
 */
function getEditorBlocks(
  editor: HTMLElement
): HTMLElement[] {
  const elements = Array.from(
    editor.querySelectorAll<HTMLElement>(
      "[data-style-name], [data-style], h1, h2, h3, h4, h5, h6"
    )
  );

  return elements.filter((el) => {
    if (!el.closest('[contenteditable="true"]')) return false;
    const name = el.dataset.styleName || el.dataset.style || el.tagName;
    return Boolean(name);
  });
}

/**
 * Get the actual text of a block without its generated number.
 */
export function getBlockText(
  block: HTMLElement
): string {
  const clone = block.cloneNode(true) as HTMLElement;

  clone
    .querySelectorAll(`.${NUMBER_CLASS}`)
    .forEach((element) => {
      element.remove();
    });

  return clone.textContent ?? "";
}

/**
 * Remove an existing generated number.
 */
function removeNumber(
  block: HTMLElement
): void {
  block
    .querySelectorAll(`.${NUMBER_CLASS}`)
    .forEach((element) => {
      element.remove();
    });
}

/**
 * Creates the numbering element.
 */
function createNumberElement(
  number: string
): HTMLSpanElement {
  const span = document.createElement("span");

  span.className = NUMBER_CLASS;

  span.setAttribute(
    "contenteditable",
    "false"
  );

  span.dataset.generated = "true";

  span.textContent = `${number} `;

  return span;
}

/**
 * Renumbers all Heading 1-9 blocks across document.
 */
export function updateHeadingNumbers(
  editor?: HTMLElement | null
): void {
  injectHeadingNumberingStyles();

  const root =
    editor?.closest<HTMLElement>("main, body") ||
    document.querySelector<HTMLElement>("main") ||
    editor ||
    (typeof document !== "undefined" ? document.body : null);

  if (!root) return;

  const counters: number[] = Array(9).fill(0);
  const blocks = getEditorBlocks(root);

  blocks.forEach((block) => {
    const styleName =
      block.dataset.styleName ||
      block.dataset.style ||
      block.tagName;

    const level = getHeadingLevel(styleName);

    if (!level) {
      removeNumber(block);
      return;
    }

    removeNumber(block);

    counters[level - 1]++;

    /*
     * Reset all deeper levels.
     */
    for (let index = level; index < 9; index++) {
      counters[index] = 0;
    }

    /*
     * Build:
     * H1 -> 1
     * H2 -> 1.1
     * H3 -> 1.1.1
     */
    const number = counters
      .slice(0, level)
      .join(".");

    const numberElement = createNumberElement(number);

    /*
     * Put the number at the beginning of the existing block.
     */
    block.insertBefore(
      numberElement,
      block.firstChild
    );
  });
}

/**
 * Apply the style marker to a block.
 */
export function setHeadingStyleMarker(
  block: HTMLElement,
  styleName: string
): void {
  block.dataset.styleName = styleName;
  block.dataset.style = styleName;

  const level = getHeadingLevel(styleName);

  if (level === null) {
    removeNumber(block);
  }
}

/**
 * Remove heading numbering from a block.
 */
export function clearHeadingNumbering(
  block: HTMLElement
): void {
  removeNumber(block);

  delete block.dataset.styleName;
  delete block.dataset.style;
}

/**
 * CSS used by the generated heading number.
 */
export const HEADING_NUMBERING_CSS = `
.editor-heading-number {
  display: inline-block;
  margin-right: 0.5em;
  font-weight: 700;
  color: #0f172a;
  text-decoration: none !important;
  user-select: none;
  pointer-events: none;
}

.editor-heading-number[data-generated="true"] {
  user-select: none;
}
`;