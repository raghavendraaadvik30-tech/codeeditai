/*
Purpose:
Bottom tool bar used on phones. It replaces the vertical IconSidebar,
which needs too much width on a small screen. Tapping an item opens the
same left panel that the sidebar opens, as a full-screen sheet.
*/

import { Sparkles } from "lucide-react";

import { useEditor } from "../../hooks/useEditor";
import { SIDEBAR_ITEMS } from "./sidebarItems";

export default function MobileToolNav() {
  const {
    activePanel,
    setActivePanel,
    leftPanelOpen,
    setLeftPanelOpen,
    aiPanelOpen,
    setAiPanelOpen,
  } = useEditor();

  const itemClass = (active: boolean) =>
    `flex min-w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors ${
      active
        ? "bg-white text-[#324480] shadow-xs dark:bg-[#132742] dark:text-[#38BDF8]"
        : "text-[#324480]/80 dark:text-[#8BA0B8]"
    }`;

  return (
    <nav
      aria-label="Editor tools"
      className="mobile-scroll-x shrink-0 border-t border-[#E0E7EF] bg-[#D3E3FD] dark:border-[#1E3A5F] dark:bg-[#0B1528]"
    >
      <div className="flex items-stretch gap-1 px-2 py-1">
        <button
          type="button"
          onClick={() => {
            setLeftPanelOpen(false);
            setAiPanelOpen((open) => !open);
          }}
          className={itemClass(aiPanelOpen)}
        >
          <Sparkles className="h-5 w-5" />
          <span>AI</span>
        </button>

        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = leftPanelOpen && activePanel === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setAiPanelOpen(false);
                setActivePanel(item.id);
                setLeftPanelOpen(true);
              }}
              className={itemClass(active)}
            >
              <Icon className="h-5 w-5" />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
