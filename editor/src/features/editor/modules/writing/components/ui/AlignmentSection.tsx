
import type { AlignmentTool } from "../../types/writing.types";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";

interface AlignmentSectionProps {
  tools: AlignmentTool[];
  onApply: (tool: AlignmentTool) => void;
}

const alignmentIcons = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
  justify: AlignJustify,
};

function getAlignmentType(tool: AlignmentTool) {
  const value = `${tool.cmd} ${tool.name}`.toLowerCase();

  if (value.includes("justify")) return "justify";
  if (value.includes("center")) return "center";
  if (value.includes("right")) return "right";

  return "left";
}

export default function AlignmentSection({
  tools,
  onApply,
}: AlignmentSectionProps) {
  if (tools.length === 0) {
    return null;
  }

  return (
    <section className="mb-6">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Paragraph Alignment
      </h3>

      <div className="grid grid-cols-4 gap-2">
        {tools.map((tool) => {
          const alignment = getAlignmentType(tool);
          const Icon = alignmentIcons[alignment];

          return (
            <button
              key={tool.cmd}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onApply(tool)}
              title={tool.name}
              aria-label={tool.name}
              className="
                flex min-w-0 flex-col
                items-center justify-center
                gap-1.5
                rounded-lg
                border border-secondary
                bg-card
                px-1.5 py-2.5
                text-xs
                text-secondary-foreground
                transition-all duration-200
                hover:bg-muted
                hover:border-primary/40
                hover:text-primary
                active:scale-[0.98]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary
              "
            >
              <Icon
                className="h-4 w-4 shrink-0"
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <span className="truncate max-w-full">
                {tool.name.replace("Align ", "")}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
