import {
  StylesPanel,
} from "../components/StylesPanel";

import {
  StyleProvider,
} from "../context/StyleContext";

export function StylesPage() {
  return (
    <StyleProvider>
      <div className="h-full min-h-0">
        <StylesPanel />
      </div>
    </StyleProvider>
  );
}