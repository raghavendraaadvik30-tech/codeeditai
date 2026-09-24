/**
 * --------------------------------------------------------
 * Module: Settings
 * Feature: Settings React Context
 * Description:
 * React Context provider managing global editor settings and preferences.
 * --------------------------------------------------------
 */

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { DEFAULT_EDITOR_SETTINGS } from "../constants";
import { SettingsService } from "../services";
import type { EditorSettings, SettingsPatch } from "../types";

export interface SettingsContextValue {
  settings: EditorSettings;
  updateSettings: (patch: SettingsPatch) => Promise<void>;
  resetSettings: () => Promise<void>;
  isLoaded: boolean;
}

const fallbackContextValue: SettingsContextValue = {
  settings: DEFAULT_EDITOR_SETTINGS,
  updateSettings: async (patch: SettingsPatch) => {
    await SettingsService.update(patch);
  },
  resetSettings: async () => {
    await SettingsService.reset();
  },
  isLoaded: true,
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<EditorSettings>(DEFAULT_EDITOR_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    SettingsService.load().then((loaded) => {
      setSettings(loaded);
      SettingsService.applyTheme(loaded.theme);
      setIsLoaded(true);
    });
  }, []);

  const updateSettings = async (patch: SettingsPatch) => {
    const updated = await SettingsService.update(patch);
    setSettings(updated);
  };

  const resetSettings = async () => {
    const defaulted = await SettingsService.reset();
    setSettings(defaulted);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        isLoaded,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    return fallbackContextValue;
  }
  return context;
}
