import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  Minus,
  Plus,
  GitCompare,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useEditor } from "../../context/EditorContext";
import { useDocumentModel } from "../../store/documentModel";
import { useTrackChanges } from "../../modules/trackChanges";

// Only Read Mode has a footer button for now.
const VIEW_MODES = [{ id: "read", label: "Read Mode", Icon: BookOpen }] as const;

// A4 at 96 dpi. Change if your pages use another size.
const PAGE_W = 794;
const PAGE_H = 1123;
const PAGE_GAP = 6;
const TOOLBAR_H = 36;

/* =========================================================
   READ MODE  (full screen, like MS Word)
   - covers the whole window (ribbon, panels, footer hidden)
   - pages shown side by side, "Screen 1-2 of N"
   - prev / next arrows, keyboard: ← → PgUp PgDn Space Home End
   - mouse wheel: scroll down = next screen, scroll up = previous
   - Esc or Close leaves Read Mode
   Reads pages straight from the document model, so it needs
   no changes in your editor canvas.
   ========================================================= */
type ReadModePage = { id: string };

type ReadModeViewProps = {
  pages: ReadModePage[];
  pageHtml: Record<string, string | undefined>;
  initialIndex: number;
  onClose: () => void;
};

function ReadModeView({
  pages,
  pageHtml,
  initialIndex,
  onClose,
}: ReadModeViewProps) {
  const [start, setStart] = useState(initialIndex);
  const [size, setSize] = useState({
    w: typeof window !== "undefined" ? window.innerWidth : 1280,
    h: typeof window !== "undefined" ? window.innerHeight - TOOLBAR_H : 720,
  });
  const areaRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const wheelLock = useRef<number>(0);

  const total = Math.max(1, pages.length);
  const perScreen = size.w >= 900 ? 2 : 1;
  const first = start - (start % perScreen); // first page index on screen
  const last = Math.min(first + perScreen, total); // exclusive
  const canPrev = first > 0;
  const canNext = last < total;

  const goPrev = () => setStart(Math.max(0, first - perScreen));
  const goNext = () => canNext && setStart(first + perScreen);

  // Fit pages to the screen
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Lock page scroll behind the overlay
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        goNext();
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Home") {
        setStart(0);
      } else if (e.key === "End") {
        setStart(total - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Mouse wheel: scroll down = next screen, scroll up = previous screen
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - wheelLock.current < 350 || Math.abs(e.deltaY) < 4) return;
      wheelLock.current = now;
      if (e.deltaY > 0) goNext();
      else goPrev();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  const padX = 24;
  const padY = 16;
  const availW = size.w - padX * 2 - PAGE_GAP * (perScreen - 1);
  const availH = size.h - padY * 2;
  const scale = Math.max(
    0.2,
    Math.min(availH / PAGE_H, availW / (PAGE_W * perScreen), 1.6)
  );

  const visible = pages.slice(first, last);
  const screenLabel =
    last - first > 1
      ? `Screen ${first + 1}-${last} of ${total}`
      : `Screen ${first + 1} of ${total}`;

  const toolbarBtn =
    "flex items-center gap-1 px-2 h-7 rounded-[3px] text-[12px] text-slate-700 hover:bg-white/70 hover:shadow-[inset_0_0_0_1px_#c5cbd3] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none cursor-pointer disabled:cursor-default transition-colors";

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Read Mode"
      className="fixed inset-0 z-[9999] flex flex-col font-sans print:hidden"
      style={{ background: "#8d939c" }}
    >
      {/* TOP BAR */}
      <div
        className="relative shrink-0 flex items-center justify-between px-2 border-b border-[#aab1ba]"
        style={{
          height: TOOLBAR_H,
          background: "linear-gradient(#f6f7f9, #dde1e7)",
        }}
      >
        {/* left spacer (keeps navigation centered) */}
        <div className="w-40" />

        {/* centre: navigation */}
        <div className="flex items-center gap-1 text-[12px] text-slate-700">
          <button
            type="button"
            onClick={goPrev}
            disabled={!canPrev}
            aria-label="Previous screen"
            title="Previous screen"
            className={toolbarBtn}
          >
            <ChevronLeft className="h-4 w-4 text-blue-600" />
          </button>
          <span className="min-w-[130px] text-center select-none">
            {screenLabel}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={!canNext}
            aria-label="Next screen"
            title="Next screen"
            className={toolbarBtn}
          >
            <ChevronRight className="h-4 w-4 text-blue-600" />
          </button>
        </div>

        {/* right: Close */}
        <div className="flex items-center justify-end w-40">
          <button
            type="button"
            onClick={onClose}
            className={toolbarBtn}
            title="Close (Esc)"
          >
            <X className="h-3.5 w-3.5" />
            Close
          </button>
        </div>
      </div>

      {/* PAGES */}
      <div
        ref={areaRef}
        className="flex-1 min-h-0 flex items-center justify-center overflow-hidden"
        style={{ gap: PAGE_GAP }}
      >
        {visible.length === 0 && (
          <div
            style={{
              width: PAGE_W * scale,
              height: PAGE_H * scale,
              background: "#fff",
            }}
          />
        )}

        {visible.map((page, i) => {
          const isFirstOnScreen = i === 0;
          const isLastOnScreen = i === visible.length - 1;
          const html = (pageHtml && pageHtml[page.id]) || "";
          return (
            <div
              key={page.id}
              className="relative shrink-0 shadow-[0_0_6px_rgba(0,0,0,0.35)]"
              style={{ width: PAGE_W * scale, height: PAGE_H * scale }}
            >
              <div
                data-read-page-content=""
                className="absolute top-0 left-0 overflow-hidden text-black"
                style={{
                  width: PAGE_W,
                  height: PAGE_H,
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                  background: "#ffffff",
                  padding: "96px",
                  boxSizing: "border-box",
                  fontFamily: '"Times New Roman", Times, serif',
                  fontSize: "16px",
                  lineHeight: 1.5,
                }}
                dangerouslySetInnerHTML={{ __html: html }}
              />

              {isFirstOnScreen && canPrev && (
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous screen"
                  className="absolute bottom-2 left-2 p-1 rounded-[2px] text-slate-400 hover:text-blue-600 hover:bg-slate-100 cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {isLastOnScreen && canNext && (
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next screen"
                  className="absolute bottom-2 right-2 p-1 rounded-[2px] text-slate-400 hover:text-blue-600 hover:bg-slate-100 cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* keeps images/tables inside the page */}
      <style>{`
        [data-read-page-content] img,
        [data-read-page-content] table { max-width: 100%; }
        [data-read-page-content] a { color: #0563c1; text-decoration: underline; }
      `}</style>
    </div>,
    document.body
  );
}

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

  // Unsupported saved mode (web/outline/draft) falls back to Print Layout
  useEffect(() => {
    if (viewMode !== "read" && viewMode !== "print") setViewMode("print");
  }, [viewMode, setViewMode]);

  // ---------------------------------------------------------------------
  // Document stats
  // ---------------------------------------------------------------------
  const totalPages = Math.max(1, model.pages.length);
  const activePageIndex = model.pages.findIndex((p) => p.id === activePage);
  const currentPageNumber = activePageIndex >= 0 ? activePageIndex + 1 : 1;

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

  // ---------------------------------------------------------------------
  // Zoom
  // ---------------------------------------------------------------------
  const handleZoomOut = () => {
    setZoom((prev) => Math.max(25, Math.round(prev / 10) * 10 - 10));
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(200, Math.round(prev / 10) * 10 + 10));
  };

  return (
    <>
      {/* Full-screen Read Mode (Word style) */}
      {viewMode === "read" && (
        <ReadModeView
          pages={model.pages}
          pageHtml={model.pageHtml}
          initialIndex={Math.max(0, activePageIndex)}
          onClose={() => setViewMode("print")}
        />
      )}

      <footer
        role="status"
        aria-label="Document status and view controls"
        className="
          relative
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
        {/* LEFT: Page X of Y, word count, Track Changes */}
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
              ${trackChanges
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

        {/* CENTER: Copyright */}
        <div className="absolute left-1/2 -translate-x-1/2 text-[10px] text-[#64748B] dark:text-slate-400 whitespace-nowrap pointer-events-none">
          All rights are reserved @ 2026 - CodeOrigin.Ai Pvt. Ltd.
        </div>

        {/* RIGHT: View modes + zoom */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-0.5" role="group" aria-label="View modes">
            {VIEW_MODES.map(({ id, label, Icon }) => {
              const active = viewMode === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setViewMode(id)}
                  title={label}
                  aria-label={label}
                  aria-pressed={active}
                  className={`
                    p-1
                    rounded-[2px]
                    transition-colors
                    cursor-pointer
                    ${active
                      ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800"
                      : "text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] border border-transparent dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    }
                  `}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>

          <div className="mx-1 h-3.5 w-px bg-[#CBD5E1] dark:bg-slate-700" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1 ml-0.5">
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

            <div className="relative flex items-center w-24 sm:w-28 mx-0.5">
              {/* Center tick at 100%: (100-25)/(200-25) = 42.86% */}
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
    </>
  );
}