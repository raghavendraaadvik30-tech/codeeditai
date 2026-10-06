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
  sectionKey?: string;
  orientation: "portrait" | "landscape";
  paperSize: { name: string; width: number; height: number };
  marginConfig?: { top: number; bottom: number; left: number; right: number };
  gutter?: number;
  headerTopDistance?: number;
  footerBottomDistance?: number;
  mirroredMargins?: boolean;
  headerHtml?: string;
  footerHtml?: string;
  firstHeaderHtml?: string;
  firstFooterHtml?: string;
  evenHeaderHtml?: string;
  evenFooterHtml?: string;
  differentFirstPage?: boolean;
  differentOddEven?: boolean;
}

export interface ParsedDocument {
  title: string;
  html: string;
  pages: string[];
  pageLayout?: ImportedPageLayout;
  pageLayouts?: ImportedPageLayout[];
}

/**
 * Main entry point: parses any uploaded document file into title, full HTML, and individual page HTMLs.
 */
export async function parseUploadedFile(file: File): Promise<ParsedDocument> {
  if (!(file instanceof File) || !file.name.trim()) {
    throw new Error("Choose a file to import.");
  }
  if (file.size <= 0) throw new Error("The selected file is empty.");
  if (file.size > 50 * 1024 * 1024) throw new Error("Files larger than 50 MB cannot be imported.");

  const fileName = file.name.trim();
  const cleanTitle = fileName.replace(/\.[^/.]+$/, "") || "Uploaded Document";
  const extension = fileName.toLowerCase().split(".").pop() || "";
  const supported = new Set(["docx", "doc", "pdf", "html", "htm", "json", "md", "markdown", "txt", "text", "rtf"]);
  if (!supported.has(extension)) throw new Error(`The .${extension || "unknown"} format is not supported.`);
  if (extension === "pdf" && file.type && !["application/pdf", "application/x-pdf"].includes(file.type.toLowerCase())) {
    throw new Error("The selected file is not a PDF.");
  }

  try {
    if (extension === "docx") {
      const { html, pages, pageLayout, pageLayouts } = await parseDocxBuffer(await file.arrayBuffer());
      if (!html.trim()) throw new Error("The DOCX contains no importable content.");
      return {
        title: cleanTitle,
        html,
        pages,
        pageLayout,
        pageLayouts,
      };
    }

    if (extension === "pdf") {
      const buffer = await file.arrayBuffer();
      const { html, pages, pageLayout, pageLayouts } = await parsePdfBuffer(buffer);
      return { title: cleanTitle, html, pages, pageLayout, pageLayouts };
    }

    if (extension === "html" || extension === "htm") {
      const text = await file.text();
      const { html, pages } = parseHtmlText(text);
      return { title: cleanTitle, html, pages };
    }

    if (extension === "json") {
      const text = await file.text();
      const { html, pages } = parseJsonText(text);
      return { title: cleanTitle, html, pages };
    }

    if (extension === "md" || extension === "markdown") {
      const text = await file.text();
      const { html, pages } = parseMarkdownText(text);
      return { title: cleanTitle, html, pages };
    }

    const text = await file.text();
    const { html, pages } = parsePlainText(text);
    return { title: cleanTitle, html, pages };
  } catch (err) {
    console.error("Error parsing uploaded file:", err);
    if (err instanceof Error && err.message.startsWith("The ")) throw err;
    if (extension === "pdf") {
      const errorName = err instanceof Error ? err.name : "PDF parser error";
      throw new Error(
        `Unable to read “${fileName}” (${errorName}). The PDF may be damaged or too complex for the browser. Try opening and re-saving it as a new PDF, then import that copy.`,
        { cause: err },
      );
    }
    throw new Error(`Unable to import “${fileName}”. Check that the file is valid and try again.`, { cause: err });
  }
}

/**
 * Splits HTML content into individual pages based on explicit page-break markers,
 * and auto-paginates continuous content to fit document page dimensions without cutoffs.
 */
export function splitHtmlIntoPages(html: string): string[] {
  if (!html || !html.trim()) return ["<p><br/></p>"];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const pages: string[] = [];
  let current: string[] = [];
  const isBreak = (element: Element) => element.matches(
    '[data-page-break], .page-break, hr[class*="page-break"], [style*="page-break-before: always"], [style*="break-before: page"]'
  );
  const flush = () => {
    const content = current.join("").trim();
    if (content) pages.push(content);
    current = [];
  };
  const splitTableAtRowBreaks = (table: Element): Element[] => {
    const segments = [table.cloneNode(false) as Element];
    for (const child of Array.from(table.childNodes)) {
      if (child instanceof Element && child.localName === "tr") {
        const row = child.cloneNode(true) as Element;
        const hasPageBreak = row.matches("[data-page-break], .page-break")
          || Boolean(row.querySelector("[data-page-break], .page-break"));
        row.querySelectorAll("[data-page-break], .page-break").forEach((marker) => marker.remove());
        segments[segments.length - 1].appendChild(row);
        if (hasPageBreak) segments.push(table.cloneNode(false) as Element);
      } else {
        segments[segments.length - 1].appendChild(child.cloneNode(true));
      }
    }
    return segments;
  };
  const splitElement = (element: Element): Element[] => {
    if (element.localName === "table") return splitTableAtRowBreaks(element);
    const segments = [element.cloneNode(false) as Element];
    for (const child of Array.from(element.childNodes)) {
      if (child instanceof Element && isBreak(child)) {
        segments.push(element.cloneNode(false) as Element);
        continue;
      }

      const childSegments = child instanceof Element ? splitElement(child) : [child.cloneNode(true)];
      for (let index = 0; index < childSegments.length; index += 1) {
        if (index > 0) segments.push(element.cloneNode(false) as Element);
        segments[segments.length - 1].appendChild(childSegments[index]);
      }
    }
    return segments;
  };
  for (const node of Array.from(doc.body.childNodes)) {
    if (node instanceof Element && isBreak(node)) {
      flush();
    } else if (node.nodeType === Node.COMMENT_NODE && /page[-_ ]?break/i.test(node.textContent || "")) {
      flush();
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const segments = splitElement(element).filter((segment) => segment.innerHTML.trim());
      segments.forEach((segment, index) => {
        if (index > 0) flush();
        current.push(sanitizeImportedHtml(segment.outerHTML));
      });
    } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      current.push(`<p>${escapeHtml(node.textContent)}</p>`);
    }
  }
  flush();
  return pages.length ? pages : ["<p><br/></p>"];
}

