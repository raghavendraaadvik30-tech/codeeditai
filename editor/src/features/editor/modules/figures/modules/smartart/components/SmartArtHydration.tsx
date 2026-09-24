/**
 * --------------------------------------------------------
 * Module: Figures / SmartArt
 * Feature: SmartArt DOM Hydration & React Portals
 * Description:
 * Scans the editor document for `<figure class="editor-smartart-figure">`
 * elements and mounts interactive `DocumentSmartArtRenderer` instances
 * into their `.editor-smartart-mount` containers via React Portals.
 * Synchronizes edits between React state and the serialized document DOM.
 * --------------------------------------------------------
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import type { SmartArtModel } from '@/features/editor/modules/figures/modules/smartart/types';
import { useSmartArtContext } from '@/features/editor/modules/figures/modules/smartart/context';
import { DocumentSmartArtRenderer } from './DocumentSmartArtRenderer';

interface SmartArtMountInfo {
  id: string;
  figureEl: HTMLElement;
  mountEl: HTMLElement;
  smartArt: SmartArtModel;
}

export const SmartArtHydration: React.FC = () => {
  const [mounts, setMounts] = useState<SmartArtMountInfo[]>([]);
  const { setActiveSmartArt, registerSyncHandler } = useSmartArtContext();
  const mountsRef = useRef<SmartArtMountInfo[]>([]);
  mountsRef.current = mounts;

  const scanDocumentForSmartArt = useCallback(() => {
    const foundFigureEls = Array.from(
      document.querySelectorAll('.editor-smartart-figure')
    ) as HTMLElement[];

    const newMounts: SmartArtMountInfo[] = [];

    foundFigureEls.forEach((figEl) => {
      figEl.oncontextmenu = (e) => {
        e.preventDefault();
      };

      const smartArtId = figEl.getAttribute('data-smartart-id');
      const mountEl = figEl.querySelector('.editor-smartart-mount') as HTMLElement | null;
      const rawConfig = figEl.getAttribute('data-smartart-config');

      if (smartArtId && mountEl && rawConfig) {
        try {
          const smartArt: SmartArtModel = JSON.parse(decodeURIComponent(rawConfig));

          // Check if mount is already tracked by React
          const existing = mountsRef.current.find(
            (m) => m.id === smartArtId && m.mountEl === mountEl
          );

          if (!existing) {
            mountEl.innerHTML = '';
          }

          // Use the most up-to-date version
          let effectiveSmartArt = smartArt;
          if (existing?.smartArt) {
            const existingTime = new Date(existing.smartArt.updatedAt || 0).getTime();
            const domTime = new Date(smartArt.updatedAt || 0).getTime();
            if (existingTime > domTime) {
              effectiveSmartArt = existing.smartArt;
            }
          }

          newMounts.push({
            id: smartArtId,
            figureEl: figEl,
            mountEl,
            smartArt: effectiveSmartArt,
          });
        } catch (err) {
          console.error('Failed to parse SmartArt config for', smartArtId, err);
        }
      }
    });

    setMounts((prev) => {
      if (
        prev.length === newMounts.length &&
        prev.every(
          (p, i) =>
            p.id === newMounts[i].id &&
            p.mountEl === newMounts[i].mountEl &&
            (p.smartArt === newMounts[i].smartArt ||
              JSON.stringify(p.smartArt) === JSON.stringify(newMounts[i].smartArt))
        )
      ) {
        return prev;
      }
      return newMounts;
    });
  }, []);

  // Sync handler when updated from Context or Ribbon
  const handleSyncFromContext = useCallback(
    (smartArtId: string, updated: SmartArtModel | null) => {
      const mount = mountsRef.current.find((m) => m.id === smartArtId);
      if (!mount) return;

      if (updated === null) {
        // Deleted
        const editable = mount.figureEl.closest('[contenteditable="true"]');
        mount.figureEl.remove();
        if (editable) {
          editable.dispatchEvent(new Event('input', { bubbles: true }));
        }
        scanDocumentForSmartArt();
        return;
      }

      mount.smartArt = updated;
      setActiveSmartArt(updated);

      // Serialize into DOM
      const encoded = encodeURIComponent(JSON.stringify(updated));
      mount.figureEl.setAttribute('data-smartart-config', encoded);
      mount.figureEl.setAttribute('data-smartart-layout', updated.layoutId || updated.layout);
      mount.figureEl.setAttribute('data-smartart-category', updated.category);
      mount.figureEl.style.width = `${updated.width}px`;

      // Alignment style
      if (updated.alignment === 'center') {
        mount.figureEl.style.margin = '16px auto';
      } else if (updated.alignment === 'right') {
        mount.figureEl.style.margin = '16px 0 16px auto';
      } else {
        mount.figureEl.style.margin = '16px auto 16px 0';
      }

      const editable = mount.figureEl.closest('[contenteditable="true"]');
      if (editable) {
        editable.dispatchEvent(new Event('input', { bubbles: true }));
      }

      setMounts((prev) =>
        prev.map((m) => (m.id === smartArtId ? { ...m, smartArt: updated } : m))
      );
    },
    [scanDocumentForSmartArt, setActiveSmartArt]
  );

  useEffect(() => {
    const unregister = registerSyncHandler(handleSyncFromContext);
    return unregister;
  }, [registerSyncHandler, handleSyncFromContext]);

  useEffect(() => {
    scanDocumentForSmartArt();

    const observer = new MutationObserver(() => {
      scanDocumentForSmartArt();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-smartart-config', 'class'],
    });

    // Deselect SmartArt on outside click
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        !target.closest('.editor-smartart-figure') &&
        !target.closest('[role="dialog"]') &&
        !target.closest('[data-radix-popper-content-wrapper]')
      ) {
        setActiveSmartArt(null);
      }
    };

    window.addEventListener('mousedown', handleGlobalClick);

    return () => {
      observer.disconnect();
      window.removeEventListener('mousedown', handleGlobalClick);
    };
  }, [scanDocumentForSmartArt, setActiveSmartArt]);

  return (
    <>
      {mounts.map((mount) => {
        return ReactDOM.createPortal(
          <DocumentSmartArtRenderer
            smartArt={mount.smartArt}
            onUpdateSmartArt={(updated) => handleSyncFromContext(mount.id, updated)}
            onDeleteSmartArt={() => handleSyncFromContext(mount.id, null)}
          />,
          mount.mountEl,
          mount.id
        );
      })}
    </>
  );
};
