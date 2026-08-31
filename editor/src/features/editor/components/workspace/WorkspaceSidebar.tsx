/*
Purpose:
Acts as the main container that combines the workspace toolbar and expandable panel.

What it does:

Uses useWorkspacePanel() to manage panel state.
Renders WorkspaceToolbar for module navigation.
Opens the selected panel using WorkspacePanel.
Displays WorkspacePanelHeader above the panel content.
Uses Framer Motion for smooth open/close animation.
Supports closing the panel through closePanel().

Flow:

WorkspaceToolbar → Select Module → WorkspaceSidebar → WorkspacePanelHeader + WorkspacePanel

In short:
WorkspaceSidebar.tsx connects the toolbar, panel header and panel content into one expandable sidebar system.

*/


import { AnimatePresence, motion } from "framer-motion";

import { useWorkspacePanel } from "../../hooks/useWorkspacePanel";

import WorkspaceToolbar from "./WorkspaceToolbar";
import WorkspacePanel from "./WorkspacePanel";
import WorkspacePanelHeader from "./WorkspacePanelHeader";

export default function WorkspaceSidebar() {
  const {
    activePanel,
    leftPanelOpen,
    togglePanel,
    closePanel,
  } = useWorkspacePanel();

  return (
    <div className="flex h-full shrink-0">
      {/* =========================
          LEFT ICON TOOLBAR
      ========================= */}

      <WorkspaceToolbar
        activePanel={activePanel}
        onToggle={togglePanel}
      />

      {/* =========================
          LEFT OVERLAY
      ========================= */}

      <AnimatePresence initial={false}>
        {leftPanelOpen && activePanel && (
          <motion.aside
            key={activePanel}
            initial={{
              width: 0,
              opacity: 0,
            }}
            animate={{
              width: 360,
              opacity: 1,
            }}
            exit={{
              width: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.22,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="
              h-full
              shrink-0
              overflow-hidden
              border-r
              border-slate-200
              bg-white
              dark:border-slate-800
              dark:bg-[#07131E]
            "
          >
            <div className="flex h-full w-[360px] flex-col">
              {/* HEADER */}

              <WorkspacePanelHeader
                moduleId={activePanel}
                onClose={closePanel}
              />

              {/* CONTENT */}

              <div className="min-h-0 flex-1">
                <WorkspacePanel
                  moduleId={activePanel}
                />
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}