/**
 * fileImportUtil.ts
 * 
 * Comprehensive document file parser for the Document Editor.
 * Supports:
 * - Word documents (.docx) via native zip header traversal and deflate decompression
 * - HTML documents (.html, .htm) via DOMParser
 * - Markdown files (.md, .markdown)
 * - Structured JSON documents (.json)
 * - Plain text (.txt, .text, .rtf)
 * 
 * Completely zero npm dependencies; uses standard Web APIs.
 */

export interface ParsedDocument {
  title: string;
  html: string;
}

/**
 * Main entry point: parses any uploaded document file into title and clean HTML.
 */
export async function parseUploadedFile(file: File): Promise<ParsedDocument> {
  const fileName = file.name;
  const cleanTitle = fileName.replace(/\.[^/.]+$/, "") || "Uploaded Document";
  const lowerName = fileName.toLowerCase();

  try {
    if (lowerName.endsWith(".docx")) {
      const buffer = await file.arrayBuffer();
      const html = await parseDocxBuffer(buffer);
      return { title: cleanTitle, html: html || "<p><br/></p>" };
    }

    if (lowerName.endsWith(".html") || lowerName.endsWith(".htm")) {
      const text = await file.text();
      const html = parseHtmlText(text);
      return { title: cleanTitle, html };
    }

    if (lowerName.endsWith(".json")) {
      const text = await file.text();
      const html = parseJsonText(text);
      return { title: cleanTitle, html };
    }

    if (lowerName.endsWith(".md") || lowerName.endsWith(".markdown")) {
      const text = await file.text();
      const html = parseMarkdownText(text);
      return { title: cleanTitle, html };
    }

    // Plain text or fallback
    const text = await file.text();
    const html = parsePlainText(text);
    return { title: cleanTitle, html };
  } catch (err) {
    console.error("Error parsing uploaded file:", err);
    // Fallback: try plain text
    try {
      const text = await file.text();
      return { title: cleanTitle, html: parsePlainText(text) };
    } catch {
      return { title: cleanTitle, html: "<p>Unable to display uploaded document content.</p>" };
    }
  }
}

/**
 * Parses DOCX ArrayBuffer by reading the ZIP archive and extracting word/document.xml.
 */
async function parseDocxBuffer(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  let pos = 0;

  while (pos < bytes.length - 30) {
    // Check for ZIP local file header signature: PK\x03\x04
    if (bytes[pos] === 0x50 && bytes[pos + 1] === 0x4b && bytes[pos + 2] === 0x03 && bytes[pos + 3] === 0x04) {
      const compressionMethod = bytes[pos + 8] | (bytes[pos + 9] << 8);
      const compressedSize =
        bytes[pos + 18] |
        (bytes[pos + 19] << 8) |
        (bytes[pos + 20] << 16) |
        (bytes[pos + 21] << 24);
      const fileNameLen = bytes[pos + 26] | (bytes[pos + 27] << 8);
      const extraLen = bytes[pos + 28] | (bytes[pos + 29] << 8);

      const fileNameBytes = bytes.subarray(pos + 30, pos + 30 + fileNameLen);
      const entryName = new TextDecoder().decode(fileNameBytes);

      const dataStart = pos + 30 + fileNameLen + extraLen;
      const dataEnd = dataStart + compressedSize;

      if (entryName === "word/document.xml" && dataEnd <= bytes.length) {
        const fileData = bytes.subarray(dataStart, dataEnd);
        let xmlText = "";

        if (compressionMethod === 0) {
          // Stored without compression
          xmlText = new TextDecoder().decode(fileData);
        } else if (compressionMethod === 8 && typeof DecompressionStream !== "undefined") {
          // Deflate compressed
          try {
            const stream = new Response(fileData as unknown as BodyInit).body!.pipeThrough(
              new DecompressionStream("deflate-raw")
            );
            xmlText = await new Response(stream).text();
          } catch (decompErr) {
            console.warn("DecompressionStream error:", decompErr);
          }
        }

        if (xmlText) {
          const html = convertDocxXmlToHtml(xmlText);
          if (html.trim()) return html;
        }
      }

      pos = dataEnd > pos ? dataEnd : pos + 1;
    } else {
      pos++;
    }
  }

  // Fallback: extract readable strings from the buffer
  return extractPrintableStrings(bytes);
}

/**
 * Converts Word document.xml into HTML elements (headings, paragraphs, bold/italic, tables).
 */
function convertDocxXmlToHtml(xml: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const body = doc.querySelector("body");
    if (!body) return fallbackRegexXmlExtract(xml);

    const htmlParts: string[] = [];

    // Process direct children of body
    body.childNodes.forEach((node) => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const el = node as Element;

      if (el.localName === "p") {
        htmlParts.push(processParagraphElement(el));
      } else if (el.localName === "tbl") {
        htmlParts.push(processTableElement(el));
      }
    });

    const result = htmlParts.join("");
    return result.trim() ? result : fallbackRegexXmlExtract(xml);
  } catch {
    return fallbackRegexXmlExtract(xml);
  }
}

