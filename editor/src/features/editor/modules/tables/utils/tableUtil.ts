/**
 * --------------------------------------------------------
 * Module: Tables
 * Feature: Table Utility Functions
 * Description:
 * HTML generator and manipulation helpers for tables inserted
 * into the contentEditable workspace with Word-style fixed layout.
 * --------------------------------------------------------
 */

import type { TableConfig, TableTemplate } from "../types";

export function getTableStyleClass(style: TableConfig["style"]): string {
  switch (style) {
    case "clinical":
      return "editor-table-clinical";
    case "striped":
      return "editor-table-striped";
    case "bordered":
      return "editor-table-bordered";
    case "minimal":
      return "editor-table-minimal";
    case "darkHeader":
      return "editor-table-dark-header";
    default:
      return "editor-table-default";
  }
}

export function generateTableHtml(config: TableConfig): string {
  const { rows, cols, hasHeader, style, bordered, striped, width, caption } = config;

  const colWidth = cols > 0 ? (100 / cols).toFixed(2) : "33.33";
  const borderStyle = bordered ? "1px solid #cbd5e1" : "none";
  const styleAttr = `border-collapse: collapse; table-layout: fixed; width: ${width || "100%"}; margin: 16px 0; font-size: 10pt; box-sizing: border-box;`;

  let html = `<table class="editor-table ${getTableStyleClass(style)}" style="${styleAttr}" data-table="true" border="${bordered ? "1" : "0"}">`;

  if (caption && caption.trim()) {
    html += `<caption style="padding: 6px 0; font-weight: 600; text-align: left; color: #475569;">${caption.trim()}</caption>`;
  }

  let rowStart = 0;
  if (hasHeader) {
    rowStart = 1;
    html += "<thead><tr>";
    for (let c = 0; c < cols; c++) {
      const headerBg =
        style === "clinical"
          ? "#0078d4"
          : style === "darkHeader"
          ? "#1e293b"
          : "#f1f5f9";
      const headerColor =
        style === "clinical" || style === "darkHeader"
          ? "#ffffff"
          : "#1e293b";

      html += `<th style="border: ${borderStyle}; width: ${colWidth}%; background-color: ${headerBg}; color: ${headerColor}; padding: 8px 12px; font-weight: 600; text-align: left; vertical-align: top; word-break: break-word; overflow-wrap: anywhere; white-space: normal; box-sizing: border-box;">&nbsp;</th>`;
    }
    html += "</tr></thead>";
  }

  html += "<tbody>";
  for (let r = rowStart; r < rows; r++) {
    const isEven = r % 2 === 0;
    const rowBg = striped && isEven ? "#f8fafc" : "transparent";

    html += `<tr style="background-color: ${rowBg};">`;
    for (let c = 0; c < cols; c++) {
      html += `<td style="border: ${borderStyle}; width: ${colWidth}%; padding: 8px 12px; vertical-align: top; text-align: left; word-break: break-word; overflow-wrap: anywhere; white-space: normal; box-sizing: border-box;">&nbsp;</td>`;
    }
    html += "</tr>";
  }
  html += "</tbody></table><p><br/></p>";

  return html;
}

export function generateTemplateTableHtml(template: TableTemplate): string {
  const { headers, sampleData, style, rows, cols } = template;
  const colWidth = cols > 0 ? (100 / cols).toFixed(2) : "33.33";
  const borderStyle = "1px solid #cbd5e1";
  const headerBg =
    style === "clinical"
      ? "#0078d4"
      : style === "bordered"
      ? "#e2e8f0"
      : "#f1f5f9";
  const headerColor = style === "clinical" ? "#ffffff" : "#1e293b";

  let html = `<table class="editor-table ${getTableStyleClass(style)}" style="border-collapse: collapse; table-layout: fixed; width: 100%; margin: 16px 0; font-size: 10pt; box-sizing: border-box;" data-table="true" border="1">`;
  html += "<thead><tr>";
  headers.forEach((h) => {
    html += `<th style="border: ${borderStyle}; width: ${colWidth}%; background-color: ${headerBg}; color: ${headerColor}; padding: 8px 12px; font-weight: 600; text-align: left; vertical-align: top; word-break: break-word; overflow-wrap: anywhere; white-space: normal; box-sizing: border-box;">${h}</th>`;
  });
  html += "</tr></thead><tbody>";

  if (sampleData && sampleData.length > 0) {
    sampleData.forEach((row, idx) => {
      const isEven = idx % 2 === 0;
      const rowBg = style === "striped" && isEven ? "#f8fafc" : "transparent";
      html += `<tr style="background-color: ${rowBg};">`;
      row.forEach((cell) => {
        html += `<td style="border: ${borderStyle}; width: ${colWidth}%; padding: 8px 12px; vertical-align: top; text-align: left; word-break: break-word; overflow-wrap: anywhere; white-space: normal; box-sizing: border-box;">${cell}</td>`;
      });
      html += "</tr>";
    });
  } else {
    for (let r = 1; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) {
        html += `<td style="border: ${borderStyle}; width: ${colWidth}%; padding: 8px 12px; vertical-align: top; text-align: left; word-break: break-word; overflow-wrap: anywhere; white-space: normal; box-sizing: border-box;">&nbsp;</td>`;
      }
      html += "</tr>";
    }
  }

  html += "</tbody></table><p><br/></p>";
  return html;
}
