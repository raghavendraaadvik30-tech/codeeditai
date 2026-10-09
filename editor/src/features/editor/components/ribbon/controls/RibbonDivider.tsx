/*Purpose:
Creates a vertical separator between groups of ribbon controls.

What it does:

Renders a thin vertical line.
Allows custom height.
Allows additional Tailwind classes.
Supports light and dark mode.

In simple terms:

Used to visually separate groups of buttons in the ribbon.

Example:

Bold  Italic  Underline  |  Align Left  Align Center  |

The | is the RibbonDivider.
*/

interface RibbonDividerProps {
  /**
   * Height of the divider
   * (Tailwind height class)
   */
  height?: string;

  /**
   * Additional Tailwind classes
   */
  className?: string;
}

export default function RibbonDivider({
  height = "h-8",
  className = "",
}: RibbonDividerProps) {
  return (
    <div
      className={`
        mx-2
        w-px
        shrink-0
        self-center

        bg-secondary
        dark:bg-secondary-foreground

        ${height}
        ${className}
      `}
      aria-hidden="true"
    />
  );
}
