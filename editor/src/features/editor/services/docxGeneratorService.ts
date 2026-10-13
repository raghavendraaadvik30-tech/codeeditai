/**
 * ============================================================================
 * FEATURE: DOCX Export Service (OpenXML Binary Generator)
 * FILE: docxGeneratorService.ts
 * PURPOSE: Converts DocumentModel and Page HTML node trees into a standard
 *          Microsoft Word (.docx) OpenXML binary package using JSZip.
 * ============================================================================
 */

import JSZip from "jszip";
import type { DocumentModel, SectionModel } from "../store/documentModel";

// ── Unit conversion ─────────────────────────────────────────────────────────
export const pxToPt = (px: number) => Math.round((px / 96) * 72 * 10) / 10;
export const pxToIn = (px: number) => Math.round((px / 96) * 1000) / 1000;

// ── XML escape ──────────────────────────────────────────────────────────────
function esc(s: string): string {
  if (!s) return "";
  return s
    // eslint-disable-next-line no-control-regex -- intentional: strip control chars for valid XML
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Parse a CSS length string to pixels
const parsePxVal = (v: string | null | undefined): number | null => {
  if (!v) return null;
  const s = v.trim();
  if (s.endsWith("px")) return parseFloat(s);
  if (s.endsWith("pt")) return (parseFloat(s) / 72) * 96;
  if (s.endsWith("cm")) return (parseFloat(s) / 2.54) * 96;
  if (s.endsWith("in")) return parseFloat(s) * 96;
  if (/^\d+(\.\d+)?$/.test(s)) return parseFloat(s);
  return null;
};

// Walk linkToPrevious chain to find the section that actually owns the HF content
function getSourceSection(model: DocumentModel, sec: SectionModel): SectionModel {
  let curr = sec;
  const idx = model.sections.findIndex((s) => s.id === curr.id);
  if (idx > 0 && curr.linkToPrevious) {
    for (let i = idx; i >= 0; i--) {
      const s = model.sections[i];
      if (i === 0 || !s.linkToPrevious) {
        curr = s;
        break;
      }
    }
  }
  return curr;
}

// Helper to convert color strings to Hex for Word Shading XML
function parseColorToHex(color: string | null | undefined): string | null {
  if (!color) return null;
  const s = color.trim().toLowerCase();
  if (s.startsWith("#")) {
    const hex = s.substring(1);
    if (hex.length === 3) {
      return (hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]).toUpperCase();
    }
    return hex.substring(0, 6).toUpperCase();
  }
  if (s.startsWith("rgb")) {
    const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) {
      const r = parseInt(m[1], 10).toString(16).padStart(2, "0");
      const g = parseInt(m[2], 10).toString(16).padStart(2, "0");
      const b = parseInt(m[3], 10).toString(16).padStart(2, "0");
      return (r + g + b).toUpperCase();
    }
  }
  const names: Record<string, string> = {
    white: "FFFFFF",
    black: "000000",
    red: "FF0000",
    green: "00FF00",
    blue: "0000FF",
    yellow: "FFFF00",
    gray: "808080",
    grey: "808080",
    silver: "C0C0C0",
    darkgray: "A9A9A9",
    lightgray: "D3D3D3",
    aqua: "00FFFF",
    cyan: "00FFFF",
    fuchsia: "FF00FF",
    magenta: "FF00FF",
    lime: "00FF00",
    maroon: "800000",
    navy: "000080",
    olive: "808000",
    purple: "800080",
    teal: "008080",
    gold: "FFD700",
    orange: "FFA500",
  };
  return names[s] || null;
}

// Helper to get standard Microsoft Word paper size code
function getPaperSizeCode(name: string | null | undefined): string | null {
  if (!name) return null;
  const s = name.trim().toLowerCase();
  if (s === "letter") return "1";
  if (s === "legal") return "5";
  if (s === "executive") return "7";
  if (s === "a3") return "8";
  if (s === "a4") return "9";
  if (s === "a5") return "11";
  if (s.includes("b4")) return "12";
  if (s.includes("b5")) return "13";
  return null;
}

// ── Per-section content width (accounts for orientation) ─────────────────────
function sectionContentWidthPx(sec: SectionModel): number {
  const isL = sec.orientation === "landscape";
  const paper = sec.paperSizeConfig ?? sec.paperSize;
  const baseW = paper?.width ?? 794;
  const baseH = paper?.height ?? 1123;
  const paperW = isL ? baseH : baseW;
  const mg = sec.marginConfig ?? { top: 96, bottom: 96, left: 96, right: 96 };
  return paperW - (mg.left ?? 96) - (mg.right ?? 96);
}

// ── Style parsing helpers ────────────────────────────────────────────────────
function parseStyleAttr(styleStr: string | null | undefined): Record<string, string> {
  if (!styleStr) return {};
  const res: Record<string, string> = {};
  styleStr.split(";").forEach((part) => {
    const idx = part.indexOf(":");
    if (idx > 0) {
      const name = part.substring(0, idx).trim().toLowerCase();
      const val = part.substring(idx + 1).trim();
      res[name] = val;
    }
  });
  return res;
}

function parseFontSize(val: string | null | undefined): number | null {
  if (!val) return null;
  const ptMatch = val.match(/^(\d+(\.\d+)?)pt$/i);
  if (ptMatch) {
    return Math.round(parseFloat(ptMatch[1]) * 2);
  }
  const pxMatch = val.match(/^(\d+(\.\d+)?)px$/i);
  if (pxMatch) {
    return Math.round(parseFloat(pxMatch[1]) * 1.5);
  }
  const numMatch = val.match(/^(\d+(\.\d+)?)$/);
  if (numMatch) {
    return Math.round(parseFloat(numMatch[1]) * 1.5);
  }
  return null;
}

interface BorderStyle {
  val: string;
  sz: string;
  space: string;
  color: string;
}

function parseBorder(borderStr: string | null | undefined): BorderStyle | null {
  if (!borderStr || borderStr === "none" || borderStr === "0px") return null;
  const parts = borderStr.split(/\s+/);
  let widthPx = 1;
  let style = "single";
  let color = "000000";
  
  parts.forEach((p) => {
    if (p.endsWith("px") || p.endsWith("pt") || /^\d+$/.test(p)) {
      widthPx = parsePxVal(p) ?? 1;
    } else if (["solid", "dashed", "dotted", "double"].includes(p)) {
      style = p === "solid" ? "single" : p;
    } else {
      const hex = parseColorToHex(p);
      if (hex) color = hex;
    }
  });
  
  if (color === "auto" || ["CCCCCC", "D3D3D3", "E0E0E0", "F0F0F0", "EFEFEF", "AEAEAE"].includes(color.toUpperCase())) {
    color = "000000";
  }
  
  const sz = Math.max(2, Math.min(96, Math.round(widthPx * 6)));
  
  return {
    val: style,
    sz: String(sz),
    space: "0",
    color,
  };
}

function isBlockElement(node: Node): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  const tag = (node as Element).tagName.toLowerCase();
  return [
    "p", "div", "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li", "table", "tr", "tbody", "thead",
    "tfoot", "blockquote", "section", "article", "aside", "header", "footer", "hr"
  ].includes(tag);
}

interface RelationshipItem {
  id: string;
  type: string;
  target: string;
  targetMode?: string;
}

interface ParseState {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  fontFamily?: string;
  fontSize?: string;
  color?: string;
  bg?: string;
  isHyperlink?: boolean;
  
  listType?: "ul" | "ol" | null;
  listIndex?: number;
  
  partRels: RelationshipItem[];
  forceInline?: boolean;
}

interface GridCell {
  element?: HTMLTableCellElement;
  isMerged?: boolean;
  isVMergeContinue?: boolean;
  isHMergeContinue?: boolean;
  isRowSpanStart?: boolean;
  colSpan: number;
  rowSpan: number;
  widthPx: number;
}

interface ExportContext {
  mediaFiles: { filename: string; data: string; base64: boolean }[];
  getNextRelId: () => string;
  imgCounter: { value: number };
  bookmarkCounter: { value: number };
  usedBookmarkNames: Set<string>;
  targetMap: Map<string, string>;
}