/** Reads editable WordprocessingML content and embedded media from the DOCX package. */
async function parseDocxBuffer(buffer: ArrayBuffer): Promise<{
  html: string;
  pages: string[];
  pageLayout?: ImportedPageLayout;
  pageLayouts?: ImportedPageLayout[];
}> {
  const zip = await JSZip.loadAsync(buffer);
  const documentFile = zip.file("word/document.xml");
  if (!documentFile) throw new Error("This DOCX does not contain a Word document body.");
  const documentXml = new DOMParser().parseFromString(await documentFile.async("text"), "application/xml");
  if (documentXml.querySelector("parsererror")) throw new Error("The DOCX document XML is invalid.");
  const body = documentXml.getElementsByTagNameNS("*", "body")[0];
  if (!body) throw new Error("This DOCX does not contain a Word document body.");

  const relationships = new Map<string, WordRelationship>();
  const relFile = zip.file("word/_rels/document.xml.rels");
  if (relFile) {
    const relXml = new DOMParser().parseFromString(await relFile.async("text"), "application/xml");
    for (const rel of Array.from(relXml.getElementsByTagName("Relationship"))) {
      const id = rel.getAttribute("Id");
      const target = rel.getAttribute("Target");
      if (id && target) relationships.set(id, {
        target,
        external: rel.getAttribute("TargetMode") === "External",
        type: rel.getAttribute("Type") ?? "",
      });
    }
  }

  const resolveTarget = (target: string) => {
    const parts = (target.startsWith("/") ? target.slice(1) : `word/${target}`).split("/");
    const normalized: string[] = [];
    for (const part of parts) {
      if (part === "..") normalized.pop();
      else if (part && part !== ".") normalized.push(part);
    }
    return normalized.join("/");
  };
  const wordStyles = await readWordStyles(zip);
  const listFormats = await readWordNumberFormats(zip);
  const listCounters = new Map<string, number>();
  const sectionProperties = Array.from(body.children).find((node) => node.localName === "sectPr");
  const sectionParts = await renderWordSections(body, zip, relationships, resolveTarget, listFormats, listCounters, wordStyles);
  const html = sectionParts.map((part) => part.html).join("").trim();
  if (!html) throw new Error("The DOCX contains no importable paragraphs or tables.");
  const settingsFile = zip.file("word/settings.xml");
  const settingsXml = settingsFile
    ? new DOMParser().parseFromString(await settingsFile.async("text"), "application/xml")
    : undefined;
  const mirroredMargins = Boolean(settingsXml?.getElementsByTagNameNS("*", "mirrorMargins").length);
  const pages: string[] = [];
  const pageLayouts: ImportedPageLayout[] = [];
  let previousHeader: string | undefined;
  let previousFooter: string | undefined;
  for (const [sectionIndex, part] of sectionParts.entries()) {
    const section = part.properties ?? sectionProperties;
    const layout = getWordPageLayout(section, mirroredMargins);
    if (!layout) continue;
    layout.sectionKey = `docx-section-${sectionIndex + 1}`;
    if (section) {
      layout.headerHtml = await readWordHeaderFooter(zip, section, "headerReference", relationships, resolveTarget, wordStyles) ?? previousHeader;
      layout.footerHtml = await readWordHeaderFooter(zip, section, "footerReference", relationships, resolveTarget, wordStyles) ?? previousFooter;
      layout.firstHeaderHtml = await readWordHeaderFooter(zip, section, "headerReference", relationships, resolveTarget, wordStyles, "first") ?? layout.headerHtml;
      layout.firstFooterHtml = await readWordHeaderFooter(zip, section, "footerReference", relationships, resolveTarget, wordStyles, "first") ?? layout.footerHtml;
      layout.evenHeaderHtml = await readWordHeaderFooter(zip, section, "headerReference", relationships, resolveTarget, wordStyles, "even") ?? layout.headerHtml;
      layout.evenFooterHtml = await readWordHeaderFooter(zip, section, "footerReference", relationships, resolveTarget, wordStyles, "even") ?? layout.footerHtml;
      layout.differentFirstPage = Boolean(directChild(section, "titlePg"));
      layout.differentOddEven = Boolean(settingsXml?.getElementsByTagNameNS("*", "evenAndOddHeaders").length);
    }
    previousHeader = layout.headerHtml;
    previousFooter = layout.footerHtml;
    if (!part.html.trim()) continue;
    const sectionPages = splitHtmlIntoPages(part.html);
    const sectionType = section ? wordValue(directChild(section, "type"), "val", "nextPage") : "nextPage";
    const firstPageIndex = sectionType === "continuous" && pages.length > 0 ? 1 : 0;
    if (firstPageIndex === 1 && sectionPages[0]?.trim()) pages[pages.length - 1] += sectionPages[0];
    for (const page of sectionPages.slice(firstPageIndex)) {
      if (!page.trim()) continue;
      pages.push(page);
      pageLayouts.push(layout);
    }
  }
  if (pages.length === 0) pages.push(...splitHtmlIntoPages(html));
  const pageLayout = pageLayouts[0] ?? getWordPageLayout(sectionProperties, mirroredMargins);
  return { html, pages, pageLayout, pageLayouts: pageLayouts.length ? pageLayouts : undefined };
}

type WordRelationship = { target: string; external: boolean; type: string };
type ResolveTarget = (target: string) => string;
type WordListFormat = "bullet" | "number";

async function renderWordBlocks(
  parent: Element,
  zip: JSZip,
  relationships: Map<string, WordRelationship>,
  resolveTarget: ResolveTarget,
  listFormats: Map<string, WordListFormat>,
  listCounters: Map<string, number>,
  wordStyles: WordStyleContext,
): Promise<string> {
  const rendered: string[] = [];
  for (const block of Array.from(parent.children)) {
    if (block.localName === "altChunk") {
      const relationshipId = wordAttribute(block, "id");
      const relationship = relationshipId ? relationships.get(relationshipId) : undefined;
      const target = relationship && !relationship.external ? resolveTarget(relationship.target) : "";
      const chunk = target ? zip.file(target) : undefined;
      if (chunk && /\.(x?html?)$/i.test(target)) {
        rendered.push(sanitizeImportedHtml(await chunk.async("text")));
      }
    } else if (block.localName === "p") {
      rendered.push(await renderWordParagraph(block, zip, relationships, resolveTarget, listFormats, listCounters, wordStyles));
    } else if (block.localName === "tbl") {
      rendered.push(await renderWordTable(block, zip, relationships, resolveTarget, listFormats, listCounters, wordStyles));
    } else if (block.localName === "sectPr" || block.localName === "pPr" || block.localName === "tcPr") {
      continue;
    } else {
      // Word wraps real paragraphs and tables in content controls, tracked
      // changes, and custom XML containers. Walk those wrappers so their
      // contents are not silently dropped during import.
      rendered.push(await renderWordBlocks(block, zip, relationships, resolveTarget, listFormats, listCounters, wordStyles));
    }
  }
  return rendered.join("");
}

interface RenderedWordSection {
  html: string;
  properties?: Element;
}

