/**
 * --------------------------------------------------------
 * Module: Tables
 * Feature: Table Constants & Defaults
 * Description:
 * Default configurations, predefined templates, and size limits
 * for table insertion and styling.
 * --------------------------------------------------------
 */

import type { TableConfig, TableTemplate } from "../types";

export const DEFAULT_TABLE_CONFIG: TableConfig = {
  rows: 3,
  cols: 3,
  hasHeader: false,
  style: "default",
  bordered: true,
  striped: false,
  width: "100%",
};

export const TABLE_MAX_GRID_ROWS = 10;
export const TABLE_MAX_GRID_COLS = 10;

export const TABLE_TEMPLATES: TableTemplate[] = [
  {
    id: "clinical_cohort",
    title: "Clinical Trial Cohort",
    description: "Subject demographics and dosage groupings",
    rows: 4,
    cols: 4,
    headers: ["Subject ID", "Age / Sex", "Dosage Group", "Response Status"],
    sampleData: [
      ["SUBJ-001", "45 / M", "Cohort A (10mg)", "Confirmed Response"],
      ["SUBJ-002", "52 / F", "Cohort A (10mg)", "Stable Disease"],
      ["SUBJ-003", "38 / M", "Cohort B (25mg)", "Partial Response"],
    ],
    style: "clinical",
  },
  {
    id: "lab_results",
    title: "Laboratory Panel",
    description: "Biomarker parameters, reference ranges, and findings",
    rows: 4,
    cols: 4,
    headers: ["Parameter", "Measured Value", "Reference Range", "Flag"],
    sampleData: [
      ["Hemoglobin", "14.2 g/dL", "13.5 - 17.5 g/dL", "Normal"],
      ["White Blood Count", "6.8 x10^3/uL", "4.5 - 11.0 x10^3/uL", "Normal"],
      ["Platelets", "140 x10^3/uL", "150 - 450 x10^3/uL", "Low"],
    ],
    style: "bordered",
  },
  {
    id: "summary_matrix",
    title: "Executive Summary",
    description: "Multi-column summary with alternating rows",
    rows: 4,
    cols: 3,
    headers: ["Milestone", "Target Date", "Status"],
    sampleData: [
      ["Protocol Finalization", "Q1 2026", "Completed"],
      ["First Patient In (FPI)", "Q2 2026", "In Progress"],
      ["Interim Analysis", "Q4 2026", "Scheduled"],
    ],
    style: "striped",
  },
  {
    id: "simple_grid",
    title: "Standard Data Grid",
    description: "Simple clean grid with header",
    rows: 3,
    cols: 3,
    headers: ["Column 1", "Column 2", "Column 3"],
    sampleData: [
      ["Data 1", "Data 2", "Data 3"],
      ["Data 4", "Data 5", "Data 6"],
    ],
    style: "default",
  },
];
