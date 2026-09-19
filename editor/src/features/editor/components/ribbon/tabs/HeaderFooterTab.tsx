/**
 * HeaderFooterTab.tsx
 *
 * Microsoft Word-style "Header & Footer Tools - Design" Ribbon Tab.
 * Formatted with 6 functional ribbon groups, vertical group separators,
 * large command buttons with authentic Office-style icons, and bottom group labels.
 */

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  X,
  Search,
  ExternalLink,
} from "lucide-react";
import { useDocumentModel } from "@/features/editor/store/documentModel";
import { useHeaderFooter, type HFUnit } from "@/features/editor/modules/document/context/HeaderFooterContext";
import {
  HeaderGallery,
  FooterGallery,
} from "@/features/editor/modules/document/components/HeaderFooterGallery";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

// Unit conversion helpers (96 DPI base)
const CM_TO_PX = 37.795;
const IN_TO_PX = 96;

function pxToUnit(px: number, unit: HFUnit): number {
  if (unit === "cm") return parseFloat((px / CM_TO_PX).toFixed(2));
  if (unit === "in") return parseFloat((px / IN_TO_PX).toFixed(2));
  return Math.round(px);
}

function unitToPx(val: number, unit: HFUnit): number {
  if (unit === "cm") return Math.round(val * CM_TO_PX);
  if (unit === "in") return Math.round(val * IN_TO_PX);
  return Math.round(val);
}

/* ==========================================================================
   AUTHENTIC MICROSOFT WORD RIBBON ICONS (SVGs)
   ========================================================================== */

/** 1. Word Header Icon: Document page with bold orange top banner */
function WordHeaderIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="docShadow" x="-2" y="0" width="36" height="36" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0.5" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.18" />
        </filter>
        <linearGradient id="headerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff8c00" />
          <stop offset="100%" stopColor="#e65100" />
        </linearGradient>
      </defs>
      {/* Paper Sheet */}
      <rect x="5" y="3" width="22" height="26" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" filter="url(#docShadow)" />
      {/* Folded Top-Right Corner Accent */}
      <path d="M22 3L27 8H23.5C22.7 8 22 7.3 22 6.5V3Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
      {/* Bold Orange Header Bar */}
      <rect x="7.5" y="5.5" width="13.5" height="4.5" rx="0.8" fill="url(#headerGrad)" stroke="#c2410c" strokeWidth="0.6" />
      {/* Document Body Text Lines */}
      <line x1="8" y1="13.5" x2="24" y2="13.5" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="17.5" x2="24" y2="17.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="21.5" x2="20" y2="21.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="25.5" x2="16" y2="25.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** 2. Word Footer Icon: Document page with bold orange bottom banner */
function WordFooterIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="footerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff8c00" />
          <stop offset="100%" stopColor="#e65100" />
        </linearGradient>
      </defs>
      {/* Paper Sheet */}
      <rect x="5" y="3" width="22" height="26" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
      {/* Folded Top-Right Corner */}
      <path d="M22 3L27 8H23.5C22.7 8 22 7.3 22 6.5V3Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
      {/* Document Body Text Lines */}
      <line x1="8" y1="7.5" x2="19" y2="7.5" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="11.5" x2="24" y2="11.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="15.5" x2="24" y2="15.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="19.5" x2="18" y2="19.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
      {/* Bold Orange Footer Bar */}
      <rect x="7.5" y="22.5" width="17" height="4.5" rx="0.8" fill="url(#footerGrad)" stroke="#c2410c" strokeWidth="0.6" />
    </svg>
  );
}

/** 3. Word Page Number Icon: Document page with # tag at bottom */
function WordPageNumberIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="3" width="22" height="26" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
      <path d="M22 3L27 8H23.5C22.7 8 22 7.3 22 6.5V3Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
      {/* Text Lines */}
      <line x1="8" y1="7.5" x2="19" y2="7.5" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8" y1="11.5" x2="24" y2="11.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="15.5" x2="24" y2="15.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
      {/* Page Number Tag (#) */}
      <rect x="10.5" y="19.5" width="11" height="7.5" rx="1" fill="#eff6ff" stroke="#2563eb" strokeWidth="1" />
      <text x="16" y="25.5" fontSize="7" fontWeight="bold" fill="#1d4ed8" textAnchor="middle" fontFamily="monospace">
        #
      </text>
    </svg>
  );
}

/** 4. Word Date & Time Icon: Wall Calendar with Clock Badge */
function WordDateTimeIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Calendar Body */}
      <rect x="4" y="5" width="21" height="21" rx="2" fill="#ffffff" stroke="#3b82f6" strokeWidth="1.4" />
      {/* Top Header Bar */}
      <rect x="4" y="5" width="21" height="6.5" rx="1" fill="#2563eb" />
      {/* Rings */}
      <rect x="8" y="3" width="2" height="3.5" rx="0.5" fill="#64748b" />
      <rect x="19" y="3" width="2" height="3.5" rx="0.5" fill="#64748b" />
      {/* Grid Lines */}
      <line x1="4" y1="16" x2="25" y2="16" stroke="#e2e8f0" strokeWidth="1" />
      <line x1="4" y1="21" x2="16" y2="21" stroke="#e2e8f0" strokeWidth="1" />
      <line x1="11" y1="11.5" x2="11" y2="26" stroke="#e2e8f0" strokeWidth="1" />
      <line x1="18" y1="11.5" x2="18" y2="17" stroke="#e2e8f0" strokeWidth="1" />
      {/* Day '5' Accent */}
      <text x="14.5" y="19.5" fontSize="6.5" fontWeight="bold" fill="#2563eb" textAnchor="middle">
        5
      </text>
      {/* Clock Badge (Bottom Right) */}
      <circle cx="22" cy="22" r="6.5" fill="#ffffff" stroke="#475569" strokeWidth="1.2" />
      <path d="M22 18v4l2.5 1.5" stroke="#0284c7" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** 5. Word Quick Parts Icon: Document with Orange/Blue Modular Sections */
function WordQuickPartsIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="3" width="22" height="26" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
      <path d="M22 3L27 8H23.5C22.7 8 22 7.3 22 6.5V3Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
      {/* Top Header/Property Block */}
      <rect x="7.5" y="5.5" width="13.5" height="4" rx="0.5" fill="#3b82f6" />
      {/* Orange Callout/Sidebar Block */}
      <rect x="7.5" y="11.5" width="6" height="13.5" rx="0.5" fill="#f97316" />
      {/* Text Lines */}
      <line x1="15.5" y1="13.5" x2="24" y2="13.5" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="15.5" y1="17.5" x2="24" y2="17.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="15.5" y1="21.5" x2="22" y2="21.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** 6. Word Picture Icon: Framed Landscape with Blue Sky, Sun, and Mountain */
function WordPictureIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>
      {/* Picture Frame */}
      <rect x="4" y="4" width="24" height="24" rx="2" fill="url(#skyGrad)" stroke="#64748b" strokeWidth="1.5" />
      {/* Sun */}
      <circle cx="21" cy="11" r="3.5" fill="#f59e0b" />
      {/* Mountains */}
      <path d="M5.5 26L13 16.5L18 21.5L22 17.5L26.5 26H5.5Z" fill="#3b82f6" />
      <path d="M10 26L16 19L21 26H10Z" fill="#1d4ed8" opacity="0.4" />
    </svg>
  );
}

/** 7. Word Clip Art Icon: 4-Quadrant Colorful Graphics Grid */
function WordClipArtIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Top Left Quadrant (Orange Person / Silhouette) */}
      <rect x="4" y="4" width="11" height="11" rx="1.5" fill="#ffedd5" stroke="#f97316" strokeWidth="1.2" />
      <circle cx="9.5" cy="8" r="1.8" fill="#ea580c" />
      <path d="M6.5 13C6.5 11 8 10.5 9.5 10.5C11 10.5 12.5 11 12.5 13" fill="#ea580c" />
      {/* Top Right Quadrant (Yellow Figure / Document) */}
      <rect x="17" y="4" width="11" height="11" rx="1.5" fill="#fef9c3" stroke="#eab308" strokeWidth="1.2" />
      <path d="M22.5 6L25.5 9H23C22.7 9 22.5 8.7 22.5 8.5V6Z" fill="#ca8a04" />
      <rect x="19" y="6" width="6.5" height="7" rx="0.5" stroke="#ca8a04" strokeWidth="0.8" fill="#ffffff" />
      {/* Bottom Left Quadrant (Green Badge / Star) */}
      <rect x="4" y="17" width="11" height="11" rx="1.5" fill="#dcfce7" stroke="#22c55e" strokeWidth="1.2" />
      <polygon points="9.5,19 10.5,21.5 13,21.5 11,23 12,25.5 9.5,24 7,25.5 8,23 6,21.5 8.5,21.5" fill="#16a34a" />
      {/* Bottom Right Quadrant (Blue Diamond / Palette) */}
      <rect x="17" y="17" width="11" height="11" rx="1.5" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.2" />
      <circle cx="21" cy="21" r="1.5" fill="#0284c7" />
      <circle cx="24" cy="24" r="1.5" fill="#0369a1" />
      <circle cx="20" cy="24.5" r="1.2" fill="#38bdf8" />
    </svg>
  );
}

/** 8. Word Go to Header Icon: Document with orange header highlight & up indicator */
function WordGoToHeaderIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="3" width="22" height="26" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
      <path d="M22 3L27 8H23.5C22.7 8 22 7.3 22 6.5V3Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
      {/* Top Header Highlight */}
      <rect x="7.5" y="5.5" width="13.5" height="4.5" rx="0.8" fill="#f97316" stroke="#c2410c" strokeWidth="0.6" />
      {/* Up Arrow Marker */}
      <path d="M14 18L14 13M14 13L11.5 15.5M14 13L16.5 15.5" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="8" y1="21.5" x2="24" y2="21.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="25.5" x2="18" y2="25.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** 9. Word Go to Footer Icon: Document with orange footer highlight & down indicator */
function WordGoToFooterIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="3" width="22" height="26" rx="1.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" />
      <path d="M22 3L27 8H23.5C22.7 8 22 7.3 22 6.5V3Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
      <line x1="8" y1="7.5" x2="19" y2="7.5" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="11.5" x2="24" y2="11.5" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" />
      {/* Down Arrow Marker */}
      <path d="M14 14L14 19M14 19L11.5 16.5M14 19L16.5 16.5" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Bottom Footer Highlight */}
      <rect x="7.5" y="22.5" width="17" height="4.5" rx="0.8" fill="#f97316" stroke="#c2410c" strokeWidth="0.6" />
    </svg>
  );
}

/** 10. Word Previous Section Icon */
function WordPrevSectionIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="10" height="12" rx="1" fill="#ffffff" stroke="#64748b" strokeWidth="1" />
      <path d="M11 6L11 2M11 2L9 4M11 2L13 4" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="4" y1="6" x2="8" y2="6" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="4" y1="9" x2="10" y2="9" stroke="#cbd5e1" strokeWidth="1" />
    </svg>
  );
}

/** 11. Word Next Section Icon */
function WordNextSectionIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="10" height="12" rx="1" fill="#ffffff" stroke="#64748b" strokeWidth="1" />
      <path d="M11 10L11 14M11 14L9 12M11 14L13 12" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="4" y1="5" x2="10" y2="5" stroke="#cbd5e1" strokeWidth="1" />
      <line x1="4" y1="8" x2="8" y2="8" stroke="#cbd5e1" strokeWidth="1" />
    </svg>
  );
}

