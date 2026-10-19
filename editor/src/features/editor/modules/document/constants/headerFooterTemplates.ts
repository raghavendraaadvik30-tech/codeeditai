/**
 * headerFooterTemplates.ts
 *
 * Built-in Microsoft Word-style Header and Footer templates
 * with live HTML structure and preview renderings.
 */

export interface HFTemplate {
  id: string;
  name: string;
  category: "Built-In" | "Corporate" | "Clinical";
  type: "header" | "footer";
  previewHtml: string;
  contentHtml: string;
  plainText: string;
}

export const BUILT_IN_HEADERS: HFTemplate[] = [
  {
    id: "header-blank",
    name: "Blank",
    category: "Built-In",
    type: "header",
    plainText: "Document Header",
    contentHtml: `<p style="margin: 0; font-size: 10pt; color: #475569;">[ Type Header Text ]</p>`,
    previewHtml: `
      <div style="font-size: 9px; color: #475569; font-family: sans-serif; padding: 4px;">
        <span style="border-bottom: 1px dashed #94a3b8; padding-bottom: 1px;">[ Type Header Text ]</span>
      </div>
    `,
  },
  {
    id: "header-three-columns",
    name: "Blank (Three Columns)",
    category: "Built-In",
    type: "header",
    plainText: "Left Column | Center Column | Right Column",
    contentHtml: `
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; font-size: 9pt; color: #475569;">
        <span style="flex: 1; text-align: left;">[ Left ]</span>
        <span style="flex: 1; text-align: center;">[ Center ]</span>
        <span style="flex: 1; text-align: right;">[ Right ]</span>
      </div>
    `,
    previewHtml: `
      <div style="display: flex; justify-content: space-between; font-size: 8px; color: #475569; padding: 4px; border-bottom: 1px solid #e2e8f0;">
        <span>[ Left ]</span>
        <span>[ Center ]</span>
        <span>[ Right ]</span>
      </div>
    `,
  },
  {
    id: "header-simple-line",
    name: "Simple Line",
    category: "Built-In",
    type: "header",
    plainText: "DOCUMENT TITLE",
    contentHtml: `
      <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; border-bottom: 1.5px solid #0078d4; padding-bottom: 3px; font-size: 9pt; font-weight: 600; color: #0078d4; letter-spacing: 0.5px;">
        <span>DOCUMENT TITLE</span>
        <span style="font-size: 8pt; font-weight: normal; color: #64748b;">Confidential</span>
      </div>
    `,
    previewHtml: `
      <div style="display: flex; justify-content: space-between; font-size: 8px; font-weight: 600; color: #0078d4; border-bottom: 1.5px solid #0078d4; padding: 3px 4px;">
        <span>DOCUMENT TITLE</span>
        <span style="font-size: 7px; color: #64748b; font-weight: normal;">Confidential</span>
      </div>
    `,
  },
  {
    id: "header-doc-title",
    name: "Document Title",
    category: "Built-In",
    type: "header",
    plainText: "DOCUMENT TITLE",
    contentHtml: `
      <div style="text-align: right; width: 100%; font-size: 9pt; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">
        DOCUMENT TITLE
      </div>
    `,
    previewHtml: `
      <div style="text-align: right; font-size: 8px; font-weight: 700; color: #1e293b; border-bottom: 1px solid #cbd5e1; padding: 3px 4px;">
        DOCUMENT TITLE
      </div>
    `,
  },
  {
    id: "header-company",
    name: "Company / Corporate",
    category: "Corporate",
    type: "header",
    plainText: "Medical Reports | Regulatory & Clinical Operations",
    contentHtml: `
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; font-size: 9pt; border-bottom: 1.5px solid #1e3a8a; padding-bottom: 4px;">
        <span style="font-weight: 700; color: #1e3a8a; letter-spacing: 0.5px;">Medical Reports</span>
        <span style="font-size: 8pt; color: #64748b; font-style: italic;">Regulatory & Clinical Operations</span>
      </div>
    `,
    previewHtml: `
      <div style="display: flex; justify-content: space-between; font-size: 8px; border-bottom: 1.5px solid #1e3a8a; padding: 3px 4px;">
        <span style="font-weight: 700; color: #1e3a8a;"> Medical Reports </span>
        <span style="font-size: 7px; color: #64748b; font-style: italic;">Regulatory & Clinical Operations</span>
      </div>
    `,
  },
  {
    id: "header-confidential",
    name: "Confidential",
    category: "Corporate",
    type: "header",
    plainText: "STRICTLY CONFIDENTIAL — FOR INTERNAL REVIEW ONLY",
    contentHtml: `
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; border-bottom: 1.5px solid #e11d48; padding-bottom: 4px;">
        <span style="font-size: 8.5pt; font-weight: 700; color: #e11d48; text-transform: uppercase; letter-spacing: 0.8px;">CONFIDENTIAL & PROPRIETARY</span>
        <span style="font-size: 8pt; color: #64748b;">DO NOT DISTRIBUTE</span>
      </div>
    `,
    previewHtml: `
      <div style="display: flex; justify-content: space-between; font-size: 8px; border-bottom: 1.5px solid #e11d48; padding: 3px 4px;">
        <span style="font-weight: 700; color: #e11d48;">CONFIDENTIAL</span>
        <span style="font-size: 7px; color: #64748b;">DO NOT COPY</span>
      </div>
    `,
  },
  {
    id: "header-clinical",
    name: "Clinical Report",
    category: "Clinical",
    type: "header",
    plainText: "CLINICAL STUDY REPORT | Protocol: PXL-2026-001",
    contentHtml: `
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; border-bottom: 2px solid #0078d4; padding-bottom: 4px; font-family: Arial, sans-serif;">
        <span style="font-size: 9pt; font-weight: 700; color: #0078d4; letter-spacing: 0.5px;">CLINICAL STUDY REPORT</span>
       
      </div>
    `,
    previewHtml: `
      <div style="display: flex; justify-content: space-between; font-size: 8px; border-bottom: 2px solid #0078d4; padding: 3px 4px;">
        <span style="font-weight: 700; color: #0078d4;">CLINICAL REPORT</span>
       
      </div>
    `,
  },
  {
    id: "header-banded",
    name: "Banded Accent",
    category: "Built-In",
    type: "header",
    plainText: "DOCUMENT TITLE | OFFICIAL RECORD",
    contentHtml: `
      <div style="background-color: #0078d4; color: #ffffff; padding: 4px 10px; border-radius: 3px; display: flex; justify-content: space-between; align-items: center; width: 100%; font-size: 9pt; font-weight: 600;">
        <span>DOCUMENT TITLE</span>
        <span style="font-size: 8pt; opacity: 0.9;">OFFICIAL RECORD</span>
      </div>
    `,
    previewHtml: `
      <div style="background-color: #0078d4; color: #ffffff; padding: 3px 6px; border-radius: 2px; display: flex; justify-content: space-between; font-size: 8px; font-weight: 600;">
        <span>DOCUMENT TITLE</span>
        <span style="opacity: 0.85; font-size: 7px;">OFFICIAL</span>
      </div>
    `,
  },
];

