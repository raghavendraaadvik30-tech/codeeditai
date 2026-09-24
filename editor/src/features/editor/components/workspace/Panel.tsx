/*
Purpose:
Presentation component that displays the content area for the active workspace
module or tool panel.

Flow:
User clicks an icon
  -> IconSidebar
  -> LeftOverlay
  -> Panel
  -> modules/<module-name>/index.ts
*/

import type { ComponentType } from "react";
import { Search } from "lucide-react";

import type { ModuleId } from "../../data/workspaceModules";
import { StylesPage } from "../../styles";
import { DocumentPage } from "../../modules/document";
import { TablesPage } from "../../tables";
import { SettingsPage } from "../../settings";
import { FiguresPage } from "../../modules/figures";
import { WritingPage } from "../../modules/writing";
import { LinksPage } from "../../modules/links";
import { TrackChangesPage } from "../../modules/trackChanges";
import { SymbolsPage } from "../../modules/symbols";

/* --------------------------------
   PROPS
-------------------------------- */

export interface PanelProps {
  moduleId: ModuleId;
}

/* --------------------------------
   PANEL MAP
-------------------------------- */

export const PANEL_MAP: Partial<Record<ModuleId, ComponentType>> = {
  document: DocumentPage,
  styles: StylesPage,
  tables: TablesPage,
  figures: FiguresPage,
  writing: WritingPage,
  links: LinksPage,
  symbols: SymbolsPage,
  trackChanges: TrackChangesPage,
  settings: SettingsPage,
};

/* --------------------------------
   PANEL COMPONENT
-------------------------------- */

export default function Panel({ moduleId }: PanelProps) {
  console.log("🔥 PANEL RECEIVED:", moduleId);

  const ActiveComponent = PANEL_MAP[moduleId];

  if (ActiveComponent) {
    return <ActiveComponent />;
  }

  return <GenericPanel title={moduleId} />;
}

/* --------------------------------
   LINKS
-------------------------------- */

export function LinksPanel() {
  return (
    <div className="space-y-4">
      <button
        type="button"
        className="
          w-full
          rounded-lg
          bg-blue-600
          px-4
          py-2.5
          text-sm
          font-medium
          text-white
          hover:bg-blue-700
        "
      >
        + Register Reference Link
      </button>

      <div>
        <p className="mb-2 text-xs font-medium text-slate-500">
          QUICK INSERT
        </p>

        <div className="grid grid-cols-2 gap-2">
          {[
            "Internal Ref",
            "External Link",
            "Bookmark",
            "Cross-ref",
          ].map((item) => (
            <button
              key={item}
              type="button"
              className="
                rounded-lg
                border
                border-slate-200
                bg-slate-50
                px-3
                py-2.5
                text-left
                text-xs
                font-medium
                hover:bg-blue-50
                dark:border-slate-700
                dark:bg-[#111D29]
              "
            >
              › {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------
   DOCUMENT
-------------------------------- */

export function DocumentPanel() {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border p-4">
        <p className="text-xs text-slate-500">
          Size
        </p>

        <p className="mt-1 text-sm font-medium">
          A4 (210 × 297 mm)
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-xs text-slate-500">
          Orientation
        </p>

        <p className="mt-1 text-sm font-medium">
          Portrait
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-xs text-slate-500">
          Margins
        </p>

        <p className="mt-1 text-sm font-medium">
          2.54 cm all
        </p>
      </div>
    </div>
  );
}

/* --------------------------------
   GENERIC
-------------------------------- */

export function GenericPanel({
  title,
}: {
  title: string;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Search Tools */}

      <div className="border-b border-slate-200 p-3 dark:border-slate-800">
        <div
          className="
            flex
            h-11
            items-center
            gap-2
            rounded-lg
            border
            border-slate-200
            bg-white
            px-3
            dark:border-slate-700
            dark:bg-[#111D29]
          "
        >
          <Search className="h-4 w-4 text-slate-400" />

          <input
            type="text"
            placeholder="Search tools..."
            className="
              w-full
              bg-transparent
              text-sm
              outline-none
              placeholder:text-slate-400
              dark:text-white
            "
          />
        </div>
      </div>

      {/* Generic Content */}

      <div className="flex-1 overflow-y-auto p-4">
        <div
          className="
            rounded-xl
            border
            border-dashed
            border-slate-300
            p-6
            text-center
            dark:border-slate-700
          "
        >
          <p className="text-sm font-medium capitalize">
            {title}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Tools for this section will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}