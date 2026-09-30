import { SYMBOL_GROUPS } from "../constants/symbols.constants";

import type { SymbolGroup } from "../types/symbols.types";

export class SymbolsRepository {
  async getGroups(): Promise<SymbolGroup[]> {
    return SYMBOL_GROUPS;
  }
}