/*
Purpose:
Displays the currently selected editor panel and renders its items.

Flow:
User clicks an icon
  -> IconSidebar
  -> LeftOverlay
  -> Panel
  -> modules/<module-name>/index.ts
*/

import type { ComponentType } from "react";
import {
  X,
  FileText,
  Palette,
  Edit3,
  Link2,
  Settings,
  Image as ImageIcon,
  GitCompare,
  Sigma,
  Bookmark,
  Files,
} from "lucide-react";

import { useEditor } from "../../hooks/useEditor";
import type { ModuleId } from "../../data/workspaceModules";

import Panel from "./Panel";
import { PANEL_DATA } from "./panelData";
import type { PanelType } from "./panelData";

import { SymbolsPage } from "../../modules/symbols";

/* --------------------------------
   PANEL TITLES
-------------------------------- */

const PANEL_TITLES: Partial<Record<PanelType, string>> = {
  writing: "Writing",
  links: "Links",
  styles: "Styles",
  tables: "Tables",
  figures: "Figures",
  references: "References",
  symbols: "Symbols",
  document: "Documents",
  settings: "Settings",
  trackChanges: "Track Changes",
  appendices: "Appendices",
};

/* --------------------------------
   PANEL DESCRIPTIONS
-------------------------------- */

const PANEL_DESCRIPTIONS: Partial<Record<PanelType, string>> = {
  writing: "Casing, emphasis & paragraph control",
  links: "Internal, external & cross references",
  styles: "Document styles",
  tables: "Insert and manage tables",
  figures: "Images and figures",
  references: "References and citations",
  symbols: "Greek, math & regulatory",
  document: "Manage clinical documents & records",
  settings: "Editor settings",
  trackChanges: "Review and tracking",
  appendices: "Document appendices and annexes",
};

/* --------------------------------
   PANEL ICONS
-------------------------------- */

const PANEL_ICONS: Partial<Record<PanelType, typeof FileText>> = {
  document: FileText,
  styles: Palette,
  writing: Edit3,
  links: Link2,
  symbols: Sigma,
  settings: Settings,
  figures: ImageIcon,
  trackChanges: GitCompare,
  references: Bookmark,
  appendices: Files,
  tables: FileText,
};

/* --------------------------------
   PANEL MAPPING
-------------------------------- */

const panelMap: Partial<
  Record<PanelType, ComponentType<{ moduleId: ModuleId }>>
> = {
  styles: Panel,
  writing: Panel,
  links: Panel,
  document: Panel,
  tables: Panel,
  settings: Panel,
  figures: Panel,
  trackChanges: Panel,
  references: Panel,
  appendices: Panel,

  symbols: ({ moduleId }) => {
    void moduleId;
    return <SymbolsPage />;
  },
};

/* --------------------------------
   COMPONENT
-------------------------------- */

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
    PANEL_TITLES[panelKey] ?? "Document";

  const description =
    PANEL_DESCRIPTIONS[panelKey] ?? "";

  const ActivePanel =
    panelMap[panelKey];

  const HeaderIcon =
    PANEL_ICONS[panelKey] ?? FileText;

  return (
    <div className="flex h-full min-h-0 flex-col bg-card text-foreground dark:bg-[#07131E] dark:text-muted">

      {/* HEADER */}

      <div
        className="
          flex
          h-18.5
          shrink-0
          items-center
          justify-between
          border-b
          border-secondary
          bg-card
          px-5
          dark:border-muted
          dark:bg-[#07131E]
        "
      >
        {/* TITLE + ICON */}

        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-primary/10
              text-primary
              dark:bg-brand/20
              dark:text-brand
            "
          >
            <HeaderIcon className="h-5 w-5" />
          </div>

          <div>
            <h2
              className="
                text-sm
                font-semibold
                text-foreground
                dark:text-primary-foreground
              "
            >
              {title}
            </h2>

            <p
              className="
                text-xs
                text-muted-foreground
                dark:text-muted-foreground
              "
            >
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
            shrink-0
            items-center
            justify-center
            rounded-md
            text-muted-foreground
            transition-colors
            hover:bg-muted
            hover:text-foreground
            dark:text-muted-foreground
            dark:hover:bg-muted
            dark:hover:text-primary-foreground
          "
          aria-label="Close panel"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* PANEL CONTENT */}

      <div className="min-h-0 flex-1 overflow-hidden">
        {ActivePanel ? (
          <ActivePanel
            moduleId={panelKey as ModuleId}
          />
        ) : (
          <div className="min-h-0 h-full overflow-y-auto p-4">
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
                      border-secondary
                      bg-card
                      p-3
                      text-left
                      transition-colors
                      hover:border-primary/30
                      hover:bg-muted
                      dark:border-secondary-foreground
                      dark:bg-[#111D29]
                      dark:hover:bg-muted
                    "
                  >
                    {/* ITEM ICON */}

                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-md
                        bg-muted
                        text-secondary-foreground
                        dark:bg-muted
                        dark:text-muted-foreground
                      "
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* ITEM TEXT */}

                    <div className="min-w-0">
                      <p
                        className="
                          text-sm
                          font-medium
                          text-foreground
                          dark:text-primary-foreground
                        "
                      >
                        {item.title}
                      </p>

                      {item.description && (
                        <p
                          className="
                            mt-0.5
                            text-xs
                            text-muted-foreground
                            dark:text-muted-foreground
                          "
                        >
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