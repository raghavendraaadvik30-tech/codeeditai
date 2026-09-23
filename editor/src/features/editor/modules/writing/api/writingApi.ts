export interface WritingApi {
  save(): Promise<void>;
  load(): Promise<void>;
}