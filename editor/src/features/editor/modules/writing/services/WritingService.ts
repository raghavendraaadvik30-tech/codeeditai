import { WritingRepository } from "../repository/WritingRepository";

export class WritingService {
  private readonly repository: WritingRepository;

  constructor(repository = new WritingRepository()) {
    this.repository = repository;
  }

  async save(): Promise<void> {
    await this.repository.saveState();
  }

  async load(): Promise<void> {
    await this.repository.loadState();
  }
}