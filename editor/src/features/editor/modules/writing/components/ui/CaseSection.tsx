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
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
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
                h-[76px]
                min-w-0
                flex-col
                items-center
                justify-center
                rounded-xl
                border
                px-1
                transition-all
                active:scale-[0.98]

                ${
                  isActive
                    ? `
                      border-blue-500
                      bg-blue-50
                      ring-2
                      ring-blue-100
                      shadow-sm
                    `
                    : `
                      border-slate-200
                      bg-white
                      shadow-sm
                      hover:border-blue-300
                      hover:bg-blue-50
                      hover:shadow
                    `
                }
              `}
            >
              <span
                className={`
                  text-[17px]
                  font-bold
                  leading-none

                  ${
                    isActive
                      ? "text-blue-700"
                      : "text-blue-600"
                  }
                `}
              >
                {CASE_ICONS[action.label] ?? "Aa"}
              </span>

              <span
                className={`
                  mt-2
                  text-center
                  text-[10px]
                  font-medium
                  leading-3

                  ${
                    isActive
                      ? "text-blue-700"
                      : "text-slate-700"
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