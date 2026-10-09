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
import { getDefaultSmartArtCaption } from '../utils';
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

      figEl.onkeydown = (e) => {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable ||
            target.closest('figcaption') ||
            target.closest('.smartart-caption-inline-input'))
        ) {
          e.stopPropagation();
        }
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

          if (effectiveSmartArt) {
            effectiveSmartArt.layoutId = effectiveSmartArt.layoutId || effectiveSmartArt.layout;
            effectiveSmartArt.layout = effectiveSmartArt.layout || effectiveSmartArt.layoutId;
          }

          // Backward compatibility & fallback: ensure caption is present on SmartArt model
          let captionEl = figEl.querySelector('figcaption') as HTMLElement | null;
          if (!effectiveSmartArt.caption || !effectiveSmartArt.caption.trim()) {
            const domCaption = captionEl?.textContent?.trim();
            effectiveSmartArt.caption = domCaption || getDefaultSmartArtCaption(effectiveSmartArt);
          }

          // Ensure figcaption element exists in DOM
          if (!captionEl) {
            captionEl = document.createElement('figcaption');
            figEl.appendChild(captionEl);
          }

          // Configure figcaption attributes and styles
          captionEl.removeAttribute('contenteditable');
          captionEl.setAttribute('data-smartart-caption', 'true');
          captionEl.style.marginTop = '6px';
          captionEl.style.fontSize = '10.5pt';
          captionEl.style.fontWeight = '600';
          captionEl.style.color = '#475569';
          captionEl.style.textAlign = 'center';
          captionEl.style.fontFamily = "Calibri, 'Segoe UI', Arial, sans-serif";
          captionEl.style.outline = 'none';
          captionEl.style.borderBottom = '1px dashed transparent';
          captionEl.style.cursor = 'text';
          captionEl.style.minHeight = '1.2em';
          captionEl.style.userSelect = 'text';

          // Sync figcaption text only if user is not actively editing it
          const isActivelyEditing =
            captionEl.contains(document.activeElement) ||
            captionEl.querySelector('input') !== null;
          if (!isActivelyEditing && captionEl.textContent !== effectiveSmartArt.caption) {
            captionEl.textContent = effectiveSmartArt.caption;
          }

          // Attach interactive inline editing listeners once
          if (!(captionEl as HTMLElement & { __captionEditingAttached?: boolean }).__captionEditingAttached) {
            (captionEl as HTMLElement & { __captionEditingAttached?: boolean }).__captionEditingAttached = true;

            const enterEditMode = (clickEvent?: MouseEvent) => {
              // If already in edit mode, do nothing
              if (captionEl.querySelector('input')) return;

              const currentMount = mountsRef.current.find((m) => m.id === smartArtId);
              const baseSmartArt = currentMount?.smartArt || effectiveSmartArt;
              const currentText =
                captionEl.textContent?.trim() ||
                baseSmartArt.caption ||
                getDefaultSmartArtCaption(baseSmartArt);

              // Calculate initial character offset from click position if available
              let charOffset = currentText.length;
              if (clickEvent) {
                if (document.caretRangeFromPoint) {
                  const range = document.caretRangeFromPoint(
                    clickEvent.clientX,
                    clickEvent.clientY
                  );
                  if (range && range.startOffset !== undefined) {
                    charOffset = range.startOffset;
                  }
                } else if ((document as unknown as Document & { caretPositionFromPoint?: (x: number, y: number) => { offset: number } | null }).caretPositionFromPoint) {
                  const pos = (document as unknown as Document & { caretPositionFromPoint?: (x: number, y: number) => { offset: number } | null }).caretPositionFromPoint(
                    clickEvent.clientX,
                    clickEvent.clientY
                  );
                  if (pos && pos.offset !== undefined) {
                    charOffset = pos.offset;
                  }
                }
              }

              captionEl.innerHTML = '';

              const input = document.createElement('input');
              input.type = 'text';
              input.value = currentText;
              input.className = 'smartart-caption-inline-input';
              input.style.width = '100%';
              input.style.maxWidth = '100%';
              input.style.background = 'transparent';
              input.style.border = 'none';
              input.style.borderBottom = '1.5px solid #3b82f6';
              input.style.outline = 'none';
              input.style.fontSize = '10.5pt';
              input.style.fontWeight = '600';
              input.style.color = '#475569';
              input.style.textAlign = 'center';
              input.style.fontFamily = "Calibri, 'Segoe UI', Arial, sans-serif";
              input.style.padding = '0';
              input.style.margin = '0';
              input.style.boxSizing = 'border-box';
              input.style.cursor = 'text';

              captionEl.appendChild(input);

              let isCommitted = false;

              const commit = () => {
                if (isCommitted) return;
                isCommitted = true;

                const rawVal = input.value.trim();
                const newCaption = rawVal || currentText;

                captionEl.innerHTML = '';
                captionEl.textContent = newCaption;

                const currentM = mountsRef.current.find((m) => m.id === smartArtId);
                const smartArtToUpdate = currentM?.smartArt || baseSmartArt;

                if (newCaption !== smartArtToUpdate.caption) {
                  const updatedSmartArt: SmartArtModel = {
                    ...smartArtToUpdate,
                    caption: newCaption,
                    updatedAt: new Date().toISOString(),
                  };

                  if (currentM) {
                    currentM.smartArt = updatedSmartArt;
                  }

                  // Update data-smartart-config on the figure
                  const encoded = encodeURIComponent(JSON.stringify(updatedSmartArt));
                  figEl.setAttribute('data-smartart-config', encoded);

                  // Sync with context
                  setActiveSmartArt(updatedSmartArt);

                  // Notify document page of DOM change once on commit so auto-save/undo tracks the edit
                  const editable = figEl.closest('[contenteditable="true"]');
                  if (editable) {
                    editable.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                }
              };

              const cancel = () => {
                if (isCommitted) return;
                isCommitted = true;

                captionEl.innerHTML = '';
                captionEl.textContent = currentText;
              };

              // Keyboard handling with full insulation from outer editor
              input.addEventListener('keydown', (e) => {
                e.stopPropagation();
                if (e.key === 'Enter') {
                  e.preventDefault();
                  input.blur();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  cancel();
                }
              });

              input.addEventListener('keyup', (e) => e.stopPropagation());
              input.addEventListener('keypress', (e) => e.stopPropagation());
              input.addEventListener('beforeinput', (e) => e.stopPropagation());
              input.addEventListener('input', (e) => e.stopPropagation());

              // Prevent mouse interactions from triggering figure dragging
              input.addEventListener('pointerdown', (e) => e.stopPropagation());
              input.addEventListener('mousedown', (e) => e.stopPropagation());
              input.addEventListener('click', (e) => e.stopPropagation());
              input.addEventListener('dblclick', (e) => e.stopPropagation());
              input.addEventListener('contextmenu', (e) => e.stopPropagation());

              input.addEventListener('blur', () => {
                commit();
              });

              input.focus();
              try {
                input.setSelectionRange(charOffset, charOffset);
              } catch {
                // fallback
              }
            };

            captionEl.addEventListener('click', (e) => {
              e.stopPropagation();
              enterEditMode(e);
            });

            captionEl.addEventListener('pointerdown', (e) => {
              e.stopPropagation();
            });

            captionEl.addEventListener('mousedown', (e) => {
              e.stopPropagation();
            });
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

  const isInternalSyncRef = useRef(false);

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
      isInternalSyncRef.current = true;
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

      // Update figcaption if not actively editing
      const captionEl = mount.figureEl.querySelector('figcaption');
      if (captionEl) {
        const isActivelyEditing =
          captionEl.contains(document.activeElement) ||
          captionEl.querySelector('input') !== null;
        if (!isActivelyEditing && updated.caption && captionEl.textContent !== updated.caption) {
          captionEl.textContent = updated.caption;
        }
      }

      // Update state for React re-render without triggering external document innerHTML rewrites
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

    const observer = new MutationObserver((mutations) => {
      if (isInternalSyncRef.current) {
        isInternalSyncRef.current = false;
        return;
      }

      // Filter out internal attribute changes on known SmartArt figures and mounts
      const hasExternalChanges = mutations.some((m) => {
        const target = m.target as HTMLElement;
        if (target.closest?.('.editor-smartart-mount')) return false;
        if (target.closest?.('figcaption')) return false;
        if (target.classList?.contains('editor-smartart-figure') && m.type === 'attributes') {
          return false;
        }
        return true;
      });

      if (!hasExternalChanges) {
        return;
      }

      scanDocumentForSmartArt();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-smartart-config', 'class'],
    });

    // Deselect SmartArt on outside click and notify parent document of dirty state
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        !target.closest('.editor-smartart-figure') &&
        !target.closest('[role="dialog"]') &&
        !target.closest('[role="toolbar"]') &&
        !target.closest('[data-slot="dropdown-menu-content"]') &&
        !target.closest('[data-slot="popover-content"]') &&
        !target.closest('[role="menu"]') &&
        !target.closest('[role="listbox"]')
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
