/*
### `EditorLayout.tsx` — Description

**Purpose:**
Defines the **main layout and structural arrangement of the document editor** by combining all major editor UI sections.

**Responsibilities:**

* Renders the **Editor Header** at the top.
* Displays the **Ribbon Toolbar** below the header.
* Provides the **left icon sidebar** for editor modules.
* Conditionally displays the **Left Overlay** when a workspace panel is open.
* Provides the main **Workspace** area for document editing.
* Conditionally displays the **AI Assistant panel** when enabled.
* Uses `useEditor()` to control the visibility of the left overlay and AI panel.
* Uses Flexbox and fixed-width side panels to maintain a responsive editor layout.

**Layout structure:**

```text
EditorLayout
├── EditorHeader
├── RibbonToolbar
└── Main Editor Area
    ├── IconSidebar
    ├── LeftOverlay (conditional)
    ├── Workspace
    └── AIPanel (conditional)
```

**In short:**

> `EditorLayout.tsx` acts as the **main UI container of the editor**, coordinating the header, ribbon, navigation sidebar, document workspace, left tools panel, and AI assistant panel.


*/

import EditorHeader from "../components/header/EditorHeader";
import RibbonToolbar from "../components/ribbon/RibbonToolbar";
import IconSidebar from "../components/sidebar/IconSidebar";
import LeftOverlay from "../components/overlay/LeftOverlay";
import Workspace from "../components/workspace/Workspace";
import AIPanel from "../components/ai/AIPanel";
import EditorStatusBar from "../components/statusbar/EditorStatusBar";
import { CommentsPanel, useComments } from "../components/comments";

import { useEditor } from "../hooks/useEditor";

export default function EditorLayout() {
  const {
    leftPanelOpen,
    aiPanelOpen,
  } = useEditor();

  const { isCommentsPanelOpen } = useComments();

  return (
    <div className="h-full w-full min-h-0 flex flex-col overflow-hidden">
      {/* HEADER */}
      <header className="shrink-0">
        <EditorHeader />
      </header>

      {/* BELOW HEADER: VERTICAL RAIL ON LEFT, WORKSPACE COLUMN ON RIGHT */}
      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
        {/* LEFT ICON SIDEBAR (Spanning full height from header to bottom of screen) */}
        <aside className="w-13.5 shrink-0 min-h-0 overflow-visible">
          <IconSidebar />
        </aside>

        {/* RIGHT COLUMN: RIBBON + CANVAS + STATUS BAR */}
        <div className="flex flex-1 flex-col min-h-0 min-w-0 overflow-hidden">
          {/* RIBBON */}
          <div className="shrink-0">
            <RibbonToolbar />
          </div>

          {/* MAIN EDITOR CANVAS AREA */}
          <main className="flex flex-1 min-h-0 min-w-0 overflow-hidden bg-[#F0F8FF] dark:bg-[#0B1528] p-3 gap-3.5 relative">
            {/* LEFT OVERLAY FLOATING CARD */}
            {leftPanelOpen && (
              <aside
                className="
                  w-84
                  shrink-0
                  h-full
                  min-h-0
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[#E0E7EF]
                  bg-white
                  shadow-xs
                  dark:border-[#1E3A5F]
                  dark:bg-[#0E1F36]
                  dark:shadow-xl
                  flex
                  flex-col
                "
              >
                <LeftOverlay />
              </aside>
            )}

            {/* WORKSPACE */}
            <section
              className="
                relative
                flex-1
                h-full
                min-w-0
                min-h-0
                overflow-hidden
              "
            >
              <Workspace />
            </section>

            {/* COMMENTS PANEL */}
            {isCommentsPanelOpen && (
              <aside
                className="
                  w-84
                  shrink-0
                  h-full
                  min-h-0
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[#E0E7EF]
                  bg-white
                  shadow-xs
                  dark:border-[#1E3A5F]
                  dark:bg-[#0E1F36]
                  dark:shadow-xl
                  flex
                  flex-col
                "
              >
                <CommentsPanel />
              </aside>
            )}

            {/* AI PANEL */}
            {aiPanelOpen && (
              <aside
                className="
                  w-84
                  shrink-0
                  h-full
                  min-h-0
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[#E0E7EF]
                  bg-white
                  shadow-xs
                  dark:border-[#1E3A5F]
                  dark:bg-[#0E1F36]
                  dark:shadow-xl
                  flex
                  flex-col
                "
              >
                <AIPanel />
              </aside>
            )}
          </main>

          {/* WORD-STYLE STATUS & VIEW CONTROL BAR */}
          <EditorStatusBar />
        </div>
      </div>
    </div>
  );
}
