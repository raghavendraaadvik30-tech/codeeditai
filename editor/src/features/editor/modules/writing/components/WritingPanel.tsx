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
    <div className="flex h-full min-h-0 flex-col bg-white">

      {/* SEARCH */}
      <div className="shrink-0 px-4 pb-3 pt-4">
        <WritingSearch
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* TOOLS */}
      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          px-4
          pb-20
          scrollbar-thin
          scrollbar-thumb-slate-300
        "
      >
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
        
        />
      </div>

      {/* FOOTER */}
      <div
        className="
          shrink-0
          border-t
          border-slate-200
          bg-white
          px-4
          py-2.5
        "
      >
        <p className="text-xs text-slate-500">
          Tip: Select text first, then choose a
          writing tool.
        </p>
      </div>

    </div>
  );
}