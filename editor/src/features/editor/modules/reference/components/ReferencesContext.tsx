import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useEditor } from "../../../context/EditorContext";

export interface Source {
  id: string;
  type: string;
  language: string;
  author: string;
  isCorporateAuthor: boolean;
  corporateAuthor: string;
  title: string;
  year: string;
  city: string;
  publisher: string;
  volume?: string;
  pages?: string;
  edition?: string;
  tag: string;
  isPlaceholder?: boolean;
}

export type CitationStyle =
  | "APA Sixth Edition"
  | "Chicago Fifteenth Edition"
  | "GB7714 2005"
  | "GOST - Name Sort 2003"
  | "GOST - Title Sort 2003"
  | "Harvard - Anglia 2008"
  | "IEEE 2006"
  | "ISO 690 - First Element and Date 1987"
  | "ISO 690 - Numerical Reference 1987"
  | "MLA Seventh Edition"
  | "SIST02 2003"
  | "Turabian Sixth Edition";

interface ReferencesAPI {
  sources: Source[];
  style: CitationStyle;
  setStyle: (style: CitationStyle) => void;
  addSource: (source: Omit<Source, "id">) => void;
  updateSource: (id: string, patch: Partial<Source>) => void;
  deleteSource: (id: string) => void;
  addPlaceholder: (tag: string) => void;
  
  // Dialog controls
  isOpenCreateSource: boolean;
  setIsOpenCreateSource: (open: boolean) => void;
  isOpenPlaceholder: boolean;
  setIsOpenPlaceholder: (open: boolean) => void;
  isOpenSourceManager: boolean;
  setIsOpenSourceManager: (open: boolean) => void;
  editingSource: Source | null;
  setEditingSource: (source: Source | null) => void;

  // Insert actions
  insertCitation: (sourceId: string) => void;
  insertBibliography: (type: "Bibliography" | "References" | "Works Cited" | "none") => void;
  updateDocumentCitationsAndBibliography: () => void;
}

const Ctx = createContext<ReferencesAPI | null>(null);

const STORAGE_KEY_SOURCES = "parexel.references.sources.v2";
const STORAGE_KEY_STYLE = "parexel.references.style.v1";

