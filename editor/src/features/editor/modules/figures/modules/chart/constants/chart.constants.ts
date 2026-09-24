import type {
  ChartTypeOption,
  ChartSeries,
  ColorSchemeOption,
  ChartStyleOption,
  QuickLayoutOption,
} from '../types/chart.types';

export const CHART_TYPES: ChartTypeOption[] = [
  {
    type: 'column',
    name: 'Column',
    description: 'Vertical column bars comparing discrete categories',
    keywords: ['column', 'vertical', 'columns'],
  },
  {
    type: 'bar',
    name: 'Bar',
    description: 'Horizontal bar chart for comparing values',
    keywords: ['bar', 'bars', 'horizontal'],
  },
  {
    type: 'horizontalBar',
    name: 'Horizontal Bar',
    description: 'Extended horizontal bars oriented for categorical rankings',
    keywords: ['horizontal bar', 'bar', 'horizontal'],
  },
  {
    type: 'line',
    name: 'Line',
    description: 'Connected data points showing continuous trends',
    keywords: ['line', 'trend', 'trends'],
  },
  {
    type: 'area',
    name: 'Area',
    description: 'Filled area under a line showing magnitude over time',
    keywords: ['area', 'volume', 'filled'],
  },
  {
    type: 'pie',
    name: 'Pie',
    description: 'Circular chart divided into proportional slices',
    keywords: ['pie', 'slice', 'slices', 'proportion'],
  },
  {
    type: 'doughnut',
    name: 'Doughnut',
    description: 'Ring-shaped chart representing proportions of a whole',
    keywords: ['doughnut', 'donut', 'ring', 'hollow'],
  },
  {
    type: 'scatter',
    name: 'Scatter',
    description: 'Plot of individual coordinate points displaying correlations',
    keywords: ['scatter', 'points', 'dots', 'xy'],
  },
  {
    type: 'stackedColumn',
    name: 'Stacked Column',
    description: 'Vertical columns stacked to show part-to-whole relationships',
    keywords: ['stacked column', 'stacked bar', 'bar', 'stack'],
  },
  {
    type: 'combo',
    name: 'Combo',
    description: 'Combined column and line chart for multi-metric comparison',
    keywords: ['combo', 'combination', 'mixed', 'dual'],
  },
];

export const DEFAULT_CATEGORIES: string[] = [
  'Category 1',
  'Category 2',
  'Category 3',
  'Category 4',
];

export const DEFAULT_SERIES: ChartSeries[] = [
  {
    id: 's1',
    name: 'Series 1',
    color: '#2563eb',
    values: [4.3, 2.5, 3.5, 4.5],
    type: 'bar',
  },
  {
    id: 's2',
    name: 'Series 2',
    color: '#0284c7',
    values: [2.4, 4.4, 1.8, 2.8],
    type: 'bar',
  },
  {
    id: 's3',
    name: 'Series 3',
    color: '#10b981',
    values: [2.0, 2.0, 3.0, 5.0],
    type: 'line',
  },
];

export const COLOR_SCHEMES: ColorSchemeOption[] = [
  {
    id: 'colorful',
    name: 'Colorful 1',
    colors: ['#2563eb', '#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
  },
  {
    id: 'monochrome-blue',
    name: 'Monochromatic Blue',
    colors: ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
  },
  {
    id: 'warm',
    name: 'Warm Spectrum',
    colors: ['#ea580c', '#f97316', '#fb923c', '#e11d48', '#f43f5e', '#fb7185'],
  },
  {
    id: 'cool',
    name: 'Cool Palette',
    colors: ['#0d9488', '#14b8a6', '#06b6d4', '#0284c7', '#3b82f6', '#6366f1'],
  },
  {
    id: 'emerald',
    name: 'Emerald Fresh',
    colors: ['#047857', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
  },
];

export const ALL_CHART_STYLES: ChartStyleOption[] = [
  {
    id: 'style-1',
    name: 'Style 1',
    previewBg: '#ffffff',
    borderColor: '#e2e8f0',
    description: 'Clean modern layout with subtle borders and standard gridlines',
  },
  {
    id: 'style-2',
    name: 'Style 2',
    previewBg: '#f8fafc',
    borderColor: '#cbd5e1',
    description: 'Soft shaded background with rounded bars and accented legend',
  },
  {
    id: 'style-3',
    name: 'Style 3',
    previewBg: '#ffffff',
    borderColor: 'transparent',
    description: 'Minimalist frame with no outer borders and prominent data labels',
  },
  {
    id: 'style-4',
    name: 'Style 4',
    previewBg: '#0f172a',
    borderColor: '#334155',
    description: 'Dark contrast layout with bright vibrant series lines/bars',
  },
  {
    id: 'style-5',
    name: 'Style 5',
    previewBg: '#f1f5f9',
    borderColor: '#94a3b8',
    description: 'Structured report card style with bold headers and framed data grid',
  },
  {
    id: 'style-6',
    name: 'Style 6',
    previewBg: '#faf5ff',
    borderColor: '#e9d5ff',
    description: 'Soft lavender tinted theme with rounded container and elegant accent lines',
  },
];

export const CHART_STYLES: ChartStyleOption[] = [
  {
    id: 'style-1',
    name: 'Style 1',
    previewBg: '#ffffff',
    borderColor: '#e2e8f0',
    description: 'Clean modern layout with subtle borders and standard gridlines',
  },
  {
    id: 'style-4',
    name: 'Style 4',
    previewBg: '#0f172a',
    borderColor: '#334155',
    description: 'Dark contrast layout with bright vibrant series lines/bars',
  },
];


export const QUICK_LAYOUTS: QuickLayoutOption[] = [
  {
    id: 'layout-1',
    name: 'Layout 1',
    description: 'Title, Legend at Right, Gridlines, and Data Labels',
    legendPosition: 'right',
    showDataLabels: true,
    showGridlines: true,
    showXAxisTitle: false,
    showYAxisTitle: false,
  },
  {
    id: 'layout-2',
    name: 'Layout 2',
    description: 'Title, Legend at Top, Horizontal Gridlines',
    legendPosition: 'top',
    showDataLabels: false,
    showGridlines: true,
    showXAxisTitle: false,
    showYAxisTitle: false,
  },
  {
    id: 'layout-3',
    name: 'Layout 3',
    description: 'Title, Legend at Bottom, Axis Titles on both X & Y',
    legendPosition: 'bottom',
    showDataLabels: false,
    showGridlines: true,
    showXAxisTitle: true,
    showYAxisTitle: true,
  },
  {
    id: 'layout-4',
    name: 'Layout 4',
    description: 'Title, Inset Data Labels, Clean no-gridlines view',
    legendPosition: 'bottom',
    showDataLabels: true,
    showGridlines: false,
    showXAxisTitle: false,
    showYAxisTitle: false,
  },
];

export const CHART_PALETTE = COLOR_SCHEMES[0].colors;
