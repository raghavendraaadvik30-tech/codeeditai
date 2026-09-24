import { SymbolsRepository } from "../repository/SymbolsRepository";

import type { SymbolGroup } from "../types/symbols.types";

export class SymbolsService {
  private readonly repository: SymbolsRepository;

  constructor(
    repository = new SymbolsRepository()
  ) {
    this.repository = repository;
  }

  async getGroups(): Promise<SymbolGroup[]> {
    return this.repository.getGroups();
  }
}