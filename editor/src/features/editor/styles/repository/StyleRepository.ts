import {
  stylesApi,
} from "../api/stylesApi";

import type {
  StyleOverride,
  StyleToken,
} from "../types/styles.types";

export class StylesRepository {
  async getStyles(): Promise<StyleToken[]> {
    return stylesApi.getStyles();
  }

  async updateStyle(
    name: string,
    update: StyleOverride,
  ): Promise<StyleToken> {
    return stylesApi.updateStyle(
      name,
      update,
    );
  }

  async resetStyle(
    name: string,
  ): Promise<void> {
    return stylesApi.resetStyle(name);
  }

  async removeStyle(
    name: string,
  ): Promise<void> {
    return stylesApi.removeStyle(name);
  }

  async restoreStyle(
    name: string,
  ): Promise<void> {
    return stylesApi.restoreStyle(name);
  }
}

export const stylesRepository =
  new StylesRepository();