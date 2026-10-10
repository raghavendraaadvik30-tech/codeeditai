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
        w-13.5
        shrink-0
        flex-col
        items-center
        border-r
        border-[#E0E7EF]
        bg-[#D3E3FD]
        dark:border-[#1E3A5F]
        dark:bg-[#0B1528]
        py-2
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
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  transition-all
                  duration-150
                  cursor-pointer
                  ${
                    isActive
                      ? "bg-white text-[#324480] shadow-xs border border-[#E0E7EF] dark:bg-[#132742] dark:text-[#38BDF8] dark:border-[#1E3A5F]"
                      : "text-[#324480]/80 hover:bg-white/60 hover:text-[#324480] dark:text-[#8BA0B8] dark:hover:bg-white/5 dark:hover:text-white"
                  }
                `}
              >
                <Icon className="h-4.5 w-4.5" />
              </button>

              {/* HOVER TOOLTIP */}
              <div
                className="
                  pointer-events-none
                  absolute
                  left-12
                  top-1/2
                  z-[9999]
                  w-max
                  max-w-60
                  -translate-y-1/2
                  translate-x-1
                  rounded-xl
                  border
                  border-[#E0E7EF]
                  bg-white
                  dark:border-[#1E3A5F]
                  dark:bg-[#0E1F36]
                  px-3
                  py-1.5
                  opacity-0
                  shadow-lg
                  transition-all
                  duration-150
                  group-hover:translate-x-0
                  group-hover:opacity-100
                "
              >
                <div
                  className="
                    text-xs
                    font-semibold
                    leading-tight
                    text-[#324480]
                    dark:text-white
                  "
                >
                  {item.label}
                </div>

                <div
                  className="
                    mt-0.5
                    text-[10px]
                    leading-tight
                    text-[#64748B]
                    dark:text-[#8BA0B8]
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