// ── Bookmark sanitization for Word OpenXML (max 40 chars, [a-zA-Z_][a-zA-Z0-9_]*) ──
function sanitizeBookmarkName(name: string | null | undefined): string {
  if (!name) return "bm_ref";
  let clean = name.replace(/^#+/, "").trim();
  clean = clean.replace(/^[🔖\s]+/, "");
  clean = clean.replace(/[^a-zA-Z0-9_]/g, "_");
  if (!clean) return "bm_ref";
  if (!/^[a-zA-Z_]/.test(clean)) {
    clean = `bm_${clean}`;
  }
  return clean.substring(0, 40);
}

function getElementBookmarks(
  el: HTMLElement,
  ctx: ExportContext
): { id: number; name: string }[] {
  const bookmarks: { id: number; name: string }[] = [];
  const candidateNames = new Set<string>();

  const dataBm = el.getAttribute("data-bookmark");
  if (dataBm && dataBm.trim()) candidateNames.add(dataBm.trim());

  const dataBmId = el.getAttribute("data-bookmark-id");
  if (dataBmId && dataBmId.trim()) candidateNames.add(dataBmId.trim());

  const elId = el.getAttribute("id");
  if (elId && elId.trim()) candidateNames.add(elId.trim());

  const elName = el.getAttribute("name");
  if (elName && elName.trim()) candidateNames.add(elName.trim());

  candidateNames.forEach((raw) => {
    const sanitized = ctx.targetMap?.get(raw) || ctx.targetMap?.get(raw.toLowerCase()) || sanitizeBookmarkName(raw);
    if (!ctx.usedBookmarkNames.has(sanitized)) {
      ctx.usedBookmarkNames.add(sanitized);
      const bmId = ctx.bookmarkCounter.value++;
      bookmarks.push({ id: bmId, name: sanitized });
    }
  });

  return bookmarks;
}

function handleImage(src: string, partRels: RelationshipItem[], ctx: ExportContext): string {
  if (src.startsWith("data:image/")) {
    const match = src.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (match) {
      const contentType = match[1];
      const base64Data = match[2];
      const ext = contentType.split("/")[1]?.split("+")[0] || "png";
      const filename = `media/image_${ctx.imgCounter.value++}.${ext}`;
      
      ctx.mediaFiles.push({ filename: `word/${filename}`, data: base64Data, base64: true });
      
      const rId = ctx.getNextRelId();
      partRels.push({
        id: rId,
        type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
        target: filename,
      });
      return rId;
    }
  } else if (src.trim()) {
    const rId = ctx.getNextRelId();
    partRels.push({
      id: rId,
      type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
      target: src,
      targetMode: "External",
    });
    return rId;
  }
  return "";
}

function parseHtmlToOOXML(html: string, options: { cw: number; partRels: RelationshipItem[] }, ctx: ExportContext): string {
  if (!html) return "<w:p/>";
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild || doc.body;
  
  let ooxml = "";
  let currentInlineNodes: Node[] = [];
  
  function flushInlineNodes() {
    if (currentInlineNodes.length === 0) return;
    ooxml += "<w:p>";
    currentInlineNodes.forEach((node) => {
      ooxml += walk(node, { partRels: options.partRels, forceInline: true });
    });
    ooxml += "</w:p>";
    currentInlineNodes = [];
  }
  
  function walk(node: Node, state: ParseState): string {
    let xml = "";
    
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.nodeValue || "";
      if (text.trim() === "" && !text.includes(" ")) {
        return "";
      }
      
      const buildRPr = (fontOverride?: string) => {
        let r = "";
        if (state.isHyperlink) {
          r += '<w:rStyle w:val="Hyperlink"/>';
        }
        const activeFont = fontOverride || state.fontFamily;
        if (activeFont) {
          r += `<w:rFonts w:ascii="${esc(activeFont)}" w:hAnsi="${esc(activeFont)}" w:cs="${esc(activeFont)}"/>`;
        }
        if (state.bold) r += "<w:b/>";
        if (state.italic) r += "<w:i/>";
        if (state.strike) r += "<w:strike/>";
        if (state.color) {
          const hex = parseColorToHex(state.color);
          if (hex) r += `<w:color w:val="${hex}"/>`;
        }
        if (state.fontSize) {
          const val = parseFontSize(state.fontSize);
          if (val) r += `<w:sz w:val="${val}"/>`;
        }
        if (state.underline) r += '<w:u w:val="single"/>';
        if (state.bg) {
          const hex = parseColorToHex(state.bg);
          if (hex) r += `<w:shd w:val="clear" w:color="auto" w:fill="${hex}"/>`;
        }
        return r;
      };

      if (/(🔖|[\uD800-\uDBFF][\uDC00-\uDFFF])/.test(text)) {
        const parts = text.split(/(🔖|[\uD800-\uDBFF][\uDC00-\uDFFF])/g);
        let out = "";
        parts.forEach((p) => {
          if (!p) return;
          if (/(🔖|[\uD800-\uDBFF][\uDC00-\uDFFF])/.test(p)) {
            const emojiRPr = buildRPr("Segoe UI Emoji");
            out += `<w:r>${emojiRPr ? `<w:rPr>${emojiRPr}</w:rPr>` : ""}<w:t>${p}</w:t></w:r>`;
          } else {
            const rPr = buildRPr();
            out += `<w:r>${rPr ? `<w:rPr>${rPr}</w:rPr>` : ""}<w:t xml:space="preserve">${esc(p)}</w:t></w:r>`;
          }
        });
        return out;
      }

      const escaped = esc(text);
      const rPr = buildRPr();
      xml += "<w:r>";
      if (rPr) xml += `<w:rPr>${rPr}</w:rPr>`;
      xml += `<w:t xml:space="preserve">${escaped}</w:t>`;
      xml += "</w:r>";
      return xml;
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      const styleAttr = el.getAttribute("style");
      const styles = parseStyleAttr(styleAttr);
      
      const newState: ParseState = {
        ...state,
        bold: el.tagName === "STRONG" || el.tagName === "B" || styles["font-weight"] === "bold" || state.bold,
        italic: el.tagName === "EM" || el.tagName === "I" || styles["font-style"] === "italic" || state.italic,
        underline: el.tagName === "U" || styles["text-decoration"]?.includes("underline") || state.underline,
        strike: el.tagName === "S" || el.tagName === "STRIKE" || el.tagName === "DEL" || styles["text-decoration"]?.includes("line-through") || state.strike,
        fontFamily: styles["font-family"] || state.fontFamily,
        fontSize: styles["font-size"] || state.fontSize,
        color: styles["color"] || state.color,
        bg: styles["background-color"] || (tag === "mark" ? "yellow" : null) || state.bg,
      };

      if (tag === "ins" || tag === "del") {
        const user = el.getAttribute("data-user") || "Unknown";
        const ts = el.getAttribute("data-ts");
        const dateStr = ts ? new Date(Number(ts)).toISOString() : new Date().toISOString();
        const id = Math.round(Math.random() * 100000);
        
        let innerXml = "";
        Array.from(el.childNodes).forEach((child) => {
          innerXml += walk(child, newState);
        });
        
        const bms = getElementBookmarks(el, ctx);
        let bmStarts = "";
        let bmEnds = "";
        bms.forEach((b) => {
          bmStarts += `<w:bookmarkStart w:id="${b.id}" w:name="${esc(b.name)}"/>`;
          bmEnds = `<w:bookmarkEnd w:id="${b.id}"/>` + bmEnds;
        });
        
        if (tag === "ins") {
          return `${bmStarts}<w:ins w:id="${id}" w:author="${esc(user)}" w:date="${dateStr}">${innerXml}</w:ins>${bmEnds}`;
        } else {
          const delTextXml = innerXml.replace(/<w:t/g, "<w:delText").replace(/<\/w:t>/g, "</w:delText>");
          return `${bmStarts}<w:del w:id="${id}" w:author="${esc(user)}" w:date="${dateStr}">${delTextXml}</w:del>${bmEnds}`;
        }
      }

      if (tag === "p" || tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4" || tag === "h5" || tag === "h6") {
        if (state.forceInline) {
          let innerXml = "";
          Array.from(el.childNodes).forEach((child) => {
            innerXml += walk(child, newState);
          });
          return innerXml + "<w:r><w:br/></w:r>";
        }

        let pPr = "";
        if (tag === "h1") pPr += '<w:pStyle w:val="Heading1"/>';
        else if (tag === "h2") pPr += '<w:pStyle w:val="Heading2"/>';
        else if (tag === "h3") pPr += '<w:pStyle w:val="Heading3"/>';
        else if (tag === "h4") pPr += '<w:pStyle w:val="Heading4"/>';

        const mt = styles["margin-top"];
        const mb = styles["margin-bottom"];
        const lh = styles["line-height"];
        let spAttrs = "";
        if (mt) spAttrs += ` w:before="${Math.round((parsePxVal(mt) ?? 0) * 15)}"`;
        if (mb) spAttrs += ` w:after="${Math.round((parsePxVal(mb) ?? 0) * 15)}"`;
        if (lh) {
          const lhVal = parseFloat(lh);
          if (!isNaN(lhVal)) {
            const lineTwips = lh.endsWith("px") || lh.endsWith("pt") 
              ? Math.round((parsePxVal(lh) ?? 16) * 15) 
              : Math.round(lhVal * 240);
            spAttrs += ` w:line="${lineTwips}" w:lineRule="auto"`;
          }
        }
        if (spAttrs) pPr += `<w:spacing${spAttrs}/>`;

        const marginLeft = styles["margin-left"] || styles["padding-left"];
        if (marginLeft) {
          const px = parsePxVal(marginLeft);
          if (px !== null) pPr += `<w:ind w:left="${Math.round(px * 15)}"/>`;
        }

        const align = styles["text-align"] || el.getAttribute("align");
        if (align) {
          const wAlign = align === "justify" ? "both" : align;
          pPr += `<w:jc w:val="${esc(wAlign)}"/>`;
        }
        
        const bms = getElementBookmarks(el, ctx);
        let bmStarts = "";
        let bmEnds = "";
        bms.forEach((b) => {
          bmStarts += `<w:bookmarkStart w:id="${b.id}" w:name="${esc(b.name)}"/>`;
          bmEnds = `<w:bookmarkEnd w:id="${b.id}"/>` + bmEnds;
        });

        xml += "<w:p>";
        if (pPr) xml += `<w:pPr>${pPr}</w:pPr>`;
        xml += bmStarts;
        
        Array.from(el.childNodes).forEach((child) => {
          xml += walk(child, newState);
        });
        
        xml += bmEnds;
        xml += "</w:p>";
        return xml;
      }

      if (tag === "div" || tag === "blockquote" || tag === "section" || tag === "article" || tag === "header" || tag === "footer") {
        if (state.forceInline) {
          let innerXml = "";
          Array.from(el.childNodes).forEach((child) => {
            innerXml += walk(child, newState);
          });
          return innerXml + "<w:r><w:br/></w:r>";
        }

        const hasBlockChildren = Array.from(el.childNodes).some((child) => isBlockElement(child));
        if (!hasBlockChildren) {
          let pPr = "";
          const mt = styles["margin-top"];
          const mb = styles["margin-bottom"];
          const lh = styles["line-height"];
          let spAttrs = "";
          if (mt) spAttrs += ` w:before="${Math.round((parsePxVal(mt) ?? 0) * 15)}"`;
          if (mb) spAttrs += ` w:after="${Math.round((parsePxVal(mb) ?? 0) * 15)}"`;
          if (lh) {
            const lhVal = parseFloat(lh);
            if (!isNaN(lhVal)) {
              const lineTwips = lh.endsWith("px") || lh.endsWith("pt") 
                ? Math.round((parsePxVal(lh) ?? 16) * 15) 
                : Math.round(lhVal * 240);
              spAttrs += ` w:line="${lineTwips}" w:lineRule="auto"`;
            }
          }
          if (spAttrs) pPr += `<w:spacing${spAttrs}/>`;

          const marginLeft = styles["margin-left"] || styles["padding-left"] || (tag === "blockquote" ? "36pt" : null);
          if (marginLeft) {
            const px = parsePxVal(marginLeft);
            if (px !== null) pPr += `<w:ind w:left="${Math.round(px * 15)}"/>`;
          }

          const align = styles["text-align"] || el.getAttribute("align");
          if (align) {
            const wAlign = align === "justify" ? "both" : align;
            pPr += `<w:jc w:val="${esc(wAlign)}"/>`;
          }

          const bms = getElementBookmarks(el, ctx);
          let bmStarts = "";
          let bmEnds = "";
          bms.forEach((b) => {
            bmStarts += `<w:bookmarkStart w:id="${b.id}" w:name="${esc(b.name)}"/>`;
            bmEnds = `<w:bookmarkEnd w:id="${b.id}"/>` + bmEnds;
          });

          let innerXml = "";
          Array.from(el.childNodes).forEach((child) => {
            innerXml += walk(child, newState);
          });

          return `<w:p>${pPr ? `<w:pPr>${pPr}</w:pPr>` : ""}${bmStarts}${innerXml}${bmEnds}</w:p>`;
        } else {
          let containerXml = "";
          let inlineBuffer: Node[] = [];
          const flushBuffer = () => {
            if (inlineBuffer.length === 0) return;
            let pInner = "";
            inlineBuffer.forEach((c) => { pInner += walk(c, { ...newState, forceInline: true }); });
            if (pInner.trim()) {
              containerXml += `<w:p>${pInner}</w:p>`;
            }
            inlineBuffer = [];
          };
          Array.from(el.childNodes).forEach((child) => {
            if (isBlockElement(child)) {
              flushBuffer();
              containerXml += walk(child, newState);
            } else {
              inlineBuffer.push(child);
            }
          });
          flushBuffer();
          return containerXml;
        }
      }

      if (tag === "hr") {
        return '<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="CCCCCC"/></w:pBdr></w:pPr></w:p>';
      }
      
      if (tag === "ul" || tag === "ol") {
        if (state.forceInline) {
          let innerXml = "";
          Array.from(el.childNodes).forEach((child) => {
            innerXml += walk(child, newState);
          });
          return innerXml;
        }

        const listState: ParseState = {
          ...newState,
          listType: tag as "ul" | "ol",
          listIndex: 0,
        };
        Array.from(el.childNodes).forEach((child) => {
          xml += walk(child, listState);
        });
        return xml;
      }
      
      if (tag === "li") {
        if (state.listType === "ol") {
          state.listIndex = (state.listIndex ?? 0) + 1;
        }
        
        const prefix = state.listType === "ol" ? `${state.listIndex}. ` : "• ";
        
        if (state.forceInline) {
          let innerXml = "";
          innerXml += `<w:r><w:t xml:space="preserve">${prefix}</w:t></w:r>`;
          Array.from(el.childNodes).forEach((child) => {
            innerXml += walk(child, newState);
          });
          return innerXml + "<w:r><w:br/></w:r>";
        }
        
        const pPr = '<w:ind w:left="720" w:hanging="360"/>';
        const bms = getElementBookmarks(el, ctx);
        let bmStarts = "";
        let bmEnds = "";
        bms.forEach((b) => {
          bmStarts += `<w:bookmarkStart w:id="${b.id}" w:name="${esc(b.name)}"/>`;
          bmEnds = `<w:bookmarkEnd w:id="${b.id}"/>` + bmEnds;
        });
        
        xml += "<w:p>";
        xml += `<w:pPr>${pPr}</w:pPr>`;
        xml += bmStarts;
        
        xml += "<w:r>";
        if (newState.bold) xml += "<w:b/>";
        if (newState.italic) xml += "<w:i/>";
        xml += `<w:t xml:space="preserve">${prefix}</w:t>`;
        xml += "</w:r>";
        
        Array.from(el.childNodes).forEach((child) => {
          xml += walk(child, newState);
        });
        
        xml += bmEnds;
        xml += "</w:p>";
        return xml;
      }
      
      if (tag === "table") {
        if (state.forceInline) {
          let innerXml = "";
          Array.from(el.childNodes).forEach((child) => {
            innerXml += walk(child, newState);
          });
          return innerXml;
        }

        xml += parseTableToOpenXML(el as HTMLTableElement, newState, options.cw, ctx);
        return xml;
      }
      
      if (tag === "img") {
        const src = el.getAttribute("src") || "";
        const styleW = styles["width"] || el.getAttribute("width");
        const styleH = styles["height"] || el.getAttribute("height");
        const wPx = parsePxVal(styleW) ?? 300;
        const hPx = parsePxVal(styleH) ?? 200;
        
        const bms = getElementBookmarks(el, ctx);
        let bStarts = "";
        let bEnds = "";
        bms.forEach((b) => {
          bStarts += `<w:bookmarkStart w:id="${b.id}" w:name="${esc(b.name)}"/>`;
          bEnds = `<w:bookmarkEnd w:id="${b.id}"/>` + bEnds;
        });

        const rId = handleImage(src, options.partRels, ctx);
        if (rId) {
          const cx = Math.round(wPx * 9525);
          const cy = Math.round(hPx * 9525);
          const drawXml = `<w:drawing>
            <wp:inline distT="0" distB="0" distL="0" distR="0">
              <wp:extent cx="${cx}" cy="${cy}"/>
              <wp:effectExtent l="0" t="0" r="0" b="0"/>
              <wp:docPr id="${Math.round(Math.random() * 100000)}" name="Picture"/>
              <wp:cNvGraphicFramePr>
                <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>
              </wp:cNvGraphicFramePr>
              <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                    <pic:nvPicPr>
                      <pic:cNvPr id="0" name="Picture"/>
                      <pic:cNvPicPr/>
                    </pic:nvPicPr>
                    <pic:blipFill>
                      <a:blip r:embed="${rId}"/>
                      <a:stretch>
                        <a:fillRect/>
                      </a:stretch>
                    </pic:blipFill>
                    <pic:spPr>
                      <a:xfrm>
                        <a:off x="0" y="0"/>
                        <a:ext cx="${cx}" cy="${cy}"/>
                      </a:xfrm>
                      <a:prstGeom prst="rect">
                        <a:avLst/>
                      </a:prstGeom>
                    </pic:spPr>
                  </pic:pic>
                </a:graphicData>
              </a:graphic>
            </wp:inline>
          </w:drawing>`;
          
          xml += `${bStarts}<w:r>${drawXml}</w:r>${bEnds}`;
        }
        return xml;
      }
      
      const fieldType = el.getAttribute("data-field") || el.getAttribute("data-field-type") || (el.className?.includes("editor-field") || el.className?.includes("hf-field") ? el.getAttribute("data-field") : null);
      if (fieldType) {
        if (fieldType === "page-number") {
          xml += '<w:fldSimple w:instr="PAGE"/>';
        } else if (fieldType === "total-pages") {
          xml += '<w:fldSimple w:instr="NUMPAGES"/>';
        } else if (fieldType === "page-x") {
          xml += '<w:r><w:t xml:space="preserve">Page </w:t></w:r><w:fldSimple w:instr="PAGE"/>';
        } else if (fieldType === "page-x-of-y" || fieldType === "x-of-y") {
          const prefix = fieldType === "page-x-of-y" ? '<w:r><w:t xml:space="preserve">Page </w:t></w:r>' : '';
          xml += `${prefix}<w:fldSimple w:instr="PAGE"/><w:r><w:t xml:space="preserve"> of </w:t></w:r><w:fldSimple w:instr="NUMPAGES"/>`;
        } else if (fieldType === "date") {
          xml += '<w:fldSimple w:instr="DATE"/>';
        } else if (fieldType === "time") {
          xml += '<w:fldSimple w:instr="TIME"/>';
        } else if (fieldType === "title") {
          xml += '<w:fldSimple w:instr="TITLE"/>';
        } else if (fieldType === "author") {
          xml += '<w:fldSimple w:instr="AUTHOR"/>';
        } else if (fieldType === "filename") {
          xml += '<w:fldSimple w:instr="FILENAME"/>';
        } else if (fieldType === "company") {
          xml += '<w:fldSimple w:instr="DOCPROPERTY Company"/>';
        }
        return xml;
      }

      if (tag === "a") {
        const href = (el.getAttribute("href") || "").trim();
        const dataTargetId = (el.getAttribute("data-target-id") || "").trim();
        const dataCrossRef = el.getAttribute("data-cross-ref");
        const title = el.getAttribute("title") || el.getAttribute("data-tooltip") || "";

        const isBookmark =
          el.hasAttribute("data-bookmark") ||
          el.hasAttribute("data-bookmark-id") ||
          el.classList.contains("bookmark-anchor") ||
          Boolean(el.id && (el.id.startsWith("bookmark_") || el.id.startsWith("bm_")));

        const isInternal =
          Boolean(dataTargetId) ||
          Boolean(dataCrossRef) ||
          href.startsWith("#");

        const isEmail =
          href.startsWith("mailto:") ||
          (!isInternal && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(href));

        const isExternal =
          !isInternal &&
          !isEmail &&
          href !== "" &&
          href !== "#" &&
          !href.startsWith("javascript:");

        const isLink = isExternal || isEmail || isInternal;

        const linkState: ParseState = isLink
          ? {
              ...newState,
              isHyperlink: true,
              forceInline: true,
              color: styles["color"] || state.color || "0563C1",
              underline: styles["text-decoration"]
                ? styles["text-decoration"].includes("underline")
                : (state.underline ?? true),
            }
          : { ...newState, forceInline: true };

        let innerXml = "";
        Array.from(el.childNodes).forEach((child) => {
          innerXml += walk(child, linkState);
        });

        // Ensure bookmark has visible bookmark symbol 🔖 in MS Word
        const hasBookmarkSymbol = el.textContent?.includes("🔖");
        let bookmarkSymbolXml = "";
        if (isBookmark && !hasBookmarkSymbol) {
          const fontSizeVal = linkState.fontSize ? parseFontSize(linkState.fontSize) : null;
          const szAttr = fontSizeVal ? `<w:sz w:val="${fontSizeVal}"/>` : "";
          bookmarkSymbolXml = `<w:r><w:rPr><w:rFonts w:ascii="Segoe UI Emoji" w:hAnsi="Segoe UI Emoji" w:cs="Segoe UI Emoji"/>${szAttr}</w:rPr><w:t xml:space="preserve">🔖 </w:t></w:r>`;
        }

        if (!innerXml.trim() && isLink) {
          const displayText = el.innerText?.trim() || el.textContent?.trim() || href || dataTargetId;
          if (displayText) {
            const escaped = esc(displayText);
            let rPr = '<w:rStyle w:val="Hyperlink"/>';
            if (linkState.fontFamily) rPr += `<w:rFonts w:ascii="${esc(linkState.fontFamily)}" w:hAnsi="${esc(linkState.fontFamily)}"/>`;
            if (linkState.bold) rPr += "<w:b/>";
            if (linkState.italic) rPr += "<w:i/>";
            rPr += '<w:color w:val="0563C1"/><w:u w:val="single"/>';
            innerXml = `<w:r><w:rPr>${rPr}</w:rPr><w:t xml:space="preserve">${escaped}</w:t></w:r>`;
          }
        } else if (!innerXml.trim() && isBookmark) {
          const bmText = el.getAttribute("data-bookmark") || el.title || "Bookmark";
          innerXml = `<w:r><w:t xml:space="preserve">${esc(bmText)}</w:t></w:r>`;
        }

        const bms = getElementBookmarks(el, ctx);
        let bStarts = "";
        let bEnds = "";
        bms.forEach((b) => {
          bStarts += `<w:bookmarkStart w:id="${b.id}" w:name="${esc(b.name)}"/>`;
          bEnds = `<w:bookmarkEnd w:id="${b.id}"/>` + bEnds;
        });

        const tooltipAttr = title ? ` w:tooltip="${esc(title)}"` : "";

        if (isExternal || isEmail) {
          let targetUrl = href;
          if (isEmail) {
            targetUrl = targetUrl.startsWith("mailto:") ? targetUrl : `mailto:${targetUrl}`;
          } else if (targetUrl.startsWith("//")) {
            targetUrl = `https:${targetUrl}`;
          } else if (/^www\./i.test(targetUrl)) {
            targetUrl = `https://${targetUrl}`;
          }

          const rId = ctx.getNextRelId();
          options.partRels.push({
            id: rId,
            type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
            target: targetUrl,
            targetMode: "External",
          });

          return `${bStarts}${bookmarkSymbolXml}<w:hyperlink r:id="${rId}" w:history="1"${tooltipAttr}>${innerXml}</w:hyperlink>${bEnds}`;
        }

        if (isInternal) {
          const rawTarget = dataTargetId || (href.includes("#") ? href.split("#")[1] : "");
          const anchorName =
            ctx.targetMap?.get(rawTarget) ||
            ctx.targetMap?.get(rawTarget.toLowerCase()) ||
            sanitizeBookmarkName(rawTarget);

          return `${bStarts}${bookmarkSymbolXml}<w:hyperlink w:anchor="${esc(anchorName)}" w:history="1"${tooltipAttr}>${innerXml}</w:hyperlink>${bEnds}`;
        }

        return `${bStarts}${bookmarkSymbolXml}${innerXml}${bEnds}`;
      }

      const bms = getElementBookmarks(el, ctx);
      let innerXml = "";
      
      Array.from(el.childNodes).forEach((child) => {
        innerXml += walk(child, newState);
      });
      
      if (tag === "br") {
        innerXml += "<w:r><w:br/></w:r>";
      }
      
      if (bms.length > 0) {
        let bmStarts = "";
        let bmEnds = "";
        bms.forEach((b) => {
          bmStarts += `<w:bookmarkStart w:id="${b.id}" w:name="${esc(b.name)}"/>`;
          bmEnds = `<w:bookmarkEnd w:id="${b.id}"/>` + bmEnds;
        });
        return `${bmStarts}${innerXml}${bmEnds}`;
      }
      
      return innerXml;
    }
    
    return xml;
  }
  
  Array.from(root.childNodes).forEach((node) => {
    if (isBlockElement(node)) {
      flushInlineNodes();
      ooxml += walk(node, { partRels: options.partRels });
    } else {
      currentInlineNodes.push(node);
    }
  });
  flushInlineNodes();
  
  if (!ooxml.trim() || !ooxml.includes("<w:p")) {
    ooxml = "<w:p/>" + ooxml;
  }
  
  return ooxml;
}

