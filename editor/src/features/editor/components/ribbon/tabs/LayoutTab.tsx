/**
 * LayoutTab.tsx
 *
 * Microsoft Word-style Layout Section Ribbon:
 * - Group 1: Header, Footer, Page Number (Top, Bottom, Current Position, Format, Remove)
 * - Group 2: Margins, Orientation, Size (with search), Columns
 * - Group 3: Watermark, Page Color, Page Borders
 */

import { useState, useMemo, useRef } from "react";
import {
  ChevronDown,
  Check,
  Columns2,
  Palette,
  FileText,
  Search,
} from "lucide-react";

import RibbonDivider from "../controls/RibbonDivider";
import { useEditor } from "@/features/editor/context/EditorContext";
import { useDocumentModel, type SectionModel, type PageBorderConfig } from "../../../store/documentModel";
import {
  HeaderGallery,
  FooterGallery,
} from "@/features/editor/modules/document/components/HeaderFooterGallery";


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/shared/components/ui/dropdown-menu";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/components/ui/popover";
import { cn } from "@/lib/utils";

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

interface PaperSizeDef {
  name: string;
  width: number;
  height: number;
  dimText: string;
}

const PAPER_SIZES: PaperSizeDef[] = [
  { name: "Letter", width: 816, height: 1056, dimText: "8.5\" × 11\" (21.59 × 27.94 cm)" },
  { name: "Tabloid", width: 1056, height: 1632, dimText: "11\" × 17\" (27.94 × 43.18 cm)" },
  { name: "Legal", width: 816, height: 1344, dimText: "8.5\" × 14\" (21.59 × 35.56 cm)" },
  { name: "Statement", width: 528, height: 816, dimText: "5.5\" × 8.5\" (13.97 × 21.59 cm)" },
  { name: "Executive", width: 696, height: 1008, dimText: "7.25\" × 10.5\" (18.41 × 26.67 cm)" },
  { name: "A3", width: 1123, height: 1587, dimText: "11.69\" × 16.54\" (29.7 × 42 cm)" },
  { name: "A4", width: 794, height: 1123, dimText: "8.27\" × 11.69\" (21 × 29.7 cm)" },
  { name: "A5", width: 559, height: 794, dimText: "5.83\" × 8.27\" (14.8 × 21 cm)" },
];

