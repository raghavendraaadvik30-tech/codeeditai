import type { FormattingTool } from "../../types/writing.types";

interface FormattingSectionProps {
  tools: FormattingTool[];
  onApply: (tool: FormattingTool) => void;
}

export default function FormattingSection({
  tools,
  onApply,
}: FormattingSectionProps) {
  if (tools.length === 0) {
    return null;
  }

  return (
    <section className="mb-6">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Text Formatting
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {tools.map((tool) => (
          <button
            key={tool.name}
            type="button"
            onClick={() => onApply(tool)}
            className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
            title={tool.shortcut ?? tool.name}
          >
            <span>{tool.name}</span>

            {tool.shortcut && (
              <span className="ml-2 text-xs text-gray-400">
                {tool.shortcut}
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}