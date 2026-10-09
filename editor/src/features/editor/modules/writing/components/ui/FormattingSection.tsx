import type { FormattingTool } from "../../types/writing.types";

interface FormattingSectionProps {
  tools: FormattingTool[];
  onApply: (tool: FormattingTool) => void;
}

const FORMAT_ICONS: Record<string, React.ReactNode> = {
  Bold: (
    <span className="text-xl font-bold">
      B
    </span>
  ),

  Italic: (
    <span className="text-xl font-serif italic">
      I
    </span>
  ),

  Underline: (
    <span className="text-xl font-serif underline">
      U
    </span>
  ),

  Strikethrough: (
    <span className="text-xl font-serif font-semibold line-through">
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

const FORMAT_LABELS: Record<string, React.ReactNode> = {
  Strikethrough: (
    <>
      <span className="block">Strike</span>
      <span className="block">through</span>
    </>
  ),

  Subscript: (
    <>
      <span className="block">Sub</span>
      <span className="block">script</span>
    </>
  ),

  Superscript: (
    <>
      <span className="block">Super</span>
      <span className="block">script</span>
    </>
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
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Text Formatting
      </h3>

      <div className="grid grid-cols-6 gap-2">
        {tools.map((tool) => (
          <button
            key={tool.name}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onApply(tool)}
            className="
              flex
              h-21
              min-w-0
              flex-col
              items-center
              justify-center
              rounded-xl
              border
              border-secondary
              bg-card
              px-1
              shadow-sm
              transition-all
              hover:border-navy-300
              hover:bg-primary/10
              active:scale-98
            "
          >
            {/* Icon */}
            <span className="flex h-7 items-center justify-center text-foreground">
              {FORMAT_ICONS[tool.name]}
            </span>

            {/* Label */}
            <span
              className="
                mt-1
                text-center
                text-10px
                font-medium
                leading-tight
                text-secondary-foreground
              "
            >
              {FORMAT_LABELS[tool.name] ?? tool.name}
            </span>

            {/* Shortcut */}
            {tool.shortcut && (
              <span
                className="
                  mt-1
                  whitespace-nowrap
                  text-8px
                  leading-none
                  text-muted-foreground
                "
              >
                {tool.shortcut}
              </span>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
