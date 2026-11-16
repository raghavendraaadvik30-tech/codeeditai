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
    <div className="space-y-3 pt-1 select-none">
      {/* Link Text */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
          Link Text
        </label>
        <input
          type="text"
          value={displayText}
          onChange={(e) => setDisplayText(e.target.value)}
          placeholder="Enter display text (or select text in document)"
          className="w-full h-9.5 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] dark:border-[#294564] dark:bg-[#111D29] dark:text-slate-200 transition-colors"
        />
      </div>

      {/* Web Address */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
          Web Address
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            placeholder="https://example.com"
            className="w-full h-9.5 pl-9 pr-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 placeholder:text-xs focus:outline-none focus:ring-1 focus:ring-[#2563EB] dark:border-[#294564] dark:bg-[#111D29] dark:text-slate-200 transition-colors"
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
          className="h-4 w-4 rounded border-slate-300 text-[#2563EB] accent-[#2563EB] cursor-pointer"
        />
        <label htmlFor="web-new-tab" className="text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
          Open link in new browser tab
        </label>
      </div>

      {/* Feedback Messages */}
      {error && (
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs dark:bg-destructive/40 dark:border-destructive/60 dark:text-destructive/30">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-success-50 border border-success-200 text-success-700 text-xs dark:bg-success-950/40 dark:border-success-800 dark:text-success-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Insert Button */}
      <div className="pt-0.5">
        <button
          type="button"
          onMouseDown={(e) => {
            // Prevent losing selection on click
            e.preventDefault();
          }}
          onClick={handleInsert}
          className="w-full h-10 flex items-center justify-center gap-2 rounded-xl bg-[#2A437E] hover:bg-[#203463] active:bg-[#1A2A50] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer dark:bg-[#1E3A8A] dark:hover:bg-[#1D357A]"
        >
          <span>Insert Link</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
