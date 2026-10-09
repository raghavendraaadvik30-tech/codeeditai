import {
  useMemo,
  useState,
} from "react";

import type {
  StyleToken,
} from "../types/styles.types";

export function useStyleGallery(
  styles: StyleToken[],
) {
  const [query, setQuery] =
    useState("");

  const [openStyle, setOpenStyle] =
    useState<string | null>(null);

  const [removedNames, setRemovedNames] =
    useState<string[]>([]);

  const visibleStyles =
    useMemo(() => {
      const normalized =
        query.trim().toLowerCase();

      return styles.filter((style) => {
        const removed =
          removedNames.includes(
            style.name,
          );

        if (removed) {
          return false;
        }

        if (!normalized) {
          return true;
        }

        return style.name
          .toLowerCase()
          .includes(normalized);
      });
    }, [
      styles,
      query,
      removedNames,
    ]);

  const removedStyles =
    useMemo(
      () =>
        styles.filter((style) =>
          removedNames.includes(
            style.name,
          ),
        ),
      [styles, removedNames],
    );

  const removeStyle = (
    name: string,
  ) => {
    setRemovedNames((current) =>
      current.includes(name)
        ? current
        : [...current, name],
    );

    if (openStyle === name) {
      setOpenStyle(null);
    }
  };

  const restoreStyle = (
    name: string,
  ) => {
    setRemovedNames((current) =>
      current.filter(
        (item) => item !== name,
      ),
    );
  };

  return {
    query,
    setQuery,

    openStyle,
    setOpenStyle,

    visibleStyles,
    removedStyles,

    removeStyle,
    restoreStyle,
  };
}
