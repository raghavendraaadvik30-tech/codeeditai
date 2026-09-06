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
    "tfoot", "blockquote", "section", "hr"
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
  
  listType?: "ul" | "ol" | null;
  listIndex?: number;
  
  partRels: RelationshipItem[];
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
      ooxml += walk(node, { partRels: options.partRels });
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
      
      const escaped = esc(text);
      let rPr = "";
      if (state.bold) rPr += "<w:b/>";
      if (state.italic) rPr += "<w:i/>";
      if (state.underline) rPr += '<w:u w:val="single"/>';
      if (state.strike) rPr += "<w:strike/>";
      
      if (state.fontFamily) {
        rPr += `<w:rFonts w:ascii="${esc(state.fontFamily)}" w:hAnsi="${esc(state.fontFamily)}"/>`;
      }
      if (state.fontSize) {
        const val = parseFontSize(state.fontSize);
        if (val) rPr += `<w:sz w:val="${val}"/>`;
      }
      if (state.color) {
        const hex = parseColorToHex(state.color);
        if (hex) rPr += `<w:color w:val="${hex}"/>`;
      }
      if (state.bg) {
        const hex = parseColorToHex(state.bg);
        if (hex) rPr += `<w:shd w:val="clear" w:color="auto" w:fill="${hex}"/>`;
      }
      
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
        
        if (tag === "ins") {
          return `<w:ins w:id="${id}" w:author="${esc(user)}" w:date="${dateStr}">${innerXml}</w:ins>`;
        } else {
          const delTextXml = innerXml.replace(/<w:t/g, "<w:delText").replace(/<\/w:t>/g, "</w:delText>");
          return `<w:del w:id="${id}" w:author="${esc(user)}" w:date="${dateStr}">${delTextXml}</w:del>`;
        }
      }

      if (tag === "p" || tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4" || tag === "h5" || tag === "h6") {
        let pPr = "";
        if (tag === "h1") pPr += '<w:pStyle w:val="Heading1"/>';
        else if (tag === "h2") pPr += '<w:pStyle w:val="Heading2"/>';
        else if (tag === "h3") pPr += '<w:pStyle w:val="Heading3"/>';
        else if (tag === "h4") pPr += '<w:pStyle w:val="Heading4"/>';
        
        const align = styles["text-align"] || el.getAttribute("align");
        if (align) {
          const wAlign = align === "justify" ? "both" : align;
          pPr += `<w:jc w:val="${esc(wAlign)}"/>`;
        }
        
        const marginLeft = styles["margin-left"] || styles["padding-left"];
        if (marginLeft) {
          const px = parsePxVal(marginLeft);
          if (px !== null) pPr += `<w:ind w:left="${Math.round(px * 15)}"/>`;
        }
        
        const mt = styles["margin-top"];
        const mb = styles["margin-bottom"];
        const lh = styles["line-height"];
        let spacing = "";
        if (mt) spacing += ` w:before="${Math.round((parsePxVal(mt) ?? 0) * 15)}"`;
        if (mb) spacing += ` w:after="${Math.round((parsePxVal(mb) ?? 0) * 15)}"`;
        if (lh) {
          const lhVal = parseFloat(lh);
          if (!isNaN(lhVal)) {
            const lineTwips = lh.endsWith("px") || lh.endsWith("pt") 
              ? Math.round((parsePxVal(lh) ?? 16) * 15) 
              : Math.round(lhVal * 240);
            spacing += ` w:line="${lineTwips}" w:lineRule="auto"`;
          }
        }
        if (spacing) pPr += `<w:spacing${spacing}/>`;
        
        xml += "<w:p>";
        if (pPr) xml += `<w:pPr>${pPr}</w:pPr>`;
        
        Array.from(el.childNodes).forEach((child) => {
          xml += walk(child, newState);
        });
        
        xml += "</w:p>";
        return xml;
      }
      
      if (tag === "ul" || tag === "ol") {
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
        
        const pPr = '<w:ind w:left="720" w:hanging="360"/>';
        
        xml += "<w:p>";
        xml += `<w:pPr>${pPr}</w:pPr>`;
        
        xml += "<w:r>";
        if (newState.bold) xml += "<w:b/>";
        if (newState.italic) xml += "<w:i/>";
        const prefix = state.listType === "ol" ? `${state.listIndex}. ` : "• ";
        xml += `<w:t xml:space="preserve">${prefix}</w:t>`;
        xml += "</w:r>";
        
        Array.from(el.childNodes).forEach((child) => {
          xml += walk(child, newState);
        });
        
        xml += "</w:p>";
        return xml;
      }
      
      if (tag === "table") {
        xml += parseTableToOpenXML(el as HTMLTableElement, newState, options.cw, ctx);
        return xml;
      }
      
      if (tag === "img") {
        const src = el.getAttribute("src") || "";
        const styleW = styles["width"] || el.getAttribute("width");
        const styleH = styles["height"] || el.getAttribute("height");
        const wPx = parsePxVal(styleW) ?? 300;
        const hPx = parsePxVal(styleH) ?? 200;
        
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
          
          xml += `<w:r>${drawXml}</w:r>`;
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
      
      Array.from(el.childNodes).forEach((child) => {
        xml += walk(child, newState);
      });
      
      if (tag === "br") {
        xml += "<w:r><w:br/></w:r>";
      }
      
      return xml;
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
      const cellOOXML = parseHtmlToOOXML(cellHtml, { cw: cellContentWidth, partRels: state.partRels }, ctx);
      
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
  const borders = sec.pageBordersConfig ?? (sec.pageBorders ? {
    type: sec.pageBorders.style === "none" ? "none" : sec.pageBorders.style === "box" ? "box" : sec.pageBorders.style === "shadow" ? "shadow" : sec.pageBorders.style === "3d" ? "3d" : "custom",
    applyTo: (sec.pageBorders.applyTo === "page" ? "firstPage" : sec.pageBorders.applyTo === "section" ? "section" : "whole") as "whole" | "section" | "firstPage" | "exceptFirstPage",
    top: sec.pageBorders.top ? { style: sec.pageBorders.style, color: sec.pageBorders.color || "#000000", width: sec.pageBorders.width || 1 } : undefined,
    bottom: sec.pageBorders.bottom ? { style: sec.pageBorders.style, color: sec.pageBorders.color || "#000000", width: sec.pageBorders.width || 1 } : undefined,
    left: sec.pageBorders.left ? { style: sec.pageBorders.style, color: sec.pageBorders.color || "#000000", width: sec.pageBorders.width || 1 } : undefined,
    right: sec.pageBorders.right ? { style: sec.pageBorders.style, color: sec.pageBorders.color || "#000000", width: sec.pageBorders.width || 1 } : undefined,
  } : undefined);

  if (!borders || borders.type === "none") return "";

  let display = "allPages";
  if (borders.applyTo === "firstPage") display = "firstPage";
  else if (borders.applyTo === "exceptFirstPage") display = "notFirstPage";

  let xml = `<w:pgBorders w:display="${display}" w:offsetFrom="page" w:zOrder="back">`;

  const renderSideXml = (sideTag: string, b?: { style: string; color?: string; width?: number; art?: string }) => {
    if (!b || b.style === "none" || (!b.width && !b.art)) {
      return "";
    }

    if (b.art && b.art !== "none") {
      let artVal = "double";
      let sz = "24";
      let color = "auto";
      if (b.art === "double-red") {
        artVal = "double";
        sz = "24";
        color = "EF4444";
      } else if (b.art === "stars") {
        artVal = "stars";
        sz = "24";
        color = "EAB308";
      } else {
        artVal = "dashed";
        sz = "16";
        color = parseColorToHex(b.color) || "000000";
      }
      return `<w:${sideTag} w:val="${artVal}" w:sz="${sz}" w:space="24" w:color="${color}"/>`;
    }

    let val = "single";
    const s = b.style.trim();
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

    const ptWidth = b.width || 1.5;
    const szVal = Math.round(ptWidth * 8);
    const sz = String(Math.max(2, Math.min(96, szVal)));
    const colorHex = parseColorToHex(b.color) || "000000";
    const isShadow = borders.type === "shadow" ? ' w:shadow="true"' : "";

    return `<w:${sideTag} w:val="${val}" w:sz="${sz}" w:space="24" w:color="${colorHex}"${isShadow}/>`;
  };

  xml += renderSideXml("top", borders.top);
  xml += renderSideXml("left", borders.left);
  xml += renderSideXml("bottom", borders.bottom);
  xml += renderSideXml("right", borders.right);

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
  
  let relIdCounter = 10;
  const getNextRelId = () => `rId${relIdCounter++}`;
  
  const ctx: ExportContext = {
    mediaFiles: ctxMediaFiles,
    getNextRelId,
    imgCounter: imageCounterRef,
  };

  const docRels: RelationshipItem[] = [
    { id: "rIdStyles", type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles", target: "styles.xml" },
    { id: "rIdSettings", type: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings", target: "settings.xml" },
  ];

  const sectionPagesMap: Record<string, typeof model.pages> = {};
  model.pages.forEach((page) => {
    if (!sectionPagesMap[page.sectionId]) sectionPagesMap[page.sectionId] = [];
    sectionPagesMap[page.sectionId].push(page);
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
            relsXml += `\n  <Relationship Id="${r.id}" Type="${r.type}" Target="${r.target}"${tm}/>`;
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
      hfRefs += "<w:titlePg/>";
    }
    if (sec.differentOddEven) {
      if (hfRel.evenHeader) hfRefs += `<w:headerReference w:type="even" r:id="${hfRel.evenHeader}"/>`;
      if (hfRel.evenFooter) hfRefs += `<w:footerReference w:type="even" r:id="${hfRel.evenFooter}"/>`;
    }

    const paperSizeName = sec.paperSizeConfig?.name ?? sec.paperSize?.name;
    const paperCode = getPaperSizeCode(paperSizeName);
    const pgSzXml = `<w:pgSz w:w="${Math.round(paperW * 15)}" w:h="${Math.round(paperH * 15)}" w:orient="${sec.orientation === "landscape" ? "landscape" : "portrait"}"${paperCode ? ` w:code="${paperCode}"` : ""}/>`;

    const sectPrXml = `<w:sectPr>
      ${hfRefs}
      ${pgSzXml}
      <w:pgMar w:top="${Math.round(mg.top * 15)}" w:bottom="${Math.round(mg.bottom * 15)}" w:left="${Math.round(mg.left * 15)}" w:right="${Math.round(mg.right * 15)}" w:header="${Math.round(hDist * 15)}" w:footer="${Math.round(fDist * 15)}" w:gutter="0"/>
      ${pgNumTypeXml}
      ${buildPgBordersXml(sec)}
    </w:sectPr>`;
    
    const isLastSection = idx === model.sections.length - 1;
    if (isLastSection) {
      bodyXml += `${sectionBodyXml}\n<w:sectPr>${sectPrXml}</w:sectPr>`;
    } else {
      bodyXml += `${sectionBodyXml}\n<w:p><w:pPr><w:sectPr>${sectPrXml}</w:sectPr></w:pPr></w:p>\n`;
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
    docRelsXml += `\n  <Relationship Id="${rel.id}" Type="${rel.type}" Target="${rel.target}"${tm}/>`;
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
        <w:lang w:val="en-US"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="120" w:line="240" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
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
      <w:sz w:val="40"/>
      <w:color w:val="2E74B5"/>
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
      <w:sz w:val="32"/>
      <w:color w:val="2E74B5"/>
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
      <w:sz w:val="28"/>
      <w:color w:val="1F497D"/>
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
      <w:sz w:val="24"/>
      <w:color w:val="1F497D"/>
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
</w:styles>`);

  const hasOddEven = model.sections.some((s) => s.differentOddEven);
  zip.file("word/settings.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:defaultTabStop w:val="720"/>
  ${hasOddEven ? "<w:evenAndOddHeaders/>" : ""}
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