async function renderWordSections(
  parent: Element,
  zip: JSZip,
  relationships: Map<string, WordRelationship>,
  resolveTarget: ResolveTarget,
  listFormats: Map<string, WordListFormat>,
  listCounters: Map<string, number>,
  wordStyles: WordStyleContext,
): Promise<RenderedWordSection[]> {
  const sections: RenderedWordSection[] = [];
  let currentHtml = "";

  for (const block of Array.from(parent.children)) {
    if (block.localName === "p") {
      currentHtml += await renderWordParagraph(block, zip, relationships, resolveTarget, listFormats, listCounters, wordStyles);
      const paragraphSection = directChild(directChild(block, "pPr") ?? document.createElement("div"), "sectPr");
      if (paragraphSection) {
        sections.push({ html: currentHtml, properties: paragraphSection });
        currentHtml = "";
      }
    } else if (block.localName === "tbl") {
      currentHtml += await renderWordTable(block, zip, relationships, resolveTarget, listFormats, listCounters, wordStyles);
    } else if (block.localName === "altChunk") {
      const relationshipId = wordAttribute(block, "id");
      const relationship = relationshipId ? relationships.get(relationshipId) : undefined;
      const target = relationship && !relationship.external ? resolveTarget(relationship.target) : "";
      const chunk = target ? zip.file(target) : undefined;
      if (chunk && /\.(x?html?)$/i.test(target)) currentHtml += sanitizeImportedHtml(await chunk.async("text"));
    } else if (block.localName === "sectPr") {
      sections.push({ html: currentHtml, properties: block });
      currentHtml = "";
    } else if (block.localName !== "pPr" && block.localName !== "tcPr") {
      const nestedSections = await renderWordSections(block, zip, relationships, resolveTarget, listFormats, listCounters, wordStyles);
      for (const nested of nestedSections) {
        currentHtml += nested.html;
        if (nested.properties) {
          sections.push({ html: currentHtml, properties: nested.properties });
          currentHtml = "";
        }
      }
    }
  }

  if (currentHtml.trim()) sections.push({ html: currentHtml });
  return sections;
}

interface WordStyleDefinition {
  id: string;
  type: string;
  basedOn?: string;
  paragraphProperties?: Element;
  runProperties?: Element;
}
interface WordStyleContext {
  byId: Map<string, WordStyleDefinition>;
  defaultParagraphStyleId?: string;
  defaultParagraphProperties?: Element;
  defaultRunProperties?: Element;
  themeColors: Map<string, string>;
}

async function readWordStyles(zip: JSZip): Promise<WordStyleContext> {
  const byId = new Map<string, WordStyleDefinition>();
  const themeColors = new Map<string, string>();
  const themeFile = zip.file("word/theme/theme1.xml");
  if (themeFile) {
    const themeXml = new DOMParser().parseFromString(await themeFile.async("text"), "application/xml");
    const colorScheme = Array.from(themeXml.getElementsByTagNameNS("*", "clrScheme"))[0];
    for (const color of Array.from(colorScheme?.children ?? [])) {
      const colorValue = Array.from(color.children).map((entry) =>
        wordAttribute(entry, "lastClr") ?? wordAttribute(entry, "val"),
      ).find((value) => value && /^[0-9a-f]{6}$/i.test(value));
      if (colorValue) themeColors.set(color.localName, `#${colorValue}`);
    }
  }
  const stylesFile = zip.file("word/styles.xml");
  if (!stylesFile) return { byId, themeColors };
  const xml = new DOMParser().parseFromString(await stylesFile.async("text"), "application/xml");
  const defaults = directChild(xml.documentElement, "docDefaults");
  const paragraphDefaultContainer = directChild(defaults ?? document.createElement("div"), "pPrDefault");
  const runDefaultContainer = directChild(defaults ?? document.createElement("div"), "rPrDefault");
  const defaultParagraphProperties = directChild(paragraphDefaultContainer ?? document.createElement("div"), "pPr");
  const defaultRunProperties = directChild(runDefaultContainer ?? document.createElement("div"), "rPr");

  let defaultParagraphStyleId: string | undefined;
  for (const style of Array.from(xml.getElementsByTagNameNS("*", "style"))) {
    const id = wordAttribute(style, "styleId");
    const type = wordAttribute(style, "type");
    if (!id || !type) continue;
    byId.set(id, {
      id,
      type,
      basedOn: wordValue(style, "basedOn") || undefined,
      paragraphProperties: directChild(style, "pPr"),
      runProperties: directChild(style, "rPr"),
    });
    if (type === "paragraph" && wordAttribute(style, "default") === "1") defaultParagraphStyleId = id;
  }
  return { byId, defaultParagraphStyleId, defaultParagraphProperties, defaultRunProperties, themeColors };
}

function readThemeColor(themeName: string, wordStyles: WordStyleContext): string | undefined {
  return wordStyles.themeColors.get(themeName);
}

function wordStyleChain(context: WordStyleContext, styleId: string, type: string): WordStyleDefinition[] {
  const result: WordStyleDefinition[] = [];
  const seen = new Set<string>();
  let currentId = styleId;
  while (currentId && !seen.has(currentId)) {
    seen.add(currentId);
    const style = context.byId.get(currentId);
    if (!style || style.type !== type) break;
    result.push(style);
    currentId = style.basedOn ?? "";
  }
  return result;
}

function resolvedWordProperties(properties: Array<Element | undefined>, name: string): Element | undefined {
  for (const parent of properties) {
    const property = parent && directChild(parent, name);
    if (property) return property;
  }
  return undefined;
}

function resolvedWordValue(properties: Array<Element | undefined>, name: string, fallback = ""): string {
  return wordAttribute(resolvedWordProperties(properties, name), "val") ?? fallback;
}

function resolvedWordToggle(properties: Array<Element | undefined>, name: string): boolean {
  const property = resolvedWordProperties(properties, name);
  if (!property) return false;
  const value = wordAttribute(property, "val");
  return value !== "0" && value !== "false" && value !== "off";
}

async function readWordNumberFormats(zip: JSZip): Promise<Map<string, WordListFormat>> {
  const formats = new Map<string, WordListFormat>();
  const numberingFile = zip.file("word/numbering.xml");
  if (!numberingFile) return formats;
  const xml = new DOMParser().parseFromString(await numberingFile.async("text"), "application/xml");
  const abstractFormats = new Map<string, WordListFormat>();
  for (const abstract of Array.from(xml.getElementsByTagNameNS("*", "abstractNum"))) {
    const abstractId = wordAttribute(abstract, "abstractNumId");
    const level = Array.from(abstract.children).find((child) => child.localName === "lvl");
    const format = wordValue(level, "numFmt");
    if (abstractId && format) abstractFormats.set(abstractId, format === "bullet" ? "bullet" : "number");
  }
  for (const number of Array.from(xml.getElementsByTagNameNS("*", "num"))) {
    const numberId = wordAttribute(number, "numId");
    const abstractId = wordValue(number, "abstractNumId");
    const format = abstractFormats.get(abstractId);
    if (numberId && format) formats.set(numberId, format);
  }
  return formats;
}

