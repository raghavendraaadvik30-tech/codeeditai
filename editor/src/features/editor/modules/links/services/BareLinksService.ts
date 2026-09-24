/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: BareLinksService
 * Description:
 * Scans the active document editor DOM for raw, unlinked URL strings
 * (e.g. https://www.fda.gov/) and converts them into real clickable hyperlinks.
 * --------------------------------------------------------
 */

import { validateUrl } from '../utils/validateUrl';

export interface BareLinkConversionResult {
  count: number;
  converted: Array<{ displayText: string; target: string }>;
}

export class BareLinksService {
  /**
   * Scans document text nodes for bare URLs and replaces them with <a> hyperlink tags.
   */
  convertBareLinks(container: HTMLElement | null): BareLinkConversionResult {
    if (!container) return { count: 0, converted: [] };

    const converted: Array<{ displayText: string; target: string }> = [];
    const urlRegex = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;

    // Helper to process text nodes recursively
    const processNode = (node: Node) => {
      // Skip node if inside an existing <a> tag or script/style tag
      if (
        node.parentNode &&
        (node.parentNode.nodeName === 'A' ||
          node.parentNode.nodeName === 'SCRIPT' ||
          node.parentNode.nodeName === 'STYLE')
      ) {
        return;
      }

      if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
        const text = node.nodeValue;
        let match: RegExpExecArray | null;

        urlRegex.lastIndex = 0;
        if ((match = urlRegex.exec(text))) {
          const rawMatch = match[0];
          // Strip trailing punctuation like period or comma if at end of sentence
          const cleanUrlStr = rawMatch.replace(/[.,;:!?)]+$/, '');
          const validation = validateUrl(cleanUrlStr);

          if (validation.isValid) {
            const targetUrl = validation.normalizedUrl;
            const matchIndex = match.index;

            const parentNode = node.parentNode;
            if (!parentNode) return;

            const beforeText = text.substring(0, matchIndex);
            const afterText = text.substring(matchIndex + cleanUrlStr.length);

            const fragment = document.createDocumentFragment();

            if (beforeText) {
              fragment.appendChild(document.createTextNode(beforeText));
            }

            const anchor = document.createElement('a');
            anchor.href = targetUrl;
            anchor.target = '_blank';
            anchor.rel = 'noopener noreferrer';
            anchor.className = 'paraxel-editor-link text-blue-600 underline hover:text-blue-800 font-medium cursor-pointer';
            anchor.title = targetUrl;
            anchor.innerText = cleanUrlStr;

            fragment.appendChild(anchor);

            if (afterText) {
              const remainingNode = document.createTextNode(afterText);
              fragment.appendChild(remainingNode);
              // Recursively check remainder of text node
              processNode(remainingNode);
            }

            parentNode.replaceChild(fragment, node);
            converted.push({ displayText: cleanUrlStr, target: targetUrl });
          }
        }
      } else {
        // Child node traversal
        const children = Array.from(node.childNodes);
        children.forEach((child) => processNode(child));
      }
    };

    processNode(container);
    return { count: converted.length, converted };
  }
}

export const bareLinksService = new BareLinksService();