export function ReferencesProvider({ children }: { children: React.ReactNode }) {
  const { editorRef, insertHTML } = useEditor();
  const log = (_entry: { action: string; label: string }) => {
    void _entry;
    // Audit logger placeholder
  };
  
  const [sources, setSources] = useState<Source[]>([]);
  const [style, setStyleState] = useState<CitationStyle>("APA Sixth Edition");
  
  // Dialog state
  const [isOpenCreateSource, setIsOpenCreateSource] = useState(false);
  const [isOpenPlaceholder, setIsOpenPlaceholder] = useState(false);
  const [isOpenSourceManager, setIsOpenSourceManager] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);

  // Restore state - only load what user explicitly added
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // Clear old hardcoded seed cache
      localStorage.removeItem("parexel.references.sources.v1");

      const rawSources = localStorage.getItem(STORAGE_KEY_SOURCES);
      if (rawSources) {
        const parsed = JSON.parse(rawSources);
        setSources(Array.isArray(parsed) ? parsed : []);
      } else {
        setSources([]);
      }
      
      const rawStyle = localStorage.getItem(STORAGE_KEY_STYLE);
      if (rawStyle) {
        setStyleState(rawStyle as CitationStyle);
      }
    } catch (e) {
      console.error("Failed to restore references", e);
    }
  }, []);

  const saveSources = (updated: Source[]) => {
    setSources(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_SOURCES, JSON.stringify(updated));
    }
  };

  const setStyle = (newStyle: CitationStyle) => {
    setStyleState(newStyle);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_STYLE, newStyle);
    }
    log({ action: "reference", label: `Changed citation style to ${newStyle}` });
  };

  // Helper to determine citation index for numerical styles
  const getSourceIndexMap = useCallback((currentSources: Source[]) => {
    const nonPlaceholders = currentSources.filter(s => !s.isPlaceholder);
    const sorted = [...nonPlaceholders].sort((a, b) => {
      const aAuth = a.isCorporateAuthor ? a.corporateAuthor : a.author;
      const bAuth = b.isCorporateAuthor ? b.corporateAuthor : b.author;
      return (aAuth || "").localeCompare(bAuth || "");
    });
    
    const map: Record<string, number> = {};
    sorted.forEach((s, idx) => {
      map[s.id] = idx + 1;
    });
    return map;
  }, []);

  // Format an individual inline citation text
  const formatCitationText = useCallback((source: Source, indexMap: Record<string, number>, currentStyle: CitationStyle) => {
    if (source.isPlaceholder) {
      if (
        currentStyle === "IEEE 2006" ||
        currentStyle === "GB7714 2005" ||
        currentStyle === "ISO 690 - Numerical Reference 1987"
      ) {
        return `[${source.tag}]`;
      }
      return `(${source.tag})`;
    }

    const author = source.isCorporateAuthor ? source.corporateAuthor : source.author;
    const year = source.year;
    
    // Get short author name (e.g. "Chen" or "Contoso Corp")
    let shortAuthor = "Unknown";
    if (author) {
      if (source.isCorporateAuthor) {
        shortAuthor = author;
      } else {
        const parts = author.split(",");
        if (parts.length > 0) {
          shortAuthor = parts[0].trim();
        } else {
          shortAuthor = author.trim().split(" ").pop() || "Unknown";
        }
      }
    }

    switch (currentStyle) {
      case "IEEE 2006":
      case "GB7714 2005":
      case "ISO 690 - Numerical Reference 1987": {
        const idx = indexMap[source.id] || 1;
        return `[${idx}]`;
      }
      case "MLA Seventh Edition":
        return `(${shortAuthor})`;
      case "Chicago Fifteenth Edition":
      case "Turabian Sixth Edition":
        return `(${shortAuthor} ${year})`;
      default: // APA Sixth Edition / GOST / Harvard / etc.
        return `(${shortAuthor}, ${year})`;
    }
  }, []);

  // Format the complete bibliography html content
  const formatBibliographyHtml = useCallback((currentSources: Source[], currentStyle: CitationStyle) => {
    const nonPlaceholders = currentSources.filter(s => !s.isPlaceholder);
    const sorted = [...nonPlaceholders].sort((a, b) => {
      const aAuth = a.isCorporateAuthor ? a.corporateAuthor : a.author;
      const bAuth = b.isCorporateAuthor ? b.corporateAuthor : b.author;
      return (aAuth || "").localeCompare(bAuth || "");
    });

    if (sorted.length === 0) {
      return `<p style="font-style: italic; color: #888; font-size: 11pt;">No bibliography entries available.</p>`;
    }

    return sorted.map((s, idx) => {
      const author = s.isCorporateAuthor ? s.corporateAuthor : s.author;
      const authorStr = author ? `${author}.` : "";
      const yearStr = s.year ? `(${s.year}).` : "";
      const titleStr = s.title ? `<i>${s.title}</i>` : "";
      const cityStr = s.city ? `${s.city}:` : "";
      const pubStr = s.publisher ? `${s.publisher}.` : "";
      const index = idx + 1;

      // Extract and format edition, volume, pages
      const metaParts: string[] = [];
      if (s.edition) {
        const edText = /ed/i.test(s.edition) ? s.edition : `${s.edition} ed.`;
        metaParts.push(edText);
      }
      if (s.volume) {
        const volText = /vol/i.test(s.volume) ? s.volume : `Vol. ${s.volume}`;
        metaParts.push(volText);
      }
      if (s.pages) {
        const ppText = /p/i.test(s.pages) ? s.pages : `pp. ${s.pages}`;
        metaParts.push(ppText);
      }

      const metaStr = metaParts.length > 0 ? ` (${metaParts.join(", ")})` : "";
      const titleWithMeta = `${titleStr}${metaStr}.`;

      switch (currentStyle) {
        case "IEEE 2006":
          return `<div class="bibliography-item" style="margin-bottom: 8px; font-size: 11pt; line-height: 1.5; padding-left: 24px; text-indent: -24px;">[${index}] ${author ? `${author}, ` : ""}${titleStr}, ${s.edition ? `${s.edition} ed., ` : ""}${s.volume ? `vol. ${s.volume}, ` : ""}${cityStr} ${pubStr} ${s.year ? `${s.year}, ` : ""}${s.pages ? `pp. ${s.pages}.` : ""}</div>`;
        
        case "GB7714 2005":
        case "ISO 690 - Numerical Reference 1987":
          return `<div class="bibliography-item" style="margin-bottom: 8px; font-size: 11pt; line-height: 1.5; padding-left: 24px; text-indent: -24px;">[${index}] ${authorStr} ${titleWithMeta} ${cityStr} ${pubStr} ${s.year ? `${s.year}.` : ""}</div>`;
        
        case "MLA Seventh Edition":
          return `<div class="bibliography-item" style="margin-bottom: 8px; font-size: 11pt; line-height: 1.5; padding-left: 24px; text-indent: -24px;">${authorStr} ${titleStr}. ${s.edition ? `${s.edition} ed., ` : ""}${s.volume ? `vol. ${s.volume}, ` : ""}${cityStr} ${pubStr ? `${pubStr}, ` : ""}${s.year ? `${s.year}, ` : ""}${s.pages ? `pp. ${s.pages}.` : ""}</div>`;
        
        default: // APA Sixth Edition / Chicago / GOST / Harvard / etc.
          return `<div class="bibliography-item" style="margin-bottom: 8px; font-size: 11pt; line-height: 1.5; padding-left: 24px; text-indent: -24px;">${authorStr} ${yearStr} ${titleWithMeta} ${cityStr} ${pubStr}</div>`;
      }
    }).join("");
  }, []);

  // Update DOM citations & bibliographies to keep document fully synced
  const updateDocumentCitationsAndBibliography = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    // Get current mappings
    const indexMap = getSourceIndexMap(sources);

    // 1. Update all inline citation fields
    const citationSpans = editor.querySelectorAll("span.citation[data-source-id]");
    citationSpans.forEach((span: Element) => {
      const srcId = span.getAttribute("data-source-id");
      const matchedSource = sources.find(s => s.id === srcId);
      if (matchedSource) {
        span.innerHTML = formatCitationText(matchedSource, indexMap, style);
      }
    });

    // 2. Update all bibliography sections
    const bibSections = editor.querySelectorAll("div.bibliography-section");
    bibSections.forEach((sec: Element) => {
      const type = sec.getAttribute("data-bib-type") || "Bibliography";
      const headerHtml = type !== "none" ? `<h2 style="font-size:16pt;font-weight:700;margin:18px 0 10px;color:hsl(var(--primary))">${type}</h2>` : "";
      const bibHtml = formatBibliographyHtml(sources, style);
      sec.innerHTML = `${headerHtml}${bibHtml}`;
    });
  }, [editorRef, sources, style, getSourceIndexMap, formatCitationText, formatBibliographyHtml]);

  // Sync to document whenever sources or style changes
  useEffect(() => {
    // Small delay to ensure render batching
    const timer = setTimeout(() => {
      updateDocumentCitationsAndBibliography();
    }, 50);
    return () => clearTimeout(timer);
  }, [sources, style, updateDocumentCitationsAndBibliography]);

  const addSource = (sourceData: Omit<Source, "id">) => {
    const newSource: Source = {
      ...sourceData,
      id: "src-" + Math.random().toString(36).substring(2, 9)
    };
    const nextSources = [...sources, newSource];
    saveSources(nextSources);
    log({ action: "reference", label: `Added source: "${newSource.author || newSource.corporateAuthor} (${newSource.year})"` });
  };

  const updateSource = (id: string, patch: Partial<Source>) => {
    const nextSources = sources.map(s => (s.id === id ? { ...s, ...patch } : s));
    saveSources(nextSources);
    log({ action: "reference", label: `Updated source: "${patch.title || 'Source ID ' + id}"` });
  };

  const deleteSource = (id: string) => {
    const toDelete = sources.find(s => s.id === id);
    const nextSources = sources.filter(s => s.id !== id);
    saveSources(nextSources);
    if (toDelete) {
      log({ action: "reference", label: `Deleted source: "${toDelete.author || toDelete.corporateAuthor} (${toDelete.year})"` });
    }
  };

  const addPlaceholder = (tag: string) => {
    const newPlaceholder: Source = {
      id: "src-" + Math.random().toString(36).substring(2, 9),
      type: "Misc",
      language: "Default",
      author: "",
      isCorporateAuthor: false,
      corporateAuthor: "",
      title: "",
      year: "",
      city: "",
      publisher: "",
      tag,
      isPlaceholder: true
    };
    const nextSources = [...sources, newPlaceholder];
    saveSources(nextSources);
    log({ action: "reference", label: `Added placeholder citation: ${tag}` });
    
    // Insert inline citation instantly
    const indexMap = getSourceIndexMap(nextSources);
    const text = formatCitationText(newPlaceholder, indexMap, style);
    insertHTML(`<span class="citation" data-source-id="${newPlaceholder.id}" contenteditable="false" style="color:hsl(var(--primary)); font-weight: 500; cursor: pointer; user-select: all;" title="Citation: ${tag}">${text}</span>`);
  };

  const insertCitation = (sourceId: string) => {
    const matched = sources.find(s => s.id === sourceId);
    if (!matched) return;
    
    const indexMap = getSourceIndexMap(sources);
    const text = formatCitationText(matched, indexMap, style);
    
    const tagDisplay = matched.isPlaceholder ? matched.tag : (matched.author || matched.corporateAuthor || "Source");
    insertHTML(`<span class="citation" data-source-id="${matched.id}" contenteditable="false" style="color:hsl(var(--primary)); font-weight: 500; cursor: pointer; user-select: all;" title="Citation: ${tagDisplay}">${text}</span>`);
    log({ action: "reference", label: `Inserted citation inline: ${text}` });
  };

  const insertBibliography = (type: "Bibliography" | "References" | "Works Cited" | "none") => {
    const headerHtml = type !== "none" ? `<h2 style="font-size:16pt;font-weight:700;margin:18px 0 10px;color:hsl(var(--primary))">${type}</h2>` : "";
    const bibHtml = formatBibliographyHtml(sources, style);
    const wrapper = `<div class="bibliography-section" data-bib-type="${type}" contenteditable="false" style="margin-top: 24px; border-top: 1px solid var(--border); padding-top: 16px; user-select: all;">${headerHtml}${bibHtml}</div><p><br/></p>`;
    insertHTML(wrapper);
    log({ action: "reference", label: `Inserted bibliography section (${type})` });
  };

  return (
    <Ctx.Provider
      value={{
        sources,
        style,
        setStyle,
        addSource,
        updateSource,
        deleteSource,
        addPlaceholder,
        
        // Dialog controls
        isOpenCreateSource,
        setIsOpenCreateSource,
        isOpenPlaceholder,
        setIsOpenPlaceholder,
        isOpenSourceManager,
        setIsOpenSourceManager,
        editingSource,
        setEditingSource,
        
        // Actions
        insertCitation,
        insertBibliography,
        updateDocumentCitationsAndBibliography
      }}
    >
      {children}
      <DialogsContainer />
    </Ctx.Provider>
  );
}

