import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { saveFile } from "@/shared/platform";

type AuditAction =
  | "edit"
  | "format"
  | "style"
  | "table"
  | "figure"
  | "reference"
  | "template"
  | "trackchange";

type AuditEntry = {
  id: string;
  timestamp: number;
  user: string;
  action: AuditAction;
  label: string;
};

type AuditContextValue = {
  entries: AuditEntry[];
  log: (entry: {
    action: AuditAction;
    label: string;
  }) => void;
  clear: () => void;
  exportJSON: () => void;
  user: string;
};

const AuditContext = createContext<AuditContextValue | null>(null);

export function AuditProvider({
  children,
  user = "A. Kapoor",
}: {
  children: React.ReactNode;
  user?: string;
}) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);

  const log = useCallback(
    ({
      action,
      label,
    }: {
      action: AuditAction;
      label: string;
    }) => {
      setEntries((current) => [
        {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          user,
          action,
          label,
        },
        ...current,
      ].slice(0, 500));
    },
    [user]
  );

  const clear = useCallback(() => {
    setEntries([]);
  }, []);

  const exportJSON = useCallback(() => {
    const blob = new Blob(
      [JSON.stringify(entries, null, 2)],
      { type: "application/json" }
    );

    void saveFile(blob, `audit-trail-${Date.now()}.json`).catch((error) =>
      console.error("Audit export failed:", error)
    );
  }, [entries]);

  return (
    <AuditContext.Provider
      value={{
        entries,
        log,
        clear,
        exportJSON,
        user,
      }}
    >
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit(): AuditContextValue {
  const context = useContext(AuditContext);

  if (!context) {
    throw new Error(
      "useAudit must be used inside <AuditProvider>"
    );
  }

  return context;
}