function parseTableToOpenXML(tableEl: HTMLTableElement, state: ParseState, parentWidthPx: number, ctx: ExportContext): string {
  const rows = Array.from(tableEl.rows);
  if (rows.length === 0) return "";
  
  const tableBms = getElementBookmarks(tableEl, ctx);
  let tblBmStarts = "";
  let tblBmEnds = "";
  tableBms.forEach((b) => {
    tblBmStarts += `<w:bookmarkStart w:id="${b.id}" w:name="${esc(b.name)}"/>`;
    tblBmEnds = `<w:bookmarkEnd w:id="${b.id}"/>` + tblBmEnds;
  });
  
  const styleAttr = tableEl.getAttribute("style");
  const styles = parseStyleAttr(styleAttr);
  const st = styleAttr || "";
  const isCenter = /margin(-left)?\s*:\s*auto/i.test(st) && /margin(-right)?\s*:\s*auto/i.test(st);
  const isRight = /margin-left\s*:\s*auto/i.test(st) && !/margin-right\s*:\s*auto/i.test(st);
  const align = isCenter ? "center" : isRight ? "right" : "left";
  
  const tblExplicitW = parsePxVal(styles["width"]) ?? parsePxVal(tableEl.getAttribute("width"));
  const targetWidthPx = Math.min(tblExplicitW && tblExplicitW > 10 ? tblExplicitW : parentWidthPx, parentWidthPx);
  const tblWTwips = Math.round(targetWidthPx * 15);
  
  const R = rows.length;
  let maxCols = 0;
  
  const grid: GridCell[][] = Array.from({ length: R }, () => []);
  
  for (let r = 0; r < R; r++) {
    let c = 0;
    const tr = rows[r];
    const cells = Array.from(tr.cells);
    
    for (let cellIdx = 0; cellIdx < cells.length; cellIdx++) {
      const td = cells[cellIdx];
      const colSpan = td.colSpan || 1;
      const rowSpan = td.rowSpan || 1;
      
      while (grid[r][c] !== undefined) {
        c++;
      }
      
      const wStr = td.style.width || td.getAttribute("width") || "";
      const widthPx = parsePxVal(wStr) ?? (targetWidthPx / colSpan);
      
      const cellData: GridCell = {
        element: td,
        isRowSpanStart: rowSpan > 1,
        colSpan,
        rowSpan,
        widthPx,
      };
      
      for (let i = 0; i < rowSpan; i++) {
        for (let j = 0; j < colSpan; j++) {
          if (r + i < R) {
            if (i === 0 && j === 0) {
              grid[r + i][c + j] = cellData;
            } else {
              grid[r + i][c + j] = {
                isMerged: true,
                isVMergeContinue: i > 0,
                isHMergeContinue: j > 0,
                colSpan,
                rowSpan,
                widthPx: widthPx / colSpan,
              };
            }
          }
        }
      }
      c += colSpan;
    }
    if (c > maxCols) maxCols = c;
  }
  
  const colWidthsPx: number[] = Array.from({ length: maxCols }, () => 0);
  for (let c = 0; c < maxCols; c++) {
    let foundWidth = 0;
    for (let r = 0; r < R; r++) {
      const cell = grid[r][c];
      if (cell && !cell.isMerged && cell.colSpan === 1) {
        foundWidth = cell.widthPx;
        break;
      }
    }
    if (foundWidth === 0) {
      for (let r = 0; r < R; r++) {
        const cell = grid[r][c];
        if (cell && !cell.isMerged) {
          foundWidth = cell.widthPx / cell.colSpan;
          break;
        }
      }
    }
    colWidthsPx[c] = foundWidth || (targetWidthPx / maxCols);
  }
  
  const sum = colWidthsPx.reduce((a, b) => a + b, 0);
  if (sum > 0) {
    const ratio = targetWidthPx / sum;
    for (let i = 0; i < maxCols; i++) {
      colWidthsPx[i] *= ratio;
    }
  }
  
  let tblGrid = "<w:tblGrid>";
  colWidthsPx.forEach((w) => {
    tblGrid += `<w:gridCol w:w="${Math.round(w * 15)}"/>`;
  });
  tblGrid += "</w:tblGrid>";
  
  let tblPr = "";
  tblPr += `<w:tblW w:w="${tblWTwips}" w:type="dxa"/>`;
  tblPr += `<w:jc w:val="${align}"/>`;
  tblPr += '<w:tblLayout w:type="fixed"/>';
  
  const tblBorders = `<w:tblBorders>
    <w:top w:val="single" w:sz="6" w:space="0" w:color="000000"/>
    <w:left w:val="single" w:sz="6" w:space="0" w:color="000000"/>
    <w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
    <w:right w:val="single" w:sz="6" w:space="0" w:color="000000"/>
    <w:insideH w:val="single" w:sz="6" w:space="0" w:color="000000"/>
    <w:insideV w:val="single" w:sz="6" w:space="0" w:color="000000"/>
  </w:tblBorders>`;
  tblPr += tblBorders;
  
  const hexBg = parseColorToHex(styles["background-color"]);
  if (hexBg) {
    tblPr += `<w:shd w:val="clear" w:color="auto" w:fill="${hexBg}"/>`;
  }
  
  let rowsXml = "";
  for (let r = 0; r < R; r++) {
    const tr = rows[r];
    const trStyles = parseStyleAttr(tr.getAttribute("style"));
    
    const trHPx = parsePxVal(trStyles["height"]) ?? parsePxVal(tr.getAttribute("height"));
    let trPr = "";
    if (trHPx) {
      trPr += `<w:trHeight w:val="${Math.round(trHPx * 15)}" w:hRule="atLeast"/>`;
    }
    
    let cellsXml = "";
    for (let c = 0; c < maxCols; c++) {
      const cell = grid[r][c];
      if (!cell) {
        cellsXml += `<w:tc><w:tcPr><w:tcW w:w="${Math.round(colWidthsPx[c] * 15)}" w:type="dxa"/></w:tcPr><w:p/></w:tc>`;
        continue;
      }
      
      if (cell.isMerged) {
        if (cell.isVMergeContinue) {
          if (!cell.isHMergeContinue) {
            let tcPr = "";
            tcPr += `<w:tcW w:w="${Math.round(cell.widthPx * cell.colSpan * 15)}" w:type="dxa"/>`;
            if (cell.colSpan > 1) {
              tcPr += `<w:gridSpan w:val="${cell.colSpan}"/>`;
            }
            tcPr += '<w:vMerge w:val="continue"/>';
            cellsXml += `<w:tc><w:tcPr>${tcPr}</w:tcPr><w:p/></w:tc>`;
          }
        }
        continue;
      }
      
      const td = cell.element!;
      const tdStyles = parseStyleAttr(td.getAttribute("style"));
      
      let tcPr = "";
      const cellWTwips = Math.round(cell.widthPx * cell.colSpan * 15);
      tcPr += `<w:tcW w:w="${cellWTwips}" w:type="dxa"/>`;
      
      if (cell.colSpan > 1) {
        tcPr += `<w:gridSpan w:val="${cell.colSpan}"/>`;
      }
      if (cell.rowSpan > 1) {
        tcPr += '<w:vMerge w:val="restart"/>';
      }
      
      const cellBg = parseColorToHex(tdStyles["background-color"]) || parseColorToHex(td.getAttribute("bgcolor"));
      if (cellBg) {
        tcPr += `<w:shd w:val="clear" w:color="auto" w:fill="${cellBg}"/>`;
      }
      
      let tcBorders = "";
      const borderTop = parseBorder(tdStyles["border-top"] || tdStyles["border"]);
      const borderBottom = parseBorder(tdStyles["border-bottom"] || tdStyles["border"]);
      const borderLeft = parseBorder(tdStyles["border-left"] || tdStyles["border"]);
      const borderRight = parseBorder(tdStyles["border-right"] || tdStyles["border"]);
      
      if (borderTop) tcBorders += `<w:top w:val="${borderTop.val}" w:sz="${borderTop.sz}" w:space="0" w:color="${borderTop.color}"/>`;
      if (borderBottom) tcBorders += `<w:bottom w:val="${borderBottom.val}" w:sz="${borderBottom.sz}" w:space="0" w:color="${borderBottom.color}"/>`;
      if (borderLeft) tcBorders += `<w:left w:val="${borderLeft.val}" w:sz="${borderLeft.sz}" w:space="0" w:color="${borderLeft.color}"/>`;
      if (borderRight) tcBorders += `<w:right w:val="${borderRight.val}" w:sz="${borderRight.sz}" w:space="0" w:color="${borderRight.color}"/>`;
      
      if (tcBorders) {
        tcPr += `<w:tcBorders>${tcBorders}</w:tcBorders>`;
      }
      
      const vAlign = tdStyles["vertical-align"] || td.getAttribute("valign");
      if (vAlign) {
        const wVAlign = vAlign === "middle" ? "center" : vAlign;
        if (["top", "center", "bottom"].includes(wVAlign)) {
          tcPr += `<w:vAlign w:val="${wVAlign}"/>`;
        }
      }
      
      const padTop = tdStyles["padding-top"] || tdStyles["padding"];
      const padBottom = tdStyles["padding-bottom"] || tdStyles["padding"];
      const padLeft = tdStyles["padding-left"] || tdStyles["padding"];
      const padRight = tdStyles["padding-right"] || tdStyles["padding"];
      let tcMar = "";
      if (padTop) tcMar += `<w:top w:w="${Math.round((parsePxVal(padTop) ?? 4) * 15)}" w:type="dxa"/>`;
      if (padBottom) tcMar += `<w:bottom w:w="${Math.round((parsePxVal(padBottom) ?? 4) * 15)}" w:type="dxa"/>`;
      if (padLeft) tcMar += `<w:left w:w="${Math.round((parsePxVal(padLeft) ?? 6) * 15)}" w:type="dxa"/>`;
      if (padRight) tcMar += `<w:right w:w="${Math.round((parsePxVal(padRight) ?? 6) * 15)}" w:type="dxa"/>`;
      if (tcMar) {
        tcPr += `<w:tcMar>${tcMar}</w:tcMar>`;
      }
      
      const cellContentWidth = cell.widthPx * cell.colSpan;
      const cellHtml = td.innerHTML;
      let cellOOXML = parseHtmlToOOXML(cellHtml, { cw: cellContentWidth, partRels: state.partRels }, ctx);
      if (!cellOOXML.trim() || !cellOOXML.endsWith("</w:p>")) {
        cellOOXML += "<w:p/>";
      }
      if (r === 0 && c === 0 && tblBmStarts) {
        cellOOXML = cellOOXML.replace("<w:p>", `<w:p>${tblBmStarts}`).replace("</w:p>", `${tblBmEnds}</w:p>`);
      }
      
      cellsXml += `<w:tc><w:tcPr>${tcPr}</w:tcPr>${cellOOXML}</w:tc>`;
    }
    
    rowsXml += `<w:tr>`;
    if (trPr) rowsXml += `<w:trPr>${trPr}</w:trPr>`;
    rowsXml += cellsXml;
    rowsXml += `</w:tr>`;
  }
  
  return `<w:tbl><w:tblPr>${tblPr}</w:tblPr>${tblGrid}${rowsXml}</w:tbl>`;
}

