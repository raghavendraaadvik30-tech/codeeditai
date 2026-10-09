import React from 'react';
import { Wand2, Sparkles, FileText, ListChecks, ImageIcon, BookMarked } from 'lucide-react';
import { AI_CHAT_SEND_EVENT } from '../hooks/useAI';

export const QUICK_ACTIONS = [
  {
    label: 'Rewrite text',
    icon: Wand2,
    prompt: 'Rewrite the selected text while preserving its original meaning.',
  },
  {
    label: 'Improve writing',
    icon: Sparkles,
    prompt: 'Correct grammar, spelling, clarity, sentence structure, and professional tone in the selected text.',
  },
  {
    label: 'Generate heading',
    icon: FileText,
    prompt: 'Generate a relevant heading based on the selected text.',
  },
  {
    label: 'Generate table',
    icon: ListChecks,
    prompt: 'Convert the selected information into a properly structured table.',
  },
  {
    label: 'Caption figure',
    icon: ImageIcon,
    prompt: 'Generate a meaningful caption for the selected figure or image.',
  },
  {
    label: 'Summarize section',
    icon: BookMarked,
    prompt: 'Summarize the selected section while retaining its important points.',
  },
];

interface AIQuickActionsProps {
  onSelectAction?: (prompt: string, label?: string) => void;
}

export const AIQuickActions: React.FC<AIQuickActionsProps> = ({ onSelectAction }) => {
  const handleClick = (prompt: string, label: string) => {
    if (onSelectAction) {
      onSelectAction(prompt, label);
    } else {
      window.dispatchEvent(
        new CustomEvent(AI_CHAT_SEND_EVENT, { detail: { prompt, label } })
      );
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        Quick Actions
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => handleClick(action.prompt, action.label)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-muted/60 hover:bg-primary/10 hover:text-primary border border-border text-[11px] font-medium text-left transition-colors"
            >
              <Icon className="w-3.5 h-3.5 shrink-0 text-primary" />
              <span className="truncate">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AIQuickActions;
