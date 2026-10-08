/**
 * HeaderFooterGallery.tsx
 *
 * Microsoft Word-style Header and Footer dropdown galleries
 * featuring built-in template previews, edit triggers, and remove actions.
 */

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { ChevronDown, Edit3, Trash2 } from "lucide-react";
import {
  BUILT_IN_HEADERS,
  BUILT_IN_FOOTERS,
  type HFTemplate,
} from "../constants/headerFooterTemplates";
import { useDocumentModel } from "@/features/editor/store/documentModel";
import { useHeaderFooter } from "../context/HeaderFooterContext";

interface HeaderGalleryProps {
  buttonClassName?: string;
  showIcon?: boolean;
  customTrigger?: React.ReactElement;
}

export function HeaderGallery({
  buttonClassName = "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted dark:hover:bg-muted text-secondary-foreground dark:text-muted-foreground cursor-pointer",
  showIcon = true,
  customTrigger,
}: HeaderGalleryProps) {
  const { model, activePage, updateSection } = useDocumentModel();
  const { enterHeaderFooterMode, isHeaderFooterActive } = useHeaderFooter();

  const currentPage = model.pages.find((p) => p.id === activePage) || model.pages[0];
  const activeSection =
    model.sections.find((s) => s.id === currentPage?.sectionId) || model.sections[0];

  const handleSelectTemplate = (tmpl: HFTemplate) => {
    if (!activeSection) return;

    // Apply template content to active section
    updateSection(activeSection.id, {
      header: tmpl.plainText,
      headerHtml: tmpl.contentHtml,
    });

    // Enter Header & Footer editing mode
    enterHeaderFooterMode("header", activeSection.id, currentPage?.id);
  };

  const handleEditHeader = () => {
    if (activeSection) {
      enterHeaderFooterMode("header", activeSection.id, currentPage?.id);
    }
  };

  const handleRemoveHeader = () => {
    if (activeSection) {
      updateSection(activeSection.id, {
        header: "",
        headerHtml: "",
        firstHeader: "",
        firstHeaderHtml: "",
        evenHeader: "",
        evenHeaderHtml: "",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          customTrigger ?? (
            <button
              type="button"
              className={`${buttonClassName} ${
                isHeaderFooterActive ? "bg-primary/10 text-brand font-semibold dark:bg-navy-950/50" : ""
              }`}
              title="Built-in Header Gallery"
            >
              {showIcon && (
                <svg
                  className="h-3.5 w-3.5 text-secondary-foreground dark:text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 8V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M4 16h16" />
                </svg>
              )}
              <span>Header</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          )
        }
      />

      <DropdownMenuContent align="start" className="w-80 p-2 text-xs shadow-xl border border-secondary dark:border-muted bg-card dark:bg-foreground">
        <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground pb-1">
          Built-In Headers
        </DropdownMenuLabel>

        {/* Scrollable Gallery Preview List */}
        <div className="max-h-85 overflow-y-auto space-y-2 pr-1 my-1">
          {BUILT_IN_HEADERS.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => handleSelectTemplate(tmpl)}
              className="w-full text-left rounded-md border border-secondary p-2 transition-all hover:border-brand hover:bg-primary/40 dark:border-secondary-foreground dark:hover:border-primary dark:hover:bg-muted/60 group cursor-pointer"
            >
              <div className="text-[11px] font-medium text-secondary-foreground dark:text-muted-foreground mb-1 group-hover:text-brand dark:group-hover:text-primary">
                {tmpl.name}
              </div>
              <div
                className="w-full rounded bg-card p-1.5 shadow-xs border border-muted dark:bg-secondary dark:border-muted"
                dangerouslySetInnerHTML={{ __html: tmpl.previewHtml }}
              />
            </button>
          ))}
        </div>

        <DropdownMenuSeparator />

        {/* Bottom Actions */}
        <div className="pt-1 space-y-0.5">
          <DropdownMenuItem
            onClick={handleEditHeader}
            className="flex items-center gap-2 cursor-pointer font-medium text-secondary-foreground dark:text-muted-foreground hover:text-brand"
          >
            <Edit3 className="h-3.5 w-3.5 text-primary" />
            <span>Edit Header</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleRemoveHeader}
            className="flex items-center gap-2 cursor-pointer font-medium text-destructive dark:text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Remove Header</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface FooterGalleryProps {
  buttonClassName?: string;
  showIcon?: boolean;
  customTrigger?: React.ReactElement;
}

