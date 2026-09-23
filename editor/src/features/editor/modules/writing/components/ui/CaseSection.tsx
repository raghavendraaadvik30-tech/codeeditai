import type { CaseAction } from "../../types/writing.types";

interface CaseSectionProps {
  actions: CaseAction[];
  onApply: (action: CaseAction) => void;
}

export default function CaseSection({
  actions,
  onApply,
}: CaseSectionProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <section className="mb-6">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Case
      </h3>

      <div className="space-y-1">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => onApply(action)}
            className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-100"
          >
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}