export function useReferences() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useReferences must be used inside <ReferencesProvider>");
  return ctx;
}

// Inline Dialogs Container to maintain clean DOM overlay styling
function DialogsContainer() {
  const refs = useReferences();

  if (refs.isOpenCreateSource) {
    return <CreateSourceDialog onClose={() => { refs.setIsOpenCreateSource(false); refs.setEditingSource(null); }} />;
  }

  if (refs.isOpenPlaceholder) {
    return <PlaceholderDialog onClose={() => refs.setIsOpenPlaceholder(false)} />;
  }

  if (refs.isOpenSourceManager) {
    return <SourceManagerDialog onClose={() => refs.setIsOpenSourceManager(false)} />;
  }

  return null;
}

// ───── Modal UI Components ─────

interface ModalProps {
  onClose: () => void;
}

const MODAL_OVERLAY_CLASSES = "fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-200";
const MODAL_CONTENT_CLASSES = "bg-card dark:bg-[#0E1A29] border border-secondary dark:border-muted rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 text-foreground dark:text-muted flex flex-col";

function CreateSourceDialog({ onClose }: ModalProps) {
  const refs = useReferences();
  const editSource = refs.editingSource;

  const [type, setType] = useState(editSource?.type || "Book");
  const [lang, setLang] = useState(editSource?.language || "Default");
  const [author, setAuthor] = useState(editSource?.author || "");
  const [isCorp, setIsCorp] = useState(editSource?.isCorporateAuthor || false);
  const [corpAuthor, setCorpAuthor] = useState(editSource?.corporateAuthor || "");
  const [title, setTitle] = useState(editSource?.title || "");
  const [year, setYear] = useState(editSource?.year || "");
  const [city, setCity] = useState(editSource?.city || "");
  const [publisher, setPublisher] = useState(editSource?.publisher || "");
  const [volume, setVolume] = useState(editSource?.volume || "");
  const [pages, setPages] = useState(editSource?.pages || "");
  const [edition, setEdition] = useState(editSource?.edition || "");
  const [showAllFields, setShowAllFields] = useState(
    Boolean(editSource?.volume || editSource?.pages || editSource?.edition)
  );
  const [tag, setTag] = useState(editSource?.tag || "");

  // Keep tag updated based on input
  useEffect(() => {
    if (editSource) return;
    const primaryAuthor = isCorp ? corpAuthor : author;
    if (!primaryAuthor) {
      setTag("");
      return;
    }
    const cleanAuthor = primaryAuthor.split(",")[0].trim().replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
    const shortYear = year ? year.slice(-2) : "";
    setTag(`${cleanAuthor}${shortYear}`);
  }, [author, isCorp, corpAuthor, year, editSource]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const primaryAuthor = isCorp ? corpAuthor : author;
    const cleanAuthor = primaryAuthor ? primaryAuthor.split(",")[0].trim().replace(/[^a-zA-Z0-9]/g, "").slice(0, 8) : "Source";
    const shortYear = year ? year.slice(-2) : "";
    const generatedTag = `${cleanAuthor}${shortYear || "1"}`;

    const sourceData: Omit<Source, "id"> = {
      type,
      language: lang,
      author: isCorp ? "" : author,
      isCorporateAuthor: isCorp,
      corporateAuthor: isCorp ? corpAuthor : "",
      title,
      year: year.trim(),
      city: city.trim(),
      publisher: publisher.trim(),
      volume: volume.trim(),
      pages: pages.trim(),
      edition: edition.trim(),
      tag: tag.trim() || generatedTag,
    };

    if (editSource) {
      refs.updateSource(editSource.id, sourceData);
    } else {
      refs.addSource(sourceData);
    }
    onClose();
  };

  const SOURCE_TYPES = [
    "Book",
    "Book Section",
    "Journal Article",
    "Article in a Periodical",
    "Conference Proceedings",
    "Report",
    "Website",
    "Document from Website",
    "Electronic Source",
    "Art",
    "Sound Recording",
    "Performance",
    "Film",
    "Interview",
    "Patent",
    "Case",
    "Misc"
  ];

  return (
    <div className={MODAL_OVERLAY_CLASSES}>
      <div className={MODAL_CONTENT_CLASSES}>
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-muted dark:border-muted">
          <h3 className="text-sm font-bold text-foreground dark:text-primary-foreground">
            {editSource ? "Edit Source" : "Create Source"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-secondary-foreground dark:hover:text-muted-foreground text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* MODAL FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh] scrollbar-thin">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-secondary-foreground dark:text-muted-foreground">
                Type of Source
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-9 px-2.5 text-xs rounded-md border border-border dark:border-secondary-foreground bg-card dark:bg-[#111D29] text-foreground dark:text-muted outline-none focus:border-primary"
              >
                {SOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-secondary-foreground dark:text-muted-foreground">
                Language
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full h-9 px-2.5 text-xs rounded-md border border-border dark:border-secondary-foreground bg-card dark:bg-[#111D29] text-foreground dark:text-muted outline-none focus:border-primary"
              >
                <option value="Default">Default</option>
                <option value="English">English</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
              </select>
            </div>
          </div>

          <div className="border-t border-muted dark:border-muted pt-3">
            <div className="mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground">
                BIBLIOGRAPHY FIELDS FOR APA
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Author field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-secondary-foreground dark:text-muted-foreground">
                    Author
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-secondary-foreground dark:text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isCorp}
                      onChange={(e) => setIsCorp(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary size-3.5"
                    />
                    Corporate Author
                  </label>
                </div>
                {isCorp ? (
                  <input
                    type="text"
                    value={corpAuthor}
                    onChange={(e) => setCorpAuthor(e.target.value)}
                    placeholder="e.g. Parexel International"
                    className="w-full h-9 px-3 text-xs rounded-md border border-border dark:border-secondary-foreground bg-card dark:bg-[#111D29] text-foreground dark:text-muted placeholder:text-muted-foreground outline-none focus:border-primary"
                    required
                  />
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Lastname, Firstname (e.g. Chen, J.)"
                      className="w-full h-9 px-3 text-xs rounded-md border border-border dark:border-secondary-foreground bg-card dark:bg-[#111D29] text-foreground dark:text-muted placeholder:text-muted-foreground outline-none focus:border-primary"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const name = window.prompt("Enter author name (Lastname, Firstname):", author);
                        if (name !== null) setAuthor(name);
                      }}
                      className="h-9 px-4 text-xs font-medium rounded-md border border-border dark:border-secondary-foreground bg-card dark:bg-[#111D29] hover:bg-muted dark:hover:bg-muted text-secondary-foreground dark:text-muted-foreground transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Title field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-secondary-foreground dark:text-muted-foreground">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Citations and References"
                  className="w-full h-9 px-3 text-xs rounded-md border border-border dark:border-secondary-foreground bg-card dark:bg-[#111D29] text-foreground dark:text-muted placeholder:text-muted-foreground outline-none focus:border-primary"
                  required
                />
              </div>

              {/* Year, City, Publisher (3 columns) */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-secondary-foreground dark:text-muted-foreground">
                    Year
                  </label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g. 2024"
                    className="w-full h-9 px-3 text-xs rounded-md border border-border dark:border-secondary-foreground bg-card dark:bg-[#111D29] text-foreground dark:text-muted placeholder:text-muted-foreground outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-secondary-foreground dark:text-muted-foreground">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. New York"
                    className="w-full h-9 px-3 text-xs rounded-md border border-border dark:border-secondary-foreground bg-card dark:bg-[#111D29] text-foreground dark:text-muted placeholder:text-muted-foreground outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-secondary-foreground dark:text-muted-foreground">
                    Publisher
                  </label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="e.g. Contoso Press"
                    className="w-full h-9 px-3 text-xs rounded-md border border-border dark:border-secondary-foreground bg-card dark:bg-[#111D29] text-foreground dark:text-muted placeholder:text-muted-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Show All Checkbox */}
              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="showAll"
                  checked={showAllFields}
                  onChange={(e) => setShowAllFields(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary size-3.5"
                />
                <label htmlFor="showAll" className="text-xs text-secondary-foreground dark:text-muted-foreground cursor-pointer select-none">
                  Show All Bibliography Fields
                </label>
              </div>

              {showAllFields && (
                <div className="space-y-3 p-3 bg-muted dark:bg-[#111D29]/50 rounded-lg border border-secondary dark:border-muted animate-in slide-in-from-top-1 duration-150">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-secondary-foreground dark:text-muted-foreground">Volume</label>
                    <input
                      type="text"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      placeholder="e.g. 2"
                      className="w-full h-8 px-2.5 text-xs rounded border border-border dark:border-secondary-foreground bg-card dark:bg-[#111D29] text-foreground dark:text-muted outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-secondary-foreground dark:text-muted-foreground">Pages</label>
                    <input
                      type="text"
                      value={pages}
                      onChange={(e) => setPages(e.target.value)}
                      placeholder="e.g. 12-45"
                      className="w-full h-8 px-2.5 text-xs rounded border border-border dark:border-secondary-foreground bg-card dark:bg-[#111D29] text-foreground dark:text-muted outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-secondary-foreground dark:text-muted-foreground">Edition</label>
                    <input
                      type="text"
                      value={edition}
                      onChange={(e) => setEdition(e.target.value)}
                      placeholder="e.g. 3rd"
                      className="w-full h-8 px-2.5 text-xs rounded border border-border dark:border-secondary-foreground bg-card dark:bg-[#111D29] text-foreground dark:text-muted outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tag Name & Action Buttons */}
          <div className="border-t border-muted dark:border-muted pt-4 flex items-end justify-between gap-4">
            <div className="space-y-1 flex-1">
              <label className="text-xs font-semibold text-secondary-foreground dark:text-muted-foreground">
                Tag name
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="e.g. Chen24"
                className="w-full h-9 px-3 text-xs rounded-md border border-border dark:border-secondary-foreground bg-card dark:bg-[#111D29] text-foreground dark:text-muted placeholder:text-muted-foreground outline-none focus:border-primary font-mono"
              />
            </div>
            <div className="flex gap-2 self-end">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 text-xs font-semibold rounded-md border border-border dark:border-secondary-foreground bg-card dark:bg-[#111D29] hover:bg-muted dark:hover:bg-muted text-secondary-foreground dark:text-muted-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-5 text-xs font-semibold rounded-md bg-[#0078d4] hover:bg-[#006bbd] text-primary-foreground shadow-sm transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function PlaceholderDialog({ onClose }: ModalProps) {
  const refs = useReferences();
  const [tagName, setTagName] = useState("Placeholder1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagName.trim()) {
      refs.addPlaceholder(tagName.trim());
      onClose();
    }
  };

  return (
    <div className={MODAL_OVERLAY_CLASSES}>
      <div className={`${MODAL_CONTENT_CLASSES} max-w-sm`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-muted dark:border-muted">
          <h3 className="text-sm font-bold text-foreground dark:text-primary-foreground">Placeholder Name</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-secondary-foreground text-sm">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-muted-foreground dark:text-muted-foreground leading-normal">
            Type the tag name of the source. You can add more information to this source later by clicking Edit in the Source Manager.
          </p>
          <div className="space-y-1.5">
            <input
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-md border border-border dark:border-secondary-foreground bg-card dark:bg-[#111D29] text-foreground dark:text-muted outline-none focus:border-primary font-medium"
              required
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 text-xs font-semibold rounded-md border border-border dark:border-secondary-foreground bg-card dark:bg-[#111D29] hover:bg-muted dark:hover:bg-muted text-secondary-foreground dark:text-muted-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 text-xs font-semibold rounded-md bg-[#0078d4] text-primary-foreground hover:bg-[#006bbd] transition-colors"
            >
              OK
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SourceManagerDialog({ onClose }: ModalProps) {
  const refs = useReferences();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSources = refs.sources.filter((s) => {
    const term = searchQuery.toLowerCase();
    const author = s.isCorporateAuthor ? s.corporateAuthor : s.author;
    return (
      (author || "").toLowerCase().includes(term) ||
      (s.title || "").toLowerCase().includes(term) ||
      (s.tag || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className={MODAL_OVERLAY_CLASSES}>
      <div className={`${MODAL_CONTENT_CLASSES} max-w-2xl h-[80vh]`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-muted dark:border-muted shrink-0">
          <h3 className="text-sm font-bold text-foreground dark:text-primary-foreground">Source Manager</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-secondary-foreground text-sm">✕</button>
        </div>
        
        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-muted dark:border-muted bg-muted/50 dark:bg-[#111D29]/40 shrink-0">
          <input
            type="text"
            placeholder="Search sources by author, title, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 px-3 text-xs rounded-md border border-border dark:border-secondary-foreground bg-card dark:bg-[#111D29] text-foreground dark:text-muted outline-none focus:border-primary"
          />
        </div>

        {/* Sources List & Panel */}
        <div className="flex-1 overflow-hidden flex min-h-0">
          {/* Master List (All registered sources) */}
          <div className="flex-1 overflow-y-auto p-5 thin-scroll">
            <span className="text-[10px] font-bold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider block mb-3">
              Sources Available ({filteredSources.length})
            </span>
            
            <div className="space-y-2.5">
              {filteredSources.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-8 bg-muted dark:bg-secondary rounded-lg border border-dashed border-secondary dark:border-muted">
                  No sources found.
                </p>
              ) : (
                filteredSources.map((s) => {
                  const author = s.isCorporateAuthor ? s.corporateAuthor : s.author;
                  return (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-xl border border-secondary dark:border-muted bg-card dark:bg-[#0E1A29] hover:border-blue-300 transition-all flex flex-col gap-1 group relative"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-xs font-bold text-foreground dark:text-primary-foreground truncate max-w-[80%]">
                          {author || "Unknown Author"}
                        </span>
                        <span className="text-[10px] font-mono bg-primary/10 text-primary dark:bg-blue-950/60 dark:text-blue-300 px-2 py-0.5 rounded font-medium">
                          {s.tag}
                        </span>
                      </div>
                      
                      {s.isPlaceholder ? (
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 italic font-medium">Placeholder Citation</span>
                      ) : (
                        <>
                          <span className="text-xs text-muted-foreground dark:text-muted-foreground line-clamp-1 italic">{s.title || "(Untitled)"}</span>
                          <span className="text-[10px] text-muted-foreground dark:text-muted-foreground mt-0.5">
                            {s.type} · {s.year || "n.d."} {s.publisher ? `· ${s.publisher}` : ""}
                          </span>
                        </>
                      )}

                      {/* Item Actions */}
                      <div className="flex gap-3 mt-2 pt-2 border-t border-muted dark:border-muted">
                        <button
                          type="button"
                          onClick={() => {
                            refs.setEditingSource(s);
                            refs.setIsOpenCreateSource(true);
                          }}
                          className="text-[11px] font-medium text-primary hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => refs.deleteSource(s.id)}
                          className="text-[11px] font-medium text-destructive hover:underline"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            refs.insertCitation(s.id);
                            onClose();
                          }}
                          className="text-[11px] font-medium text-emerald-600 hover:underline ml-auto"
                        >
                          Insert Citation
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-muted dark:border-muted bg-card dark:bg-[#0E1A29] shrink-0 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              refs.setEditingSource(null);
              refs.setIsOpenCreateSource(true);
            }}
            className="h-9 px-4 text-xs font-semibold bg-[#0078d4] text-primary-foreground hover:bg-[#006bbd] rounded-md transition-colors shadow-sm"
          >
            + New Source...
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold border border-border dark:border-secondary-foreground bg-card dark:bg-[#111D29] text-secondary-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-muted rounded-md transition-colors"
          >
            Close Manager
          </button>
        </div>
      </div>
    </div>
  );
}
