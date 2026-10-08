import {
  DEFAULT_STYLES,
} from "../constants/styles.constants";

import type {
  StyleOverride,
  StyleToken,
} from "../types/styles.types";

export class StyleRepository {
  private styles: StyleToken[] = [
    ...DEFAULT_STYLES,
  ];

  async getStyles(): Promise<StyleToken[]> {
    return [...this.styles];
  }

  async updateStyle(
    name: string,
    update: StyleOverride,
  ): Promise<StyleToken> {
    const index =
      this.styles.findIndex(
        (style) => style.name === name,
      );

    if (index === -1) {
      throw new Error(
        `Style "${name}" not found`,
      );
    }

    this.styles[index] = {
      ...this.styles[index],
      ...update,
    };

    return {
      ...this.styles[index],
    };
  }

  async resetStyle(
    name: string,
  ): Promise<StyleToken> {
    const original =
      DEFAULT_STYLES.find(
        (style) => style.name === name,
      );

    if (!original) {
      throw new Error(
        `Style "${name}" not found`,
      );
    }

    const index =
      this.styles.findIndex(
        (style) => style.name === name,
      );

    this.styles[index] = {
      ...original,
    };

    return {
      ...original,
    };
  }
}