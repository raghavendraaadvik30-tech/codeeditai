/**
 * --------------------------------------------------------
 * Module: Tables
 * Feature: Table Validation Schemas
 * Description:
 * Zod schemas for runtime validation of table configurations
 * and payload parameters.
 * --------------------------------------------------------
 */

import { z } from "zod";

export const TableConfigSchema = z.object({
  rows: z.number().int().min(1, "Must have at least 1 row").max(50, "Max 50 rows"),
  cols: z.number().int().min(1, "Must have at least 1 column").max(20, "Max 20 columns"),
  hasHeader: z.boolean(),
  style: z.enum(["default", "striped", "bordered", "clinical", "minimal", "darkHeader"]),
  bordered: z.boolean(),
  striped: z.boolean(),
  width: z.string().default("100%"),
  caption: z.string().optional(),
});

export const CreateTableSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  config: TableConfigSchema,
});

export type TableConfigValues = z.infer<typeof TableConfigSchema>;
export type CreateTableFormValues = z.infer<typeof CreateTableSchema>;
