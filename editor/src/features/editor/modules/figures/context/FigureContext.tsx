/**
 * --------------------------------------------------------
 * Module: Figures / Figure
 * Feature: Figure Feature Context
 * Description:
 * React Context provider managing local figure selections, active figure
 * dimensions, captions, layout state, and UI binding for figure components.
 * --------------------------------------------------------
 */

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { FigureModel, FigureAlignment } from "../types";
import { DEFAULT_FIGURE } from "../constants";

interface FigureContextValue {
  activeFigure: FigureModel | null;
  setActiveFigure: (figure: FigureModel | null) => void;
  updateActiveCaption: (caption: string) => void;
  updateActiveAlignment: (alignment: FigureAlignment) => void;
  updateActiveDimensions: (width: number, height?: number) => void;
}

const FigureContext = createContext<FigureContextValue | null>(null);

export function FigureProvider({
  children,
  initialFigure = DEFAULT_FIGURE,
}: {
  children: ReactNode;
  initialFigure?: FigureModel | null;
}) {
  const [activeFigure, setActiveFigure] = useState<FigureModel | null>(initialFigure);

  const updateActiveCaption = (caption: string) => {
    if (!activeFigure) return;
    setActiveFigure((prev) => (prev ? { ...prev, caption, updatedAt: new Date().toISOString() } : null));
  };

  const updateActiveAlignment = (alignment: FigureAlignment) => {
    if (!activeFigure) return;
    setActiveFigure((prev) => (prev ? { ...prev, alignment, updatedAt: new Date().toISOString() } : null));
  };

  const updateActiveDimensions = (width: number, height?: number) => {
    if (!activeFigure) return;
    setActiveFigure((prev) => (prev ? { ...prev, width, height, updatedAt: new Date().toISOString() } : null));
  };

  const value = useMemo(
    () => ({
      activeFigure,
      setActiveFigure,
      updateActiveCaption,
      updateActiveAlignment,
      updateActiveDimensions,
    }),
    [activeFigure],
  );

  return <FigureContext.Provider value={value}>{children}</FigureContext.Provider>;
}

export function useFigureContext() {
  const context = useContext(FigureContext);
  if (!context) {
    throw new Error("useFigureContext must be used within FigureProvider");
  }
  return context;
}
