import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from 'recharts';
import { Anchor } from 'lucide-react';
import type { ChartModel } from '@/features/editor/modules/figures/modules/chart/types';
import { COLOR_SCHEMES } from '@/features/editor/modules/figures/modules/chart/constants';
import { getWorkspaceScale, applyChartFigureStyles } from '@/features/editor/modules/figures/modules/chart/utils';
import { useChartContext } from '@/features/editor/modules/figures/modules/chart/context';
import { ChartSpreadsheetEditor } from './ChartSpreadsheetEditor';
import { ChartContextMenu } from './ChartContextMenu';
import { ChangeChartColorModal } from './ChangeChartColorModal';
import { ChartStyleModal } from './ChartStyleModal';
import { SelectDataModal } from './SelectDataModal';
import { ChartLayoutOptions } from './ChartLayoutOptions';

interface DocumentChartRendererProps {
  chart: ChartModel;
  figureEl?: HTMLElement;
  onUpdateChart: (updated: ChartModel) => void;
  onDeleteChart: () => void;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export const DocumentChartRenderer: React.FC<DocumentChartRendererProps> = ({
  chart,
  figureEl: propFigureEl,
  onUpdateChart,
  onDeleteChart,
}) => {
  const {
    activeChartId,
    setActiveChart,
    isSpreadsheetOpen,
    setIsSpreadsheetOpen,
    setIsChangeTypeModalOpen,
    isSelectDataModalOpen,
    setIsSelectDataModalOpen,
    isColorModalOpen,
    setIsColorModalOpen,
    isStyleModalOpen,
    setIsStyleModalOpen,
    changeColorScheme,
    changeChartStyle,
    switchRowColumn,
    refreshActiveChart,
  } = useChartContext();

  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [isLayoutOptionsOpen, setIsLayoutOptionsOpen] = useState(false);

  // Position and dimension state synchronized with chart model
  const [x, setX] = useState<number>(chart.position?.x || 0);
  const [y, setY] = useState<number>(chart.position?.y || 0);
  const [width, setWidth] = useState<number>(chart.width || 560);
  const [height, setHeight] = useState<number>(chart.height || 340);

  const containerRef = useRef<HTMLDivElement>(null);
  const layoutButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeChartId !== chart.id) {
      setIsLayoutOptionsOpen(false);
    }
  }, [activeChartId, chart.id]);

  const getFigureElement = (): HTMLElement | null => {
    return propFigureEl || containerRef.current?.closest('.editor-chart-figure') || null;
  };

  // Sync state if chart prop updates
  useEffect(() => {
    if (chart.position) {
      setX(chart.position.x || 0);
      setY(chart.position.y || 0);
    }
  }, [chart.position?.x, chart.position?.y]);

  useEffect(() => {
    if (chart.width) setWidth(chart.width);
    if (chart.height) setHeight(chart.height);
  }, [chart.width, chart.height]);

  // Synchronize figure element styles (position, transform, dimensions, layout mode)
  useEffect(() => {
    const el = getFigureElement();
    if (!el) return;
    applyChartFigureStyles(el, {
      ...chart,
      width,
      height,
      position: { x, y },
    });
  }, [width, height, x, y, chart.wrapMode, chart.alignment, chart.positionMode, propFigureEl]);

  const isSelected = activeChartId === chart.id;
  const isEditingThisChart = isSpreadsheetOpen && isSelected;

  // Derive Recharts dataset from categories & series
  const rechartsData = useMemo(() => {
    return chart.categories.map((cat, catIdx) => {
      const row: Record<string, string | number | null> = { category: cat };
      chart.series.forEach((s) => {
        const raw = s.values[catIdx];
        if (raw === '' || raw === null || raw === undefined) {
          row[s.name] = null;
        } else {
          const num = typeof raw === 'number' ? raw : parseFloat(raw);
          row[s.name] = isNaN(num) ? null : num;
        }
      });
      return row;
    });
  }, [chart.categories, chart.series]);

  // Derive Scatter dataset (memoized to prevent unstable array references across renders)
  const scatterPoints = useMemo(() => {
    if (chart.chartType !== 'scatter') return [];
    return chart.categories
      .map((cat, idx) => {
        const raw = chart.series[0]?.values[idx];
        if (raw === '' || raw === null || raw === undefined) return null;
        const num = typeof raw === 'number' ? raw : parseFloat(raw);
        if (isNaN(num)) return null;
        return {
          x: (idx + 1) * 10,
          y: num,
          name: cat,
        };
      })
      .filter((pt): pt is { x: number; y: number; name: string } => pt !== null);
  }, [chart.chartType, chart.categories, chart.series]);

  // Derive active color palette
  const activePalette = useMemo(() => {
    const scheme = COLOR_SCHEMES.find((s) => s.id === chart.colorScheme);
    return scheme ? scheme.colors : COLOR_SCHEMES[0].colors;
  }, [chart.colorScheme]);

  const handleChartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveChart(chart);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveChart(chart);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const handleToggleSpreadsheet = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveChart(chart);
    setIsSpreadsheetOpen((prev) => !prev);
  };

  const handleTitleChange = (newTitle: string) => {
    onUpdateChart({
      ...chart,
      title: newTitle,
      caption: chart.caption || `Figure: ${newTitle}`,
      updatedAt: new Date().toISOString(),
    });
  };

  // Pointer drag handler for moving chart smoothly via CSS transform
  const handleDragPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;

    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Do NOT start dragging if user is clicking inside interactive elements
    if (
      target.closest('input') ||
      target.closest('button') ||
      target.closest('textarea') ||
      target.closest('.chart-spreadsheet-editor') ||
      target.closest('[role="dialog"]') ||
      target.closest('.resize-handle') ||
      target.closest('[data-editor-ui="true"]') ||
      target.closest('figcaption')
    ) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    setActiveChart(chart);

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = chart.position?.x ?? x ?? 0;
    const initialY = chart.position?.y ?? y ?? 0;
    const el = getFigureElement();
    const scale = el ? getWorkspaceScale(el) : 1;

    let isDraggingStarted = false;
    let curX = initialX;
    let curY = initialY;

    const targetEl = e.currentTarget;
    const pointerId = e.pointerId;

    try {
      targetEl.setPointerCapture(pointerId);
    } catch {
      // ignore
    }

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();

      const deltaScreenX = moveEv.clientX - startX;
      const deltaScreenY = moveEv.clientY - startY;

      if (!isDraggingStarted && Math.hypot(deltaScreenX, deltaScreenY) > 3) {
        isDraggingStarted = true;
        document.body.style.cursor = 'move';
        document.body.style.userSelect = 'none';
      }

      if (!isDraggingStarted) return;

      const deltaX = Math.round(deltaScreenX / scale);
      const deltaY = Math.round(deltaScreenY / scale);

      curX = initialX + deltaX;
      curY = initialY + deltaY;

      setX(curX);
      setY(curY);

      if (el) {
        el.style.left = `${curX}px`;
        el.style.top = `${curY}px`;
        el.style.transform = 'none';
      }
    };

    const onPointerUp = (upEv: PointerEvent) => {
      upEv.preventDefault();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      try {
        if (targetEl && targetEl.hasPointerCapture(pointerId)) {
          targetEl.releasePointerCapture(pointerId);
        }
      } catch {
        // ignore
      }

      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      if (!isDraggingStarted) return;

      onUpdateChart({
        ...chart,
        position: { x: curX, y: curY },
        updatedAt: new Date().toISOString(),
      });
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // Pointer handler for 8 resize handles with anchor corner stability
  const handleResizePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    handle: ResizeHandle
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const targetEl = e.currentTarget;
    const pointerId = e.pointerId;

    try {
      targetEl.setPointerCapture(pointerId);
    } catch {
      // ignore
    }

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width;
    const startHeight = height;
    const startXPos = chart.position?.x ?? x ?? 0;
    const startYPos = chart.position?.y ?? y ?? 0;
    const el = getFigureElement();
    const scale = el ? getWorkspaceScale(el) : 1;

    const minWidth = 240;
    const minHeight = 160;

    document.body.style.userSelect = 'none';

    let curW = startWidth;
    let curH = startHeight;
    let curX = startXPos;
    let curY = startYPos;

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const deltaX = Math.round((moveEv.clientX - startX) / scale);
      const deltaY = Math.round((moveEv.clientY - startY) / scale);

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startXPos;
      let newY = startYPos;

      if (handle.includes('e')) {
        newWidth = Math.max(minWidth, startWidth + deltaX);
      } else if (handle.includes('w')) {
        newWidth = Math.max(minWidth, startWidth - deltaX);
        newX = startXPos + (startWidth - newWidth);
      }

      if (handle.includes('s')) {
        newHeight = Math.max(minHeight, startHeight + deltaY);
      } else if (handle.includes('n')) {
        newHeight = Math.max(minHeight, startHeight - deltaY);
        newY = startYPos + (startHeight - newHeight);
      }

      curW = newWidth;
      curH = newHeight;
      curX = newX;
      curY = newY;

      setWidth(newWidth);
      setHeight(newHeight);
      setX(newX);
      setY(newY);

      if (el) {
        el.style.width = `${newWidth}px`;
        el.style.left = `${newX}px`;
        el.style.top = `${newY}px`;
        el.style.transform = 'none';
      }
    };

    const onPointerUp = (upEv: PointerEvent) => {
      upEv.preventDefault();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      try {
        if (targetEl && targetEl.hasPointerCapture(pointerId)) {
          targetEl.releasePointerCapture(pointerId);
        }
      } catch {
        // ignore
      }

      document.body.style.userSelect = '';

      onUpdateChart({
        ...chart,
        width: curW,
        height: curH,
        position: { x: curX, y: curY },
        updatedAt: new Date().toISOString(),
      });
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // Helper to render series elements
  const renderSeriesElements = () => {
    return chart.series.map((s, idx) => {
      const color = s.color || activePalette[idx % activePalette.length];

      switch (chart.chartType) {
        case 'column':
          return (
            <Bar
              key={s.id}
              dataKey={s.name}
              fill={color}
              radius={[4, 4, 0, 0]}
              name={s.name}
            >
              {chart.showDataLabels && <LabelList dataKey={s.name} position="top" fill="#475569" fontSize={10} />}
            </Bar>
          );

        case 'stackedColumn':
          return (
            <Bar
              key={s.id}
              dataKey={s.name}
              stackId="stacked1"
              fill={color}
              name={s.name}
            >
              {chart.showDataLabels && <LabelList dataKey={s.name} position="center" fill="#ffffff" fontSize={10} />}
            </Bar>
          );

        case 'bar':
        case 'horizontalBar':
          return (
            <Bar
              key={s.id}
              dataKey={s.name}
              fill={color}
              radius={[0, 4, 4, 0]}
              name={s.name}
            >
              {chart.showDataLabels && <LabelList dataKey={s.name} position="right" fill="#475569" fontSize={10} />}
            </Bar>
          );

        case 'line':
          return (
            <Line
              key={s.id}
              type="monotone"
              dataKey={s.name}
              stroke={color}
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#ffffff', stroke: color, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              name={s.name}
            >
              {chart.showDataLabels && <LabelList dataKey={s.name} position="top" fill="#475569" fontSize={10} />}
            </Line>
          );

        case 'area':
          return (
            <Area
              key={s.id}
              type="monotone"
              dataKey={s.name}
              stroke={color}
              strokeWidth={2}
              fill={color}
              fillOpacity={0.25}
              name={s.name}
            >
              {chart.showDataLabels && <LabelList dataKey={s.name} position="top" fill="#475569" fontSize={10} />}
            </Area>
          );

        case 'combo':
          if (idx === 0) {
            return (
              <Bar
                key={s.id}
                dataKey={s.name}
                fill={color}
                radius={[4, 4, 0, 0]}
                name={s.name}
              />
            );
          }
          return (
            <Line
              key={s.id}
              type="monotone"
              dataKey={s.name}
              stroke={color}
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#ffffff', stroke: color, strokeWidth: 2 }}
              name={s.name}
            />
          );

        default:
          return null;
      }
    });
  };

  // Render chart body
  const renderVisualization = () => {
    const effectiveChartHeight = isSpreadsheetOpen ? Math.min(height, 260) : height;

    // Pie / Doughnut uses first series mapped over categories
    if (chart.chartType === 'pie' || chart.chartType === 'doughnut') {
      const pieData = chart.categories
        .map((cat, idx) => {
          const raw = chart.series[0]?.values[idx];
          if (raw === '' || raw === null || raw === undefined) return null;
          const num = typeof raw === 'number' ? raw : parseFloat(raw);
          if (isNaN(num)) return null;
          return {
            name: cat,
            value: num,
          };
        })
        .filter((pt): pt is { name: string; value: number } => pt !== null);

      const isDoughnut = chart.chartType === 'doughnut';

      return (
        <ResponsiveContainer width="100%" height={effectiveChartHeight}>
          <PieChart margin={{ top: 8, right: 8, bottom: 12, left: 8 }}>
            <Tooltip />
            {chart.showLegend && (
              <Legend verticalAlign={chart.legendPosition === 'top' ? 'top' : 'bottom'} height={28} />
            )}
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="48%"
              innerRadius={isDoughnut ? 52 : 0}
              outerRadius={85}
              label={
                chart.showDataLabels
                  ? ({ name, percent }: { name?: string; percent?: number }) =>
                      `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`
                  : undefined
              }
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={activePalette[index % activePalette.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
    }

    // Scatter Chart
    if (chart.chartType === 'scatter') {
      return (
        <ResponsiveContainer width="100%" height={effectiveChartHeight}>
          <ScatterChart margin={{ top: 10, right: 15, bottom: 20, left: 10 }}>
            {chart.showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
            <XAxis
              type="number"
              dataKey="x"
              name={chart.xAxisTitle || 'X Axis'}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={chart.showXAxisTitle ? { value: chart.xAxisTitle || 'X Axis', position: 'bottom', offset: 0, fontSize: 11 } : undefined}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={chart.yAxisTitle || 'Y Axis'}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={chart.showYAxisTitle ? { value: chart.yAxisTitle || 'Y Axis', angle: -90, position: 'left', fontSize: 11 } : undefined}
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            {chart.showLegend && <Legend verticalAlign="bottom" height={28} />}
            <Scatter
              name={chart.series[0]?.name || 'Series 1'}
              data={scatterPoints}
              fill={activePalette[0]}
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    // Horizontal Bar / Bar
    if (chart.chartType === 'bar' || chart.chartType === 'horizontalBar') {
      return (
        <ResponsiveContainer width="100%" height={effectiveChartHeight}>
          <BarChart
            data={rechartsData}
            layout="vertical"
            margin={{ top: 10, right: 20, bottom: 15, left: 20 }}
          >
            {chart.showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />}
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
              label={chart.showXAxisTitle ? { value: chart.xAxisTitle || 'Values', position: 'bottom', offset: 0, fontSize: 11 } : undefined}
            />
            <YAxis
              dataKey="category"
              type="category"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <Tooltip />
            {chart.showLegend && (
              <Legend verticalAlign={chart.legendPosition === 'top' ? 'top' : 'bottom'} height={28} />
            )}
            {renderSeriesElements()}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Standard Cartesian Charts (Column, Stacked Column, Line, Area, Combo)
    const ChartContainerComponent =
      chart.chartType === 'line'
        ? LineChart
        : chart.chartType === 'area'
        ? AreaChart
        : chart.chartType === 'combo'
        ? ComposedChart
        : BarChart;

    return (
      <ResponsiveContainer width="100%" height={effectiveChartHeight}>
        <ChartContainerComponent data={rechartsData} margin={{ top: 10, right: 15, bottom: 20, left: 10 }}>
          {chart.showGridlines && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />}
          <XAxis
            dataKey="category"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            label={chart.showXAxisTitle ? { value: chart.xAxisTitle || 'Categories', position: 'bottom', offset: 0, fontSize: 11 } : undefined}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            label={chart.showYAxisTitle ? { value: chart.yAxisTitle || 'Values', angle: -90, position: 'left', offset: 5, fontSize: 11 } : undefined}
          />
          <Tooltip />
          {chart.showLegend && (
            <Legend
              verticalAlign={chart.legendPosition === 'top' ? 'top' : 'bottom'}
              align={chart.legendPosition === 'left' ? 'left' : chart.legendPosition === 'right' ? 'right' : 'center'}
              height={28}
            />
          )}
          {renderSeriesElements()}
        </ChartContainerComponent>
      </ResponsiveContainer>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`chart-editing-workspace w-full group ${
        isEditingThisChart
          ? 'flex flex-col gap-2 p-2 bg-muted/60 rounded-xl border border-emerald-500/30 shadow-xs'
          : isSelected
          ? 'relative ring-2 ring-primary rounded-lg shadow-xs cursor-grab active:cursor-grabbing'
          : 'relative hover:ring-1 hover:ring-secondary rounded-lg cursor-pointer'
      }`}
      onClick={handleChartClick}
      onContextMenu={handleContextMenu}
      onPointerDown={handleDragPointerDown}
    >
      {/* SPREADSHEET DATA EDITOR (DOCKED DIRECTLY ABOVE THIS ORIGINAL CHART) */}
      {isEditingThisChart && (
        <ChartSpreadsheetEditor
          chart={chart}
          onUpdateChart={onUpdateChart}
          onClose={() => setIsSpreadsheetOpen(false)}
          onOpenChangeType={() => setIsChangeTypeModalOpen(true)}
        />
      )}

      {/* ORIGINAL CHART FRAME (CLEAN Visual Frame without floating toolbar overlay) */}
      <div
        className="chart-display-frame w-full p-2 rounded-lg select-none"
        style={{
          position: 'relative',
          zIndex: chart.wrapMode === 'behind' ? 0 : (chart.wrapMode === 'inFront' ? 25 : 10),
          backgroundColor: chart.wrapMode === 'behind' ? 'transparent' : (chart.backgroundColor || '#ffffff'),
          borderRadius: `${chart.borderRadius || 8}px`,
          border: isEditingThisChart ? '1px solid #e2e8f0' : undefined,
          boxShadow: isEditingThisChart ? '0 1px 2px 0 rgba(0,0,0,0.04)' : undefined,
        }}
        onContextMenu={handleContextMenu}
      >
        {/* EDITABLE CHART TITLE */}
        {chart.showTitle !== false && (
          <div
            className={`w-full mb-1.5 ${
              chart.titleAlignment === 'left'
                ? 'text-left'
                : chart.titleAlignment === 'right'
                ? 'text-right'
                : 'text-center'
            }`}
          >
            <input
              type="text"
              value={chart.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-base font-bold text-foreground bg-transparent outline-none border-b border-transparent hover:border-border focus:border-primary transition-colors px-1"
              placeholder="Enter Chart Title"
            />
          </div>
        )}

        {/* VISUALIZATION CONTAINER */}
        <div className="w-full overflow-hidden">{renderVisualization()}</div>
      </div>

      {/* 8 INTERACTIVE RESIZE HANDLES & ANCHOR WHEN SELECTED */}
      {isSelected && !isEditingThisChart && (
        <>
          {/* Visual selection outline overlay when selected (renders above text at z-30) */}
          <div
            className="absolute inset-0 ring-2 ring-primary rounded-lg pointer-events-none z-30"
          />

          {/* Anchor indicator for text-wrapping modes (MS Word-style) */}
          {chart.wrapMode && chart.wrapMode !== 'inline' && (
            <div
              className="absolute -left-7 top-1 text-[#0078d4] dark:text-[#38bdf8] select-none pointer-events-none z-30"
              title="Anchored to text"
            >
              <Anchor className="w-4 h-4" />
            </div>
          )}
          {/* Top-Left */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'nw')}
            className="resize-handle absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-card border-2 border-primary rounded-xs shadow-xs cursor-nwse-resize z-30 hover:scale-125 transition-transform"
            title="Resize chart"
          />
          {/* Top-Middle */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'n')}
            className="resize-handle absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-card border-2 border-primary rounded-xs shadow-xs cursor-ns-resize z-30 hover:scale-125 transition-transform"
            title="Resize chart height"
          />
          {/* Top-Right */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'ne')}
            className="resize-handle absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-card border-2 border-primary rounded-xs shadow-xs cursor-nesw-resize z-30 hover:scale-125 transition-transform"
            title="Resize chart"
          />
          {/* Middle-Right */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'e')}
            className="resize-handle absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-card border-2 border-primary rounded-xs shadow-xs cursor-ew-resize z-30 hover:scale-125 transition-transform"
            title="Resize chart width"
          />
          {/* Bottom-Right */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'se')}
            className="resize-handle absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-3 h-3 bg-card border-2 border-primary rounded-xs shadow-xs cursor-nwse-resize z-30 hover:scale-125 transition-transform"
            title="Resize chart"
          />
          {/* Bottom-Middle */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 's')}
            className="resize-handle absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-card border-2 border-primary rounded-xs shadow-xs cursor-ns-resize z-30 hover:scale-125 transition-transform"
            title="Resize chart height"
          />
          {/* Bottom-Left */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'sw')}
            className="resize-handle absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-card border-2 border-primary rounded-xs shadow-xs cursor-nesw-resize z-30 hover:scale-125 transition-transform"
            title="Resize chart"
          />
          {/* Middle-Left */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'w')}
            className="resize-handle absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-card border-2 border-primary rounded-xs shadow-xs cursor-ew-resize z-30 hover:scale-125 transition-transform"
            title="Resize chart width"
          />

          {/* WORD-STYLE FLOATING SIDE ACTION (Layout Options) */}
          <div
            data-editor-ui="true"
            className="absolute top-0 -right-10 flex flex-col gap-1.5 z-40 select-none"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Button 1: Layout Options */}
            <button
              ref={layoutButtonRef}
              type="button"
              title="Layout Options"
              onClick={(e) => {
                e.stopPropagation();
                setIsLayoutOptionsOpen((prev) => !prev);
              }}
              className={`w-[30px] h-[30px] rounded-xs flex items-center justify-center shadow-md border transition-all cursor-pointer ${
                isLayoutOptionsOpen
                  ? 'bg-[#242424] border-[#38bdf8] ring-1 ring-[#38bdf8]'
                  : 'bg-[#2b2b2b] border-[#555555] hover:border-border'
              }`}
            >
              <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
                <line x1="2" y1="3" x2="18" y2="3" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="2" y1="7" x2="18" y2="7" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M 4 16 C 4 9, 16 9, 16 16" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" />
                <line x1="2" y1="16" x2="3" y2="16" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="17" y1="16" x2="18" y2="16" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>

            {/* Exact Layout Options Popup (Microsoft Word Style) */}
            <ChartLayoutOptions
              chart={chart}
              isOpen={isLayoutOptionsOpen}
              onClose={() => setIsLayoutOptionsOpen(false)}
              onUpdateChart={onUpdateChart}
              onSeeMore={() => setIsSpreadsheetOpen(true)}
              anchorRef={layoutButtonRef}
            />
          </div>
        </>
      )}

      {/* CHART CONTEXT MENU */}
      {contextMenuPos && (
        <ChartContextMenu
          x={contextMenuPos.x}
          y={contextMenuPos.y}
          isSpreadsheetOpen={isSpreadsheetOpen}
          onClose={() => setContextMenuPos(null)}
          onDelete={onDeleteChart}
          onChangeType={() => {
            setActiveChart(chart);
            setIsChangeTypeModalOpen(true);
          }}
          onSelectData={() => {
            setActiveChart(chart);
            setIsSelectDataModalOpen(true);
          }}
          onChangeColors={() => {
            setActiveChart(chart);
            setIsColorModalOpen(true);
          }}
          onChartStyle={() => {
            setActiveChart(chart);
            setIsStyleModalOpen(true);
          }}
          onSwitchRowColumn={() => {
            setActiveChart(chart);
            switchRowColumn();
          }}
          onRefresh={() => {
            setActiveChart(chart);
            refreshActiveChart();
          }}
          onToggleEditData={handleToggleSpreadsheet}
        />
      )}

      {/* SELECT DATA MODAL */}
      {isSelected && (
        <SelectDataModal
          isOpen={isSelectDataModalOpen}
          chart={chart}
          onClose={() => setIsSelectDataModalOpen(false)}
          onUpdateChart={onUpdateChart}
        />
      )}

      {/* CHANGE COLOR MODAL */}
      {isSelected && (
        <ChangeChartColorModal
          isOpen={isColorModalOpen}
          activeSchemeId={chart.colorScheme}
          onClose={() => setIsColorModalOpen(false)}
          onSelectScheme={(schemeId) => {
            setActiveChart(chart);
            changeColorScheme(schemeId);
          }}
        />
      )}

      {/* CHART STYLE MODAL */}
      {isSelected && (
        <ChartStyleModal
          isOpen={isStyleModalOpen}
          activeStyleId={chart.chartStyle}
          onClose={() => setIsStyleModalOpen(false)}
          onSelectStyle={(styleId) => {
            setActiveChart(chart);
            changeChartStyle(styleId);
          }}
        />
      )}
    </div>
  );
};
