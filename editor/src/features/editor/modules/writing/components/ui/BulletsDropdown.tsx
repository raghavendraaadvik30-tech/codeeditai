import { useRef } from "react";

interface BulletsDropdownProps {
  onApplyStyle: (char: string, type: string) => void;
  onClose: () => void;
}

export default function BulletsDropdown({
  onApplyStyle,
  onClose,
}: BulletsDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const bulletLibrary = [
    {
      name: "None",
      char: "",
      style: "none",
      preview: "None",
    },
    {
      name: "Filled Circle",
      char: "●",
      style: "disc",
      preview: "●",
    },
    {
      name: "Hollow Circle",
      char: "○",
      style: "circle",
      preview: "○",
    },
    {
      name: "Square",
      char: "■",
      style: "square",
      preview: "■",
    },
    {
      name: "Plus",
      char: "✚",
      style: "custom",
      preview: "✚",
    },
    {
      name: "Diamond",
      char: "◆",
      style: "custom",
      preview: "◆",
    },
    {
      name: "Arrow",
      char: "➤",
      style: "custom",
      preview: "➤",
    },
    {
      name: "Check Mark",
      char: "✓",
      style: "custom",
      preview: "✓",
    },
    {
      name: "Star",
      char: "★",
      style: "custom",
      preview: "★",
    },
    {
      name: "Hollow Star",
      char: "☆",
      style: "custom",
      preview: "☆",
    },
    {
      name: "Triangle",
      char: "▸",
      style: "custom",
      preview: "▸",
    },
  ];

  const keepEditorSelection = (
    event: React.MouseEvent
  ) => {
    event.preventDefault();
  };

  const handleBullet = (
    char: string,
    type: string
  ) => {
    console.log("Bullet selected:", char, type);

    onApplyStyle(char, type);
    onClose();
  };

  return (
    <div
      ref={containerRef}
      className="
        absolute
        left-0
        top-full
        z-50
        mt-1
        w-97.5
        overflow-hidden
        rounded-md
        border
        border-border
        bg-popover
        shadow-xl
      "
    >
      {/* BULLET LIBRARY ONLY */}

      <div className="px-4 py-3">
        <h4 className="mb-3 text-sm font-semibold text-foreground">
          Bullet Library
        </h4>

        <div className="grid grid-cols-6 gap-2">
          {bulletLibrary.map((bullet) => (
            <button
              key={bullet.name}
              type="button"
              onMouseDown={keepEditorSelection}
              onClick={() =>
                handleBullet(
                  bullet.char,
                  bullet.style
                )
              }
              className="
                menu-item-btn
                flex
                h-12
                w-12
                items-center
                justify-center
                border
                border-border
                bg-popover
                text-xl
                font-semibold
                text-foreground
                hover:border-primary
                hover:bg-primary-soft/10
                focus:outline-none
              "
              title={bullet.name}
            >
              {bullet.style === "none" ? (
                <span className="text-xs font-normal text-muted-foreground">
                  None
                </span>
              ) : (
                bullet.preview
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}