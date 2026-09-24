/**
 * --------------------------------------------------------
 * Module: Settings
 * Feature: Settings API Client
 * Description:
 * Asynchronous service layer wrapping settings queries and persistence.
 * --------------------------------------------------------
 */

import { SettingsRepository } from "../repository";
import type { EditorSettings, SettingsPatch } from "../types";

export const settingsApi = {
  fetchSettings: async (): Promise<EditorSettings> => {
    return SettingsRepository.getSettings();
  },

  saveSettings: async (settings: EditorSettings): Promise<EditorSettings> => {
    SettingsRepository.saveSettings(settings);
    return settings;
  },

  patchSettings: async (patch: SettingsPatch): Promise<EditorSettings> => {
    return SettingsRepository.updateSettings(patch);
  },

  resetSettings: async (): Promise<EditorSettings> => {
    return SettingsRepository.resetSettings();
  },
};
