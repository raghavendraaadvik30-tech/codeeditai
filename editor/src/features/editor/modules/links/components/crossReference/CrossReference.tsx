/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: CrossReference Component
 * Description:
 * Main Cross-Reference manager allowing target scanning across headings,
 * figures, tables, bookmarks, pages, and dynamic insertion.
 * --------------------------------------------------------
 */

import { useState, useEffect } from 'react';
import { RefreshCw, Plus, Check } from 'lucide-react';
import { useCrossReference } from '../../hooks/useCrossReference';

import { useEditor } from '@/features/editor/context/EditorContext';
import type { CrossReferenceTarget, CrossReferenceTargetItem } from '../../types';

export function CrossReference() {
  const { editorRef } = useEditor();
  const {
    availableTargets,
    selectedType,
    setSelectedType,
    scanTargets,
    refreshCrossReferences,
    insertCrossReference,
  } = useCrossReference();

  const [selectedTarget, setSelectedTarget] = useState<CrossReferenceTargetItem | null>(null);
  const [customLabel, setCustomLabel] = useState('');
  const [includePageNumber, setIncludePageNumber] = useState(true);

  useEffect(() => {
    if (editorRef.current) {
      scanTargets(editorRef.current, selectedType);
      refreshCrossReferences(editorRef.current);
    }
  }, [editorRef, selectedType, scanTargets, refreshCrossReferences]);

  const handleRefresh = () => {
    if (editorRef.current) {
      scanTargets(editorRef.current, selectedType);
      refreshCrossReferences(editorRef.current);
    }
  };

  const handleTypeChange = (type: CrossReferenceTarget) => {
    setSelectedType(type);
    setSelectedTarget(null);
    if (editorRef.current) {
      scanTargets(editorRef.current, type);
    }
  };

  const handleInsert = () => {
    if (!selectedTarget || !editorRef.current) return;
    insertCrossReference(editorRef.current, selectedTarget, customLabel.trim() || undefined, includePageNumber);
    setCustomLabel('');
    setSelectedTarget(null);
    refreshCrossReferences(editorRef.current);
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider dark:text-muted-foreground">
          Cross References
        </span>
        <button
          type="button"
          onClick={handleRefresh}
          title="Scan document for targets"
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-secondary-foreground dark:hover:bg-muted"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>

      {/* Insert Reference Content */}
      <div className="space-y-3 text-xs">
        {/* Reference Target Type Picker */}
        <div className="space-y-1">
          <label className="font-semibold text-secondary-foreground dark:text-muted-foreground">Reference Type</label>
          <div className="grid grid-cols-2 gap-1.5">
            {(['heading', 'figure', 'table', 'bookmark'] as CrossReferenceTarget[]).map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`h-7 px-2 text-[11px] font-semibold rounded-md border text-center truncate transition-all ${
                    selectedType === type
                      ? 'border-brand bg-brand/10 text-brand dark:border-primary'
                      : 'border-secondary bg-card text-secondary-foreground hover:bg-muted dark:border-muted dark:bg-[#091524] dark:text-muted-foreground'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              )
            )}
          </div>
        </div>

        {/* Targets List */}
        <div className="space-y-1">
          <label className="font-semibold text-secondary-foreground dark:text-muted-foreground">
            For which target ({availableTargets.length})
          </label>
          {availableTargets.length === 0 ? (
            <div className="rounded-lg border border-dashed border-secondary bg-muted p-3 text-center dark:border-muted dark:bg-[#07131E]">
              <p className="text-muted-foreground">No {selectedType} targets detected in document.</p>
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-1 rounded-lg border border-secondary bg-card p-1.5 dark:border-muted dark:bg-[#07131E]">
              {availableTargets.map((target) => {
                const isSelected = selectedTarget?.id === target.id;
                return (
                  <div
                    key={target.id}
                    onClick={() => setSelectedTarget(target)}
                    className={`flex cursor-pointer items-center justify-between rounded-md p-1.5 text-xs transition-all ${
                      isSelected
                        ? 'bg-brand text-primary-foreground font-semibold'
                        : 'hover:bg-muted text-foreground dark:text-muted-foreground dark:hover:bg-muted'
                    }`}
                  >
                    <span className="truncate">{target.title}</span>
                    {isSelected ? (
                      <Check className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      target.pageNumber && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          Pg {target.pageNumber}
                        </span>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Custom Label & Options */}
        {selectedTarget && (
          <div className="space-y-2.5 pt-1 border-t border-muted dark:border-muted">
            <div className="space-y-1">
              <label className="font-semibold text-secondary-foreground dark:text-muted-foreground">Custom Label (Optional)</label>
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder={`See ${selectedTarget.title}...`}
                className="h-7 w-full rounded-md border border-secondary bg-card px-2 text-xs outline-none dark:border-secondary-foreground dark:bg-[#07131E] dark:text-primary-foreground focus:border-brand"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="chk-pagenum"
                checked={includePageNumber}
                onChange={(e) => setIncludePageNumber(e.target.checked)}
                className="rounded border-border text-brand focus:ring-brand"
              />
              <label htmlFor="chk-pagenum" className="text-secondary-foreground dark:text-muted-foreground cursor-pointer">
                Include page number suffix
              </label>
            </div>

            <button
              type="button"
              onClick={handleInsert}
              className="w-full flex h-8 items-center justify-center gap-1.5 rounded-lg bg-brand text-xs font-semibold text-primary-foreground hover:bg-brand-deep transition-colors shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Insert Cross-Reference
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
