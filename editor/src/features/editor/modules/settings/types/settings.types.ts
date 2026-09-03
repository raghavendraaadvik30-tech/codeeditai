/**
 * --------------------------------------------------------
 * Module: Settings
 * Feature: Settings Domain Types
 * Description:
 * TypeScript interfaces and type definitions for document editor
 * preferences, user profile, auto-save settings, layout options, and typography.
 * --------------------------------------------------------
 */

export type EditorTheme = "light" | "dark" | "system";
export type PageOrientation = "portrait" | "landscape";
export type PageSize = "A4" | "Letter" | "Legal";
export type DefaultFontFamily = "Inter" | "Roboto" | "Arial" | "Times New Roman" | "Courier New";
export type DefaultTableStyle = "clinical" | "striped" | "bordered" | "default" | "minimal" | "darkHeader";

export interface EditorSettings {
  // User Profile
  firstName: string;
  lastName: string;
  userName: string;
  userDesignation: string;
  employeeId: string;
  userEmail: string;
  userDepartment: string;
  userRole: string;
  phoneNumber: string;
  location: string;
  timeZone: string;
  userAvatarInitials: string;
  avatarUrl: string;

  // General & Appearance
  theme: EditorTheme;
  language: string;
  autoSave: boolean;
  autoSaveIntervalSeconds: number;
  enableNotifications: boolean;
  trackChangesByDefault: boolean;
  enableAiSuggestions: boolean;

  // Security & 2FA
  twoFactorEnabled: boolean;

  // Editor & Typography
  defaultFontFamily: DefaultFontFamily;
  defaultFontSize: number;
  lineHeight: number;
  spellCheck: boolean;
  wordCountTarget: number;

  // Layout & Display
  pageSize: PageSize;
  pageOrientation: PageOrientation;
  showRuler: boolean;
  showWordCount: boolean;
  showPageNumbers: boolean;
  defaultZoom: number;

  // Table Defaults
  defaultTableStyle: DefaultTableStyle;
  defaultTableBordered: boolean;
  defaultTableHeader: boolean;

  // Export & Print
  exportIncludeHeaderFooter: boolean;
  exportIncludePageNumbers: boolean;
}

export type SettingsPatch = Partial<EditorSettings>;
