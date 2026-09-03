/*
**Purpose:**
Creates a **reusable sidebar button** for the editor. Each button represents one left-panel tool and updates the currently active panel when clicked.

**What each part does:**

* **`Button`** – Uses the shared UI button component for consistent styling.
* **`useEditor()`** – Accesses the current `activePanel` and `setActivePanel()` function.
* **`LeftPanel`** – Ensures the `id` matches a valid editor panel type.
* **`Props`** – Accepts:

  * `id` → identifies the panel.
  * `icon` → icon displayed inside the button.
* **Active state** – Uses the `"default"` button style when the panel is active; 
* otherwise uses `"ghost"`.
* **`onClick`** – Calls `setActivePanel(id)` to switch the active panel.
* **`React.ElementType`** – Allows different icon components to be passed dynamically.

**In short:**
`SidebarItem.tsx` is a **reusable single sidebar button component**. 
It handles **panel selection and active-state styling**,
 while `IconSidebar.tsx` manages the complete sidebar.
*/
import { Button } from "@/shared/components/ui/button";
import { useEditor } from "../../hooks/useEditor";
import type { LeftPanel } from "../../types/editor.types";

interface Props {
  id: LeftPanel;
  icon: React.ElementType;
}

export default function SidebarItem({
  id,
  icon: Icon,
}: Props) {
  const {
    activePanel,
    setActivePanel,
  } = useEditor();

  return (
    <Button
      variant={activePanel === id ? "default" : "ghost"}
      className="m-2 h-12 w-12"
      onClick={() => setActivePanel(id)}
    >
      <Icon size={20} />
    </Button>
  );
}