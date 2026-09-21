/**
 * --------------------------------------------------------
 * Module: Tables
 * Feature: Table API Client
 * Description:
 * API calls and mock data providers for table definitions,
 * styles, and templates.
 * --------------------------------------------------------
 */

import type { TableDTO, TableTemplate } from "../types";
import { TABLE_TEMPLATES } from "../constants";

export const tableApi = {
  async fetchTableTemplates(): Promise<TableTemplate[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return TABLE_TEMPLATES;
  },

  async fetchSavedTables(): Promise<TableDTO[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return [
      {
        table_id: "tbl-01",
        table_title: "Clinical Trial Cohort",
        row_count: 4,
        col_count: 4,
        has_header: true,
        style_type: "clinical",
        created_at: new Date().toISOString(),
      },
      {
        table_id: "tbl-02",
        table_title: "Laboratory Panel",
        row_count: 4,
        col_count: 4,
        has_header: true,
        style_type: "bordered",
        created_at: new Date().toISOString(),
      },
    ];
  },
};
