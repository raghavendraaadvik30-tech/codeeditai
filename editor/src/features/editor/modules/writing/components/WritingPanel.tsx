import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useWriting } from "../hooks/useWriting";
import { useWritingContext } from "../context/WritingContext";

import WritingSearch from "./ui/WritingSearch";
import CaseSection from "./ui/CaseSection";
import FormattingSection from "./ui/FormattingSection";
import FontColorSection from "./ui/FontColorSection";
import HighlightSection from "./ui/HighlightSection";
import AlignmentSection from "./ui/AlignmentSection";
import ListSection from "./ui/ListSection";

function LineSpacingIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="6 6 3.5 3.5 1 6" />
      <line x1="3.5" y1="3.5" x2="3.5" y2="20.5" />
      <polyline points="6 18 3.5 20.5 1 18" />
      <line x1="9" y1="5" x2="21" y2="5" />
      <line x1="9" y1="10" x2="21" y2="10" />
      <line x1="9" y1="15" x2="21" y2="15" />
      <line x1="9" y1="20" x2="21" y2="20" />
    </svg>
  );
}

const LINE_SPACING_OPTIONS = ["1.0", "1.15", "1.5", "2.0", "2.5", "3.0"];

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
    activeLineSpacing,
    applyLineSpacing,
    applyFontColor,
    applyHighlight,
    clearHighlight,
    applyBullets,
    applyNumbering,
  } = useWriting();

  const [isLineSpacingOpen, setIsLineSpacingOpen] = useState(false);
  const lineSpacingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        lineSpacingRef.current &&
        !lineSpacingRef.current.contains(event.target as Node)
      ) {
        setIsLineSpacingOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

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

        {/* LINE SPACING */}
        <section className="mb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Line Spacing
          </h3>

          <div ref={lineSpacingRef} className="relative">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setIsLineSpacingOpen((prev) => !prev)}
              aria-haspopup="listbox"
              aria-expanded={isLineSpacingOpen}
              className="
                flex
                w-full
                items-center
                justify-between
                rounded-md
                border
                border-secondary
                px-3
                py-2
                text-left
                text-xs
                text-secondary-foreground
                transition
                hover:bg-muted
                cursor-pointer
              "
            >
              <span className="flex items-center gap-2.5">
                <LineSpacingIcon className="h-4 w-4 shrink-0 text-secondary-foreground" />
                <span className="font-medium text-foreground">
                  Line Spacing: <span className="font-bold text-primary">{activeLineSpacing}</span>
                </span>
              </span>

              <ChevronDown
                className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-150 ${
                  isLineSpacingOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isLineSpacingOpen && (
              <div
                role="listbox"
                className="
                  absolute
                  left-0
                  top-full
                  z-50
                  mt-1
                  w-full
                  rounded-md
                  border
                  border-secondary
                  bg-popover
                  p-1
                  shadow-lg
                  animate-in
                  fade-in-50
                  zoom-in-95
                  duration-100
                "
              >
                {LINE_SPACING_OPTIONS.map((val) => {
                  const isSelected = activeLineSpacing === val;
                  return (
                    <button
                      key={val}
                      role="option"
                      aria-selected={isSelected}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        applyLineSpacing(val);
                        setIsLineSpacingOpen(false);
                      }}
                      className={`
                        flex
                        w-full
                        items-center
                        justify-between
                        rounded
                        px-2.5
                        py-1.5
                        text-xs
                        transition
                        cursor-pointer
                        ${
                          isSelected
                            ? "bg-primary/10 font-bold text-primary dark:bg-primary/20"
                            : "text-foreground hover:bg-muted font-medium"
                        }
                      `}
                    >
                      <span className="flex items-center gap-2">
                        <span>{val}</span>
                        {val === "1.0" && <span className="text-[10px] text-muted-foreground">(Single)</span>}
                        {val === "1.15" && <span className="text-[10px] text-muted-foreground">(Default)</span>}
                        {val === "2.0" && <span className="text-[10px] text-muted-foreground">(Double)</span>}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

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
