/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Bibliography Component
 * Description:
 * Generates and formats full bibliographic reference lists for document insertion.
 * --------------------------------------------------------
 */

import { useState } from 'react';
import { BookMarked, Plus } from 'lucide-react';
import { linksRepository } from '../../repository/LinksRepository';

import { useEditor } from '@/features/editor/context/EditorContext';

export function Bibliography() {
  const { editorRef } = useEditor();
  const [style, setStyle] = useState<'apa' | 'vancouver' | 'ieee'>('vancouver');

  const citations = linksRepository.loadSavedCitations();

  const generateBibliographyHtml = (): string => {
    if (citations.length === 0) return '';

    let itemsHtml = '';

    citations.forEach((c, index) => {
      const authorsStr = c.authors.join(', ');
      let itemText = '';

      if (style === 'apa') {
        itemText = `${authorsStr} (${c.year}). <em>${c.title}</em>. ${c.journal || ''}${c.doi ? ` https://doi.org/${c.doi}` : ''}`;
      } else if (style === 'ieee') {
        itemText = `[${index + 1}] ${authorsStr}, "${c.title}," <em>${c.journal || 'Journal'}</em>, ${c.year}.`;
      } else {
        // Vancouver
        itemText = `${index + 1}. ${authorsStr}. ${c.title}. ${c.journal || ''}. ${c.year};${c.doi ? ` doi:${c.doi}` : ''}`;
      }

      itemsHtml += `<li class="my-1.5 text-xs text-slate-800 leading-relaxed">${itemText}</li>`;
    });

    return `
      <div class="bibliography-section my-6 pt-4 border-t border-slate-300 dark:border-slate-700">
        <h2 class="text-xl font-bold mb-3 text-slate-900">References & Bibliography</h2>
        <ol class="list-decimal pl-6 space-y-1">
          ${itemsHtml}
        </ol>
      </div>
      <p><br/></p>
    `;
  };

  const handleInsertBibliography = () => {
    if (!editorRef.current || citations.length === 0) return;
    const html = generateBibliographyHtml();
    editorRef.current.focus();
    document.execCommand('insertHTML', false, html);
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-[#0E1A29]">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
          <BookMarked className="h-4 w-4 text-[#0078d4]" /> Bibliography Generator
        </h4>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          {citations.length} sources
        </span>
      </div>

      <div className="space-y-1">
        <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Citation Style</label>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value as 'apa' | 'vancouver' | 'ieee')}
          className="h-7 w-full rounded border border-slate-200 bg-white px-2 outline-none dark:border-slate-700 dark:bg-[#07131E] dark:text-white focus:border-[#0078d4]"
        >
          <option value="vancouver">Vancouver (Numbered, Medical Standard)</option>
          <option value="apa">APA 7th Edition (Author-Date)</option>
          <option value="ieee">IEEE (Engineering/Technical)</option>
        </select>
      </div>

      <button
        type="button"
        disabled={citations.length === 0}
        onClick={handleInsertBibliography}
        className="w-full flex h-7 items-center justify-center gap-1.5 rounded bg-[#0078d4] text-[11px] font-semibold text-white hover:bg-[#005a9e] disabled:opacity-50 transition-colors"
      >
        <Plus className="h-3 w-3" /> Insert Bibliography at Cursor
      </button>
    </div>
  );
}
