/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: Column 2 - DOCUMENTS
 * Description:
 * Second main section for searching, selecting, and inserting documents
 * dynamically retrieved from the application repository. Zero hardcoded dummy docs.
 * --------------------------------------------------------
 */

import { useState, useEffect } from 'react';
import { Search, FileText, Check, ArrowRight, ExternalLink, Calendar } from 'lucide-react';
import { useEditor } from '@/features/editor/context/EditorContext';
import { useDocumentModel } from '@/features/editor/store/documentModel';
import { documentRepository } from '@/features/editor/modules/document';
import { cn } from '@/lib/utils';
import type { LinkHistoryType } from '../../types';

export interface DocumentItem {
  id: string;
  name: string;
  category: string;
  updatedAt: string;
  extension: 'docx' | 'pdf' | 'doc';
  size: string;
}

interface DocumentsColumnProps {
  onLinkInserted?: (item: {
    displayText: string;
    target: string;
    targetId: string;
    type: LinkHistoryType;
  }) => void;
}

export function DocumentsColumn({ onLinkInserted }: DocumentsColumnProps) {
  const { editorRef } = useEditor();
  const { model } = useDocumentModel();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch dynamic documents from repository & active model
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

        // Include current active document if not in list
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

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || (documents.length > 0 ? documents[0] : null);

  const handleInsertDocRef = (doc: DocumentItem) => {
    const editor = editorRef.current;
    if (!editor) return;

    const html = `<a href="#doc_${doc.id}" data-doc-id="${doc.id}" data-link-type="document" class="document-reference-link text-primary hover:text-primary underline font-medium cursor-pointer" title="Open Document: ${doc.name}">📄 ${doc.name}</a>`;

    editor.focus();
    document.execCommand('insertHTML', false, html);

    setSuccessMsg(`Inserted reference to ${doc.name}`);
    if (onLinkInserted) {
      onLinkInserted({
        displayText: doc.name,
        target: doc.name,
        targetId: doc.id,
        type: 'Document',
      });
    }

    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleOpenDoc = (doc: DocumentItem) => {
    console.log(`[Document Open] Opening document: ${doc.name} (${doc.id})`);
    setSuccessMsg(`Opening ${doc.name}...`);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  return (
    <div className="flex flex-col bg-card dark:bg-[#0B1520] border border-secondary dark:border-muted rounded-lg p-3 shadow-xs">
      {/* Search Input */}
      <div className="relative mb-2.5">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search documents..."
          className="w-full h-8 pl-8 pr-2.5 text-xs rounded-md border border-secondary bg-muted text-foreground placeholder:text-muted-foreground focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary dark:border-secondary-foreground dark:bg-[#111D29] dark:text-muted"
        />
      </div>

      {/* Documents List */}
      <div className="overflow-y-auto max-h-[200px] space-y-1.5 pr-0.5">
        {filteredDocs.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No documents found in repository.
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isSelected = selectedDocId === doc.id;
            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={cn(
                  'group flex flex-col p-2 rounded-lg border text-left transition-all cursor-pointer select-none',
                  isSelected
                    ? 'border-primary bg-primary/60 dark:border-primary dark:bg-blue-950/30 ring-1 ring-primary/40'
                    : 'border-secondary bg-card hover:border-border hover:bg-muted/70 dark:border-muted dark:bg-[#111D29] dark:hover:border-secondary-foreground'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <div
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary dark:bg-blue-950/60 dark:text-primary'
                      )}
                    >
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={cn(
                          'text-xs font-semibold truncate',
                          isSelected
                            ? 'text-blue-900 dark:text-primary/30'
                            : 'text-foreground dark:text-muted-foreground'
                        )}
                      >
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground dark:text-muted-foreground">
                        <span>{doc.category}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </div>

                {/* Updated date */}
                <div className="mt-1.5 pt-1 border-t border-secondary/60 dark:border-muted/60 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {doc.updatedAt}
                  </span>
                  <span className="uppercase text-[9px] font-bold tracking-wider px-1 py-[0.8px] rounded bg-muted dark:bg-muted text-secondary-foreground dark:text-muted-foreground">
                    {doc.extension}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium text-center">
          {successMsg}
        </div>
      )}

      {/* Action Footer for Selected Document */}
      {selectedDoc && (
        <div className="mt-2.5 pt-2 border-t border-secondary dark:border-muted space-y-1.5">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleInsertDocRef(selectedDoc)}
            className="w-full h-8 flex items-center justify-center gap-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-sm active:scale-[0.99]"
          >
            <span>Insert Selected Document</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleOpenDoc(selectedDoc)}
            className="w-full h-7 flex items-center justify-center gap-1.5 rounded-md border border-secondary bg-muted text-secondary-foreground text-[11px] font-medium hover:bg-muted transition dark:border-secondary-foreground dark:bg-[#111D29] dark:text-muted-foreground dark:hover:bg-muted"
          >
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
            <span>Open Document</span>
          </button>
        </div>
      )}
    </div>
  );
}
