import React from 'react';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { AI_CHAT_SEND_EVENT } from '../hooks/useAI';

export const AISuggestions: React.FC = () => {
  const suggestions = [
    { title: 'Add Study Objectives Section', prompt: 'Insert section heading "Study Objectives" and a introductory paragraph.' },
    { title: 'Insert Patient Demographics Table', prompt: 'Insert a demographics table with columns for Characteristic, Group A, Group B, Total.' },
    { title: 'Add Adverse Events Summary', prompt: 'Insert clinical table for adverse events.' },
    { title: 'Add Study Schema Figure', prompt: 'Insert figure template for Study Schema Timeline.' },
  ];

  const handleApply = (prompt: string) => {
    window.dispatchEvent(new CustomEvent(AI_CHAT_SEND_EVENT, { detail: { prompt } }));
  };

  return (
    <div className="space-y-3 p-3 text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-foreground">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Document Recommendations
      </div>
      <p className="text-[11px] text-muted-foreground">
        Suggested components based on clinical document structures:
      </p>

      <div className="space-y-1.5">
        {suggestions.map((item) => (
          <button
            key={item.title}
            onClick={() => handleApply(item.prompt)}
            className="w-full text-left p-2 rounded border border-border bg-card hover:bg-muted/60 flex items-center justify-between group transition-colors"
          >
            <span className="text-[11px] font-medium text-foreground">{item.title}</span>
            <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default AISuggestions;
