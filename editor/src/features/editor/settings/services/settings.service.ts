/**
 * --------------------------------------------------------
 * Module: Settings
 * Feature: Settings Application Service
 * Description:
 * Core business logic for applying editor themes, document styles,
 * auto-save timers, and typography preferences.
 * --------------------------------------------------------
 */

import { settingsApi } from "../api";
import type { EditorSettings, SettingsPatch } from "../types";

export class SettingsService {
  public static async load(): Promise<EditorSettings> {
    return settingsApi.fetchSettings();
  }

  public static async update(patch: SettingsPatch): Promise<EditorSettings> {
    const updated = await settingsApi.patchSettings(patch);
    this.applyTheme(updated.theme);
    return updated;
  }

  public static async reset(): Promise<EditorSettings> {
    const defaultSettings = await settingsApi.resetSettings();
    this.applyTheme(defaultSettings.theme);
    return defaultSettings;
  }

  public static applyTheme(theme: EditorSettings["theme"]): void {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }
}
