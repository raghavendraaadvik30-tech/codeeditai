import { useMemo } from "react";
import {
  BookOpen,
  FileText,
  Columns,
  Minus,
  Plus,
} from "lucide-react";
import { useEditor } from "../../context/EditorContext";
import { useDocumentModel } from "../../store/documentModel";

export default function EditorStatusBar() {
  const {
    zoom,
    setZoom,  
    viewMode,
    setViewMode,
  } = useEditor();

  const { model, activePage } = useDocumentModel();

  // Calculate current page number and total pages
  const totalPages = Math.max(1, model.pages.length);
  const activePageIndex = model.pages.findIndex((p) => p.id === activePage);
  const currentPageNumber = activePageIndex >= 0 ? activePageIndex + 1 : 1;

  // Calculate document word and character counts from all pages
  const { wordCount, charCount } = useMemo(() => {
    if (!model.pageHtml) return { wordCount: 0, charCount: 0 };
    let combinedText = "";
    for (const pageId in model.pageHtml) {
      const pageContent = model.pageHtml[pageId] || "";
      combinedText += " " + pageContent.replace(/<[^>]*>/g, " ");
    }
    const cleanText = combinedText.replace(/\s+/g, " ").trim();
    const words = cleanText ? cleanText.split(" ").filter(Boolean).length : 0;
    const chars = combinedText.replace(/<[^>]*>/g, "").replace(/\r?\n|\r/g, "").length;
    return { wordCount: words, charCount: chars };
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
        h-8
        shrink-0
        flex
        items-center
        justify-between
        px-3.5
        border-t
        border-[#E2E8F0]
        bg-white
        text-[#64748B]
        dark:border-[#294564]
        dark:bg-[#0D213D]
        dark:text-slate-400
        text-xs
        font-sans
        select-none
        z-30
        print:hidden
      "
    >
      {/* LEFT: Document stats (Page 1 of 1 • 179 words • 1325 characters • 🟢 Autosaved locally) */}
      <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400">
        <span
          className="hover:text-[#0F172A] dark:hover:text-white cursor-default"
          title={`Page ${currentPageNumber} of ${totalPages}`}
        >
          Page {currentPageNumber} of {totalPages}
        </span>
        <span className="text-[#94A3B8]">•</span>
        <span
          className="hover:text-[#0F172A] dark:hover:text-white cursor-default"
          title={`${wordCount} words in document`}
        >
          {wordCount} words
        </span>
        <span className="text-[#94A3B8]">•</span>
        <span
          className="hover:text-[#0F172A] dark:hover:text-white cursor-default"
          title={`${charCount} characters in document`}
        >
          {charCount} characters
        </span>
        <span className="text-[#94A3B8]">•</span>
        <div className="flex items-center gap-1.5 text-[#059669] dark:text-[#34D399] font-medium">
          <span className="h-2 w-2 rounded-full bg-[#10B981]" />
          <span>Autosaved locally</span>
        </div>
      </div>

      {/* RIGHT: SCALE Zoom Controls & View Modes */}
      <div className="flex items-center gap-3">
        {/* SCALE & Zoom Controls Group */}
        <div className="flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 dark:border-[#294564] dark:bg-[#111D29]">
          <span className="text-[10px] font-bold tracking-wider text-[#64748B] dark:text-slate-400 uppercase">
            SCALE
          </span>

          {/* Zoom Out Button [−] */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 25}
            title="Zoom Out"
            aria-label="Zoom Out"
            className="
              flex
              h-5
              w-5
              items-center
              justify-center
              rounded-sm
              text-[#64748B]
              hover:bg-[#E2E8F0]
              hover:text-[#0F172A]
              disabled:opacity-30
              disabled:cursor-not-allowed
              transition-colors
              dark:text-slate-400
              dark:hover:bg-slate-700
              dark:hover:text-white
              cursor-pointer
            "
          >
            <Minus className="h-3 w-3" />
          </button>

          {/* Zoom percentage button */}
          <button
            type="button"
            onClick={() => setZoom(100)}
            title="Reset zoom to 100%"
            aria-label={`Current zoom level: ${Math.round(zoom)}%`}
            className="
              min-w-10
              text-center
              font-semibold
              text-[11px]
              text-[#0F172A]
              hover:text-[#2563EB]
              transition-colors
              dark:text-slate-200
              dark:hover:text-[#38BDF8]
              cursor-pointer
            "
          >
            {Math.round(zoom)}%
          </button>

          {/* Horizontal Zoom Slider Track */}
          <div className="relative flex items-center w-20 sm:w-24 mx-0.5">
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
                bg-[#CBD5E1]
                dark:bg-slate-600
                rounded-full
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
              flex
              h-5
              w-5
              items-center
              justify-center
              rounded-sm
              text-[#64748B]
              hover:bg-[#E2E8F0]
              hover:text-[#0F172A]
              disabled:opacity-30
              disabled:cursor-not-allowed
              transition-colors
              dark:text-slate-400
              dark:hover:bg-slate-700
              dark:hover:text-white
              cursor-pointer
            "
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        {/* View Mode Icons */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setViewMode("print")}
            title="Print Layout"
            aria-label="Print Layout"
            aria-pressed={viewMode === "print"}
            className={`
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-md
              transition-colors
              cursor-pointer
              ${
                viewMode === "print"
                  ? "bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]"
                  : "text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              }
            `}
          >
            <FileText className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setViewMode("web")}
            title="Split / Pages View"
            aria-label="Split / Pages View"
            aria-pressed={viewMode === "web"}
            className={`
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-md
              transition-colors
              cursor-pointer
              ${
                viewMode === "web"
                  ? "bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]"
                  : "text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              }
            `}
          >
            <Columns className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setViewMode("read")}
            title="Read Mode"
            aria-label="Read Mode"
            aria-pressed={viewMode === "read"}
            className={`
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-md
              transition-colors
              cursor-pointer
              ${
                viewMode === "read"
                  ? "bg-[#EFF6FF] text-[#2563EB] dark:bg-[#1E3A8A] dark:text-[#93C5FD]"
                  : "text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              }
            `}
          >
            <BookOpen className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