export default function LayoutTab() {
  const {
    model,
    activePage,
    updateSection,
    updateAllSections,
    applySectionPatchToPage,
    applyPageBorders,
  } = useDocumentModel();

  const { insertColumnBreak } = useEditor();


  // Active section resolution: activePage -> sectionId -> section
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
    updateAllSections(patch);
  };

  const applyToThisPage = (patch: Partial<SectionModel>) => {
    const targetPageId = activePage || activePageObj?.id || model.pages[0]?.id;
    if (targetPageId) {
      applySectionPatchToPage(targetPageId, patch);
    }
  };

  // ------------------------------------------------------------------------
  // Dialog & Popover States
  // ------------------------------------------------------------------------
  // Orientation Popover
  const [orientationOpen, setOrientationOpen] = useState(false);
  const [tempOrientation, setTempOrientation] = useState<"portrait" | "landscape">("portrait");
  const [applyTarget, setApplyTarget] = useState<"all" | "page" | "section">("all");

  const handleOpenOrientationChange = (open: boolean) => {
    if (open) {
      setTempOrientation(activeSection?.orientation || "portrait");
    }
    setOrientationOpen(open);
  };

  const handleCancelOrientation = () => {
    setOrientationOpen(false);
  };

  const handleApplyOrientation = () => {
    if (applyTarget === "all") {
      applyToAllSections({ orientation: tempOrientation });
    } else if (applyTarget === "page") {
      applyToThisPage({ orientation: tempOrientation });
    } else {
      applyToSection({ orientation: tempOrientation });
    }
    setOrientationOpen(false);
  };
  // 1. Header & Footer
  const [headerDialogOpen, setHeaderDialogOpen] = useState(false);
  const [headerInput, setHeaderInput] = useState("");
  const [footerDialogOpen, setFooterDialogOpen] = useState(false);
  const [footerInput, setFooterInput] = useState("");

  // 2. Page Number Format Dialog
  const [pageNumberFormatOpen, setPageNumberFormatOpen] = useState(false);
  const [formatChoice, setFormatChoice] = useState<"1" | "a" | "A" | "i" | "I">("1");
  const [numberingMode, setNumberingMode] = useState<"continue" | "startAt">("continue");
  const [startAtValue, setStartAtValue] = useState<number>(1);

  // 3. Custom Margins Dialog
  const [marginsDialogOpen, setMarginsDialogOpen] = useState(false);
  const [customTop, setCustomTop] = useState("1.0");
  const [customBottom, setCustomBottom] = useState("1.0");
  const [customLeft, setCustomLeft] = useState("1.0");
  const [customRight, setCustomRight] = useState("1.0");

  // 4. Custom Page Size Dialog
  const [customSizeDialogOpen, setCustomSizeDialogOpen] = useState(false);
  const [customWidthInches, setCustomWidthInches] = useState("8.5");
  const [customHeightInches, setCustomHeightInches] = useState("11.0");
  const [sizeSearch, setSizeSearch] = useState("");

  // 5. Custom Columns Dialog
  const [columnsDialogOpen, setColumnsDialogOpen] = useState(false);
  const [customColumnCount, setCustomColumnCount] = useState("2");
  const [customColumnGap, setCustomColumnGap] = useState("32");

  // 6. Watermark Dialog
  const [watermarkDialogOpen, setWatermarkDialogOpen] = useState(false);
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");
  const [wmText, setWmText] = useState("CONFIDENTIAL");
  const [wmFont, setWmFont] = useState("Calibri");
  const [wmFontSize, setWmFontSize] = useState<string>("auto");
  const [wmColor, setWmColor] = useState("#94a3b8");
  const [wmOpacity, setWmOpacity] = useState(15);
  const [wmRotation, setWmRotation] = useState<"diagonal" | "horizontal">("diagonal");
  const [wmImageUrl, setWmImageUrl] = useState("");
  const [wmImageRotation, setWmImageRotation] = useState<number>(-45);
  const [wmImageScale, setWmImageScale] = useState<string>("100");
  const [wmFileName, setWmFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setWmFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === "string") {
          setWmImageUrl(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 7. Page Borders Dialog
  const [bordersDialogOpen, setBordersDialogOpen] = useState(false);
  const [borderSetting, setBorderSetting] = useState<
    "none" | "box" | "shadow" | "3d" | "custom"
  >("box");
  const [borderStyle, setBorderStyle] = useState<
    "solid" | "dashed" | "dotted" | "double" | "dash-dot" | "thick-solid"
  >("solid");
  const [borderColor, setBorderColor] = useState("#000000");
  const [borderWidth, setBorderWidth] = useState<number>(2);
  const [borderTop, setBorderTop] = useState(true);
  const [borderBottom, setBorderBottom] = useState(true);
  const [borderLeft, setBorderLeft] = useState(true);
  const [borderRight, setBorderRight] = useState(true);
  const [borderDistanceTop, setBorderDistanceTop] = useState<number>(24);
  const [borderDistanceBottom, setBorderDistanceBottom] = useState<number>(24);
  const [borderDistanceLeft, setBorderDistanceLeft] = useState<number>(24);
  const [borderDistanceRight, setBorderDistanceRight] = useState<number>(24);
  const [borderApplyTo, setBorderApplyTo] = useState<
    "document" | "section" | "page" | "firstPage" | "exceptFirstPage"
  >("document");
  const [artBorder, setArtBorder] = useState<string>("none");



  const handleApplyPageNumberFormat = () => {
    applyToSection({
      pageNumberFormat: formatChoice,
      pageNumberStartAt: numberingMode === "startAt" ? Math.max(1, startAtValue) : undefined,
    });
    setPageNumberFormatOpen(false);
  };

  // ------------------------------------------------------------------------
  // Handlers for Margins
  // ------------------------------------------------------------------------
  const handleApplyNormalMargins = () => {
    applyToAllSections({
      marginPreset: "normal",
      marginConfig: { top: 96, bottom: 96, left: 96, right: 96 },
    });
  };

  const handleApplyNarrowMargins = () => {
    applyToAllSections({
      marginPreset: "narrow",
      marginConfig: { top: 48, bottom: 48, left: 48, right: 48 },
    });
  };

  const handleApplyModerateMargins = () => {
    applyToAllSections({
      marginPreset: "moderate",
      marginConfig: { top: 96, bottom: 96, left: 72, right: 72 },
    });
  };

  const handleApplyWideMargins = () => {
    applyToAllSections({
      marginPreset: "wide",
      marginConfig: { top: 96, bottom: 96, left: 192, right: 192 },
    });
  };

  const handleApplyMirroredMargins = () => {
    applyToAllSections({
      marginPreset: "mirrored",
      marginConfig: { top: 96, bottom: 96, left: 120, right: 96 },
    });
  };

  const openCustomMarginsDialog = () => {
    const mg = activeSection?.marginConfig ?? { top: 96, bottom: 96, left: 96, right: 96 };
    setCustomTop((mg.top / 96).toFixed(1));
    setCustomBottom((mg.bottom / 96).toFixed(1));
    setCustomLeft((mg.left / 96).toFixed(1));
    setCustomRight((mg.right / 96).toFixed(1));
    setMarginsDialogOpen(true);
  };

  const handleApplyCustomMargins = () => {
    const top = Math.round(Math.max(0.1, parseFloat(customTop || "1")) * 96);
    const bottom = Math.round(Math.max(0.1, parseFloat(customBottom || "1")) * 96);
    const left = Math.round(Math.max(0.1, parseFloat(customLeft || "1")) * 96);
    const right = Math.round(Math.max(0.1, parseFloat(customRight || "1")) * 96);

    applyToAllSections({
      marginPreset: "custom",
      marginConfig: { top, bottom, left, right },
    });
    setMarginsDialogOpen(false);
  };

  // ------------------------------------------------------------------------
  // Handlers for Paper Size
  // ------------------------------------------------------------------------
  const filteredPaperSizes = useMemo(() => {
    if (!sizeSearch.trim()) return PAPER_SIZES;
    return PAPER_SIZES.filter((ps) =>
      ps.name.toLowerCase().includes(sizeSearch.toLowerCase())
    );
  }, [sizeSearch]);

  const handleApplyCustomSize = () => {
    const widthInches = parseFloat(customWidthInches);
    const heightInches = parseFloat(customHeightInches);
    if (!isNaN(widthInches) && !isNaN(heightInches) && widthInches > 0 && heightInches > 0) {
      applyToSection({
        paperSize: {
          name: `Custom (${widthInches}" × ${heightInches}")`,
          width: Math.round(widthInches * 96),
          height: Math.round(heightInches * 96),
        },
      });
      setCustomSizeDialogOpen(false);
    }
  };

  // ------------------------------------------------------------------------
  // Handlers for Columns
  // ------------------------------------------------------------------------
  const openCustomColumnsDialog = () => {
    setCustomColumnCount(String(activeSection?.columns?.count ?? 2));
    setCustomColumnGap(String(activeSection?.columns?.gap ?? 32));
    setColumnsDialogOpen(true);
  };

  const handleApplyCustomColumns = () => {
    const count = parseInt(customColumnCount, 10);
    const gap = parseInt(customColumnGap, 10);
    if (!isNaN(count) && count >= 1 && count <= 5) {
      applyToAllSections({
        columns: {
          type: "custom",
          count,
          gap: isNaN(gap) ? 32 : gap,
        },
      });
      setColumnsDialogOpen(false);
    }
  };

  // ------------------------------------------------------------------------
  // Handlers for Watermark
  // ------------------------------------------------------------------------
  const handleApplyCustomWatermark = () => {
    if (watermarkType === "text") {
      applyToSection({
        watermark: {
          text: wmText.trim(),
          font: wmFont,
          fontSize: wmFontSize === "auto" ? "auto" : parseInt(wmFontSize, 10) || "auto",
          color: wmColor,
          opacity: wmOpacity / 100,
          rotation: wmRotation,
        },
      });
    } else {
      applyToSection({
        watermark: {
          image: wmImageUrl,
          opacity: wmOpacity / 100,
          rotation: wmImageRotation,
          scale: wmImageScale,
        },
      });
    }
    setWatermarkDialogOpen(false);
  };

  // ------------------------------------------------------------------------
  // Handlers for Page Borders
  // ------------------------------------------------------------------------
  const handleApplyBorders = () => {
    const isNone =
      borderSetting === "none" ||
      (!borderTop && !borderBottom && !borderLeft && !borderRight);
    const effectiveSetting = isNone ? "none" : borderSetting;
    const borderConfig: PageBorderConfig = {
      setting: effectiveSetting,
      lineStyle: borderStyle,
      style:
        effectiveSetting === "none"
          ? "none"
          : effectiveSetting === "shadow"
          ? "shadow"
          : effectiveSetting === "3d"
          ? "3d"
          : borderStyle,
      color: borderColor,
      width: borderWidth,
      top: !isNone ? borderTop : false,
      bottom: !isNone ? borderBottom : false,
      left: !isNone ? borderLeft : false,
      right: !isNone ? borderRight : false,
      distance: {
        top: borderDistanceTop,
        bottom: borderDistanceBottom,
        left: borderDistanceLeft,
        right: borderDistanceRight,
      },
      applyTo: borderApplyTo,
      art: artBorder !== "none" ? artBorder : undefined,
    };

    applyPageBorders(
      borderConfig,
      borderApplyTo,
      activePageObj?.id || activePage || undefined,
      activeSection?.id
    );

    setBordersDialogOpen(false);
  };


  return (
    <div className="flex items-center gap-1 overflow-x-auto py-0.5 text-slate-700 dark:text-slate-200">
      {/* =======================================================
          GROUP 1: HEADER, FOOTER, PAGE NUMBER
      ======================================================= */}

      {/* HEADER */}
      <HeaderGallery buttonClassName={triggerClass} />

      {/* FOOTER */}
      <FooterGallery buttonClassName={triggerClass} />



      <RibbonDivider />

      {/* =======================================================
          GROUP 2: PAGE SETUP (MARGINS, ORIENTATION, SIZE, COLUMNS)
      ======================================================= */}

      {/* MARGINS */}
      <DropdownMenu>
        <DropdownMenuTrigger render={<button type="button" className={triggerClass} title="Margins">
            <svg
              className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M9 4v16M15 4v16M4 9h16M4 15h16" strokeDasharray="2 2" />
            </svg>
            <span>Margins</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>} />
        <DropdownMenuContent align="start" className="w-64 text-xs">
          <DropdownMenuItem
            onClick={handleApplyNormalMargins}
            className="flex justify-between items-center py-1.5 cursor-pointer"
          >
            <div>
              <div className="font-semibold">Normal</div>
              <div className="text-[10px] text-slate-400">
                Top: 1", Bottom: 1", Left: 1", Right: 1"
              </div>
            </div>
            {(!activeSection?.marginPreset || activeSection?.marginPreset === "normal") && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleApplyNarrowMargins}
            className="flex justify-between items-center py-1.5 cursor-pointer"
          >
            <div>
              <div className="font-semibold">Narrow</div>
              <div className="text-[10px] text-slate-400">
                Top: 0.5", Bottom: 0.5", Left: 0.5", Right: 0.5"
              </div>
            </div>
            {activeSection?.marginPreset === "narrow" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleApplyModerateMargins}
            className="flex justify-between items-center py-1.5 cursor-pointer"
          >
            <div>
              <div className="font-semibold">Moderate</div>
              <div className="text-[10px] text-slate-400">
                Top: 1", Bottom: 1", Left: 0.75", Right: 0.75"
              </div>
            </div>
            {activeSection?.marginPreset === "moderate" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleApplyWideMargins}
            className="flex justify-between items-center py-1.5 cursor-pointer"
          >
            <div>
              <div className="font-semibold">Wide</div>
              <div className="text-[10px] text-slate-400">
                Top: 1", Bottom: 1", Left: 2", Right: 2"
              </div>
            </div>
            {activeSection?.marginPreset === "wide" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleApplyMirroredMargins}
            className="flex justify-between items-center py-1.5 cursor-pointer"
          >
            <div>
              <div className="font-semibold">Mirrored</div>
              <div className="text-[10px] text-slate-400">
                Top: 1", Bottom: 1", Inside: 1.25", Outside: 1"
              </div>
            </div>
            {activeSection?.marginPreset === "mirrored" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={openCustomMarginsDialog}
            className="text-blue-600 font-medium cursor-pointer"
          >
            Custom Margins...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ORIENTATION */}
      <Popover open={orientationOpen} onOpenChange={handleOpenOrientationChange}>
        <PopoverTrigger render={<button type="button" className={triggerClass} title="Orientation">
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
          </button>} />
        <PopoverContent
          align="start"
          className="w-[260px] p-3 rounded-xl border border-slate-200/90 bg-white shadow-xl dark:border-slate-800 dark:bg-[#0c1827] text-slate-900 dark:text-slate-100"
        >
          {/* Orientation Cards */}
          <div className="space-y-1.5">
            {/* Portrait Card */}
            <button
              type="button"
              onClick={() => setTempOrientation("portrait")}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors border",
                tempOrientation === "portrait"
                  ? "border-blue-300 bg-[#edf5fc] dark:border-blue-600 dark:bg-blue-950/50"
                  : "border-transparent bg-transparent hover:bg-[#e1f0fb] dark:hover:bg-slate-800/80"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-6 w-4.5 rounded-[2px] border-2 transition-colors",
                    tempOrientation === "portrait"
                      ? "border-[#0078d4]"
                      : "border-slate-800 dark:border-slate-300"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-semibold",
                    tempOrientation === "portrait"
                      ? "text-[#0078d4]"
                      : "text-slate-800 dark:text-slate-200"
                  )}
                >
                  Portrait
                </span>
              </div>
              {tempOrientation === "portrait" && (
                <Check className="h-4 w-4 text-[#0078d4] stroke-[2.5]" />
              )}
            </button>

            {/* Landscape Card */}
            <button
              type="button"
              onClick={() => setTempOrientation("landscape")}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors border",
                tempOrientation === "landscape"
                  ? "border-blue-300 bg-[#edf5fc] dark:border-blue-600 dark:bg-blue-950/50"
                  : "border-transparent bg-transparent hover:bg-[#e1f0fb] dark:hover:bg-slate-800/80"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-4.5 w-6 rounded-[2px] border-2 transition-colors",
                    tempOrientation === "landscape"
                      ? "border-[#0078d4]"
                      : "border-slate-800 dark:border-slate-300"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-semibold",
                    tempOrientation === "landscape"
                      ? "text-[#0078d4]"
                      : "text-slate-800 dark:text-slate-200"
                  )}
                >
                  Landscape
                </span>
              </div>
              {tempOrientation === "landscape" && (
                <Check className="h-4 w-4 text-[#0078d4] stroke-[2.5]" />
              )}
            </button>
          </div>

          <div className="border-t border-slate-200/80 dark:border-slate-800 my-2.5" />

          {/* APPLY TO */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              APPLY TO
            </div>
            <div className="space-y-2">
              {/* Whole Document */}
              <div
                onClick={() => setApplyTarget("all")}
                className="flex items-center gap-2.5 cursor-pointer py-0.5 select-none group"
              >
                <div
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full border transition-colors",
                    applyTarget === "all"
                      ? "border-[#0078d4] bg-white dark:bg-slate-900 border-2"
                      : "border-slate-400 group-hover:border-slate-600 dark:border-slate-500"
                  )}
                >
                  {applyTarget === "all" && (
                    <div className="h-2 w-2 rounded-full bg-[#0078d4]" />
                  )}
                </div>
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  Whole Document
                </span>
              </div>

              {/* This Page */}
              <div
                onClick={() => setApplyTarget("page")}
                className="flex items-center gap-2.5 cursor-pointer py-0.5 select-none group"
              >
                <div
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full border transition-colors",
                    applyTarget === "page"
                      ? "border-[#0078d4] bg-white dark:bg-slate-900 border-2"
                      : "border-slate-400 group-hover:border-slate-600 dark:border-slate-500"
                  )}
                >
                  {applyTarget === "page" && (
                    <div className="h-2 w-2 rounded-full bg-[#0078d4]" />
                  )}
                </div>
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  This Page
                </span>
              </div>

              {/* Current Section */}
              <div
                onClick={() => setApplyTarget("section")}
                className="flex items-center gap-2.5 cursor-pointer py-0.5 select-none group"
              >
                <div
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full border transition-colors",
                    applyTarget === "section"
                      ? "border-[#0078d4] bg-white dark:bg-slate-900 border-2"
                      : "border-slate-400 group-hover:border-slate-600 dark:border-slate-500"
                  )}
                >
                  {applyTarget === "section" && (
                    <div className="h-2 w-2 rounded-full bg-[#0078d4]" />
                  )}
                </div>
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  Current Section
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200/80 dark:border-slate-800 my-2.5" />

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleCancelOrientation}
              className="h-7 px-3 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyOrientation}
              className="h-7 px-4 rounded-md bg-[#0078d4] text-xs font-semibold text-white hover:bg-[#006abc] shadow-xs transition-colors"
            >
              Apply
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* SIZE */}
      <DropdownMenu>
        <DropdownMenuTrigger render={<button type="button" className={triggerClass} title="Paper Size">
            <FileText className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
            <span>Size</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>} />
        <DropdownMenuContent align="start" className="w-64 text-xs">
          {/* Search Filter Box */}
          <div className="p-1.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
              <Search className="h-3 w-3 text-slate-400" />
              <input
                type="text"
                value={sizeSearch}
                onChange={(e) => setSizeSearch(e.target.value)}
                placeholder="Search paper size..."
                className="w-full bg-transparent text-xs outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {filteredPaperSizes.map((ps) => {
              const isSelected =
                (!activeSection?.paperSize && ps.name === "Letter") ||
                activeSection?.paperSize?.name === ps.name;

              return (
                <DropdownMenuItem
                  key={ps.name}
                  onClick={() =>
                    applyToSection({
                      paperSize: { name: ps.name, width: ps.width, height: ps.height },
                    })
                  }
                  className="flex justify-between items-center py-1.5 cursor-pointer"
                >
                  <div>
                    <div className="font-semibold">{ps.name}</div>
                    <div className="text-[10px] text-slate-400">{ps.dimText}</div>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-blue-600" />}
                </DropdownMenuItem>
              );
            })}
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setCustomSizeDialogOpen(true)}
            className="text-blue-600 font-medium cursor-pointer"
          >
            Custom Page Size...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* COLUMNS */}
      <DropdownMenu>
        <DropdownMenuTrigger render={<button type="button" className={triggerClass} title="Columns">
            <Columns2 className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
            <span>Columns</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>} />
        <DropdownMenuContent align="start" className="w-48 text-xs">
          <DropdownMenuItem
            onClick={() => applyToAllSections({ columns: { type: "one", count: 1 } })}
            className="flex justify-between items-center cursor-pointer"
          >
            <span>One</span>
            {(!activeSection?.columns || activeSection?.columns?.type === "one" || activeSection?.columns?.count === 1) && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => applyToAllSections({ columns: { type: "two", count: 2, gap: 32 } })}
            className="flex justify-between items-center cursor-pointer"
          >
            <span>Two</span>
            {(activeSection?.columns?.type === "two" || (activeSection?.columns?.count === 2 && activeSection?.columns?.type !== "left" && activeSection?.columns?.type !== "right")) && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => applyToAllSections({ columns: { type: "three", count: 3, gap: 24 } })}
            className="flex justify-between items-center cursor-pointer"
          >
            <span>Three</span>
            {(activeSection?.columns?.type === "three" || activeSection?.columns?.count === 3) && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => applyToAllSections({ columns: { type: "left", count: 2, gap: 32 } })}
            className="flex justify-between items-center cursor-pointer"
          >
            <span>Left (Narrow Left)</span>
            {activeSection?.columns?.type === "left" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => applyToAllSections({ columns: { type: "right", count: 2, gap: 32 } })}
            className="flex justify-between items-center cursor-pointer"
          >
            <span>Right (Narrow Right)</span>
            {activeSection?.columns?.type === "right" && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Microsoft Word-Style Column Break Option */}
          <DropdownMenuItem
            onClick={() => insertColumnBreak()}
            className="flex items-center justify-between cursor-pointer text-slate-700 dark:text-slate-200"
          >
            <span>Column Break</span>
            <span className="text-[10px] text-slate-400">Ctrl+Shift+Enter</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={openCustomColumnsDialog}
            className="text-blue-600 font-medium cursor-pointer"
          >
            More Columns...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RibbonDivider />

      {/* =======================================================
          GROUP 3: WATERMARK, PAGE COLOR, PAGE BORDERS
      ======================================================= */}

      {/* WATERMARK */}
      <DropdownMenu>
        <DropdownMenuTrigger render={<button type="button" className={triggerClass} title="Watermark">
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
          </button>} />
        <DropdownMenuContent align="start" className="w-52 text-xs">
          <DropdownMenuItem
            onClick={() =>
              applyToSection({
                watermark: { text: "CONFIDENTIAL", opacity: 0.12, rotation: "diagonal" },
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
              applyToSection({
                watermark: { text: "DO NOT COPY", opacity: 0.12, rotation: "diagonal" },
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
              applyToSection({
                watermark: { text: "DRAFT", opacity: 0.12, rotation: "diagonal" },
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
              applyToSection({
                watermark: { text: "URGENT", opacity: 0.12, rotation: "diagonal" },
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
              if (activeSection?.watermark?.image) {
                setWatermarkType("image");
                setWmImageUrl(activeSection.watermark.image);
                setWmOpacity(Math.round((activeSection.watermark.opacity ?? 0.5) * 100));
                setWmImageRotation(
                  typeof activeSection.watermark.rotation === "number"
                    ? activeSection.watermark.rotation
                    : activeSection.watermark.rotation === "diagonal"
                    ? -45
                    : 0
                );
                setWmImageScale(String(activeSection.watermark.scale ?? "100"));
              } else {
                setWatermarkType("text");
                setWmText(activeSection?.watermark?.text || "CONFIDENTIAL");
                setWmOpacity(Math.round((activeSection?.watermark?.opacity ?? 0.15) * 100));
              }
              setWatermarkDialogOpen(true);
            }}
            className="text-blue-600 font-medium cursor-pointer"
          >
            Custom Watermark...
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => applyToSection({ watermark: undefined })}
            className="text-red-600 cursor-pointer"
          >
            Remove Watermark
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* PAGE COLOR */}
      <DropdownMenu>
        <DropdownMenuTrigger render={<button type="button" className={triggerClass} title="Page Color">
            <Palette className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
            <span>Page Color</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>} />
        <DropdownMenuContent align="start" className="w-56 p-2 text-xs">
          <DropdownMenuLabel className="text-[11px] text-slate-500 font-semibold mb-2">
            Page Background Color
          </DropdownMenuLabel>
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            {[
              { color: "#ffffff", label: "White" },
              { color: "#f8fafc", label: "Light Gray" },
              { color: "#eff6ff", label: "Light Blue" },
              { color: "#fefce8", label: "Light Yellow" },
              { color: "#f0fdf4", label: "Light Green" },
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
                onClick={() => applyToSection({ pageColor: color })}
                className={`h-6 w-6 rounded border shadow-xs transition-transform hover:scale-110 cursor-pointer ${
                  activeSection?.pageColor === color ? "ring-2 ring-blue-500" : "border-slate-300"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <Label className="text-[11px] text-slate-500">Custom:</Label>
            <input
              type="color"
              value={activeSection?.pageColor || "#ffffff"}
              onChange={(e) => applyToSection({ pageColor: e.target.value })}
              className="h-6 w-8 cursor-pointer rounded border border-slate-300"
            />
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => applyToSection({ pageColor: "#ffffff" })}
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
          const effectiveBorder =
            activePageObj?.pageBorders ?? activeSection?.pageBorders;

          if (
            effectiveBorder &&
            effectiveBorder.setting !== "none" &&
            effectiveBorder.style !== "none"
          ) {
            const hasCustomSides =
              effectiveBorder.top === false ||
              effectiveBorder.bottom === false ||
              effectiveBorder.left === false ||
              effectiveBorder.right === false;

            const inferredSetting =
              effectiveBorder.setting ||
              (effectiveBorder.style === "shadow"
                ? "shadow"
                : effectiveBorder.style === "3d"
                ? "3d"
                : hasCustomSides
                ? "custom"
                : "box");

            setBorderSetting(inferredSetting);

            const inferredLineStyle =
              effectiveBorder.lineStyle ||
              (effectiveBorder.style === "dashed"
                ? "dashed"
                : effectiveBorder.style === "dotted"
                ? "dotted"
                : effectiveBorder.style === "double"
                ? "double"
                : effectiveBorder.style === "dash-dot"
                ? "dash-dot"
                : effectiveBorder.style === "thick-solid"
                ? "thick-solid"
                : "solid");

            setBorderStyle(inferredLineStyle);
            setBorderColor(effectiveBorder.color || "#000000");
            setBorderWidth(effectiveBorder.width ?? 2);
            setBorderTop(effectiveBorder.top ?? true);
            setBorderBottom(effectiveBorder.bottom ?? true);
            setBorderLeft(effectiveBorder.left ?? true);
            setBorderRight(effectiveBorder.right ?? true);
            const dist = effectiveBorder.distance ?? { top: 24, bottom: 24, left: 24, right: 24 };
            setBorderDistanceTop(dist.top ?? 24);
            setBorderDistanceBottom(dist.bottom ?? 24);
            setBorderDistanceLeft(dist.left ?? 24);
            setBorderDistanceRight(dist.right ?? 24);

            const rawApplyTo = effectiveBorder.applyTo;
            const validApplyTo: "document" | "section" | "page" | "firstPage" | "exceptFirstPage" =
              rawApplyTo === "page" ||
              rawApplyTo === "section" ||
              rawApplyTo === "firstPage" ||
              rawApplyTo === "exceptFirstPage" ||
              rawApplyTo === "document"
                ? rawApplyTo
                : activePageObj?.pageBorders
                ? "page"
                : "document";
            setBorderApplyTo(validApplyTo);
            setArtBorder(effectiveBorder.art || "none");
          } else {
            setBorderSetting("none");
            setBorderStyle("solid");
            setBorderColor("#000000");
            setBorderWidth(2);
            setBorderTop(false);
            setBorderBottom(false);
            setBorderLeft(false);
            setBorderRight(false);
            setBorderDistanceTop(24);
            setBorderDistanceBottom(24);
            setBorderDistanceLeft(24);
            setBorderDistanceRight(24);
            setBorderApplyTo(activePageObj?.pageBorders ? "page" : "document");
            setArtBorder("none");
          }
          setBordersDialogOpen(true);
        }}
        className={triggerClass}
        title="Page Borders"
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

      {/* 3. Page Number Format Dialog */}
      <Dialog open={pageNumberFormatOpen} onOpenChange={setPageNumberFormatOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              Page Number Format
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold mb-1 block">Number Format:</Label>
              <select
                value={formatChoice}
                onChange={(e) =>
                  setFormatChoice(e.target.value as "1" | "a" | "A" | "i" | "I")
                }
                className="w-full h-8 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              >
                <option value="1">1, 2, 3, ...</option>
                <option value="a">a, b, c, ...</option>
                <option value="A">A, B, C, ...</option>
                <option value="i">i, ii, iii, ...</option>
                <option value="I">I, II, III, ...</option>
              </select>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
              <Label className="text-xs font-semibold mb-2 block">Page Numbering:</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pageNumbering"
                    checked={numberingMode === "continue"}
                    onChange={() => setNumberingMode("continue")}
                    className="text-blue-600"
                  />
                  <span>Continue from previous section</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pageNumbering"
                    checked={numberingMode === "startAt"}
                    onChange={() => setNumberingMode("startAt")}
                    className="text-blue-600"
                  />
                  <span>Start at:</span>
                  <input
                    type="number"
                    min={1}
                    value={startAtValue}
                    onChange={(e) =>
                      setStartAtValue(Math.max(1, parseInt(e.target.value, 10) || 1))
                    }
                    disabled={numberingMode !== "startAt"}
                    className="w-16 h-7 px-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 disabled:opacity-50"
                  />
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumberFormatOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleApplyPageNumberFormat}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Custom Margins Dialog */}
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
                min="0.1"
                max="5"
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
                min="0.1"
                max="5"
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
                min="0.1"
                max="5"
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
                min="0.1"
                max="5"
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
            <Button size="sm" onClick={handleApplyCustomMargins}>
              Apply Margins
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. Custom Page Size Dialog */}
      <Dialog open={customSizeDialogOpen} onOpenChange={setCustomSizeDialogOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              Custom Page Size (inches)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Width (in)</Label>
              <Input
                type="number"
                step="0.1"
                min="1"
                max="50"
                value={customWidthInches}
                onChange={(e) => setCustomWidthInches(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Height (in)</Label>
              <Input
                type="number"
                step="0.1"
                min="1"
                max="50"
                value={customHeightInches}
                onChange={(e) => setCustomHeightInches(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCustomSizeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleApplyCustomSize}>
              Apply Size
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 6. Custom Columns Dialog */}
      <Dialog open={columnsDialogOpen} onOpenChange={setColumnsDialogOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Columns Setup</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Number of Columns (1–5)</Label>
              <Input
                type="number"
                min="1"
                max="5"
                value={customColumnCount}
                onChange={(e) => setCustomColumnCount(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Spacing / Gap (px)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={customColumnGap}
                onChange={(e) => setCustomColumnGap(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setColumnsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleApplyCustomColumns}>
              Apply Columns
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 7. Custom Watermark Dialog */}
      <Dialog open={watermarkDialogOpen} onOpenChange={setWatermarkDialogOpen}>
        <DialogContent
          className="!max-w-[760px] !w-[760px] max-h-[90vh] overflow-y-auto"
          style={{ maxWidth: "760px", width: "95vw" }}
        >
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">
              Watermark Configuration
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-6 py-2 text-xs items-stretch">
            {/* Left: Configuration Controls */}
            <div className="w-full sm:w-[380px] flex-shrink-0 space-y-4">
              {/* Tabs for Text vs Image */}
              <div className="flex rounded-md bg-slate-100 dark:bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setWatermarkType("text")}
                  className={`flex-1 py-1.5 text-center font-medium rounded transition-colors ${
                    watermarkType === "text"
                      ? "bg-white dark:bg-slate-900 shadow-xs text-blue-600 font-semibold"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Text Watermark
                </button>
                <button
                  type="button"
                  onClick={() => setWatermarkType("image")}
                  className={`flex-1 py-1.5 text-center font-medium rounded transition-colors ${
                    watermarkType === "image"
                      ? "bg-white dark:bg-slate-900 shadow-xs text-blue-600 font-semibold"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  Picture Watermark
                </button>
              </div>

              {watermarkType === "text" ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs mb-1 block">Text</Label>
                    <Input
                      value={wmText}
                      onChange={(e) => setWmText(e.target.value)}
                      placeholder="e.g. CONFIDENTIAL"
                      className="text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs mb-1 block">Font</Label>
                      <select
                        value={wmFont}
                        onChange={(e) => setWmFont(e.target.value)}
                        className="w-full h-8 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      >
                        <option value="Calibri">Calibri</option>
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Courier New">Courier New</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Size</Label>
                      <select
                        value={wmFontSize}
                        onChange={(e) => setWmFontSize(e.target.value)}
                        className="w-full h-8 px-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      >
                        <option value="auto">Auto</option>
                        <option value="36">36 pt</option>
                        <option value="48">48 pt</option>
                        <option value="60">60 pt</option>
                        <option value="72">72 pt</option>
                        <option value="96">96 pt</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-center">
                    <div>
                      <Label className="text-xs mb-1 block">Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={wmColor}
                          onChange={(e) => setWmColor(e.target.value)}
                          className="h-7 w-10 cursor-pointer rounded border border-slate-300"
                        />
                        <span className="font-mono text-[11px] text-slate-500">
                          {wmColor}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">
                        Opacity: {wmOpacity}%
                      </Label>
                      <input
                        type="range"
                        min={5}
                        max={100}
                        value={wmOpacity}
                        onChange={(e) => setWmOpacity(parseInt(e.target.value, 10))}
                        className="w-full cursor-pointer accent-sky-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs mb-1 block">Layout / Rotation</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="wmRot"
                          checked={wmRotation === "diagonal"}
                          onChange={() => setWmRotation("diagonal")}
                          className="text-blue-600"
                        />
                        <span>Diagonal (-35°)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="wmRot"
                          checked={wmRotation === "horizontal"}
                          onChange={() => setWmRotation("horizontal")}
                          className="text-blue-600"
                        />
                        <span>Horizontal (0°)</span>
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 1. Select Image File */}
                  <div>
                    <Label className="text-xs font-semibold mb-2 block">
                      Select Image File
                    </Label>
                    <div className="flex items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-8 px-3.5 text-xs font-medium bg-[#1d8cd7] hover:bg-[#157bbd] text-white cursor-pointer rounded shadow-xs"
                      >
                        Choose File
                      </Button>
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                        {wmFileName || "No file chosen"}
                      </span>
                    </div>
                  </div>

                  {/* 2. Rotation & Scale (Size) */}
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <div>
                      <Label className="text-xs font-semibold mb-1.5 block">
                        Rotation
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={-90}
                          max={90}
                          step={5}
                          value={wmImageRotation}
                          onChange={(e) => setWmImageRotation(parseInt(e.target.value, 10))}
                          className="w-full cursor-pointer accent-sky-500"
                        />
                        <span className="text-xs font-mono text-slate-600 dark:text-slate-300 w-8 text-right">
                          {wmImageRotation}°
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold mb-1.5 block">
                        Scale (Size)
                      </Label>
                      <select
                        value={wmImageScale}
                        onChange={(e) => setWmImageScale(e.target.value)}
                        className="w-full h-8 px-2.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                      >
                        <option value="auto">Auto</option>
                        <option value="500">500%</option>
                        <option value="200">200%</option>
                        <option value="150">150%</option>
                        <option value="100">100%</option>
                        <option value="50">50%</option>
                      </select>
                    </div>
                  </div>

                  {/* 3. Opacity / Transparency Card */}
                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/60 dark:bg-slate-900/40 space-y-2">
                    <Label className="text-xs font-semibold block">
                      Opacity / Transparency
                    </Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={5}
                        max={100}
                        step={5}
                        value={wmOpacity}
                        onChange={(e) => setWmOpacity(parseInt(e.target.value, 10))}
                        className="w-full cursor-pointer accent-sky-500"
                      />
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-300 w-8 text-right">
                        {wmOpacity}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Live Preview Box */}
            <div className="flex-1 min-w-[260px] flex flex-col items-center justify-center">
              <div
                className="w-full h-full min-h-[350px] rounded-xl border border-slate-700/60 p-5 flex flex-col items-center justify-center shadow-lg relative select-none"
                style={{ backgroundColor: "#0c1421" }}
              >
                <div className="text-[11px] uppercase font-bold tracking-[0.2em] text-slate-400 mb-5 text-center">
                  LIVE PREVIEW
                </div>

                {/* White Document Page */}
                <div
                  className="w-44 h-60 rounded-xs shadow-2xl relative overflow-hidden flex flex-col pt-4 px-3.5 pb-3 select-none"
                  style={{
                    backgroundColor: "#ffffff",
                    boxSizing: "border-box",
                    borderTop:
                      activeSection?.pageBorders &&
                      activeSection.pageBorders.style !== "none" &&
                      (activeSection.pageBorders.top ?? true)
                        ? `${activeSection.pageBorders.width || 1}px ${activeSection.pageBorders.style || "solid"} ${activeSection.pageBorders.color || "#000000"}`
                        : "none",
                    borderBottom:
                      activeSection?.pageBorders &&
                      activeSection.pageBorders.style !== "none" &&
                      (activeSection.pageBorders.bottom ?? true)
                        ? `${activeSection.pageBorders.width || 1}px ${activeSection.pageBorders.style || "solid"} ${activeSection.pageBorders.color || "#000000"}`
                        : "none",
                    borderLeft:
                      activeSection?.pageBorders &&
                      activeSection.pageBorders.style !== "none" &&
                      (activeSection.pageBorders.left ?? true)
                        ? `${activeSection.pageBorders.width || 1}px ${activeSection.pageBorders.style || "solid"} ${activeSection.pageBorders.color || "#000000"}`
                        : "none",
                    borderRight:
                      activeSection?.pageBorders &&
                      activeSection.pageBorders.style !== "none" &&
                      (activeSection.pageBorders.right ?? true)
                        ? `${activeSection.pageBorders.width || 1}px ${activeSection.pageBorders.style || "solid"} ${activeSection.pageBorders.color || "#000000"}`
                        : "none",
                    boxShadow:
                      activeSection?.pageBorders?.style === "shadow"
                        ? "0 10px 25px -5px rgba(0,0,0,0.5), 6px 6px 0px rgba(0,0,0,0.35)"
                        : "0 10px 25px -5px rgba(0,0,0,0.4)",
                  }}
                >
                  {/* Skeleton Document Lines */}
                  <div className="space-y-2 pointer-events-none select-none z-10 w-full">
                    <div className="h-3 w-20 bg-slate-200/90 rounded-full mb-3" />
                    <div className="h-1.5 w-full bg-slate-100 rounded-full" />
                    <div className="h-1.5 w-full bg-slate-100 rounded-full" />
                    <div className="h-1.5 w-[72%] bg-slate-100 rounded-full" />
                    <div className="h-1.5 w-[94%] bg-slate-100 rounded-full" />
                    <div className="h-1.5 w-[60%] bg-slate-100 rounded-full" />
                  </div>

                  {/* Watermark Overlay on Document Page */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-20 p-2">
                    {watermarkType === "text" ? (
                      <span
                        style={{
                          fontFamily: wmFont,
                          fontSize:
                            wmFontSize === "auto"
                              ? "16px"
                              : `${Math.min(22, Math.max(11, parseInt(wmFontSize, 10) / 3))}px`,
                          fontWeight: 700,
                          color: wmColor,
                          opacity: wmOpacity / 100,
                          transform: `rotate(${wmRotation === "diagonal" ? -35 : 0}deg)`,
                          userSelect: "none",
                          textTransform: "uppercase",
                          textAlign: "center",
                          lineHeight: 1.1,
                          wordBreak: "break-word",
                          maxWidth: "90%",
                          display: "block",
                        }}
                      >
                        {wmText || "PREVIEW"}
                      </span>
                    ) : wmImageUrl ? (
                      <img
                        src={wmImageUrl}
                        alt="Preview"
                        className="max-h-36 max-w-[85%] object-contain"
                        style={{
                          opacity: wmOpacity / 100,
                          transform: `rotate(${wmImageRotation}deg) scale(${
                            wmImageScale === "auto" ? 1 : Number(wmImageScale) / 100
                          })`,
                        }}
                      />
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">No image chosen</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWatermarkDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleApplyCustomWatermark}>
              Apply Watermark
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 8. Page Borders Dialog */}
      <Dialog open={bordersDialogOpen} onOpenChange={setBordersDialogOpen}>
        <DialogContent
          className="!max-w-[820px] !w-[820px] sm:!max-w-[820px] sm:!w-[820px] max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800"
          style={{ maxWidth: "820px", width: "95vw" }}
        >
          <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
            <DialogTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <svg
                className="h-4 w-4 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
              </svg>
              Page Borders
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 min-h-0">
            <div className="flex flex-row gap-5 text-xs items-stretch">
              {/* Column 1: SETTING */}
              <div className="w-[125px] flex-shrink-0 border-r border-slate-200/90 dark:border-slate-800 pr-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Setting
                </div>
                <div className="space-y-1.5">
                  {(
                    [
                      { id: "none", label: "None" },
                      { id: "box", label: "Box" },
                      { id: "shadow", label: "Shadow" },
                      { id: "3d", label: "3-D" },
                      { id: "custom", label: "Custom" },
                    ] as const
                  ).map(({ id, label }) => {
                    const isSelected = borderSetting === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setBorderSetting(id);
                          if (id === "none") {
                            setBorderTop(false);
                            setBorderBottom(false);
                            setBorderLeft(false);
                            setBorderRight(false);
                          } else if (id === "custom") {
                            if (!borderTop && !borderBottom && !borderLeft && !borderRight) {
                              setBorderTop(true);
                              setBorderBottom(true);
                              setBorderLeft(true);
                              setBorderRight(true);
                            }
                          } else {
                            setBorderTop(true);
                            setBorderBottom(true);
                            setBorderLeft(true);
                            setBorderRight(true);
                          }
                        }}
                        className={`w-full text-left px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#E1F0FF] border border-[#0078D4] text-slate-900 font-semibold shadow-xs dark:bg-blue-950/60 dark:text-blue-200 dark:border-blue-500"
                            : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Column 2: Controls */}
              <div className="flex-1 min-w-[240px] px-1 space-y-3">
                {/* Style */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Style
                  </label>
                  <div className="relative">
                    <select
                      value={borderStyle}
                      onChange={(e) => {
                        const nextStyle = e.target.value as "solid" | "dashed" | "dotted" | "double" | "dash-dot" | "thick-solid";
                        setBorderStyle(nextStyle);
                        if (borderSetting === "none") {
                          setBorderSetting("box");
                          setBorderTop(true);
                          setBorderBottom(true);
                          setBorderLeft(true);
                          setBorderRight(true);
                        }
                      }}
                      className="w-full h-8 px-2.5 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none appearance-none cursor-pointer focus:border-[#0078D4]"
                    >
                      <option value="solid">───── Solid</option>
                      <option value="dashed">- - - - - - Dashed</option>
                      <option value="dotted">············ Dotted</option>
                      <option value="double">══════ Double</option>
                      <option value="dash-dot">─ · ─ · ─ Dash-Dot</option>
                      <option value="thick-solid">━━━━━━ Thick Solid</option>
                    </select>
                    <ChevronDown className="h-4 w-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Color with Word Preset Palette */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Color
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    {[
                      { name: "Black", hex: "#000000" },
                      { name: "White", hex: "#FFFFFF" },
                      { name: "Gray", hex: "#6B7280" },
                      { name: "Red", hex: "#EF4444" },
                      { name: "Blue", hex: "#2563EB" },
                      { name: "Green", hex: "#10B981" },
                      { name: "Yellow", hex: "#F59E0B" },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        title={c.name}
                        onClick={() => setBorderColor(c.hex)}
                        className={`h-5 w-5 rounded-full border transition-transform hover:scale-110 cursor-pointer ${
                          borderColor.toLowerCase() === c.hex.toLowerCase()
                            ? "ring-2 ring-blue-500 scale-110"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="relative w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden flex-shrink-0 cursor-pointer flex items-center justify-center p-0.5 shadow-xs">
                      <input
                        type="color"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div
                        className="w-full h-full rounded-xs"
                        style={{ backgroundColor: borderColor }}
                      />
                    </div>
                    <input
                      type="text"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono uppercase bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-[#0078D4]"
                    />
                  </div>
                </div>

                {/* Width & Art */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Width
                    </label>
                    <div className="relative">
                      <select
                        value={borderWidth}
                        onChange={(e) => setBorderWidth(parseFloat(e.target.value))}
                        className="w-full h-8 px-2.5 pr-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none appearance-none cursor-pointer focus:border-[#0078D4]"
                      >
                        <option value={1}>0.5 pt</option>
                        <option value={1.5}>0.75 pt</option>
                        <option value={2}>1 pt</option>
                        <option value={3}>1.5 pt</option>
                        <option value={4}>2.25 pt</option>
                        <option value={6}>3 pt</option>
                        <option value={8}>4.5 pt</option>
                        <option value={10}>6 pt</option>
                      </select>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Art
                    </label>
                    <div className="relative">
                      <select
                        value={artBorder}
                        onChange={(e) => setArtBorder(e.target.value)}
                        className="w-full h-8 px-2.5 pr-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none appearance-none cursor-pointer focus:border-[#0078D4]"
                      >
                        <option value="none">None</option>
                      </select>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Distance Options (Word Distance from Page Edge) */}
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-2.5 bg-slate-50/70 dark:bg-slate-900/50">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Distance from Edge (px)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10.5px] text-slate-500">Top:</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={borderDistanceTop}
                        onChange={(e) => setBorderDistanceTop(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="w-16 h-7 px-1.5 text-right rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10.5px] text-slate-500">Bottom:</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={borderDistanceBottom}
                        onChange={(e) => setBorderDistanceBottom(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="w-16 h-7 px-1.5 text-right rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10.5px] text-slate-500">Left:</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={borderDistanceLeft}
                        onChange={(e) => setBorderDistanceLeft(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="w-16 h-7 px-1.5 text-right rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10.5px] text-slate-500">Right:</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={borderDistanceRight}
                        onChange={(e) => setBorderDistanceRight(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="w-16 h-7 px-1.5 text-right rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Apply To */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Apply To
                  </label>
                  <div className="relative">
                    <select
                      value={borderApplyTo}
                      onChange={(e) =>
                        setBorderApplyTo(
                          e.target.value as
                            | "document"
                            | "section"
                            | "page"
                            | "firstPage"
                            | "exceptFirstPage"
                        )
                      }
                      className="w-full h-8 px-2.5 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 outline-none appearance-none cursor-pointer focus:border-[#0078D4]"
                    >
                      <option value="document">Whole Document</option>
                      <option value="section">Current Section</option>
                      <option value="page">Current Page</option>
                      <option value="firstPage">This section - First page only</option>
                      <option value="exceptFirstPage">This section - All except first page</option>
                    </select>
                    <ChevronDown className="h-4 w-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Column 3: PREVIEW Card */}
              <div className="w-[250px] flex-shrink-0 bg-[#F2F7FC] dark:bg-[#0c1421] rounded-2xl p-4 border border-[#E1EDF8] dark:border-slate-800 flex flex-col items-center justify-between shadow-xs">
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 text-center mb-2">
                  PREVIEW
                </div>

                <div className="relative flex items-center justify-center my-2">
                  {/* T Button */}
                  <button
                    type="button"
                    title="Toggle Top Border"
                    onClick={() => {
                      const next = !borderTop;
                      setBorderTop(next);
                      if (!next && !borderBottom && !borderLeft && !borderRight) {
                        setBorderSetting("none");
                      } else if (borderSetting === "none") {
                        setBorderSetting("custom");
                      } else if (borderSetting === "box" || borderSetting === "shadow" || borderSetting === "3d") {
                        if (!next || !borderBottom || !borderLeft || !borderRight) setBorderSetting("custom");
                      }
                    }}
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 z-30 w-6 h-6 rounded flex items-center justify-center font-bold text-xs cursor-pointer shadow-xs transition-colors ${
                      borderTop && borderSetting !== "none"
                        ? "bg-[#0078D4] text-white hover:bg-[#006CBD]"
                        : "bg-slate-200 text-slate-500 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-400"
                    }`}
                  >
                    T
                  </button>

                  {/* B Button */}
                  <button
                    type="button"
                    title="Toggle Bottom Border"
                    onClick={() => {
                      const next = !borderBottom;
                      setBorderBottom(next);
                      if (!borderTop && !next && !borderLeft && !borderRight) {
                        setBorderSetting("none");
                      } else if (borderSetting === "none") {
                        setBorderSetting("custom");
                      } else if (borderSetting === "box" || borderSetting === "shadow" || borderSetting === "3d") {
                        if (!borderTop || !next || !borderLeft || !borderRight) setBorderSetting("custom");
                      }
                    }}
                    className={`absolute -bottom-3 left-1/2 -translate-x-1/2 z-30 w-6 h-6 rounded flex items-center justify-center font-bold text-xs cursor-pointer shadow-xs transition-colors ${
                      borderBottom && borderSetting !== "none"
                        ? "bg-[#0078D4] text-white hover:bg-[#006CBD]"
                        : "bg-slate-200 text-slate-500 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-400"
                    }`}
                  >
                    B
                  </button>

                  {/* L Button */}
                  <button
                    type="button"
                    title="Toggle Left Border"
                    onClick={() => {
                      const next = !borderLeft;
                      setBorderLeft(next);
                      if (!borderTop && !borderBottom && !next && !borderRight) {
                        setBorderSetting("none");
                      } else if (borderSetting === "none") {
                        setBorderSetting("custom");
                      } else if (borderSetting === "box" || borderSetting === "shadow" || borderSetting === "3d") {
                        if (!borderTop || !borderBottom || !next || !borderRight) setBorderSetting("custom");
                      }
                    }}
                    className={`absolute top-1/2 -left-3 -translate-y-1/2 z-30 w-6 h-6 rounded flex items-center justify-center font-bold text-xs cursor-pointer shadow-xs transition-colors ${
                      borderLeft && borderSetting !== "none"
                        ? "bg-[#0078D4] text-white hover:bg-[#006CBD]"
                        : "bg-slate-200 text-slate-500 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-400"
                    }`}
                  >
                    L
                  </button>

                  {/* R Button */}
                  <button
                    type="button"
                    title="Toggle Right Border"
                    onClick={() => {
                      const next = !borderRight;
                      setBorderRight(next);
                      if (!borderTop && !borderBottom && !borderLeft && !next) {
                        setBorderSetting("none");
                      } else if (borderSetting === "none") {
                        setBorderSetting("custom");
                      } else if (borderSetting === "box" || borderSetting === "shadow" || borderSetting === "3d") {
                        if (!borderTop || !borderBottom || !borderLeft || !next) setBorderSetting("custom");
                      }
                    }}
                    className={`absolute top-1/2 -right-3 -translate-y-1/2 z-30 w-6 h-6 rounded flex items-center justify-center font-bold text-xs cursor-pointer shadow-xs transition-colors ${
                      borderRight && borderSetting !== "none"
                        ? "bg-[#0078D4] text-white hover:bg-[#006CBD]"
                        : "bg-slate-200 text-slate-500 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-400"
                    }`}
                  >
                    R
                  </button>

                  {/* Miniature Document Sheet with Interactive Clickable Sides */}
                  <div
                    className="w-36 h-48 rounded-xs bg-white dark:bg-slate-900 relative overflow-hidden flex flex-col pt-3.5 px-3 pb-3 transition-all select-none cursor-pointer"
                    style={{
                      boxSizing: "border-box",
                      borderTop:
                        borderTop && borderSetting !== "none"
                          ? `${borderStyle === "thick-solid" ? Math.max(3, borderWidth * 1.5) : borderStyle === "double" ? Math.max(3, borderWidth) : borderWidth}px ${borderSetting === "3d" ? "inset" : borderStyle === "dash-dot" ? "dashed" : borderStyle === "thick-solid" ? "solid" : borderStyle} ${borderColor}`
                          : "none",
                      borderBottom:
                        borderBottom && borderSetting !== "none"
                          ? `${borderStyle === "thick-solid" ? Math.max(3, borderWidth * 1.5) : borderStyle === "double" ? Math.max(3, borderWidth) : borderWidth}px ${borderSetting === "3d" ? "inset" : borderStyle === "dash-dot" ? "dashed" : borderStyle === "thick-solid" ? "solid" : borderStyle} ${borderColor}`
                          : "none",
                      borderLeft:
                        borderLeft && borderSetting !== "none"
                          ? `${borderStyle === "thick-solid" ? Math.max(3, borderWidth * 1.5) : borderStyle === "double" ? Math.max(3, borderWidth) : borderWidth}px ${borderSetting === "3d" ? "inset" : borderStyle === "dash-dot" ? "dashed" : borderStyle === "thick-solid" ? "solid" : borderStyle} ${borderColor}`
                          : "none",
                      borderRight:
                        borderRight && borderSetting !== "none"
                          ? `${borderStyle === "thick-solid" ? Math.max(3, borderWidth * 1.5) : borderStyle === "double" ? Math.max(3, borderWidth) : borderWidth}px ${borderSetting === "3d" ? "inset" : borderStyle === "dash-dot" ? "dashed" : borderStyle === "thick-solid" ? "solid" : borderStyle} ${borderColor}`
                          : "none",
                      boxShadow:
                        borderSetting === "shadow"
                          ? "5px 5px 0px rgba(0,0,0,0.85), 0 8px 20px -4px rgba(0,0,0,0.25)"
                          : "0 8px 20px -4px rgba(0,0,0,0.12), 0 2px 6px -1px rgba(0,0,0,0.06)",
                    }}
                  >
                    {/* Clickable side hotspots */}
                    <div
                      className="absolute top-0 left-0 right-0 h-4 cursor-pointer hover:bg-blue-500/15 transition-colors z-20"
                      title="Click to toggle Top border"
                      onClick={() => setBorderTop(!borderTop)}
                    />
                    <div
                      className="absolute bottom-0 left-0 right-0 h-4 cursor-pointer hover:bg-blue-500/15 transition-colors z-20"
                      title="Click to toggle Bottom border"
                      onClick={() => setBorderBottom(!borderBottom)}
                    />
                    <div
                      className="absolute top-0 bottom-0 left-0 w-4 cursor-pointer hover:bg-blue-500/15 transition-colors z-20"
                      title="Click to toggle Left border"
                      onClick={() => setBorderLeft(!borderLeft)}
                    />
                    <div
                      className="absolute top-0 bottom-0 right-0 w-4 cursor-pointer hover:bg-blue-500/15 transition-colors z-20"
                      title="Click to toggle Right border"
                      onClick={() => setBorderRight(!borderRight)}
                    />

                    {/* Skeleton text lines */}
                    <div className="space-y-1.5 pointer-events-none select-none w-full">
                      <div className="h-1.5 w-[65%] bg-slate-200 dark:bg-slate-700 rounded-full mb-2" />
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
                      <div className="h-1.5 w-[85%] bg-slate-100 dark:bg-slate-800 rounded-full" />
                      <div className="h-1.5 w-[70%] bg-slate-100 dark:bg-slate-800 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-2 text-center select-none font-normal">
                  Click sides or T/B/L/R to toggle
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Non-Scrolling Edge-to-Edge Footer - ALWAYS VISIBLE */}
          <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-3.5 bg-slate-50/80 dark:bg-slate-900/90 flex items-center justify-end gap-3 shrink-0 rounded-b-2xl">
            <button
              type="button"
              onClick={() => setBordersDialogOpen(false)}
              className="px-5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium transition-colors cursor-pointer shadow-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyBorders}
              className="px-6 py-2 rounded-lg bg-[#0078D4] hover:bg-[#006CBD] active:bg-[#005A9E] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              OK
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}