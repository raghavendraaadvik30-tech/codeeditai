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
  pages: string[];
}

/**
 * Main entry point: parses any uploaded document file into title, full HTML, and individual page HTMLs.
 */
export async function parseUploadedFile(file: File): Promise<ParsedDocument> {
  const fileName = file.name;
  const cleanTitle = fileName.replace(/\.[^/.]+$/, "") || "Uploaded Document";
  const lowerName = fileName.toLowerCase();

  try {
    if (lowerName.endsWith(".docx")) {
      const buffer = await file.arrayBuffer();
      const rawHtml = await parseDocxBuffer(buffer);
      const html = rawHtml || "<p><br/></p>";
      const pages = splitHtmlIntoPages(html);
      return { title: cleanTitle, html, pages };
    }

    if (lowerName.endsWith(".html") || lowerName.endsWith(".htm")) {
      const text = await file.text();
      const { html, pages } = parseHtmlText(text);
      return { title: cleanTitle, html, pages };
    }

    if (lowerName.endsWith(".json")) {
      const text = await file.text();
      const { html, pages } = parseJsonText(text);
      return { title: cleanTitle, html, pages };
    }

    if (lowerName.endsWith(".md") || lowerName.endsWith(".markdown")) {
      const text = await file.text();
      const { html, pages } = parseMarkdownText(text);
      return { title: cleanTitle, html, pages };
    }

    // Plain text or fallback
    const text = await file.text();
    const { html, pages } = parsePlainText(text);
    return { title: cleanTitle, html, pages };
  } catch (err) {
    console.error("Error parsing uploaded file:", err);
    // Fallback: try plain text
    try {
      const text = await file.text();
      const { html, pages } = parsePlainText(text);
      return { title: cleanTitle, html, pages };
    } catch {
      const errHtml = "<p>Unable to display uploaded document content.</p>";
      return { title: cleanTitle, html: errHtml, pages: [errHtml] };
    }
  }
}

/**
 * Splits HTML content into individual pages based on explicit page-break markers,
 * or auto-paginates continuous content to fit document page dimensions.
 */
