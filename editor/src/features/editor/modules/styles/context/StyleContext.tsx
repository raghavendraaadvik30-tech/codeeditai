import {
  createContext,
  useContext,
  useMemo,
} from "react";

import {
  DEFAULT_STYLE_TOKENS,
} from "../constants/styles.constants";

import {
  useStyleGallery,
} from "../hooks/useStyleGallery";

import type {
  StyleToken,
  StylesContextValue,
} from "../types/styles.types";

interface Props {
  children: React.ReactNode;

  styles?: StyleToken[];

  overrides?: Record<
    string,
    Partial<StyleToken>
  >;
}

const StylesContext =
  createContext<StylesContextValue | null>(
    null,
  );

export function StylesProvider({
  children,
  styles = DEFAULT_STYLE_TOKENS,
  overrides = {},
}: Props) {
  const gallery =
    useStyleGallery(
      styles,
      overrides,
    );

  const value =
    useMemo<StylesContextValue>(
      () => ({
        styles,

        visibleStyles:
          gallery.visibleStyles,

        removedStyles:
          gallery.removedStyles,

        query:
          gallery.query,

        setQuery:
          gallery.setQuery,

        openStyle:
          gallery.openStyle,

        setOpenStyle:
          gallery.setOpenStyle,

        /*
         * These operations are handled by
         * StylesPanel because they require
         * access to the editor/document model.
         */
        applyStyle: () => {},

        updateToMatchSelection:
          () => {},

        selectAllInstances:
          () => {},

        clearFormatting:
          () => {},

        revertStyle:
          () => {},

        removeStyle:
          gallery.removeStyle,

        restoreStyle:
          gallery.restoreStyle,

        modifyStyle:
          () => {},
      }),
      [
        styles,
        gallery,
      ],
    );

  return (
    <StylesContext.Provider
      value={value}
    >
      {children}
    </StylesContext.Provider>
  );
}

export function useStylesContext() {
  const context =
    useContext(StylesContext);

  if (!context) {
    throw new Error(
      "useStylesContext must be used inside StylesProvider",
    );
  }

  return context;
}