import type {
  StyleOverride,
  StyleToken,
} from "../types/styles.types";

import {
  StyleRepository,
} from "../repository/StyleRepository";

import {
  validateStyleUpdate,
} from "../utils/styleValidation";

export class StylesService {
  constructor(
    private repository: StyleRepository,
  ) {}

  async getStyles(): Promise<StyleToken[]> {
    return this.repository.getStyles();
  }

  async updateStyle(
    name: string,
    update: StyleOverride,
  ): Promise<StyleToken> {
    if (!validateStyleUpdate(update)) {
      throw new Error(
        "Invalid style update",
      );
    }

    return this.repository.updateStyle(
      name,
      update,
    );
  }

  async resetStyle(
    name: string,
  ): Promise<StyleToken> {
    return this.repository.resetStyle(
      name,
    );
  }
}
