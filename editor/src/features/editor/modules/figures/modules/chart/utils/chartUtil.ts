import type { ChartType, ChartModel, ChartSeries } from '../types/chart.types';
import {
  CHART_TYPES,
  DEFAULT_CATEGORIES,
  DEFAULT_SERIES,
  COLOR_SCHEMES,
} from '../constants/chart.constants';

export function getDefaultChartCaption(chartType: ChartType): string {
  const chartOption = CHART_TYPES.find((c) => c.type === chartType);
  return `Figure: ${chartOption?.name || 'Chart'}`;
}

export function isDefaultChartCaption(caption?: string, currentType?: ChartType): boolean {
  if (!caption || !caption.trim()) return true;
  const trimmed = caption.trim();
  if (currentType && trimmed === getDefaultChartCaption(currentType)) return true;
  return CHART_TYPES.some((c) => trimmed === `Figure: ${c.name}`);
}

export function getEffectiveChartCaption(chart: { caption?: string; chartType?: ChartType }): string {
  if (chart.caption && chart.caption.trim()) {
    return chart.caption.trim();
  }
  return getDefaultChartCaption(chart.chartType || 'column');
}

export function createDefaultChartModel(chartType: ChartType): ChartModel {
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
    caption: getDefaultChartCaption(chartType),
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

export const MIN_WRAP_TEXT_WIDTH = 180;

export interface ChartWrapRegion {
  mode: 'square' | 'tight' | 'through';
  wrapShape: 'rectangle' | 'contour' | 'through';
  hasSufficientRoom: boolean;
  remainingTextWidth: number;
  occupiedWidth: number;
  shapeOutside: string;
  shapeMargin: string;
  floatSide: 'left' | 'right' | 'none';
  clearMode: 'both' | 'none';
  marginStyle: string;
}

export function calculateSquareWrap(
  chart: ChartModel,
  containerWidth: number = 624
): ChartWrapRegion {
  const width = chart.width || 560;
  const posX = chart.position?.x || 0;
  const alignment = chart.alignment || 'center';
  const positionMode = chart.positionMode || 'moveWithText';

  const marginGutter = 24;
  const occupiedWidth = width + marginGutter;
  const remainingTextWidth = Math.max(0, containerWidth - occupiedWidth);
  const hasSufficientRoom = remainingTextWidth >= MIN_WRAP_TEXT_WIDTH;

  let floatSide: 'left' | 'right' | 'none' = 'left';
  if (!hasSufficientRoom && positionMode === 'moveWithText') {
    floatSide = 'none';
  } else if (alignment === 'right' || posX > 80) {
    floatSide = 'right';
  }

  const clearMode = !hasSufficientRoom && positionMode === 'moveWithText' ? 'both' : 'none';
  const marginStyle =
    floatSide === 'none'
      ? '14px auto'
      : floatSide === 'right'
      ? '8px 0 16px 24px'
      : '8px 24px 16px 0';

  return {
    mode: 'square',
    wrapShape: 'rectangle',
    hasSufficientRoom,
    remainingTextWidth,
    occupiedWidth,
    shapeOutside: hasSufficientRoom ? 'inset(0 round 0px)' : 'none',
    shapeMargin: '16px',
    floatSide,
    clearMode,
    marginStyle,
  };
}

export function calculateTightWrap(
  chart: ChartModel,
  containerWidth: number = 624
): ChartWrapRegion {
  const width = chart.width || 560;
  const posX = chart.position?.x || 0;
  const alignment = chart.alignment || 'center';
  const positionMode = chart.positionMode || 'moveWithText';
  const borderRadius = chart.borderRadius || 8;

  const marginGutter = 12;
  const occupiedWidth = width + marginGutter;
  const remainingTextWidth = Math.max(0, containerWidth - occupiedWidth);
  const hasSufficientRoom = remainingTextWidth >= 160;

  let floatSide: 'left' | 'right' | 'none' = 'left';
  if (!hasSufficientRoom && positionMode === 'moveWithText') {
    floatSide = 'none';
  } else if (alignment === 'right' || posX > 80) {
    floatSide = 'right';
  }

  const clearMode = !hasSufficientRoom && positionMode === 'moveWithText' ? 'both' : 'none';
  const marginStyle =
    floatSide === 'none'
      ? '12px auto'
      : floatSide === 'right'
      ? '4px 0 8px 12px'
      : '4px 12px 8px 0';

  const r = Math.min(24, Math.max(6, borderRadius));
  const contourPolygon = `polygon(${r}px 0px, calc(100% - ${r}px) 0px, 100% ${r}px, 100% calc(100% - ${r}px), calc(100% - ${r}px) 100%, ${r}px 100%, 0px calc(100% - ${r}px), 0px ${r}px)`;

  return {
    mode: 'tight',
    wrapShape: 'contour',
    hasSufficientRoom,
    remainingTextWidth,
    occupiedWidth,
    shapeOutside: hasSufficientRoom ? contourPolygon : 'none',
    shapeMargin: '8px',
    floatSide,
    clearMode,
    marginStyle,
  };
}

export function calculateThroughWrap(
  chart: ChartModel,
  containerWidth: number = 624
): ChartWrapRegion {
  const width = chart.width || 560;
  const posX = chart.position?.x || 0;
  const alignment = chart.alignment || 'center';
  const positionMode = chart.positionMode || 'moveWithText';

  const marginGutter = 8;
  const occupiedWidth = width + marginGutter;
  const remainingTextWidth = Math.max(0, containerWidth - occupiedWidth);
  const hasSufficientRoom = remainingTextWidth >= 150;

  let floatSide: 'left' | 'right' | 'none' = 'left';
  if (!hasSufficientRoom && positionMode === 'moveWithText') {
    floatSide = 'none';
  } else if (alignment === 'right' || posX > 80) {
    floatSide = 'right';
  }

  const clearMode = !hasSufficientRoom && positionMode === 'moveWithText' ? 'both' : 'none';
  const marginStyle =
    floatSide === 'none'
      ? '10px auto'
      : floatSide === 'right'
      ? '2px 0 6px 8px'
      : '2px 8px 6px 0';

  const topInset = chart.showTitle === false ? 4 : 16;
  const throughPolygon = `polygon(0px 0px, calc(100% - 20px) 0px, 100% ${topInset}px, calc(100% - 6px) calc(100% - 20px), calc(100% - 20px) 100%, 0px 100%)`;

  return {
    mode: 'through',
    wrapShape: 'through',
    hasSufficientRoom,
    remainingTextWidth,
    occupiedWidth,
    shapeOutside: hasSufficientRoom ? throughPolygon : 'none',
    shapeMargin: '4px',
    floatSide,
    clearMode,
    marginStyle,
  };
}

export function getChartWrapRegion(
  chart: ChartModel,
  containerWidth: number = 624
): ChartWrapRegion {
  switch (chart.wrapMode) {
    case 'square':
      return calculateSquareWrap(chart, containerWidth);
    case 'tight':
      return calculateTightWrap(chart, containerWidth);
    case 'through':
      return calculateThroughWrap(chart, containerWidth);
    default:
      return calculateSquareWrap(chart, containerWidth);
  }
}

export function getChartFigureStyleProperties(chart: ChartModel, containerWidth: number = 624) {
  const posX = chart.position?.x || 0;
  const posY = chart.position?.y || 0;
  const wrapMode = chart.wrapMode || 'inline';
  const positionMode = chart.positionMode || 'moveWithText';
  const alignment = chart.alignment || 'center';
  const bgColor = chart.backgroundColor || '#ffffff';

  let display = 'block';
  let floatVal = 'none';
  let clearVal = 'none';
  let positionVal = positionMode === 'fixPosition' ? 'absolute' : 'relative';
  let leftVal = `${posX}px`;
  let topVal = `${posY}px`;
  let transformVal = 'none';
  let zIndexVal = '10';
  let marginVal = '12px auto';
  let heightVal = 'auto';
  let overflowVal = 'visible';
  let shapeOutsideVal = 'none';
  let shapeMarginVal = '0px';

  if (wrapMode === 'inline') {
    display = 'block';
    floatVal = 'none';
    clearVal = 'both';
    positionVal = 'relative';
    leftVal = posX ? `${posX}px` : 'auto';
    topVal = posY ? `${posY}px` : 'auto';
    transformVal = 'none';
    zIndexVal = '10';
    heightVal = 'auto';
    if (alignment === 'left') {
      marginVal = '12px auto 12px 0';
    } else if (alignment === 'right') {
      marginVal = '12px 0 12px auto';
    } else {
      marginVal = '12px auto';
    }
  } else if (wrapMode === 'topBottom') {
    display = 'block';
    floatVal = 'none';
    clearVal = 'both';
    positionVal = positionMode === 'fixPosition' ? 'absolute' : 'relative';
    leftVal = `${posX}px`;
    topVal = `${posY}px`;
    transformVal = 'none';
    zIndexVal = '10';
    heightVal = 'auto';
    marginVal = positionMode === 'fixPosition' ? '0' : '16px auto';
  } else if (wrapMode === 'square') {
    const wrapCalc = calculateSquareWrap(chart, containerWidth);
    positionVal = positionMode === 'fixPosition' ? 'absolute' : 'relative';
    leftVal = `${posX}px`;
    topVal = `${posY}px`;
    transformVal = 'none';
    zIndexVal = '10';
    heightVal = 'auto';
    floatVal = positionMode === 'fixPosition' ? 'none' : wrapCalc.floatSide;
    clearVal = positionMode === 'fixPosition' ? 'none' : wrapCalc.clearMode;
    marginVal = positionMode === 'fixPosition' ? '0' : wrapCalc.marginStyle;
    shapeOutsideVal = wrapCalc.shapeOutside;
    shapeMarginVal = wrapCalc.shapeMargin;
  } else if (wrapMode === 'tight') {
    const wrapCalc = calculateTightWrap(chart, containerWidth);
    positionVal = positionMode === 'fixPosition' ? 'absolute' : 'relative';
    leftVal = `${posX}px`;
    topVal = `${posY}px`;
    transformVal = 'none';
    zIndexVal = '10';
    heightVal = 'auto';
    floatVal = positionMode === 'fixPosition' ? 'none' : wrapCalc.floatSide;
    clearVal = positionMode === 'fixPosition' ? 'none' : wrapCalc.clearMode;
    marginVal = positionMode === 'fixPosition' ? '0' : wrapCalc.marginStyle;
    shapeOutsideVal = wrapCalc.shapeOutside;
    shapeMarginVal = wrapCalc.shapeMargin;
  } else if (wrapMode === 'through') {
    const wrapCalc = calculateThroughWrap(chart, containerWidth);
    positionVal = positionMode === 'fixPosition' ? 'absolute' : 'relative';
    leftVal = `${posX}px`;
    topVal = `${posY}px`;
    transformVal = 'none';
    zIndexVal = '10';
    heightVal = 'auto';
    floatVal = positionMode === 'fixPosition' ? 'none' : wrapCalc.floatSide;
    clearVal = positionMode === 'fixPosition' ? 'none' : wrapCalc.clearMode;
    marginVal = positionMode === 'fixPosition' ? '0' : wrapCalc.marginStyle;
    shapeOutsideVal = wrapCalc.shapeOutside;
    shapeMarginVal = wrapCalc.shapeMargin;
  } else if (wrapMode === 'behind') {
    display = 'block';
    floatVal = 'none';
    clearVal = 'none';
    positionVal = positionMode === 'fixPosition' ? 'absolute' : 'relative';
    leftVal = `${posX}px`;
    topVal = `${posY}px`;
    transformVal = 'none';
    zIndexVal = '0';
    heightVal = '0px';
    marginVal = '0 auto';
    overflowVal = 'visible';
  } else if (wrapMode === 'inFront') {
    display = 'block';
    floatVal = 'none';
    clearVal = 'none';
    positionVal = positionMode === 'fixPosition' ? 'absolute' : 'relative';
    leftVal = `${posX}px`;
    topVal = `${posY}px`;
    transformVal = 'none';
    zIndexVal = '25';
    heightVal = '0px';
    marginVal = '0 auto';
    overflowVal = 'visible';
  }

  return {
    display,
    float: floatVal,
    clear: clearVal,
    position: positionVal,
    left: leftVal,
    top: topVal,
    transform: transformVal,
    zIndex: zIndexVal,
    margin: marginVal,
    height: heightVal,
    overflow: overflowVal,
    shapeOutside: shapeOutsideVal,
    shapeMargin: shapeMarginVal,
    backgroundColor: wrapMode === 'behind' ? 'transparent' : bgColor,
  };
}

export function applyChartFigureStyles(figEl: HTMLElement, chart: ChartModel): void {
  const width = chart.width || 560;
  const wrapMode = chart.wrapMode || 'inline';
  const containerWidth = figEl.parentElement?.clientWidth || 624;

  figEl.style.width = `${width}px`;
  figEl.style.maxWidth = '100%';
  figEl.style.boxSizing = 'border-box';
  figEl.style.userSelect = 'none';
  figEl.setAttribute('data-chart-wrap', wrapMode);

  const styles = getChartFigureStyleProperties(chart, containerWidth);
  figEl.style.display = styles.display;
  figEl.style.float = styles.float;
  figEl.style.clear = styles.clear;
  figEl.style.position = styles.position;
  figEl.style.left = styles.left;
  figEl.style.top = styles.top;
  figEl.style.transform = styles.transform;
  figEl.style.zIndex = styles.zIndex;
  figEl.style.margin = styles.margin;
  figEl.style.height = styles.height;
  figEl.style.overflow = styles.overflow;

  if (styles.shapeOutside && styles.shapeOutside !== 'none') {
    figEl.style.setProperty('shape-outside', styles.shapeOutside);
    figEl.style.setProperty('shape-margin', styles.shapeMargin);
  } else {
    figEl.style.removeProperty('shape-outside');
    figEl.style.removeProperty('shape-margin');
  }

  if (wrapMode !== 'behind') {
    figEl.style.backgroundColor = styles.backgroundColor;
  } else {
    figEl.style.backgroundColor = 'transparent';
  }
}

export function getChartFigureStyleString(chart: ChartModel): string {
  const width = chart.width || 560;
  const styles = getChartFigureStyleProperties(chart, 624);
  const bgStyle = chart.wrapMode !== 'behind' ? `background-color: ${styles.backgroundColor};` : '';
  const leftStyle = styles.left ? `left: ${styles.left};` : '';
  const topStyle = styles.top ? `top: ${styles.top};` : '';
  const shapeStyle =
    styles.shapeOutside && styles.shapeOutside !== 'none'
      ? `shape-outside: ${styles.shapeOutside}; shape-margin: ${styles.shapeMargin};`
      : '';

  return `width: ${width}px; max-width: 100%; box-sizing: border-box; display: ${styles.display}; float: ${styles.float}; clear: ${styles.clear}; position: ${styles.position}; ${leftStyle} ${topStyle} transform: ${styles.transform}; z-index: ${styles.zIndex}; margin: ${styles.margin}; height: ${styles.height}; overflow: ${styles.overflow}; ${shapeStyle} ${bgStyle} user-select: none;`;
}

export function generateChartHTML(chart: ChartModel): string {
  const effectiveCaption = getEffectiveChartCaption(chart);
  const chartWithCaption = { ...chart, caption: effectiveCaption };
  const encodedConfig = encodeURIComponent(JSON.stringify(chartWithCaption));
  const styleString = getChartFigureStyleString(chartWithCaption);

  return `
<figure id="${chart.id}" class="editor-figure editor-chart-figure" data-chart-figure="true" data-chart-id="${chart.id}" data-chart-wrap="${chart.wrapMode || 'inline'}" data-chart-type="${chart.chartType}" data-chart-config="${encodedConfig}" contenteditable="false" oncontextmenu="event.preventDefault();" style="${styleString}">
  <div class="editor-chart-mount" data-chart-mount-id="${chart.id}" style="width: 100%; position: relative;"></div>
  <figcaption data-chart-caption="true" style="margin-top: 4px; font-size: 10pt; font-weight: 600; color: #475569; text-align: center; font-family: Calibri, 'Segoe UI', Arial, sans-serif; outline: none; border-bottom: 1px dashed transparent; cursor: pointer; min-height: 1.2em; user-select: text;">${effectiveCaption}</figcaption>
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
      values: oldSeries.map((s) => s.values[catIdx] ?? ''),
    };
  });

  return {
    ...chart,
    categories: newCategories,
    series: newSeries,
    updatedAt: new Date().toISOString(),
  };
}
