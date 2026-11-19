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

import { useState, useCallback, useRef, useEffect } from "react";
import EditorHeader from "../components/header/EditorHeader";
import RibbonToolbar from "../components/ribbon/RibbonToolbar";
import IconSidebar from "../components/sidebar/IconSidebar";
import LeftOverlay from "../components/overlay/LeftOverlay";
import Workspace from "../components/workspace/Workspace";
import AIPanel from "../components/ai/AIPanel";
import EditorStatusBar from "../components/statusbar/EditorStatusBar";
import MobileToolNav from "../components/sidebar/MobileToolNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { BACK_BUTTON_EVENT } from "@/app/native";


import { useEditor } from "../hooks/useEditor";

export default function EditorLayout() {
  const {
    leftPanelOpen,
    leftPanelWidth,
    setLeftPanelWidth,
    aiPanelOpen,
    setAiPanelOpen,
    setLeftPanelOpen,
    setZoom,
  } = useEditor();

  const isMobile = useIsMobile();

  const [isResizing, setIsResizing] = useState(false);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Pointer events cover mouse, touch (iPad) and pen alike.
  const startResize = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = leftPanelWidth;
    setIsResizing(true);

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingRef.current) return;
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - startXRef.current;
      // Sensible bounds: minimum 240px for clean tabs & thumbnails; maximum leaves >= 450px for document canvas
      const minW = 240;
      const maxW = Math.max(minW, Math.min(760, window.innerWidth - 450));
      const newWidth = Math.max(minW, Math.min(maxW, Math.round(startWidthRef.current + deltaX)));
      setLeftPanelWidth(newWidth);
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
      setIsResizing(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      document.body.style.removeProperty("cursor");
      document.body.style.removeProperty("user-select");
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  }, [leftPanelWidth, setLeftPanelWidth]);

  // On phones, start with the page scaled to fit the screen width.
  // 816px is the default page width (US Letter at 96 dpi).
  // On tablets the full desktop layout leaves less than a page of width,
  // so start zoomed out to fit there as well (rail + padding ~ 100px).
  useEffect(() => {
    const chrome = isMobile ? 16 : 100;
    if (!isMobile && window.innerWidth >= 1100) return;
    const fit = Math.floor(((window.innerWidth - chrome) / 816) * 100);
    setZoom(Math.max(25, Math.min(100, fit)));
    // A saved "panel open" preference would cover the whole phone screen.
    if (isMobile) setLeftPanelOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  // Android back button closes the full-screen panel before leaving the editor.
  useEffect(() => {
    if (!isMobile || (!leftPanelOpen && !aiPanelOpen)) return;
    const onBack = (event: Event) => {
      event.preventDefault();
      if (aiPanelOpen) setAiPanelOpen(false);
      else setLeftPanelOpen(false);
    };
    window.addEventListener(BACK_BUTTON_EVENT, onBack);
    return () => window.removeEventListener(BACK_BUTTON_EVENT, onBack);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, leftPanelOpen, aiPanelOpen]);

  useEffect(() => {
    return () => {
      document.body.style.removeProperty("cursor");
      document.body.style.removeProperty("user-select");
    };
  }, []);

  // PHONE LAYOUT: stacked header / ribbon / canvas, tools in a bottom bar,
  // and the tool + AI panels shown as full-screen sheets.
  if (isMobile) {
    return (
      <div className="h-full w-full min-h-0 flex flex-col overflow-hidden">
        <header className="mobile-scroll-x shrink-0">
          <EditorHeader />
        </header>

        <div className="mobile-scroll-x shrink-0">
          <RibbonToolbar />
        </div>

        <main className="relative flex flex-1 min-h-0 min-w-0 overflow-hidden bg-[#F0F8FF] dark:bg-[#0B1528] p-1">
          <section className="relative h-full min-h-0 min-w-0 flex-1 overflow-hidden">
            <Workspace />
          </section>
        </main>

        <EditorStatusBar />
        <MobileToolNav />

        {(leftPanelOpen || aiPanelOpen) && (
          <div className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-[#0E1F36] pt-[var(--safe-top)] pb-[var(--safe-bottom)]">
            {aiPanelOpen ? <AIPanel /> : <LeftOverlay />}
          </div>
        )}
      </div>
    );
  }

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
            {/* LEFT OVERLAY RESIZABLE CARD */}
            {leftPanelOpen && (
              <aside
                style={{ width: `${leftPanelWidth}px` }}
                className="
                  relative
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
                  group/sidebar
                "
              >
                <LeftOverlay />

                {/* SUBTLE RESIZABLE DIVIDER (inside sidebar boundary, blends into white background) */}
                <div
                  role="separator"
                  aria-orientation="vertical"
                  aria-valuenow={leftPanelWidth}
                  aria-valuemin={240}
                  aria-valuemax={760}
                  tabIndex={0}
                  title="Drag to resize sidebar (Double-click to reset)"
                  onPointerDown={startResize}
                  onDoubleClick={() => setLeftPanelWidth(336)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowLeft") {
                      e.preventDefault();
                      setLeftPanelWidth((w) => Math.max(240, w - 20));
                    } else if (e.key === "ArrowRight") {
                      e.preventDefault();
                      const maxW = Math.max(240, Math.min(760, window.innerWidth - 450));
                      setLeftPanelWidth((w) => Math.min(maxW, w + 20));
                    }
                  }}
                  className="
                    absolute
                    top-0
                    right-0
                    bottom-0
                    w-2.5
                    cursor-col-resize
                    select-none
                    flex
                    items-center
                    justify-center
                    z-30
                    group/handle
                    hover:bg-slate-100/60
                    dark:hover:bg-slate-800/40
                    transition-colors
                  "
                >
                  {/* Subtle 1px divider border line blending into white card edge */}
                  <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-[#E0E7EF] dark:bg-[#1E3A5F] group-hover/handle:bg-[#CBD5E1] dark:group-hover/handle:bg-[#334E68] transition-colors" />

                  {/* Small subtle drag handle visible on hover */}
                  <div
                    className={`
                      flex
                      flex-col
                      items-center
                      justify-center
                      gap-0.5
                      py-2
                      px-0.5
                      rounded-full
                      bg-white
                      dark:bg-[#0E1F36]
                      border
                      border-[#CBD5E1]
                      dark:border-[#294564]
                      shadow-xs
                      opacity-0
                      group-hover/handle:opacity-100
                      transition-opacity
                      duration-150
                      pointer-events-none
                      ${isResizing ? "!opacity-100 border-[#94A3B8]" : ""}
                    `}
                  >
                    <div className="w-0.5 h-0.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                    <div className="w-0.5 h-0.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                    <div className="w-0.5 h-0.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                  </div>
                </div>
              </aside>
            )}

            {/* TRANSPARENT OVERLAY DURING ACTIVE DRAGGING (Guarantees smooth tracking & col-resize cursor everywhere) */}
            {isResizing && (
              <div className="fixed inset-0 z-50 cursor-col-resize select-none bg-transparent" />
            )}

            {/* WORKSPACE CANVAS (Flex-1 expands/shrinks automatically) */}
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
