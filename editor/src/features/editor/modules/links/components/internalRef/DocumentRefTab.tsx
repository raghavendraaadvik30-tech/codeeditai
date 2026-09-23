/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Document Reference Tab (Inside Internal Ref)
 * Description:
 * Allows user to create a link/reference to another document dynamically loaded from repository.
 * --------------------------------------------------------
 */

import { useState, useEffect } from 'react';
import { FileText, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useEditor } from '@/features/editor/context/EditorContext';
import { useDocumentModel } from '@/features/editor/store/documentModel';
import { documentRepository } from '@/features/editor/modules/document';
import type { DocumentItem } from '../documents/DocumentsColumn';

interface DocumentRefTabProps {
  onLinkInserted?: (item: { displayText: string; target: string; targetId: string; type: 'Document' }) => void;
}

export function DocumentRefTab({ onLinkInserted }: DocumentRefTabProps) {
  const { editorRef } = useEditor();
  const { model } = useDocumentModel();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [displayText, setDisplayText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadDocs() {
      try {
        const repoDocs = await documentRepository.getAll();
        if (!mounted) return;
        const mapped: DocumentItem[] = repoDocs.map((doc) => ({
          id: doc.id,
          name: doc.title.endsWith('.docx') || doc.title.endsWith('.pdf') ? doc.title : `${doc.title}.docx`,
          category: doc.status || 'Document',
          updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : 'Recently',
          extension: doc.title.endsWith('.pdf') ? 'pdf' : 'docx',
          size: `${doc.wordCount || 500} words`,
        }));

        if (model.id && !mapped.some((d) => d.id === model.id)) {
          mapped.unshift({
            id: model.id,
            name: model.title.endsWith('.docx') ? model.title : `${model.title}.docx`,
            category: 'Active Document',
            updatedAt: 'Current',
            extension: 'docx',
            size: 'Active',
          });
        }

        setDocuments(mapped);
        if (mapped.length > 0 && !selectedDocId) {
          setSelectedDocId(mapped[0].id);
          setDisplayText(mapped[0].name);
        }
      } catch {
        if (!mounted) return;
        if (model.id) {
          const activeDocItem: DocumentItem = {
            id: model.id,
            name: model.title.endsWith('.docx') ? model.title : `${model.title}.docx`,
            category: 'Active Document',
            updatedAt: 'Current',
            extension: 'docx',
            size: 'Active',
          };
          setDocuments([activeDocItem]);
          setSelectedDocId(activeDocItem.id);
          setDisplayText(activeDocItem.name);
        } else {
          setDocuments([]);
        }
      }
    }
    loadDocs();
    return () => {
      mounted = false;
    };
  }, [model.id, model.title, selectedDocId]);

  const handleDocChange = (docId: string) => {
    setSelectedDocId(docId);
    const doc = documents.find((d) => d.id === docId);
    if (doc) {
      setDisplayText(doc.name);
    }
  };

  const selectedDoc = documents.find((d) => d.id === selectedDocId);

  const handleInsert = () => {
    setError(null);
    setSuccessMsg(null);

    const doc = selectedDoc;
    if (!doc) {
      setError('No document selected.');
      return;
    }

    const editor = editorRef.current;
    if (!editor) {
      setError('Document editor not found. Click inside the document first.');
      return;
    }

    const label = displayText.trim() || doc.name;
    const html = `<a href="#doc_${doc.id}" data-doc-id="${doc.id}" data-link-type="document" class="document-reference-link text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer" title="Open Document: ${doc.name}">📄 ${label}</a>`;

    editor.focus();
    document.execCommand('insertHTML', false, html);

    setSuccessMsg(`Inserted reference to ${doc.name}`);
    if (onLinkInserted) {
      onLinkInserted({
        displayText: label,
        target: doc.name,
        targetId: doc.id,
        type: 'Document',
      });
    }

    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-3 pt-1">
      {/* Select Document */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Select Document
        </label>
        {documents.length === 0 ? (
          <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 dark:bg-[#111D29] rounded-md border border-slate-200 dark:border-slate-800">
            No documents available in repository.
          </div>
        ) : (
          <div className="relative">
            <select
              value={selectedDocId}
              onChange={(e) => handleDocChange(e.target.value)}
              className="w-full h-8 px-2 text-xs rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-[#111D29] dark:text-slate-100"
            >
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} ({doc.category})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Link Text */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Link Text
        </label>
        <input
          type="text"
          value={displayText}
          onChange={(e) => setDisplayText(e.target.value)}
          placeholder="Display text in document"
          className="w-full h-8 px-2.5 text-xs rounded-md border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-[#111D29] dark:text-slate-100"
        />
      </div>

      {/* Document Info Pill */}
      {selectedDoc && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-slate-50 border border-slate-200 dark:bg-[#111D29] dark:border-slate-700">
          <FileText className="h-4 w-4 text-blue-600 shrink-0" />
          <div className="min-w-0 text-[11px]">
            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              {selectedDoc.name}
            </p>
            <p className="text-[10px] text-slate-500">
              Updated: {selectedDoc.updatedAt}
            </p>
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {error && (
        <div className="flex items-center gap-1.5 p-2 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[11px] dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
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
        disabled={documents.length === 0}
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleInsert}
        className="w-full h-8 flex items-center justify-center gap-1.5 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm active:scale-[0.99]"
      >
        <span>Insert Document Reference</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
