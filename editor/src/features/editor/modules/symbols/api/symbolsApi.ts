import type { SymbolGroup } from "../types/symbols.types";

export interface SymbolsApi {
  getGroups(): Promise<SymbolGroup[]>;
}
