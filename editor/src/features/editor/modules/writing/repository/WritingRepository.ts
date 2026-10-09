export class WritingRepository {
  async saveState(): Promise<void> {
    // Writing tools currently operate directly on the editor.
    // Persistence can be connected here later if required.
  }

  async loadState(): Promise<void> {
    // Reserved for future persistence.
  }
}
