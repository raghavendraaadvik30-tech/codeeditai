/*
### `Workspace.tsx` — Description

**Purpose:**
`Workspace.tsx` is the **main document editing workspace**. It displays document pages, manages page editing, synchronizes content with the document model, handles zoom, and provides the AI Assistant button.

**What each part does:**

* **`useDocumentModel()`** – Gets document pages, active page, and page-content update functions.
* **`useEditor()`** – Provides editor settings such as zoom, edit mode, editor reference, and AI panel state.
* **`model.pages.map()`** – Dynamically renders every document page using `DocumentPage`.
* **`DocumentPage`** – Represents an individual editable document page.
* **`contentEditable`** – Allows the user to edit the document directly when `isEditable` is enabled.
* **`onInput`** – Captures edited HTML and updates the document model.
* **`useEffect`** – Keeps the page's displayed HTML synchronized with the stored document content.
* **`activePage`** – Tracks which page is currently selected/focused.
* **`editorRef`** – Keeps a reference to the currently active editable area for editor operations.
* **`zoom`** – Scales the document page according to the selected zoom percentage.
* **Header/Footer** – Displays document metadata, confidentiality text, application name, and page number.
* **AI Floating Button** – Opens the AI Assistant when the AI panel is closed.

**In short:**
`Workspace.tsx` is the **central document canvas** where users view and edit pages. It connects the **document model + editor state + editable pages + zoom + AI Assistant** into one workspace.
*/
import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useEditor } from "../../context/EditorContext";
import { useDocumentModel } from "../../store/documentModel";
import { TableControlsOverlay } from "../../modules/tables/components";

