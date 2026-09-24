import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import type { ChartModel } from '@/features/editor/modules/figures/modules/chart/types';
import { useChartContext } from '@/features/editor/modules/figures/modules/chart/context';
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
  }, []);

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
      mount.figureEl.style.width = `${updated.width}px`;

      // Update figcaption
      const captionEl = mount.figureEl.querySelector('figcaption');
      if (captionEl && updated.caption) {
        captionEl.textContent = updated.caption;
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
      {mounts.map((m) =>
        ReactDOM.createPortal(
          <DocumentChartRenderer
            key={m.id}
            chart={m.chart}
            onUpdateChart={(updated) => handleUpdateChart(m, updated)}
            onDeleteChart={() => handleDeleteChart(m)}
          />,
          m.mountEl
        )
      )}
    </>
  );
};
