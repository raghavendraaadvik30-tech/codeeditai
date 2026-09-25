/**
 * --------------------------------------------------------
 * Module: Settings
 * Feature: useSettings Custom Hook
 * Description:
 * Public consumer hook for accessing and updating editor settings.
 * --------------------------------------------------------
 */

import { useSettingsContext } from "../context";
import type { SettingsPatch } from "../types";

export function useSettings() {
  const { settings, updateSettings, resetSettings, isLoaded } = useSettingsContext();

  const toggleAutoSave = () => {
    updateSettings({ autoSave: !settings.autoSave });
  };

  const setTheme = (theme: "light" | "dark" | "system") => {
    updateSettings({ theme });
  };

  const setPageSize = (pageSize: "A4" | "Letter" | "Legal") => {
    updateSettings({ pageSize });
  };

  const setFontFamily = (defaultFontFamily: "Inter" | "Roboto" | "Arial" | "Times New Roman" | "Courier New") => {
    updateSettings({ defaultFontFamily });
  };

  const patchSettings = (patch: SettingsPatch) => {
    return updateSettings(patch);
  };

  return {
    settings,
    updateSettings: patchSettings,
    resetSettings,
    toggleAutoSave,
    setTheme,
    setPageSize,
    setFontFamily,
    isLoaded,
  };
}
