/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: useCrossReference Hook
 * Description:
 * React hook for discovering referencable document targets (headings, figures, tables,
 * numbered items, bookmarks, pages) and inserting cross-references.
 * --------------------------------------------------------
 */

import { useState, useCallback } from 'react';
import type { CrossReferenceTarget, CrossReferenceTargetItem, CrossReferenceItem } from '../types';
import { crossReferenceService } from '../services/CrossReferenceService';

export function useCrossReference() {
  const [availableTargets, setAvailableTargets] = useState<CrossReferenceTargetItem[]>([]);
  const [crossReferences, setCrossReferences] = useState<CrossReferenceItem[]>([]);
  const [selectedType, setSelectedType] = useState<CrossReferenceTarget>('heading');

  const scanTargets = useCallback((container: HTMLElement | null, type?: CrossReferenceTarget) => {
    const root = container || (typeof document !== 'undefined' ? document.body : null);
    const targets = crossReferenceService.getAutoDetectedTargets(root, type || selectedType || 'heading');
    setAvailableTargets(targets);
    return targets;
  }, [selectedType]);

  const refreshCrossReferences = useCallback((container: HTMLElement | null) => {
    const root = container || (typeof document !== 'undefined' ? document.body : null);
    const refs = crossReferenceService.listCrossReferences(root);
    setCrossReferences(refs);
    return refs;
  }, []);

  const insertCrossReference = useCallback(
    (
      editor: HTMLElement | null,
      target: CrossReferenceTargetItem,
      customLabel?: string,
      includePageNumber = true
    ) => {
      const success = crossReferenceService.insertCrossReference(editor, target, customLabel, includePageNumber);
      if (success && editor) {
        refreshCrossReferences(editor);
      }
      return success;
    },
    [refreshCrossReferences]
  );

  const navigateToTarget = useCallback((container: HTMLElement | null, targetId: string) => {
    return crossReferenceService.navigateToTarget(container, targetId);
  }, []);

  return {
    availableTargets,
    crossReferences,
    selectedType,
    setSelectedType,
    scanTargets,
    refreshCrossReferences,
    insertCrossReference,
    navigateToTarget,
  };
}
