/**
 * --------------------------------------------------------
 * Module: Track Changes
 * Feature: Diff Engine & HTML Formatter
 * Description:
 * Longest Common Subsequence (LCS) dynamic programming word tokenizer,
 * diff calculator, and rich HTML visual diff generator.
 * --------------------------------------------------------
 */

import type { DiffToken } from "../types";

/**
 * Escapes unsafe HTML characters in strings.
 */
export function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

/**
 * Escapes unsafe characters for HTML attribute values.
 */
export function escapeAttr(s: string): string {
  return escapeHtml(s);
}

/**
 * Calculates word-level differences between two strings using dynamic programming (LCS).
 */
export function diffWords(oldStr: string, newStr: string): DiffToken[] {
  const tokenize = (s: string) => s.split(/(\s+)/); // split by whitespace, keeping delimiters

  const oldWords = tokenize(oldStr);
  const newWords = tokenize(newStr);

  const oldLen = oldWords.length;
  const newLen = newWords.length;

  // LCS DP table
  const dp: number[][] = Array.from({ length: oldLen + 1 }, () => Array(newLen + 1).fill(0));

  for (let i = 1; i <= oldLen; i++) {
    for (let j = 1; j <= newLen; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to assemble tokens
  const result: DiffToken[] = [];
  let i = oldLen;
  let j = newLen;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      result.unshift({ type: "common", value: oldWords[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: "added", value: newWords[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i - 1][j] > dp[i][j - 1])) {
      result.unshift({ type: "removed", value: oldWords[i - 1] });
      i--;
    }
  }

  return result;
}

/**
 * Produces diff HTML with <ins class="diff-added"> and <del class="diff-removed"> markup.
 */
export function diffHTML(oldHTML: string, newHTML: string): string {
  if (typeof document === "undefined") return newHTML;

  const temp1 = document.createElement("div");
  temp1.innerHTML = oldHTML;
  const oldText = temp1.innerText || temp1.textContent || "";

  const temp2 = document.createElement("div");
  temp2.innerHTML = newHTML;
  const newText = temp2.innerText || temp2.textContent || "";

  const tokens = diffWords(oldText, newText);

  let html = "";
  tokens.forEach((token) => {
    if (token.type === "common") {
      html += escapeHtml(token.value);
    } else if (token.type === "added") {
      html += `<ins class="diff-added" style="color:#2e7d32;text-decoration:underline;background-color:rgba(46,125,50,0.08);">${escapeHtml(
        token.value
      )}</ins>`;
    } else if (token.type === "removed") {
      html += `<del class="diff-removed" style="color:#c62828;text-decoration:line-through;background-color:rgba(198,40,40,0.08);">${escapeHtml(
        token.value
      )}</del>`;
    }
  });

  return `<div style="white-space:pre-wrap;line-height:1.6;font-family:sans-serif;font-size:11pt;padding:12px;color:var(--foreground);">${html}</div>`;
}
