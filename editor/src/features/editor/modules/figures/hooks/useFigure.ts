/**
 * --------------------------------------------------------
 * Module: Figures / Figure
 * Feature: useFigure React Hook
 * Description:
 * Hook encapsulating asynchronous figure fetching, list management,
 * loading & error states, and single figure operations.
 * --------------------------------------------------------
 */

import { useState, useEffect } from "react";
import { figureService } from "../services";
import type { FigureModel } from "../types";
import { DEFAULT_FIGURE } from "../constants";

export function useFigure(figureId?: string) {
  const [figure, setFigure] = useState<FigureModel>(DEFAULT_FIGURE);
  const [figuresList, setFiguresList] = useState<FigureModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let ignore = false;

    const fetchFigureData = async () => {
      try {
        setLoading(true);
        setError(null);
        if (figureId) {
          const item = await figureService.getFigureDetails(figureId);
          if (!ignore) setFigure(item);
        } else {
          const list = await figureService.listFigures();
          if (!ignore) {
            setFiguresList(list);
            if (list.length > 0) {
              setFigure(list[0]);
            }
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err : new Error("Failed to load figure data"));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchFigureData();

    return () => {
      ignore = true;
    };
  }, [figureId]);

  return {
    figure,
    figuresList,
    loading,
    error,
    updateCaption: (caption: string) => {
      setFigure((prev) => ({ ...prev, caption }));
    },
  };
}
