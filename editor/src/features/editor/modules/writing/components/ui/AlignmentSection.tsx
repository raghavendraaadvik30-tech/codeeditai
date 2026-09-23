import type { AlignmentTool } from "../../types/writing.types";

interface AlignmentSectionProps {
  tools: AlignmentTool[];
  onApply: (tool: AlignmentTool) => void;
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
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Paragraph Alignment
      </h3>

      <div className="grid grid-cols-4 gap-2">
        {tools.map((tool) => (
          <button
            key={tool.cmd}
            type="button"
            onClick={() => onApply(tool)}
            title={tool.name}
            aria-label={tool.name}
            className="rounded-md border border-gray-200 px-2 py-2 text-xs text-gray-700 transition hover:bg-gray-100"
          >
            {tool.name.replace("Align ", "")}
          </button>
        ))}
      </div>
    </section>
  );
}