import type {
  StyleOverride,
  StyleToken,
} from "../types/styles.types";

export interface StylesApi {
  getStyles(): Promise<StyleToken[]>;

  updateStyle(
    name: string,
    update: StyleOverride,
  ): Promise<StyleToken>;

  resetStyle(
    name: string,
  ): Promise<StyleToken>;
}
