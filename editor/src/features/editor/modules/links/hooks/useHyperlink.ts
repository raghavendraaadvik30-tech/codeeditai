/**
 * --------------------------------------------------------
 * Module: Links
 * Feature: useHyperlink Hook
 * Description:
 * React hook for managing hyperlinks, inserting links at current selection,
 * editing existing anchors, scanning link lists, and validating targets.
 * --------------------------------------------------------
 */

import { useState, useCallback } from 'react';
import type { LinkModel, CreateLinkPayload, UpdateLinkPayload } from '../types';
import { hyperlinkService } from '../services/HyperlinkService';
import { validateUrl } from '../utils/validateUrl';

export function useHyperlink() {
  const [links, setLinks] = useState<LinkModel[]>([]);
  const [selectedLink, setSelectedLink] = useState<LinkModel | null>(null);

  const refreshLinks = useCallback((container: HTMLElement | null) => {
    if (!container) return [];
    const list = hyperlinkService.listHyperlinks(container);
    setLinks(list);
    return list;
  }, []);

  const insertLink = useCallback((editor: HTMLElement | null, payload: CreateLinkPayload) => {
    const success = hyperlinkService.insertHyperlink(editor, payload);
    if (success && editor) {
      const updated = hyperlinkService.listHyperlinks(editor);
      setLinks(updated);
    }
    return success;
  }, []);

  const updateLink = useCallback((anchor: HTMLAnchorElement | null, payload: UpdateLinkPayload) => {
    return hyperlinkService.updateHyperlink(anchor, payload);
  }, []);

  const removeLink = useCallback((anchor: HTMLAnchorElement | null) => {
    return hyperlinkService.removeHyperlink(anchor);
  }, []);

  return {
    links,
    selectedLink,
    setSelectedLink,
    refreshLinks,
    insertLink,
    updateLink,
    removeLink,
    validateUrl,
  };
}
