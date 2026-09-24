/*Purpose:
Displays the currently selected editor panel and renders its items on the screen.

What it does:

Gets activePanel from useEditor().
Determines which panel is currently active.
Uses panelMap to open the appropriate Panel component.
Falls back to PANEL_DATA for panels that do not yet have custom components.
Renders the panel header.
Handles closing the left panel using setLeftPanelOpen(false).

Flow:
User clicks an icon -> LeftOverlay.tsx -> panelMap -> Panel.tsx -> modules/<module-name>/index.ts
*/

import type { ComponentType } from "react";
import { X, FileText, Palette, Edit3, Link2, Settings, Image as ImageIcon, GitCompare } from "lucide-react";

import { useEditor } from "../../hooks/useEditor";
import type { ModuleId } from "../../data/workspaceModules";

import Panel from "./Panel";
import { PANEL_DATA } from "./panelData";
import type { PanelType } from "./panelData";

const PANEL_TITLES: Partial<Record<PanelType, string>> = {
  writing: "Writing",
  links: "Links",
  styles: "Styles",
  tables: "Tables",
  figures: "Figures",
  references: "References",
  symbols: "Symbols",
  templates: "Templates",
  document: "Documents",
  settings: "Settings",
  trackChanges: "Track Changes",
};

const PANEL_DESCRIPTIONS: Partial<Record<PanelType, string>> = {
  writing: "Writing and formatting tools",
  links: "Internal, external & cross references",
  styles: "Document styles",
  tables: "Insert and manage tables",
  figures: "Images and figures",
  references: "References and citations",
  symbols: "Special symbols",
  templates: "Document templates",
  document: "Manage clinical documents & records",
  settings: "Editor settings",
  trackChanges: "Review and tracking",
};

const PANEL_ICONS: Partial<Record<PanelType, typeof FileText>> = {
  document: FileText,
  styles: Palette,
  writing: Edit3,
  links: Link2,
  settings: Settings,
  figures: ImageIcon,
  trackChanges: GitCompare,
};

/* --------------------------------
   PANEL MAPPING
-------------------------------- */
const panelMap: Partial<Record<PanelType, ComponentType<{ moduleId: ModuleId }>>> = {
  styles: Panel,
  writing: Panel,
  links: Panel,
  document: Panel,
  tables: Panel,
  settings: Panel,
  figures: Panel,
  trackChanges: Panel,
};

export default function LeftOverlay() {
  const {
    activePanel,
    setLeftPanelOpen,
  } = useEditor();

  const panelKey =
    (activePanel as PanelType) ?? "document";

  const items =
    PANEL_DATA[panelKey] ??
    PANEL_DATA.document;

  const title =
    PANEL_TITLES[panelKey];

  const description =
    PANEL_DESCRIPTIONS[panelKey];

  const ActivePanel = panelMap[panelKey];
  const HeaderIcon = PANEL_ICONS[panelKey] ?? FileText;

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">

      {/* HEADER */}
      <div
        className="
          flex
          h-[74px]
          shrink-0
          items-center
          justify-between
          border-b
          border-slate-200
          dark:border-slate-800
          px-5
        "
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500 dark:bg-[#0078d4]/20 dark:text-[#0078d4]">
            <HeaderIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {description}
            </p>
          </div>
        </div>

        {/* CLOSE */}
        <button
          type="button"
          onClick={() => setLeftPanelOpen(false)}
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-md
            text-slate-500
            transition-colors
            hover:bg-slate-100
            hover:text-slate-900
          "
          aria-label="Close panel"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* DYNAMIC CONTENT */}
      <div className="min-h-0 flex-1 flex flex-col overflow-hidden">
        {ActivePanel ? (
          <ActivePanel moduleId={panelKey as ModuleId} />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {items.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      p-3
                      text-left
                      transition-colors
                      hover:bg-slate-50
                      hover:border-blue-200
                    "
                  >
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-md
                        bg-slate-100
                        text-slate-600
                      "
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800">
                        {item.title}
                      </p>

                      {item.description && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}