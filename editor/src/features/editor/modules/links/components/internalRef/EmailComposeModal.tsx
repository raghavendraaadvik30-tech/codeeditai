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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg bg-card dark:bg-[#0D1A26] rounded-xl shadow-2xl border border-secondary dark:border-muted overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-secondary dark:border-muted bg-card dark:bg-[#0D1A26]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 dark:bg-blue-950 text-primary dark:text-primary">
              <Mail className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-foreground dark:text-muted">
              Send Document to Email
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="p-1 rounded-md text-muted-foreground hover:text-secondary-foreground dark:hover:text-muted-foreground hover:bg-muted dark:hover:bg-muted transition disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs bg-card dark:bg-[#0D1A26]">
          {/* Blue Info Callout Box */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-primary/10 dark:bg-[#112233] border border-primary/30 dark:border-primary text-blue-900 dark:text-blue-300">
            <Info className="h-4 w-4 text-primary dark:text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed font-medium">
              The current document will be converted to PDF and attached to the email.
            </p>
          </div>

          {/* Loading PDF State */}
          {isGeneratingPdf && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-primary/10 dark:bg-[#112233] border border-primary/30 dark:border-primary text-primary dark:text-primary/30 text-xs font-semibold animate-pulse">
              <Loader2 className="h-4 w-4 text-primary dark:text-primary animate-spin shrink-0" />
              <span>Generating PDF from current document...</span>
            </div>
          )}

          {/* Sending State */}
          {isSending && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-primary/10 dark:bg-[#112233] border border-primary/30 dark:border-primary text-primary dark:text-primary/30 text-xs font-semibold animate-pulse">
              <Loader2 className="h-4 w-4 text-primary dark:text-primary animate-spin shrink-0" />
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
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/10 border border-primary/30 text-primary dark:bg-[#112233] dark:border-primary dark:text-blue-300 text-[11px]">
                  <Mail className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span>
                    <span className="font-semibold">Test mode (no Gmail configured):</span>{' '}
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-bold hover:text-primary"
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
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300 text-xs font-medium">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <span>PDF Generation Error: {pdfError}</span>
            </div>
          )}

          {/* Email Send Error Banner */}
          {sendError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300 text-xs font-medium">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <span>Email Sending Error: {sendError}</span>
            </div>
          )}


          {/* Form Readout Fields */}
          <div className="space-y-3">
            {/* Recipient */}
            <div>
              <label className="block text-[11px] font-semibold text-secondary-foreground dark:text-muted-foreground mb-1">
                Recipient
              </label>
              <div className="w-full h-8 px-3 flex items-center rounded-md border border-secondary bg-muted dark:border-secondary-foreground dark:bg-[#111D29] text-foreground dark:text-muted-foreground font-medium">
                {data.to}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[11px] font-semibold text-secondary-foreground dark:text-muted-foreground mb-1">
                Subject
              </label>
              <div className="w-full h-8 px-3 flex items-center rounded-md border border-secondary bg-muted dark:border-secondary-foreground dark:bg-[#111D29] text-foreground dark:text-muted-foreground font-medium truncate">
                {data.subject || documentTitle}
              </div>
            </div>
          </div>

          {/* Attachment (Current Document) Card */}
          <div>
            <label className="block text-[11px] font-semibold text-secondary-foreground dark:text-muted-foreground mb-1.5">
              Attachment (Current Document)
            </label>
            <div className="flex items-center justify-between p-3 rounded-lg border border-secondary dark:border-muted bg-muted dark:bg-[#132232] hover:bg-secondary/60 transition">
              <div className="flex items-center gap-3 min-w-0">
                {/* PDF Icon Badge */}
                <div className={`w-9 h-9 rounded-md flex items-center justify-center font-bold text-[10px] tracking-widest shrink-0 shadow-xs ${
                  pdfError ? 'bg-muted-foreground text-primary-foreground' : 'bg-destructive text-primary-foreground'
                }`}>
                  PDF
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-foreground dark:text-muted truncate text-xs">
                    {fileName}
                  </p>
                  <p className="text-[10px] text-muted-foreground dark:text-muted-foreground">
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
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-secondary dark:border-secondary-foreground bg-card dark:bg-[#182635] text-secondary-foreground dark:text-muted-foreground text-[11px] font-semibold hover:bg-muted dark:hover:bg-muted transition shrink-0 shadow-2xs disabled:opacity-40"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5 text-primary dark:text-primary" />
                )}
                <span>{isGeneratingPdf ? 'Generating...' : 'PDF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-secondary dark:border-muted bg-muted dark:bg-[#0D1A26]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2 rounded-md border border-secondary dark:border-secondary-foreground text-secondary-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-muted transition font-medium text-xs disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleSendViaMailClient}
            disabled={!canSend}
            className="px-3.5 py-2 rounded-md border border-border dark:border-secondary-foreground bg-card dark:bg-[#182635] text-secondary-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-muted font-semibold text-xs transition disabled:opacity-40"
          >
            Email Client
          </button>

          <button
            type="button"
            onClick={handleSendToGmail}
            disabled={!canSend}
            className="px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs flex items-center gap-2 transition shadow-md active:scale-[0.99] disabled:opacity-40"
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

