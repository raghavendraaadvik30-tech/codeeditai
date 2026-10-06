/**
 * fileImportUtil.ts
 * 
 * Comprehensive document file parser for the Document Editor.
 * Supports:
 * - Word documents (.docx) via JSZip and OpenXML parsing
 * - PDF documents (.pdf) rendered page-by-page with PDF.js
 * - HTML documents (.html, .htm) via DOMParser
 * - Markdown files (.md, .markdown)
 * - Structured JSON documents (.json)
 * - Plain text (.txt, .text, .rtf)
 * 
 * Accurately parses and paginates continuous multi-page documents.
 */

import JSZip from "jszip";

export interface ImportedPageLayout {
  orientation: "portrait" | "landscape";
  paperSize: { name: string; width: number; height: number };
}

export interface ParsedDocument {
  title: string;
  html: string;
  pages: string[];
  pageLayout?: ImportedPageLayout;
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

    if (lowerName.endsWith(".pdf")) {
      const buffer = await file.arrayBuffer();
      const { html, pages, pageLayout } = await parsePdfBuffer(buffer);
      return { title: cleanTitle, html, pages, pageLayout };
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
    // A PDF is binary. Treating it as plain text creates fake content and
    // misleading page counts, so preserve the error instead of importing bytes.
    if (lowerName.endsWith(".pdf")) {
      throw new Error("Unable to render this PDF. Please verify the file and try again.", { cause: err });
    }
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
 * and auto-paginates continuous content to fit document page dimensions without cutoffs.
 */
export function splitHtmlIntoPages(html: string): string[] {
  if (!html || !html.trim()) return ["<p><br/></p>"];

  const breakPattern = /(?:<div[^>]*data-page-break="true"[^>]*><\/div>|<hr[^>]*class="[^"]*page-break[^"]*"[^>]*\/?>|<!--\s*page[-_]?break\s*-->|<div[^>]*style="[^"]*page-break-before:\s*always[^"]*"[^>]*><\/div>|<div[^>]*style="[^"]*break-before:\s*page[^"]*"[^>]*><\/div>)/i;

  // If there are explicit breaks, divide into segments
  const rawSegments = breakPattern.test(html) ? html.split(breakPattern) : [html];
  const finalPages: string[] = [];

  for (const seg of rawSegments) {
    const trimmed = seg.trim();
    if (!trimmed || trimmed === "<p><br/></p>" || trimmed === "<p><br></p>") {
      continue;
    }
    // Paginate this segment if needed
    const subPages = paginateContinuousHtml(trimmed);
    finalPages.push(...subPages);
  }

  return finalPages.length > 0 ? finalPages : ["<p><br/></p>"];
}

/**
 * Continuous HTML paginator that measures block heights and splits across page boundaries.
 */
function paginateContinuousHtml(html: string): string[] {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Extract all flat block elements (unpacking any wrappers like div.WordSection1, main, article, section)
    const blocks = extractTopBlockElements(doc.body);

    if (blocks.length === 0) {
      return [html];
    }

    const pages: string[] = [];
    let currentPageHtml: string[] = [];
    let currentHeight = 0;
    const MAX_PAGE_HEIGHT = 760; // Standard Word printable writing height in px (1056 - 96 - 96 - 48 - 48)

    for (let i = 0; i < blocks.length; i++) {
      const child = blocks[i];

      // Check explicit break indicator
      const style = child.getAttribute("style") || "";
      const isExplicitBreak =
        child.getAttribute("data-page-break") === "true" ||
        child.classList.contains("page-break") ||
        /page-break-before:\s*always/i.test(style) ||
        /break-before:\s*page/i.test(style);

      if (isExplicitBreak) {
        if (currentPageHtml.length > 0) {
          pages.push(currentPageHtml.join(""));
          currentPageHtml = [];
          currentHeight = 0;
        }
        continue;
      }

      // Estimate rendered height
      const tag = child.tagName.toLowerCase();
      const textLen = child.textContent?.length || 0;
      let elementHeight = 35;

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
        elementHeight = 16 + lines * 26;
      } else {
        const lines = Math.max(1, Math.ceil(textLen / 70));
        elementHeight = Math.max(35, lines * 26);
      }

      // Handle extra-large paragraphs that exceed a page by themselves
      if (tag === "p" && elementHeight > MAX_PAGE_HEIGHT && textLen > 700) {
        if (currentPageHtml.length > 0) {
          pages.push(currentPageHtml.join(""));
          currentPageHtml = [];
          currentHeight = 0;
        }
        // Split long paragraph into chunks
        const pChunks = splitLongParagraph(child.innerHTML, 600);
        for (const pChunk of pChunks) {
          pages.push(pChunk);
        }
        continue;
      }

      // If adding element exceeds MAX_PAGE_HEIGHT
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
 * Extracts top-level content elements, unpacking any container divs, sections, articles, or WordSection1 wrappers.
 */
function extractTopBlockElements(root: Element): Element[] {
  const blocks: Element[] = [];
  const containerTags = new Set(["div", "section", "article", "main"]);

  function walk(node: Element) {
    const tag = node.tagName.toLowerCase();

    // If it's a page break element, treat as block
    if (
      node.getAttribute("data-page-break") === "true" ||
      node.classList.contains("page-break") ||
      node.getAttribute("style")?.includes("page-break") ||
      node.getAttribute("style")?.includes("break-before")
    ) {
      blocks.push(node);
      return;
    }

    // If it's a container wrapper (e.g. WordSection1 or div)
    if (containerTags.has(tag) && node.children.length > 0) {
      let hasBlockChild = false;
      for (let i = 0; i < node.children.length; i++) {
        const childTag = node.children[i].tagName.toLowerCase();
        if (/^(p|h[1-6]|table|ul|ol|blockquote|pre|div|section|article|figure|hr)$/.test(childTag)) {
          hasBlockChild = true;
          break;
        }
      }
      if (hasBlockChild) {
        for (let i = 0; i < node.children.length; i++) {
          walk(node.children[i]);
        }
        return;
      }
    }

    blocks.push(node);
  }

  for (let i = 0; i < root.children.length; i++) {
    walk(root.children[i]);
  }

  return blocks;
}

/**
 * Splits extra-large paragraph HTML into smaller paragraphs by sentence boundaries.
 */
function splitLongParagraph(innerHtml: string, maxCharsPerChunk = 600): string[] {
  const sentences = innerHtml.split(/(?<=[.!?])\s+(?=[A-Z0-9<])/);
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLen = 0;

  for (const s of sentences) {
    if (currentLen + s.length > maxCharsPerChunk && currentChunk.length > 0) {
      chunks.push(`<p>${currentChunk.join(" ")}</p>`);
      currentChunk = [s];
      currentLen = s.length;
    } else {
      currentChunk.push(s);
      currentLen += s.length;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(`<p>${currentChunk.join(" ")}</p>`);
  }

  return chunks.length > 0 ? chunks : [`<p>${innerHtml}</p>`];
}

// Retained for the DOCX fallback path; PDF files are rendered by PDF.js below.
function extractPrintableStrings(bytes: Uint8Array): string {
  const chunks: string[] = [];
  let current: number[] = [];

  for (const byte of bytes) {
    if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13) {
      current.push(byte);
    } else {
      if (current.length >= 6) chunks.push(new TextDecoder().decode(new Uint8Array(current)));
      current = [];
    }
  }
  if (current.length >= 6) chunks.push(new TextDecoder().decode(new Uint8Array(current)));

  const valid = chunks
    .filter((chunk) => !chunk.includes("[Content_Types]") && !chunk.includes("word/") && !chunk.includes("schemas."))
    .slice(0, 500);
  return valid.map((value) => `<p>${escapeHtml(value)}</p>`).join("") || "<p><br/></p>";
}

/**
 * Parses DOCX ArrayBuffer by reading the ZIP archive via JSZip and extracting word/document.xml.
 */
async function parseDocxBuffer(buffer: ArrayBuffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(buffer);
    const docXmlFile = zip.file("word/document.xml");
    if (docXmlFile) {
      const xmlText = await docXmlFile.async("text");
      if (xmlText) {
        const html = convertDocxXmlToHtml(xmlText);
        if (html && html.trim()) return html;
      }
    }
  } catch (err) {
    console.warn("JSZip DOCX reading failed, attempting fallback extraction:", err);
  }

  // Fallback: extract readable strings from the buffer
  return extractPrintableStrings(new Uint8Array(buffer));
}

/**
 * Converts Word document.xml into HTML elements (headings, paragraphs, bold/italic, tables, page breaks).
 */
function convertDocxXmlToHtml(xml: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const body =
      doc.querySelector("body") ||
      doc.getElementsByTagName("w:body")[0] ||
      doc.getElementsByTagName("body")[0];

    if (!body) return fallbackRegexXmlExtract(xml);

    const htmlParts: string[] = [];
    const nodes = Array.from(body.childNodes);

    for (const node of nodes) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      const el = node as Element;
      const localName = el.localName || el.nodeName.replace(/^w:/, "");

      if (localName === "p") {
        htmlParts.push(processParagraphElement(el));
      } else if (localName === "tbl") {
        htmlParts.push(processTableElement(el));
      } else if (localName === "sectPr") {
        htmlParts.push('<div data-page-break="true"></div>');
      }
    }

    const result = htmlParts.join("");
    return result.trim() ? result : fallbackRegexXmlExtract(xml);
  } catch {
    return fallbackRegexXmlExtract(xml);
  }
}

