/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: CitationManager Component
 * Description:
 * Manages clinical study citations, DOI lookups, bibliographic entries,
 * and in-text citation markers insertion.
 * --------------------------------------------------------
 */

import { useState, useEffect } from 'react';
import { Quote, Plus, Trash2, BookOpen } from 'lucide-react';
import type { CitationItem } from '../../types';
import { linksRepository } from '../../repository/LinksRepository';
import { useEditor } from '@/features/editor/context/EditorContext';

export function CitationManager() {
  const { editorRef } = useEditor();
  const [citations, setCitations] = useState<CitationItem[]>(() => {
    return linksRepository.loadSavedCitations();
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [journal, setJournal] = useState('');
  const [doi, setDoi] = useState('');

  useEffect(() => {
    linksRepository.saveCitations(citations);
  }, [citations]);

  const handleAddCitation = () => {
    if (!title.trim() || !authors.trim()) return;

    const authorList = authors.split(',').map((a) => a.trim()).filter(Boolean);
    const key = `${authorList[0]?.split(' ').pop() || 'Ref'}_${year}`;

    const newCitation: CitationItem = {
      id: `cite_${Date.now()}`,
      key,
      title: title.trim(),
      authors: authorList,
      year: parseInt(year, 10) || new Date().getFullYear(),
      journal: journal.trim() || undefined,
      doi: doi.trim() || undefined,
    };

    setCitations((prev) => [newCitation, ...prev]);
    setTitle('');
    setAuthors('');
    setJournal('');
    setDoi('');
    setShowAddForm(false);
  };

  const handleInsertCitationMarker = (citation: CitationItem) => {
    if (!editorRef.current) return;
    const authorName = citation.authors[0] || 'Reference';
    const marker = `[${citation.authors.length > 1 ? `${authorName} et al.` : authorName}, ${citation.year}]`;

    const html = `<span data-citation-key="${citation.key}" class="citation-marker font-semibold text-[#0078d4] hover:underline cursor-pointer" title="${citation.title}">${marker}</span>`;

    editorRef.current.focus();
    document.execCommand('insertHTML', false, html);
  };

  const handleDelete = (id: string) => {
    setCitations((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
          Citations ({citations.length})
        </span>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex h-6 items-center gap-1 rounded bg-[#0078d4] px-2 text-[11px] font-semibold text-white hover:bg-[#005a9e] transition-colors"
        >
          <Plus className="h-3 w-3" /> {showAddForm ? 'Close' : 'Add Citation'}
        </button>
      </div>

      {showAddForm && (
        <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2.5 text-xs dark:border-slate-800 dark:bg-[#0E1A29]">
          <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Quote className="h-3.5 w-3.5 text-teal-500" /> New Citation
          </h4>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-600 dark:text-slate-400">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Clinical evaluation of novel oncology compound"
              className="h-7 w-full rounded border border-slate-200 bg-white px-2 outline-none dark:border-slate-700 dark:bg-[#07131E] dark:text-white focus:border-[#0078d4]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-600 dark:text-slate-400">Authors (comma separated)</label>
            <input
              type="text"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder="e.g. Smith J, Davis R, Patel K"
              className="h-7 w-full rounded border border-slate-200 bg-white px-2 outline-none dark:border-slate-700 dark:bg-[#07131E] dark:text-white focus:border-[#0078d4]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-600 dark:text-slate-400">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-7 w-full rounded border border-slate-200 bg-white px-2 outline-none dark:border-slate-700 dark:bg-[#07131E] dark:text-white focus:border-[#0078d4]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-600 dark:text-slate-400">Journal / Source</label>
              <input
                type="text"
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                placeholder="NEJM, Lancet"
                className="h-7 w-full rounded border border-slate-200 bg-white px-2 outline-none dark:border-slate-700 dark:bg-[#07131E] dark:text-white focus:border-[#0078d4]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-600 dark:text-slate-400">DOI / URL</label>
            <input
              type="text"
              value={doi}
              onChange={(e) => setDoi(e.target.value)}
              placeholder="10.1056/NEJMoa123456"
              className="h-7 w-full rounded border border-slate-200 bg-white px-2 outline-none dark:border-slate-700 dark:bg-[#07131E] dark:text-white focus:border-[#0078d4]"
            />
          </div>

          <button
            type="button"
            onClick={handleAddCitation}
            className="w-full h-7 rounded bg-teal-600 text-xs font-semibold text-white hover:bg-teal-700 transition-colors"
          >
            Save Citation
          </button>
        </div>
      )}

      {/* Citations List */}
      {citations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center dark:border-slate-800 dark:bg-[#07131E]">
          <p className="text-xs text-slate-400">No citations registered yet.</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-0.5">
          {citations.map((cite) => (
            <div
              key={cite.id}
              className="group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 text-xs transition-all hover:border-teal-300 dark:border-slate-800 dark:bg-[#091524]"
            >
              <div className="min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-1.5">
                  <Quote className="h-3 w-3 text-teal-600 shrink-0" />
                  <span className="font-semibold text-slate-900 truncate dark:text-white">
                    {cite.title}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {cite.authors.join(', ')} ({cite.year}) {cite.journal && `· ${cite.journal}`}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleInsertCitationMarker(cite)}
                  title="Insert into document"
                  className="flex h-6 items-center gap-1 rounded bg-teal-50 px-1.5 text-[10px] font-semibold text-teal-700 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-400"
                >
                  <BookOpen className="h-3 w-3" /> Insert
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cite.id)}
                  className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
