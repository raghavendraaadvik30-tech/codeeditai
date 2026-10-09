import type { ToolCall } from "../api/aiApi";
import { sendMessage } from "../api/aiApi";
import type { PreviewPayload } from "../repository/aiRepository";
import { generatePictureHTML } from "../../figures/modules/pictures/utils/pictureUtils";

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

const HANDLE_STYLE =
  "position:absolute;width:6px;height:6px;background:#fff;border:1px solid #2563eb;border-radius:1px;box-shadow:0 0 2px rgba(0,0,0,.3);z-index:999999;display:none;";

export function eightHandlesHTML(prefix: "ai-handle" | "ai-table-handle"): string {
  const p = prefix;
  return `
    <div data-${p}="1" data-dir="nw" style="${HANDLE_STYLE}cursor:nwse-resize;top:-5px;left:-5px;"></div>
    <div data-${p}="1" data-dir="n"  style="${HANDLE_STYLE}cursor:ns-resize;top:-5px;left:50%;transform:translateX(-50%);"></div>
    <div data-${p}="1" data-dir="ne" style="${HANDLE_STYLE}cursor:nesw-resize;top:-5px;right:-5px;"></div>
    <div data-${p}="1" data-dir="e"  style="${HANDLE_STYLE}cursor:ew-resize;top:50%;right:-5px;transform:translateY(-50%);"></div>
    <div data-${p}="1" data-dir="se" style="${HANDLE_STYLE}cursor:nwse-resize;bottom:-5px;right:-5px;"></div>
    <div data-${p}="1" data-dir="s"  style="${HANDLE_STYLE}cursor:ns-resize;bottom:-5px;left:50%;transform:translateX(-50%);"></div>
    <div data-${p}="1" data-dir="sw" style="${HANDLE_STYLE}cursor:nesw-resize;bottom:-5px;left:-5px;"></div>
    <div data-${p}="1" data-dir="w"  style="${HANDLE_STYLE}cursor:ew-resize;top:50%;left:-5px;transform:translateY(-50%);"></div>
  `;
}

export function wrapTable(innerTableHtml: string): string {
  return `<div class="ai-table-wrap" data-ai-table="1" style="position:relative;display:block;margin:12px 0;outline:1px solid transparent;outline-offset:2px;">
    <div class="ai-table-grip" contenteditable="false" data-ai-table-action="drag" title="Drag to move" style="position:absolute;top:-14px;left:8px;width:22px;height:22px;background:#eef2f9;border:1px solid #d6dbe5;border-radius:4px;cursor:move;display:none;place-items:center;font-size:13px;z-index:20;">⠿</div>
    ${innerTableHtml}
    ${eightHandlesHTML("ai-table-handle")}
  </div>`;
}

export function buildTable(rows: number, cols: number): string {
  const h = Array.from(
    { length: cols },
    (_, i) =>
      `<th style="border:1px solid #cfd6e4;padding:6px 8px;background:#eef2f9;text-align:left;font-size:10pt">Column ${i + 1}</th>`
  ).join("");
  const b = Array.from(
    { length: Math.max(rows - 1, 0) },
    () =>
      `<tr>${Array.from(
        { length: cols },
        () => `<td style="border:1px solid #cfd6e4;padding:6px 8px;font-size:10pt">&nbsp;</td>`
      ).join("")}</tr>`
  ).join("");
  const inner = `<table style="border-collapse:collapse;width:100%;margin:0"><thead><tr>${h}</tr></thead><tbody>${b}</tbody></table>`;
  return wrapTable(inner) + `<p>&nbsp;</p>`;
}

export const CLINICAL_PRESETS: Record<string, { rows: number; cols: number; headers: string[] }> = {
  demographics: { rows: 6, cols: 4, headers: ["Characteristic", "Group A", "Group B", "Total"] },
  adverseEvents: { rows: 6, cols: 4, headers: ["Adverse Event", "Drug (n)", "Placebo (n)", "Total"] },
  efficacy: { rows: 5, cols: 3, headers: ["Endpoint", "Result", "p-value"] },
  audit: { rows: 6, cols: 4, headers: ["Timestamp", "User", "Action", "Notes"] },
  risk: { rows: 6, cols: 5, headers: ["Risk", "Likelihood", "Impact", "Score", "Owner"] },
  approval: { rows: 5, cols: 4, headers: ["Role", "Name", "Status", "Date"] },
};