export const BUILT_IN_FOOTERS: HFTemplate[] = [
  {
    id: "footer-blank",
    name: "Blank",
    category: "Built-In",
    type: "footer",
    plainText: "Document Footer",
    contentHtml: `<p style="margin: 0; font-size: 10pt; color: #64748b;">[ Type Footer Text ]</p>`,
    previewHtml: `
      <div style="font-size: 9px; color: #64748b; font-family: sans-serif; padding: 4px;">
        <span style="border-top: 1px dashed #94a3b8; padding-top: 1px;">[ Type Footer Text ]</span>
      </div>
    `,
  },
  {
    id: "footer-three-columns",
    name: "Blank (Three Columns)",
    category: "Built-In",
    type: "footer",
    plainText: "Company | Confidential | Page 1",
    contentHtml: `
      <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; font-size: 9pt; color: #64748b;">
        <span style="flex: 1; text-align: left;">Company</span>
        <span style="flex: 1; text-align: center; font-style: italic;">Confidential</span>
        <span style="flex: 1; text-align: right;">Page</span>
      </div>
    `,
    previewHtml: `
      <div style="display: flex; justify-content: space-between; font-size: 8px; color: #64748b; padding: 4px; border-top: 1px solid #e2e8f0;">
        <span>Company</span>
        <span style="font-style: italic;">Confidential</span>
        <span>Page</span>
      </div>
    `,
  },
  {
    id: "footer-simple-line",
    name: "Simple Line",
    category: "Built-In",
    type: "footer",
    plainText: "Word",
    contentHtml: `
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; border-top: 1px solid #cbd5e1; padding-top: 4px; font-size: 9pt; color: #64748b;">
        <span>Word</span>
        <span>Confidential</span>
      </div>
    `,
    previewHtml: `
      <div style="display: flex; justify-content: space-between; font-size: 8px; color: #64748b; border-top: 1px solid #cbd5e1; padding: 3px 4px;">
        <span>Word</span>
        <span>Confidential</span>
      </div>
    `,
  },
  {
    id: "footer-page-accent",
    name: "Page Number (Accent Bar)",
    category: "Built-In",
    type: "footer",
    plainText: "Author",
    contentHtml: `
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; border-top: 1px solid #e2e8f0; padding-top: 4px; font-size: 9pt; color: #64748b;">
        <span>Author</span>
        <span style="background-color: #f1f5f9; padding: 1px 8px; border-radius: 4px; font-weight: 600; color: #0078d4; border-left: 2px solid #0078d4;">Document</span>
      </div>
    `,
    previewHtml: `
      <div style="display: flex; justify-content: space-between; font-size: 8px; color: #64748b; border-top: 1px solid #e2e8f0; padding: 3px 4px;">
        <span>Author</span>
        <span style="background-color: #f1f5f9; color: #0078d4; padding: 1px 4px; border-left: 2px solid #0078d4; font-weight: 600;">Doc</span>
      </div>
    `,
  },
  {
    id: "footer-confidential",
    name: "Confidential Notice",
    category: "Corporate",
    type: "footer",
    plainText: "CONFIDENTIAL — STRICTLY FOR INTERNAL USE ONLY",
    contentHtml: `
      <div style="text-align: center; width: 100%; border-top: 1px solid #fda4af; padding-top: 4px; font-size: 8pt; color: #e11d48; font-weight: 600; letter-spacing: 0.5px;">
        CONFIDENTIAL — STRICTLY FOR INTERNAL USE ONLY
      </div>
    `,
    previewHtml: `
      <div style="text-align: center; font-size: 7.5px; color: #e11d48; font-weight: 600; border-top: 1px solid #fda4af; padding: 3px 4px;">
        CONFIDENTIAL — INTERNAL ONLY
      </div>
    `,
  },
  {
    id: "footer-clinical",
    name: "Clinical Report",
    category: "Clinical",
    type: "footer",
    plainText: "Author | Final Report | Confidential",
    contentHtml: `
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; border-top: 1.5px solid #0078d4; padding-top: 4px; font-size: 8.5pt; color: #475569; font-family: Arial, sans-serif;">
        <span style="font-weight: 600; color: #0078d4;">Author</span>
        <span>Clinical Study Report — Final</span>
        <span style="font-style: italic;">Confidential</span>
      </div>
    `,
    previewHtml: `
      <div style="display: flex; justify-content: space-between; font-size: 8px; border-top: 1.5px solid #0078d4; padding: 3px 4px;">
        <span style="font-weight: 600; color: #0078d4;">Author</span>
        <span>Final CSR</span>
        <span style="font-style: italic;">Confidential</span>
      </div>
    `,
  },
  {
    id: "footer-banded",
    name: "Banded Accent",
    category: "Built-In",
    type: "footer",
    plainText: "Company | ALL RIGHTS RESERVED",
    contentHtml: `
      <div style="background-color: #0f172a; color: #f8fafc; padding: 4px 10px; border-radius: 3px; display: flex; justify-content: space-between; align-items: center; width: 100%; font-size: 8.5pt; font-weight: 500;">
        <span>Company</span>
        <span style="opacity: 0.8; font-size: 8pt;">All Rights Reserved</span>
      </div>
    `,
    previewHtml: `
      <div style="background-color: #0f172a; color: #f8fafc; padding: 3px 6px; border-radius: 2px; display: flex; justify-content: space-between; font-size: 8px; font-weight: 500;">
        <span>Company</span>
        <span style="opacity: 0.8; font-size: 7px;">All Rights</span>
      </div>
    `,
  },
];