async function readWordHeaderFooter(
  zip: JSZip,
  section: Element,
  referenceName: "headerReference" | "footerReference",
  relationships: Map<string, WordRelationship>,
  resolveTarget: ResolveTarget,
  wordStyles: WordStyleContext,
  referenceType: "default" | "first" | "even" = "default",
): Promise<string | undefined> {
  const reference = Array.from(section.children).find((child) => child.localName === referenceName && (wordAttribute(child, "type") ?? "default") === referenceType)
    ?? (referenceType === "default" ? undefined : Array.from(section.children).find((child) => child.localName === referenceName && (wordAttribute(child, "type") ?? "default") === "default"))
    ?? Array.from(section.children).find((child) => child.localName === referenceName);
  const relationshipId = wordAttribute(reference, "id");
  const relationship = relationshipId ? relationships.get(relationshipId) : undefined;
  if (!relationship || relationship.external) return undefined;
  const target = resolveTarget(relationship.target);
  if (!target.startsWith("word/")) return undefined;
  const part = zip.file(target);
  if (!part) return undefined;
  const xml = new DOMParser().parseFromString(await part.async("text"), "application/xml");
  const partDirectory = target.slice(0, target.lastIndexOf("/") + 1);
  const partName = target.slice(target.lastIndexOf("/") + 1);
  const partRelationships = new Map(relationships);
  const partRelationshipsFile = zip.file(`${partDirectory}_rels/${partName}.rels`);
  if (partRelationshipsFile) {
    const relXml = new DOMParser().parseFromString(await partRelationshipsFile.async("text"), "application/xml");
    for (const rel of Array.from(relXml.getElementsByTagName("Relationship"))) {
      const id = rel.getAttribute("Id");
      const relTarget = rel.getAttribute("Target");
      if (id && relTarget) {
        partRelationships.set(id, {
          target: relTarget,
          external: rel.getAttribute("TargetMode") === "External",
          type: rel.getAttribute("Type") ?? "",
        });
      }
    }
  }

  const listFormats = new Map<string, WordListFormat>();
  const listCounters = new Map<string, number>();
  const html = (await renderWordBlocks(xml.documentElement, zip, partRelationships, resolveTarget, listFormats, listCounters, wordStyles)).trim();
  return html || undefined;
}

function directChild(parent: Element, localName: string): Element | undefined {
  return Array.from(parent.children).find((child) => child.localName === localName);
}

function wordAttribute(element: Element | undefined, name: string): string | null {
  if (!element) return null;
  return element.getAttribute(name) ?? Array.from(element.attributes).find((attribute) => attribute.localName === name)?.value ?? null;
}

function wordValue(element: Element | undefined, name: string, fallback = ""): string {
  const child = element && directChild(element, name);
  return wordAttribute(child, "val") ?? fallback;
}

function getWordPageLayout(section: Element | undefined, mirroredMargins = false): ImportedPageLayout | undefined {
  if (!section) return undefined;
  const pageSize = directChild(section, "pgSz");
  const margins = directChild(section, "pgMar");
  const twipsToPx = (value: string | null | undefined, fallback: number, allowZero = false) => {
    if (value == null || value.trim() === "") return fallback;
    const number = Number(value);
    return Number.isFinite(number) && (allowZero ? number >= 0 : number > 0) ? number / 15 : fallback;
  };
  const width = twipsToPx(wordAttribute(pageSize, "w"), 816);
  const height = twipsToPx(wordAttribute(pageSize, "h"), 1056);
  const orientation = wordAttribute(pageSize, "orient") === "landscape" || width > height ? "landscape" : "portrait";
  return {
    orientation,
    paperSize: { name: "Imported DOCX", width: orientation === "landscape" ? height : width, height: orientation === "landscape" ? width : height },
    marginConfig: {
      top: twipsToPx(wordAttribute(margins, "top"), 96, true),
      bottom: twipsToPx(wordAttribute(margins, "bottom"), 96, true),
      left: twipsToPx(wordAttribute(margins, "left"), 96, true),
      right: twipsToPx(wordAttribute(margins, "right"), 96, true),
    },
    gutter: twipsToPx(wordAttribute(margins, "gutter"), 0, true),
    headerTopDistance: twipsToPx(wordAttribute(margins, "header"), 48, true),
    footerBottomDistance: twipsToPx(wordAttribute(margins, "footer"), 48, true),
    mirroredMargins,
  };
}

function wordParagraphStyle(properties: Array<Element | undefined>, styleId: string): { tag: string; style: string; breakBefore: boolean } {
  const normalizedStyleId = styleId.toLowerCase();
  const heading = /heading\s*([1-6])/.exec(normalizedStyleId) || /heading([1-6])/.exec(normalizedStyleId);
  const tag = heading ? `h${heading[1]}` : "p";
  const styles: string[] = [];
  const alignment = resolvedWordValue(properties, "jc");
  const alignments: Record<string, string> = { both: "justify", distribute: "justify", center: "center", right: "right", left: "left" };
  if (alignments[alignment]) styles.push(`text-align:${alignments[alignment]}`);
  const indent = resolvedWordProperties(properties, "ind");
  const leftIndent = wordAttribute(indent, "left");
  const rightIndent = wordAttribute(indent, "right");
  const firstLineIndent = wordAttribute(indent, "firstLine");
  const hangingIndent = wordAttribute(indent, "hanging");
  if (leftIndent) styles.push(`margin-left:${Number(leftIndent) / 15}px`);
  if (rightIndent) styles.push(`margin-right:${Number(rightIndent) / 15}px`);
  if (firstLineIndent) styles.push(`text-indent:${Number(firstLineIndent) / 15}px`);
  if (hangingIndent) styles.push(`text-indent:-${Number(hangingIndent) / 15}px`);
  const spacing = resolvedWordProperties(properties, "spacing");
  const beforeSpacing = wordAttribute(spacing, "before");
  const afterSpacing = wordAttribute(spacing, "after");
  const lineSpacing = wordAttribute(spacing, "line");
  if (beforeSpacing) styles.push(`margin-top:${Number(beforeSpacing) / 15}px`);
  if (afterSpacing) styles.push(`margin-bottom:${Number(afterSpacing) / 15}px`);
  if (lineSpacing) {
    const line = Number(lineSpacing);
    const rule = wordAttribute(spacing, "lineRule");
    if (line > 0) {
      const lineHeight = rule === "exact" || rule === "atLeast" ? `${line / 15}px` : `${line / 240}`;
      styles.push(`line-height:${lineHeight}`);
    }
  }
  const paragraphBorders = resolvedWordProperties(properties, "pBdr");
  for (const side of ["top", "right", "bottom", "left"] as const) {
    const border = directChild(paragraphBorders ?? document.createElement("div"), side);
    const borderType = wordAttribute(border, "val");
    if (!borderType || borderType === "none" || borderType === "nil") continue;
    const borderSize = Number(wordAttribute(border, "sz"));
    const borderWidth = Number.isFinite(borderSize) && borderSize > 0 ? borderSize / 6 : 2 / 3;
    const borderColor = wordAttribute(border, "color");
    const color = borderColor && /^[0-9a-f]{6}$/i.test(borderColor) ? `#${borderColor}` : "#000000";
    const borderStyle = borderType === "double" ? "double"
      : borderType.includes("dash") ? "dashed"
        : borderType === "dotted" ? "dotted" : "solid";
    styles.push(`border-${side}:${borderWidth}px ${borderStyle} ${color}`);
    const space = Number(wordAttribute(border, "space"));
    if (space > 0) styles.push(`padding-${side}:${(space * 96) / 72}px`);
  }
  if (resolvedWordToggle(properties, "keepNext")) styles.push("break-after:avoid-page");
  if (resolvedWordToggle(properties, "keepLines") || resolvedWordToggle(properties, "widowControl")) styles.push("break-inside:avoid");
  const bidi = resolvedWordProperties(properties, "bidi");
  if (bidi) styles.push("direction:rtl");
  return { tag, style: styles.join(";"), breakBefore: resolvedWordToggle(properties, "pageBreakBefore") };
}

