import React from 'react';
import { BookOpen, PlusCircle } from 'lucide-react';
import { AI_CHAT_SEND_EVENT } from '../hooks/useAI';

export const AIReferenceHelper: React.FC = () => {
  const sources = [
    { id: 'ICH E3', name: 'ICH E3 Structure and Content of Clinical Study Reports' },
    { id: 'FDA', name: 'FDA Guidance for Industry: Formal Meetings' },
    { id: 'EMA', name: 'EMA Guideline on Good Pharmacovigilance Practices' },
    { id: 'GAMP 5', name: 'ISPE GAMP 5: Risk-Based Approach to Compliant GxP' },
  ];

  const handleInsert = (source: string) => {
    window.dispatchEvent(
      new CustomEvent(AI_CHAT_SEND_EVENT, {
        detail: { prompt: `Insert a citation for ${source}` },
      })
    );
  };

  return (
    <div className="space-y-3 p-3 text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-foreground">
        <BookOpen className="w-3.5 h-3.5 text-primary" /> Regulatory Reference Assistant
      </div>
      <p className="text-[11px] text-muted-foreground">
        Quickly insert regulatory guidelines and citations into your document.
      </p>

      <div className="space-y-1.5">
        {sources.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between p-2 rounded border border-border bg-card hover:bg-muted/50"
          >
            <div className="min-w-0 pr-2">
              <div className="font-semibold text-foreground text-[11px]">{s.id}</div>
              <div className="text-[10px] text-muted-foreground truncate">{s.name}</div>
            </div>
            <button
              onClick={() => handleInsert(s.id)}
              className="p-1 hover:bg-primary/10 rounded text-primary"
              title="Insert Citation"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIReferenceHelper;
