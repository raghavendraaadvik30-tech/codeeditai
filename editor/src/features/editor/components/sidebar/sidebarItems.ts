import {
  FileText,
  Link2,
  PenLine,
  Palette,
  Table2,
  Image,
  Bookmark,
  Sigma,
  Files,
  ShieldCheck,
  Settings,
} from "lucide-react";


export const SIDEBAR_ITEMS = [
  {
    id: "document",
    label: "Document",
    description: "Document tools",
    icon: FileText,
  },
  {
    id: "links",
    label: "Links",
    description: "Internal, external & cross references",
    icon: Link2,
  },
  {
    id: "writing",
    label: "Writing",
    description: "Writing and formatting tools",
    icon: PenLine,
  },
  {
    id: "styles",
    label: "Styles",
    description: "Document styles",
    icon: Palette,
  },
  {
    id: "tables",
    label: "Tables",
    description: "Smart table wizard",
    icon: Table2,
  },
  {
    id: "figures",
    label: "Figures",
    description: "Images and figures",
    icon: Image,
  },
  {
    id: "references",
    label: "References",
    description: "References and citations",
    icon: Bookmark,
  },
  {
    id: "symbols",
    label: "Symbols",
    description: "Special symbols",
    icon: Sigma,
  },
  {
    id: "appendices",
    label: "Appendices",
    description: "Document appendices",
    icon: Files,
  },
  {
    id: "trackChanges",
    label: "Track Changes",
    description: "Review document changes",
    icon: ShieldCheck,
  },
  {
    id: "settings",
    label: "Settings",
    description: "Editor settings",
    icon: Settings,
  },
] as const;