async function renderWordParagraph(
  paragraph: Element,
  zip: JSZip,
  relationships: Map<string, WordRelationship>,
  resolveTarget: ResolveTarget,
  listFormats: Map<string, WordListFormat>,
  listCounters: Map<string, number>,
  wordStyles: WordStyleContext,
): Promise<string> {
  const properties = directChild(paragraph, "pPr");
  const paragraphStyleId = wordValue(properties, "pStyle") || wordStyles.defaultParagraphStyleId || "";
  const styleChain = wordStyleChain(wordStyles, paragraphStyleId, "paragraph");
  const paragraphProperties = [
    properties,
    ...styleChain.map((style) => style.paragraphProperties),
    wordStyles.defaultParagraphProperties,
  ];
  const paragraphRunProperties = [
    directChild(properties ?? document.createElement("div"), "rPr"),
    ...styleChain.map((style) => style.runProperties),
    wordStyles.defaultRunProperties,
  ];
  const paragraphStyle = wordParagraphStyle(paragraphProperties, paragraphStyleId);
  const content = await renderWordInlineChildren(paragraph, zip, relationships, resolveTarget, wordStyles, paragraphRunProperties);
  const sectionBreak = directChild(properties ?? document.createElement("div"), "sectPr");
  const sectionBreakType = wordAttribute(directChild(sectionBreak ?? document.createElement("div"), "type"), "val") ?? "nextPage";
  const isEmpty = !content.replace(/<br\s*\/?\s*>/gi, "").trim();
  if (isEmpty && !paragraphStyle.breakBefore && !sectionBreak) return "";
  const prefix = paragraphStyle.breakBefore ? '<div data-page-break="true"></div>' : "";
  const numPr = resolvedWordProperties(paragraphProperties, "numPr");
  const numberId = wordValue(numPr, "numId");
  const listFormat = numberId ? listFormats.get(numberId) : undefined;
  if (listFormat === "bullet") return `${prefix}<ul><li>${content || "<br/>"}</li></ul>${sectionBreak && sectionBreakType !== "continuous" ? '<div data-page-break="true"></div>' : ""}`;
  if (listFormat === "number") {
    const listStart = (listCounters.get(numberId!) ?? 0) + 1;
    listCounters.set(numberId!, listStart);
    return `${prefix}<ol start="${listStart}"><li>${content || "<br/>"}</li></ol>${sectionBreak && sectionBreakType !== "continuous" ? '<div data-page-break="true"></div>' : ""}`;
  }
  const tag = paragraphStyle.tag;
  const styleAttr = paragraphStyle.style ? ` style="${escapeHtml(paragraphStyle.style)}"` : "";
  const suffix = sectionBreak && sectionBreakType !== "continuous" ? '<div data-page-break="true"></div>' : "";
  return `${prefix}<${tag}${styleAttr}>${content || "<br/>"}</${tag}>${suffix}`;
}

