/**
 * --------------------------------------------------------
 * Module: Tables
 * Feature: useTable React Hook
 * Description:
 * Public consumer hook exposing table insertion, templates,
 * and cell manipulation tools.
 * --------------------------------------------------------
 */

import { useTableContext } from "../context";
import { TABLE_TEMPLATES } from "../constants";

export function useTable() {
  const tableContext = useTableContext();

  return {
    ...tableContext,
    templates: TABLE_TEMPLATES,
  };
}
