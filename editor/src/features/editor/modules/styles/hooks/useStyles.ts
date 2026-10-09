import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  StyleOverride,
  StyleToken,
} from "../types/styles.types";

import {
  StylesService,
} from "../services/StylesService";
 
import {
  StyleRepository,
} from "../repository/StyleRepository";

const service =
  new StylesService(
    new StyleRepository(),
  );

export function useStyles() {
  const [styles, setStyles] =
    useState<StyleToken[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    service
      .getStyles()
      .then((result) => {
        if (mounted) {
          setStyles(result);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load styles",
          );
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const updateStyle = useCallback(
    async (
      name: string,
      update: StyleOverride,
    ) => {
      const updated =
        await service.updateStyle(
          name,
          update,
        );

      setStyles((current) =>
        current.map((style) =>
          style.name === name
            ? updated
            : style,
        ),
      );

      return updated;
    },
    [],
  );

  const resetStyle = useCallback(
    async (name: string) => {
      const reset =
        await service.resetStyle(name);

      setStyles((current) =>
        current.map((style) =>
          style.name === name
            ? reset
            : style,
        ),
      );

      return reset;
    },
    [],
  );

  return {
    styles,
    loading,
    error,
    updateStyle,
    resetStyle,
  };
}
