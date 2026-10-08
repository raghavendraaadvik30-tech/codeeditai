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
              bg-primary/15
              text-primary/90

              dark:bg-navy-900/50
              dark:text-navy-300
            `
            : `
              text-secondary-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-muted hover:text-foreground dark:hover:text-primary-foreground
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