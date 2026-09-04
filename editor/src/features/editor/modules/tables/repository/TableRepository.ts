/**
 * --------------------------------------------------------
 * Module: Tables
 * Feature: Table Repository
 * Description:
 * Data access abstraction layer mapping backend TableDTOs
 * to frontend TableModel entities.
 * --------------------------------------------------------
 */

import { tableApi } from "../api";
import type { TableModel, TableDTO, TableConfig, TableStyle } from "../types";

export class TableRepository {
  private mapDtoToModel(dto: TableDTO): TableModel {
    const config: TableConfig = {
      rows: dto.row_count,
      cols: dto.col_count,
      hasHeader: dto.has_header,
      style: (dto.style_type as TableStyle) || "default",
      bordered: true,
      striped: dto.style_type === "striped",
      width: "100%",
    };

    return {
      id: dto.table_id,
      title: dto.table_title,
      config,
      createdAt: dto.created_at,
      updatedAt: dto.created_at,
    };
  }

  async getAll(): Promise<TableModel[]> {
    const dtos = await tableApi.fetchSavedTables();
    return dtos.map((dto) => this.mapDtoToModel(dto));
  }
}

export const tableRepository = new TableRepository();
