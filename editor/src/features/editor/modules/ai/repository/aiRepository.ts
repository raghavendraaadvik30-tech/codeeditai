export type Role = "user" | "ai" | "tool" | "error";

export interface PreviewPayload {
  html: string;
  label: string;
}

export interface ChatMessage {
  id: string | number;
  role: Role;
  text: string;
  preview?: PreviewPayload;
  timestamp?: string;
}

const CHAT_HISTORY_KEY = "parexel.aichat.history.v1";
const AI_PANEL_STATE_KEY = "parexel.aiPanel.open";

export class AIRepository {
  static getHistory(): ChatMessage[] {
    try {
      if (typeof window === "undefined") return [];
      const saved = localStorage.getItem(CHAT_HISTORY_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved) as ChatMessage[];
      if (!Array.isArray(parsed)) return [];
      const seen = new Set<string | number>();
      return parsed.map((msg, index) => {
        let msgId = msg.id;
        if (msgId === undefined || msgId === null || seen.has(msgId)) {
          msgId = `hist_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 7)}`;
        }
        seen.add(msgId);
        return { ...msg, id: msgId };
      });
    } catch {
      return [];
    }
  }

  static saveHistory(messages: ChatMessage[]): void {
    try {
      if (typeof window === "undefined") return;
      const trimmed = messages.slice(-100);
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(trimmed));
    } catch {
      // Ignore write errors
    }
  }

  static clearHistory(): void {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem(CHAT_HISTORY_KEY);
    } catch {
      // Ignore
    }
  }

  static getPanelOpenState(): boolean {
    try {
      if (typeof window === "undefined") return false;
      const v = localStorage.getItem(AI_PANEL_STATE_KEY);
      return v === "1";
    } catch {
      return false;
    }
  }

  static setPanelOpenState(open: boolean): void {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(AI_PANEL_STATE_KEY, open ? "1" : "0");
    } catch {
      // Ignore
    }
  }
}

export const aiRepository = AIRepository;
