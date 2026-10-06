/*
Purpose:

Creates a reusable dropdown/select control for the editor ribbon.

What it does:

- Displays the current label.
- Shows a dropdown arrow.
- Receives dropdown options through the options prop.
- Executes option.onSelect when an option is clicked.
- Allows configurable width.
- Supports disabled state.
- Prevents editor focus loss when interacting with the ribbon.
- Scrollable list for long options such as font families and font sizes.
*/

import { useEffect, useRef, useState, type MouseEvent } from "react";
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
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const preventFocusLoss = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    const handleOutsideClick = (event: globalThis.MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseDown={preventFocusLoss}
      className="relative select-none"
    >
      {/* SELECT BUTTON */}
      <button
        type="button"
        disabled={disabled}
        onMouseDown={preventFocusLoss}
        onClick={() => setIsOpen((prev) => !prev)}
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
          cursor-pointer
        "
        style={{ minWidth: width }}
      >
        <span className="flex-1 truncate text-left">
          {label}
        </span>

        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-400 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN */}
      {isOpen && (
        <div
          onMouseDown={preventFocusLoss}
          className="
            absolute
            left-0
            top-full
            z-50
            mt-1
            max-h-60
            overflow-y-auto
            min-w-full
            rounded-md
            border
            border-slate-200
            dark:border-slate-700
            bg-white
            dark:bg-[#0D1A26]
            shadow-lg
            py-1
          "
        >
          {options.map((option) => (
            <button
              key={option.label}
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => {
                option.onSelect();
                setIsOpen(false);
              }}
              className="
                block
                w-full
                px-3
                py-1.5
                text-left
                text-xs
                text-slate-700
                hover:bg-blue-50
                hover:text-blue-600
                dark:text-slate-200
                dark:hover:bg-slate-800
                dark:hover:text-white
                cursor-pointer
                transition-colors
              "
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}