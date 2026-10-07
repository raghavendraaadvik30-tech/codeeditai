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
    activeCase,
    applyCase,
    applyFormatting,
    applyAlignment,
    applyFontColor,
    applyHighlight,
    clearHighlight,
    applyBullets,
    applyNumbering,
     } = useWriting();

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">

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
          scrollbar-thumb-secondary
        "
      >

        {/* CASE */}
        <CaseSection
          actions={caseActions}
          activeCase={activeCase}
          onApply={applyCase}
        />

        {/* FORMATTING */}
        <FormattingSection
          tools={formattingTools}
          onApply={applyFormatting}
        />

        {/* FONT COLOR */}
        <FontColorSection
          onApply={applyFontColor}
        />

        {/* HIGHLIGHT */}
        <HighlightSection
          onApply={applyHighlight}
          onClear={clearHighlight}
        />

        {/* ALIGNMENT */}
        <AlignmentSection
          tools={alignmentTools}
          onApply={applyAlignment}
        />

        {/* LISTS */}
        <ListSection
          tools={listTools}
          onApplyBullets={applyBullets}
          onApplyNumbering={applyNumbering}
          //onApplyMultilevel={applyMultilevel}
         // onToggleMultilevel={toggleMultilevel}
        />

      </div>

      {/* FOOTER */}
      <div
        className="
          shrink-0
          border-t
          border-secondary
          bg-card
          px-4
          py-2.5
        "
      >
        <p className="text-xs text-muted-foreground">
          Tip: Select text first, then choose a
          writing tool.
        </p>
      </div>

    </div>
  );
}