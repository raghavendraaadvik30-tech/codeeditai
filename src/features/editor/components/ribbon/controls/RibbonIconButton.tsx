/*Purpose:
Reusable icon-only button for ribbon actions.

What it does:

Displays an icon without text.
Supports tooltip/title through title.
Supports click actions.
Supports disabled state.
Supports an active state.
Changes appearance when the button is active.
Prevents editor focus loss using onMouseDown.

In simple terms:

Used when a ribbon action needs only an icon, such as Bold, Undo, Redo, Print, Settings, etc.

Example:

[ B ] [ I ] [ U ] [ ↶ ] [ ↷ ]*/
 
import type {
  MouseEvent,
  ReactNode,
} from "react";

interface RibbonIconButtonProps {
  icon: ReactNode;
  title?: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  className?: string;
}

export default function RibbonIconButton({
  icon,
  title,
  onClick,
  disabled = false,
  active = false,
  className = "",
}: RibbonIconButtonProps) {
  const handleMouseDown = (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    // Prevent editor from losing focus
    event.preventDefault();
  };

  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={handleMouseDown}
      onClick={onClick}
      className={`
        inline-flex
        items-center
        justify-center

        w-8
        h-8

        rounded-md
        transition-colors

        ${
          active
            ? `
              bg-blue-100
              text-blue-700

              dark:bg-blue-900/50
              dark:text-blue-300
            `
            : `
              text-gray-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white
            `
        }

        disabled:opacity-40
        disabled:pointer-events-none

        ${className}
      `}
    >
      {icon}
    </button>
  );
}