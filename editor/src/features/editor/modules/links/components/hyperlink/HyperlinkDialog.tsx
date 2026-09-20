/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: HyperlinkDialog Component
 * Description:
 * Dialog for inserting and editing web links, internal document anchors,
 * and email links with mailto and PDF export options.
 * --------------------------------------------------------
 */

import { useState, useEffect } from 'react';
import { Globe, Mail, Bookmark, ExternalLink, ShieldCheck, AlertCircle, FileDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { LinkButton } from '../common/LinkButton';
import { validateUrl } from '../../utils/validateUrl';
import { emailLinkService } from '../../services/EmailLinkService';
import type { CreateLinkPayload, EmailLinkData, LinkType } from '../../types';

export interface HyperlinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType?: LinkType;
  initialTarget?: string;
  initialDisplayText?: string;
  availableBookmarks?: { id: string; name: string }[];
  onSave: (payload: CreateLinkPayload) => void;
}

export function HyperlinkDialog({
  open,
  onOpenChange,
  initialType = 'external',
  initialTarget = '',
  initialDisplayText = '',
  availableBookmarks = [],
  onSave,
}: HyperlinkDialogProps) {
  const [activeTab, setActiveTab] = useState<LinkType>(initialType);
  const [displayText, setDisplayText] = useState(initialDisplayText);
  const [url, setUrl] = useState(initialTarget);
  const [tooltip, setTooltip] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(true);

  // Email specific state
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Validation
  const [urlValidation, setUrlValidation] = useState(validateUrl(initialTarget));

  useEffect(() => {
    setActiveTab(initialType);
    setDisplayText(initialDisplayText);
    setUrl(initialTarget);
    setUrlValidation(validateUrl(initialTarget));
  }, [initialType, initialTarget, initialDisplayText, open]);

  const handleUrlChange = (val: string) => {
    setUrl(val);
    setUrlValidation(validateUrl(val));
    if (!displayText || displayText === url) {
      setDisplayText(val);
    }
  };

  const handleSave = () => {
    if (activeTab === 'email') {
      if (!emailTo.trim()) return;
      const emailData: EmailLinkData = {
        to: emailTo.trim(),
        subject: emailSubject.trim(),
        body: emailBody.trim(),
        displayText: displayText.trim() || emailTo.trim(),
      };
      emailLinkService.insertEmailLink(document.querySelector('.editor-canvas, [contenteditable="true"]'), emailData);
      onOpenChange(false);
      return;
    }

    const finalTarget = activeTab === 'bookmark' || activeTab === 'internal' ? (url.startsWith('#') ? url : `#${url}`) : url;

    onSave({
      type: activeTab,
      displayText: displayText.trim() || finalTarget,
      target: finalTarget,
      tooltip: tooltip.trim() || undefined,
      openInNewTab: activeTab === 'external' ? openInNewTab : false,
    });

    onOpenChange(false);
  };

  const handleDirectSendEmail = () => {
    if (!emailTo.trim()) return;
    emailLinkService.openMailClient({
      to: emailTo.trim(),
      subject: emailSubject.trim(),
      body: emailBody.trim(),
    });
  };

  const handlePdfAndEmail = () => {
    if (!emailTo.trim()) return;
    emailLinkService.exportPdfAndEmail({
      to: emailTo.trim(),
      subject: emailSubject.trim(),
      body: emailBody.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white dark:bg-[#0E1A29] border border-slate-200 dark:border-slate-800 p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-4 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#0078d4]" />
            Insert Hyperlink
          </DialogTitle>
        </DialogHeader>

        {/* TAB BUTTONS */}
        <div className="flex border-b border-slate-200/80 bg-slate-50/70 p-1.5 gap-1 dark:border-slate-800 dark:bg-[#07131E]">
          <button
            type="button"
            onClick={() => setActiveTab('external')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'external'
                ? 'bg-white text-[#0078d4] shadow-sm dark:bg-[#0E1A29] dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            Web URL
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('internal')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'internal' || activeTab === 'bookmark'
                ? 'bg-white text-[#0078d4] shadow-sm dark:bg-[#0E1A29] dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            This Document
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'email'
                ? 'bg-white text-[#0078d4] shadow-sm dark:bg-[#0E1A29] dark:text-blue-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            Email
          </button>
        </div>

        {/* DIALOG BODY */}
        <div className="p-4 space-y-3.5 text-xs">
          {/* DISPLAY TEXT */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Text to Display</label>
            <input
              type="text"
              value={displayText}
              onChange={(e) => setDisplayText(e.target.value)}
              placeholder="e.g. Clinical Study Results"
              className="h-8 w-full rounded-md border border-slate-200 bg-white px-3 outline-none dark:border-slate-700 dark:bg-[#07131E] dark:text-white focus:border-[#0078d4]"
            />
          </div>

          {/* TAB: EXTERNAL WEB URL */}
          {activeTab === 'external' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Target URL</label>
                <div className="relative">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://example.com/report.pdf"
                    className="h-8 w-full rounded-md border border-slate-200 bg-white px-3 pr-8 outline-none dark:border-slate-700 dark:bg-[#07131E] dark:text-white focus:border-[#0078d4]"
                  />
                  <ExternalLink className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
                {url && (
                  <div className="pt-1">
                    {urlValidation.isValid ? (
                      <p className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="h-3 w-3" /> Valid {urlValidation.isSecure ? 'Secure HTTPS' : 'HTTP'} link
                      </p>
                    ) : (
                      <p className="flex items-center gap-1 text-[11px] text-red-500">
                        <AlertCircle className="h-3 w-3" /> {urlValidation.error}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-newtab"
                  checked={openInNewTab}
                  onChange={(e) => setOpenInNewTab(e.target.checked)}
                  className="rounded border-slate-300 text-[#0078d4] focus:ring-[#0078d4]"
                />
                <label htmlFor="chk-newtab" className="text-slate-600 dark:text-slate-400 cursor-pointer">
                  Open link in new browser tab
                </label>
              </div>
            </div>
          )}

          {/* TAB: INTERNAL DOCUMENT LINK */}
          {(activeTab === 'internal' || activeTab === 'bookmark') && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Select Document Target</label>
                {availableBookmarks.length > 0 ? (
                  <select
                    value={url.replace(/^#/, '')}
                    onChange={(e) => setUrl(`#${e.target.value}`)}
                    className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 outline-none dark:border-slate-700 dark:bg-[#07131E] dark:text-white focus:border-[#0078d4]"
                  >
                    <option value="">-- Choose a bookmark --</option>
                    {availableBookmarks.map((bm) => (
                      <option key={bm.id} value={bm.id}>
                        🔖 {bm.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-[#07131E]">
                    <p className="text-slate-500 dark:text-slate-400">No bookmarks defined in document yet.</p>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Or Custom Target Anchor ID</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="#section-2"
                  className="h-8 w-full rounded-md border border-slate-200 bg-white px-3 outline-none dark:border-slate-700 dark:bg-[#07131E] dark:text-white focus:border-[#0078d4]"
                />
              </div>
            </div>
          )}

          {/* TAB: EMAIL */}
          {activeTab === 'email' && (
            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Recipient Email Address</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="author@parexel.com"
                  className="h-8 w-full rounded-md border border-slate-200 bg-white px-3 outline-none dark:border-slate-700 dark:bg-[#07131E] dark:text-white focus:border-[#0078d4]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Review CSR Document"
                  className="h-8 w-full rounded-md border border-slate-200 bg-white px-3 outline-none dark:border-slate-700 dark:bg-[#07131E] dark:text-white focus:border-[#0078d4]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Message / Body</label>
                <textarea
                  rows={2}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Please review the attached clinical study section..."
                  className="w-full rounded-md border border-slate-200 bg-white p-2 outline-none dark:border-slate-700 dark:bg-[#07131E] dark:text-white focus:border-[#0078d4]"
                />
              </div>

              {/* Extra Email Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDirectSendEmail}
                  className="flex-1 flex items-center justify-center gap-1.5 h-7 rounded border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-[#111D29] dark:text-slate-300"
                >
                  <Mail className="h-3 w-3" /> Open Email Client
                </button>
                <button
                  type="button"
                  onClick={handlePdfAndEmail}
                  className="flex-1 flex items-center justify-center gap-1.5 h-7 rounded border border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-[#111D29] dark:text-slate-300"
                >
                  <FileDown className="h-3 w-3" /> PDF + Email
                </button>
              </div>
            </div>
          )}

          {/* TOOLTIP / SCREEN TIP */}
          <div className="space-y-1 pt-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Tooltip / ScreenTip (Optional)</label>
            <input
              type="text"
              value={tooltip}
              onChange={(e) => setTooltip(e.target.value)}
              placeholder="Hint shown on hover"
              className="h-8 w-full rounded-md border border-slate-200 bg-white px-3 outline-none dark:border-slate-700 dark:bg-[#07131E] dark:text-white focus:border-[#0078d4]"
            />
          </div>
        </div>

        <DialogFooter className="p-3 border-t border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-[#07131E] flex items-center justify-end gap-2">
          <LinkButton variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </LinkButton>
          <LinkButton variant="primary" size="sm" onClick={handleSave}>
            Insert Link
          </LinkButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
