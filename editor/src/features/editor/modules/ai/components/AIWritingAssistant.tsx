import React from 'react';
import { PenTool, CheckCheck, RefreshCw, ShieldCheck, FileCheck } from 'lucide-react';
import { AI_CHAT_SEND_EVENT } from '../hooks/useAI';

export const AIWritingAssistant: React.FC = () => {
  const actions = [
    {
      title: 'Fix Regulatory Compliance',
      desc: 'Adjust phrasing for strict ICH / FDA compliance and neutral scientific tone',
      prompt: 'Check and fix compliance on the selected text',
      icon: ShieldCheck,
    },
    {
      title: 'Improve Flow & Clarity',
      desc: 'Fix grammar, sentence structure, and cohesion',
      prompt: 'Improve the grammar and clarity of the selected text',
      icon: CheckCheck,
    },
    {
      title: 'Rewrite with Regulatory Tone',
      desc: 'Convert informal descriptions to standard clinical reporting style',
      prompt: 'Rewrite the selected text in formal regulatory style',
      icon: FileCheck,
    },
    {
      title: 'Generate Section Synopsis',
      desc: 'Summarize key findings into a concise introductory paragraph',
      prompt: 'Summarize the selected section in 2-3 concise sentences',
      icon: RefreshCw,
    },
  ];

  const handleRun = (prompt: string) => {
    window.dispatchEvent(new CustomEvent(AI_CHAT_SEND_EVENT, { detail: { prompt } }));
  };

  return (
    <div className="space-y-3 p-3 text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-foreground">
        <PenTool className="w-3.5 h-3.5 text-primary" /> AI Writing & Compliance Suite
      </div>
      <p className="text-[11px] text-muted-foreground">
        Select text in the editor and click an action below to transform it.
      </p>

      <div className="space-y-2">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.title}
              onClick={() => handleRun(act.prompt)}
              className="w-full text-left p-2.5 rounded border border-border bg-card hover:bg-muted/60 transition-colors flex items-start gap-2.5 group"
            >
              <div className="p-1 rounded bg-primary/10 text-primary mt-0.5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-foreground text-[11px]">{act.title}</div>
                <div className="text-[10px] text-muted-foreground">{act.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AIWritingAssistant;