export function FooterGallery({
  buttonClassName = "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted dark:hover:bg-muted text-secondary-foreground dark:text-muted-foreground cursor-pointer",
  showIcon = true,
  customTrigger,
}: FooterGalleryProps) {
  const { model, activePage, updateSection } = useDocumentModel();
  const { enterHeaderFooterMode, isHeaderFooterActive } = useHeaderFooter();

  const currentPage = model.pages.find((p) => p.id === activePage) || model.pages[0];
  const activeSection =
    model.sections.find((s) => s.id === currentPage?.sectionId) || model.sections[0];

  const handleSelectTemplate = (tmpl: HFTemplate) => {
    if (!activeSection) return;

    // Apply template content to active section
    updateSection(activeSection.id, {
      footer: tmpl.plainText,
      footerHtml: tmpl.contentHtml,
    });

    // Enter Header & Footer editing mode
    enterHeaderFooterMode("footer", activeSection.id, currentPage?.id);
  };

  const handleEditFooter = () => {
    if (activeSection) {
      enterHeaderFooterMode("footer", activeSection.id, currentPage?.id);
    }
  };

  const handleRemoveFooter = () => {
    if (activeSection) {
      updateSection(activeSection.id, {
        footer: "",
        footerHtml: "",
        firstFooter: "",
        firstFooterHtml: "",
        evenFooter: "",
        evenFooterHtml: "",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          customTrigger ?? (
            <button
              type="button"
              className={`${buttonClassName} ${
                isHeaderFooterActive ? "bg-primary/10 text-brand font-semibold dark:bg-navy-950/50" : ""
              }`}
              title="Built-in Footer Gallery"
            >
              {showIcon && (
                <svg
                  className="h-3.5 w-3.5 text-secondary-foreground dark:text-muted-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 16v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4M4 8h16" />
                </svg>
              )}
              <span>Footer</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          )
        }
      />

      <DropdownMenuContent align="start" className="w-80 p-2 text-xs shadow-xl border border-secondary dark:border-muted bg-card dark:bg-foreground">
        <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground pb-1">
          Built-In Footers
        </DropdownMenuLabel>

        {/* Scrollable Gallery Preview List */}
        <div className="max-h-85 overflow-y-auto space-y-2 pr-1 my-1">
          {BUILT_IN_FOOTERS.map((tmpl) => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => handleSelectTemplate(tmpl)}
              className="w-full text-left rounded-md border border-secondary p-2 transition-all hover:border-brand hover:bg-primary/40 dark:border-secondary-foreground dark:hover:border-primary dark:hover:bg-muted/60 group cursor-pointer"
            >
              <div className="text-[11px] font-medium text-secondary-foreground dark:text-muted-foreground mb-1 group-hover:text-brand dark:group-hover:text-primary">
                {tmpl.name}
              </div>
              <div
                className="w-full rounded bg-card p-1.5 shadow-xs border border-muted dark:bg-secondary dark:border-muted"
                dangerouslySetInnerHTML={{ __html: tmpl.previewHtml }}
              />
            </button>
          ))}
        </div>

        <DropdownMenuSeparator />

        {/* Bottom Actions */}
        <div className="pt-1 space-y-0.5">
          <DropdownMenuItem
            onClick={handleEditFooter}
            className="flex items-center gap-2 cursor-pointer font-medium text-secondary-foreground dark:text-muted-foreground hover:text-brand"
          >
            <Edit3 className="h-3.5 w-3.5 text-primary" />
            <span>Edit Footer</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleRemoveFooter}
            className="flex items-center gap-2 cursor-pointer font-medium text-destructive dark:text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Remove Footer</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