async function renderWordInlineChildren(
  parent: Element,
  zip: JSZip,
  relationships: Map<string, WordRelationship>,
  resolveTarget: ResolveTarget,
  wordStyles: WordStyleContext,
  paragraphRunProperties: Array<Element | undefined>,
): Promise<string> {
  const parts: string[] = [];
  for (const child of Array.from(parent.children)) {
    if (child.localName === "pPr") continue;
    if (child.localName === "r") {
      const properties = directChild(child, "rPr");
      const runStyleId = wordValue(properties, "rStyle");
      const runStyleChain = wordStyleChain(wordStyles, runStyleId, "character");
      const runProperties = [properties, ...runStyleChain.map((style) => style.runProperties), ...paragraphRunProperties];
      const runParts: string[] = [];
      for (const item of Array.from(child.children)) {
        if (item.localName === "rPr") continue;
        if (item.localName === "t" || item.localName === "delText") {
          runParts.push(escapeHtml(item.textContent ?? ""));
        } else if (item.localName === "tab") {
          runParts.push("&#9;");
        } else if (item.localName === "br" || item.localName === "cr") {
          if (wordAttribute(item, "type") === "page") runParts.push('<div data-page-break="true"></div>');
          else runParts.push("<br/>");
        } else if (item.localName === "lastRenderedPageBreak") {
          runParts.push('<div data-page-break="true"></div>');
        } else if (item.localName === "drawing" || item.localName === "pict") {
          const image = await renderWordImage(item, zip, relationships, resolveTarget);
          const textBoxes = Array.from(item.getElementsByTagNameNS("*", "txbxContent"));
          const renderedTextBoxes = await Promise.all(textBoxes.map((textBox) =>
            renderWordBlocks(textBox, zip, relationships, resolveTarget, new Map(), new Map(), wordStyles),
          ));
          runParts.push(image, ...renderedTextBoxes);
        }
      }
      let content = runParts.join("");
      if (!content) continue;
      if (resolvedWordToggle(runProperties, "b")) content = `<strong>${content}</strong>`;
      if (resolvedWordToggle(runProperties, "i")) content = `<em>${content}</em>`;
      const underline = resolvedWordValue(runProperties, "u");
      if (underline && underline !== "none") content = `<u>${content}</u>`;
      if (resolvedWordToggle(runProperties, "strike") || resolvedWordToggle(runProperties, "dstrike")) content = `<s>${content}</s>`;
      const colorProperty = resolvedWordProperties(runProperties, "color");
      const color = wordAttribute(colorProperty, "val") ?? "";
      const highlight = resolvedWordValue(runProperties, "highlight");
      const shading = resolvedWordProperties(runProperties, "shd");
      const shadingFill = wordAttribute(shading, "fill");
      const fontSize = Number(resolvedWordValue(runProperties, "sz"));
      const fontSizeComplexScript = Number(resolvedWordValue(runProperties, "szCs"));
      const fonts = resolvedWordProperties(runProperties, "rFonts");
      const font = wordAttribute(fonts, "ascii") || wordAttribute(fonts, "hAnsi") || wordAttribute(fonts, "eastAsia");
      const style: string[] = [];
      if (/^[0-9a-f]{6}$/i.test(color)) style.push(`color:#${color}`);
      if (!/^[0-9a-f]{6}$/i.test(color)) {
        const themeColor = wordAttribute(colorProperty, "themeColor");
        const resolvedThemeColor = themeColor ? readThemeColor(themeColor, wordStyles) : undefined;
        if (resolvedThemeColor) style.push(`color:${resolvedThemeColor}`);
      }
      if (/^[0-9a-f]{6}$/i.test(highlight)) style.push(`background-color:#${highlight}`);
      else if (highlight && highlight !== "none") style.push(`background-color:${highlight}`);
      if (shadingFill && /^[0-9a-f]{6}$/i.test(shadingFill)) style.push(`background-color:#${shadingFill}`);
      if (fontSize > 0) style.push(`font-size:${(fontSize * 2) / 3}px`);
      else if (fontSizeComplexScript > 0) style.push(`font-size:${(fontSizeComplexScript * 2) / 3}px`);
      if (font) style.push(`font-family:${JSON.stringify(font)}`);
      if (resolvedWordToggle(runProperties, "caps")) style.push("text-transform:uppercase");
      if (resolvedWordToggle(runProperties, "smallCaps")) style.push("font-variant:small-caps");
      const charSpacing = Number(resolvedWordValue(runProperties, "spacing"));
      if (charSpacing) style.push(`letter-spacing:${charSpacing / 15}px`);
      if (style.length) content = `<span style="${escapeHtml(style.join(";"))}">${content}</span>`;
      const verticalAlignment = resolvedWordValue(runProperties, "vertAlign");
      if (verticalAlignment === "superscript") content = `<sup>${content}</sup>`;
      else if (verticalAlignment === "subscript") content = `<sub>${content}</sub>`;
      parts.push(content);
    } else if (child.localName === "hyperlink") {
      const relId = wordAttribute(child, "id");
      const rel = relId ? relationships.get(relId) : undefined;
      const content = await renderWordInlineChildren(child, zip, relationships, resolveTarget, wordStyles, paragraphRunProperties);
      parts.push(rel?.external && /^https?:|^mailto:/i.test(rel.target)
        ? `<a href="${escapeHtml(rel.target)}">${content}</a>`
        : content);
    } else if (child.localName === "lastRenderedPageBreak") {
      parts.push('<div data-page-break="true"></div>');
    } else if (["sdt", "sdtContent", "customXml", "smartTag", "ins", "del", "moveTo", "moveFrom", "dir", "bdo", "fldSimple", "ruby", "rt"].includes(child.localName)) {
      parts.push(await renderWordInlineChildren(child, zip, relationships, resolveTarget, wordStyles, paragraphRunProperties));
    }
  }
  return parts.join("");
}

async function renderWordImage(
  drawing: Element,
  zip: JSZip,
  relationships: Map<string, WordRelationship>,
  resolveTarget: ResolveTarget,
): Promise<string> {
  // Word normally stores modern pictures as DrawingML blips. Older DOCX files
  // use VML imagedata references, so support both relationship forms.
  const imageRef = drawing.getElementsByTagNameNS("*", "blip")[0]
    ?? drawing.getElementsByTagNameNS("*", "imagedata")[0];
  const relId = wordAttribute(imageRef, "embed")
    || wordAttribute(imageRef, "link")
    || wordAttribute(imageRef, "id");
  const rel = relId ? relationships.get(relId) : undefined;
  if (!rel || rel.external) return "";
  const imagePath = resolveTarget(rel.target);
  const imageFile = zip.file(imagePath);
  if (!imageFile) return "";
  const extension = imagePath.split(".").pop()?.toLowerCase() ?? "png";
  const mimeByExtension: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    bmp: "image/bmp",
    webp: "image/webp",
    svg: "image/svg+xml",
  };
  const mime = mimeByExtension[extension];
  if (!mime) {
    console.warn(`Skipping unsupported embedded Word image format: ${extension}`);
    return "";
  }

  const data = await imageFile.async("base64");
  const extent = drawing.getElementsByTagNameNS("*", "extent")[0];
  let width = Number(extent?.getAttribute("cx")) / 9525;
  let height = Number(extent?.getAttribute("cy")) / 9525;

  // Legacy VML stores display dimensions in the shape's CSS style instead of
  // a DrawingML extent. Convert the common Word units into CSS pixels.
  if (!(width > 0) || !(height > 0)) {
    const shape = drawing.getElementsByTagNameNS("*", "shape")[0];
    const shapeStyle = wordAttribute(shape, "style") ?? "";
    const toPixels = (raw: string | undefined) => {
      if (!raw) return 0;
      const match = /^\s*(-?\d+(?:\.\d+)?)(px|pt|in|cm|mm)?\s*$/i.exec(raw);
      if (!match) return 0;
      const value = Number(match[1]);
      const unit = (match[2] ?? "pt").toLowerCase();
      const factor = unit === "px" ? 1 : unit === "in" ? 96 : unit === "cm" ? 96 / 2.54 : unit === "mm" ? 96 / 25.4 : 96 / 72;
      return value * factor;
    };
    const shapeWidth = /(?:^|;)\s*width\s*:\s*([^;]+)/i.exec(shapeStyle)?.[1];
    const shapeHeight = /(?:^|;)\s*height\s*:\s*([^;]+)/i.exec(shapeStyle)?.[1];
    if (!(width > 0)) width = toPixels(shapeWidth);
    if (!(height > 0)) height = toPixels(shapeHeight);
  }

  const styles = ["max-width:100%", "height:auto", "object-fit:contain", "vertical-align:middle"];
  if (width > 0 && Number.isFinite(width)) styles.push(`width:${width}px`);
  if (height > 0 && Number.isFinite(height) && !(width > 0)) styles.push(`height:${height}px`);

  // Floating Word pictures use anchor/wrap elements. Preserve the common
  // right/center and text-wrapping behavior with CSS floats or block alignment.
  const isAnchored = drawing.getElementsByTagNameNS("*", "anchor").length > 0;
  const horizontalPosition = drawing.getElementsByTagNameNS("*", "positionH")[0];
  const verticalPosition = drawing.getElementsByTagNameNS("*", "positionV")[0];
  const horizontalAlignment = directChild(horizontalPosition ?? document.createElement("div"), "align")?.textContent?.trim().toLowerCase();
  const hasTopBottomWrap = drawing.getElementsByTagNameNS("*", "wrapTopAndBottom").length > 0;
  const hasSideWrap = drawing.getElementsByTagNameNS("*", "wrapSquare").length > 0
    || drawing.getElementsByTagNameNS("*", "wrapTight").length > 0
    || drawing.getElementsByTagNameNS("*", "wrapThrough").length > 0;

  const distance = (name: string) => {
    const value = Number(wordAttribute(drawing, name));
    return Number.isFinite(value) && value > 0 ? value / 9525 : 0;
  };
  const distanceTop = distance("distT");
  const distanceRight = distance("distR");
  const distanceBottom = distance("distB");
  const distanceLeft = distance("distL");

  if (isAnchored && hasSideWrap && horizontalAlignment !== "center") {
    styles.push(
      `float:${horizontalAlignment === "right" ? "right" : "left"}`,
      `margin:${distanceTop}px ${distanceRight}px ${distanceBottom}px ${distanceLeft}px`,
    );
  } else if (isAnchored && (hasTopBottomWrap || horizontalAlignment === "center")) {
    styles.push("display:block", `margin:${distanceTop}px auto ${distanceBottom}px`);
  } else {
    styles.push("display:inline-block");
  }

  // Page-relative anchors can be mapped to the editor page's positioned
  // section, preserving Word's stored X/Y location instead of flowing inline.
  if (isAnchored
    && wordAttribute(horizontalPosition, "relativeFrom") === "page"
    && wordAttribute(verticalPosition, "relativeFrom") === "page") {
    const x = Number(directChild(horizontalPosition!, "posOffset")?.textContent) / 9525;
    const y = Number(directChild(verticalPosition!, "posOffset")?.textContent) / 9525;
    if (Number.isFinite(x) && Number.isFinite(y)) {
      styles.push("position:absolute", `left:${x}px`, `top:${y}px`, "display:block", "float:none", "margin:0");
    }
  }

  const properties = drawing.getElementsByTagNameNS("*", "docPr")[0]
    ?? drawing.getElementsByTagNameNS("*", "cNvPr")[0];
  const alt = wordAttribute(properties, "descr") || wordAttribute(properties, "title") || "Imported image";
  return `<img src="data:${mime};base64,${data}" alt="${escapeHtml(alt)}" style="${styles.join(";")}"/>`;
}

