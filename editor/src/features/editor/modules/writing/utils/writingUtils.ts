export function transformCurrentSelection(
  transform: (value: string) => string,
  editor?: HTMLElement | null
): boolean {
  const selection = window.getSelection();

  if (
    !selection ||
    selection.rangeCount === 0 ||
    selection.isCollapsed
  ) {
    return false;
  }

  const range = selection.getRangeAt(0);

  const selectedText = range.toString();

  if (!selectedText) {
    return false;
  }

  const transformedText =
    transform(selectedText);

  if (transformedText === selectedText) {
    return true;
  }

  /*
   * Use the browser's normal text insertion so
   * existing formatting is preserved.
   */
  const changed = document.execCommand(
    "insertText",
    false,
    transformedText
  );

  if (!changed) {
    return false;
  }

  /*
   * The browser collapses the selection after
   * insertText().
   *
   * We now rebuild the selection so that the
   * transformed text remains highlighted.
   */
  requestAnimationFrame(() => {
    const currentSelection =
      window.getSelection();

    if (
      !currentSelection ||
      currentSelection.rangeCount === 0
    ) {
      return;
    }

    const root =
      editor ??
      document.activeElement;

    if (!(root instanceof HTMLElement)) {
      return;
    }

    /*
     * Current cursor position = END of the
     * newly inserted transformed text.
     */
    const endNode =
      currentSelection.focusNode;

    const endOffset =
      currentSelection.focusOffset;

    if (!endNode) {
      return;
    }

    /*
     * Create a range from the beginning of
     * the editor to the current cursor.
     *
     * This lets us calculate where the
     * transformed text ends.
     */
    const prefixRange =
      document.createRange();

    try {
      prefixRange.setStart(
        root,
        0
      );

      prefixRange.setEnd(
        endNode,
        endOffset
      );
    } catch {
      return;
    }

    const charactersBeforeEnd =
      prefixRange.toString().length;

    const selectedLength =
      transformedText.length;

    const startCharacter =
      Math.max(
        0,
        charactersBeforeEnd -
          selectedLength
      );

    const endCharacter =
      charactersBeforeEnd;

    /*
     * Find the DOM points corresponding
     * to the start/end character positions.
     */
    const startPoint =
      findTextPoint(
        root,
        startCharacter
      );

    const endPoint =
      findTextPoint(
        root,
        endCharacter
      );

    if (!startPoint || !endPoint) {
      return;
    }

    const newRange =
      document.createRange();

    try {
      newRange.setStart(
        startPoint.node,
        startPoint.offset
      );

      newRange.setEnd(
        endPoint.node,
        endPoint.offset
      );

      currentSelection.removeAllRanges();

      currentSelection.addRange(
        newRange
      );
    } catch {
      // Ignore invalid DOM selection points.
    }
  });

  return true;
}

/**
 * Finds a DOM text-node position using
 * a character offset inside the editor.
 */
function findTextPoint(
  root: HTMLElement,
  targetOffset: number
): {
  node: Text;
  offset: number;
} | null {
  const walker =
    document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT
    );

  let currentOffset = 0;

  let node: Node | null;

  while (
    (node = walker.nextNode())
  ) {
    const textNode =
      node as Text;

    const length =
      textNode.data.length;

    /*
     * Target is inside this text node.
     */
    if (
      targetOffset <=
      currentOffset + length
    ) {
      return {
        node: textNode,
        offset:
          targetOffset -
          currentOffset,
      };
    }

    currentOffset += length;
  }

  /*
   * If target is exactly at the end,
   * return the final text node.
   */
  if (targetOffset === currentOffset) {
    const finalWalker =
      document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT
      );

    let lastTextNode: Text | null =
      null;

    let current: Node | null;

    while (
      (current =
        finalWalker.nextNode())
    ) {
      lastTextNode =
        current as Text;
    }

    if (lastTextNode) {
      return {
        node: lastTextNode,
        offset:
          lastTextNode.data.length,
      };
    }
  }

  return null;
}