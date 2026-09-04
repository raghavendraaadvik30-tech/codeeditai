/**
 * --------------------------------------------------------
 * Module: Settings
 * Feature: Settings Storage Repository
 * Description:
 * Persists and retrieves user editor settings from LocalStorage.
 * --------------------------------------------------------
 */

import { DEFAULT_EDITOR_SETTINGS, SETTINGS_STORAGE_KEY } from "../constants";
import type { EditorSettings, SettingsPatch } from "../types";

export class SettingsRepository {
  public static getSettings(): EditorSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return { ...DEFAULT_EDITOR_SETTINGS };
      const parsed = JSON.parse(raw) as Partial<EditorSettings>;
      return { ...DEFAULT_EDITOR_SETTINGS, ...parsed };
    } catch {
      return { ...DEFAULT_EDITOR_SETTINGS };
    }
  }

  public static saveSettings(settings: EditorSettings): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore quota errors
    }
  }

  public static updateSettings(patch: SettingsPatch): EditorSettings {
    const current = this.getSettings();
    const updated: EditorSettings = { ...current, ...patch };
    this.saveSettings(updated);
    return updated;
  }

  public static resetSettings(): EditorSettings {
    this.saveSettings(DEFAULT_EDITOR_SETTINGS);
    return { ...DEFAULT_EDITOR_SETTINGS };
  }
}
