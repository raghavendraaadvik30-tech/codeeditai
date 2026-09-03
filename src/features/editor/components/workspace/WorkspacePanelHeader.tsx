/*Purpose:
Creates the header section of the currently selected workspace panel.

What it does:

Finds the selected module from WORKSPACE_MODULES.
Gets its corresponding icon from WORKSPACE_ICONS.
Displays the module icon, title and description.
Provides a Close button using onClose.
Returns null if the selected module does not exist.

In short:
WorkspacePanelHeader.tsx displays the identity and controls of the active panel.
*/
import { X } from "lucide-react";

import {
  WORKSPACE_MODULES,
  type ModuleId,
} from "../../data/workspaceModules";

import { WORKSPACE_ICONS } from "../workspace/WorkspaceIcons";

interface WorkspacePanelHeaderProps {
  moduleId: ModuleId;
  onClose: () => void;
}

export default function WorkspacePanelHeader({
  moduleId,
  onClose,
}: WorkspacePanelHeaderProps) {
  const module = WORKSPACE_MODULES.find(
    (item) => item.id === moduleId
  );

  if (!module) return null;

  const Icon = WORKSPACE_ICONS[moduleId];

  return (
    <div
      className="
        flex
        h-[72px]
        shrink-0
        items-start
        justify-between
        gap-3
        border-b
        border-slate-200
        bg-white
        px-4
        py-3
        dark:border-slate-800
        dark:bg-[#07131E]
      "
    >
      <div className="flex min-w-0 items-center gap-3">
        {/* Icon */}

        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-blue-50
            text-blue-600
            dark:bg-blue-950/50
            dark:text-blue-400
          "
        >
          <Icon className="h-5 w-5" />
        </div>

        {/* Title */}

        <div className="min-w-0">
          <h2
            className="
              truncate
              text-sm
              font-semibold
              text-slate-900
              dark:text-white
            "
          >
            {module.label}
          </h2>

          <p
            className="
              truncate
              text-xs
              text-slate-500
              dark:text-slate-400
            "
          >
            {module.description}
          </p>
        </div>
      </div>

      {/* CLOSE */}

      <button
        type="button"
        onClick={onClose}
        aria-label="Close panel"
        title="Close"
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-md
          text-slate-500
          transition-colors
          hover:bg-slate-100
          hover:text-slate-900
          dark:hover:bg-slate-800
          dark:hover:text-white
        "
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}