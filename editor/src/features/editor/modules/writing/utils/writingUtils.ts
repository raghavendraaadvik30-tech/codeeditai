export function transformCurrentSelection(
  transform: (value: string) => string,
  _editor?: HTMLElement | null
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

  const startContainer = range.startContainer;
  const startOffset = range.startOffset;
  const endContainer = range.endContainer;
  const endOffset = range.endOffset;

  // Single text node selection
  if (startContainer === endContainer && startContainer.nodeType === Node.TEXT_NODE) {
    const textNode = startContainer as Text;
    const original = textNode.data;
    const before = original.slice(0, startOffset);
    const target = original.slice(startOffset, endOffset);
    const after = original.slice(endOffset);
    const transformed = transform(target);
    textNode.data = before + transformed + after;

    const newRange = document.createRange();
    newRange.setStart(textNode, startOffset);
    newRange.setEnd(textNode, startOffset + transformed.length);
    selection.removeAllRanges();
    selection.addRange(newRange);
    return true;
  }

  // Multi-node / Multi-page selection
  const commonAncestor = range.commonAncestorContainer;
  const root =
    (commonAncestor.nodeType === Node.ELEMENT_NODE ? commonAncestor : commonAncestor.parentElement) ||
    document.body;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: { node: Text; start: number; end: number }[] = [];
  let currentNode: Node | null;

  while ((currentNode = walker.nextNode())) {
    const textNode = currentNode as Text;
    const textLen = textNode.data.length;
    if (textLen === 0) continue;

    let intersects: boolean;
    try {
      intersects = range.intersectsNode(textNode);
    } catch {
      const isBefore = (textNode.compareDocumentPosition(startContainer) & Node.DOCUMENT_POSITION_PRECEDING) !== 0;
      const isAfter = (textNode.compareDocumentPosition(endContainer) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
      intersects = !isBefore && !isAfter;
    }

    if (intersects) {
      const s = textNode === startContainer ? startOffset : 0;
      const e = textNode === endContainer ? endOffset : textLen;
      if (s < e) {
        textNodes.push({ node: textNode, start: s, end: e });
      }
    }
  }

  if (textNodes.length === 0) {
    return false;
  }

  textNodes.forEach(({ node, start, end }) => {
    const original = node.data;
    const before = original.slice(0, start);
    const target = original.slice(start, end);
    const after = original.slice(end);
    const transformed = transform(target);
    node.data = before + transformed + after;
  });

  try {
    const first = textNodes[0];
    const last = textNodes[textNodes.length - 1];
    const newRange = document.createRange();
    newRange.setStart(first.node, first.start);
    newRange.setEnd(last.node, last.end);
    selection.removeAllRanges();
    selection.addRange(newRange);
  } catch {
    // ignore
  }

  return true;
}

