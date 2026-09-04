/*
Purpose:
AIPanel is the UI container for the application's AI Assistant.
It provides a dedicated panel where AI-related features or
context-aware assistance can be displayed.

What each part does:
useEditor() – Accesses editor-level state and actions.
setAiPanelOpen() – Controls whether the AI panel is open or closed.

AI Header:
- Displays the "AI Assistant" title.
- Shows a short description: "Context-aware assistance".
- Provides a close button using the X icon.

AI Content:
- Provides a scrollable area where AI features,
  suggestions, responses, or tools can be added.

UI:
Uses Tailwind CSS for layout, spacing, borders, animations,
hover effects, and responsive panel behavior.

Interaction:
Clicking the close button calls setAiPanelOpen(false),
which closes the AI Assistant panel.

Data/API:
This component currently does not make any API or backend call.
It is mainly responsible for the AI panel UI and its open/close action.

Flow:
Editor
  ↓
useEditor()
  ↓
AIPanel
  ↓
AI Header + AI Content
  ↓
Close → setAiPanelOpen(false)
*/
import { X } from "lucide-react";
import { useEditor } from "../../hooks/useEditor";

export default function AIPanel() {
  const { setAiPanelOpen } = useEditor();

  return (
    <div className="flex h-full min-h-0 flex-col bg-background animate-[aiSlideIn_0.3s_ease-out]">

      {/* AI HEADER */}
      <div
        className="
          flex
          h-[74px]
          shrink-0
          items-center
          justify-between
          border-b
          border-slate-200
          px-4
        "
      >
        <div>
          <h2 className="text-sm font-semibold">
            AI Assistant
          </h2>

          <p className="text-xs text-muted-foreground">
            Context-aware assistance
          </p>
        </div>

        {/* CLOSE AI */}
        <button
          type="button"
          onClick={() => setAiPanelOpen(false)}
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-md
            text-slate-500
            transition-colors
            hover:bg-slate-100
            hover:text-slate-900
          "
          aria-label="Close AI Assistant"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* AI CONTENT */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4">

        {/* YOUR EXISTING AI CONTENT */}

      </div>

    </div>
  );
}