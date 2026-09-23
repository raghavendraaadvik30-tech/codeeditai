
import { useState } from "react";

import type { ListTool } from "../../types/writing.types";

import BulletsDropdown from "./BulletsDropdown";
import NumberingDropdown from "./NumberingDropdown";
import MultilevelDropdown from "./MultilevelDropdown";

interface ListSectionProps {
  tools: ListTool[];
  onApplyBullets: (style?: string) => void;
  onApplyNumbering: (style?: string) => void;
  onApplyMultilevel: (style: string) => void;
  onToggleMultilevel: () => void;
}

export default function ListSection({
  tools,
  onApplyBullets,
  onApplyNumbering,
  onApplyMultilevel,
  onToggleMultilevel,
}: ListSectionProps) {
  const [openDropdown, setOpenDropdown] = useState<
    "bullets" | "numbering" | "multilevel" | null
  >(null);

  if (tools.length === 0) {
    return null;
  }

  const toggleDropdown = (
    dropdown: "bullets" | "numbering" | "multilevel"
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
          if (tool.type === "bullets") {
            return (
              <div
                key={tool.name}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() => toggleDropdown("bullets")}
                  className="flex w-full items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
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
                    onSelect={(style) => {
                      onApplyBullets(style);
                      closeDropdown();
                    }}
                  />
                )}
              </div>
            );
          }

          if (tool.type === "numbering") {
            return (
              <div
                key={tool.name}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() =>
                    toggleDropdown("numbering")
                  }
                  className="flex w-full items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
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

          return (
            <div
              key={tool.name}
              className="relative"
            >
              <button
                type="button"
                onClick={() =>
                  toggleDropdown("multilevel")
                }
                className="flex w-full items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
              >
                <span className="flex items-center">
                  <span className="mr-3 text-xs leading-tight">
                    1.
                    <br />
                    1.1
                  </span>

                  <span>{tool.name}</span>
                </span>

                <span className="text-xs text-gray-400">
                  ▾
                </span>
              </button>

              {openDropdown === "multilevel" && (
                <MultilevelDropdown
                  onSelect={(style) => {
                    onApplyMultilevel(style);
                    onToggleMultilevel();
                    closeDropdown();
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}