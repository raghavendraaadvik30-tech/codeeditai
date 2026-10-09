import React from 'react';
import { History, Trash2, ArrowRight } from 'lucide-react';
import { AIRepository } from '../repository/aiRepository';
import { AI_CHAT_SEND_EVENT } from '../hooks/useAI';

interface AIHistoryProps {
  onSelectPrompt?: (prompt: string) => void;
}

export const AIHistory: React.FC<AIHistoryProps> = ({ onSelectPrompt }) => {
  const [history, setHistory] = React.useState(() => AIRepository.getHistory());

  const handleClear = () => {
    AIRepository.clearHistory();
    setHistory([]);
  };

  const handleSelect = (text: string) => {
    if (onSelectPrompt) {
      onSelectPrompt(text);
    } else {
      window.dispatchEvent(new CustomEvent(AI_CHAT_SEND_EVENT, { detail: { prompt: text } }));
    }
  };

  return (
    <div className="space-y-3 p-3 text-xs">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-primary" /> Interaction History
        </h4>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-muted-foreground text-[11px]">No previous AI conversations.</p>
      ) : (
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {history.filter((m) => m.role === 'user').slice(-10).reverse().map((msg) => (
            <button
              key={msg.id}
              onClick={() => handleSelect(msg.text)}
              className="w-full text-left p-2 rounded bg-muted/40 hover:bg-muted border border-border/60 flex items-center justify-between group transition-colors"
            >
              <span className="truncate pr-2">{msg.text}</span>
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIHistory;
