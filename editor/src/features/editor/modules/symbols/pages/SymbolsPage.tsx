import SymbolsPanel from "../components/SymbolsPanel";
import { SymbolsProvider } from "../context/SymbolsContext";

export default function SymbolsPage() {
  return (
    <SymbolsProvider>
      <SymbolsPanel />
    </SymbolsProvider>
  );
}