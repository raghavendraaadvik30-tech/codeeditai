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
  Settings,
} from "lucide-react";

import { useEditor } from "../../hooks/useEditor";

const SIDEBAR_ITEMS = [
  {
    id: "document",
    label: "Document",
    description: "Document tools",
    icon: FileText,
  },
  {
    id: "links",
    label: "Links",
    description: "Internal, external & cross references",
    icon: Link2,
  },
  {
    id: "writing",
    label: "Writing",
    description: "Writing and formatting tools",
    icon: PenLine,
  },
  {
    id: "styles",
    label: "Styles",
    description: "Document styles",
    icon: Palette,
  },
  {
    id: "tables",
    label: "Tables",
    description: "Smart table wizard",
    icon: Table2,
  },
  {
    id: "figures",
    label: "Figures",
    description: "Images and figures",
    icon: Image,
  },
  {
    id: "references",
    label: "References",
    description: "References and citations",
    icon: Bookmark,
  },
  {
    id: "symbols",
    label: "Symbols",
    description: "Special symbols",
    icon: Sigma,
  },
  {
    id: "appendices",
    label: "Appendices",
    description: "Document appendices",
    icon: Files,
  },
  {
    id: "trackChanges",
    label: "Track Changes",
    description: "Review document changes",
    icon: ShieldCheck,
  },
  {
    id: "settings",
    label: "Settings",
    description: "Editor settings",
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
        w-18
        shrink-0
        flex-col
        items-center
        border-r
        border-sidebar-border
        bg-sidebar
        py-3
        dark:border-muted
        dark:bg-[#07131E]
      "
    >
      <div className="flex w-full flex-col items-center gap-1">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;

          return (
            <div
              key={item.id}
              className="group relative"
            >
              <button
                type="button"
                onClick={() => handlePanelClick(item.id)}
                aria-label={item.label}
                className={`
                  relative
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  transition-all
                  duration-150
                  ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-xs border border-sidebar-border/60 dark:bg-primary dark:text-primary-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-primary-foreground"
                  }
                `}
              >
                <Icon className="h-5 w-5" />

                {isActive && (
                  <span
                    className="
                      absolute
                      -left-0.5
                      top-1.5
                      bottom-1.5
                      w-0.75
                      rounded-r-full
                      bg-primary
                    "
                  />
                )}
              </button>

              {/* HOVER TOOLTIP */}

              <div
                className="
                  pointer-events-none
                  absolute
                  left-13.5
                  top-1/2
                  z-[9999]
                  w-max
                  max-w-60
                  -translate-y-1/2
                  translate-x-1
                  rounded-xl
                  border
                  border-sidebar-border
                  bg-card
                  px-4
                  py-2.5
                  opacity-0
                  shadow-lg
                  transition-all
                  duration-150
                  group-hover:translate-x-0
                  group-hover:opacity-100
                  dark:border-secondary-foreground
                  dark:bg-[#111D29]
                "
              >
                <div
                  className="
                    text-sm
                    font-semibold
                    leading-5
                    text-foreground
                    dark:text-primary-foreground
                  "
                >
                  {item.label}
                </div>

                <div
                  className="
                    mt-0.5
                    text-xs
                    leading-4
                    text-muted-foreground
                    dark:text-muted-foreground
                  "
                >
                  {item.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
