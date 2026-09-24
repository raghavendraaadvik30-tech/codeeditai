/**
 * --------------------------------------------------------
 * Module: Settings
 * Feature: Settings Validation Schemas
 * Description:
 * Zod validation schemas for editor configuration and preferences.
 * --------------------------------------------------------
 */

import { z } from "zod";

export const EditorSettingsSchema = z.object({
  firstName: z.string().default("Gunda"),
  lastName: z.string().default("R K"),
  userName: z.string().default("Gunda R K"),
  userDesignation: z.string().default("Senior Clinical Document Lead"),
  employeeId: z.string().default("PX-89401"),
  userEmail: z.string().email().default("sarah.jenkins@parexel.com"),
  userDepartment: z.string().default("Clinical Research"),
  userRole: z.string().default("Author"),
  phoneNumber: z.string().default("+1 (555) 382-9012"),
  location: z.string().default("Boston, MA, USA"),
  timeZone: z.string().default("America/New_York (EST)"),
  userAvatarInitials: z.string().default("GR"),
  avatarUrl: z.string().default(""),

  theme: z.enum(["light", "dark", "system"]).default("light"),
  language: z.string().default("English (US)"),
  autoSave: z.boolean().default(true),
  autoSaveIntervalSeconds: z.number().int().min(5).max(300).default(30),
  enableNotifications: z.boolean().default(true),
  trackChangesByDefault: z.boolean().default(true),
  enableAiSuggestions: z.boolean().default(true),

  twoFactorEnabled: z.boolean().default(true),

  defaultFontFamily: z.enum(["Inter", "Roboto", "Arial", "Times New Roman", "Courier New"]).default("Inter"),
  defaultFontSize: z.number().int().min(8).max(36).default(14),
  lineHeight: z.number().min(1).max(3).default(1.6),
  spellCheck: z.boolean().default(true),
  wordCountTarget: z.number().int().min(0).default(1000),

  pageSize: z.enum(["A4", "Letter", "Legal"]).default("A4"),
  pageOrientation: z.enum(["portrait", "landscape"]).default("portrait"),
  showRuler: z.boolean().default(true),
  showWordCount: z.boolean().default(true),
  showPageNumbers: z.boolean().default(true),
  defaultZoom: z.number().int().min(50).max(200).default(100),

  defaultTableStyle: z.enum(["clinical", "striped", "bordered", "default", "minimal", "darkHeader"]).default("clinical"),
  defaultTableBordered: z.boolean().default(true),
  defaultTableHeader: z.boolean().default(false),

  exportIncludeHeaderFooter: z.boolean().default(true),
  exportIncludePageNumbers: z.boolean().default(true),
});

export type EditorSettingsValues = z.infer<typeof EditorSettingsSchema>;
