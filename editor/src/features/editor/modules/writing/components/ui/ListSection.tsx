import { useState } from "react";
import type { ListTool } from "../../types/writing.types";
import BulletsDropdown from "./BulletsDropdown";
import NumberingDropdown from "./NumberingDropdown";

interface ListSectionProps {
  tools: ListTool[];
  onApplyBullets: (style?: string) => void;
  onApplyNumbering: (style?: string) => void;
}

export default function ListSection({
  tools,
  onApplyBullets,
  onApplyNumbering,
}: ListSectionProps) {
  const [openDropdown, setOpenDropdown] = useState<
    "bullets" | "numbering" | null
  >(null);

  if (!tools || tools.length === 0) {
    return null;
  }

  const toggleDropdown = (
    dropdown: "bullets" | "numbering"
  ) => {
    setOpenDropdown((current) =>
      current === dropdown ? null : dropdown
    );
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  return (
    <section className="mb-6">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Lists
      </h3>

      <div className="space-y-2">
        {tools.map((tool) => {
          /* =========================
             BULLETS
          ========================= */
          if (tool.type === "bullets") {
            return (
              <div
                key={tool.name}
                className="relative"
              >
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    toggleDropdown("bullets")
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-md
                    border
                    border-gray-200
                    px-3
                    py-2
                    text-left
                    text-sm
                    text-gray-700
                    transition
                    hover:bg-gray-100
                  "
                >
                  <span className="flex items-center">
                    <span className="mr-3 text-base">
                      •
                    </span>

                    <span>{tool.name}</span>
                  </span>

                  <span className="text-xs text-gray-400">
                    ▾
                  </span>
                </button>

                {openDropdown === "bullets" && (
                  <BulletsDropdown
                    onApplyStyle={(char, type) => {
                      onApplyBullets(
                        type === "custom"
                          ? `custom:${char}`
                          : type
                      );

                      closeDropdown();
                    }}
                    onClose={closeDropdown}
                  />
                )}
              </div>
            );
          }

          /* =========================
             NUMBERING
          ========================= */
          if (tool.type === "numbering") {
            return (
              <div
                key={tool.name}
                className="relative"
              >
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    toggleDropdown("numbering")
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-md
                    border
                    border-gray-200
                    px-3
                    py-2
                    text-left
                    text-sm
                    text-gray-700
                    transition
                    hover:bg-gray-100
                  "
                >
                  <span className="flex items-center">
                    <span className="mr-3 text-sm">
                      1.
                    </span>

                    <span>{tool.name}</span>
                  </span>

                  <span className="text-xs text-gray-400">
                    ▾
                  </span>
                </button>

                {openDropdown === "numbering" && (
                  <NumberingDropdown
                    onSelect={(style) => {
                      onApplyNumbering(style);
                      closeDropdown();
                    }}
                  />
                )}
              </div>
            );
          }

          /*
           * Ignore any other list types.
           * Multilevel is intentionally not displayed.
           */
          return null;
        })}
      </div>
    </section>
  );
}