/** 12. Word Link to Previous Icon */
function WordLinkToPreviousIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Two Overlapping Pages */}
      <rect x="3" y="4" width="9" height="12" rx="1" fill="#ffffff" stroke="#64748b" strokeWidth="1.2" />
      <rect x="12" y="4" width="9" height="12" rx="1" fill="#ffffff" stroke="#64748b" strokeWidth="1.2" />
      {/* Chain Link between them */}
      <path d="M9 10H15M8 10C8 8.5 9.5 8.5 9.5 8.5M16 10C16 8.5 14.5 8.5 14.5 8.5" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 10C8 11.5 9.5 11.5 9.5 11.5M16 10C16 11.5 14.5 11.5 14.5 11.5" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** 13. Word Header from Top Margin Icon */
function WordHeaderTopIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="12" height="12" rx="1" fill="#ffffff" stroke="#64748b" strokeWidth="1" />
      <line x1="2" y1="5.5" x2="14" y2="5.5" stroke="#f97316" strokeWidth="1.2" strokeDasharray="1.5 1" />
      <path d="M8 2.5V5M8 5L6.5 3.8M8 5L9.5 3.8" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 14. Word Footer from Bottom Margin Icon */
function WordFooterBottomIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="12" height="12" rx="1" fill="#ffffff" stroke="#64748b" strokeWidth="1" />
      <line x1="2" y1="10.5" x2="14" y2="10.5" stroke="#f97316" strokeWidth="1.2" strokeDasharray="1.5 1" />
      <path d="M8 13.5V11M8 11L6.5 12.2M8 11L9.5 12.2" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 15. Word Insert Alignment Tab Icon */
function WordAlignmentTabIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="2" y1="8" x2="11" y2="8" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 5.5L11.5 8L9 10.5" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="14" y1="4" x2="14" y2="12" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** 16. Word Close Header & Footer Icon: Iconic Red Square with Bold White 'X' */
function WordCloseIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className} rounded bg-gradient-to-b from-[#f87171] to-[#dc2626] border border-[#b91c1c] shadow-xs`}>
      {/* Subtle glossy top highlight */}
      <div className="absolute top-0.5 inset-x-1 h-1.5 rounded-t bg-white/35" />
      <X className="w-4 h-4 text-white stroke-[2.8]" />
    </div>
  );
}

/* ==========================================================================
   CLIP ART PRESET GALLERY
   ========================================================================== */
interface ClipArtItem {
  id: string;
  title: string;
  category: "stamps" | "badges" | "icons" | "dividers";
  tags: string[];
  svg: string;
}

