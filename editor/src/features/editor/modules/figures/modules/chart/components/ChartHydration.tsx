import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import type { ChartModel } from '@/features/editor/modules/figures/modules/chart/types';
import { useChartContext } from '@/features/editor/modules/figures/modules/chart/context';
import { applyChartFigureStyles, getDefaultChartCaption } from '@/features/editor/modules/figures/modules/chart/utils';
import { DocumentChartRenderer } from './DocumentChartRenderer';

interface ChartMountInfo {
  id: string;
  figureEl: HTMLElement;
  mountEl: HTMLElement;
  chart: ChartModel;
}

export const ChartHydration: React.FC = () => {
  const [mounts, setMounts] = useState<ChartMountInfo[]>([]);
  const { setActiveChart, registerSyncHandler } = useChartContext();
  const mountsRef = useRef<ChartMountInfo[]>([]);
  mountsRef.current = mounts;

  const scanDocumentForCharts = useCallback(() => {
    const foundFigureEls = Array.from(
      document.querySelectorAll('.editor-chart-figure')
    ) as HTMLElement[];

    const newMounts: ChartMountInfo[] = [];

    foundFigureEls.forEach((figEl) => {
      figEl.oncontextmenu = (e) => {
        e.preventDefault();
      };
      const chartId = figEl.getAttribute('data-chart-id');
      const mountEl = figEl.querySelector('.editor-chart-mount') as HTMLElement | null;
      const rawConfig = figEl.getAttribute('data-chart-config');

      if (chartId && mountEl && rawConfig) {
        try {
          const chart: ChartModel = JSON.parse(decodeURIComponent(rawConfig));
          
          // Check if this mount is already tracked by React
          const existing = mountsRef.current.find(
            (m) => m.id === chartId && m.mountEl === mountEl
          );

          if (!existing) {
            // New mount element: ensure any stale static HTML is completely removed
            mountEl.innerHTML = '';
          }

          // Take the chart with the newest updatedAt timestamp between memory and DOM
          let effectiveChart = chart;
          if (existing?.chart) {
            const existingTime = new Date(existing.chart.updatedAt || 0).getTime();
            const domTime = new Date(chart.updatedAt || 0).getTime();
            if (existingTime > domTime) {
              effectiveChart = existing.chart;
            }
          }

          // Ensure figureEl styles match chart configuration
          figEl.setAttribute('data-chart-wrap', effectiveChart.wrapMode || 'inline');
          applyChartFigureStyles(figEl, effectiveChart);

          // Backward compatibility & fallback: ensure caption is present on chart model
          let captionEl = figEl.querySelector('figcaption') as HTMLElement | null;
          if (!effectiveChart.caption || !effectiveChart.caption.trim()) {
            const domCaption = captionEl?.textContent?.trim();
            effectiveChart.caption = domCaption || getDefaultChartCaption(effectiveChart.chartType);
          }

          // Ensure figcaption element exists in DOM
          if (!captionEl) {
            captionEl = document.createElement('figcaption');
            figEl.appendChild(captionEl);
          }

          // Configure figcaption attributes and styles
          captionEl.removeAttribute('contenteditable');
          captionEl.setAttribute('data-chart-caption', 'true');
          captionEl.style.marginTop = '4px';
          captionEl.style.fontSize = '10pt';
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
          const isActivelyEditing = captionEl.contains(document.activeElement) || captionEl.querySelector('input') !== null;
          if (!isActivelyEditing && captionEl.textContent !== effectiveChart.caption) {
            captionEl.textContent = effectiveChart.caption;
          }

          // Attach interactive inline editing listeners once
          if (!(captionEl as any).__captionEditingAttached) {
            (captionEl as any).__captionEditingAttached = true;

            const enterEditMode = (clickEvent?: MouseEvent) => {
              // If already in edit mode, do nothing
              if (captionEl.querySelector('input')) return;

              const currentMount = mountsRef.current.find((m) => m.id === chartId);
              const baseChart = currentMount?.chart || effectiveChart;
              const currentText = captionEl.textContent?.trim() || baseChart.caption || getDefaultChartCaption(baseChart.chartType);

              // Calculate initial character offset from click position if available
              let charOffset = currentText.length;
              if (clickEvent) {
                if (document.caretRangeFromPoint) {
                  const range = document.caretRangeFromPoint(clickEvent.clientX, clickEvent.clientY);
                  if (range && range.startOffset !== undefined) {
                    charOffset = range.startOffset;
                  }
                } else if ((document as any).caretPositionFromPoint) {
                  const pos = (document as any).caretPositionFromPoint(clickEvent.clientX, clickEvent.clientY);
                  if (pos && pos.offset !== undefined) {
                    charOffset = pos.offset;
                  }
                }
              }

              captionEl.innerHTML = '';

              const input = document.createElement('input');
              input.type = 'text';
              input.value = currentText;
              input.className = 'chart-caption-inline-input';
              input.style.width = '100%';
              input.style.maxWidth = '100%';
              input.style.background = 'transparent';
              input.style.border = 'none';
              input.style.borderBottom = '1.5px solid #3b82f6';
              input.style.outline = 'none';
              input.style.fontSize = '10pt';
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

                const currentM = mountsRef.current.find((m) => m.id === chartId);
                const chartToUpdate = currentM?.chart || baseChart;

                if (newCaption !== chartToUpdate.caption) {
                  const updatedChart: ChartModel = {
                    ...chartToUpdate,
                    caption: newCaption,
                    updatedAt: new Date().toISOString(),
                  };

                  if (currentM) {
                    currentM.chart = updatedChart;
                  }

                  // Update data-chart-config on the figure
                  const encoded = encodeURIComponent(JSON.stringify(updatedChart));
                  figEl.setAttribute('data-chart-config', encoded);

                  // Sync with context
                  setActiveChart(updatedChart);

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
            id: chartId,
            figureEl: figEl,
            mountEl,
            chart: effectiveChart,
          });
        } catch (err) {
          console.error('Failed to parse chart config for', chartId, err);
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
            p.chart === newMounts[i].chart
        )
      ) {
        return prev;
      }
      return newMounts;
    });
  }, [setActiveChart]);

  // Sync handler to update DOM attributes when changed from ribbon or context
  const handleSyncFromContext = useCallback(
    (chartId: string, updated: ChartModel | null) => {
      const mount = mountsRef.current.find((m) => m.id === chartId);
      if (!mount) return;

      if (updated === null) {
        // Deleted
        const editable = mount.figureEl.closest('[contenteditable="true"]');
        mount.figureEl.remove();
        if (editable) {
          editable.dispatchEvent(new Event('input', { bubbles: true }));
        }
        scanDocumentForCharts();
        return;
      }

      // 1. Immediately update in-memory mount ref so it is never stale
      mount.chart = updated;

      // 2. Keep activeChart in ChartContext synchronized
      setActiveChart(updated);

      // 3. Update DOM attributes on the figure element
      const encoded = encodeURIComponent(JSON.stringify(updated));
      mount.figureEl.setAttribute('data-chart-config', encoded);
      mount.figureEl.setAttribute('data-chart-type', updated.chartType);
      mount.figureEl.setAttribute('data-chart-wrap', updated.wrapMode || 'inline');
      applyChartFigureStyles(mount.figureEl, updated);

      // Update figcaption
      const captionEl = mount.figureEl.querySelector('figcaption');
      if (captionEl) {
        const isEditing = captionEl.contains(document.activeElement) || captionEl.querySelector('input') !== null;
        if (!isEditing) {
          const captionToSet = updated.caption || mount.chart?.caption || getDefaultChartCaption(updated.chartType);
          if (captionEl.textContent !== captionToSet) {
            captionEl.textContent = captionToSet;
          }
        }
      }

      const editable = mount.figureEl.closest('[contenteditable="true"]');
      if (editable) {
        editable.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // Refresh mount state to trigger React re-render of DocumentChartRenderer
      setMounts((prev) =>
        prev.map((m) => (m.id === chartId ? { ...m, chart: updated } : m))
      );
    },
    [scanDocumentForCharts, setActiveChart]
  );

  useEffect(() => {
    const unregister = registerSyncHandler(handleSyncFromContext);
    return unregister;
  }, [registerSyncHandler, handleSyncFromContext]);

  useEffect(() => {
    scanDocumentForCharts();

    const observer = new MutationObserver(() => {
      scanDocumentForCharts();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-chart-config', 'class'],
    });

    // Deselect chart when clicking on standard text or blank workspace area
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        !target.closest('.editor-chart-figure') &&
        !target.closest('.chart-editing-workspace') &&
        !target.closest('[role="dialog"]') &&
        !target.closest('[data-radix-popper-content-wrapper]') &&
        !target.closest('.border-b') // ribbon area
      ) {
        setActiveChart(null);
      }
    };

    document.addEventListener('pointerdown', handleGlobalClick);

    return () => {
      observer.disconnect();
      document.removeEventListener('pointerdown', handleGlobalClick);
    };
  }, [scanDocumentForCharts, setActiveChart]);

  const handleUpdateChart = (mount: ChartMountInfo, updated: ChartModel) => {
    handleSyncFromContext(mount.id, updated);
  };

  const handleDeleteChart = (mount: ChartMountInfo) => {
    handleSyncFromContext(mount.id, null);
  };

  return (
    <>
      <style>{`
        [data-editor-page] > p,
        [data-editor-page] > h1,
        [data-editor-page] > h2,
        [data-editor-page] > h3,
        [data-editor-page] > h4,
        [data-editor-page] > h5,
        [data-editor-page] > h6,
        [data-editor-page] > ul,
        [data-editor-page] > ol,
        [data-editor-page] > blockquote,
        [data-editor-page] > table,
        [contenteditable="true"] > p,
        [contenteditable="true"] > h1,
        [contenteditable="true"] > h2,
        [contenteditable="true"] > h3,
        [contenteditable="true"] > ul,
        [contenteditable="true"] > ol,
        [contenteditable="true"] > blockquote,
        [contenteditable="true"] > table {
          position: relative;
          z-index: 2;
          word-break: normal;
          overflow-wrap: break-word;
        }
        .editor-chart-figure {
          box-sizing: border-box;
        }
        .editor-chart-figure[data-chart-wrap="behind"] {
          z-index: 0 !important;
        }
        .editor-chart-figure[data-chart-wrap="inFront"] {
          z-index: 25 !important;
        }
        .editor-chart-figure[data-chart-wrap="square"],
        .editor-chart-figure[data-chart-wrap="tight"],
        .editor-chart-figure[data-chart-wrap="through"],
        .editor-chart-figure[data-chart-wrap="topBottom"],
        .editor-chart-figure[data-chart-wrap="inline"] {
          z-index: 10 !important;
        }
      `}</style>
      {mounts.map((m) =>
        ReactDOM.createPortal(
          <DocumentChartRenderer
            key={m.id}
            chart={m.chart}
            figureEl={m.figureEl}
            onUpdateChart={(updated) => handleUpdateChart(m, updated)}
            onDeleteChart={() => handleDeleteChart(m)}
          />,
          m.mountEl
        )
      )}
    </>
  );
};