function processParagraphElement(p: Element): string {
  let styleTag = "p";
  const pStyle = p.querySelector("pStyle");
  const val = pStyle?.getAttribute("w:val") || "";
  if (/heading\s*1/i.test(val)) styleTag = "h1";
  else if (/heading\s*2/i.test(val)) styleTag = "h2";
  else if (/heading\s*3/i.test(val)) styleTag = "h3";

  const runParts: string[] = [];
  p.childNodes.forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const child = node as Element;

    if (child.localName === "r") {
      let text = "";
      child.querySelectorAll("t").forEach((t) => {
        text += t.textContent || "";
      });

      if (!text) return;

      const isBold = child.querySelector("b") !== null;
      const isItalic = child.querySelector("i") !== null;
      const isUnderline = child.querySelector("u") !== null;

      let formatted = escapeHtml(text);
      if (isBold) formatted = `<strong>${formatted}</strong>`;
      if (isItalic) formatted = `<em>${formatted}</em>`;
      if (isUnderline) formatted = `<u>${formatted}</u>`;

      runParts.push(formatted);
    }
  });

  const content = runParts.join("");
  if (!content.trim()) return "<p><br/></p>";

  return `<${styleTag}>${content}</${styleTag}>`;
}

function processTableElement(tbl: Element): string {
  const rows: string[] = [];
  tbl.querySelectorAll("tr").forEach((tr) => {
    const cells: string[] = [];
    tr.querySelectorAll("tc").forEach((tc) => {
      const cellTextParts: string[] = [];
      tc.querySelectorAll("p").forEach((p) => {
        cellTextParts.push(processParagraphElement(p));
      });
      const cellContent = cellTextParts.join("") || "<p><br/></p>";
      cells.push(`<td class="border border-slate-300 dark:border-slate-700 p-2">${cellContent}</td>`);
    });
    rows.push(`<tr>${cells.join("")}</tr>`);
  });

  return `<table class="document-table border-collapse border border-slate-300 dark:border-slate-700 w-full my-3">${rows.join("")}</table>`;
}

function fallbackRegexXmlExtract(xml: string): string {
  const matches = xml.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
  if (!matches || matches.length === 0) return "<p><br/></p>";

  const texts = matches.map((m) => m.replace(/<[^>]+>/g, ""));
  return `<p>${escapeHtml(texts.join(" "))}</p>`;
}

function extractPrintableStrings(bytes: Uint8Array): string {
  const chunks: string[] = [];
  let current: number[] = [];

  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    // Printable ASCII
    if ((b >= 32 && b <= 126) || b === 10 || b === 13) {
      current.push(b);
    } else {
      if (current.length >= 6) {
        chunks.push(new TextDecoder().decode(new Uint8Array(current)));
      }
      current = [];
    }
  }
  if (current.length >= 6) {
    chunks.push(new TextDecoder().decode(new Uint8Array(current)));
  }

  const valid = chunks
    .filter((c) => !c.includes("[Content_Types]") && !c.includes("word/") && !c.includes("schemas."))
    .slice(0, 50);

  return valid.map((t) => `<p>${escapeHtml(t)}</p>`).join("") || "<p><br/></p>";
}

/**
 * Parses HTML document text and extracts the core body content.
 */
function parseHtmlText(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const bodyHtml = doc.body.innerHTML;
    return bodyHtml && bodyHtml.trim() ? bodyHtml : html;
  } catch {
    return html;
  }
}

/**
 * Parses JSON document text.
 */
function parseJsonText(jsonStr: string): string {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.pageHtml && typeof parsed.pageHtml === "object") {
      const firstKey = Object.keys(parsed.pageHtml)[0];
      if (firstKey && parsed.pageHtml[firstKey]) {
        return parsed.pageHtml[firstKey];
      }
    }
    if (parsed.content && typeof parsed.content === "string") {
      return parsed.content;
    }
    return `<pre class="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs font-mono">${escapeHtml(
      JSON.stringify(parsed, null, 2)
    )}</pre>`;
  } catch {
    return `<p>${escapeHtml(jsonStr)}</p>`;
  }
}

/**
 * Parses simple Markdown into HTML.
 */
function parseMarkdownText(md: string): string {
  const lines = md.split(/\r?\n/);
  const elements: string[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push("<p><br/></p>");
    } else if (trimmed.startsWith("### ")) {
      elements.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`);
    } else if (trimmed.startsWith("## ")) {
      elements.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith("# ")) {
      elements.push(`<h1>${escapeHtml(trimmed.slice(2))}</h1>`);
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      elements.push(`<ul><li>${escapeHtml(trimmed.slice(2))}</li></ul>`);
    } else {
      elements.push(`<p>${escapeHtml(trimmed)}</p>`);
    }
  });

  return elements.join("") || "<p><br/></p>";
}

/**
 * Parses plain text into HTML paragraphs.
 */
function parsePlainText(text: string): string {
  const paragraphs = text
    .split(/\r?\n\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\r?\n/g, "<br/>")}</p>`);

  return paragraphs.length > 0 ? paragraphs.join("") : `<p>${escapeHtml(text) || "<br/>"}</p>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
