/*Purpose:
Reusable text button component for the editor ribbon.

What it does:

Displays text with an optional icon.
Accepts an onClick action.
Supports disabled state.
Allows additional CSS classes.
Uses onMouseDown with preventDefault() so clicking the ribbon does not remove focus from the editor.

In simple terms:

Used for ribbon actions that need icon + text, such as Save, Undo, Redo, Copy, etc.
*/

import type { ReactNode, MouseEvent } from "react";

interface RibbonButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  title?: string;
}

export default function RibbonButton({
  children,
  icon,
  onClick,
  disabled = false,
  className = "",
  title,
}: RibbonButtonProps) {
  const handleMouseDown = (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    // Keep the editor focused while clicking ribbon buttons
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
        gap-1.5
        whitespace-nowrap
        rounded-md
        px-2.5
        h-8
        text-xs
        font-medium
        transition-colors
        hover:bg-muted
        active:bg-secondary
        disabled:opacity-50
        disabled:pointer-events-none
        ${className}
      `}
    >
      {icon && (
        <span className="flex items-center">
          {icon}
        </span>
      )}

      <span>{children}</span>
    </button>
  );
}