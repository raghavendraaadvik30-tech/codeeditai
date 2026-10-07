/**
 * --------------------------------------------------------
 * Module: Settings
 * Feature: SettingsPanel Component
 * Description:
 * Quick settings sidebar panel for instant workspace customizations.
 * --------------------------------------------------------
 */

import { Moon, Sun, Monitor, Type, Layout } from "lucide-react";
import { useSettings } from "../hooks";
import { AVAILABLE_FONT_FAMILIES } from "../constants";
import type { DefaultFontFamily, EditorTheme } from "../types";

export function SettingsPanel() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-4 p-4 text-xs">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Workspace Preferences
      </div>

      {/* Theme Selection */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-secondary-foreground dark:text-muted-foreground">
          Color Theme
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: "Light", value: "light" as EditorTheme, icon: Sun },
            { label: "Dark", value: "dark" as EditorTheme, icon: Moon },
            { label: "Auto", value: "system" as EditorTheme, icon: Monitor },
          ].map(({ label, value, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => updateSettings({ theme: value })}
              className={`flex items-center justify-center gap-1.5 rounded-lg border p-1.5 text-xs transition-colors ${
                settings.theme === value
                  ? "border-[#0078d4] bg-[#0078d4]/10 text-[#0078d4] font-semibold"
                  : "border-secondary bg-card hover:bg-muted dark:border-muted dark:bg-secondary"
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-secondary-foreground dark:text-muted-foreground">
          <Type className="h-3.5 w-3.5" />
          <span>Editor Typography</span>
        </div>
        <select
          value={settings.defaultFontFamily}
          onChange={(e) => updateSettings({ defaultFontFamily: e.target.value as DefaultFontFamily })}
          className="h-8 w-full rounded-md border border-secondary bg-card px-2 outline-none focus:border-[#0078d4] dark:border-secondary-foreground dark:bg-secondary"
        >
          {AVAILABLE_FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Layout Options */}
      <div className="space-y-2 pt-2 border-t border-muted dark:border-muted">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-secondary-foreground dark:text-muted-foreground">
          <Layout className="h-3.5 w-3.5" />
          <span>Document Display</span>
        </div>

        <label className="flex items-center justify-between cursor-pointer select-none">
          <span className="text-secondary-foreground dark:text-muted-foreground">Show Ruler</span>
          <input
            type="checkbox"
            checked={settings.showRuler}
            onChange={(e) => updateSettings({ showRuler: e.target.checked })}
            className="rounded border-border text-[#0078d4] focus:ring-[#0078d4]"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer select-none">
          <span className="text-secondary-foreground dark:text-muted-foreground">Show Word Count</span>
          <input
            type="checkbox"
            checked={settings.showWordCount}
            onChange={(e) => updateSettings({ showWordCount: e.target.checked })}
            className="rounded border-border text-[#0078d4] focus:ring-[#0078d4]"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer select-none">
          <span className="text-secondary-foreground dark:text-muted-foreground">Show Page Numbers</span>
          <input
            type="checkbox"
            checked={settings.showPageNumbers}
            onChange={(e) => updateSettings({ showPageNumbers: e.target.checked })}
            className="rounded border-border text-[#0078d4] focus:ring-[#0078d4]"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer select-none">
          <span className="text-secondary-foreground dark:text-muted-foreground">Spell Check</span>
          <input
            type="checkbox"
            checked={settings.spellCheck}
            onChange={(e) => updateSettings({ spellCheck: e.target.checked })}
            className="rounded border-border text-[#0078d4] focus:ring-[#0078d4]"
          />
        </label>
      </div>
    </div>
  );
}
