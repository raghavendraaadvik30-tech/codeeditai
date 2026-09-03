/*Purpose:
Creates a reusable dropdown/select control for the editor ribbon.

What it does:

Displays the current label.
Shows a dropdown arrow using ChevronDown.
Receives dropdown options through the options prop.
Executes option.onSelect when an option is clicked.
Allows configurable width.
Supports disabled state.
Dropdown appears on hover/focus.
Prevents editor focus loss when interacting with the ribbon.

This means the component itself doesn't hardcode the dropdown options.

In simple terms:

Used for ribbon controls where the user needs to choose one option from a dropdown.
*/

import type { MouseEvent } from "react";
import { ChevronDown } from "lucide-react";

export interface RibbonSelectOption {
  label: string;
  onSelect: () => void;
}

interface RibbonSelectProps {
  label: string;
  options: RibbonSelectOption[];
  width?: number;
  disabled?: boolean;
}

export default function RibbonSelect({
  label,
  options,
  width = 120,
  disabled = false,
}: RibbonSelectProps) {
  const handleMouseDown = (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    // Keep editor focused
    event.preventDefault();
  };

  return (
    <div className="relative group">

      {/* --------------------------------
          SELECT BUTTON
      -------------------------------- */}

      <button
        type="button"
        disabled={disabled}
        onMouseDown={handleMouseDown}
        className="
          flex
          h-8
          items-center
          gap-2
          rounded-md
          border
          border-slate-300
          dark:border-slate-700
          bg-white
          dark:bg-[#111D29]
          px-2
          text-xs
          text-gray-800
          dark:text-slate-200
          hover:bg-slate-50
          dark:hover:bg-slate-800
          disabled:opacity-50
          disabled:pointer-events-none
        "
        style={{ minWidth: width }}
      >
        <span
          className="
            flex-1
            truncate
            text-left
          "
        >
          {label}
        </span>

        <ChevronDown
          className="
            h-3.5
            w-3.5
            shrink-0
            text-slate-500
            dark:text-slate-400
          "
        />
      </button>

      {/* --------------------------------
          DROPDOWN
      -------------------------------- */}

      <div
        className="
          absolute
          left-0
          top-full
          z-50
          mt-1
          hidden
          min-w-full
          overflow-hidden
          rounded-md
          border
          border-slate-200
          dark:border-slate-700
          bg-white
          dark:bg-[#0D1A26]
          shadow-lg
          group-hover:block
          group-focus-within:block
        "
      >
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            onMouseDown={handleMouseDown}
            onClick={option.onSelect}
            className="
              block
              w-full
              px-3
              py-2
              text-left
              text-xs
              text-slate-700
              hover:bg-slate-100
              hover:text-slate-900
              dark:text-slate-200
              dark:hover:bg-slate-800
              dark:hover:text-white
            "
          >
            {option.label}
          </button>
        ))}
      </div>

    </div>
  );
}