import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  PanelRightClose,
  MessageSquare,
  Wand2,
  BookOpen,
  Lightbulb,
  History,
} from 'lucide-react';
import { AIChat } from './AIChat';
import { AIQuickActions } from './AIQuickActions';
import { AIWritingAssistant } from './AIWritingAssistant';
import { AIReferenceHelper } from './AIReferenceHelper';
import { AISuggestions } from './AISuggestions';
import { AIHistory } from './AIHistory';
import { AIRepository } from '../repository/aiRepository';

export const AIAssistant: React.FC = () => {
  const [open, setOpen] = useState<boolean>(() => AIRepository.getPanelOpenState());
  const [activeTab, setActiveTab] = useState<'chat' | 'writing' | 'references' | 'suggestions' | 'history'>('chat');
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    AIRepository.setPanelOpenState(open);
  }, [open]);

  return (
    <>
      {/* Sliding Sidebar Panel */}
      {open && (
        <aside
          ref={panelRef}
          className="w-80 shrink-0 border-l border-border bg-card flex flex-col h-full overflow-hidden z-30 shadow-lg"
        >
          {/* Header */}
          <header className="px-3.5 py-2.5 border-b border-border flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary text-primary-foreground grid place-items-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-semibold text-foreground">AI Assistant</h2>
                <p className="text-[10px] text-muted-foreground">Context & Selection Aware</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 rounded-md grid place-items-center text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Collapse"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          </header>

          {/* Tab Navigation */}
          <div className="flex border-b border-border bg-card text-[11px] font-medium">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-1.5 flex items-center justify-center gap-1 border-b-2 transition-colors ${
                activeTab === 'chat'
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              title="Chat"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('writing')}
              className={`flex-1 py-1.5 flex items-center justify-center gap-1 border-b-2 transition-colors ${
                activeTab === 'writing'
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              title="Writing"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Writing</span>
            </button>
            <button
              onClick={() => setActiveTab('references')}
              className={`flex-1 py-1.5 flex items-center justify-center gap-1 border-b-2 transition-colors ${
                activeTab === 'references'
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              title="References"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Refs</span>
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`flex-1 py-1.5 flex items-center justify-center gap-1 border-b-2 transition-colors ${
                activeTab === 'suggestions'
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              title="Suggestions"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Tips</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1.5 flex items-center justify-center gap-1 border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              title="History"
            >
              <History className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Actions (always visible in Chat tab) */}
          {activeTab === 'chat' && (
            <div className="p-2.5 border-b border-border bg-muted/20">
              <AIQuickActions />
            </div>
          )}

          {/* Active Tab Content */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {activeTab === 'chat' && <AIChat />}
            {activeTab === 'writing' && <AIWritingAssistant />}
            {activeTab === 'references' && <AIReferenceHelper />}
            {activeTab === 'suggestions' && <AISuggestions />}
            {activeTab === 'history' && <AIHistory onSelectPrompt={() => setActiveTab('chat')} />}
          </div>
        </aside>
      )}

      {/* Floating Action Button (FAB) when collapsed */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="Open AI Assistant"
          className="fixed right-6 bottom-10 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-lg hover:scale-105 transition-transform"
        >
          <Sparkles className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-card" />
        </button>
      )}
    </>
  );
};

export default AIAssistant;
