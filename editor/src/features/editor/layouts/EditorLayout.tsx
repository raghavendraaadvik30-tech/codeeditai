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


import { useEditor } from "../hooks/useEditor";

export default function EditorLayout() {
  const {
    leftPanelOpen,
    aiPanelOpen,
  } = useEditor();

  return (
    <div className="h-full w-full min-h-0 flex flex-col overflow-hidden">

      {/* HEADER */}
      <header className="shrink-0">
        <EditorHeader />
      </header>

      {/* RIBBON */}
      <div className="shrink-0">
        <RibbonToolbar />
      </div>

      {/* MAIN EDITOR AREA */}
      <main className="flex flex-1 min-h-0 min-w-0 overflow-hidden">

        {/* LEFT ICON SIDEBAR */}
        <aside className="w-[60px] shrink-0 min-h-0 overflow-hidden">
          <IconSidebar />
        </aside>

        {/* LEFT OVERLAY */}
        {leftPanelOpen && (
          <aside
            className="
              w-[380px]
              shrink-0
              min-h-0
              overflow-hidden
              border-r
              border-slate-200
              bg-white
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
            bg-[#EEF4FA]
          "
        >
          <Workspace />
        </section>

        {/* AI PANEL */}
        {aiPanelOpen && (
          <aside
            className="
              w-[360px]
              shrink-0
              min-w-0
              min-h-0
              overflow-hidden
              border-l
              border-slate-200
              bg-white
            "
          >
            <AIPanel />
          </aside>
        )}

      </main>

      

    </div>
  );
}