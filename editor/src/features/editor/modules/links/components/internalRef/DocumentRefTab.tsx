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
    const html = `<a href="#doc_${doc.id}" data-doc-id="${doc.id}" data-link-type="document" class="document-reference-link text-primary hover:text-primary underline font-medium cursor-pointer" title="Open Document: ${doc.name}">📄 ${label}</a>`;

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
        <label className="block text-11px font-semibold text-secondary-foreground dark:text-muted-foreground mb-1">
          Select Document
        </label>
        {documents.length === 0 ? (
          <div className="p-3 text-center text-xs text-muted-foreground bg-muted dark:bg-[#111D29] rounded-md border border-secondary dark:border-muted">
            No documents available in repository.
          </div>
        ) : (
          <div className="relative">
            <select
              value={selectedDocId}
              onChange={(e) => handleDocChange(e.target.value)}
              className="w-full h-8 px-2 text-xs rounded-md border border-secondary bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary dark:border-secondary-foreground dark:bg-[#111D29] dark:text-muted"
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
        <label className="block text-11px font-semibold text-secondary-foreground dark:text-muted-foreground mb-1">
          Link Text
        </label>
        <input
          type="text"
          value={displayText}
          onChange={(e) => setDisplayText(e.target.value)}
          placeholder="Display text in document"
          className="w-full h-8 px-2.5 text-xs rounded-md border border-secondary bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary dark:border-secondary-foreground dark:bg-[#111D29] dark:text-muted"
        />
      </div>

      {/* Document Info Pill */}
      {selectedDoc && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-muted border border-secondary dark:bg-[#111D29] dark:border-secondary-foreground">
          <FileText className="h-4 w-4 text-primary shrink-0" />
          <div className="min-w-0 text-11px">
            <p className="font-semibold text-foreground dark:text-muted-foreground truncate">
              {selectedDoc.name}
            </p>
            <p className="text-10px text-muted-foreground">
              Updated: {selectedDoc.updatedAt}
            </p>
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {error && (
        <div className="flex items-center gap-1.5 p-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-11px dark:bg-destructive/40 dark:border-destructive/60 dark:text-destructive/30">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-1.5 p-2 rounded-md bg-success-50 border border-success-200 text-success-700 text-11px dark:bg-success-950/40 dark:border-success-800 dark:text-success-300">
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
        className="w-full h-8 flex items-center justify-center gap-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm active:scale-99"
      >
        <span>Insert Document Reference</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
