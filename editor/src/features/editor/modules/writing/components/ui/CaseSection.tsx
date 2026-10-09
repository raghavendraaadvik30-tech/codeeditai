import type { CaseAction } from "../../types/writing.types";

interface CaseSectionProps {
  actions: CaseAction[];
  onApply: (action: CaseAction) => void;
  activeCase: string | null;
}

const CASE_ICONS: Record<string, string> = {
  "Sentence case": "Aa",
  "Title Case": "Aa",
  "UPPER CASE": "AA",
  "lower case": "aa",
  "Toggle Case": "aA",
  Normalize: "ab",
};

export default function CaseSection({
  actions,
  onApply,
  activeCase,
}: CaseSectionProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <section className="mb-5">
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Case
      </h3>

      <div className="grid grid-cols-6 gap-1.5">
        {actions.map((action) => {
          const isActive = activeCase === action.label;

          return (
            <button
              key={action.label}
              type="button"

              /*
               * VERY IMPORTANT:
               * Prevent the button from stealing focus from
               * the selected text in the editor.
               */
              onMouseDown={(event) => {
                event.preventDefault();
              }}

              onClick={() => onApply(action)}

              className={`
                flex
                h-19
                min-w-0
                flex-col
                items-center
                justify-center
                rounded-xl
                border
                px-1
                transition-all
                active:scale-98

                ${
                  isActive
                    ? `
                      border-primary
                      bg-primary/10
                      ring-2
                      ring-primary/15
                      shadow-sm
                    `
                    : `
                      border-secondary
                      bg-card
                      shadow-sm
                      hover:border-navy-300
                      hover:bg-primary/10
                      hover:shadow
                    `
                }
              `}
            >
              <span
                className={`
                  text-17px
                  font-bold
                  leading-none

                  ${
                    isActive
                      ? "text-primary/90"
                      : "text-primary"
                  }
                `}
              >
                {CASE_ICONS[action.label] ?? "Aa"}
              </span>

              <span
                className={`
                  mt-2
                  text-center
                  text-10px
                  font-medium
                  leading-3

                  ${
                    isActive
                      ? "text-primary/90"
                      : "text-secondary-foreground"
                  }
                `}
              >
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