export function splitHtmlIntoPages(html: string): string[] {
  if (!html || !html.trim()) return ["<p><br/></p>"];

  // 1. Check for explicit page-break markers
  const breakPattern = /(?:<div[^>]*data-page-break="true"[^>]*><\/div>|<hr[^>]*class="[^"]*page-break[^"]*"[^>]*\/?>|<!--\s*page[-_]?break\s*-->|<div[^>]*style="[^"]*page-break-before:\s*always[^"]*"[^>]*><\/div>|<div[^>]*style="[^"]*break-before:\s*page[^"]*"[^>]*><\/div>)/i;

  if (breakPattern.test(html)) {
    const rawParts = html.split(breakPattern);
    const pages = rawParts
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && p !== "<p><br/></p>" && p !== "<p><br></p>");
    if (pages.length > 0) {
      return pages;
    }
  }

  // 2. DOM-based pagination for continuous content
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const children = Array.from(doc.body.children);

    if (children.length <= 1) {
      return [html];
    }

    const pages: string[] = [];
    let currentPageHtml: string[] = [];
    let currentHeight = 0;
    const MAX_PAGE_HEIGHT = 800; // Target page content writing area height in px

    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      // Check if child has style or attribute indicating page break
      const style = child.getAttribute("style") || "";
      const isExplicitBreak =
        child.getAttribute("data-page-break") === "true" ||
        child.classList.contains("page-break") ||
        /page-break-before:\s*always/i.test(style) ||
        /break-before:\s*page/i.test(style);

      if (isExplicitBreak && currentPageHtml.length > 0) {
        pages.push(currentPageHtml.join(""));
        currentPageHtml = [];
        currentHeight = 0;
        continue;
      }

      // Estimate rendered height
      let elementHeight = 35;
      const tag = child.tagName.toLowerCase();
      const textLen = child.textContent?.length || 0;

      if (tag === "h1") {
        elementHeight = 65;
      } else if (tag === "h2") {
        elementHeight = 50;
      } else if (tag === "h3") {
        elementHeight = 40;
      } else if (tag === "table") {
        const rowCount = child.querySelectorAll("tr").length || 2;
        elementHeight = Math.max(70, rowCount * 36);
      } else if (tag === "ul" || tag === "ol") {
        const itemCount = child.querySelectorAll("li").length || 2;
        elementHeight = Math.max(30, itemCount * 28);
      } else if (tag === "p") {
        const lines = Math.max(1, Math.ceil(textLen / 70));
        elementHeight = 16 + lines * 28;
      } else {
        const lines = Math.max(1, Math.ceil(textLen / 70));
        elementHeight = Math.max(35, lines * 28);
      }

      // If adding this element exceeds the page height, and we already have content on this page
      if (currentHeight + elementHeight > MAX_PAGE_HEIGHT && currentPageHtml.length > 0) {
        pages.push(currentPageHtml.join(""));
        currentPageHtml = [child.outerHTML];
        currentHeight = elementHeight;
      } else {
        currentPageHtml.push(child.outerHTML);
        currentHeight += elementHeight;
      }
    }

    if (currentPageHtml.length > 0) {
      pages.push(currentPageHtml.join(""));
    }

    return pages.length > 0 ? pages : [html];
  } catch {
    return [html];
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
      } else if (el.localName === "sectPr") {
        htmlParts.push('<div data-page-break="true"></div>');
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
  const val = pStyle?.getAttribute("w:val") || pStyle?.getAttribute("val") || "";
  if (/heading\s*1/i.test(val)) styleTag = "h1";
  else if (/heading\s*2/i.test(val)) styleTag = "h2";
  else if (/heading\s*3/i.test(val)) styleTag = "h3";

  // Check for pageBreakBefore in paragraph properties
  const hasPageBreakBefore = p.querySelector("pageBreakBefore") !== null;

  const runParts: string[] = [];
  p.childNodes.forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const child = node as Element;

    if (child.localName === "r") {
      // Check for page break in run: <w:br w:type="page"/> or <w:lastRenderedPageBreak/>
      const brPage = child.querySelector('br[w\\:type="page"], br[type="page"]');
      const hasLastRenderedBreak = child.querySelector("lastRenderedPageBreak") !== null;
      if (brPage || hasLastRenderedBreak) {
        runParts.push('<div data-page-break="true"></div>');
      }

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
  const pPrefix = hasPageBreakBefore ? '<div data-page-break="true"></div>' : "";
  if (!content.trim()) {
    return hasPageBreakBefore ? `${pPrefix}<p><br/></p>` : "<p><br/></p>";
  }

  // Check for section break at paragraph end
  const hasSectPr = p.querySelector("sectPr") !== null;
  const pSuffix = hasSectPr ? '<div data-page-break="true"></div>' : "";

  return `${pPrefix}<${styleTag}>${content}</${styleTag}>${pSuffix}`;
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
 * Parses HTML document text and extracts pages.
 */
function parseHtmlText(html: string): { html: string; pages: string[] } {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // 1. Check for section[data-page-id] or div[data-page-id] (our editor export format)
    const pageSections = Array.from(
      doc.querySelectorAll("section[data-page-id], div[data-page-id]")
    );
    if (pageSections.length > 0) {
      const pages = pageSections.map((sec) => {
        const contentEl =
          sec.querySelector('[contenteditable="true"], [data-content="true"], main') || sec;
        return contentEl.innerHTML.trim() || "<p><br/></p>";
      });
      return { html: pages.join(""), pages };
    }

    // 2. Check for elements with class 'page', 'document-page', 'sheet', or [data-page]
    const pageDivs = Array.from(
      doc.querySelectorAll(".page, .document-page, .sheet, [data-page]")
    );
    if (pageDivs.length > 0) {
      const pages = pageDivs.map((d) => d.innerHTML.trim() || "<p><br/></p>");
      return { html: pages.join(""), pages };
    }

    // 3. Fallback to body innerHTML with page splitter
    const bodyHtml = doc.body.innerHTML || html;
    const pages = splitHtmlIntoPages(bodyHtml);
    return { html: bodyHtml, pages };
  } catch {
    return { html, pages: [html] };
  }
}

/**
 * Parses JSON document text into document pages.
 */
function parseJsonText(jsonStr: string): { html: string; pages: string[] } {
  try {
    const parsed = JSON.parse(jsonStr);

    // Case A: { pages: [...], pageHtml: { page_1: "...", page_2: "..." } }
    if (parsed.pageHtml && typeof parsed.pageHtml === "object") {
      if (Array.isArray(parsed.pages) && parsed.pages.length > 0) {
        const pages = parsed.pages
          .map((p: any) => {
            const id = typeof p === "string" ? p : p.id;
            return parsed.pageHtml[id] || (typeof p === "object" ? p.html || p.content : "");
          })
          .filter((h: string) => typeof h === "string" && h.trim().length > 0);
        if (pages.length > 0) return { html: pages.join(""), pages };
      } else {
        const pages = Object.values(parsed.pageHtml).filter(
          (h): h is string => typeof h === "string" && h.trim().length > 0
        );
        if (pages.length > 0) return { html: pages.join(""), pages };
      }
    }

    // Case B: { pages: [ "html1", "html2" ] } or { pages: [ { html: "..." }, { content: "..." } ] }
    if (Array.isArray(parsed.pages) && parsed.pages.length > 0) {
      const pages = parsed.pages
        .map((p: any) =>
          typeof p === "string" ? p : p.html || p.content || (p.text ? `<p>${escapeHtml(p.text)}</p>` : "")
        )
        .filter((h: string) => typeof h === "string" && h.trim().length > 0);
      if (pages.length > 0) return { html: pages.join(""), pages };
    }

    // Case C: { content: "..." } or { html: "..." }
    const content =
      typeof parsed.content === "string"
        ? parsed.content
        : typeof parsed.html === "string"
        ? parsed.html
        : "";
    if (content) {
      const pages = splitHtmlIntoPages(content);
      return { html: content, pages };
    }

    const fallbackHtml = `<pre class="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs font-mono">${escapeHtml(
      JSON.stringify(parsed, null, 2)
    )}</pre>`;
    return { html: fallbackHtml, pages: [fallbackHtml] };
  } catch {
    const p = `<p>${escapeHtml(jsonStr)}</p>`;
    return { html: p, pages: [p] };
  }
}

/**
 * Parses Markdown into HTML with page support.
 */
function parseMarkdownText(md: string): { html: string; pages: string[] } {
  const pageDelimiter = /(?:<!--\s*page[-_]?break\s*-->|===+\s*page[-_]?break\s*===+)/i;
  let pageSections: string[] = [];

  if (pageDelimiter.test(md)) {
    pageSections = md.split(pageDelimiter);
  } else {
    pageSections = [md];
  }

  const pages = pageSections.map((sectionMd) => {
    const lines = sectionMd.split(/\r?\n/);
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
  });

  if (pages.length === 1) {
    const paginated = splitHtmlIntoPages(pages[0]);
    return { html: pages[0], pages: paginated };
  }

  return { html: pages.join(""), pages };
}

/**
 * Parses plain text into HTML paragraphs with page support.
 */
function parsePlainText(text: string): { html: string; pages: string[] } {
  const pageDelimiter = /(?:\x0C|\f|---+\s*page\s*break\s*---+|\[\s*page\s*break\s*\])/i;
  let pageSections: string[] = [];

  if (pageDelimiter.test(text)) {
    pageSections = text.split(pageDelimiter);
  } else {
    pageSections = [text];
  }

  const pages = pageSections.map((sec) => {
    const paragraphs = sec
      .split(/\r?\n\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${escapeHtml(p).replace(/\r?\n/g, "<br/>")}</p>`);

    return paragraphs.length > 0 ? paragraphs.join("") : `<p>${escapeHtml(sec) || "<br/>"}</p>`;
  });

  if (pages.length === 1) {
    const paginated = splitHtmlIntoPages(pages[0]);
    return { html: pages[0], pages: paginated };
  }

  return { html: pages.join(""), pages };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
