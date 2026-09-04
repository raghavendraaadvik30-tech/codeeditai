/**
 * --------------------------------------------------------
 * Module: Settings
 * Feature: Settings Constants & Defaults
 * Description:
 * Default configurations, limits, and fallback settings for the editor.
 * --------------------------------------------------------
 */

import type { EditorSettings } from "../types";

export const SETTINGS_STORAGE_KEY = "document_editor_user_settings_v1";

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  firstName: "Gunda",
  lastName: "R K",
  userName: "Gunda R K",
  userDesignation: "Senior Clinical Document Lead",
  employeeId: "PX-89401",
  userRole: "Author",
  userDepartment: "Clinical Research",
  userEmail: "sarah.jenkins@parexel.com",
  phoneNumber: "+1 (555) 382-9012",
  location: "Boston, MA, USA",
  timeZone: "America/New_York (EST)",
  userAvatarInitials: "GR",
  avatarUrl: "",

  theme: "light",
  language: "English (US)",
  autoSave: true,
  autoSaveIntervalSeconds: 30,
  enableNotifications: true,
  trackChangesByDefault: true,
  enableAiSuggestions: true,

  twoFactorEnabled: true,

  defaultFontFamily: "Inter",
  defaultFontSize: 14,
  lineHeight: 1.6,
  spellCheck: true,
  wordCountTarget: 1000,

  pageSize: "A4",
  pageOrientation: "portrait",
  showRuler: false,
  showWordCount: true,
  showPageNumbers: true,
  defaultZoom: 100,

  defaultTableStyle: "clinical",
  defaultTableBordered: true,
  defaultTableHeader: false,

  exportIncludeHeaderFooter: true,
  exportIncludePageNumbers: true,
};

export const AVAILABLE_FONT_FAMILIES = [
  { label: "Inter (Default)", value: "Inter" },
  { label: "Roboto", value: "Roboto" },
  { label: "Arial", value: "Arial" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Courier New (Monospace)", value: "Courier New" },
] as const;

export const AVAILABLE_PAGE_SIZES = [
  { label: "A4 (210 x 297 mm)", value: "A4" },
  { label: "Letter (8.5 x 11 in)", value: "Letter" },
  { label: "Legal (8.5 x 14 in)", value: "Legal" },
] as const;

export const AVAILABLE_TABLE_STYLES = [
  { label: "Clinical / Medical (Blue Header)", value: "clinical" },
  { label: "Striped Rows", value: "striped" },
  { label: "Bordered Grid", value: "bordered" },
  { label: "Default Clean", value: "default" },
  { label: "Minimal / Borderless", value: "minimal" },
  { label: "Dark Header", value: "darkHeader" },
] as const;

export const AVAILABLE_LANGUAGES = [
  { label: "English (US)", value: "English (US)" },
  { label: "English (UK)", value: "English (UK)" },
  { label: "Spanish (Español)", value: "Spanish (Español)" },
  { label: "French (Français)", value: "French (Français)" },
  { label: "German (Deutsch)", value: "German (Deutsch)" },
  { label: "Japanese (日本語)", value: "Japanese (日本語)" },
] as const;
