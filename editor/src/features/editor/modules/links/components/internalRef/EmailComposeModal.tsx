/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Email Compose Modal
 * Description:
 * Dialog modal matching the exact design for "Send Document to Email":
 * - Blue info box: "The current document will be converted to PDF and attached to the email."
 * - Recipient, Subject, and Message preview fields
 * - Attachment card showing red PDF icon, filename.pdf, "Generated from the current document content"
 * - Actions: Cancel and Send to Gmail
 * --------------------------------------------------------
 */

import { useState, useEffect } from 'react';
import { Mail, Info, Download, Send, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import type { EmailLinkData } from '../../types';
import { emailLinkService } from '../../services/EmailLinkService';

interface EmailComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: EmailLinkData;
  documentTitle?: string;
  onSentSuccess?: () => void;
}

export function EmailComposeModal({
  isOpen,
  onClose,
  data,
  documentTitle = 'Clinical Study Report',
  onSentSuccess,
}: EmailComposeModalProps) {
  const [generatedPdf, setGeneratedPdf] = useState<Blob | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEthereal, setIsEthereal] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setGeneratedPdf(null);
      setIsGeneratingPdf(false);
      setPdfError(null);
      setIsSending(false);
      setSendSuccess(false);
      setSendError(null);
      setPreviewUrl(null);
      setIsEthereal(false);
      return;
    }

    let isMounted = true;
    const generatePdf = async () => {
      setIsGeneratingPdf(true);
      setPdfError(null);
      setGeneratedPdf(null);

      try {
        const blob = await emailLinkService.generatePdfBlob(documentTitle);
        if (isMounted) {
          setGeneratedPdf(blob);
          setPdfError(null);
        }
      } catch (err) {
        if (isMounted) {
          setGeneratedPdf(null);
          setPdfError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (isMounted) {
          setIsGeneratingPdf(false);
        }
      }
    };

    generatePdf();

    return () => {
      isMounted = false;
    };
  }, [isOpen, documentTitle]);

  if (!isOpen) return null;

  const fileName = documentTitle.endsWith('.pdf') ? documentTitle : `${documentTitle}.pdf`;
  const formattedFileSize = generatedPdf
    ? `${(generatedPdf.size / 1024).toFixed(1)} KB`
    : '';

  const handleDownloadPdf = () => {
    if (generatedPdf) {
      emailLinkService.downloadPdfBlob(generatedPdf, documentTitle);
    }
  };

  const handleSendToGmail = async () => {
    if (!generatedPdf) return;

    setSendError(null);
    setIsSending(true);
    setPreviewUrl(null);
    setIsEthereal(false);

    try {
      // Auto-download the PDF in the browser first
      emailLinkService.downloadPdfBlob(generatedPdf, documentTitle);

      const result = await emailLinkService.sendGmailWithAttachment(data, generatedPdf, documentTitle);
      setSendSuccess(true);
      if (result.previewUrl) {
        setPreviewUrl(result.previewUrl);
        setIsEthereal(result.isEthereal ?? false);
      }
      if (onSentSuccess) {
        onSentSuccess();
      }
    } catch (err) {
      setSendError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSending(false);
    }
  };

  const handleSendViaMailClient = async () => {
    if (!generatedPdf) return;

    setSendError(null);
    setIsSending(true);

    try {
      emailLinkService.downloadPdfBlob(generatedPdf, documentTitle);
      emailLinkService.openMailClient(data);
      setSendSuccess(true);
      if (onSentSuccess) {
        onSentSuccess();
      }
    } catch (err) {
      setSendError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSending(false);
    }
  };

  const canSend = !!generatedPdf && !isGeneratingPdf && !isSending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg bg-white dark:bg-[#0D1A26] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1A26]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Mail className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Send Document to Email
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs bg-white dark:bg-[#0D1A26]">
          {/* Blue Info Callout Box */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50 dark:bg-[#112233] border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed font-medium">
              The current document will be converted to PDF and attached to the email.
            </p>
          </div>

          {/* Loading PDF State */}
          {isGeneratingPdf && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-blue-50 dark:bg-[#112233] border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-xs font-semibold animate-pulse">
              <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin shrink-0" />
              <span>Generating PDF from current document...</span>
            </div>
          )}

          {/* Sending State */}
          {isSending && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-blue-50 dark:bg-[#112233] border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-xs font-semibold animate-pulse">
              <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin shrink-0" />
              <span>Sending email...</span>
            </div>
          )}

          {/* Success Banner */}
          {sendSuccess && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Email sent with PDF attached — PDF also downloaded to your browser.</span>
              </div>
              {previewUrl && isEthereal && (
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 dark:bg-[#112233] dark:border-blue-800 dark:text-blue-300 text-[11px]">
                  <Mail className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span>
                    <span className="font-semibold">Test mode (no Gmail configured):</span>{' '}
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold hover:text-blue-600"
                    >
                      Click here to preview the sent email with PDF attachment ↗
                    </a>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* PDF Generation Error Banner */}
          {pdfError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300 text-xs font-medium">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>PDF Generation Error: {pdfError}</span>
            </div>
          )}

          {/* Email Send Error Banner */}
          {sendError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300 text-xs font-medium">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>Email Sending Error: {sendError}</span>
            </div>
          )}


          {/* Form Readout Fields */}
          <div className="space-y-3">
            {/* Recipient */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Recipient
              </label>
              <div className="w-full h-8 px-3 flex items-center rounded-md border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-[#111D29] text-slate-800 dark:text-slate-200 font-medium">
                {data.to}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Subject
              </label>
              <div className="w-full h-8 px-3 flex items-center rounded-md border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-[#111D29] text-slate-800 dark:text-slate-200 font-medium truncate">
                {data.subject || documentTitle}
              </div>
            </div>
          </div>

          {/* Attachment (Current Document) Card */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Attachment (Current Document)
            </label>
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#132232] hover:bg-slate-200/60 transition">
              <div className="flex items-center gap-3 min-w-0">
                {/* PDF Icon Badge */}
                <div className={`w-9 h-9 rounded-md flex items-center justify-center font-bold text-[10px] tracking-widest shrink-0 shadow-xs ${
                  pdfError ? 'bg-slate-400 text-white' : 'bg-rose-600 text-white'
                }`}>
                  PDF
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 dark:text-slate-100 truncate text-xs">
                    {fileName}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isGeneratingPdf
                      ? 'Generating PDF from document...'
                      : pdfError
                      ? 'PDF generation failed - Not ready'
                      : `Generated from current document content (${formattedFileSize})`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={!generatedPdf}
                title="Download PDF"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#182635] text-slate-700 dark:text-slate-200 text-[11px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0 shadow-2xs disabled:opacity-40"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                )}
                <span>{isGeneratingPdf ? 'Generating...' : 'PDF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0D1A26]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium text-xs disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSendViaMailClient}
            disabled={!canSend}
            className="px-3.5 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#182635] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition disabled:opacity-40"
          >
            Email Client
          </button>

          <button
            type="button"
            onClick={handleSendToGmail}
            disabled={!canSend}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 transition shadow-md active:scale-[0.99] disabled:opacity-40"
          >
            {isGeneratingPdf || isSending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : sendSuccess ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            <span>
              {isGeneratingPdf
                ? 'Generating PDF...'
                : isSending
                ? 'Sending email...'
                : sendSuccess
                ? 'Email sent successfully'
                : 'Send to Gmail'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

