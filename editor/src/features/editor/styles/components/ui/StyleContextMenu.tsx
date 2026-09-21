import {
  cn,
} from "@/lib/utils";

import {
  Pencil,
} from "lucide-react";

interface Props {
  name: string;
  instancesCount: number;
  hasOverrides: boolean;

  onMatch: () => void;
  onModify: () => void;
  onSelect: () => void;
  onClear: () => void;
  onRevert: () => void;
  onRemove: () => void;
}

export function StyleContextMenu({
  name,
  instancesCount,
  hasOverrides,

  onMatch,
  onModify,
  onSelect,
  onClear,
  onRevert,
  onRemove,
}: Props) {
  const items = [
    {
      label: (
        <>
          <u>U</u>pdate {name} to Match Selection
        </>
      ),
      action: onMatch,
    },

    {
      label: (
        <>
          <u>M</u>odify...
        </>
      ),
      action: onModify,
      icon: <Pencil className="size-3.5" />,
    },

    {
      label: (
        <>
          <u>S</u>elect All {instancesCount} Instance(s)
        </>
      ),
      action: onSelect,
      disabled: instancesCount === 0,
    },

    {
      label: (
        <>
          <u>C</u>lear Formatting of {instancesCount} Instance(s)
        </>
      ),
      action: onClear,
      disabled: instancesCount === 0,
    },

    {
      label: (
        <>
          <u>R</u>evert to {name}...
        </>
      ),
      action: onRevert,
      disabled: !hasOverrides,
    },

    null,

    {
      label: (
        <>
          Remove from Style <u>G</u>allery
        </>
      ),
      action: onRemove,
      danger: true,
    },
  ];

  return (
    <div
      className="
        absolute
        right-0
        top-[calc(100%+2px)]
        z-[60]
        w-[240px]
        rounded-md
        border
        border-border
        bg-popover
        shadow-elevated
        py-1
        select-none
      "
    >
      {items.map((item, index) => {
        if (!item) {
          return (
            <div
              key={index}
              className="
                my-1
                h-px
                bg-border/60
              "
            />
          );
        }

        return (
          <button
            key={index}
            onClick={
              item.disabled
                ? undefined
                : item.action
            }
            disabled={item.disabled}
            className={cn(
              `
              relative
              w-[calc(100%-4px)]
              text-left
              pl-[36px]
              pr-3
              py-[5px]
              text-[11px]
              flex
              items-center
              mx-[2px]
              rounded-[3px]
              border
              border-transparent
              `,
              item.disabled
                ? "text-muted-foreground/40 cursor-not-allowed"
                : cn(
                    "hover:bg-[#e2ebf6]/70 hover:border-[#a8c6eb]",
                    item.danger
                      ? "text-destructive"
                      : "text-foreground",
                  ),
            )}
          >
            {item.icon && (
              <span className="absolute left-4">
                {item.icon}
              </span>
            )}

            {item.label}
          </button>
        );
      })}
    </div>
  );
}