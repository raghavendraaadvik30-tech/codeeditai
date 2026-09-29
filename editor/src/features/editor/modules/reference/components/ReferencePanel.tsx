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
    <div className="flex h-full flex-col overflow-y-auto p-4 space-y-4 text-xs select-none dark:bg-[#07131E] dark:text-slate-100">
      {/* STATUS TOAST */}
      {insertedNotice && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium transition-all">
          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          {insertedNotice}
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search citations & bibliography..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 text-slate-800 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-[#111D29] dark:text-white dark:placeholder:text-slate-500 transition-colors"
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
          className="flex items-center justify-center gap-1.5 h-9 rounded-lg bg-[#0078d4] hover:bg-[#006bbd] text-white font-medium text-xs transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Source
        </button>
        <button
          type="button"
          onClick={() => refs.setIsOpenSourceManager(true)}
          className="flex items-center justify-center h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs dark:border-slate-700 dark:bg-[#111D29] dark:text-slate-200 dark:hover:bg-slate-800 transition"
        >
          Manage Sources
        </button>
      </div>

      {/* REGISTERED SOURCES LIST */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            REGISTERED SOURCES
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {filteredSources.length}
          </span>
        </div>

        {/* Source Cards */}
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-0.5 scrollbar-thin">
          {refs.sources.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-slate-400 dark:border-slate-800">
              <p className="font-semibold text-xs text-slate-600 dark:text-slate-300">No sources registered</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Click "+ Add Source" above to add your first citation source.
              </p>
            </div>
          ) : filteredSources.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-slate-400 dark:border-slate-800">
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
                  className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-3.5 hover:border-blue-400 hover:shadow-sm dark:border-slate-800 dark:bg-[#0E1A29] dark:hover:border-blue-500 transition-all"
                  title="Click to insert citation at cursor"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {author || "Unknown Author"}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {source.title || "(Untitled)"}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                        {source.year ? `${source.year} · ` : ""}click to cite
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-400">
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
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          QUICK INSERT BIBLIOGRAPHY
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleInsertBib("Bibliography")}
            className="flex items-center justify-center h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-[#111D29] dark:text-slate-200 dark:hover:bg-slate-800 transition"
          >
            Bibliography
          </button>
          <button
            type="button"
            onClick={() => handleInsertBib("References")}
            className="flex items-center justify-center h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-[#111D29] dark:text-slate-200 dark:hover:bg-slate-800 transition"
          >
            References
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReferencePanel;