function processParagraphElement(p: Element): string {
  let styleTag = "p";
  const pStyle = p.querySelector("pStyle") || p.getElementsByTagName("w:pStyle")[0];
  const val =
    pStyle?.getAttribute("w:val") ||
    pStyle?.getAttribute("val") ||
    "";
  if (/heading\s*1/i.test(val)) styleTag = "h1";
  else if (/heading\s*2/i.test(val)) styleTag = "h2";
  else if (/heading\s*3/i.test(val)) styleTag = "h3";
  else if (/heading\s*4/i.test(val)) styleTag = "h4";

  // Check for pageBreakBefore in paragraph properties
  const hasPageBreakBefore =
    p.querySelector("pageBreakBefore") !== null ||
    p.getElementsByTagName("w:pageBreakBefore").length > 0 ||
    p.getElementsByTagName("pageBreakBefore").length > 0;

  const runParts: string[] = [];
  const nodes = Array.from(p.childNodes);

  for (const node of nodes) {
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const child = node as Element;
    const childName = child.localName || child.nodeName.replace(/^w:/, "");

    if (childName === "r") {
      // Check for page breaks in run
      const brs = Array.from(child.getElementsByTagName("w:br")).concat(
        Array.from(child.getElementsByTagName("br"))
      );
      for (const br of brs) {
        const t = br.getAttribute("w:type") || br.getAttribute("type");
        if (t === "page") {
          runParts.push('<div data-page-break="true"></div>');
        } else {
          runParts.push("<br/>");
        }
      }

      const hasLastRendered =
        child.getElementsByTagName("w:lastRenderedPageBreak").length > 0 ||
        child.getElementsByTagName("lastRenderedPageBreak").length > 0;
      if (hasLastRendered) {
        runParts.push('<div data-page-break="true"></div>');
      }

      let text = "";
      const textNodes = Array.from(child.getElementsByTagName("w:t")).concat(
        Array.from(child.getElementsByTagName("t"))
      );
      for (const t of textNodes) {
        text += t.textContent || "";
      }

      if (!text) continue;

      const isBold =
        child.getElementsByTagName("w:b").length > 0 ||
        child.getElementsByTagName("b").length > 0;
      const isItalic =
        child.getElementsByTagName("w:i").length > 0 ||
        child.getElementsByTagName("i").length > 0;
      const isUnderline =
        child.getElementsByTagName("w:u").length > 0 ||
        child.getElementsByTagName("u").length > 0;
      const isStrike =
        child.getElementsByTagName("w:strike").length > 0 ||
        child.getElementsByTagName("strike").length > 0;

      let formatted = escapeHtml(text);
      if (isBold) formatted = `<strong>${formatted}</strong>`;
      if (isItalic) formatted = `<em>${formatted}</em>`;
      if (isUnderline) formatted = `<u>${formatted}</u>`;
      if (isStrike) formatted = `<s>${formatted}</s>`;

      runParts.push(formatted);
    }
  }

  const content = runParts.join("");
  const pPrefix = hasPageBreakBefore ? '<div data-page-break="true"></div>' : "";
  if (!content.trim()) {
    return hasPageBreakBefore ? `${pPrefix}<p><br/></p>` : "<p><br/></p>";
  }

  // Check for section break at paragraph end
  const hasSectPr =
    p.getElementsByTagName("w:sectPr").length > 0 ||
    p.getElementsByTagName("sectPr").length > 0;
  const pSuffix = hasSectPr ? '<div data-page-break="true"></div>' : "";

  return `${pPrefix}<${styleTag}>${content}</${styleTag}>${pSuffix}`;
}