export function buildClinicalTable(preset: string): string {
  const p = CLINICAL_PRESETS[preset] || CLINICAL_PRESETS.demographics;
  const h = p.headers
    .map(
      (x) =>
        `<th style="border:1px solid #cfd6e4;padding:6px 8px;background:#eef2f9;text-align:left;font-size:10pt">${escapeHtml(
          x
        )}</th>`
    )
    .join("");
  const b = Array.from(
    { length: p.rows - 1 },
    () =>
      `<tr>${Array.from(
        { length: p.cols },
        () => `<td style="border:1px solid #cfd6e4;padding:6px 8px;font-size:10pt">&nbsp;</td>`
      ).join("")}</tr>`
  ).join("");
  const inner = `<table style="border-collapse:collapse;width:100%;margin:0"><thead><tr>${h}</tr></thead><tbody>${b}</tbody></table>`;
  return wrapTable(inner) + `<p>&nbsp;</p>`;
}

const HEADING_STYLES: Record<string, string> = {
  h1: "font-size:22pt;font-weight:700;margin-top:16px",
  h2: "font-size:18pt;font-weight:700;margin-top:14px",
  h3: "font-size:14pt;font-weight:700;margin-top:12px",
  h4: "font-size:12pt;font-weight:700;margin-top:10px",
  paragraph: "font-size:11pt",
};
const HEADING_TAGS: Record<string, string> = { h1: "h1", h2: "h2", h3: "h3", h4: "h4", paragraph: "p" };

export function buildText(text: string, style: string): string {
  const tag = HEADING_TAGS[style] ?? "p";
  const css = HEADING_STYLES[style] ?? HEADING_STYLES.paragraph;
  return `<${tag} style="${css}">${escapeHtml(text)}</${tag}><p>&nbsp;</p>`;
}

export function isDirectImageUrl(str: string): boolean {
  if (!str) return false;
  const s = str.trim();
  return /^(https?:\/\/|data:image\/|blob:)/i.test(s);
}

export function extractImageUrlFromText(text: string): string | null {
  if (!text) return null;
  const match = text.match(
    /(https?:\/\/[^\s"'<>\[\]]+|data:image\/[a-zA-Z0-9+.-]+;base64,[^\s"'<>\[\]]+|blob:[^\s"'<>\[\]]+)/i
  );
  if (!match) return null;
  let url = match[0];
  url = url.replace(/[.,;:)>\]]+$/, "");
  return url;
}

export function buildImageFromUrl(url: string, caption?: string): string {
  const cap = caption && caption !== "Figure" && caption !== "Image" ? caption : "Figure";
  return generatePictureHTML({
    src: url,
    name: cap,
    caption: cap,
    mode: "withTitle",
    width: 480,
    height: 320,
  });
}

