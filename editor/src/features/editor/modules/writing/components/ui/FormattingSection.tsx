import type { FormattingTool } from "../../types/writing.types";

interface FormattingSectionProps {
  tools: FormattingTool[];
  onApply: (tool: FormattingTool) => void;
}

const FORMAT_ICONS: Record<string, React.ReactNode> = {
  Bold: <span className="text-xl font-bold">B</span>,
  Italic: <span className="text-xl font-serif italic">I</span>,
  Underline: (
    <span className="text-xl font-serif underline">
      U
    </span>
  ),
  Strikethrough: (
    <span className="text-xl font-serif line-through">
      S
    </span>
  ),
  Subscript: (
    <span className="text-lg">
      X<sub>2</sub>
    </span>
  ),
  Superscript: (
    <span className="text-lg">
      X<sup>2</sup>
    </span>
  ),
};

export default function FormattingSection({
  tools,
  onApply,
}: FormattingSectionProps) {
  if (tools.length === 0) {
    return null;
  }

  return (
    <section className="mb-5">
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        Text Formatting
      </h3>

      <div className="grid grid-cols-6 gap-1.5">
        {tools.map((tool) => (
          <button
            key={tool.name}
            type="button"
            onClick={() => onApply(tool)}
            className="
              flex
              h-[76px]
              min-w-0
              flex-col
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              px-1
              shadow-sm
              transition-all
              hover:border-blue-300
              hover:bg-blue-50
              active:scale-[0.98]
            "
          >
            <span className="flex h-6 items-center justify-center text-slate-900">
              {FORMAT_ICONS[tool.name]}
            </span>

            <span className="mt-1 text-[10px] font-medium text-slate-700">
              {tool.name}
            </span>

            {tool.shortcut && (
              <span className="mt-0.5 text-[8px] text-slate-400">
                {tool.shortcut}
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}