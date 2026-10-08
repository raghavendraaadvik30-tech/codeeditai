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
 * Returns the heading level from a style name.
 */
export function getHeadingLevel(
  styleName: string | null | undefined
): HeadingLevel | null {
  if (!styleName) {
    return null;
  }

  const match = styleName.match(/^Heading ([1-9])$/);

  if (!match) {
    return null;
  }

  return Number(match[1]) as HeadingLevel;
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
 * Finds the editable blocks in the editor.
 *
 * This deliberately works with your existing editor DOM
 * instead of using <h7>, <h8>, <h9>.
 */
function getEditorBlocks(
  editor: HTMLElement
): HTMLElement[] {
  return Array.from(
    editor.querySelectorAll<HTMLElement>(
      "[data-style-name]"
    )
  );
}

/**
 * Get the actual text of a block without its generated number.
 */
function getBlockText(
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
 * Renumbers all Heading 1-9 blocks.
 *
 * Example:
 *
 * Heading 1
 * Heading 2
 * Heading 2
 * Heading 3
 * Heading 1
 * Heading 2
 *
 * becomes:
 *
 * 1 Heading 1
 * 1.1 Heading 2
 * 1.2 Heading 2
 * 1.2.1 Heading 3
 * 2 Heading 1
 * 2.1 Heading 2
 */
export function updateHeadingNumbers(
  editor: HTMLElement
): void {
  const counters: number[] =
    Array(9).fill(0);

  const blocks =
    getEditorBlocks(editor);

  blocks.forEach((block) => {
    const styleName =
      block.dataset.styleName;

    const level =
      getHeadingLevel(styleName);

    if (!level) {
      removeNumber(block);
      return;
    }

    removeNumber(block);

    counters[level - 1]++;

    /*
     * Reset all deeper levels.
     */
    for (
      let index = level;
      index < 9;
      index++
    ) {
      counters[index] = 0;
    }

    /*
     * Build:
     *
     * H1 -> 1
     * H2 -> 1.1
     * H3 -> 1.1.1
     */
    const number = counters
      .slice(0, level)
      .join(".");

    const numberElement =
      createNumberElement(number);

    /*
     * Put the number at the beginning
     * of the existing block.
     */
    block.insertBefore(
      numberElement,
      block.firstChild
    );
  });
}

/**
 * Apply the style marker to a block.
 *
 * Call this whenever your existing style system
 * changes a block to Heading 1-9.
 */
export function setHeadingStyleMarker(
  block: HTMLElement,
  styleName: string
): void {
  block.dataset.styleName = styleName;

  const level =
    getHeadingLevel(styleName);

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
}

/**
 * CSS used by the generated heading number.
 */
export const HEADING_NUMBERING_CSS = `
.editor-heading-number {
  display: inline-block;
  margin-right: 0.25em;
  user-select: none;
  pointer-events: none;
}

.editor-heading-number[data-generated="true"] {
  user-select: none;
}
`;