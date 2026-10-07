/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Web URL Tab
 * Description:
 * Provides validated URL link insertion into the active document editor.
 * --------------------------------------------------------
 */

import { useState, useEffect, useRef } from 'react';
import { Globe, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useEditor } from '@/features/editor/context/EditorContext';
import { validateUrl } from '../../utils/validateUrl';
import { hyperlinkService } from '../../services/HyperlinkService';

interface WebUrlTabProps {

  onLinkInserted?: (item: { displayText: string; target: string; type: 'Web URL' }) => void;
}

export function WebUrlTab({ onLinkInserted }: WebUrlTabProps) {
  const { editorRef } = useEditor();
  const [displayText, setDisplayText] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [openInNewTab, setOpenInNewTab] = useState(true);

  // Saved range for maintaining editor cursor / selection
  const savedRangeRef = useRef<Range | null>(null);

  // Listen to selection in editor to pre-fill displayText if user selected text
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const editor = editorRef.current;
      if (editor && editor.contains(sel.anchorNode)) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
        const selectedText = sel.toString().trim();
        if (selectedText && !displayText) {
          setDisplayText(selectedText);
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [editorRef, displayText]);

  const handleInsert = () => {
    setError(null);
    setSuccessMsg(null);

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError('Please enter a web address (e.g. https://example.com)');
      return;
    }

    const validation = validateUrl(trimmedUrl);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid URL (e.g. https://example.com)');
      return;
    }

    const targetUrl = validation.normalizedUrl;
    const finalDisplayText = displayText.trim() || targetUrl;

    const editor =
      editorRef.current ||
      (typeof document !== 'undefined'
        ? (document.querySelector('[contenteditable="true"]:focus') as HTMLElement) ||
          (document.querySelector('section[data-page-id] [contenteditable="true"]') as HTMLElement) ||
          (document.querySelector('[contenteditable="true"]') as HTMLElement)
        : null);

    if (!editor) {
      setError('Document editor not found. Please click inside the document first.');
      return;
    }

    // Restore saved range if available
    editor.focus();
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
    }

    const success = hyperlinkService.insertHyperlink(editor, {
      type: 'external',
      displayText: finalDisplayText,
      target: targetUrl,
      openInNewTab,
    });

    if (success) {
      setSuccessMsg(`Inserted "${finalDisplayText}" successfully!`);
      if (onLinkInserted) {
        onLinkInserted({
          displayText: finalDisplayText,
          target: targetUrl,
          type: 'Web URL',
        });
      }
      // Reset
      setUrl('');
      setDisplayText('');
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setError('Failed to insert link into document.');
    }
  };

  return (
    <div className="space-y-3 pt-1">
      {/* Link Text */}
      <div>
        <label className="block text-[11px] font-semibold text-secondary-foreground dark:text-muted-foreground mb-1">
          Link Text
        </label>
        <input
          type="text"
          value={displayText}
          onChange={(e) => setDisplayText(e.target.value)}
          placeholder="Enter display text (or select text in document)"
          className="w-full h-8 px-2.5 text-xs rounded-md border border-secondary bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary dark:border-secondary-foreground dark:bg-[#111D29] dark:text-muted"
        />
      </div>

      {/* Web Address */}
      <div>
        <label className="block text-[11px] font-semibold text-secondary-foreground dark:text-muted-foreground mb-1">
          Web Address
        </label>
        <div className="relative">
          <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder="https://example.com"
            className="w-full h-8 pl-8 pr-2.5 text-xs rounded-md border border-secondary bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary dark:border-secondary-foreground dark:bg-[#111D29] dark:text-muted"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInsert();
            }}
          />
        </div>
      </div>

      {/* Open in new tab checkbox */}
      <div className="flex items-center gap-2 pt-0.5">
        <input
          type="checkbox"
          id="web-new-tab"
          checked={openInNewTab}
          onChange={(e) => setOpenInNewTab(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
        />
        <label htmlFor="web-new-tab" className="text-[11px] text-secondary-foreground dark:text-muted-foreground cursor-pointer select-none">
          Open link in new browser tab
        </label>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="flex items-center gap-1.5 p-2 rounded-md bg-destructive/10 border border-rose-200 text-destructive text-[11px] dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-1.5 p-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Insert Button */}
      <button
        type="button"
        onMouseDown={(e) => {
          // Prevent losing selection on click
          e.preventDefault();
        }}
        onClick={handleInsert}
        className="w-full h-8 flex items-center justify-center gap-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm active:scale-[0.99]"
      >
        <span>Insert Link</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
