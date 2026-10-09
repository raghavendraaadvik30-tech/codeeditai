import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import { useWritingTools } from "../hooks/useWritingTools";

type WritingContextValue = ReturnType<
  typeof useWritingTools
>;

const WritingContext =
  createContext<WritingContextValue | null>(null);

export function WritingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = useWritingTools();

  return (
    <WritingContext.Provider value={value}>
      {children}
    </WritingContext.Provider>
  );
}

export function useWritingContext() {
  const context = useContext(WritingContext);

  if (!context) {
    throw new Error(
      "useWritingContext must be used inside WritingProvider"
    );
  }

  return context;
}
