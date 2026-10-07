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
import { Mail, Send, AlertCircle, CheckCircle2, Type, FileText } from 'lucide-react';
import { buildGmailWebUri } from '../../utils/emailParser';

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

    window.open(gmailUrl, '_blank', 'noopener,noreferrer');

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
    <div className="space-y-2.5 pt-1 select-none">
      {/* Recipient Email */}
      <div>
        <label className="block text-[11px] font-semibold text-secondary-foreground dark:text-muted-foreground mb-0.5">
          Recipient Email <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="email"
            value={toEmail}
            onChange={(e) => {
              setToEmail(e.target.value);
              if (error) setError(null);
              if (success) setSuccess(null);
            }}
            placeholder="recipient@example.com"
            className="w-full h-8 pl-8 pr-2.5 text-xs rounded-md border border-secondary bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary dark:border-secondary-foreground dark:bg-[#111D29] dark:text-muted"
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-[11px] font-semibold text-secondary-foreground dark:text-muted-foreground mb-0.5">
          Subject
        </label>
        <div className="relative">
          <Type className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (success) setSuccess(null);
            }}
            placeholder="Enter subject..."
            className="w-full h-8 pl-8 pr-2.5 text-xs rounded-md border border-secondary bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary dark:border-secondary-foreground dark:bg-[#111D29] dark:text-muted"
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-[11px] font-semibold text-secondary-foreground dark:text-muted-foreground mb-0.5">
          Message
        </label>
        <div className="relative">
          <FileText className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (success) setSuccess(null);
            }}
            rows={3}
            placeholder="Write your email message..."
            className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-md border border-secondary bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary dark:border-secondary-foreground dark:bg-[#111D29] dark:text-muted resize-none"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-1.5 p-2 rounded-md bg-destructive/10 border border-rose-200 text-destructive text-[11px] dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="flex items-center gap-1.5 p-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Send to Gmail Button */}
      <div className="pt-0.5">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleSendToGmail}
          className="w-full h-8.5 flex items-center justify-center gap-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 active:bg-primary transition shadow-sm active:scale-[0.99]"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Send to Gmail</span>
        </button>
      </div>

      {/* Helper text */}
      <p className="text-[10px] text-muted-foreground dark:text-muted-foreground leading-relaxed">
        Opens Gmail in a new browser tab with recipient, subject, and message ready to send.
      </p>
    </div>
  );
}
