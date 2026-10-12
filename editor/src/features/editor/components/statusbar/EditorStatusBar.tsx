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
    const cleanText = combinedText.replace(/\s+/g, " ").trim();
    return cleanText ? cleanText.split(" ").filter(Boolean).length : 0;
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
        border-[#E2E8F0]
        bg-white
        text-[#64748B]
        dark:border-slate-800
        dark:bg-[#07111C]
        dark:text-slate-400
        text-[11px]
        font-sans
        select-none
        z-30
        print:hidden
        whitespace-nowrap
        overflow-x-auto
      "
    >
      {/* LEFT: Document stats (Page X of Y, Word count, Track Changes) */}
      <div className="flex items-center gap-2.5 text-[11px] text-[#64748B] dark:text-slate-400">
        <span
          className="hover:text-[#0F172A] dark:hover:text-white cursor-default transition-colors"
          title={`Page ${currentPageNumber} of ${totalPages}`}
        >
          Page {currentPageNumber} of {totalPages}
        </span>

        <span className="h-3.5 w-px bg-[#CBD5E1] dark:bg-slate-700" />

        <span
          className="hover:text-[#0F172A] dark:hover:text-white cursor-default transition-colors"
          title={`${wordCount} words in document`}
        >
          {wordCount} words
        </span>

        <span className="h-3.5 w-px bg-[#CBD5E1] dark:bg-slate-700" />

        <button
          type="button"
          onClick={() => {
            setActivePanel("trackChanges");
            setLeftPanelOpen(true);
          }}
          className={`
            flex items-center gap-1.5 px-1 py-0.5 rounded-[2px] transition-colors cursor-pointer
            ${
              trackChanges
                ? "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300"
                : "text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            }
          `}
          title="Click to open Track Changes panel"
        >
          <GitCompare className="h-3 w-3" />
          <span>Track Changes: {trackChanges ? "ON" : "OFF"}</span>
          {pendingChanges > 0 && (
            <span className="ml-0.5 rounded-full bg-amber-500 text-white px-1 text-[9px] font-bold leading-none py-0.5">
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
              rounded-[2px]
              transition-colors
              cursor-pointer
              ${
                viewMode === "read"
                  ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800"
                  : "text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] border border-transparent dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
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
              rounded-[2px]
              transition-colors
              cursor-pointer
              ${
                viewMode === "print"
                  ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800"
                  : "text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] border border-transparent dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
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
              rounded-[2px]
              transition-colors
              cursor-pointer
              ${
                viewMode === "web"
                  ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800"
                  : "text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] border border-transparent dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              }
            `}
          >
            <Globe className="h-3.5 w-3.5" />
          </button>
        </div>

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
              rounded-[2px]
              transition-colors
              cursor-pointer
              ${
                viewMode === "outline"
                  ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800"
                  : "text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] border border-transparent dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
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
              rounded-[2px]
              transition-colors
              cursor-pointer
              ${
                viewMode === "draft"
                  ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800"
                  : "text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] border border-transparent dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              }
            `}
          >
            <FileCode className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* VERTICAL DIVIDER */}
        <div className="mx-1 h-3.5 w-px bg-[#CBD5E1] dark:bg-slate-700" />

        {/* GROUP 3: Zoom Controls (Zoom %, Zoom Out, Slider, Zoom In) */}
        <div className="flex items-center gap-1 ml-0.5">
          {/* Zoom percentage button */}
          <button
            type="button"
            onClick={() => setZoom(100)}
            title="Reset zoom to 100%"
            aria-label={`Current zoom level: ${Math.round(zoom)}%`}
            className="
              min-w-9.5
              px-1
              py-0.5
              text-right
              font-medium
              text-[11px]
              text-[#64748B]
              hover:text-[#0F172A]
              hover:bg-slate-100
              rounded-[2px]
              transition-colors
              dark:text-slate-400
              dark:hover:text-white
              dark:hover:bg-slate-800
              cursor-pointer
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
              rounded-[2px]
              text-[#64748B]
              hover:bg-slate-100
              hover:text-[#0F172A]
              disabled:opacity-30
              disabled:cursor-not-allowed
              transition-colors
              dark:text-slate-400
              dark:hover:bg-slate-800
              dark:hover:text-white
              cursor-pointer
            "
          >
            <Minus className="h-3 w-3" />
          </button>

          {/* Horizontal Zoom Slider Track with center tick at 100% */}
          <div className="relative flex items-center w-24 sm:w-28 mx-0.5">
            {/* Word-style center tick at 100%: (100-25)/(200-25) = 42.86% */}
            <div
              className="absolute left-[42.86%] h-2 w-[1px] bg-[#94A3B8] dark:bg-slate-500 pointer-events-none -translate-x-1/2"
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
                bg-transparent
                appearance-none
                cursor-pointer
                outline-none
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
              rounded-[2px]
              text-[#64748B]
              hover:bg-slate-100
              hover:text-[#0F172A]
              disabled:opacity-30
              disabled:cursor-not-allowed
              transition-colors
              dark:text-slate-400
              dark:hover:bg-slate-800
              dark:hover:text-white
              cursor-pointer
            "
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}
