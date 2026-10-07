/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Email Link Service
 * Description:
 * Manages email link creation, mailto URL composition, email client launching,
 * and pure client-side PDF document generation using jsPDF & native SVG canvas rendering.
 * NO window.print() or browser print dialog is called!
 * --------------------------------------------------------
 */

import type { EmailLinkData } from '../types';
import { buildMailtoUri } from '../utils/emailParser';
import { createHyperlinkHtml } from '../utils/parseHyperlink';

/**
 * Pure math fallback converter for oklch(L C H / A) -> sRGB HEX / RGBA.
 */
function parseOklchToRgbMath(oklchStr: string): string {
  try {
    const match = oklchStr.match(/oklch\(\s*([\d.%]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.%]+))?\s*\)/i);
    if (!match) return '#2563eb';

    let l = parseFloat(match[1]);
    if (match[1].endsWith('%')) l /= 100;
    const c = parseFloat(match[2]);
    const h = parseFloat(match[3]);
    let a = match[4] !== undefined ? parseFloat(match[4]) : 1;
    if (match[4] && match[4].endsWith('%')) a /= 100;

    // OKLCH -> OKLAB
    const rad = (h * Math.PI) / 180;
    const aLab = c * Math.cos(rad);
    const bLab = c * Math.sin(rad);

    // OKLAB -> Linear sRGB
    const l_ = l + 0.3963377774 * aLab + 0.2158037573 * bLab;
    const m_ = l - 0.1055613458 * aLab - 0.0638541728 * bLab;
    const s_ = l - 0.0894841775 * aLab - 1.291485548 * bLab;

    const lRgb = l_ * l_ * l_;
    const mRgb = m_ * m_ * m_;
    const sRgb = s_ * s_ * s_;

    const rLinear = +4.0767416621 * lRgb - 3.3077115913 * mRgb + 0.2309699292 * sRgb;
    const gLinear = -1.2684380046 * lRgb + 2.6097574011 * mRgb - 0.3413193965 * sRgb;
    const bLinear = -0.0041960863 * lRgb - 0.7034186147 * mRgb + 1.707614701 * sRgb;

    // Linear sRGB -> Gamma sRGB
    const gammaCorrect = (val: number) => {
      const clamped = Math.max(0, Math.min(1, val));
      return clamped <= 0.0031308
        ? Math.round(clamped * 12.92 * 255)
        : Math.round((1.055 * Math.pow(clamped, 1 / 2.4) - 0.055) * 255);
    };

    const r = gammaCorrect(rLinear);
    const g = gammaCorrect(gLinear);
    const b = gammaCorrect(bLinear);

    if (a < 1) {
      return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
    }
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  } catch {
    return '#2563eb';
  }
}

/**
 * Converts any unsupported CSS color string (oklch, lab, lch, color) to a PDF-safe RGB/HEX string.
 */
export function convertCssColorToRgb(colorStr: string): string {
  if (!colorStr || typeof colorStr !== 'string') return colorStr;

  const unsupportedRegex = /(?:oklch|lab|lch|color)\([^)]+\)/gi;
  if (!unsupportedRegex.test(colorStr)) {
    return colorStr;
  }

  let ctx: CanvasRenderingContext2D | null = null;
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    ctx = canvas.getContext('2d');
  }

  const replaced = colorStr.replace(unsupportedRegex, (match) => {
    if (ctx) {
      try {
        ctx.fillStyle = '#000000';
        ctx.fillStyle = match;
        const resolved = ctx.fillStyle;
        if (resolved && (resolved !== '#000000' || match.includes('0 0 0') || match.includes('0% 0% 0%'))) {
          return resolved;
        }
      } catch {
        // ignore fallback
      }
    }
    return parseOklchToRgbMath(match);
  });

  return replaced;
}