function processTableElement(tbl: Element): string {
  const rows: string[] = [];
  const trList = Array.from(tbl.getElementsByTagName("w:tr")).concat(
    Array.from(tbl.getElementsByTagName("tr"))
  );

  for (const tr of trList) {
    const cells: string[] = [];
    const tcList = Array.from(tr.getElementsByTagName("w:tc")).concat(
      Array.from(tr.getElementsByTagName("tc"))
    );

    for (const tc of tcList) {
      const cellTextParts: string[] = [];
      const pList = Array.from(tc.getElementsByTagName("w:p")).concat(
        Array.from(tc.getElementsByTagName("p"))
      );
      for (const p of pList) {
        cellTextParts.push(processParagraphElement(p));
      }
      const cellContent = cellTextParts.join("") || "<p><br/></p>";
      cells.push(`<td class="border border-slate-300 dark:border-slate-700 p-2">${cellContent}</td>`);
    }
    rows.push(`<tr>${cells.join("")}</tr>`);
  }

  return `<table class="document-table border-collapse border border-slate-300 dark:border-slate-700 w-full my-3">${rows.join("")}</table>`;
}

function fallbackRegexXmlExtract(xml: string): string {
  const matches = xml.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
  if (!matches || matches.length === 0) return "<p><br/></p>";

  const texts = matches.map((m) => m.replace(/<[^>]+>/g, ""));
  return `<p>${escapeHtml(texts.join(" "))}</p>`;
}

