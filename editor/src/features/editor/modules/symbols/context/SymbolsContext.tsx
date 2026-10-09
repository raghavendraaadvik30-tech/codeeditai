import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

import { useSymbolTools } from "../hooks/useSymbolTools";

type SymbolsContextValue =
  ReturnType<typeof useSymbolTools>;

const SymbolsContext =
  createContext<SymbolsContextValue | null>(
    null
  );

export function SymbolsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const value = useSymbolTools();

  return (
    <SymbolsContext.Provider value={value}>
      {children}
    </SymbolsContext.Provider>
  );
}

export function useSymbolsContext() {
  const context =
    useContext(SymbolsContext);

  if (!context) {
    throw new Error(
      "useSymbolsContext must be used inside SymbolsProvider"
    );
  }

  return context;
}
