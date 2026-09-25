import type { CaseAction } from "../../types/writing.types";

interface CaseSectionProps {
  actions: CaseAction[];
  onApply: (action: CaseAction) => void;
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
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => onApply(action)}
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
              hover:shadow
              active:scale-[0.98]
            "
          >
            <span
              className="
                text-[17px]
                font-bold
                leading-none
                text-blue-600
              "
            >
              {CASE_ICONS[action.label] ?? "Aa"}
            </span>

            <span
              className="
                mt-2
                text-center
                text-[10px]
                font-medium
                leading-3
                text-slate-700
              "
            >
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}