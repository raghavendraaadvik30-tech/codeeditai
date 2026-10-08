import { useMemo } from "react";
import {
  BookOpen,
  FileText,
  Globe,
  ListTree,
  FileCode,
  Minus,
  Plus,
  GitCompare,
} from "lucide-react";
import { useEditor } from "../../context/EditorContext";
import { useDocumentModel } from "../../store/documentModel";
import { useTrackChanges } from "../../modules/trackChanges";

export default function EditorStatusBar() {
  const {
    zoom,
    setZoom,  
    viewMode,
    setViewMode,
    setActivePanel,
    setLeftPanelOpen,
  } = useEditor();

  const { trackChanges, pendingChanges } = useTrackChanges();
  const { model, activePage } = useDocumentModel();

  // Calculate current page number and total pages
  const totalPages = Math.max(1, model.pages.length);
  const activePageIndex = model.pages.findIndex((p) => p.id === activePage);
  const currentPageNumber = activePageIndex >= 0 ? activePageIndex + 1 : 1;

  // Calculate document word count from all pages
  const wordCount = useMemo(() => {
    if (!model.pageHtml) return 0;
    let combinedText = "";
    for (const pageId in model.pageHtml) {
      const pageContent = model.pageHtml[pageId] || "";
      combinedText += " " + pageContent.replace(/<[^>]*>/g, " ");
    }
    const words = combinedText.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }, [model.pageHtml]);

  // Zoom decrements by 10%, clamped to minimum 25%
  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.round(prev / 10) * 10 - 10;
      return Math.max(25, next);
    });
  };

  // Zoom increments by 10%, clamped to maximum 200%
  const handleZoomIn = () => {
    setZoom((prev) => {
      const next = Math.round(prev / 10) * 10 + 10;
      return Math.min(200, next);
    });
  };

  return (
    <footer
      role="status"
      aria-label="Document status and view controls"
      className="
        h-7
        shrink-0
        flex
        items-center
        justify-between
        px-3
        border-t
        border-secondary
        bg-[#F0F4F9]
        text-secondary-foreground
        dark:border-muted
        dark:bg-[#07111C]
        dark:text-muted-foreground
        text-[11px]
        font-sans
        select-none
        z-30
        print:hidden
      "
    >
      {/* LEFT: Document stats (Page X of Y, Word count, Track Changes) */}
      <div className="flex items-center gap-3">
        <span
          className="hover:text-foreground dark:hover:text-muted-foreground cursor-default"
          title={`Page ${currentPageNumber} of ${totalPages}`}
        >
          Page {currentPageNumber} of {totalPages}
        </span>
        <span className="h-3 w-px bg-secondary dark:bg-secondary-foreground" />
        <span
          className="hover:text-foreground dark:hover:text-muted-foreground cursor-default"
          title={`${wordCount} words in document`}
        >
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
        <span className="h-3 w-px bg-secondary dark:bg-secondary-foreground" />
        <button
          type="button"
          onClick={() => {
            setActivePanel("trackChanges");
            setLeftPanelOpen(true);
          }}
          className={`
            flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors
            ${
              trackChanges
                ? "bg-primary/15 text-primary/90 hover:bg-primary/30 dark:bg-navy-950/60 dark:text-navy-300"
                : "text-muted-foreground hover:bg-secondary/60 dark:text-muted-foreground dark:hover:bg-muted"
            }
          `}
          title="Click to open Track Changes panel"
        >
          <GitCompare className="h-3 w-3" />
          <span>Track Changes: {trackChanges ? "ON" : "OFF"}</span>
          {pendingChanges > 0 && (
            <span className="ml-0.5 rounded-full bg-warning-500 text-primary-foreground px-1 text-[9px] font-bold">
              {pendingChanges}
            </span>
          )}
        </button>
      </div>

      {/* RIGHT: Word-style View Modes & Zoom Controls */}
      <div className="flex items-center gap-1">
        {/* GROUP 1: Primary View Modes (Read Mode, Print Layout, Web Layout) */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setViewMode("read")}
            title="Read Mode"
            aria-label="Read Mode"
            aria-pressed={viewMode === "read"}
            className={`
              p-1
              rounded-xs
              transition-colors
              ${
                viewMode === "read"
                  ? "bg-secondary/90 text-primary border border-border/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] dark:bg-muted dark:text-primary dark:border-secondary-foreground"
                  : "text-secondary-foreground hover:bg-secondary/60 hover:text-foreground border border-transparent dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-muted-foreground"
              }
            `}
          >
            <BookOpen className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setViewMode("print")}
            title="Print Layout"
            aria-label="Print Layout"
            aria-pressed={viewMode === "print"}
            className={`
              p-1
              rounded-xs
              transition-colors
              ${
                viewMode === "print"
                  ? "bg-secondary/90 text-primary border border-border/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] dark:bg-muted dark:text-primary dark:border-secondary-foreground"
                  : "text-secondary-foreground hover:bg-secondary/60 hover:text-foreground border border-transparent dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-muted-foreground"
              }
            `}
          >
            <FileText className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setViewMode("web")}
            title="Web Layout"
            aria-label="Web Layout"
            aria-pressed={viewMode === "web"}
            className={`
              p-1
              rounded-xs
              transition-colors
              ${
                viewMode === "web"
                  ? "bg-secondary/90 text-primary border border-border/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] dark:bg-muted dark:text-primary dark:border-secondary-foreground"
                  : "text-secondary-foreground hover:bg-secondary/60 hover:text-foreground border border-transparent dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-muted-foreground"
              }
            `}
          >
            <Globe className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* VERTICAL DIVIDER 1 */}
        <div className="mx-1 h-3.5 w-px bg-secondary dark:bg-secondary-foreground" />

        {/* GROUP 2: Additional View/Layout Modes (Outline View, Draft View) */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => {
              setViewMode("outline");
              setActivePanel("document");
              setLeftPanelOpen(true);
            }}
            title="Outline View"
            aria-label="Outline View"
            aria-pressed={viewMode === "outline"}
            className={`
              p-1
              rounded-xs
              transition-colors
              ${
                viewMode === "outline"
                  ? "bg-secondary/90 text-primary border border-border/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] dark:bg-muted dark:text-primary dark:border-secondary-foreground"
                  : "text-secondary-foreground hover:bg-secondary/60 hover:text-foreground border border-transparent dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-muted-foreground"
              }
            `}
          >
            <ListTree className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setViewMode("draft")}
            title="Draft View"
            aria-label="Draft View"
            aria-pressed={viewMode === "draft"}
            className={`
              p-1
              rounded-xs
              transition-colors
              ${
                viewMode === "draft"
                  ? "bg-secondary/90 text-primary border border-border/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] dark:bg-muted dark:text-primary dark:border-secondary-foreground"
                  : "text-secondary-foreground hover:bg-secondary/60 hover:text-foreground border border-transparent dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-muted-foreground"
              }
            `}
          >
            <FileCode className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* VERTICAL DIVIDER 2 */}
        <div className="mx-1 h-3.5 w-px bg-secondary dark:bg-secondary-foreground" />

        {/* GROUP 3: Zoom Controls (Zoom %, Zoom Out, Slider, Zoom In) */}
        <div className="flex items-center gap-1 ml-1">
          {/* Zoom percentage button */}
          <button
            type="button"
            onClick={() => setZoom(100)}
            title="Zoom level. Click to reset to 100%"
            aria-label={`Current zoom level: ${Math.round(zoom)}%. Click to reset to 100%`}
            className="
              min-w-9.5
              px-1
              py-0.5
              text-right
              font-medium
              text-[11px]
              text-secondary-foreground
              hover:bg-secondary/70
              rounded-xs
              transition-colors
              dark:text-muted-foreground
              dark:hover:bg-muted
            "
          >
            {Math.round(zoom)}%
          </button>

          {/* Zoom Out Button [−] */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 25}
            title="Zoom Out"
            aria-label="Zoom Out"
            className="
              p-0.5
              rounded-xs
              text-secondary-foreground
              hover:bg-secondary/70
              hover:text-foreground
              disabled:opacity-30
              disabled:cursor-not-allowed
              transition-colors
              dark:text-muted-foreground
              dark:hover:bg-muted
              dark:hover:text-muted-foreground
            "
          >
            <Minus className="h-3 w-3" />
          </button>

          {/* Horizontal Zoom Slider Track with center tick at 100% */}
          <div className="relative flex items-center w-24 sm:w-28 mx-0.5">
            {/* Word-style center tick at 100%: (100-25)/(200-25) = 42.86% */}
            <div
              className="absolute left-[42.86%] h-2 w-0.25 bg-muted-foreground dark:bg-muted-foreground pointer-events-none -translate-x-1/2"
              title="100%"
            />
            <input
              type="range"
              min={25}
              max={200}
              step={5}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-label="Zoom level slider"
              className="
                word-zoom-slider
                w-full
                h-1
                bg-secondary
                dark:bg-secondary-foreground
                rounded-full
                appearance-none
                cursor-pointer
                outline-none
                focus-visible:ring-1
                focus-visible:ring-primary
              "
            />
          </div>

          {/* Zoom In Button [+] */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            title="Zoom In"
            aria-label="Zoom In"
            className="
              p-0.5
              rounded-xs
              text-secondary-foreground
              hover:bg-secondary/70
              hover:text-foreground
              disabled:opacity-30
              disabled:cursor-not-allowed
              transition-colors
              dark:text-muted-foreground
              dark:hover:bg-muted
              dark:hover:text-muted-foreground
            "
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}