async function renderWordTable(
  table: Element,
  zip: JSZip,
  relationships: Map<string, WordRelationship>,
  resolveTarget: ResolveTarget,
  listFormats: Map<string, WordListFormat>,
  listCounters: Map<string, number>,
  wordStyles: WordStyleContext,
): Promise<string> {
  const rows: string[] = [];
  const wordRows = Array.from(table.children).filter((child) => child.localName === "tr");
  for (const [rowIndex, row] of wordRows.entries()) {
    const cells: string[] = [];
    let columnIndex = 0;
    for (const cell of Array.from(row.children).filter((child) => child.localName === "tc")) {
      const cellProperties = directChild(cell, "tcPr");
      const span = Number(wordValue(cellProperties, "gridSpan", "1"));
      const firstColumn = columnIndex;
      columnIndex += span;
      const verticalMerge = directChild(cellProperties ?? document.createElement("div"), "vMerge");
      if (verticalMerge && wordAttribute(verticalMerge, "val") !== "restart") continue;
      let rowSpan = 1;
      if (verticalMerge) {
        for (let nextRowIndex = rowIndex + 1; nextRowIndex < wordRows.length; nextRowIndex += 1) {
          let nextColumn = 0;
          const continuation = Array.from(wordRows[nextRowIndex].children)
            .filter((child) => child.localName === "tc")
            .find((nextCell) => {
              const nextSpan = Number(wordValue(directChild(nextCell, "tcPr"), "gridSpan", "1"));
              const matchesColumn = nextColumn === firstColumn;
              nextColumn += nextSpan;
              return matchesColumn;
            });
          const continuationProperties = continuation && directChild(continuation, "tcPr");
          const continuationMerge = directChild(continuationProperties ?? document.createElement("div"), "vMerge");
          if (!continuationMerge || wordAttribute(continuationMerge, "val") === "restart") break;
          rowSpan += 1;
        }
      }
      const cellContent = await renderWordBlocks(cell, zip, relationships, resolveTarget, listFormats, listCounters, wordStyles);
      const fill = wordValue(cellProperties, "shd");
      const background = /^[0-9a-f]{6}$/i.test(fill) ? `background-color:#${fill};` : "";
      cells.push(`<td${span > 1 ? ` colspan="${span}"` : ""}${rowSpan > 1 ? ` rowspan="${rowSpan}"` : ""} style="border:1px solid #94a3b8;padding:6px;vertical-align:top;${background}">${cellContent || "<p><br/></p>"}</td>`);
    }
    rows.push(`<tr>${cells.join("")}</tr>`);
  }
  return `<table style="border-collapse:collapse;max-width:100%;">${rows.join("")}</table>`;
}

function sanitizeImportedHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script,style,iframe,object,embed,link,meta,base").forEach((node) => node.remove());
  const allowed = new Set(["class", "style", "href", "src", "alt", "title", "width", "height", "colspan", "rowspan", "start", "type", "data-page-break", "data-imported-pdf-page", "data-source-page"]);
  doc.body.querySelectorAll("*").forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      if (name.startsWith("on") || !allowed.has(name)) {
        element.removeAttribute(attribute.name);
        continue;
      }
      if (name === "href" && !/^(https?:|mailto:|#)/i.test(attribute.value.trim())) element.removeAttribute(attribute.name);
      if (name === "src" && !/^data:image\/(png|jpe?g|gif|bmp|webp|svg\+xml);base64,/i.test(attribute.value.trim())) element.removeAttribute(attribute.name);
      if (name === "style") {
        const safe = attribute.value.split(";").filter((declaration) =>
          /^(color|background-color|font-family|font-size|font-weight|font-style|font-variant|text-transform|text-decoration|text-align|text-indent|letter-spacing|margin|margin-(top|bottom|left|right)|padding|padding-(top|bottom|left|right)|border|border-(top|bottom|left|right)|border-collapse|width|height|line-height|vertical-align|object-fit|display|float|position|left|top)\s*:/i.test(declaration.trim())
          && !/url\s*\(|expression\s*\(/i.test(declaration)
        );
        if (safe.length) element.setAttribute("style", safe.join(";"));
        else element.removeAttribute("style");
      }
    }
  });
  return doc.body.innerHTML;
}