export async function buildFigure(query: string): Promise<string> {
  const extractedUrl = isDirectImageUrl(query) ? query.trim() : extractImageUrlFromText(query);
  if (extractedUrl) {
    return buildImageFromUrl(extractedUrl);
  }

  const cleanQuery = query.replace(/^(generate\s*(picture|image|photo|figure)\s*(of)?|picture\s*generate\s*madu|image|photo)\s*/i, '').trim() || "Scientific Clinical Representation";

  // Dynamic visual picture generator for instant realistic picture generation
  const generatedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanQuery + " highly detailed scientific medical laboratory clinical clear photograph")}?width=800&height=520&nologo=true`;

  return buildImageFromUrl(generatedUrl, cleanQuery);
}

export function buildLink(url: string, text: string): string {
  return `<a href="${escapeHtml(url)}" target="_blank" style="color:#2563eb;text-decoration:underline">${escapeHtml(
    text
  )}</a>&nbsp;`;
}

export function buildList(items: string[], type: string): string {
  const tag = type === "numbered" ? "ol" : "ul";
  return `<${tag} style="padding-left:24px;margin:8px 0">${items
    .map((i) => `<li style="font-size:11pt">${escapeHtml(i)}</li>`)
    .join("")}</${tag}><p>&nbsp;</p>`;
}

export const MARK_ATTR = "data-ai-target";
export let markedCursor = { rowIndex: -1, colIndex: -1 };

export function clearAllMarks(): void {
  document.querySelectorAll<HTMLElement>(`[${MARK_ATTR}]`).forEach((el) => {
    el.removeAttribute(MARK_ATTR);
    el.style.outline = "";
    el.style.outlineOffset = "";
  });
}

export function markTable(table: HTMLTableElement): void {
  clearAllMarks();
  table.setAttribute(MARK_ATTR, "1");
  table.style.outline = "3px solid #facc15";
  table.style.outlineOffset = "2px";
}

export function findMarkedTable(): HTMLTableElement | null {
  return document.querySelector<HTMLTableElement>(`table[${MARK_ATTR}]`);
}

export interface ToolExecutionServiceContext {
  insertHTML: (html: string) => void;
  replaceSelectedText?: (html: string) => void;
  insertOnNewPage: (html: string) => void;
  deleteLastTable: () => void;
  addTableData: (data: string[][]) => void;
  modifyTableStructure: (action: string, count: number, position?: string) => void;
  deletePage: (pages: string) => void;
  insertSectionBreak: () => void;
  addBookmark: (name: string) => void;
  findText: (query: string) => void;
  applyStyle: (style: string) => void;
  changeCase: (mode: string) => void;
  applyFormat: (format: string) => void;
  alignText: (align: string) => void;
  changeFont: (font: string) => void;
  changeFontSize: (size: number) => void;
  insertSymbol: (symbol: string) => void;
  changeOrientation: (orientation: string) => void;
  setMargins: (m: { top?: number; right?: number; bottom?: number; left?: number }) => void;
  insertCitation: (source: string) => void;
  insertFigureTemplate: (figure: string) => void;
  insertInternalRef: () => void;
  insertCrossRef: (target: string) => void;
  insertAppendix: (appendix: string) => void;
  loadTemplate: (template: string) => void;
  saveDocument: () => Promise<void> | void;
  saveDocumentAs: (title: string) => Promise<void> | void;
  exportPDF: () => void;
  exportDOCX: () => void;
  toggleTrackChanges: () => void;
  resizeImage: (width?: number, percent?: number) => void;
  removeImage: () => void;
}

export async function executeToolCall(
  call: ToolCall,
  ctx: ToolExecutionServiceContext,
  lastDocSelection?: string
): Promise<{ preview?: PreviewPayload } | void> {
  const { name, args } = call;

  const insert = (html: string) => {
    ctx.insertHTML(html);
  };

  switch (name) {
    case "createTable": {
      const r = Math.max(1, Number(args.rows) || 4);
      const c = Math.max(1, Number(args.columns) || 3);
      const html = buildTable(r, c);
      return { preview: { html, label: `Table ${r} × ${c}` } };
    }
    case "insertClinicalTable": {
      const preset = String(args.preset || "demographics");
      const html = buildClinicalTable(preset);
      return { preview: { html, label: `Clinical Table: ${preset}` } };
    }
    case "addTableData": {
      const data = Array.isArray(args.data)
        ? (args.data as unknown[]).map((row) =>
            Array.isArray(row) ? (row as unknown[]).map(String) : [String(row)]
          )
        : [];
      ctx.addTableData(data);
      break;
    }
    case "modifyTableStructure":
      ctx.modifyTableStructure(
        String(args.action || "addRow"),
        Math.max(1, Number(args.count) || 1),
        args.position !== undefined ? String(args.position) : undefined
      );
      break;
    case "deleteTable":
      ctx.deleteLastTable();
      break;
    case "deletePage":
      ctx.deletePage(String(args.pages || "current"));
      break;
    case "insertSectionBreak":
      ctx.insertSectionBreak();
      break;
    case "insertPageBreak":
      ctx.insertOnNewPage("");
      break;
    case "addBookmark":
      ctx.addBookmark(String(args.name || "bookmark"));
      break;
    case "findText":
      ctx.findText(String(args.query || ""));
      break;
    case "applyStyle":
      ctx.applyStyle(String(args.style || "paragraph"));
      break;
    case "changeCase":
      ctx.changeCase(String(args.mode || "upper"));
      break;
    case "applyFormat":
      ctx.applyFormat(String(args.format || "bold"));
      break;
    case "alignText":
      ctx.alignText(String(args.align || "left"));
      break;
    case "changeFont":
      ctx.changeFont(String(args.font || "Calibri"));
      break;
    case "changeFontSize":
      ctx.changeFontSize(Number(args.size) || 11);
      break;
    case "insertSymbol":
      ctx.insertSymbol(String(args.symbol || "°"));
      break;
    case "changeOrientation":
      ctx.changeOrientation(String(args.orientation || "portrait"));
      break;
    case "setMargins":
      ctx.setMargins({
        top: args.top !== undefined ? Number(args.top) : undefined,
        right: args.right !== undefined ? Number(args.right) : undefined,
        bottom: args.bottom !== undefined ? Number(args.bottom) : undefined,
        left: args.left !== undefined ? Number(args.left) : undefined,
      });
      break;
    case "insertCitation":
      ctx.insertCitation(String(args.source || "ICH E3"));
      break;
    case "insertFigureTemplate": {
      const figureName = String(args.figure || "Kaplan-Meier Survival Curve");
      const html = `
        <figure style="margin:12px 0;border:1px solid #d6dbe5;border-radius:6px;overflow:hidden;background:linear-gradient(135deg,#eef2f9,#f7f9fc)">
          <div style="aspect-ratio:16/9;display:grid;place-items:center;color:#6b7a99;font-size:11pt">[ ${escapeHtml(
            figureName
          )} ]</div>
          <figcaption style="padding:6px 10px;font-size:10pt;font-style:italic;color:#555;border-top:1px solid #e6eaf2">Figure — ${escapeHtml(
            figureName
          )}</figcaption>
        </figure><p>&nbsp;</p>
      `;
      return { preview: { html, label: `Figure: ${figureName}` } };
    }
    case "insertInternalRef":
      ctx.insertInternalRef();
      break;
    case "insertCrossRef":
      ctx.insertCrossRef(String(args.target || ""));
      break;
    case "insertAppendix":
      ctx.insertAppendix(String(args.appendix || "A — Protocol"));
      break;
    case "loadTemplate":
      ctx.loadTemplate(String(args.template || "CSR"));
      break;
    case "saveDocument":
      await ctx.saveDocument();
      break;
    case "saveDocumentAs":
      await ctx.saveDocumentAs(String(args.title || "Untitled"));
      break;
    case "exportPDF":
      ctx.exportPDF();
      break;
    case "exportDOCX":
      ctx.exportDOCX();
      break;
    case "toggleTrackChanges":
      ctx.toggleTrackChanges();
      break;
    case "addText":
      insert(buildText(String(args.text || ""), String(args.style || "paragraph")));
      break;
    case "insertImage": {
      const directUrl =
        typeof args.url === "string" && args.url.trim() ? args.url.trim() : null;
      const queryStr = String(args.query || "");
      const urlFromQuery = extractImageUrlFromText(queryStr);
      const finalUrl = directUrl || urlFromQuery;
      if (finalUrl) {
        const html = buildImageFromUrl(finalUrl, String(args.caption || "Image"));
        return { preview: { html, label: `Image: ${finalUrl}` } };
      }
      const html = await buildFigure(queryStr || "Figure");
      return { preview: { html, label: `Image: ${queryStr || "Figure"}` } };
    }
    case "resizeImage": {
      ctx.resizeImage(
        args.width !== undefined ? Number(args.width) : undefined,
        args.percent !== undefined ? Number(args.percent) : undefined
      );
      break;
    }
    case "removeImage":
      ctx.removeImage();
      break;
    case "addLink": {
      const u = String(args.url || "#");
      insert(buildLink(u, String(args.text || u)));
      break;
    }
    case "createList":
      insert(
        buildList(
          Array.isArray(args.items)
            ? (args.items as unknown[]).map(String)
            : ["Item 1"],
          String(args.type || "bullet")
        )
      );
      break;
    case "rewriteText": {
      const docText =
        lastDocSelection ||
        (typeof args.text === "string" &&
        !/^(this|rewrite this|it|selected text|the selected text)$/i.test(args.text.trim())
          ? args.text.trim()
          : "");
      if (!docText) throw new Error("⚠️ Please select some text in the document first.");
      const r = await sendMessage(
        `Rewrite the selected text while preserving its original meaning. Return ONLY the rewritten text without markdown formatting or introductory remarks:\n\n${docText}`
      );
      const clean = r.trim().replace(/^["']|["']$/g, '');
      if (ctx.replaceSelectedText) {
        ctx.replaceSelectedText(clean);
      } else {
        ctx.insertHTML(clean);
      }
      break;
    }
    case "improveWriting": {
      const docText =
        lastDocSelection ||
        (typeof args.text === "string" &&
        !/^(this|improve this|it|selected text|the selected text)$/i.test(args.text.trim())
          ? args.text.trim()
          : "");
      if (!docText) throw new Error("⚠️ Please select some text in the document first.");
      const r = await sendMessage(
        `Correct grammar, spelling, clarity, sentence structure, and professional tone in the selected text. Return ONLY the improved text:\n\n${docText}`
      );
      const clean = r.trim().replace(/^["']|["']$/g, '');
      if (ctx.replaceSelectedText) {
        ctx.replaceSelectedText(clean);
      } else {
        ctx.insertHTML(clean);
      }
      break;
    }
    case "generateHeading": {
      const topic = String(
        (lastDocSelection && lastDocSelection.length < 300 ? lastDocSelection : null) ||
          args.topic ||
          "Clinical Evaluation"
      );
      const r = await sendMessage(
        `Generate a relevant, professional heading based on the selected text:\n\n"${topic}"\n\nReturn ONLY the heading text.`
      );
      insert(buildText(r.trim().replace(/^#+\s*/, ''), String(args.level || "h2")));
      break;
    }
    case "captionFigure": {
      const docText =
        lastDocSelection ||
        (typeof args.context === "string" ? args.context : "");
      const prompt = docText
        ? `Generate a meaningful, professional caption for the selected figure or image context:\n\n"${docText}"\n\nReturn ONLY the caption text.`
        : `Generate a meaningful, professional figure caption for clinical reporting. Return ONLY the caption text.`;
      const r = await sendMessage(prompt);
      const cap = r.trim().replace(/^Figure\s*[\d.:-]*\s*/i, '');
      const captionText = `Figure — ${cap}`;
      ctx.insertHTML(`<p class="editor-figure-caption" style="margin:8px auto;font-size:10.5pt;font-weight:600;color:#475569;text-align:center;font-style:italic">${escapeHtml(captionText)}</p><p>&nbsp;</p>`);
      break;
    }
    case "summarizeSection": {
      const docText =
        lastDocSelection ||
        (typeof args.text === "string" &&
        !/^(this|summarize this|it|selected text)$/i.test(args.text.trim())
          ? args.text.trim()
          : "");
      if (!docText) throw new Error("⚠️ Please select some text in the document first.");
      const r = await sendMessage(
        `Summarize the selected section while retaining its important points in 2-3 concise sentences. Return ONLY the summary paragraph:\n\n${docText}`
      );
      ctx.insertHTML(buildText(r.trim(), "paragraph"));
      break;
    }
    case "complianceFix": {
      const docText =
        lastDocSelection ||
        (typeof args.text === "string" &&
        !/^(this|fix this|it|selected text)$/i.test(args.text.trim())
          ? args.text.trim()
          : "");
      if (!docText) throw new Error("⚠️ Please select some text in the document first.");
      const r = await sendMessage(
        `Adjust phrasing for strict clinical compliance, scientific neutrality, and FDA/EMA standards:\n\n${docText}`
      );
      const clean = r.trim().replace(/^["']|["']$/g, '');
      if (ctx.replaceSelectedText) {
        ctx.replaceSelectedText(clean);
      } else {
        ctx.insertHTML(clean);
      }
      break;
    }
    case "regulatoryTone": {
      const docText =
        lastDocSelection ||
        (typeof args.text === "string" &&
        !/^(this|adjust this|it|selected text)$/i.test(args.text.trim())
          ? args.text.trim()
          : "");
      if (!docText) throw new Error("⚠️ Please select some text in the document first.");
      const r = await sendMessage(
        `Rewrite in formal regulatory (FDA/EMA/ICH) reporting style:\n\n${docText}`
      );
      const clean = r.trim().replace(/^["']|["']$/g, '');
      if (ctx.replaceSelectedText) {
        ctx.replaceSelectedText(clean);
      } else {
        ctx.insertHTML(clean);
      }
      break;
    }
    case "generateTable": {
      const docText = lastDocSelection || (typeof args.topic === "string" ? args.topic : "");
      if (docText) {
        try {
          const r = await sendMessage(
            `Convert the following selected information into a properly structured HTML table with <thead><tr><th>...</th></tr></thead> and <tbody>...</tbody> rows. Return ONLY the <table>...</table> markup:\n\n${docText}`
          );
          const cleanTable = r.replace(/```html|```/g, '').trim();
          if (cleanTable.includes('<table')) {
            const html = wrapTable(cleanTable) + `<p>&nbsp;</p>`;
            return { preview: { html, label: "Converted Table from Selected Text" } };
          }
        } catch {
          // fallback to structured clinical table
        }
      }
      const r = (args.rows as number) || 4;
      const c = (args.columns as number) || 4;
      const html = buildTable(r, c);
      return { preview: { html, label: `Table ${r} × ${c}` } };
    }
    default:
      break;
  }
}

export const aiService = {
  buildTable,
  buildClinicalTable,
  buildText,
  buildImageFromUrl,
  buildFigure,
  buildLink,
  buildList,
  isDirectImageUrl,
  extractImageUrlFromText,
  executeToolCall,
  markTable,
  clearAllMarks,
  findMarkedTable,
};
