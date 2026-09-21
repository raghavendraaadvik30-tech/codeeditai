import type {
  StyleToken,
  StyleOverride,
} from "../types/styles.types";

export interface StylesApi {
  getStyles(): Promise<StyleToken[]>;

  updateStyle(
    name: string,
    update: StyleOverride,
  ): Promise<StyleToken>;

  resetStyle(
    name: string,
  ): Promise<void>;

  removeStyle(
    name: string,
  ): Promise<void>;

  restoreStyle(
    name: string,
  ): Promise<void>;
}

/**
 * API layer.
 *
 * Replace the implementation with the
 * application's actual API client when the
 * backend endpoints are available.
 */
export const stylesApi: StylesApi = {
  async getStyles() {
    return [];
  },

  async updateStyle(name, update) {
    return {
      name,
      font: update.font ?? "Calibri",
      size: update.size ?? 11,
      weight: update.weight ?? 400,
      ...update,
    };
  },

  async resetStyle() {
    return;
  },

  async removeStyle() {
    return;
  },

  async restoreStyle() {
    return;
  },
};