/** Render each source PDF page once and preserve its physical dimensions. */
async function parsePdfBuffer(buffer: ArrayBuffer): Promise<{
  html: string;
  pages: string[];
  pageLayout: ImportedPageLayout;
  pageLayouts: ImportedPageLayout[];
}> {
  const [{ getDocument, GlobalWorkerOptions }, worker] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  GlobalWorkerOptions.workerSrc = worker.default;
  const loadingTask = getDocument({
    data: new Uint8Array(buffer),
    // PDF.js can recover usable pages from damaged page trees and streams.
    stopAtErrors: false,
    useSystemFonts: true,
    canvasMaxAreaInBytes: 64 * 1024 * 1024,
  });
  const pages: string[] = [];
  const pageLayouts: ImportedPageLayout[] = [];

  try {
    const pdf = await loadingTask.promise;
    if (!Number.isSafeInteger(pdf.numPages) || pdf.numPages < 1) {
      throw new Error("The PDF does not contain a readable page tree.");
    }

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber).catch((error: unknown) => {
        throw new Error(`PDF page ${pageNumber} could not be read. The file may have a damaged page tree.`, { cause: error });
      });

      // Keep the editor page at the source's physical size while limiting the
      // raster surface used to represent it. Large scans can otherwise create
      // canvases that exhaust the browser's memory before import completes.
      const pdfPointsToCssPixels = 96 / 72;
      const pageViewport = page.getViewport({ scale: pdfPointsToCssPixels });
      const maxRenderPixels = 2_500_000;
      const maxRenderSide = 4096;
      const pixelScale = Math.min(
        1,
        Math.sqrt(maxRenderPixels / (pageViewport.width * pageViewport.height)),
        maxRenderSide / Math.max(pageViewport.width, pageViewport.height),
      );
      const renderViewport = page.getViewport({ scale: pdfPointsToCssPixels * pixelScale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.ceil(renderViewport.width);
      canvas.height = Math.ceil(renderViewport.height);
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error(`Could not create a canvas for PDF page ${pageNumber}.`);

      let imageUrl: string;
      try {
        await page.render({ canvas, canvasContext: context, viewport: renderViewport }).promise;
        imageUrl = canvas.toDataURL("image/jpeg", 0.68);
      } catch (error) {
        // Retry the page at half resolution for PDFs with unusually expensive
        // images or transparency groups. Page geometry remains unchanged.
        canvas.width = 0;
        canvas.height = 0;
        const retryScale = pixelScale * 0.5;
        const retryViewport = page.getViewport({ scale: pdfPointsToCssPixels * retryScale });
        canvas.width = Math.ceil(retryViewport.width);
        canvas.height = Math.ceil(retryViewport.height);
        const retryContext = canvas.getContext("2d", { alpha: false });
        if (!retryContext) {
          throw new Error(`PDF page ${pageNumber} could not be rendered within browser memory limits.`, { cause: error });
        }
        try {
          await page.render({ canvas, canvasContext: retryContext, viewport: retryViewport }).promise;
          imageUrl = canvas.toDataURL("image/jpeg", 0.58);
        } catch (retryError) {
          throw new Error(`PDF page ${pageNumber} could not be rendered. Try repairing or re-saving the PDF and import it again.`, { cause: retryError });
        }
      }

      const width = pageViewport.width;
      const height = pageViewport.height;
      pages.push(
        `<img data-imported-pdf-page="true" data-source-page="${pageNumber}" src="${imageUrl}" width="${width}" height="${height}" alt="PDF page ${pageNumber}" style="display:block;width:${width}px;height:${height}px;object-fit:contain;"/>`
      );
      canvas.width = 0;
      canvas.height = 0;

      const isLandscape = width > height;
      pageLayouts.push({
        orientation: isLandscape ? "landscape" : "portrait",
        paperSize: {
          name: "Imported PDF",
          width: isLandscape ? height : width,
          height: isLandscape ? width : height,
        },
        marginConfig: { top: 0, bottom: 0, left: 0, right: 0 },
      });
      page.cleanup();
    }
  } finally {
    await loadingTask.destroy();
  }

  if (pageLayouts.length === 0 || pages.length === 0) {
    throw new Error("The PDF does not contain any renderable pages.");
  }

  return { html: pages.join(""), pages, pageLayout: pageLayouts[0], pageLayouts };
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
        return sanitizeImportedHtml(contentEl.innerHTML.trim()) || "<p><br/></p>";
      });
      return { html: pages.join(""), pages };
    }

    // 2. Check for elements with class 'page', 'document-page', 'sheet', or [data-page]
    const pageDivs = Array.from(
      doc.querySelectorAll(".page, .document-page, .sheet, [data-page]")
    );
    if (pageDivs.length > 0) {
      const pages = pageDivs.map((d) => sanitizeImportedHtml(d.innerHTML.trim()) || "<p><br/></p>");
      return { html: pages.join(""), pages };
    }

    // 3. Fallback to body innerHTML with page splitter
    const bodyHtml = sanitizeImportedHtml(doc.body.innerHTML || html);
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
    const parsedValue: unknown = JSON.parse(jsonStr);
    const parsed = asRecord(parsedValue) ?? {};
    const pageHtml = asRecord(parsed.pageHtml);

    if (pageHtml) {
      if (Array.isArray(parsed.pages) && parsed.pages.length > 0) {
        const pages = parsed.pages
          .map((page: unknown) => {
            const pageRecord = asRecord(page);
            const id = typeof page === "string" ? page : pageRecord?.id;
            const content = (typeof id === "string" && typeof pageHtml[id] === "string" ? pageHtml[id] : undefined)
              ?? (typeof pageRecord?.html === "string" ? pageRecord.html : undefined)
              ?? (typeof pageRecord?.content === "string" ? pageRecord.content : "");
            return sanitizeImportedHtml(content);
          })
          .filter((h) => h.trim().length > 0);
        if (pages.length > 0) return { html: pages.join(""), pages };
      } else {
        const pages = Object.values(pageHtml)
          .filter((h): h is string => typeof h === "string" && h.trim().length > 0)
          .map(sanitizeImportedHtml);
        if (pages.length > 0) return { html: pages.join(""), pages };
      }
    }

    if (Array.isArray(parsed.pages) && parsed.pages.length > 0) {
      const pages = parsed.pages
        .map((page: unknown) => {
          const pageRecord = asRecord(page);
          if (typeof page === "string") return sanitizeImportedHtml(page);
          if (typeof pageRecord?.html === "string") return sanitizeImportedHtml(pageRecord.html);
          if (typeof pageRecord?.content === "string") return sanitizeImportedHtml(pageRecord.content);
          return typeof pageRecord?.text === "string" ? `<p>${escapeHtml(pageRecord.text)}</p>` : "";
        })
        .filter((h) => h.trim().length > 0);
      if (pages.length > 0) return { html: pages.join(""), pages };
    }

    const content = typeof parsed.content === "string" ? parsed.content : typeof parsed.html === "string" ? parsed.html : "";
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

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

/**
 * Parses Markdown into HTML with page support.
 */
function parseMarkdownText(md: string): { html: string; pages: string[] } {
  const pageDelimiter = /(?:<!--\s*page[-_]?break\s*-->|===+\s*page[-_]?break\s*===+)/i;
  const pageSections = pageDelimiter.test(md) ? md.split(pageDelimiter) : [md];

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
  const pageSections = text
    .split(/---+\s*page\s*break\s*---+|\[\s*page\s*break\s*\]/i)
    .flatMap((section) => section.split(String.fromCharCode(12)));

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
