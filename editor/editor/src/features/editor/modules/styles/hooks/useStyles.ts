import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  stylesService,
} from "../services/StylesService";

import type {
  StyleToken,
} from "../types/styles.types";

export function useStyles() {
  const [styles, setStyles] =
    useState<StyleToken[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<Error | null>(null);

  const loadStyles = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await stylesService.getStyles();

        setStyles(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to load styles"),
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadStyles();
  }, [loadStyles]);

  return {
    styles,
    loading,
    error,
    reload: loadStyles,
  };
}