import React from 'react';
import { Sparkles } from 'lucide-react';
import { AIChat } from '../components/AIChat';
import { AIQuickActions } from '../components/AIQuickActions';
import { AIWritingAssistant } from '../components/AIWritingAssistant';
import { AISuggestions } from '../components/AISuggestions';

export const AIPage: React.FC = () => {
  return (
    <div className="flex h-full w-full bg-background text-foreground overflow-hidden">
      <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground grid place-items-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Intelligence & Authoring Center</h1>
            <p className="text-xs text-muted-foreground">
              Intelligent drafting, compliance checking, referencing, and document generation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
            <AIQuickActions />
          </div>
          <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
            <AISuggestions />
          </div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-card shadow-sm">
          <AIWritingAssistant />
        </div>
      </div>

      <div className="w-96 border-l border-border bg-card h-full flex flex-col">
        <AIChat />
      </div>
    </div>
  );
};

export default AIPage;