export default function Workspace() {
  const {
    model,
    activePage,
    setActivePage,
    setPageHtml,
  } = useDocumentModel();

  const {
    zoom,
    isEditable,
    editorRef,
    aiPanelOpen,
    setAiPanelOpen,
  } = useEditor();

  return (
    <main
      className="
        relative
        flex
        h-full
        w-full
        min-w-0
        min-h-0
        flex-1
        overflow-x-hidden
        overflow-y-auto
        bg-[#EEF4FA]
        dark:bg-[#050B11]
      "
    >
      {/* DOCUMENT AREA */}
      <div
        className="
          flex
          w-full
          min-w-0
          flex-col
          items-center
          gap-8
          px-8
          py-8
          pb-16
        "
      >
        {model.pages.map((page, index) => {
          const section =
            model.sections.find((s) => s.id === page.sectionId) ??
            model.sections[0];
          const isEffectiveActive = activePage
            ? activePage === page.id
            : index === 0;

          return (
            <DocumentPage
              key={page.id}
              pageId={page.id}
              pageNumber={index + 1}
              headerText={section?.header || ""}
              footerText={section?.footer || "Parexel Smart Authoring Suite"}
              html={model.pageHtml[page.id] ?? ""}
              active={isEffectiveActive}
              editable={isEditable}
              editorRef={editorRef}
              onActivate={() => setActivePage(page.id)}
              onChange={(html) => setPageHtml(page.id, html)}
              zoom={zoom}
            />
          );
        })}
      </div>

      {/* AI FLOATING BUTTON
          Only show when AI panel is closed
      */}
      {!aiPanelOpen && (
        <button
          type="button"
          onClick={() => setAiPanelOpen(true)}
          title="Open AI Assistant"
          aria-label="Open AI Assistant"
          className="
            fixed
            right-6
            top-[88%]
            z-50
            flex
            h-14
            w-14
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            bg-gradient-to-br
            from-blue-500
            to-indigo-500
            text-white
            shadow-lg
            transition-all
            hover:scale-105
            hover:shadow-xl
          "
        >
          <Sparkles className="h-6 w-6" />

          <span
            className="
              absolute
              right-0
              top-0
              h-3.5
              w-3.5
              rounded-full
              border-2
              border-background
              bg-green-500
            "
          />
        </button>
      )}
    </main>
  );
}

interface DocumentPageProps {
  pageId: string;
  pageNumber: number;
  headerText: string;
  footerText: string;
  html: string;
  active: boolean;
  editable: boolean;
  editorRef: React.RefObject<HTMLDivElement | null>;
  onActivate: () => void;
  onChange: (html: string) => void;
  zoom: number;
}

function DocumentPage({
  pageId,
  pageNumber,
  headerText,
  footerText,
  html,
  active,
  editable,
  editorRef,
  onActivate,
  onChange,
  zoom,
}: DocumentPageProps) {
  const localEditorRef = useRef<HTMLDivElement | null>(null);
  const lastHtmlRef = useRef<string>(html);

  const [activeTable, setActiveTable] = useState<HTMLTableElement | null>(null);

  // Track active table inside this page's editor container
  useEffect(() => {
    const handleSelectionOrFocus = () => {
      const container = localEditorRef.current;
      if (!container) return;

      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const anchor = sel.anchorNode;
        const el = anchor?.nodeType === Node.ELEMENT_NODE ? (anchor as HTMLElement) : anchor?.parentElement;
        if (el && container.contains(el)) {
          const table = el.closest("table") as HTMLTableElement | null;
          setActiveTable(table);
          return;
        }
      }

      if (document.activeElement && container.contains(document.activeElement)) {
        const table = document.activeElement.closest("table") as HTMLTableElement | null;
        setActiveTable(table);
        return;
      }

      setActiveTable(null);
    };

    document.addEventListener("selectionchange", handleSelectionOrFocus);
    document.addEventListener("pointerdown", handleSelectionOrFocus);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionOrFocus);
      document.removeEventListener("pointerdown", handleSelectionOrFocus);
    };
  }, []);

  /*
   * Keep the page HTML synchronized
   * with the document model only when external updates occur.
   */
  useEffect(() => {
    const element = localEditorRef.current;
    if (!element) return;

    // If active element is inside this editor, avoid destroying the user's cursor
    if (element === document.activeElement || element.contains(document.activeElement)) {
      if (lastHtmlRef.current === html) {
        return;
      }
    }

    if (element.innerHTML !== html) {
      element.innerHTML = html;
      lastHtmlRef.current = html;
    }
  }, [html]);

  // Auto-focus the editor when page is activated
  useEffect(() => {
    if (active && editable && localEditorRef.current) {
      const el = localEditorRef.current;
      if (document.activeElement !== el && !el.contains(document.activeElement)) {
        el.focus();
      }
    }
  }, [active, pageId, editable]);

  const handleInput = () => {
    const element = localEditorRef.current;
    if (!element) return;
    const currentHtml = element.innerHTML;
    lastHtmlRef.current = currentHtml;
    onChange(currentHtml);
  };

  const handleFocus = () => {
    onActivate();

    if (!editorRef.current) {
      (
        editorRef as React.MutableRefObject<HTMLDivElement | null>
      ).current = localEditorRef.current;
    }
  };

  return (
    <section
      data-page-id={pageId}
      onMouseDown={onActivate}
      className={`
        relative
        w-[816px]
        min-w-[816px]
        min-h-[1056px]
        shrink-0
        bg-white
        shadow-[0_4px_20px_rgba(0,0,0,0.12)]
        ${
          active
            ? "border border-blue-300"
            : "border border-slate-200"
        }
      `}
      style={{
        transform: `scale(${zoom / 100})`,
        transformOrigin: "top center",
        marginBottom: `${(1056 * zoom) / 100 - 1056}px`,
      }}
    >
      {/* PAGE NUMBER */}
      <div
        className="
          absolute
          -left-12
          top-2
          select-none
          text-[10px]
          text-slate-400
        "
      >
        {pageNumber}
      </div>

      {/* DOCUMENT HEADER */}
      <div
        className="
          min-h-[45px]
          border-b
          border-slate-100
          px-[72px]
          pt-6
          text-[10px]
          text-slate-500
        "
      >
        {headerText}
      </div>

      {/* EDITABLE DOCUMENT */}
      <div
        ref={(element) => {
          localEditorRef.current = element;

          if (active && element) {
            (
              editorRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = element;
          }
        }}
        contentEditable={editable}
        suppressContentEditableWarning
        onFocus={handleFocus}
        onInput={handleInput}
        className="
          min-h-[900px]
          px-[72px]
          py-8
          outline-none
          text-[14px]
          leading-7
          text-slate-800

          [&_p]:my-2

          [&_h1]:mb-4
          [&_h1]:mt-6
          [&_h1]:text-2xl
          [&_h1]:font-bold

          [&_h2]:mb-3
          [&_h2]:mt-5
          [&_h2]:text-xl
          [&_h2]:font-semibold

          [&_h3]:mb-2
          [&_h3]:mt-4
          [&_h3]:text-lg
          [&_h3]:font-semibold

          [&_ul]:my-3
          [&_ul]:list-disc
          [&_ul]:pl-6

          [&_ol]:my-3
          [&_ol]:list-decimal
          [&_ol]:pl-6

          [&_table]:my-4
          [&_table]:w-full
          [&_table]:max-w-full
          [&_table]:border-collapse
          [&_table]:table-fixed

          [&_td]:border
          [&_td]:border-slate-300
          [&_td]:p-2.5
          [&_td]:text-left
          [&_td]:align-top
          [&_td]:min-w-[48px]
          [&_td]:break-words
          [&_td]:whitespace-normal

          [&_th]:border
          [&_th]:border-slate-300
          [&_th]:p-2.5
          [&_th]:text-left
          [&_th]:align-top
          [&_th]:font-semibold
          [&_th]:min-w-[48px]
          [&_th]:break-words
          [&_th]:whitespace-normal
        "
      />

      {/* WORD-STYLE TABLE MOVE & RESIZE OVERLAY (Editor UI only, not in saved document) */}
      {editable && activeTable && localEditorRef.current && (
        <TableControlsOverlay
          table={activeTable}
          container={localEditorRef.current}
          zoom={zoom}
          onUpdate={() => {
            if (localEditorRef.current) {
              const updatedHtml = localEditorRef.current.innerHTML;
              lastHtmlRef.current = updatedHtml;
              onChange(updatedHtml);
            }
          }}
        />
      )}

      {/* DOCUMENT FOOTER */}
      <div
        className="
          min-h-[45px]
          border-t
          border-slate-100
          px-[72px]
          py-3
          text-[10px]
          text-slate-400
        "
      >
        {footerText}

        <span className="float-right">
          Page {pageNumber}
        </span>
      </div>
    </section>
  );
}