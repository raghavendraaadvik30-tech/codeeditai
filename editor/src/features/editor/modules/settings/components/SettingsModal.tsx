/**
 * --------------------------------------------------------
 * Module: Settings
 * Feature: SettingsModal Component
 * Description:
 * Preferences and editor configuration modal dialog.
 * --------------------------------------------------------
 */

import { useState } from "react";
import { Settings, X, Moon, Sun, Monitor, Save, RotateCcw } from "lucide-react";
import { useSettings } from "../hooks";
import { AVAILABLE_FONT_FAMILIES, AVAILABLE_PAGE_SIZES } from "../constants";
import type { DefaultFontFamily, EditorTheme, PageSize } from "../types";

export function SettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<"general" | "editor" | "layout">("general");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-secondary bg-card p-6 shadow-2xl dark:border-muted dark:bg-[#0c1929]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-muted pb-3 dark:border-muted">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground dark:text-primary-foreground">
                Editor Preferences
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Configure your writing environment and document settings
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted dark:hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-muted pt-3 dark:border-muted text-xs">
          {(["general", "editor", "layout"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 pb-2 px-3 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "border-brand text-brand"
                  : "border-transparent text-muted-foreground hover:text-foreground dark:hover:text-muted-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 text-xs">
          {activeTab === "general" && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-secondary-foreground dark:text-muted-foreground">
                  Theme
                </label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {[
                    { label: "Light", value: "light" as EditorTheme, icon: Sun },
                    { label: "Dark", value: "dark" as EditorTheme, icon: Moon },
                    { label: "System", value: "system" as EditorTheme, icon: Monitor },
                  ].map(({ label, value, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateSettings({ theme: value })}
                      className={`flex items-center justify-center gap-1.5 rounded-lg border p-2 text-xs transition-colors ${
                        settings.theme === value
                          ? "border-brand bg-brand/10 text-brand font-semibold"
                          : "border-secondary hover:bg-muted dark:border-muted dark:hover:bg-secondary"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="font-medium text-secondary-foreground dark:text-muted-foreground">Auto-Save</div>
                  <div className="text-[11px] text-muted-foreground">Automatically save document changes</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => updateSettings({ autoSave: e.target.checked })}
                  className="rounded border-border text-brand focus:ring-brand"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-secondary-foreground dark:text-muted-foreground">AI Writing Assistant</div>
                  <div className="text-[11px] text-muted-foreground">Enable real-time AI suggestions and tools</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableAiSuggestions}
                  onChange={(e) => updateSettings({ enableAiSuggestions: e.target.checked })}
                  className="rounded border-border text-brand focus:ring-brand"
                />
              </div>
            </div>
          )}

          {activeTab === "editor" && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-secondary-foreground dark:text-muted-foreground">
                  Default Font Family
                </label>
                <select
                  value={settings.defaultFontFamily}
                  onChange={(e) => updateSettings({ defaultFontFamily: e.target.value as DefaultFontFamily })}
                  className="mt-1 h-8 w-full rounded-md border border-secondary px-2 outline-none focus:border-brand dark:border-secondary-foreground dark:bg-secondary"
                >
                  {AVAILABLE_FONT_FAMILIES.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-secondary-foreground dark:text-muted-foreground">
                    Font Size (pt)
                  </label>
                  <input
                    type="number"
                    min={8}
                    max={36}
                    value={settings.defaultFontSize}
                    onChange={(e) => updateSettings({ defaultFontSize: Number(e.target.value) })}
                    className="mt-1 h-8 w-full rounded-md border border-secondary px-3 outline-none focus:border-brand dark:border-secondary-foreground dark:bg-secondary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-secondary-foreground dark:text-muted-foreground">
                    Target Word Count
                  </label>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={settings.wordCountTarget}
                    onChange={(e) => updateSettings({ wordCountTarget: Number(e.target.value) })}
                    className="mt-1 h-8 w-full rounded-md border border-secondary px-3 outline-none focus:border-brand dark:border-secondary-foreground dark:bg-secondary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-secondary-foreground dark:text-muted-foreground">Spell Check</span>
                <input
                  type="checkbox"
                  checked={settings.spellCheck}
                  onChange={(e) => updateSettings({ spellCheck: e.target.checked })}
                  className="rounded border-border text-brand focus:ring-brand"
                />
              </div>
            </div>
          )}

          {activeTab === "layout" && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-secondary-foreground dark:text-muted-foreground">
                  Default Page Size
                </label>
                <select
                  value={settings.pageSize}
                  onChange={(e) => updateSettings({ pageSize: e.target.value as PageSize })}
                  className="mt-1 h-8 w-full rounded-md border border-secondary px-2 outline-none focus:border-brand dark:border-secondary-foreground dark:bg-secondary"
                >
                  {AVAILABLE_PAGE_SIZES.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-secondary-foreground dark:text-muted-foreground">Show Word Count in Status Bar</span>
                <input
                  type="checkbox"
                  checked={settings.showWordCount}
                  onChange={(e) => updateSettings({ showWordCount: e.target.checked })}
                  className="rounded border-border text-brand focus:ring-brand"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-secondary-foreground dark:text-muted-foreground">Show Page Numbers</span>
                <input
                  type="checkbox"
                  checked={settings.showPageNumbers}
                  onChange={(e) => updateSettings({ showPageNumbers: e.target.checked })}
                  className="rounded border-border text-brand focus:ring-brand"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-muted pt-3 dark:border-muted">
          <button
            type="button"
            onClick={resetSettings}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted dark:hover:bg-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-brand-deep transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save & Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
