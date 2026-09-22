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
    caption: `Figure: ${chartOption?.name || 'Chart'}`,
    isSpreadsheetOpen: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function generateChartHTML(chart: ChartModel): string {
  const encodedConfig = encodeURIComponent(JSON.stringify(chart));
  const alignStyle =
    chart.alignment === 'left'
      ? 'margin-left: 0; margin-right: auto; text-align: left;'
      : chart.alignment === 'right'
      ? 'margin-left: auto; margin-right: 0; text-align: right;'
      : 'margin-left: auto; margin-right: auto; text-align: center;';

  return `
<figure id="${chart.id}" class="editor-figure editor-chart-figure" data-chart-figure="true" data-chart-id="${chart.id}" data-chart-type="${chart.chartType}" data-chart-config="${encodedConfig}" contenteditable="false" oncontextmenu="event.preventDefault();" style="${alignStyle} width: ${chart.width}px; max-width: 100%; margin-top: 14px; margin-bottom: 14px; display: block; user-select: none;">
  <div class="editor-chart-mount" data-chart-mount-id="${chart.id}" style="width: 100%; position: relative;"></div>
  ${chart.caption ? `<figcaption style="margin-top: 6px; font-size: 10.5pt; font-weight: 600; color: #475569; text-align: center; font-family: Calibri, 'Segoe UI', Arial, sans-serif;">${chart.caption}</figcaption>` : ''}
</figure>
<p><br/></p>
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
