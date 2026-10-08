/*
Purpose:
Creates the vertical navigation toolbar for all workspace modules.

What it does:

Loads modules from WORKSPACE_MODULES.
Gets each module's icon from WORKSPACE_ICONS.
Dynamically creates buttons for every module.
Highlights the currently active module.
Calls onToggle() when a module is clicked.
Provides accessibility labels and tooltips.
Includes the application logo at the top.

In short:
WorkspaceToolbar.tsx is responsible for displaying and selecting workspace modules.

*/



import { cn } from "@/lib/utils";

import { WORKSPACE_MODULES } from "../../data/workspaceModules";
import { WORKSPACE_ICONS } from "./WorkspaceIcons";

import type { ModuleId } from "../../data/workspaceModules";

interface WorkspaceToolbarProps {
  activePanel: ModuleId | "";
  onToggle: (moduleId: ModuleId) => void;
}

export default function WorkspaceToolbar({
  activePanel,
  onToggle,
}: WorkspaceToolbarProps) {
  return (
    <nav
      aria-label="Workspace modules"
      className="
        flex
        h-full
        w-18
        shrink-0
        flex-col
        items-center
        border-r
        border-secondary
        bg-card
        dark:border-muted
        dark:bg-[#07131E]
      "
    >
      {/* PAREXEL LOGO */}

      <div
        className="
          mt-3
          mb-3
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-primary
          text-sm
          font-bold
          text-primary-foreground
          shadow-sm
        "
      >
        P
      </div>

      {/* MODULES */}

      <div
        className="
          flex
          min-h-0
          w-full
          flex-1
          flex-col
          items-center
          gap-1
          overflow-y-auto
          overflow-x-hidden
          px-2
          pb-3
        "
      >
        {WORKSPACE_MODULES.map((module) => {
          const Icon = WORKSPACE_ICONS[module.id];

          const isActive = activePanel === module.id;

          return (
            <button
              key={module.id}
              type="button"
              onClick={() => onToggle(module.id)}
              title={module.label}
              aria-label={module.label}
              className={cn(
                `
                  relative
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  transition-all
                  duration-150
                `,
                isActive
                  ? `
                    bg-primary
                    text-primary-foreground
                    shadow-sm
                  `
                  : `
                    text-muted-foreground
                    hover:bg-primary/10
                    hover:text-primary
                    dark:text-muted-foreground
                    dark:hover:bg-muted
                  `
              )}
            >
              <Icon className="h-4.75 w-4.75" />

              {isActive && (
                <span
                  className="
                    absolute
                    -left-0.25
                    top-1
                    bottom-1
                    w-0.75
                    rounded-r-full
                    bg-primary
                  "
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}