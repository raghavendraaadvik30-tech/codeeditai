/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { ChartModel, ChartType } from '../types/chart.types';
import {
  COLOR_SCHEMES,
  CHART_STYLES,
  ALL_CHART_STYLES,
  QUICK_LAYOUTS,
} from '../constants/chart.constants';
import { transposeChartData, getDefaultChartCaption, isDefaultChartCaption } from '../utils/chartUtil';

export interface ChartContextValue {
  activeChart: ChartModel | null;
  activeChartId: string | null;
  setActiveChart: (chart: ChartModel | null) => void;
  updateActiveChart: (patch: Partial<ChartModel>) => void;
  isSpreadsheetOpen: boolean;
  setIsSpreadsheetOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  isChangeTypeModalOpen: boolean;
  setIsChangeTypeModalOpen: (open: boolean) => void;
  isSelectDataModalOpen: boolean;
  setIsSelectDataModalOpen: (open: boolean) => void;
  isColorModalOpen: boolean;
  setIsColorModalOpen: (open: boolean) => void;
  isStyleModalOpen: boolean;
  setIsStyleModalOpen: (open: boolean) => void;
  changeChartType: (type: ChartType) => void;
  switchRowColumn: () => void;
  changeColorScheme: (schemeId: string) => void;
  changeChartStyle: (styleId: string) => void;
  applyQuickLayout: (layoutId: string) => void;
  deleteActiveChart: () => void;
  refreshActiveChart: () => void;
  // Handler registered by ChartHydration to sync DOM & model
  registerSyncHandler: (
    handler: (chartId: string, updated: ChartModel | null) => void
  ) => () => void;
}

const ChartContext = createContext<ChartContextValue | null>(null);

export const ChartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeChart, setActiveChartState] = useState<ChartModel | null>(null);
  const [isSpreadsheetOpen, setIsSpreadsheetOpen] = useState(false);
  const [isChangeTypeModalOpen, setIsChangeTypeModalOpen] = useState(false);
  const [isSelectDataModalOpen, setIsSelectDataModalOpen] = useState(false);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);

  // Sync callbacks registered by document hydration
  const syncHandlerRef = React.useRef<
    ((chartId: string, updated: ChartModel | null) => void) | null
  >(null);

  const registerSyncHandler = useCallback(
    (handler: (chartId: string, updated: ChartModel | null) => void) => {
      syncHandlerRef.current = handler;
      return () => {
        if (syncHandlerRef.current === handler) {
          syncHandlerRef.current = null;
        }
      };
    },
    []
  );

  const setActiveChart = useCallback((chart: ChartModel | null) => {
    setActiveChartState(chart);
    if (!chart) {
      setIsSpreadsheetOpen(false);
    }
  }, []);

  const updateActiveChart = useCallback(
    (patch: Partial<ChartModel>) => {
      if (!activeChart) return;
      const updated: ChartModel = {
        ...activeChart,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      setActiveChartState(updated);
      if (syncHandlerRef.current) {
        syncHandlerRef.current(updated.id, updated);
      }
    },
    [activeChart]
  );

  const changeChartType = useCallback(
    (type: ChartType) => {
      if (!activeChart) return;
      const isDefault = isDefaultChartCaption(activeChart.caption, activeChart.chartType);
      const newCaption = isDefault ? getDefaultChartCaption(type) : activeChart.caption;
      updateActiveChart({ chartType: type, caption: newCaption });
      setIsChangeTypeModalOpen(false);
    },
    [activeChart, updateActiveChart]
  );

  const switchRowColumn = useCallback(() => {
    if (!activeChart) return;
    const transposed = transposeChartData(activeChart);
    setActiveChartState(transposed);
    if (syncHandlerRef.current) {
      syncHandlerRef.current(transposed.id, transposed);
    }
  }, [activeChart]);

  const changeColorScheme = useCallback(
    (schemeId: string) => {
      if (!activeChart) return;
      const scheme = COLOR_SCHEMES.find((s) => s.id === schemeId);
      if (!scheme) return;

      const colors = scheme.colors;
      const updatedSeries = activeChart.series.map((s, idx) => ({
        ...s,
        color: colors[idx % colors.length],
      }));

      updateActiveChart({
        colorScheme: schemeId,
        series: updatedSeries,
      });
    },
    [activeChart, updateActiveChart]
  );

  const changeChartStyle = useCallback(
    (styleId: string) => {
      if (!activeChart) return;
      const style = CHART_STYLES.find((s) => s.id === styleId) || ALL_CHART_STYLES.find((s) => s.id === styleId);
      if (!style) return;

      updateActiveChart({
        chartStyle: styleId,
        backgroundColor: style.previewBg,
        borderColor: style.borderColor,
      });
    },
    [activeChart, updateActiveChart]
  );

  const applyQuickLayout = useCallback(
    (layoutId: string) => {
      if (!activeChart) return;
      const layout = QUICK_LAYOUTS.find((l) => l.id === layoutId);
      if (!layout) return;

      updateActiveChart({
        legendPosition: layout.legendPosition,
        showDataLabels: layout.showDataLabels,
        showGridlines: layout.showGridlines,
        showXAxisTitle: layout.showXAxisTitle,
        showYAxisTitle: layout.showYAxisTitle,
      });
    },
    [activeChart, updateActiveChart]
  );

  const deleteActiveChart = useCallback(() => {
    if (!activeChart) return;
    const chartId = activeChart.id;
    setActiveChartState(null);
    setIsSpreadsheetOpen(false);
    if (syncHandlerRef.current) {
      syncHandlerRef.current(chartId, null);
    }
  }, [activeChart]);

  const refreshActiveChart = useCallback(() => {
    if (!activeChart) return;
    updateActiveChart({ updatedAt: new Date().toISOString() });
  }, [activeChart, updateActiveChart]);

  const value = useMemo(
    () => ({
      activeChart,
      activeChartId: activeChart?.id || null,
      setActiveChart,
      updateActiveChart,
      isSpreadsheetOpen,
      setIsSpreadsheetOpen,
      isChangeTypeModalOpen,
      setIsChangeTypeModalOpen,
      isSelectDataModalOpen,
      setIsSelectDataModalOpen,
      isColorModalOpen,
      setIsColorModalOpen,
      isStyleModalOpen,
      setIsStyleModalOpen,
      changeChartType,
      switchRowColumn,
      changeColorScheme,
      changeChartStyle,
      applyQuickLayout,
      deleteActiveChart,
      refreshActiveChart,
      registerSyncHandler,
    }),
    [
      activeChart,
      isSpreadsheetOpen,
      isChangeTypeModalOpen,
      isSelectDataModalOpen,
      isColorModalOpen,
      isStyleModalOpen,
      setActiveChart,
      updateActiveChart,
      changeChartType,
      switchRowColumn,
      changeColorScheme,
      changeChartStyle,
      applyQuickLayout,
      deleteActiveChart,
      refreshActiveChart,
      registerSyncHandler,
    ]
  );

  return <ChartContext.Provider value={value}>{children}</ChartContext.Provider>;
};

export function useChartContext() {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error('useChartContext must be used within ChartProvider');
  }
  return context;
}