function cleanHtmlChanges(html: string, accept: boolean): string {
  if (!html || typeof document === "undefined") return html || "";
  const temp = document.createElement("div");
  temp.innerHTML = html;
  
  temp.querySelectorAll("ins, del, [data-tc]").forEach((node) => {
    const el = node as HTMLElement;
    const tc = el.getAttribute("data-tc") || el.tagName.toLowerCase();
    if (tc === "ins") {
      if (accept) {
        const parent = el.parentNode;
        if (parent) {
          while (el.firstChild) parent.insertBefore(el.firstChild, el);
          parent.removeChild(el);
        }
      } else {
        el.remove();
      }
    } else if (tc === "del") {
      if (accept) {
        el.remove();
      } else {
        const parent = el.parentNode;
        if (parent) {
          while (el.firstChild) parent.insertBefore(el.firstChild, el);
          parent.removeChild(el);
        }
      }
    } else if (tc === "format") {
      if (accept) {
        if (el.tagName === "SPAN" && el.childNodes.length > 0) {
          const parent = el.parentNode;
          if (parent) {
            while (el.firstChild) parent.insertBefore(el.firstChild, el);
            parent.removeChild(el);
          }
        } else {
          el.removeAttribute("data-tc");
          el.removeAttribute("data-change-type");
          el.removeAttribute("data-old");
          el.removeAttribute("data-new");
          el.removeAttribute("data-user");
          el.removeAttribute("data-ts");
          el.removeAttribute("data-date");
        }
      } else {
        const type = el.getAttribute("data-change-type");
        const oldVal = el.getAttribute("data-old");
        if (type && oldVal !== null) {
          if (type === "bold") el.style.fontWeight = oldVal;
          else if (type === "italic") el.style.fontStyle = oldVal;
          else if (type === "underline") el.style.textDecoration = oldVal;
          else if (type === "font") el.style.fontFamily = oldVal;
          else if (type === "size") el.style.fontSize = oldVal;
          else if (type === "color") el.style.color = oldVal;
          else if (type === "align") el.style.textAlign = oldVal;
          else if (type === "line-spacing") el.style.lineHeight = oldVal;
          else if (type === "indent") el.style.paddingLeft = oldVal;
        }
        if (el.tagName === "SPAN") {
          const parent = el.parentNode;
          if (parent) {
            while (el.firstChild) parent.insertBefore(el.firstChild, el);
            parent.removeChild(el);
          }
        } else {
          el.removeAttribute("data-tc");
          el.removeAttribute("data-change-type");
          el.removeAttribute("data-old");
          el.removeAttribute("data-new");
          el.removeAttribute("data-user");
          el.removeAttribute("data-ts");
          el.removeAttribute("data-date");
        }
      }
    }
  });
  
  return temp.innerHTML;
}

