import { useEditor } from "../../../context/EditorContext";
import { useDocumentModel } from "../../../store/documentModel";
import { appendicesApi } from "../service/appendicesApi";

export default function AppendicesPanel() {
  const { insertHTML } = useEditor();
  const { setPageHtml, activePage, model } = useDocumentModel();

  const handleInsert = (type: "toc" | "tot" | "tof" | "all") => {
    let html = "";
    switch (type) {
      case "toc":
        html = appendicesApi.insertTOC();
        break;
      case "tot":
        html = appendicesApi.insertTOT();
        break;
      case "tof":
        html = appendicesApi.insertTOF();
        break;
      case "all":
        html = appendicesApi.insertAll();
        break;
    }

    if (!html) return;

    // Find any existing appendix block of this type across ALL pages in the document
    const selector =
      type === "all"
        ? '[data-appendix-type="all"], .appendices-block'
        : `[data-appendix-type="${type}"], .${type}, .${type}-section, .${type}-empty-block, [data-appendix="${type}"]`;

    let existingElements = Array.from(document.querySelectorAll<HTMLElement>(selector));

    // Also look for fallback empty text paragraphs (e.g. from earlier clicks)
    const fallbackTextMap: Record<string, string> = {
      toc: "No table of contents entries found.",
      tot: "No table entries found.",
      tof: "No table of figures entries found.",
    };

    if (fallbackTextMap[type]) {
      const allParagraphs = Array.from(
        document.querySelectorAll<HTMLElement>('[contenteditable="true"] p')
      );
      for (const p of allParagraphs) {
        if (p.textContent?.trim() === fallbackTextMap[type] && !existingElements.includes(p)) {
          existingElements.push(p);
        }
      }
    }

    // If type === "all" and no all-block exists yet, check if individual TOC/TOT/TOF exist to replace them
    if (type === "all" && existingElements.length === 0) {
      const anyAppendix = Array.from(
        document.querySelectorAll<HTMLElement>('[data-appendix="true"], .toc, .tot, .tof')
      );
      if (anyAppendix.length > 0) {
        existingElements = anyAppendix;
      }
    }

    if (existingElements.length > 0) {
      // Replace the first matching instance in-place
      const first = existingElements[0];
      const pageEditable = first.closest<HTMLElement>('[contenteditable="true"]');
      first.outerHTML = html;

      // Remove any leftover duplicate empty/stale entries
      for (let i = 1; i < existingElements.length; i++) {
        const dupParent = existingElements[i].closest<HTMLElement>('[contenteditable="true"]');
        existingElements[i].remove();
        if (dupParent) {
          const dupPageId = dupParent.getAttribute("data-page-id");
          if (dupPageId && setPageHtml) {
            setPageHtml(dupPageId, dupParent.innerHTML);
          }
          dupParent.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }

      if (pageEditable) {
        const pageId = pageEditable.getAttribute("data-page-id") || activePage || model.pages[0]?.id;
        if (pageId && setPageHtml) {
          setPageHtml(pageId, pageEditable.innerHTML);
        }
        pageEditable.dispatchEvent(new Event("input", { bubbles: true }));
      }
    } else {
      const targetHtml = `${html}<p><br/></p>`;
      const targetPageId = activePage || model.pages[0]?.id;
      const pageSection = targetPageId
        ? document.querySelector(`section[data-page-id="${targetPageId}"]`)
        : null;
      const editable =
        (pageSection?.querySelector('[contenteditable="true"]') as HTMLElement | null) ||
        (document.querySelector('[contenteditable="true"]') as HTMLElement | null);

      if (editable) {
        editable.focus();
        const sel = window.getSelection();
        let inserted = false;
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          if (editable.contains(range.commonAncestorContainer)) {
            document.execCommand("insertHTML", false, targetHtml);
            inserted = true;
          }
        }
        if (!inserted) {
          editable.insertAdjacentHTML("beforeend", targetHtml);
        }
        editable.dispatchEvent(new Event("input", { bubbles: true }));
        const actualPageId = editable.getAttribute("data-page-id") || targetPageId;
        if (actualPageId && setPageHtml) {
          setPageHtml(actualPageId, editable.innerHTML);
        }
      } else if (insertHTML) {
        insertHTML(targetHtml);
      }
    }
  };

  return (
    <div className="p-4 space-y-3 select-none">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
          INSERT APPENDICES
        </span>
        <span className="text-xs text-muted-foreground dark:text-muted-foreground">
          Appendices
        </span>
      </div>

      <div className="rounded-xl border border-secondary bg-card p-3.5 shadow-sm dark:border-muted dark:bg-[#0E1A29]">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleInsert("toc")}
            className="rounded-lg border border-secondary bg-muted/70 hover:bg-muted hover:border-border py-2.5 px-3 text-xs font-semibold text-secondary-foreground active:bg-secondary dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground dark:hover:bg-secondary-foreground transition-colors text-center"
          >
            Insert TOC
          </button>
          <button
            type="button"
            onClick={() => handleInsert("tot")}
            className="rounded-lg border border-secondary bg-muted/70 hover:bg-muted hover:border-border py-2.5 px-3 text-xs font-semibold text-secondary-foreground active:bg-secondary dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground dark:hover:bg-secondary-foreground transition-colors text-center"
          >
            Insert TOT
          </button>
          <button
            type="button"
            onClick={() => handleInsert("tof")}
            className="rounded-lg border border-secondary bg-muted/70 hover:bg-muted hover:border-border py-2.5 px-3 text-xs font-semibold text-secondary-foreground active:bg-secondary dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground dark:hover:bg-secondary-foreground transition-colors text-center"
          >
            Insert TOF
          </button>
          <button
            type="button"
            onClick={() => handleInsert("all")}
            className="rounded-lg border border-secondary bg-muted/70 hover:bg-muted hover:border-border py-2.5 px-3 text-xs font-semibold text-secondary-foreground active:bg-secondary dark:border-secondary-foreground dark:bg-muted dark:text-muted-foreground dark:hover:bg-secondary-foreground transition-colors text-center"
          >
            Insert All
          </button>
        </div>
      </div>
    </div>
  );
}
