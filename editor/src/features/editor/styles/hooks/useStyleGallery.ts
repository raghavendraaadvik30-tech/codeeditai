import {
  useMemo,
  useState,
} from "react";

import type {
  StyleToken,
} from "../types/styles.types";

export function useStyleGallery(
  styles: StyleToken[],
  overrides: Record<
    string,
    Partial<StyleToken>
  > = {},
) {
  const [query, setQuery] =
    useState("");

  const [hidden, setHidden] =
    useState<Set<string>>(
      new Set(),
    );

  const [openStyle, setOpenStyle] =
    useState<string | null>(null);

  const resolved = useMemo(
    () =>
      styles.map((style) => ({
        ...style,
        ...(overrides[style.name] ?? {}),
      })),
    [styles, overrides],
  );

  const visibleStyles = useMemo(
    () =>
      resolved.filter(
        (style) =>
          !style.hiddenFromGallery &&
          !hidden.has(style.name) &&
          (!query ||
            style.name
              .toLowerCase()
              .includes(
                query.toLowerCase(),
              )),
      ),
    [resolved, hidden, query],
  );

  const removedStyles = useMemo(
    () =>
      resolved.filter(
        (style) =>
          !style.hiddenFromGallery &&
          hidden.has(style.name) &&
          (!query ||
            style.name
              .toLowerCase()
              .includes(
                query.toLowerCase(),
              )),
      ),
    [resolved, hidden, query],
  );

  const removeStyle = (
    name: string,
  ) => {
    setHidden(
      (previous) =>
        new Set([
          ...previous,
          name,
        ]),
    );

    setOpenStyle(null);
  };

  const restoreStyle = (
    name: string,
  ) => {
    setHidden((previous) => {
      const next =
        new Set(previous);

      next.delete(name);

      return next;
    });
  };

  return {
    query,
    setQuery,

    openStyle,
    setOpenStyle,

    resolved,
    visibleStyles,
    removedStyles,

    removeStyle,
    restoreStyle,
  };
}