/*### `IconSidebar.tsx` — Description

**Purpose:**
Creates the editor's **left-side icon navigation bar** and controls which editor panel is opened.

**What each part does:**

* **`SIDEBAR_ITEMS`** – Defines all available sidebar sections such as Document, Writing, Styles, Tables, References, Templates, and Settings.
* **`useEditor()`** – Gets the current active panel and functions to change/open panels.
* **`handlePanelClick()`** – Sets the selected panel and opens the left overlay panel.
* **`SIDEBAR_ITEMS.map()`** – Dynamically renders each sidebar icon from the configuration.
* **`isActive`** – Highlights the currently selected panel.
* **Active indicator** – Displays a blue indicator beside the active icon.
* **Hover tooltip** – Shows the panel name when the user hovers over an icon.
* **Dark mode** – Provides separate styling for light and dark themes.

**In short:**
`IconSidebar.tsx` is the **main navigation component for editor tools**. It does not contain the actual panel content; it only **selects and opens the required panel through `useEditor()`**.
*/

import {
  FileText,
  Link2,
  PenLine,
  Palette,
  Table2,
  Image,
  Bookmark,
  Sigma,
  Files,
  ShieldCheck,
  LayoutTemplate,
  Settings,
} from "lucide-react";

import { useEditor } from "../../hooks/useEditor";

const SIDEBAR_ITEMS = [
  {
    id: "document",
    label: "Document",
    icon: FileText,
  },
  {
    id: "links",
    label: "Links",
    icon: Link2,
  },
  {
    id: "writing",
    label: "Writing",
    icon: PenLine,
  },
  {
    id: "styles",
    label: "Styles",
    icon: Palette,
  },
  {
    id: "tables",
    label: "Tables",
    icon: Table2,
  },
  {
    id: "figures",
    label: "Figures",
    icon: Image,
  },
  {
    id: "references",
    label: "References",
    icon: Bookmark,
  },
  {
    id: "symbols",
    label: "Symbols",
    icon: Sigma,
  },
  {
    id: "appendices",
    label: "Appendices",
    icon: Files,
  },
  {
    id: "trackChanges",
    label: "Track Changes",
    icon: ShieldCheck,
  },
  {
    id: "templates",
    label: "Templates",
    icon: LayoutTemplate,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
] as const;

export default function IconSidebar() {
  const {
    activePanel,
    setActivePanel,
    setLeftPanelOpen,
  } = useEditor();

  const handlePanelClick = (panelId: string) => {
    setActivePanel(panelId);
    setLeftPanelOpen(true);
  };

  return (
    <div
      className="
        flex
        h-full
        w-[72px]
        shrink-0
        flex-col
        items-center
        border-r
        border-slate-200
        bg-white
        py-3
        dark:border-slate-800
        dark:bg-[#07131E]
      "
    >
      {/* =========================
          ALL WORKSPACE ICONS
      ========================= */}

      <div className="flex w-full flex-col items-center gap-1">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;

          const isActive =
            activePanel === item.id;

          return (
            <div
              key={item.id}
              className="group relative"
            >
              {/* ICON BUTTON */}

              <button
                type="button"
                onClick={() =>
                  handlePanelClick(item.id)
                }
                aria-label={item.label}
                className={`
                  relative
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-lg
                  transition-all
                  duration-150

                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  }
                `}
              >
                <Icon className="h-5 w-5" />

                {/* ACTIVE INDICATOR */}

                {isActive && (
                  <span
                    className="
                      absolute
                      -left-[2px]
                      top-1
                      bottom-1
                      w-[3px]
                      rounded-r-full
                      bg-blue-600
                    "
                  />
                )}
              </button>

              {/* =========================
                  HOVER TOOLTIP
              ========================= */}

              <div
                className="
                  pointer-events-none
                  absolute
                  left-[52px]
                  top-1/2
                  z-[100]
                  -translate-y-1/2
                  translate-x-1
                  whitespace-nowrap
                  rounded-md
                  bg-slate-900
                  px-3
                  py-1.5
                  text-xs
                  font-medium
                  text-white
                  opacity-0
                  shadow-lg
                  transition-all
                  duration-150

                  group-hover:translate-x-0
                  group-hover:opacity-100
                "
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}