function buildPgBordersXml(sec: SectionModel): string {
  const pb = sec.pageBorders;
  if (!pb || pb.setting === "none" || pb.style === "none") return "";

  const type =
    pb.setting ||
    (pb.style === "box"
      ? "box"
      : pb.style === "shadow"
      ? "shadow"
      : pb.style === "3d"
      ? "3d"
      : "custom");

  let display = "allPages";
  if (pb.applyTo === "firstPage") display = "firstPage";
  else if (pb.applyTo === "exceptFirstPage") display = "notFirstPage";

  let xml = `<w:pgBorders w:display="${display}" w:offsetFrom="page" w:zOrder="back">`;

  const lineStyle =
    pb.lineStyle ||
    (pb.style === "dashed"
      ? "dashed"
      : pb.style === "dotted"
      ? "dotted"
      : pb.style === "double"
      ? "double"
      : "solid");

  const sideBorder = {
    style: lineStyle,
    color: pb.color || "#000000",
    width: pb.width || 1,
    art: pb.art,
  };

  const renderSideXml = (
    sideTag: string,
    enabled?: boolean
  ) => {
    if (!enabled || (!sideBorder.width && !sideBorder.art)) {
      return "";
    }

    if (sideBorder.art && sideBorder.art !== "none") {
      let artVal: string;
      let sz: string;
      let color: string;
      if (sideBorder.art === "double-red") {
        artVal = "double";
        sz = "24";
        color = "EF4444";
      } else if (sideBorder.art === "stars") {
        artVal = "stars";
        sz = "24";
        color = "EAB308";
      } else {
        artVal = "dashed";
        sz = "16";
        color = parseColorToHex(sideBorder.color) || "000000";
      }
      return `<w:${sideTag} w:val="${artVal}" w:sz="${sz}" w:space="24" w:color="${color}"/>`;
    }

    let val = "single";
    const s = sideBorder.style.trim();
    if (s === "solid") val = "single";
    else if (s === "double") val = "double";
    else if (s === "dashed") val = "dashed";
    else if (s === "dotted") val = "dotted";
    else if (s === "dashDot" || s === "dash-dot") val = "dashDot";
    else if (s === "dashDotDot" || s === "dash-dot-dot") val = "dashDotDot";
    else if (s === "triple") val = "triple";
    else if (s === "thickThin" || s === "thick-thin") val = "thickThin";
    else if (s === "thinThick" || s === "thin-thick") val = "thinThick";
    else if (s === "wave") val = "wave";
    else if (s === "doubleWave" || s === "double-wave") val = "doubleWave";
    else if (s === "groove") val = "threeDBackground";
    else if (s === "ridge") val = "threeDEngrave";
    else if (s === "inset") val = "inset";
    else if (s === "outset") val = "outset";

    const ptWidth = sideBorder.width || 1.5;
    const szVal = Math.round(ptWidth * 8);
    const sz = String(Math.max(2, Math.min(96, szVal)));
    const colorHex = parseColorToHex(sideBorder.color) || "000000";
    const isShadow = type === "shadow" ? ' w:shadow="true"' : "";

    return `<w:${sideTag} w:val="${val}" w:sz="${sz}" w:space="24" w:color="${colorHex}"${isShadow}/>`;
  };

  xml += renderSideXml("top", pb.top);
  xml += renderSideXml("left", pb.left);
  xml += renderSideXml("bottom", pb.bottom);
  xml += renderSideXml("right", pb.right);

  xml += "</w:pgBorders>";
  return xml;
}

