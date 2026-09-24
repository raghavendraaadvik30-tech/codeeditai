export type ChartType =
  | 'column'
  | 'bar'
  | 'horizontalBar'
  | 'line'
  | 'area'
  | 'pie'
  | 'doughnut'
  | 'scatter'
  | 'stackedColumn'
  | 'combo';

export interface ChartSeries {
  id: string;
  name: string;
  color?: string;
  values: number[];
  type?: 'bar' | 'line' | 'area'; // for combo
}

export type LegendPosition = 'top' | 'bottom' | 'left' | 'right';
export type DataLabelPosition = 'none' | 'center' | 'top' | 'insideEnd' | 'outsideEnd';
export type TitleAlignment = 'left' | 'center' | 'right';

export interface ChartModel {
  id: string;
  type: 'chart';
  chartType: ChartType;
  title: string;
  showTitle?: boolean;
  titleAlignment?: TitleAlignment;
  
  categories: string[];
  series: ChartSeries[];

  // Chart Elements
  showLegend?: boolean;
  legendPosition?: LegendPosition;
  showDataLabels?: boolean;
  dataLabelPosition?: DataLabelPosition;
  showGridlines?: boolean;
  showXAxisTitle?: boolean;
  xAxisTitle?: string;
  showYAxisTitle?: boolean;
  yAxisTitle?: string;

  // Visual Styles & Theme
  colorScheme?: string;
  chartStyle?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;

  // Dimensions & Layout
  width: number;
  height: number;
  alignment?: 'center' | 'left' | 'right';
  position?: { x: number; y: number };
  caption?: string;

  // Spreadsheet editor visibility
  isSpreadsheetOpen?: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface ChartTypeOption {
  type: ChartType;
  name: string;
  description: string;
  keywords: string[];
}

export interface ColorSchemeOption {
  id: string;
  name: string;
  colors: string[];
}

export interface ChartStyleOption {
  id: string;
  name: string;
  previewBg: string;
  borderColor: string;
  description: string;
}

export interface QuickLayoutOption {
  id: string;
  name: string;
  description: string;
  legendPosition: LegendPosition;
  showDataLabels: boolean;
  showGridlines: boolean;
  showXAxisTitle: boolean;
  showYAxisTitle: boolean;
}
