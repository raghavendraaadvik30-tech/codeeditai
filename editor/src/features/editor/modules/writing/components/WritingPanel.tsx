import { useWriting } from "../hooks/useWriting";
import { useWritingContext } from "../context/WritingContext";

import WritingSearch from "./ui/WritingSearch";
import CaseSection from "./ui/CaseSection";
import FormattingSection from "./ui/FormattingSection";
import FontColorSection from "./ui/FontColorSection";
import HighlightSection from "./ui/HighlightSection";
import AlignmentSection from "./ui/AlignmentSection";
import ListSection from "./ui/ListSection";

export default function WritingPanel() {
  const {
    searchQuery,
    setSearchQuery,
    caseActions,
    formattingTools,
    alignmentTools,
    listTools,
  } = useWritingContext();

  const {
    applyCase,
    applyFormatting,
    applyAlignment,
    applyFontColor,
    applyHighlight,
    clearHighlight,
    applyBullets,
    applyNumbering,
    applyMultilevel,
    toggleMultilevel,
  } = useWriting();

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Writing
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Casing, emphasis & paragraph control
        </p>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <WritingSearch
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* Tools */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <CaseSection
          actions={caseActions}
          onApply={applyCase}
        />

        <FormattingSection
          tools={formattingTools}
          onApply={applyFormatting}
        />

        <FontColorSection
          onApply={applyFontColor}
        />

        <HighlightSection
          onApply={applyHighlight}
          onClear={clearHighlight}
        />

        <AlignmentSection
          tools={alignmentTools}
          onApply={applyAlignment}
        />

        <ListSection
          tools={listTools}
          onApplyBullets={applyBullets}
          onApplyNumbering={applyNumbering}
          onApplyMultilevel={applyMultilevel}
          onToggleMultilevel={toggleMultilevel}
        />
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-3">
        <p className="text-xs text-gray-500">
          Tip: Select text first, then choose a writing tool.
        </p>
      </div>
    </div>
  );
}