import { Sparkles, X } from "lucide-react";
import { useEditor } from "../../hooks/useEditor";
import { AIChat } from "../../modules/ai/components/AIChat";
import { AIQuickActions } from "../../modules/ai/components/AIQuickActions";

export default function AIPanel() {
  const { setAiPanelOpen } = useEditor();

  return (
    <div className="flex h-full min-h-0 flex-col bg-background animate-ai-slide-in text-foreground select-none">
      {/* AI HEADER */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-muted/20 px-3.5">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-foreground">AI Assistant</h2>
            <p className="text-[10px] text-muted-foreground">Context &amp; Selection Aware</p>
          </div>
        </div>

        {/* CLOSE AI */}
        <button
          type="button"
          onClick={() => setAiPanelOpen(false)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close AI Assistant"
          title="Close AI Assistant"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* QUICK ACTIONS */}
      <div className="shrink-0 border-b border-border bg-muted/20 p-2.5">
        <AIQuickActions />
      </div>

      {/* CHAT CONTENT */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <AIChat />
      </div>
    </div>
  );
}