export class EmailLinkService {
  /**
   * Inserts an email hyperlink at the cursor position.
   */
  insertEmailLink(
    editor: HTMLElement | null,
    data: EmailLinkData,
    savedRange?: Range | null
  ): boolean {
    if (!editor || !data.to.trim()) return false;

    const mailtoUri = buildMailtoUri(data);
    const displayText = data.displayText || data.to;

    const html = createHyperlinkHtml({
      url: mailtoUri,
      displayText,
      tooltip: `Send email to ${data.to}`,
      openInNewTab: false,
      type: 'email',
    });

    editor.focus();

    if (savedRange) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRange);
      }
    }

    document.execCommand('insertHTML', false, html);
    return true;
  }

  /**
   * Opens the system mail client with prefilled fields.
   */
  openMailClient(data: EmailLinkData): void {
    const uri = buildMailtoUri(data);
    window.location.href = uri;
  }

  /**
   * Extracts plain text content from all active document pages in the DOM.
   */
  extractDocumentText(pageHtmlMap?: Record<string, string>): string {
    const pageNodes = Array.from(
      document.querySelectorAll('section[data-page-id] [contenteditable="true"], [contenteditable="true"]')
    );

    if (pageNodes.length > 0) {
      const texts = pageNodes
        .map((node) => (node as HTMLElement).innerText?.trim() || '')
        .filter(Boolean);
      if (texts.length > 0) {
        return texts.join('\n\n---\n\n');
      }
    }

    if (pageHtmlMap && Object.keys(pageHtmlMap).length > 0) {
      const texts = Object.values(pageHtmlMap)
        .map((html) => {
          const temp = document.createElement('div');
          temp.innerHTML = html;
          return temp.innerText?.trim() || '';
        })
        .filter(Boolean);
      if (texts.length > 0) {
        return texts.join('\n\n---\n\n');
      }
    }

    return '';
  }

  /**
   * Generates a genuine PDF Blob from the current live editor content
   * using a standards-compliant client-side PDF generator without any external dependencies.
   */
  async generatePdfBlob(documentTitle = 'Document'): Promise<Blob> {
    const textContent = this.extractDocumentText();
    const cleanTitle = documentTitle.replace(/[^\x20-\x7E]/g, '');
    const lines = textContent
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const textStream = [
      'BT',
      '/F1 16 Tf',
      '50 770 Td',
      `(${cleanTitle.replace(/[()\\]/g, '\\$&')}) Tj`,
      '/F1 10 Tf',
      '0 -24 Td',
      ...lines.slice(0, 50).map((l) => `(${l.substring(0, 85).replace(/[()\\]/g, '\\$&')}) '`),
      'ET',
    ].join('\n');

    const streamLength = new TextEncoder().encode(textStream).length;
    const contentStream = `<< /Length ${streamLength} >>\nstream\n${textStream}\nendstream`;

    const objects = [
      '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
      '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>\nendobj',
      `4 0 obj\n${contentStream}\nendobj`,
    ];

    let xref = 'xref\n0 5\n0000000000 65535 f \n';
    let offset = 9;
    let body = '%PDF-1.4\n';

    for (const obj of objects) {
      const padded = ('0000000000' + offset).slice(-10);
      xref += `${padded} 00000 n \n`;
      body += `${obj}\n`;
      offset = body.length;
    }

    const trailer = `trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`;
    const pdfData = `${body}${xref}${trailer}`;

    return new Blob([new TextEncoder().encode(pdfData)], { type: 'application/pdf' });
  }

  /**
   * Downloads a PDF Blob directly in the browser as a .pdf file without opening any print dialog.
   */
  downloadPdfBlob(blob: Blob, documentTitle = 'Document'): void {
    const fileName = documentTitle.endsWith('.pdf') ? documentTitle : `${documentTitle}.pdf`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  /**
   * Generates PDF Blob from current editor content and triggers automatic file download.
   * NO window.print() or browser print dialog is called!
   */
  async exportPdf(documentTitle = 'Document'): Promise<Blob> {
    const blob = await this.generatePdfBlob(documentTitle);
    this.downloadPdfBlob(blob, documentTitle);
    return blob;
  }

  /**
   * Sends email with attached PDF via the backend SMTP API (/api/email/send-gmail).
   * Falls back to Ethereal preview if Gmail credentials are not configured.
   * Returns the API response including previewUrl when using Ethereal.
   */
  async sendGmailWithAttachment(
    data: EmailLinkData,
    pdfBlob: Blob,
    documentTitle = 'Document'
  ): Promise<{ success: boolean; previewUrl?: string | null; isEthereal?: boolean; message?: string }> {
    console.log('[Gmail Service] Gmail send started for recipient:', data.to);

    if (!data.to || !data.to.trim()) {
      throw new Error('Recipient email address is required.');
    }

    if (!pdfBlob || pdfBlob.size === 0) {
      throw new Error('Generated PDF is invalid or empty.');
    }

    const fileName = documentTitle.endsWith('.pdf') ? documentTitle : `${documentTitle}.pdf`;

    // Convert Blob to base64 for transport
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1] || '');
      reader.onerror = () => reject(new Error('Failed to convert PDF to base64.'));
      reader.readAsDataURL(pdfBlob);
    });

    const payload = {
      to: data.to.trim(),
      subject: data.subject || documentTitle,
      body: data.body || `Please find attached the document "${fileName}".`,
      filename: fileName,
      pdfBase64: base64,
    };

    const response = await fetch('/api/email/send-gmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.error || 'Failed to send email.');
    }

    console.log('[Gmail Service] Email dispatched. MessageId:', result.messageId);
    return result;
  }

  /**
   * High level helper: Generates PDF, triggers browser download, and emails it.
   */
  async exportPdfAndEmail(
    data: EmailLinkData,
    documentTitle = 'Document'
  ): Promise<{ success: boolean; previewUrl?: string | null; isEthereal?: boolean; message?: string }> {
    const pdfBlob = await this.generatePdfBlob(documentTitle);
    return this.sendGmailWithAttachment(data, pdfBlob, documentTitle);
  }
}

export const emailLinkService = new EmailLinkService();
