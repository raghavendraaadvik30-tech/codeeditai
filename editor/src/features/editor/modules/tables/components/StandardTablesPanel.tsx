/**
 * --------------------------------------------------------------------------
 * Module: Tables
 * Feature: StandardTablesPanel Component
 * Description:
 * Sidebar presentation panel for the 4 Standard Tables options:
 * 1. Insert Table (Heading 12pt, Text 12pt)
 * 2. Insert Table (Heading 10pt, Text 10pt)
 * 3. Insert Table (Title Only)
 * 4. Insert Table (No Title 12pt)
 * --------------------------------------------------------------------------
 */

import { Table2, Plus } from "lucide-react";
import { useTable } from "../hooks";
import { buildCustomTableHTML } from "./TableInsertDialog";

interface StandardTableItem {
  id: number;
  title: string;
  description: string;
}

const STANDARD_TABLE_ITEMS: StandardTableItem[] = [
  {
    id: 1,
    title: "Insert Table",
    description: "Heading 12pt, Text 12pt",
  },
  {
    id: 2,
    title: "Insert Table",
    description: "Heading 10pt, Text 10pt",
  },
  {
    id: 3,
    title: "Insert Table",
    description: "Title Only",
  },
  {
    id: 4,
    title: "Insert Table",
    description: "No Title 12pt",
  },
];

interface StandardTablesPanelProps {
  searchQuery?: string;
}

export function StandardTablesPanel({ searchQuery = "" }: StandardTablesPanelProps) {
  const { insertCustomTableHTML } = useTable();

  const handleSelect = (id: number) => {
    switch (id) {
      case 1: {
        const html = buildCustomTableHTML({
          rows: 3,
          columns: 3,
          headingSize: "12pt",
          textSize: "12pt",
          titleOption: "with",
          autoFit: true,
        });
        insertCustomTableHTML(html);
        break;
      }
      case 2: {
        const html = buildCustomTableHTML({
          rows: 3,
          columns: 3,
          headingSize: "10pt",
          textSize: "10pt",
          titleOption: "with",
          autoFit: true,
        });
        insertCustomTableHTML(html);
        break;
      }
      case 3: {
        const html = buildCustomTableHTML({
          rows: 0,
          columns: 0,
          headingSize: "10pt",
          textSize: "10pt",
          titleOption: "only",
          autoFit: true,
        });
        insertCustomTableHTML(html);
        break;
      }
      case 4: {
        const html = buildCustomTableHTML({
          rows: 3,
          columns: 3,
          headingSize: "12pt",
          textSize: "12pt",
          titleOption: "without",
          autoFit: true,
        });
        insertCustomTableHTML(html);
        break;
      }
      default:
        break;
    }
  };

  const filteredItems = STANDARD_TABLE_ITEMS.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    );
  });

  if (filteredItems.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-secondary p-3 text-center text-xs text-muted-foreground dark:border-muted">
        No standard tables found
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {filteredItems.map((item) => (
        <div
          key={item.id}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleSelect(item.id)}
          className="group flex items-center justify-between rounded-xl border border-secondary/80 bg-card p-2.5 transition-all hover:border-brand/60 hover:bg-primary/20 dark:border-muted/80 dark:bg-[#091524] dark:hover:border-secondary-foreground dark:hover:bg-muted/40 cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-brand dark:bg-navy-950/50 dark:text-primary group-hover:scale-105 transition-transform">
              <Table2 className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-foreground dark:text-muted truncate">
                {item.title}
              </div>
              <div className="text-[11px] text-muted0 dark:text-muted-foreground truncate">
                {item.description}
              </div>
            </div>
          </div>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              handleSelect(item.id);
            }}
            className="flex h-6 shrink-0 items-center gap-1 rounded-md bg-brand/10 px-2 text-[11px] font-medium text-brand hover:bg-brand hover:text-primary-foreground transition-colors cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            <span>Insert</span>
          </button>
        </div>
      ))}
    </div>
  );
}

export default StandardTablesPanel;