// ── Main Export Function ──────────────────────────────────────────────────────
export async function generateWordDocx(
  model: DocumentModel,
  options: {
    tableAutoFitMode?: "fixed" | "contents" | "window";
    exportMarkupMode?: "markup" | "final" | "original";
  } = {},
): Promise<Blob> {
  if (typeof window === "undefined") {
    return new Blob([], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  }

  const zip = new JSZip();
  const cleanMode = options.exportMarkupMode ?? "markup";
  const preprocessHtml = (html: string): string => {
    if (cleanMode === "final") {
      return cleanHtmlChanges(html, true);
    }
    if (cleanMode === "original") {
      return cleanHtmlChanges(html, false);
    }
    return html;
  };
  
  const ctxMediaFiles: { filename: string; data: string; base64: boolean }[] = [];
  const imageCounterRef = { value: 1 };
  const bookmarkCounterRef = { value: 0 };
  const usedBookmarkNames = new Set<string>();
  const targetMap = new Map<string, string>();
  
  let relIdCounter = 10;
  const getNextRelId = () => `rId${relIdCounter++}`;

  const registerTarget = (raw: string | null | undefined) => {
    if (!raw) return;
    const trimmed = raw.trim();
    if (!trimmed || targetMap.has(trimmed)) return;
    const s = sanitizeBookmarkName(trimmed);
    targetMap.set(trimmed, s);
    targetMap.set(trimmed.toLowerCase(), s);
  };

  model.pages.forEach((page) => {
    const rawHtml = model.pageHtml[page.id];
    if (!rawHtml) return;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${rawHtml}</div>`, "text/html");
      doc.querySelectorAll("[id], [data-bookmark], [data-bookmark-id], [name]").forEach((el) => {
        const bm = el.getAttribute("data-bookmark");
        if (bm && bm.trim()) {
          const s = sanitizeBookmarkName(bm.trim());
          registerTarget(bm);
          const id = el.getAttribute("id");
          if (id) {
            targetMap.set(id.trim(), s);
            targetMap.set(id.trim().toLowerCase(), s);
          }
          const bmId = el.getAttribute("data-bookmark-id");
          if (bmId) {
            targetMap.set(bmId.trim(), s);
            targetMap.set(bmId.trim().toLowerCase(), s);
          }
        } else {
          registerTarget(el.getAttribute("id"));
          registerTarget(el.getAttribute("data-bookmark-id"));
          registerTarget(el.getAttribute("name"));
        }
      });
    } catch {
      // Ignore pre-scan errors
    }
  });
  
  const ctx: ExportContext = {
    mediaFiles: ctxMediaFiles,
    getNextRelId,
    imgCounter: imageCounterRef,
    bookmarkCounter: bookmarkCounterRef,
    usedBookmarkNames,
    targetMap,
  };

  const docRels: RelationshipItem[] = [
    { id: "rIdStyles", type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles", target: "styles.xml" },
    { id: "rIdSettings", type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings", target: "settings.xml" },
  ];

  const firstSecId = model.sections[0]?.id || "s1";
  const knownSectionIds = new Set(model.sections.map((s) => s.id));

  const sectionPagesMap: Record<string, typeof model.pages> = {};
  model.pages.forEach((page) => {
    const secId = knownSectionIds.has(page.sectionId) ? page.sectionId : firstSecId;
    if (!sectionPagesMap[secId]) sectionPagesMap[secId] = [];
    sectionPagesMap[secId].push(page);
  });

  const sectionHFRels = model.sections.map((sec) => {
    const src = getSourceSection(model, sec);
    const cw = sectionContentWidthPx(sec);
    
    const normalH = preprocessHtml(src.headerHtml || src.header || "");
    const normalF = preprocessHtml(src.footerHtml || src.footer || "");
    const firstH = sec.differentFirstPage ? preprocessHtml(src.firstHeaderHtml || src.firstHeader || "") : "";
    const firstF = sec.differentFirstPage ? preprocessHtml(src.firstFooterHtml || src.firstFooter || "") : "";
    const evenH = sec.differentOddEven ? preprocessHtml(src.evenHeaderHtml || src.evenHeader || "") : "";
    const evenF = sec.differentOddEven ? preprocessHtml(src.evenFooterHtml || src.evenFooter || "") : "";
    
    const result: Record<string, string> = {};
    
    const writeHFPart = (html: string, name: string, type: string) => {
      if (html.trim()) {
        const rId = getNextRelId();
        const filename = `${name}_${sec.id}.xml`;
        docRels.push({
          id: rId,
          type: `http://schemas.openxmlformats.org/officeDocument/2006/relationships/${type}`,
          target: filename,
        });
        
        const partRels: RelationshipItem[] = [];
        const contentXml = parseHtmlToOOXML(html, { cw, partRels }, ctx);
        
        const wrapperTag = type === "header" ? "w:hdr" : "w:ftr";
        const partXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<${wrapperTag} xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
               xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
               xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
               xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
               xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  ${contentXml}
</${wrapperTag}>`;
        
        zip.file(`word/${filename}`, partXml);
        
        if (partRels.length > 0) {
          let relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`;
          partRels.forEach((r) => {
            const tm = r.targetMode ? ` TargetMode="${r.targetMode}"` : "";
            relsXml += `\n  <Relationship Id="${r.id}" Type="${r.type}" Target="${esc(r.target)}"${tm}/>`;
          });
          relsXml += "\n</Relationships>";
          zip.file(`word/_rels/${filename}.rels`, relsXml);
        }
        
        return rId;
      }
      return "";
    };
    
    const nHId = writeHFPart(normalH, "header", "header");
    if (nHId) result.normalHeader = nHId;
    
    const nFId = writeHFPart(normalF, "footer", "footer");
    if (nFId) result.normalFooter = nFId;
    
    if (sec.differentFirstPage) {
      const fHId = writeHFPart(firstH, "first_header", "header");
      if (fHId) result.firstHeader = fHId;
      
      const fFId = writeHFPart(firstF, "first_footer", "footer");
      if (fFId) result.firstFooter = fFId;
    }
    
    if (sec.differentOddEven) {
      const eHId = writeHFPart(evenH, "even_header", "header");
      if (eHId) result.evenHeader = eHId;
      
      const eFId = writeHFPart(evenF, "even_footer", "footer");
      if (eFId) result.evenFooter = eFId;
    }
    
    return { sectionId: sec.id, rels: result };
  });

  let bodyXml = "";
  model.sections.forEach((sec, idx) => {
    const isL = sec.orientation === "landscape";
    const paper = sec.paperSizeConfig ?? sec.paperSize;
    const baseW = paper?.width ?? 794;
    const baseH = paper?.height ?? 1123;
    const paperW = isL ? baseH : baseW;
    const paperH = isL ? baseW : baseH;
    const mg = sec.marginConfig ?? { top: 96, bottom: 96, left: 96, right: 96 };
    const hDist = sec.headerTopDistance ?? 48;
    const fDist = sec.footerBottomDistance ?? 48;
    const cw = sectionContentWidthPx(sec);
    
    const pages = sectionPagesMap[sec.id] ?? [];
    if (!pages.length) return;
    
    let sectionBodyXml = "";
    pages.forEach((page, pi) => {
      const ph = preprocessHtml(model.pageHtml[page.id] ?? "");
      const pageXml = parseHtmlToOOXML(ph, { cw, partRels: docRels }, ctx);
      
      const pageBreak = pi === 0 ? "" : '<w:p><w:pPr></w:pPr><w:r><w:br w:type="page"/></w:r></w:p>\n';
      sectionBodyXml += `${pageBreak}${pageXml}\n`;
    });
    
    const cfg = sec.pageNumberConfig;
    const rawFmt = cfg?.format ?? (sec.pageNumberFormat ? (sec.pageNumberFormat === "1" ? "arabic" : sec.pageNumberFormat === "i" ? "roman-lower" : sec.pageNumberFormat === "I" ? "roman-upper" : sec.pageNumberFormat === "a" ? "alpha-lower" : "alpha-upper") : "arabic");
    const fmt = rawFmt ?? "arabic";
    const fmtMap: Record<string, string> = {
      arabic: "decimal",
      "roman-lower": "lowerRoman",
      "roman-upper": "upperRoman",
      "alpha-lower": "lowerLetter",
      "alpha-upper": "upperLetter",
    };
    const start = cfg?.startAt ?? sec.pageNumberStartAt ?? sec.pageNumberStart;
    const hasStart = start !== undefined && start !== null;
    const pgNumTypeXml = `<w:pgNumType w:fmt="${fmtMap[fmt] ?? "decimal"}"${hasStart ? ` w:start="${start}"` : ""}/>`;

    const hfRel = sectionHFRels.find((r) => r.sectionId === sec.id)?.rels || {};
    let hfRefs = "";
    if (hfRel.normalHeader) hfRefs += `<w:headerReference w:type="default" r:id="${hfRel.normalHeader}"/>`;
    if (hfRel.normalFooter) hfRefs += `<w:footerReference w:type="default" r:id="${hfRel.normalFooter}"/>`;
    if (sec.differentFirstPage) {
      if (hfRel.firstHeader) hfRefs += `<w:headerReference w:type="first" r:id="${hfRel.firstHeader}"/>`;
      if (hfRel.firstFooter) hfRefs += `<w:footerReference w:type="first" r:id="${hfRel.firstFooter}"/>`;
    }
    if (sec.differentOddEven) {
      if (hfRel.evenHeader) hfRefs += `<w:headerReference w:type="even" r:id="${hfRel.evenHeader}"/>`;
      if (hfRel.evenFooter) hfRefs += `<w:footerReference w:type="even" r:id="${hfRel.evenFooter}"/>`;
    }

    const paperSizeName = sec.paperSizeConfig?.name ?? sec.paperSize?.name;
    const paperCode = getPaperSizeCode(paperSizeName);
    const pgSzXml = `<w:pgSz w:w="${Math.round(paperW * 15)}" w:h="${Math.round(paperH * 15)}" w:orient="${sec.orientation === "landscape" ? "landscape" : "portrait"}"${paperCode ? ` w:code="${paperCode}"` : ""}/>`;
    const pgMarXml = `<w:pgMar w:top="${Math.round(mg.top * 15)}" w:bottom="${Math.round(mg.bottom * 15)}" w:left="${Math.round(mg.left * 15)}" w:right="${Math.round(mg.right * 15)}" w:header="${Math.round(hDist * 15)}" w:footer="${Math.round(fDist * 15)}" w:gutter="${Math.round((sec.gutter ?? 0) * 15)}"/>`;
    const pgBordersXml = buildPgBordersXml(sec);
    const titlePgXml = sec.differentFirstPage ? "<w:titlePg/>" : "";

    const sectPrXml = `<w:sectPr>
      ${hfRefs}
      ${pgSzXml}
      ${pgMarXml}
      ${pgBordersXml}
      ${pgNumTypeXml}
      ${titlePgXml}
    </w:sectPr>`;
    
    const isLastSection = idx === model.sections.length - 1;
    if (isLastSection) {
      bodyXml += `${sectionBodyXml}\n${sectPrXml}`;
    } else {
      bodyXml += `${sectionBodyXml}\n<w:p><w:pPr>${sectPrXml}</w:pPr></w:p>\n`;
    }
  });

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    ${bodyXml}
  </w:body>