const CLIP_ART_GALLERY: ClipArtItem[] = [
  {
    id: "approved-stamp",
    title: "Approved Stamp",
    category: "stamps",
    tags: ["approved", "stamp", "check", "valid", "official"],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 40" width="130" height="40"><rect x="2" y="2" width="126" height="36" rx="6" fill="#ecfdf5" stroke="#059669" stroke-width="2.5" stroke-dasharray="4 2"/><path d="M16 20l4 4 8-8" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><text x="36" y="25" fill="#047857" font-size="13" font-family="Arial, sans-serif" font-weight="bold" letter-spacing="1">APPROVED</text></svg>`,
  },
  {
    id: "confidential-stamp",
    title: "Confidential Stamp",
    category: "stamps",
    tags: ["confidential", "stamp", "secret", "private", "red"],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 40" width="140" height="40"><rect x="2" y="2" width="136" height="36" rx="4" fill="#fef2f2" stroke="#dc2626" stroke-width="2.5"/><circle cx="16" cy="20" r="6" fill="none" stroke="#dc2626" stroke-width="2"/><text x="32" y="25" fill="#b91c1c" font-size="12" font-family="Arial, sans-serif" font-weight="bold" letter-spacing="1.5">CONFIDENTIAL</text></svg>`,
  },
  {
    id: "draft-stamp",
    title: "Draft Stamp",
    category: "stamps",
    tags: ["draft", "stamp", "pending", "review"],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40" width="100" height="40"><rect x="2" y="2" width="96" height="36" rx="4" fill="#fffbeb" stroke="#d97706" stroke-width="2.5" stroke-dasharray="4 2"/><text x="50" y="25" fill="#b45309" font-size="14" font-family="Arial, sans-serif" font-weight="bold" text-anchor="middle" letter-spacing="2">DRAFT</text></svg>`,
  },
  {
    id: "gold-seal",
    title: "Official Gold Seal",
    category: "badges",
    tags: ["seal", "gold", "star", "official", "medal"],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50"><circle cx="25" cy="25" r="22" fill="#fef3c7" stroke="#d97706" stroke-width="2"/><circle cx="25" cy="25" r="18" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="2 2"/><polygon points="25,12 28,19 36,20 30,26 32,34 25,30 18,34 20,26 14,20 22,19" fill="#f59e0b"/></svg>`,
  },
  {
    id: "certified-ribbon",
    title: "Certified Ribbon",
    category: "badges",
    tags: ["certified", "ribbon", "badge", "blue", "award"],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50" height="50"><path d="M18 35l-4 12 11-4 11 4-4-12" fill="#2563eb" stroke="#1d4ed8" stroke-width="1.5"/><circle cx="25" cy="22" r="15" fill="#dbeafe" stroke="#2563eb" stroke-width="2.5"/><path d="M20 22l3.5 3.5 6.5-6.5" fill="none" stroke="#1d4ed8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "verified-shield",
    title: "Verified Shield",
    category: "badges",
    tags: ["shield", "verified", "security", "safe"],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 46" width="46" height="46"><path d="M23 6L9 12v12c0 9 6 15 14 18 8-3 14-9 14-18V12L23 6z" fill="#eff6ff" stroke="#2563eb" stroke-width="2.5"/><path d="M16 23l5 5 9-9" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "world-globe",
    title: "World Globe",
    category: "icons",
    tags: ["globe", "world", "international", "global"],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44" width="44" height="44"><circle cx="22" cy="22" r="18" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/><ellipse cx="22" cy="22" rx="8" ry="18" fill="none" stroke="#0284c7" stroke-width="1.5"/><line x1="4" y1="22" x2="40" y2="22" stroke="#0284c7" stroke-width="1.5"/></svg>`,
  },
  {
    id: "diamond-divider",
    title: "Diamond Divider",
    category: "dividers",
    tags: ["line", "divider", "diamond", "rule"],
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 24" width="240" height="24"><line x1="10" y1="12" x2="105" y2="12" stroke="#94a3b8" stroke-width="1.5"/><polygon points="120,6 126,12 120,18 114,12" fill="#3b82f6"/><circle cx="108" cy="12" r="2" fill="#94a3b8"/><circle cx="132" cy="12" r="2" fill="#94a3b8"/><line x1="135" y1="12" x2="230" y2="12" stroke="#94a3b8" stroke-width="1.5"/></svg>`,
  },
];

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */
export default function HeaderFooterTab() {
  const { model, activePage, updateSection } = useDocumentModel();
  const {
    activeHFType,
    activeSectionId,
    activePageId,
    showDocumentText,
    unit,
    exitHeaderFooterMode,
    goToHeader,
    goToFooter,
    goToPrevSection,
    goToNextSection,
    setShowDocumentText,
    setUnit,
  } = useHeaderFooter();

  const currentPage = model.pages.find((p) => p.id === activePage) || model.pages[0];
  const activeSection =
    model.sections.find((s) => s.id === (activeSectionId || currentPage?.sectionId)) ||
    model.sections[0];

  const sectionIndex = model.sections.findIndex((s) => s.id === activeSection?.id);
  const totalSections = model.sections.length;

  // Header & Footer distances (default 48px ≈ 1.25 cm ≈ 0.5 in)
  const headerTopPx = activeSection?.headerTopDistance ?? 48;
  const footerBottomPx = activeSection?.footerBottomDistance ?? 48;

  const headerDisplayVal = pxToUnit(headerTopPx, unit);
  const footerDisplayVal = pxToUnit(footerBottomPx, unit);

  const [headerInputVal, setHeaderInputVal] = useState<string>(String(headerDisplayVal));
  const [footerInputVal, setFooterInputVal] = useState<string>(String(footerDisplayVal));

  // Picture upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clip Art Modal State
  const [clipArtModalOpen, setClipArtModalOpen] = useState(false);
  const [clipArtSearch, setClipArtSearch] = useState("");
  const [selectedClipArtCat, setSelectedClipArtCat] = useState<string>("all");
  const [customImageUrl, setCustomImageUrl] = useState("");

  // Sync state when section or unit changes
  useEffect(() => {
    setHeaderInputVal(String(pxToUnit(headerTopPx, unit)));
    setFooterInputVal(String(pxToUnit(footerBottomPx, unit)));
  }, [headerTopPx, footerBottomPx, unit]);

  const handleHeaderDistanceChange = (newVal: number) => {
    if (!activeSection) return;
    const px = Math.max(0, Math.min(200, unitToPx(newVal, unit)));
    updateSection(activeSection.id, { headerTopDistance: px });
  };

  const handleFooterDistanceChange = (newVal: number) => {
    if (!activeSection) return;
    const px = Math.max(0, Math.min(200, unitToPx(newVal, unit)));
    updateSection(activeSection.id, { footerBottomDistance: px });
  };

  const stepDistance = (type: "header" | "footer", delta: number) => {
    const currentVal = type === "header" ? parseFloat(headerInputVal) : parseFloat(footerInputVal);
    const validCurrent = isNaN(currentVal) ? (unit === "px" ? 48 : 1.25) : currentVal;
    const step = unit === "px" ? 1 : 0.1;
    const nextVal = Math.max(0, parseFloat((validCurrent + delta * step).toFixed(2)));

    if (type === "header") {
      setHeaderInputVal(String(nextVal));
      handleHeaderDistanceChange(nextVal);
    } else {
      setFooterInputVal(String(nextVal));
      handleFooterDistanceChange(nextVal);
    }
  };

  // Helper to insert HTML directly into the currently active Header or Footer
  const insertHtmlIntoActiveHF = (htmlSnippet: string) => {
    const targetPageId = activePageId || activePage || model.pages[0]?.id;
    const selector = `[data-hf-container="${activeHFType}"][data-page-id="${targetPageId}"] [contenteditable="true"]`;
    const targetEl = document.querySelector(selector) as HTMLElement | null;

    if (targetEl) {
      targetEl.focus();
      const sel = window.getSelection();
      let inserted = false;
      if (sel && sel.rangeCount > 0 && targetEl.contains(sel.anchorNode)) {
        try {
          inserted = document.execCommand("insertHTML", false, htmlSnippet);
        } catch {
          inserted = false;
        }
      }
      if (!inserted) {
        const wrapper = document.createElement("span");
        wrapper.innerHTML = htmlSnippet;
        targetEl.appendChild(wrapper);
      }
      targetEl.dispatchEvent(new Event("input", { bubbles: true }));

      if (activeSection) {
        if (activeHFType === "header") {
          updateSection(activeSection.id, {
            header: targetEl.innerText,
            headerHtml: targetEl.innerHTML,
          });
        } else {
          updateSection(activeSection.id, {
            footer: targetEl.innerText,
            footerHtml: targetEl.innerHTML,
          });
        }
      }
    } else {
      document.execCommand("insertHTML", false, htmlSnippet);
    }
  };

  const handleInsertDateTime = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    insertHtmlIntoActiveHF(`<span>${dateStr}</span>&nbsp;`);
  };

  const handleInsertDocTitle = () => {
    const title = model.title || "Document Title";
    insertHtmlIntoActiveHF(`<span>${title}</span>&nbsp;`);
  };

  const handleInsertAuthor = () => {
    insertHtmlIntoActiveHF(`<span>Author</span>&nbsp;`);
  };

  const handleInsertAlignmentTab = (alignment: "center" | "right") => {
    if (alignment === "right") {
      insertHtmlIntoActiveHF('<span style="display:inline-block; margin-left:auto; width:60px;">&nbsp;</span>');
    } else {
      insertHtmlIntoActiveHF('<span style="display:inline-block; margin:0 auto; width:30px;">&nbsp;</span>');
    }
  };

  // Picture Handler
  const handlePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handlePictureFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const imgHtml = `<img src="${dataUrl}" alt="Picture" style="max-height: 38px; max-width: 140px; height: auto; display: inline-block; vertical-align: middle; margin: 0 4px; object-fit: contain;" />&nbsp;`;
        insertHtmlIntoActiveHF(imgHtml);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Clip Art Handlers
  const handleInsertClipArt = (svg: string, title: string) => {
    const svgDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    const imgHtml = `<img src="${svgDataUri}" alt="${title}" style="max-height: 36px; width: auto; display: inline-block; vertical-align: middle; margin: 0 4px;" />&nbsp;`;
    insertHtmlIntoActiveHF(imgHtml);
    setClipArtModalOpen(false);
  };

  const handleInsertCustomUrl = () => {
    if (!customImageUrl.trim()) return;
    const imgHtml = `<img src="${customImageUrl.trim()}" alt="Clip Art" style="max-height: 38px; max-width: 140px; height: auto; display: inline-block; vertical-align: middle; margin: 0 4px; object-fit: contain;" />&nbsp;`;
    insertHtmlIntoActiveHF(imgHtml);
    setCustomImageUrl("");
    setClipArtModalOpen(false);
  };

  const filteredClipArts = CLIP_ART_GALLERY.filter((item) => {
    const matchesCat = selectedClipArtCat === "all" || item.category === selectedClipArtCat;
    const matchesQuery =
      !clipArtSearch.trim() ||
      item.title.toLowerCase().includes(clipArtSearch.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(clipArtSearch.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  // Section Page Number shortcuts
  const handleSetHeaderPageNumber = (alignment: "left" | "center" | "right") => {
    if (activeSection) {
      updateSection(activeSection.id, {
        pageNumberPosition: "header",
        pageNumberAlignment: alignment,
        showPageNumbers: true,
      });
    }
  };

  const handleSetFooterPageNumber = (alignment: "left" | "center" | "right") => {
    if (activeSection) {
      updateSection(activeSection.id, {
        pageNumberPosition: "footer",
        pageNumberAlignment: alignment,
        showPageNumbers: true,
      });
    }
  };

  const handleRemovePageNumbers = () => {
    if (activeSection) {
      updateSection(activeSection.id, {
        showPageNumbers: false,
        pageNumberPosition: undefined,
      });
    }
  };

  const isDifferentFirstPage = activeSection?.differentFirstPage ?? false;
  const isDifferentOddEven = activeSection?.differentOddEven ?? false;
  const isLinkToPrevious = activeSection?.linkToPrevious ?? false;

  return (
    <div className="flex items-stretch h-[88px] text-slate-700 dark:text-slate-200 select-none overflow-x-auto">
      {/* Hidden file input for Picture upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePictureFileChange}
        className="hidden"
      />

      {/* ============================================================
          GROUP 1: HEADER & FOOTER
      ============================================================ */}
      <div className="flex flex-col justify-between items-center px-1.5 shrink-0">
        <div className="flex items-center gap-1 flex-1">
          {/* 1. Header Dropdown Button */}
          <HeaderGallery
            customTrigger={
              <button
                type="button"
                className="flex flex-col items-center justify-center w-[48px] h-[60px] rounded hover:bg-slate-100 hover:border hover:border-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-700 active:bg-slate-200/70 transition-colors p-0.5 cursor-pointer group"
                title="Header: Add or change header"
              >
                <WordHeaderIcon className="w-7 h-7 group-hover:scale-105 transition-transform" />
                <span className="text-[11px] leading-tight text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-0.5">
                  Header
                  <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
                </span>
              </button>
            }
          />

          {/* 2. Footer Dropdown Button */}
          <FooterGallery
            customTrigger={
              <button
                type="button"
                className="flex flex-col items-center justify-center w-[48px] h-[60px] rounded hover:bg-slate-100 hover:border hover:border-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-700 active:bg-slate-200/70 transition-colors p-0.5 cursor-pointer group"
                title="Footer: Add or change footer"
              >
                <WordFooterIcon className="w-7 h-7 group-hover:scale-105 transition-transform" />
                <span className="text-[11px] leading-tight text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-0.5">
                  Footer
                  <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
                </span>
              </button>
            }
          />

          {/* 3. Page Number Dropdown Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex flex-col items-center justify-center w-[52px] h-[60px] rounded hover:bg-slate-100 hover:border hover:border-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-700 active:bg-slate-200/70 transition-colors p-0.5 cursor-pointer group"
                title="Page Number: Insert page numbers into document"
              >
                <WordPageNumberIcon className="w-7 h-7 group-hover:scale-105 transition-transform" />
                <span className="text-[10px] leading-3 text-slate-800 dark:text-slate-100 mt-0.5 text-center flex flex-col items-center">
                  <span>Page</span>
                  <span className="flex items-center gap-0.5">
                    Number
                    <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
                  </span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 text-xs p-1 shadow-lg bg-white dark:bg-[#0B1620]">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <span>Top of Page</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-36 text-xs">
                  <DropdownMenuItem onClick={() => handleSetHeaderPageNumber("left")}>
                    Plain Number 1 (Left)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSetHeaderPageNumber("center")}>
                    Plain Number 2 (Center)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSetHeaderPageNumber("right")}>
                    Plain Number 3 (Right)
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <span>Bottom of Page</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-36 text-xs">
                  <DropdownMenuItem onClick={() => handleSetFooterPageNumber("left")}>
                    Plain Number 1 (Left)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSetFooterPageNumber("center")}>
                    Plain Number 2 (Center)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSetFooterPageNumber("right")}>
                    Plain Number 3 (Right)
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleRemovePageNumbers}
                className="text-rose-600 dark:text-rose-400 cursor-pointer"
              >
                Remove Page Numbers
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Group 1 Label */}
        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal tracking-tight text-center py-0.5 select-none">
          Header &amp; Footer
        </div>
      </div>

      {/* Vertical Group Divider */}
      <div className="w-[1px] bg-slate-200 dark:bg-slate-800 self-stretch my-1 shrink-0" />

      {/* ============================================================
          GROUP 2: INSERT
      ============================================================ */}
      <div className="flex flex-col justify-between items-center px-1.5 shrink-0">
        <div className="flex items-center gap-1 flex-1">
          {/* Date & Time */}
          <button
            type="button"
            onClick={handleInsertDateTime}
            className="flex flex-col items-center justify-center w-[48px] h-[60px] rounded hover:bg-slate-100 hover:border hover:border-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-700 active:bg-slate-200/70 transition-colors p-0.5 cursor-pointer group"
            title="Date & Time: Insert current date or time"
          >
            <WordDateTimeIcon className="w-7 h-7 group-hover:scale-105 transition-transform" />
            <span className="text-[10px] leading-3 text-slate-800 dark:text-slate-100 mt-0.5 text-center flex flex-col items-center">
              <span>Date &amp;</span>
              <span>Time</span>
            </span>
          </button>

          {/* Quick Parts Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex flex-col items-center justify-center w-[48px] h-[60px] rounded hover:bg-slate-100 hover:border hover:border-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-700 active:bg-slate-200/70 transition-colors p-0.5 cursor-pointer group"
                title="Quick Parts: Insert reusable pieces of content"
              >
                <WordQuickPartsIcon className="w-7 h-7 group-hover:scale-105 transition-transform" />
                <span className="text-[10px] leading-3 text-slate-800 dark:text-slate-100 mt-0.5 text-center flex flex-col items-center">
                  <span>Quick</span>
                  <span className="flex items-center gap-0.5">
                    Parts
                    <ChevronDown className="w-2 h-2 text-slate-500" />
                  </span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 text-xs p-1 shadow-lg bg-white dark:bg-[#0B1620]">
              <DropdownMenuItem onClick={handleInsertDocTitle} className="cursor-pointer">
                Document Title
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleInsertAuthor} className="cursor-pointer">
                Author
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleInsertDateTime} className="cursor-pointer">
                Date Field
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Picture */}
          <button
            type="button"
            onClick={handlePictureClick}
            className="flex flex-col items-center justify-center w-[48px] h-[60px] rounded hover:bg-slate-100 hover:border hover:border-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-700 active:bg-slate-200/70 transition-colors p-0.5 cursor-pointer group"
            title="Picture: Insert picture from an image file"
          >
            <WordPictureIcon className="w-7 h-7 group-hover:scale-105 transition-transform" />
            <span className="text-[11px] leading-tight text-slate-800 dark:text-slate-100 mt-1">
              Picture
            </span>
          </button>

          {/* Clip Art */}
          <button
            type="button"
            onClick={() => setClipArtModalOpen(true)}
            className="flex flex-col items-center justify-center w-[48px] h-[60px] rounded hover:bg-slate-100 hover:border hover:border-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-700 active:bg-slate-200/70 transition-colors p-0.5 cursor-pointer group"
            title="Clip Art: Insert built-in clip arts, seals, and stamps"
          >
            <WordClipArtIcon className="w-7 h-7 group-hover:scale-105 transition-transform" />
            <span className="text-[10px] leading-3 text-slate-800 dark:text-slate-100 mt-0.5 text-center flex flex-col items-center">
              <span>Clip</span>
              <span>Art</span>
            </span>
          </button>
        </div>

        {/* Group 2 Label */}
        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal tracking-tight text-center py-0.5 select-none">
          Insert
        </div>
      </div>

      {/* Vertical Group Divider */}
      <div className="w-[1px] bg-slate-200 dark:bg-slate-800 self-stretch my-1 shrink-0" />

      {/* ============================================================
          GROUP 3: NAVIGATION
      ============================================================ */}
      <div className="flex flex-col justify-between items-center px-1.5 shrink-0">
        <div className="flex items-center gap-1 flex-1">
          {/* Go to Header */}
          <button
            type="button"
            onClick={goToHeader}
            className={`flex flex-col items-center justify-center w-[48px] h-[60px] rounded p-0.5 transition-colors cursor-pointer group ${
              activeHFType === "header"
                ? "bg-blue-50 border border-blue-300 dark:bg-blue-950/60 dark:border-blue-700"
                : "hover:bg-slate-100 hover:border hover:border-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-700"
            }`}
            title="Go to Header"
          >
            <WordGoToHeaderIcon className="w-7 h-7 group-hover:scale-105 transition-transform" />
            <span className="text-[10px] leading-3 text-slate-800 dark:text-slate-100 mt-0.5 text-center flex flex-col items-center">
              <span>Go to</span>
              <span>Header</span>
            </span>
          </button>

          {/* Go to Footer */}
          <button
            type="button"
            onClick={goToFooter}
            className={`flex flex-col items-center justify-center w-[48px] h-[60px] rounded p-0.5 transition-colors cursor-pointer group ${
              activeHFType === "footer"
                ? "bg-blue-50 border border-blue-300 dark:bg-blue-950/60 dark:border-blue-700"
                : "hover:bg-slate-100 hover:border hover:border-slate-300 dark:hover:bg-slate-800 dark:hover:border-slate-700"
            }`}
            title="Go to Footer"
          >
            <WordGoToFooterIcon className="w-7 h-7 group-hover:scale-105 transition-transform" />
            <span className="text-[10px] leading-3 text-slate-800 dark:text-slate-100 mt-0.5 text-center flex flex-col items-center">
              <span>Go to</span>
              <span>Footer</span>
            </span>
          </button>

          {/* Previous / Next & Link to Previous Stack */}
          <div className="flex flex-col justify-center gap-0.5 pl-0.5">
            {/* Previous */}
            <button
              type="button"
              onClick={goToPrevSection}
              disabled={sectionIndex <= 0}
              className="flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[11px] text-slate-700 hover:bg-slate-100 disabled:opacity-35 disabled:hover:bg-transparent dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
              title="Previous Section"
            >
              <WordPrevSectionIcon className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={goToNextSection}
              disabled={sectionIndex >= totalSections - 1}
              className="flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[11px] text-slate-700 hover:bg-slate-100 disabled:opacity-35 disabled:hover:bg-transparent dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
              title="Next Section"
            >
              <WordNextSectionIcon className="w-3.5 h-3.5" />
              <span>Next</span>
            </button>

            {/* Link to Previous (Golden Highlighted Button when Active like Word!) */}
            <button
              type="button"
              onClick={() => {
                if (activeSection) {
                  updateSection(activeSection.id, {
                    linkToPrevious: !isLinkToPrevious,
                  });
                }
              }}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] transition-all cursor-pointer ${
                isLinkToPrevious
                  ? "bg-[#ffeb9c] border border-[#fcd34d] text-[#78350f] font-semibold shadow-2xs hover:bg-[#ffe082]"
                  : "text-slate-700 hover:bg-slate-100 border border-transparent dark:text-slate-200 dark:hover:bg-slate-800"
              }`}
              title="Link to Previous: Link this section's header/footer to the previous section"
            >
              <WordLinkToPreviousIcon className="w-4 h-4" />
              <span>Link to Previous</span>
            </button>
          </div>
        </div>

        {/* Group 3 Label */}
        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal tracking-tight text-center py-0.5 select-none">
          Navigation
        </div>
      </div>

      {/* Vertical Group Divider */}
      <div className="w-[1px] bg-slate-200 dark:bg-slate-800 self-stretch my-1 shrink-0" />

      {/* ============================================================
          GROUP 4: OPTIONS (CHECKBOXES)
      ============================================================ */}
      <div className="flex flex-col justify-between items-start px-2 shrink-0">
        <div className="flex flex-col justify-center gap-1.5 flex-1 pt-1 text-[11px]">
          <label className="flex items-center gap-1.5 select-none cursor-pointer hover:text-slate-900 dark:hover:text-white">
            <input
              type="checkbox"
              checked={isDifferentFirstPage}
              onChange={(e) => {
                if (activeSection) {
                  updateSection(activeSection.id, {
                    differentFirstPage: e.target.checked,
                  });
                }
              }}
              className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <span>Different First Page</span>
          </label>

          <label className="flex items-center gap-1.5 select-none cursor-pointer hover:text-slate-900 dark:hover:text-white">
            <input
              type="checkbox"
              checked={isDifferentOddEven}
              onChange={(e) => {
                if (activeSection) {
                  updateSection(activeSection.id, {
                    differentOddEven: e.target.checked,
                  });
                }
              }}
              className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <span>Different Odd &amp; Even Pages</span>
          </label>

          <label className="flex items-center gap-1.5 select-none cursor-pointer hover:text-slate-900 dark:hover:text-white">
            <input
              type="checkbox"
              checked={showDocumentText}
              onChange={(e) => setShowDocumentText(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <span>Show Document Text</span>
          </label>
        </div>

        {/* Group 4 Label */}
        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal tracking-tight text-center w-full py-0.5 select-none">
          Options
        </div>
      </div>

      {/* Vertical Group Divider */}
      <div className="w-[1px] bg-slate-200 dark:bg-slate-800 self-stretch my-1 shrink-0" />

      {/* ============================================================
          GROUP 5: POSITION (STEPPERS & ALIGNMENT TAB)
      ============================================================ */}
      <div className="flex flex-col justify-between items-start px-2 shrink-0">
        <div className="flex flex-col justify-center gap-1 flex-1 pt-0.5 text-[11px]">
          {/* Header from Top */}
          <div className="flex items-center justify-between gap-1.5 w-full">
            <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 text-[11px]">
              <WordHeaderTopIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Header from Top:</span>
            </div>
            <div className="relative flex items-center border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 overflow-hidden h-[22px]">
              <input
                type="text"
                value={`${headerInputVal} ${unit}`}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d.]/g, "");
                  setHeaderInputVal(raw);
                  const num = parseFloat(raw);
                  if (!isNaN(num)) handleHeaderDistanceChange(num);
                }}
                className="w-16 px-1.5 text-[11px] text-slate-800 dark:text-slate-100 outline-none bg-transparent"
              />
              <div className="flex flex-col border-l border-slate-200 dark:border-slate-800 h-full">
                <button
                  type="button"
                  onClick={() => stepDistance("header", 1)}
                  className="px-1 text-[8px] leading-none hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center h-1/2 cursor-pointer"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => stepDistance("header", -1)}
                  className="px-1 text-[8px] leading-none hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center h-1/2 border-t border-slate-200 dark:border-slate-800 cursor-pointer"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>

          {/* Footer from Bottom */}
          <div className="flex items-center justify-between gap-1.5 w-full">
            <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 text-[11px]">
              <WordFooterBottomIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Footer from Bottom:</span>
            </div>
            <div className="relative flex items-center border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 overflow-hidden h-[22px]">
              <input
                type="text"
                value={`${footerInputVal} ${unit}`}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d.]/g, "");
                  setFooterInputVal(raw);
                  const num = parseFloat(raw);
                  if (!isNaN(num)) handleFooterDistanceChange(num);
                }}
                className="w-16 px-1.5 text-[11px] text-slate-800 dark:text-slate-100 outline-none bg-transparent"
              />
              <div className="flex flex-col border-l border-slate-200 dark:border-slate-800 h-full">
                <button
                  type="button"
                  onClick={() => stepDistance("footer", 1)}
                  className="px-1 text-[8px] leading-none hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center h-1/2 cursor-pointer"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => stepDistance("footer", -1)}
                  className="px-1 text-[8px] leading-none hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center h-1/2 border-t border-slate-200 dark:border-slate-800 cursor-pointer"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>

          {/* Insert Alignment Tab Button / Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 px-1 py-0.5 rounded text-[11px] text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                title="Insert Alignment Tab"
              >
                <WordAlignmentTabIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Insert Alignment Tab</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44 text-xs p-1 shadow-lg bg-white dark:bg-[#0B1620]">
              <DropdownMenuItem onClick={() => handleInsertAlignmentTab("center")} className="cursor-pointer">
                Center Tab
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleInsertAlignmentTab("right")} className="cursor-pointer">
                Right Tab
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="px-2 py-1 text-[10px] text-slate-500">
                Unit:{" "}
                <button
                  type="button"
                  onClick={() => setUnit(unit === "cm" ? "in" : unit === "in" ? "px" : "cm")}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  {unit} (click to toggle)
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Group 5 Label */}
        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal tracking-tight text-center w-full py-0.5 select-none">
          Position
        </div>
      </div>

      {/* Vertical Group Divider */}
      <div className="w-[1px] bg-slate-200 dark:bg-slate-800 self-stretch my-1 shrink-0" />

      {/* ============================================================
          GROUP 6: CLOSE HEADER AND FOOTER
      ============================================================ */}
      <div className="flex flex-col justify-between items-center px-2 shrink-0">
        <div className="flex items-center justify-center flex-1">
          <button
            type="button"
            onClick={exitHeaderFooterMode}
            className="flex flex-col items-center justify-center w-[54px] h-[60px] rounded hover:bg-rose-50 hover:border hover:border-rose-300 dark:hover:bg-rose-950/40 dark:hover:border-rose-800 active:bg-rose-100 transition-colors p-0.5 cursor-pointer group"
            title="Close Header and Footer (Esc)"
          >
            <WordCloseIcon className="w-6 h-6 group-hover:scale-105 transition-transform" />
            <span className="text-[10px] leading-3 text-slate-800 dark:text-slate-100 mt-1 text-center flex flex-col items-center font-medium">
              <span>Close Header</span>
              <span>and Footer</span>
            </span>
          </button>
        </div>

        {/* Group 6 Label */}
        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal tracking-tight text-center py-0.5 select-none">
          Close
        </div>
      </div>

      {/* ============================================================
          CLIP ART SELECTION MODAL DIALOG
      ============================================================ */}
      <Dialog open={clipArtModalOpen} onOpenChange={setClipArtModalOpen}>
        <DialogContent className="max-w-md bg-white text-slate-800 dark:bg-[#0B1620] dark:text-slate-100 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <WordClipArtIcon className="w-5 h-5" />
              <DialogTitle className="text-sm font-semibold">
                Insert Clip Art ({activeHFType === "header" ? "Header" : "Footer"})
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search clip art (e.g., stamp, seal, badge)..."
                value={clipArtSearch}
                onChange={(e) => setClipArtSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All" },
                { id: "stamps", label: "Stamps" },
                { id: "badges", label: "Badges & Seals" },
                { id: "icons", label: "Icons" },
                { id: "dividers", label: "Dividers" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedClipArtCat(cat.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    selectedClipArtCat === cat.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800/80 rounded-lg bg-slate-50/50 dark:bg-slate-900/40">
              {filteredClipArts.length > 0 ? (
                filteredClipArts.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleInsertClipArt(item.svg, item.title)}
                    className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer group"
                    title={`Insert ${item.title}`}
                  >
                    <div
                      className="h-10 w-full flex items-center justify-center transition-transform group-hover:scale-105"
                      dangerouslySetInnerHTML={{ __html: item.svg }}
                    />
                    <span className="mt-1.5 text-[10px] text-slate-600 dark:text-slate-300 truncate w-full text-center font-medium">
                      {item.title}
                    </span>
                  </button>
                ))
              ) : (
                <div className="col-span-3 py-6 text-center text-slate-400 text-xs">
                  No clip arts matching your search.
                </div>
              )}
            </div>

            {/* Insert from URL Option */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Or insert from Web Image / SVG URL:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="url"
                  placeholder="https://example.com/logo.svg"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="flex-1 h-7 px-2.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:border-blue-500"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleInsertCustomUrl}
                  disabled={!customImageUrl.trim()}
                  className="h-7 px-2.5 text-xs font-medium cursor-pointer"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Insert
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setClipArtModalOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