/** Render each source PDF page once and preserve its physical dimensions. */
async function parsePdfBuffer(buffer: ArrayBuffer): Promise<{
  html: string;
  pages: string[];
  pageLayout: ImportedPageLayout;
}> {
  const [{ getDocument, GlobalWorkerOptions }, worker] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  GlobalWorkerOptions.workerSrc = worker.default;
  const loadingTask = getDocument({ data: new Uint8Array(buffer) });
  const pages: string[] = [];
  let pageLayout: ImportedPageLayout | undefined;

  try {
    const pdf = await loadingTask.promise;
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      // PDF coordinates are points (72 per inch); editor dimensions are CSS
      // pixels (96 per inch). Convert once, then render at 1.5x that display size.
      const pdfPointsToCssPixels = 96 / 72;
      const cssViewport = page.getViewport({ scale: pdfPointsToCssPixels });
      const renderViewport = page.getViewport({ scale: pdfPointsToCssPixels * 1.5 });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(renderViewport.width);
      canvas.height = Math.ceil(renderViewport.height);
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error(`Could not create a canvas for PDF page ${pageNumber}.`);

      await page.render({ canvas, canvasContext: context, viewport: renderViewport }).promise;
      const imageUrl = canvas.toDataURL("image/jpeg", 0.88);
      const width = cssViewport.width;
      const height = cssViewport.height;
      pages.push(
        `<img data-imported-pdf-page="true" data-source-page="${pageNumber}" src="${imageUrl}" width="${width}" height="${height}" alt="PDF page ${pageNumber}" style="display:block;width:${width}px;height:${height}px;max-width:100%;max-height:100%;object-fit:contain;"/>`
      );
      canvas.width = 0;
      canvas.height = 0;

      if (pageNumber === 1) {
        const isLandscape = width > height;
        pageLayout = {
          orientation: isLandscape ? "landscape" : "portrait",
          paperSize: {
            name: "Imported PDF",
            width: isLandscape ? height : width,
            height: isLandscape ? width : height,
          },
        };
      }
      page.cleanup();
    }
  } finally {
    await loadingTask.destroy();
  }

  if (!pageLayout || pages.length === 0) {
    throw new Error("The PDF does not contain any renderable pages.");
  }

  return { html: pages.join(""), pages, pageLayout };
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

    if (Array.isArray(parsed.pages) && parsed.pages.length > 0) {
      const pages = parsed.pages
        .map((p: any) =>
          typeof p === "string" ? p : p.html || p.content || (p.text ? `<p>${escapeHtml(p.text)}</p>` : "")
        )
        .filter((h: string) => typeof h === "string" && h.trim().length > 0);
      if (pages.length > 0) return { html: pages.join(""), pages };
    }

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