</w:document>`;

  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  let docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`;
  docRels.forEach((rel) => {
    const tm = rel.targetMode ? ` TargetMode="${rel.targetMode}"` : "";
    docRelsXml += `\n  <Relationship Id="${rel.id}" Type="${rel.type}" Target="${esc(rel.target)}"${tm}/>`;
  });
  docRelsXml += "\n</Relationships>";
  zip.file("word/_rels/document.xml.rels", docRelsXml);

  zip.file("word/document.xml", documentXml);

  zip.file("word/styles.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
        <w:lang w:val="en-US"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="120" w:line="240" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:after="120" w:line="240" w:lineRule="auto"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
      <w:sz w:val="22"/>
      <w:szCs w:val="22"/>
      <w:lang w:val="en-US"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1" w:customStyle="1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before="240" w:after="120"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light"/>
      <w:b/>
      <w:color w:val="2E74B5"/>
      <w:sz w:val="40"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2" w:customStyle="1">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before="240" w:after="100"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light"/>
      <w:b/>
      <w:color w:val="2E74B5"/>
      <w:sz w:val="32"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading3" w:customStyle="1">
    <w:name w:val="heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before="160" w:after="80"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light"/>
      <w:b/>
      <w:color w:val="1F497D"/>
      <w:sz w:val="28"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading4" w:customStyle="1">
    <w:name w:val="heading 4"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:spacing w:before="120" w:after="60"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
      <w:b/>
      <w:color w:val="1F497D"/>
      <w:sz w:val="24"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="ListParagraph" w:customStyle="1">
    <w:name w:val="List Paragraph"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:ind w:left="720"/>
      <w:spacing w:after="60"/>
    </w:pPr>
  </w:style>
  <w:style w:type="character" w:styleId="Hyperlink">
    <w:name w:val="Hyperlink"/>
    <w:basedOn w:val="DefaultParagraphFont"/>
    <w:uiPriority w:val="99"/>
    <w:unhideWhenUsed/>
    <w:rPr>
      <w:color w:val="0563C1" w:themeColor="hyperlink"/>
      <w:u w:val="single"/>
    </w:rPr>
  </w:style>
  <w:style w:type="character" w:styleId="FollowedHyperlink">
    <w:name w:val="FollowedHyperlink"/>
    <w:basedOn w:val="DefaultParagraphFont"/>
    <w:uiPriority w:val="99"/>
    <w:unhideWhenUsed/>
    <w:rPr>
      <w:color w:val="954F72" w:themeColor="followedHyperlink"/>
      <w:u w:val="single"/>
    </w:rPr>
  </w:style>
</w:styles>`);

  const hasOddEven = model.sections.some((s) => s.differentOddEven);
  const hasMirroredMargins = model.sections.some((s) => s.marginPreset === "mirrored");
  zip.file("word/settings.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:defaultTabStop w:val="720"/>
  ${hasOddEven ? "<w:evenAndOddHeaders/>" : ""}
  ${hasMirroredMargins ? "<w:mirrorMargins/>" : ""}
</w:settings>`);

  ctxMediaFiles.forEach((file) => {
    zip.file(file.filename, file.data, { base64: file.base64 });
  });

  let contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Default Extension="gif" ContentType="image/gif"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>`;

  docRels.forEach((rel) => {
    if (rel.type.includes("relationships/header")) {
      contentTypesXml += `\n  <Override PartName="/word/${rel.target}" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>`;
    } else if (rel.type.includes("relationships/footer")) {
      contentTypesXml += `\n  <Override PartName="/word/${rel.target}" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>`;
    }
  });
  contentTypesXml += `\n</Types>`;
  zip.file("[Content_Types].xml", contentTypesXml);
  
  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}
