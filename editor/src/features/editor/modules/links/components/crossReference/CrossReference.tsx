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
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
          Cross References
        </span>
        <button
          type="button"
          onClick={handleRefresh}
          title="Scan document for targets"
          className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>

      {/* Insert Reference Content */}
      <div className="space-y-3 text-xs">
        {/* Reference Target Type Picker */}
        <div className="space-y-1">
          <label className="font-semibold text-slate-700 dark:text-slate-300">Reference Type</label>
          <div className="grid grid-cols-2 gap-1.5">
            {(['heading', 'figure', 'table', 'bookmark'] as CrossReferenceTarget[]).map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`h-7 px-2 text-[11px] font-semibold rounded-md border text-center truncate transition-all ${
                    selectedType === type
                      ? 'border-[#0078d4] bg-[#0078d4]/10 text-[#0078d4] dark:border-blue-500'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#091524] dark:text-slate-300'
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
          <label className="font-semibold text-slate-700 dark:text-slate-300">
            For which target ({availableTargets.length})
          </label>
          {availableTargets.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-[#07131E]">
              <p className="text-slate-400">No {selectedType} targets detected in document.</p>
            </div>
          ) : (
            <div className="max-h-[160px] overflow-y-auto space-y-1 rounded-lg border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-[#07131E]">
              {availableTargets.map((target) => {
                const isSelected = selectedTarget?.id === target.id;
                return (
                  <div
                    key={target.id}
                    onClick={() => setSelectedTarget(target)}
                    className={`flex cursor-pointer items-center justify-between rounded-md p-1.5 text-xs transition-all ${
                      isSelected
                        ? 'bg-[#0078d4] text-white font-semibold'
                        : 'hover:bg-slate-100 text-slate-800 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{target.title}</span>
                    {isSelected ? (
                      <Check className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      target.pageNumber && (
                        <span className="text-[10px] text-slate-400 shrink-0">
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
          <div className="space-y-2.5 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Custom Label (Optional)</label>
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder={`See ${selectedTarget.title}...`}
                className="h-7 w-full rounded-md border border-slate-200 bg-white px-2 text-xs outline-none dark:border-slate-700 dark:bg-[#07131E] dark:text-white focus:border-[#0078d4]"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="chk-pagenum"
                checked={includePageNumber}
                onChange={(e) => setIncludePageNumber(e.target.checked)}
                className="rounded border-slate-300 text-[#0078d4] focus:ring-[#0078d4]"
              />
              <label htmlFor="chk-pagenum" className="text-slate-600 dark:text-slate-400 cursor-pointer">
                Include page number suffix
              </label>
            </div>

            <button
              type="button"
              onClick={handleInsert}
              className="w-full flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#0078d4] text-xs font-semibold text-white hover:bg-[#005a9e] transition-colors shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Insert Cross-Reference
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
