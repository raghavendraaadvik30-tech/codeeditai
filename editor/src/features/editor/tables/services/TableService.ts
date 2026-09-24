/**
 * --------------------------------------------------------
 * Module: Tables
 * Feature: Table Service
 * Description:
 * Business logic layer managing table templates, custom table
 * configuration, and HTML generation.
 * --------------------------------------------------------
 */

import { tableRepository } from "../repository";
import { tableApi } from "../api";
import { generateTableHtml, generateTemplateTableHtml } from "../utils";
import type { TableModel, TableTemplate, TableConfig } from "../types";

export class TableService {
  async getSavedTables(): Promise<TableModel[]> {
    return tableRepository.getAll();
  }

  async getTemplates(): Promise<TableTemplate[]> {
    return tableApi.fetchTableTemplates();
  }

  createTableHtml(config: TableConfig): string {
    return generateTableHtml(config);
  }

  createTemplateHtml(template: TableTemplate): string {
    return generateTemplateTableHtml(template);
  }
}

export const tableService = new TableService();
