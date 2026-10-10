import { useState } from "react";
import {
  Plus,
  Search,
  Check,
} from "lucide-react";
import { useReferences } from "./ReferencesContext";

export function ReferencePanel() {
  const refs = useReferences();
  const [searchTerm, setSearchTerm] = useState("");
  const [insertedNotice, setInsertedNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setInsertedNotice(msg);
    setTimeout(() => setInsertedNotice(null), 2000);
  };

  const handleInsertCitation = (id: string, label: string) => {
    refs.insertCitation(id);
    showNotice(`Cited: ${label}`);
  };

  const handleInsertBib = (type: "Bibliography" | "References" | "Works Cited") => {
    refs.insertBibliography(type);
    showNotice(`Inserted ${type}`);
  };

  const filteredSources = refs.sources.filter((s) => {
    const term = searchTerm.toLowerCase();
    const author = s.isCorporateAuthor ? s.corporateAuthor : s.author;
    return (
      (author || "").toLowerCase().includes(term) ||
      (s.title || "").toLowerCase().includes(term) ||
      (s.tag || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 space-y-4 text-xs select-none dark:bg-[#07131E] dark:text-muted">
      {/* STATUS TOAST */}
      {insertedNotice && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success-50 text-success-700 dark:bg-success-950/50 dark:text-success-300 border border-success-200 dark:border-success-800 text-11px font-medium transition-all">
          <Check className="h-3.5 w-3.5 text-success-600 dark:text-success-400" />
          {insertedNotice}
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search citations & bibliography..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-secondary bg-card placeholder:text-muted-foreground text-foreground outline-none focus:border-primary dark:border-secondary-foreground dark:bg-[#111D29] dark:text-primary-foreground dark:placeholder:text-muted-foreground transition-colors"
        />
      </div>

      {/* ACTION BUTTONS ROW */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            refs.setEditingSource(null);
            refs.setIsOpenCreateSource(true);
          }}
          className="flex items-center justify-center gap-1.5 h-9 rounded-lg bg-button-primary hover:bg-button-primary-hover active:bg-button-primary-active text-button-primary-foreground font-medium text-xs transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Source
        </button>
        <button
          type="button"
          onClick={() => refs.setIsOpenSourceManager(true)}
          className="flex items-center justify-center h-9 rounded-lg border border-secondary bg-card hover:bg-muted text-secondary-foreground font-medium text-xs dark:border-secondary-foreground dark:bg-[#111D29] dark:text-muted-foreground dark:hover:bg-muted transition"
        >
          Manage Sources
        </button>
      </div>

      {/* REGISTERED SOURCES LIST */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-10px font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
            REGISTERED SOURCES
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            {filteredSources.length}
          </span>
        </div>

        {/* Source Cards */}
        <div className="space-y-2.5 max-h-105 overflow-y-auto pr-0.5 scrollbar-thin">
          {refs.sources.length === 0 ? (
            <div className="rounded-xl border border-dashed border-secondary p-6 text-center text-muted-foreground dark:border-muted">
              <p className="font-semibold text-xs text-secondary-foreground dark:text-muted-foreground">No sources registered</p>
              <p className="text-11px text-muted-foreground dark:text-muted-foreground mt-1">
                Click "+ Add Source" above to add your first citation source.
              </p>
            </div>
          ) : filteredSources.length === 0 ? (
            <div className="rounded-xl border border-dashed border-secondary p-4 text-center text-muted-foreground dark:border-muted">
              No matching sources found for &ldquo;{searchTerm}&rdquo;.
            </div>
          ) : (
            filteredSources.map((source) => {
              const author = source.isCorporateAuthor ? source.corporateAuthor : source.author;
              const displayLabel = author || source.tag;

              return (
                <div
                  key={source.id}
                  onClick={() => handleInsertCitation(source.id, displayLabel)}
                  className="group cursor-pointer rounded-xl border border-secondary bg-card p-3.5 hover:border-primary hover:shadow-sm dark:border-muted dark:bg-[#0E1A29] dark:hover:border-primary transition-all"
                  title="Click to insert citation at cursor"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground dark:text-primary-foreground text-xs truncate">
                        {author || "Unknown Author"}
                      </p>
                      <p className="text-11px text-muted-foreground dark:text-muted-foreground truncate mt-0.5">
                        {source.title || "(Untitled)"}
                      </p>
                      <p className="text-11px text-muted-foreground dark:text-muted-foreground mt-1">
                        {source.year ? `${source.year} · ` : ""}click to cite
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1 rounded-full border border-success-200/80 bg-success-50 px-2 py-0.5 text-10px font-medium text-success-600 dark:border-success-900/60 dark:bg-success-950/60 dark:text-success-400">
                      <Check className="h-3 w-3 stroke-[2.5]" />
                      Valid
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* QUICK INSERT BIBLIOGRAPHY */}
      <div className="space-y-2 pt-2 border-t border-muted dark:border-muted/80">
        <span className="text-10px font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
          QUICK INSERT BIBLIOGRAPHY
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleInsertBib("Bibliography")}
            className="flex items-center justify-center h-9 rounded-lg border border-secondary bg-card hover:bg-muted hover:border-border text-xs font-semibold text-secondary-foreground dark:border-secondary-foreground dark:bg-[#111D29] dark:text-muted-foreground dark:hover:bg-muted transition"
          >
            Bibliography
          </button>
          <button
            type="button"
            onClick={() => handleInsertBib("References")}
            className="flex items-center justify-center h-9 rounded-lg border border-secondary bg-card hover:bg-muted hover:border-border text-xs font-semibold text-secondary-foreground dark:border-secondary-foreground dark:bg-[#111D29] dark:text-muted-foreground dark:hover:bg-muted transition"
          >
            References
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReferencePanel;
