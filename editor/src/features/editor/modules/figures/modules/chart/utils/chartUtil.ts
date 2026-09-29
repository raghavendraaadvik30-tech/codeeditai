import type { ChartType, ChartModel, ChartSeries } from '../types/chart.types';
import {
  CHART_TYPES,
  DEFAULT_CATEGORIES,
  DEFAULT_SERIES,
  COLOR_SCHEMES,
} from '../constants/chart.constants';

export function createDefaultChartModel(chartType: ChartType): ChartModel {
  const chartOption = CHART_TYPES.find((c) => c.type === chartType);
  const title = 'Chart Title';

  // Deep clone default categories & series
  const categories = [...DEFAULT_CATEGORIES];
  const colors = COLOR_SCHEMES[0].colors;
  const series: ChartSeries[] = DEFAULT_SERIES.map((s, idx) => ({
    ...s,
    color: colors[idx % colors.length],
    values: [...s.values],
  }));

  // Adjust default dimensions if necessary
  const width = 560;
  const height = 340;

  return {
    id: `chart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: 'chart',
    chartType,
    title,
    showTitle: true,
    titleAlignment: 'center',
    categories,
    series,
    showLegend: true,
    legendPosition: 'bottom',
    showDataLabels: false,
    dataLabelPosition: 'none',
    showGridlines: true,
    showXAxisTitle: false,
    xAxisTitle: 'Categories',
    showYAxisTitle: false,
    yAxisTitle: 'Values',
    colorScheme: 'colorful',
    chartStyle: 'style-1',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 8,
    width,
    height,
    alignment: 'center',
    position: { x: 0, y: 0 },
    wrapMode: 'inline',
    positionMode: 'moveWithText',
    caption: `Figure: ${chartOption?.name || 'Chart'}`,
    isSpreadsheetOpen: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Calculates workspace scale factor dynamically for element (handles 80%-120% zoom).
 */
export function getWorkspaceScale(element: HTMLElement): number {
  const pageSection = element.closest('section[data-page-id]') as HTMLElement | null;
  if (!pageSection) return 1;
  const rect = pageSection.getBoundingClientRect();
  const offsetWidth = pageSection.offsetWidth;
  if (offsetWidth > 0 && rect.width > 0) {
    return rect.width / offsetWidth;
  }
  return 1;
}

export function applyChartFigureStyles(figEl: HTMLElement, chart: ChartModel): void {
  const posX = chart.position?.x || 0;
  const posY = chart.position?.y || 0;
  const wrapMode = chart.wrapMode || 'inline';
  const width = chart.width || 560;

  figEl.style.width = `${width}px`;
  figEl.style.maxWidth = '100%';
  figEl.style.boxSizing = 'border-box';
  figEl.style.userSelect = 'none';

  if (wrapMode !== 'behind' && wrapMode !== 'inFront') {
    figEl.style.left = '';
    figEl.style.top = '';
    figEl.style.transform = `translate(${posX}px, ${posY}px)`;
  }

  switch (wrapMode) {
    case 'square':
      figEl.setAttribute('data-chart-wrap', 'square');
      figEl.style.display = 'block';
      figEl.style.clear = 'none';
      figEl.style.position = 'relative';
      figEl.style.zIndex = '1';
      figEl.style.height = 'auto';
      figEl.style.overflow = 'visible';
      if (chart.alignment === 'right' || posX > 80) {
        figEl.style.float = 'right';
        figEl.style.margin = '8px 0 12px 20px';
      } else {
        figEl.style.float = 'left';
        figEl.style.margin = '8px 20px 12px 0';
      }
      break;

    case 'tight':
      figEl.setAttribute('data-chart-wrap', 'tight');
      figEl.style.display = 'block';
      figEl.style.clear = 'none';
      figEl.style.position = 'relative';
      figEl.style.zIndex = '1';
      figEl.style.height = 'auto';
      figEl.style.overflow = 'visible';
      if (chart.alignment === 'right' || posX > 80) {
        figEl.style.float = 'right';
        figEl.style.margin = '4px 0 6px 12px';
      } else {
        figEl.style.float = 'left';
        figEl.style.margin = '4px 12px 6px 0';
      }
      break;

    case 'through':
      figEl.setAttribute('data-chart-wrap', 'through');
      figEl.style.display = 'block';
      figEl.style.clear = 'none';
      figEl.style.position = 'relative';
      figEl.style.zIndex = '1';
      figEl.style.height = 'auto';
      figEl.style.overflow = 'visible';
      if (chart.alignment === 'right' || posX > 80) {
        figEl.style.float = 'right';
        figEl.style.margin = '2px 0 4px 8px';
      } else {
        figEl.style.float = 'left';
        figEl.style.margin = '2px 8px 4px 0';
      }
      break;

    case 'topBottom':
      figEl.setAttribute('data-chart-wrap', 'topBottom');
      figEl.style.display = 'block';
      figEl.style.float = 'none';
      figEl.style.clear = 'both';
      figEl.style.position = 'relative';
      figEl.style.zIndex = '1';
      figEl.style.height = 'auto';
      figEl.style.overflow = 'visible';
      figEl.style.margin = '14px auto';
      break;

    case 'behind':
      figEl.setAttribute('data-chart-wrap', 'behind');
      figEl.style.display = 'block';
      figEl.style.float = 'none';
      figEl.style.clear = 'none';
      figEl.style.position = 'relative';
      figEl.style.left = `${posX}px`;
      figEl.style.top = `${posY}px`;
      figEl.style.transform = 'none';
      figEl.style.zIndex = 'auto';
      figEl.style.height = '0px';
      figEl.style.margin = '0 auto';
      figEl.style.padding = '0';
      figEl.style.overflow = 'visible';
      break;

    case 'inFront':
      figEl.setAttribute('data-chart-wrap', 'inFront');
      figEl.style.display = 'block';
      figEl.style.float = 'none';
      figEl.style.clear = 'none';
      figEl.style.position = 'relative';
      figEl.style.left = `${posX}px`;
      figEl.style.top = `${posY}px`;
      figEl.style.transform = 'none';
      figEl.style.zIndex = 'auto';
      figEl.style.height = '0px';
      figEl.style.margin = '0 auto';
      figEl.style.padding = '0';
      figEl.style.overflow = 'visible';
      break;

    case 'inline':
    default:
      figEl.style.display = 'block';
      figEl.style.float = 'none';
      figEl.style.clear = 'both';
      figEl.style.position = 'relative';
      figEl.style.zIndex = '1';
      figEl.style.height = 'auto';
      figEl.style.overflow = 'visible';
      if (chart.alignment === 'left') {
        figEl.style.margin = '8px auto 8px 0';
      } else if (chart.alignment === 'right') {
        figEl.style.margin = '8px 0 8px auto';
      } else {
        figEl.style.margin = '8px auto';
      }
      break;
  }
}

export function getChartFigureStyleString(chart: ChartModel): string {
  const posX = chart.position?.x || 0;
  const posY = chart.position?.y || 0;
  const wrapMode = chart.wrapMode || 'inline';
  const width = chart.width || 560;

  let layoutCss = '';
  switch (wrapMode) {
    case 'square':
      layoutCss =
        chart.alignment === 'right' || posX > 80
          ? 'float: right; margin: 8px 0 12px 20px; clear: none; position: relative; z-index: 1; height: auto; overflow: visible;'
          : 'float: left; margin: 8px 20px 12px 0; clear: none; position: relative; z-index: 1; height: auto; overflow: visible;';
      break;
    case 'tight':
      layoutCss =
        chart.alignment === 'right' || posX > 80
          ? 'float: right; margin: 4px 0 6px 12px; clear: none; position: relative; z-index: 1; height: auto; overflow: visible;'
          : 'float: left; margin: 4px 12px 6px 0; clear: none; position: relative; z-index: 1; height: auto; overflow: visible;';
      break;
    case 'through':
      layoutCss =
        chart.alignment === 'right' || posX > 80
          ? 'float: right; margin: 2px 0 4px 8px; clear: none; position: relative; z-index: 1; height: auto; overflow: visible;'
          : 'float: left; margin: 2px 8px 4px 0; clear: none; position: relative; z-index: 1; height: auto; overflow: visible;';
      break;
    case 'topBottom':
      layoutCss = 'float: none; clear: both; margin: 14px auto; position: relative; z-index: 1; height: auto; overflow: visible;';
      break;
    case 'behind':
      layoutCss = `float: none; clear: none; margin: 0 auto; padding: 0; position: relative; left: ${posX}px; top: ${posY}px; z-index: auto; height: 0px; overflow: visible;`;
      break;
    case 'inFront':
      layoutCss = `float: none; clear: none; margin: 0 auto; padding: 0; position: relative; left: ${posX}px; top: ${posY}px; z-index: auto; height: 0px; overflow: visible;`;
      break;
    case 'inline':
    default:
      layoutCss =
        chart.alignment === 'left'
          ? 'margin: 8px auto 8px 0; float: none; clear: both; position: relative; z-index: 1; height: auto; overflow: visible;'
          : chart.alignment === 'right'
          ? 'margin: 8px 0 8px auto; float: none; clear: both; position: relative; z-index: 1; height: auto; overflow: visible;'
          : 'margin: 8px auto; float: none; clear: both; position: relative; z-index: 1; height: auto; overflow: visible;';
      break;
  }

  const transformStyle = wrapMode === 'behind' || wrapMode === 'inFront' ? '' : `transform: translate(${posX}px, ${posY}px);`;
  return `width: ${width}px; max-width: 100%; box-sizing: border-box; display: block; ${transformStyle} user-select: none; ${layoutCss}`;
}

export function generateChartHTML(chart: ChartModel): string {
  const encodedConfig = encodeURIComponent(JSON.stringify(chart));
  const styleString = getChartFigureStyleString(chart);

  return `
<figure id="${chart.id}" class="editor-figure editor-chart-figure" data-chart-figure="true" data-chart-id="${chart.id}" data-chart-wrap="${chart.wrapMode || 'inline'}" data-chart-type="${chart.chartType}" data-chart-config="${encodedConfig}" contenteditable="false" oncontextmenu="event.preventDefault();" style="${styleString}">
  <div class="editor-chart-mount" data-chart-mount-id="${chart.id}" style="width: 100%; position: relative;"></div>
  ${chart.caption ? `<figcaption contenteditable="false" style="margin-top: 4px; font-size: 10pt; font-weight: 600; color: #475569; text-align: center; font-family: Calibri, 'Segoe UI', Arial, sans-serif; user-select: none;">${chart.caption}</figcaption>` : ''}
</figure>
`.trim();
}

/**
 * Transposes categories and series (Switch Row/Column)
 */
export function transposeChartData(chart: ChartModel): ChartModel {
  const oldCategories = chart.categories;
  const oldSeries = chart.series;

  // New categories will be the old series names
  const newCategories = oldSeries.map((s) => s.name);

  // New series will be each old category
  const colors = COLOR_SCHEMES[0].colors;
  const newSeries: ChartSeries[] = oldCategories.map((cat, catIdx) => {
    return {
      id: `s-${catIdx}`,
      name: cat,
      color: colors[catIdx % colors.length],
      values: oldSeries.map((s) => s.values[catIdx] ?? 0),
    };
  });

  return {
    ...chart,
    categories: newCategories,
    series: newSeries,
    updatedAt: new Date().toISOString(),
  };
}
