/**
 * --------------------------------------------------------
 * Module: Tables
 * Feature: Table Type Definitions
 * Description:
 * Data models, configuration interfaces, and templates contracts
 * defining type safety rules for table creation and management.
 * --------------------------------------------------------
 */

export type TableStyle =
  | 'default'
  | 'striped'
  | 'bordered'
  | 'clinical'
  | 'minimal'
  | 'darkHeader';

export interface TableConfig {
  rows: number;
  cols: number;
  hasHeader: boolean;
  style: TableStyle;
  bordered: boolean;
  striped: boolean;
  width: string;
  caption?: string;
}

export interface TableTemplate {
  id: string;
  title: string;
  description: string;
  rows: number;
  cols: number;
  headers: string[];
  sampleData?: string[][];
  style: TableStyle;
}

export interface TableCell {
  row: number;
  col: number;
  content: string;
  isHeader?: boolean;
  align?: 'left' | 'center' | 'right';
  colSpan?: number;
  rowSpan?: number;
}

export interface TableModel {
  id: string;
  title: string;
  config: TableConfig;
  createdAt: string;
  updatedAt: string;
}

export interface TableDTO {
  table_id: string;
  table_title: string;
  row_count: number;
  col_count: number;
  has_header: boolean;
  style_type: string;
  created_at: string;
}

export interface CreateTablePayload {
  title: string;
  config: TableConfig;
}

export interface UpdateTablePayload {
  title?: string;
  config?: Partial<TableConfig>;
}
