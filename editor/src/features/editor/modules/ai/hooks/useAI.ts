import { useState, useRef, useEffect, useCallback } from 'react';
import { useEditor } from '../../../context/EditorContext';
import { sendMessageWithTools } from '../api/aiApi';
import { AIRepository } from '../repository/aiRepository';
import type { ChatMessage } from '../repository/aiRepository';
import {
  executeToolCall,
  extractImageUrlFromText,
  buildImageFromUrl,
} from '../services/aiService';

export const AI_CHAT_SEND_EVENT = 'ai-chat-send';

const uid = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export function useAI() {
  const {
    insertHTML,
    applyBlockStyle,
    applyFormatCommand,
    exec,
    applyFontSize,
    applyFontFamily,
    restoreEditorSelection,
  } = useEditor();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return AIRepository.getHistory();
  });

  const [loading, setLoading] = useState<boolean>(false);
  const lastDocSelectionRef = useRef<string>('');

  useEffect(() => {
    AIRepository.saveHistory(messages);
  }, [messages]);

  const getSavedSelectionText = useCallback(() => {
    try {
      const sel = window.getSelection();
      const text = sel ? sel.toString().trim() : '';
      if (text) {
        lastDocSelectionRef.current = text;
      }
      return text || lastDocSelectionRef.current || '';
    } catch {
      return lastDocSelectionRef.current || '';
    }
  }, []);

  const replaceSelectedText = useCallback((text: string) => {
    try {
      if (restoreEditorSelection) restoreEditorSelection();
      if (/<[a-z][\s\S]*>/i.test(text)) {
        insertHTML(text);
      } else {
        const success = window.document.execCommand('insertText', false, text);
        if (!success) {
          insertHTML(text);
        }
      }
    } catch {
      insertHTML(text);
    }
  }, [restoreEditorSelection, insertHTML]);

  const sendPrompt = useCallback(
    async (prompt: string, displayLabel?: string) => {
      if (!prompt.trim() || loading) return;

      const userMsg: ChatMessage = { id: uid(), role: 'user', text: displayLabel || prompt };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      const preservedSelection = getSavedSelectionText();

      // Check for explicit image URL
      const directUrl = extractImageUrlFromText(prompt);
      const isDirectImageRequest =
        directUrl &&
        (/^\s*(add|insert|embed|put|place|include|show|use|load|image|pic|photo|figure)\b/i.test(
          prompt
        ) ||
          /\b(this|image|picture|photo|figure|pic|url)\b/i.test(prompt) ||
          prompt.trim() === directUrl);

      if (isDirectImageRequest && directUrl) {
        try {
          const html = buildImageFromUrl(directUrl, 'Image');
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              role: 'tool',
              text: `✅ Direct image URL detected. Ready to insert.`,
              preview: { html, label: `Image: ${directUrl}` },
            },
          ]);
        } catch (err: unknown) {
          setMessages((prev) => [
            ...prev,
            {
              id: uid(),
              role: 'error',
              text: err instanceof Error ? err.message : 'Error occurred',
            },
          ]);
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        const response = await sendMessageWithTools(prompt, preservedSelection);
        if (response.kind === 'tool') {
          const result = await executeToolCall(
            response.call,
            {
              insertHTML,
              replaceSelectedText,
              insertOnNewPage: (h) => insertHTML(`<div style="page-break-before:always"></div>${h}`),
              deleteLastTable: () => {
                const docEl = window.document.querySelector('.prose-doc, [contenteditable]');
                const tbl = docEl?.querySelector('table');
                if (tbl) tbl.remove();
              },
              addTableData: () => { },
              modifyTableStructure: () => { },
              deletePage: () => { },
              insertSectionBreak: () => insertHTML('<hr class="section-break" />'),
              addBookmark: (name) =>
                insertHTML(
                  `<a id="bm-${name}" data-bookmark="${name}" style="background:#fff59d;padding:0 2px">🔖 ${name}</a>&nbsp;`
                ),
              findText: () => { },
              applyStyle: (style) => {
                if (['h1', 'h2', 'h3', 'h4', 'blockquote', 'p'].includes(style.toLowerCase())) {
                  applyBlockStyle(style.toLowerCase());
                } else {
                  window.document.execCommand('formatBlock', false, `<${style}>`);
                }
              },
              changeCase: (mode) => {
                const sel = window.getSelection()?.toString() || '';
                const converted =
                  mode === 'upper'
                    ? sel.toUpperCase()
                    : mode === 'lower'
                      ? sel.toLowerCase()
                      : mode === 'title'
                        ? sel.replace(/\b\w/g, (c) => c.toUpperCase())
                        : sel;
                window.document.execCommand('insertText', false, converted);
              },
              applyFormat: (fmt) => {
                if (['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript'].includes(fmt)) {
                  applyFormatCommand(fmt);
                } else {
                  exec(fmt);
                }
              },
              alignText: (align) => {
                const cmd =
                  align === 'center'
                    ? 'justifyCenter'
                    : align === 'right'
                      ? 'justifyRight'
                      : align === 'justify'
                        ? 'justifyFull'
                        : 'justifyLeft';
                applyFormatCommand(cmd);
              },
              changeFont: (font) => applyFontFamily(font),
              changeFontSize: (sz) => applyFontSize(sz),
              insertSymbol: (sym) => insertHTML(sym),
              changeOrientation: () => { },
              setMargins: () => { },
              insertCitation: (src) =>
                insertHTML(`<sup style="color:#2563eb;font-weight:600">[${src}]</sup>`),
              insertFigureTemplate: (fig) =>
                insertHTML(
                  `<figure style="margin:12px 0;border:1px solid #d6dbe5;border-radius:6px;overflow:hidden;background:#eef2f9"><div style="aspect-ratio:16/9;display:grid;place-items:center;color:#6b7a99">[ ${fig} ]</div><figcaption style="padding:6px 10px;font-size:10pt;font-style:italic">Figure — ${fig}</figcaption></figure><p>&nbsp;</p>`
                ),
              insertInternalRef: () =>
                insertHTML(`<a href="#section" style="color:#2563eb">[internal ref]</a>&nbsp;`),
              insertCrossRef: (target) =>
                insertHTML(`<span style="color:#2563eb">[see ${target}]</span>&nbsp;`),
              insertAppendix: (app) =>
                insertHTML(`<h2 style="font-size:16pt;font-weight:700">Appendix ${app}</h2><p>&nbsp;</p>`),
              loadTemplate: () => { },
              saveDocument: () => { },
              saveDocumentAs: () => { },
              exportPDF: () => window.print(),
              exportDOCX: () => { },
              toggleTrackChanges: () => { },
              resizeImage: () => { },
              removeImage: () => {
                const img = window.document.querySelector('.prose-doc img, [contenteditable] img');
                if (img) (img.closest('[data-ai-image], figure') || img).remove();
              },
            },
            preservedSelection
          );

          if (result && 'preview' in result && result.preview) {
            setMessages((prev) => [
              ...prev,
              { id: uid(), role: 'tool', text: response.confirmText, preview: result.preview },
            ]);
          } else {
            setMessages((prev) => [...prev, { id: uid(), role: 'tool', text: response.confirmText }]);
          }
        } else {
          setMessages((prev) => [...prev, { id: uid(), role: 'ai', text: response.text }]);
        }
      } catch (err: unknown) {
        setMessages((prev) => [
          ...prev,
          { id: uid(), role: 'error', text: err instanceof Error ? err.message : 'Error occurred' },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [
      getSavedSelectionText,
      insertHTML,
      loading,
      replaceSelectedText,
      applyBlockStyle,
      applyFormatCommand,
      applyFontFamily,
      applyFontSize,
      exec,
    ]
  );

  const insertPreview = useCallback(
    (msgId: string | number, html: string) => {
      insertHTML(html);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, preview: undefined, text: '✅ Inserted into document.' } : m
        )
      );
    },
    [insertHTML]
  );

  const cancelPreview = useCallback((msgId: string | number) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId ? { ...m, preview: undefined, text: '❌ Insertion cancelled.' } : m
      )
    );
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    AIRepository.clearHistory();
  }, []);

  return {
    messages,
    loading,
    sendPrompt,
    insertPreview,
    cancelPreview,
    clearChat,
  };
}

