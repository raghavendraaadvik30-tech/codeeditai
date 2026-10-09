import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, AlertCircle, Loader2, Wrench, Eye, Trash2 } from 'lucide-react';
import { useAI, AI_CHAT_SEND_EVENT } from '../hooks/useAI';
import { cn } from '@/lib/utils';

export const AIChat: React.FC = () => {
  const { messages, loading, sendPrompt, insertPreview, cancelPreview, clearChat } = useAI();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ prompt: string; label?: string }>;
      if (ev.detail?.prompt) {
        sendPrompt(ev.detail.prompt, ev.detail.label);
      }
    };
    window.addEventListener(AI_CHAT_SEND_EVENT, handler);
    return () => window.removeEventListener(AI_CHAT_SEND_EVENT, handler);
  }, [sendPrompt]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setInput('');
    sendPrompt(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedDocText = typeof window !== 'undefined' ? window.getSelection()?.toString().trim() : '';


  return (
    <div className="flex flex-col h-full min-h-0 text-xs">
      {/* Selection context indicator */}
      {selectedDocText && (
        <div className="px-3 py-1 bg-primary/10 border-b border-primary/20 text-primary flex items-center justify-between text-[11px]">
          <span className="truncate">
            Selected: <span className="font-semibold italic">"{selectedDocText.slice(0, 30)}..."</span>
          </span>
          <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.2 rounded shrink-0">
            Active
          </span>
        </div>
      )}

      {/* Messages Header */}
      <div className="shrink-0 flex items-center justify-between px-3 pt-2 pb-1 border-b border-border">
        <span className="text-[10px] font-semibold text-muted-foreground">
          {messages.length > 0
            ? `${messages.length} message${messages.length === 1 ? '' : 's'}`
            : 'New chat'}
        </span>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearChat}
            className="text-[10px] font-medium px-2 py-0.5 rounded border border-border hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground flex items-center gap-1"
            title="Clear all chat messages"
          >
            <Trash2 className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Messages container */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center">
              <Bot className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Ask me anything about your document</p>
            <p className="text-[10px] text-muted-foreground max-w-[200px]">
              Select text to rewrite, or ask to generate tables, images, headings and figures.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={msg.id !== undefined && msg.id !== null ? String(msg.id) : `msg-${idx}`}
            className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {msg.role !== 'user' && (
              <div
                className={cn(
                  'w-6 h-6 rounded-full shrink-0 mt-0.5 grid place-items-center text-[10px]',
                  msg.role === 'error'
                    ? 'bg-destructive/15 text-destructive'
                    : msg.role === 'tool'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'bg-primary/10 text-primary'
                )}
              >
                {msg.role === 'error' ? (
                  <AlertCircle className="w-3 h-3" />
                ) : msg.role === 'tool' ? (
                  <Wrench className="w-3 h-3" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
              </div>
            )}

            <div
              className={cn(
                'rounded-xl px-3 py-2 max-w-[85%] text-xs break-words shadow-xs',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground whitespace-pre-wrap'
                  : msg.role === 'error'
                  ? 'bg-destructive/10 border border-destructive/30 text-destructive whitespace-pre-wrap'
                  : msg.role === 'tool'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-200 whitespace-pre-wrap'
                  : 'bg-muted/60 border border-border whitespace-pre-wrap text-foreground'
              )}
            >
              <div>{msg.text}</div>

              {msg.preview && (
                <div className="mt-2 border border-border rounded-lg overflow-hidden bg-background">
                  <div className="px-2 py-1 bg-muted/60 border-b border-border text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Preview — {msg.preview.label}
                  </div>
                  <div
                    className="max-h-52 overflow-auto p-2 text-[11px] [&_table]:text-[10px] [&_img]:max-w-full"
                    dangerouslySetInnerHTML={{ __html: msg.preview.html }}
                  />
                  <div className="flex gap-2 p-2 border-t border-border bg-muted/30">
                    <button
                      onClick={() => insertPreview(msg.id, msg.preview!.html)}
                      className="flex-1 text-[11px] font-semibold py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      ✓ Insert
                    </button>
                    <button
                      onClick={() => cancelPreview(msg.id)}
                      className="flex-1 text-[11px] font-semibold py-1.5 rounded-md border border-border bg-card hover:bg-muted transition-colors text-foreground"
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground shrink-0 mt-0.5 grid place-items-center">
                <User className="w-3 h-3" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 items-start text-xs animate-in fade-in-50 duration-200">
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            </div>
            <div className="px-3 py-2 rounded-xl bg-muted/70 border border-border/80 flex items-center gap-2 shadow-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
              <span className="font-medium text-[11px] text-foreground">Thinking...</span>
              <span className="flex gap-1 items-center ml-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Section */}
      <div className="shrink-0 border-t border-border px-3 pt-2 pb-3 space-y-2 bg-card">
        <div className="relative">
          <textarea
            id="ai-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            disabled={loading}
            placeholder="Ask AI to write, rewrite, or insert images/tables..."
            className="w-full text-xs rounded-lg border border-input bg-background px-3 pr-10 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60 placeholder:text-muted-foreground/60"
          />
          <button
            id="ai-chat-send-btn"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={cn(
              'absolute right-2 bottom-2 w-6 h-6 rounded-md grid place-items-center transition-colors',
              loading || !input.trim()
                ? 'text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Shift+Enter for newline • Direct Image URLs supported
        </p>
      </div>
    </div>
  );
};

export default AIChat;
