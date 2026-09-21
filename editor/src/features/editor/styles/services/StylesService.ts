import {
  DEFAULT_STYLE_TOKENS,
} from "../constants/styles.constants";

import {
  stylesRepository,
} from "../repository/StyleRepository";

import type {
  StyleOverride,
  StyleToken,
} from "../types/styles.types";

import {
  mergeStyle,
  validateStyle,
} from "../utils/styleUtil";

export class StylesService {
  async getStyles(): Promise<StyleToken[]> {
    const remote =
      await stylesRepository.getStyles();

    if (!remote.length) {
      return DEFAULT_STYLE_TOKENS;
    }

    return remote;
  }

  resolveStyles(
    styles: StyleToken[],
    overrides: Record<
      string,
      StyleOverride
    >,
  ): StyleToken[] {
    return styles.map((style) =>
      mergeStyle(
        style,
        overrides[style.name],
      ),
    );
  }

  async updateStyle(
    name: string,
    update: StyleOverride,
  ): Promise<StyleToken> {
    const baseStyle =
      DEFAULT_STYLE_TOKENS.find(
        (style) =>
          style.name === name,
      );

    if (!baseStyle) {
      throw new Error(
        `Style "${name}" not found`,
      );
    }

    const style: StyleToken = {
      ...baseStyle,
      ...update,
    };

    if (!validateStyle(style)) {
      throw new Error(
        "Invalid style configuration",
      );
    }

    await stylesRepository.updateStyle(
      name,
      update,
    );

    return style;
  }

  async revertStyle(
    name: string,
  ): Promise<void> {
    await stylesRepository.resetStyle(
      name,
    );
  }
}

export const stylesService =
  new StylesService();