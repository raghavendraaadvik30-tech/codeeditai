/**
 * LayoutTab.tsx
 *
 * Provides page layout controls in the editor ribbon:
 * - Group 1: Header, Footer
 * - Group 2: Margins, Orientation, Size, Columns
 * - Group 3: Watermark, Page Color, Page Borders
 */

import { useState } from "react";
import {
  ChevronDown,
  Check,
  Columns2,
  Palette,
  FileText,
} from "lucide-react";

import RibbonDivider from "../controls/RibbonDivider";
import { useDocumentModel, type SectionModel } from "../../../store/documentModel";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/shared/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

const triggerClass = `
  h-8
  px-2.5
  text-xs
  font-medium
  text-slate-700
  hover:bg-slate-100
  hover:text-slate-900
  dark:text-slate-200
  dark:hover:bg-slate-800
  dark:hover:text-white
  rounded-md
  inline-flex
  items-center
  gap-1.5
  transition-colors
  cursor-pointer
  select-none
`;

export default function LayoutTab() {
  const { model, activePage, updateSection } = useDocumentModel();

  const activePageObj =
    model.pages.find((p) => p.id === activePage) ?? model.pages[0];
  const activeSection: SectionModel =
    model.sections.find((s) => s.id === activePageObj?.sectionId) ??
    model.sections[0];

  const applyToSection = (patch: Partial<SectionModel>) => {
    if (activeSection) {
      updateSection(activeSection.id, patch);
    }
  };

  const applyToAllSections = (patch: Partial<SectionModel>) => {
    model.sections.forEach((sec) => {
      updateSection(sec.id, patch);
    });
  };

  // Dialog States
  const [headerDialogOpen, setHeaderDialogOpen] = useState(false);
  const [headerInput, setHeaderInput] = useState("");

  const [footerDialogOpen, setFooterDialogOpen] = useState(false);
  const [footerInput, setFooterInput] = useState("");

  const [marginsDialogOpen, setMarginsDialogOpen] = useState(false);
  const [customTop, setCustomTop] = useState("1.0");
  const [customBottom, setCustomBottom] = useState("1.0");
  const [customLeft, setCustomLeft] = useState("1.0");
  const [customRight, setCustomRight] = useState("1.0");

  const [watermarkDialogOpen, setWatermarkDialogOpen] = useState(false);
  const [customWatermark, setCustomWatermark] = useState("CONFIDENTIAL");

  const [bordersDialogOpen, setBordersDialogOpen] = useState(false);
  const [selectedBorderStyle, setSelectedBorderStyle] = useState<
    "none" | "box" | "shadow" | "dashed" | "double"
  >("box");
  const [selectedBorderColor, setSelectedBorderColor] = useState("#000000");

  return (
    <div className="flex items-center gap-1">
      {/* =======================================================
          GROUP 1: HEADER & FOOTER
      ======================================================= */}

      {/* HEADER */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={triggerClass}>
            <svg
              className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 8V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M4 16h16" />
            </svg>
            <span>Header</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 text-xs">
          <DropdownMenuLabel className="text-[11px] text-slate-500 font-semibold">
            Header Presets
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              applyToSection({
                header: model.title || "Document Header",
              })
            }
            className="flex justify-between items-center cursor-pointer"
          >
            <span>Default Document Title</span>
            {activeSection?.header === model.title && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              applyToSection({
                header: "Parexel Clinical Study Report",
              })
            }
            className="flex justify-between items-center cursor-pointer"
          >
            <span>Parexel Clinical Header</span>
            {activeSection?.header === "Parexel Clinical Study Report" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              applyToSection({
                header: "CONFIDENTIAL & PROPRIETARY",
              })
            }
            className="flex justify-between items-center cursor-pointer"
          >
            <span>Confidential Header</span>
            {activeSection?.header === "CONFIDENTIAL & PROPRIETARY" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setHeaderInput(activeSection?.header || "");
              setHeaderDialogOpen(true);
            }}
            className="text-blue-600 font-medium cursor-pointer"
          >
            Edit Header...
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => applyToSection({ header: "" })}
            className="text-red-600 cursor-pointer"
          >
            Remove Header
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* FOOTER */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={triggerClass}>
            <svg
              className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 16v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4M4 8h16" />
            </svg>
            <span>Footer</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 text-xs">
          <DropdownMenuLabel className="text-[11px] text-slate-500 font-semibold">
            Footer Presets
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              applyToSection({
                footer: "Parexel Smart Authoring Suite",
              })
            }
            className="flex justify-between items-center cursor-pointer"
          >
            <span>Parexel Authoring Suite</span>
            {activeSection?.footer === "Parexel Smart Authoring Suite" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              applyToSection({
                footer: "Confidential & Proprietary",
              })
            }
            className="flex justify-between items-center cursor-pointer"
          >
            <span>Confidential & Proprietary</span>
            {activeSection?.footer === "Confidential & Proprietary" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              applyToSection({
                footer: "",
                showPageNumbers: true,
              })
            }
            className="flex justify-between items-center cursor-pointer"
          >
            <span>Page Number Only</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setFooterInput(activeSection?.footer || "");
              setFooterDialogOpen(true);
            }}
            className="text-blue-600 font-medium cursor-pointer"
          >
            Edit Footer...
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => applyToSection({ footer: "" })}
            className="text-red-600 cursor-pointer"
          >
            Remove Footer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RibbonDivider />

      {/* =======================================================
          GROUP 2: PAGE SETUP (MARGINS, ORIENTATION, SIZE, COLUMNS)
      ======================================================= */}

      {/* MARGINS */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={triggerClass}>
            <svg
              className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path
                d="M9 4v16M15 4v16M4 9h16M4 15h16"
                strokeDasharray="2 2"
              />
            </svg>
            <span>Margins</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60 text-xs">
          <DropdownMenuItem
            onClick={() =>
              applyToAllSections({
                marginPreset: "normal",
                marginConfig: { top: 72, bottom: 72, left: 72, right: 72 },
              })
            }
            className="flex justify-between items-center py-1.5 cursor-pointer"
          >
            <div>
              <div className="font-semibold">Normal</div>
              <div className="text-[10px] text-slate-400">
                Top/Bottom: 1.0", Left/Right: 1.0"
              </div>
            </div>
            {(!activeSection?.marginPreset ||
              activeSection?.marginPreset === "normal") && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              applyToAllSections({
                marginPreset: "narrow",
                marginConfig: { top: 36, bottom: 36, left: 36, right: 36 },
              })
            }
            className="flex justify-between items-center py-1.5 cursor-pointer"
          >
            <div>
              <div className="font-semibold">Narrow</div>
              <div className="text-[10px] text-slate-400">
                Top/Bottom: 0.5", Left/Right: 0.5"
              </div>
            </div>
            {activeSection?.marginPreset === "narrow" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              applyToAllSections({
                marginPreset: "moderate",
                marginConfig: { top: 72, bottom: 72, left: 54, right: 54 },
              })
            }
            className="flex justify-between items-center py-1.5 cursor-pointer"
          >
            <div>
              <div className="font-semibold">Moderate</div>
              <div className="text-[10px] text-slate-400">
                Top/Bottom: 1.0", Left/Right: 0.75"
              </div>
            </div>
            {activeSection?.marginPreset === "moderate" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              applyToAllSections({
                marginPreset: "wide",
                marginConfig: { top: 72, bottom: 72, left: 144, right: 144 },
              })
            }
            className="flex justify-between items-center py-1.5 cursor-pointer"
          >
            <div>
              <div className="font-semibold">Wide</div>
              <div className="text-[10px] text-slate-400">
                Top/Bottom: 1.0", Left/Right: 2.0"
              </div>
            </div>
            {activeSection?.marginPreset === "wide" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setMarginsDialogOpen(true)}
            className="text-blue-600 font-medium cursor-pointer"
          >
            Custom Margins...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ORIENTATION */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={triggerClass}>
            <svg
              className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="5" y="3" width="14" height="18" rx="2" />
              <path d="M12 7v10M9 14l3 3 3-3" />
            </svg>
            <span>Orientation</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 text-xs">
          <DropdownMenuItem
            onClick={() => applyToAllSections({ orientation: "portrait" })}
            className="flex justify-between items-center py-2 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-5 border border-slate-500 rounded-sm" />
              <span className="font-medium">Portrait</span>
            </div>
            {(!activeSection?.orientation ||
              activeSection?.orientation === "portrait") && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => applyToAllSections({ orientation: "landscape" })}
            className="flex justify-between items-center py-2 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="inline-block w-5 h-4 border border-slate-500 rounded-sm" />
              <span className="font-medium">Landscape</span>
            </div>
            {activeSection?.orientation === "landscape" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* SIZE */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={triggerClass}>
            <FileText className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
            <span>Size</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52 text-xs">
          <DropdownMenuItem
            onClick={() =>
              applyToAllSections({
                paperSize: { name: "Letter", width: 816, height: 1056 },
              })
            }
            className="flex justify-between items-center py-1.5 cursor-pointer"
          >
            <div>
              <div className="font-semibold">Letter</div>
              <div className="text-[10px] text-slate-400">8.5" × 11"</div>
            </div>
            {(!activeSection?.paperSize ||
              activeSection?.paperSize?.name === "Letter") && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              applyToAllSections({
                paperSize: { name: "A4", width: 794, height: 1123 },
              })
            }
            className="flex justify-between items-center py-1.5 cursor-pointer"
          >
            <div>
              <div className="font-semibold">A4</div>
              <div className="text-[10px] text-slate-400">
                8.27" × 11.69" (210 × 297 mm)
              </div>
            </div>
            {activeSection?.paperSize?.name === "A4" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              applyToAllSections({
                paperSize: { name: "Legal", width: 816, height: 1344 },
              })
            }
            className="flex justify-between items-center py-1.5 cursor-pointer"
          >
            <div>
              <div className="font-semibold">Legal</div>
              <div className="text-[10px] text-slate-400">8.5" × 14"</div>
            </div>
            {activeSection?.paperSize?.name === "Legal" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              applyToAllSections({
                paperSize: { name: "Executive", width: 696, height: 1008 },
              })
            }
            className="flex justify-between items-center py-1.5 cursor-pointer"
          >
            <div>
              <div className="font-semibold">Executive</div>
              <div className="text-[10px] text-slate-400">7.25" × 10.5"</div>
            </div>
            {activeSection?.paperSize?.name === "Executive" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              applyToAllSections({
                paperSize: { name: "A3", width: 1123, height: 1587 },
              })
            }
            className="flex justify-between items-center py-1.5 cursor-pointer"
          >
            <div>
              <div className="font-semibold">A3</div>
              <div className="text-[10px] text-slate-400">11.69" × 16.54"</div>
            </div>
            {activeSection?.paperSize?.name === "A3" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* COLUMNS */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={triggerClass}>
            <Columns2 className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
            <span>Columns</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44 text-xs">
          <DropdownMenuItem
            onClick={() =>
              applyToAllSections({ columns: { type: "one", count: 1 } })
            }
            className="flex justify-between items-center cursor-pointer"
          >
            <span>One Column</span>
            {(!activeSection?.columns ||
              activeSection?.columns?.type === "one") && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              applyToAllSections({ columns: { type: "two", count: 2 } })
            }
            className="flex justify-between items-center cursor-pointer"
          >
            <span>Two Columns</span>
            {activeSection?.columns?.type === "two" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              applyToAllSections({ columns: { type: "three", count: 3 } })
            }
            className="flex justify-between items-center cursor-pointer"
          >
            <span>Three Columns</span>
            {activeSection?.columns?.type === "three" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              applyToAllSections({ columns: { type: "left", count: 2 } })
            }
            className="flex justify-between items-center cursor-pointer"
          >
            <span>Left (Narrow Left)</span>
            {activeSection?.columns?.type === "left" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              applyToAllSections({ columns: { type: "right", count: 2 } })
            }
            className="flex justify-between items-center cursor-pointer"
          >
            <span>Right (Narrow Right)</span>
            {activeSection?.columns?.type === "right" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RibbonDivider />

      {/* =======================================================
          GROUP 3: WATERMARK, PAGE COLOR, PAGE BORDERS
      ======================================================= */}

      {/* WATERMARK */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={triggerClass}>
            <svg
              className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M9 12h6M12 9v6" strokeDasharray="2 2" />
            </svg>
            <span>Watermark</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 text-xs">
          <DropdownMenuItem
            onClick={() =>
              applyToAllSections({
                watermark: { text: "CONFIDENTIAL", opacity: 0.12 },
              })
            }
            className="flex justify-between items-center cursor-pointer"
          >
            <span>CONFIDENTIAL</span>
            {activeSection?.watermark?.text === "CONFIDENTIAL" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              applyToAllSections({
                watermark: { text: "DO NOT COPY", opacity: 0.12 },
              })
            }
            className="flex justify-between items-center cursor-pointer"
          >
            <span>DO NOT COPY</span>
            {activeSection?.watermark?.text === "DO NOT COPY" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              applyToAllSections({
                watermark: { text: "DRAFT", opacity: 0.12 },
              })
            }
            className="flex justify-between items-center cursor-pointer"
          >
            <span>DRAFT</span>
            {activeSection?.watermark?.text === "DRAFT" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              applyToAllSections({
                watermark: { text: "URGENT", opacity: 0.12 },
              })
            }
            className="flex justify-between items-center cursor-pointer"
          >
            <span>URGENT</span>
            {activeSection?.watermark?.text === "URGENT" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCustomWatermark(activeSection?.watermark?.text || "");
              setWatermarkDialogOpen(true);
            }}
            className="text-blue-600 font-medium cursor-pointer"
          >
            Custom Watermark...
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => applyToAllSections({ watermark: undefined })}
            className="text-red-600 cursor-pointer"
          >
            Remove Watermark
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* PAGE COLOR */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={triggerClass}>
            <Palette className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
            <span>Page Color</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 p-2 text-xs">
          <DropdownMenuLabel className="text-[11px] text-slate-500 font-semibold mb-2">
            Background Colors
          </DropdownMenuLabel>
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            {[
              { color: "#ffffff", label: "White" },
              { color: "#f8fafc", label: "Light Gray" },
              { color: "#fefce8", label: "Soft Yellow" },
              { color: "#f0fdf4", label: "Soft Green" },
              { color: "#eff6ff", label: "Soft Blue" },
              { color: "#faf5ff", label: "Soft Purple" },
              { color: "#fff1f2", label: "Soft Pink" },
              { color: "#ffedd5", label: "Soft Orange" },
              { color: "#f1f5f9", label: "Slate" },
              { color: "#e2e8f0", label: "Muted" },
            ].map(({ color, label }) => (
              <button
                key={color}
                type="button"
                title={label}
                onClick={() => applyToAllSections({ pageColor: color })}
                className="h-6 w-6 rounded border border-slate-300 shadow-sm transition-transform hover:scale-110 active:scale-95"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => applyToAllSections({ pageColor: "#ffffff" })}
            className="text-slate-600 font-medium cursor-pointer"
          >
            No Color (Default White)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* PAGE BORDERS */}
      <button
        type="button"
        onClick={() => {
          setSelectedBorderStyle(activeSection?.pageBorders?.style || "box");
          setSelectedBorderColor(activeSection?.pageBorders?.color || "#000000");
          setBordersDialogOpen(true);
        }}
        className={triggerClass}
      >
        <svg
          className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <rect x="6" y="6" width="12" height="12" strokeDasharray="2 2" />
        </svg>
        <span>Page Borders</span>
      </button>

      {/* =======================================================
          MODAL DIALOGS
      ======================================================= */}

      {/* 1. Header Dialog */}
      <Dialog open={headerDialogOpen} onOpenChange={setHeaderDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              Edit Document Header
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label className="text-xs">Header Text</Label>
            <Input
              value={headerInput}
              onChange={(e) => setHeaderInput(e.target.value)}
              placeholder="Enter header title..."
              className="text-xs"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHeaderDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                applyToSection({ header: headerInput });
                setHeaderDialogOpen(false);
              }}
            >
              Apply Header
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Footer Dialog */}
      <Dialog open={footerDialogOpen} onOpenChange={setFooterDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              Edit Document Footer
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label className="text-xs">Footer Text</Label>
            <Input
              value={footerInput}
              onChange={(e) => setFooterInput(e.target.value)}
              placeholder="Enter footer title..."
              className="text-xs"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFooterDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                applyToSection({ footer: footerInput });
                setFooterDialogOpen(false);
              }}
            >
              Apply Footer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Custom Margins Dialog */}
      <Dialog open={marginsDialogOpen} onOpenChange={setMarginsDialogOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              Custom Margins (inches)
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Top</Label>
              <Input
                type="number"
                step="0.1"
                min="0.2"
                max="3"
                value={customTop}
                onChange={(e) => setCustomTop(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Bottom</Label>
              <Input
                type="number"
                step="0.1"
                min="0.2"
                max="3"
                value={customBottom}
                onChange={(e) => setCustomBottom(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Left</Label>
              <Input
                type="number"
                step="0.1"
                min="0.2"
                max="3"
                value={customLeft}
                onChange={(e) => setCustomLeft(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Right</Label>
              <Input
                type="number"
                step="0.1"
                min="0.2"
                max="3"
                value={customRight}
                onChange={(e) => setCustomRight(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMarginsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const top = Math.round(parseFloat(customTop || "1") * 72);
                const bottom = Math.round(parseFloat(customBottom || "1") * 72);
                const left = Math.round(parseFloat(customLeft || "1") * 72);
                const right = Math.round(parseFloat(customRight || "1") * 72);
                applyToAllSections({
                  marginPreset: "custom",
                  marginConfig: { top, bottom, left, right },
                });
                setMarginsDialogOpen(false);
              }}
            >
              Apply Margins
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Custom Watermark Dialog */}
      <Dialog open={watermarkDialogOpen} onOpenChange={setWatermarkDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              Custom Watermark
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label className="text-xs">Watermark Text</Label>
            <Input
              value={customWatermark}
              onChange={(e) => setCustomWatermark(e.target.value)}
              placeholder="e.g. STRICTLY CONFIDENTIAL"
              className="text-xs"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWatermarkDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                applyToAllSections({
                  watermark: {
                    text: customWatermark.trim().toUpperCase(),
                    opacity: 0.12,
                  },
                });
                setWatermarkDialogOpen(false);
              }}
            >
              Apply Watermark
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. Page Borders Dialog */}
      <Dialog open={bordersDialogOpen} onOpenChange={setBordersDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              Page Borders
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Border Style</Label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(
                  [
                    { style: "none", label: "None" },
                    { style: "box", label: "Box (Solid)" },
                    { style: "shadow", label: "Shadow" },
                    { style: "dashed", label: "Dashed" },
                    { style: "double", label: "Double" },
                  ] as const
                ).map(({ style, label }) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setSelectedBorderStyle(style)}
                    className={`p-2 rounded border text-center transition-colors cursor-pointer ${
                      selectedBorderStyle === style
                        ? "border-blue-600 bg-blue-50 font-semibold text-blue-600 dark:bg-blue-950/40"
                        : "border-slate-200 hover:bg-slate-50 dark:border-slate-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {selectedBorderStyle !== "none" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Border Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={selectedBorderColor}
                    onChange={(e) => setSelectedBorderColor(e.target.value)}
                    className="h-8 w-14 p-0.5 cursor-pointer"
                  />
                  <span className="text-xs text-slate-500 font-mono">
                    {selectedBorderColor}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBordersDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                applyToAllSections({
                  pageBorders: {
                    style: selectedBorderStyle,
                    color: selectedBorderColor,
                    width: selectedBorderStyle === "double" ? 4 : 2,
                  },
                });
                setBordersDialogOpen(false);
              }}
            >
              Apply Border
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}