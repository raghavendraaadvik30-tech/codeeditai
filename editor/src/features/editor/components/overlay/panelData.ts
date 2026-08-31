/*Centralized configuration for editor panels and their available tools. 
It defines panel types, panel item structure, icons, titles, and descriptions.
This keeps editor tool configuration separate from UI
 rendering and makes panels easier to maintain and extend.*/
import {
  Type,
  Heading1,
  Heading2,
  Table,
  Image,
  BookOpen,
  Sigma,
  ShieldCheck,
  FileText,
  Settings,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Bookmark,
  Search,
  LayoutTemplate,
  FileCheck,
} from "lucide-react";

import type { ComponentType } from "react";

import { StylesPanel } from "../../modules/styles";

/* --------------------------------
   PANEL TYPES
-------------------------------- */

export type PanelType =
  | "document"
  | "links"
  | "writing"
  | "styles"
  | "tables"
  | "figures"
  | "references"
  | "symbols"
  | "appendices"
  | "trackChanges"
  | "templates"
  | "settings";

/* --------------------------------
   PANEL ITEM
-------------------------------- */

export type PanelItem = {
  id: string;
  title: string;
  icon: ComponentType<{ className?: string }>;
  description?: string;
};

/* --------------------------------
   PANEL DATA
-------------------------------- */

export const PANEL_DATA: Record<PanelType, PanelItem[]> = {
  /* ================================
     DOCUMENT
  ================================= */

  document: [
    {
      id: "search",
      title: "Find",
      icon: Search,
      description: "Search document content",
    },
    {
      id: "outline",
      title: "Outline",
      icon: FileText,
      description: "View document outline",
    },
  ],

  /* ================================
     LINKS
  ================================= */

  links: [
    {
      id: "internal-ref",
      title: "Internal Ref",
      icon: Bookmark,
      description: "Insert an internal reference",
    },
    {
      id: "external-link",
      title: "External Link",
      icon: Search,
      description: "Insert an external link",
    },
    {
      id: "bookmark",
      title: "Bookmark",
      icon: Bookmark,
      description: "Create a bookmark",
    },
    {
      id: "cross-ref",
      title: "Cross-ref",
      icon: BookOpen,
      description: "Insert a cross reference",
    },
  ],

  /* ================================
     WRITING
  ================================= */

  writing: [
    {
      id: "bold",
      title: "Bold",
      icon: Bold,
      description: "Make selected text bold",
    },
    {
      id: "italic",
      title: "Italic",
      icon: Italic,
      description: "Italic text",
    },
    {
      id: "underline",
      title: "Underline",
      icon: Underline,
      description: "Underline text",
    },
    {
      id: "align-left",
      title: "Align Left",
      icon: AlignLeft,
      description: "Left alignment",
    },
    {
      id: "align-center",
      title: "Align Center",
      icon: AlignCenter,
      description: "Center alignment",
    },
    {
      id: "align-right",
      title: "Align Right",
      icon: AlignRight,
      description: "Right alignment",
    },
    {
      id: "bullets",
      title: "Bulleted List",
      icon: List,
      description: "Insert bullets",
    },
    {
      id: "numbered",
      title: "Numbered List",
      icon: ListOrdered,
      description: "Insert numbering",
    },
  ],

  /* ================================
     STYLES
  ================================= */

  styles: [
    {
      id: "normal",
      title: "Normal Text",
      icon: Type,
      description: "Standard document text",
    },
    {
      id: "heading1",
      title: "Heading 1",
      icon: Heading1,
      description: "Main heading",
    },
    {
      id: "heading2",
      title: "Heading 2",
      icon: Heading2,
      description: "Secondary heading",
    },
  ],

  /* ================================
     TABLES
  ================================= */

  tables: [
    {
      id: "table",
      title: "Insert Table",
      icon: Table,
      description: "Create a document table",
    },
  ],

  /* ================================
     FIGURES
  ================================= */

  figures: [
    {
      id: "image",
      title: "Insert Image",
      icon: Image,
      description: "Insert a figure or image",
    },
  ],

  /* ================================
     REFERENCES
  ================================= */

  references: [
    {
      id: "bookmark",
      title: "Bookmark",
      icon: Bookmark,
      description: "Create a bookmark",
    },
    {
      id: "citation",
      title: "Citation",
      icon: BookOpen,
      description: "Insert a citation",
    },
  ],

  /* ================================
     SYMBOLS
  ================================= */

  symbols: [
    {
      id: "symbol",
      title: "Insert Symbol",
      icon: Sigma,
      description: "Insert a special symbol",
    },
  ],

  /* ================================
     APPENDICES
  ================================= */

  appendices: [
    {
      id: "appendix",
      title: "Appendices",
      icon: FileText,
      description: "Manage document appendices",
    },
    {
      id: "add-appendix",
      title: "Add Appendix",
      icon: FileCheck,
      description: "Add a new appendix",
    },
  ],

  /* ================================
     TRACK CHANGES
  ================================= */

  trackChanges: [
    {
      id: "track-changes",
      title: "Track Changes",
      icon: ShieldCheck,
      description: "Track document changes",
    },
    {
      id: "accept-changes",
      title: "Accept Changes",
      icon: FileCheck,
      description: "Accept tracked changes",
    },
  ],

  /* ================================
     TEMPLATES
  ================================= */

  templates: [
    {
      id: "csr",
      title: "Clinical Study Report",
      icon: LayoutTemplate,
      description: "Clinical study report template",
    },
    {
      id: "protocol",
      title: "Protocol",
      icon: FileText,
      description: "Clinical protocol template",
    },
  ],

  /* ================================
     SETTINGS
  ================================= */

  settings: [
    {
      id: "settings",
      title: "Editor Settings",
      icon: Settings,
      description: "Configure editor settings",
    },
  ],
};