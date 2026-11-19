/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Email Tab
 * Description:
 * Email tab for sending messages via Gmail:
 * - Recipient Email field
 * - Subject field
 * - Message field
 * - "Send to Gmail" button (opens Gmail Web Compose directly with filled fields)
 * --------------------------------------------------------
 */

import { useState } from 'react';
import { Mail, Send, AlertCircle, CheckCircle2, Type, FileText,ArrowRight  } from 'lucide-react';
import { buildGmailWebUri } from '../../utils/emailParser';
import { openExternal } from '@/shared/platform';

interface EmailTabProps {
  onLinkInserted?: (item: {
    displayText: string;
    target: string;
    type: 'Email';
    metadata?: Record<string, unknown>;
  }) => void;
}

export function EmailTab({ onLinkInserted }: EmailTabProps) {
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validateEmail = (): string | null => {
    const trimmed = toEmail.trim();
    if (!trimmed) return 'Please enter a recipient email address.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return 'Please enter a valid email address (e.g. user@example.com)';
    return null;
  };

  /**
   * Opens Gmail Web Compose directly with the entered Email, Subject, and Message.
   */
  const handleSendToGmail = () => {
    setError(null);
    setSuccess(null);

    const validationError = validateEmail();
    if (validationError) {
      setError(validationError);
      return;
    }

    const gmailUrl = buildGmailWebUri({
      to: toEmail.trim(),
      subject: subject.trim(),
      body: message.trim(),
    });

    void openExternal(gmailUrl);

    setSuccess('Gmail compose opened in a new tab.');

    // Optionally notify parent if link insertion callback exists
    if (onLinkInserted) {
      onLinkInserted({
        displayText: toEmail.trim(),
        target: gmailUrl,
        type: 'Email',
        metadata: {
          to: toEmail.trim(),
          subject: subject.trim(),
          body: message.trim(),
        },
      });
    }
  };

  return (
    <div className="space-y-3 pt-1 select-none">
      {/* Recipient Email */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
          Recipient Email <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="email"
            value={toEmail}
            onChange={(e) => {
              setToEmail(e.target.value);
              if (error) setError(null);
              if (success) setSuccess(null);
            }}
            placeholder="recipient@example.com"
            className="w-full h-9.5 pl-9 pr-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] dark:border-[#294564] dark:bg-[#111D29] dark:text-slate-200"
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
          Subject
        </label>
        <div className="relative">
          <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (success) setSuccess(null);
            }}
            placeholder="Enter subject..."
            className="w-full h-9.5 pl-9 pr-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] dark:border-[#294564] dark:bg-[#111D29] dark:text-slate-200"
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
          Message
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (success) setSuccess(null);
            }}
            rows={3}
            placeholder="Write your email message..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] dark:border-[#294564] dark:bg-[#111D29] dark:text-slate-200 resize-none"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs dark:bg-destructive/40 dark:border-destructive/60 dark:text-destructive/30">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-success-50 border border-success-200 text-success-700 text-xs dark:bg-success-950/40 dark:border-success-800 dark:text-success-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Send to Gmail Button */}
      
          
     

      <div className="pt-0.5">
              <button
                type="button"
                onMouseDown={(e) => {
                  // Prevent losing selection on click
                  e.preventDefault();
                }}
                onClick={handleSendToGmail}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-[#D9E8FF] hover:bg-[#C8DEFF] active:bg-[#B5D2FC] text-[#1E3A8A] text-xs font-semibold shadow-xs transition-colors cursor-pointer dark:bg-[#1E3A8A] dark:hover:bg-[#1D357A] dark:text-white"
              >
                <span>Send to Gmail</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

      {/* Helper text */}
      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        Opens Gmail in a new browser tab with recipient, subject, and message ready to send.
      </p>
    </div>
  );
}
