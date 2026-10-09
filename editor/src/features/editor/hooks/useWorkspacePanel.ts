/**Purpose:**
A custom React hook that manages the **workspace panel state and navigation behavior**.

**Responsibilities:**

* Retrieves the active panel and panel visibility state from `EditorContext`.
* `openPanel()` — Opens and activates a selected workspace module.
* `closePanel()` — Closes the panel and clears the active module.
* `togglePanel()` — Opens the selected panel or closes it if it is already active.
* Uses `ModuleId` for type-safe panel selection.
* Exposes panel state and control functions to components such as `WorkspaceSidebar`.

**In short:**

> `useWorkspacePanel.ts` centralizes the **open, close, 
and toggle logic of workspace panels**, 
keeping panel behavior separate from the UI.
*/

import { useEditor } from "../context/EditorContext";

import type { ModuleId } from "../data/workspaceModules";

export function useWorkspacePanel() {
  const {
    activePanel,
    setActivePanel,
    leftPanelOpen,
    setLeftPanelOpen,
  } = useEditor();

  const openPanel = (moduleId: ModuleId) => {
    setActivePanel(moduleId);
    setLeftPanelOpen(true);
  };

  const closePanel = () => {
    setLeftPanelOpen(false);
    setActivePanel("");
  };

  const togglePanel = (moduleId: ModuleId) => {
    if (
      leftPanelOpen &&
      activePanel === moduleId
    ) {
      closePanel();
      return;
    }

    openPanel(moduleId);
  };

  return {
    activePanel: activePanel as ModuleId | "",
    leftPanelOpen,
    openPanel,
    closePanel,
    togglePanel,
  };
}
