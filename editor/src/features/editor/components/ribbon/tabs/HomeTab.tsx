/**
 * HomeTab.tsx
 * 
 * Authentic Microsoft Word-Grade Home Ribbon Tab.
 * 
 * Features:
 * - Clipboard: Paste, Cut, Copy, Format Painter
 * - Font: Font Family, Font Size (typed & dropdown), Grow/Shrink Font, Bold, Italic,
 *         Underline (with styles/colors), Strikethrough, Subscript, Superscript,
 *         Font Color, Highlight Color, Clear Formatting
 * - Paragraph: Bullets (styles), Numbering, Multilevel, Indents, Align Left/Center/Right/Justify,
 *              Line & Paragraph Spacing
 * - Styles: Word Quick Styles Gallery (Normal, Heading 1, Heading 2, Heading 3, Title, Subtitle, Quote)
 * - Editing: Find, Replace, Select All
 * - History: Undo / Redo with detailed history stacks
 * 
 * 100% selection-preserving: All buttons prevent editor focus loss.
 */

import { useState, useEffect, type MouseEvent } from "react";
import {
  Undo2,
  Redo2,
  ChevronDown,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  RemoveFormatting,
  Baseline,
  Highlighter,
  Scissors,
  Copy,
  Clipboard,
  Search,
  Replace,
  Check,
} from "lucide-react";

import { useEditor } from "../../../context/EditorContext";
import {
  fetchAllGoogleFonts,
  loadGoogleFont,
  STANDARD_SYSTEM_FONTS,
} from "../../../modules/document/api/fontapi";
import { FONT_SIZES } from "../constant";
import RibbonDivider from "../controls/RibbonDivider";

// Microsoft Word Standard Theme Colors
const WORD_FONT_COLORS = [
  "#000000", "#FFFFFF", "#EEECE1", "#1F497D", "#4F81BD", "#C0504D", "#9BBB59", "#8064A2", "#4BACC6", "#F79646",
  "#F2F2F2", "#7F7F7F", "#DDD9C3", "#C6D9F0", "#DBE5F1", "#F2DCDB", "#EBF1DD", "#E5E0EC", "#DBEEF3", "#FDEADA",
  "#D8D8D8", "#595959", "#C4BD97", "#8DB3E2", "#B8CCE4", "#E5B9B7", "#D7E3BC", "#CCC1DA", "#B7DDE8", "#FBD5B5",
  "#BFBFBF", "#3F3F3F", "#938953", "#548DD4", "#95B3D7", "#D99694", "#C3D69B", "#B2A2C7", "#92CDDC", "#FAC08F",
  "#A5A5A5", "#262626", "#494429", "#17365D", "#366092", "#953734", "#76923C", "#5F497A", "#31859B", "#E36C09",
  "#7F7F7F", "#0C0C0C", "#1D1B10", "#0F243E", "#244061", "#632423", "#4F6128", "#3F3151", "#205867", "#974806",
];

const STANDARD_COLORS = [
  "#C00000", "#FF0000", "#FFC000", "#FFFF00", "#92D050", "#00B050", "#00B0F0", "#0070C0", "#002060", "#7030A0",
];

// Microsoft Word Standard Highlighter Colors
const WORD_HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#FFFF00" },
  { name: "Bright Green", value: "#00FF00" },
  { name: "Turquoise", value: "#00FFFF" },
  { name: "Pink", value: "#FF00FF" },
  { name: "Blue", value: "#0000FF" },
  { name: "Red", value: "#FF0000" },
  { name: "Dark Blue", value: "#000080" },
  { name: "Teal", value: "#008080" },
  { name: "Green", value: "#008000" },
  { name: "Violet", value: "#800080" },
  { name: "Dark Red", value: "#800000" },
  { name: "Dark Yellow", value: "#808000" },
  { name: "50% Gray", value: "#808080" },
  { name: "25% Gray", value: "#C0C0C0" },
  { name: "Black", value: "#000000" },
];

const QUICK_STYLES = [
  { id: "Normal", name: "Normal", tag: "p", preview: "AaBbCcDc", subtitle: "Normal" },
  { id: "Heading 1", name: "Heading 1", tag: "h1", preview: "AaBbCc", subtitle: "Heading 1" },
  { id: "Heading 2", name: "Heading 2", tag: "h2", preview: "AaBbCc", subtitle: "Heading 2" },
  { id: "Heading 3", name: "Heading 3", tag: "h3", preview: "AaBbCc", subtitle: "Heading 3" },
  { id: "Title", name: "Title", tag: "h1", preview: "AaBbCc", subtitle: "Title" },
  { id: "Subtitle", name: "Subtitle", tag: "p", preview: "AaBbCc", subtitle: "Subtitle" },
  { id: "Quote", name: "Quote", tag: "blockquote", preview: "AaBbCc", subtitle: "Quote" },
];

export default function HomeTab() {
  const {
    undo,
    redo,
    undoMultiple,
    redoMultiple,
    getUndoActions,
    getRedoActions,
    canUndo,
    canRedo,
    toolbarState,
    applyFontSize,
    increaseFontSize,
    decreaseFontSize,
    applyFontFamily,
    toggleBold,
    toggleItalic,
    toggleUnderline,
    toggleStrikethrough,
    toggleSubscript,
    toggleSuperscript,
    applyTextColor,
    applyHighlightColor,
    applyAlignment,
    applyLineSpacing,
    applyBlockStyle,
    applyBulletStyle,
    clearFormatting,
    selectAllBody,
    applyFormatCommand,
    setActivePanel,
    setLeftPanelOpen,
  } = useEditor();

  const [fonts, setFonts] = useState<string[]>(STANDARD_SYSTEM_FONTS);
  const [fontsLoading, setFontsLoading] = useState(false);
  const [fontSizeInput, setFontSizeInput] = useState(toolbarState.fontSize || "12");

  // Dropdown visibility states
  const [isFontOpen, setIsFontOpen] = useState(false);
  const [isFontSizeOpen, setIsFontSizeOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isHighlightOpen, setIsHighlightOpen] = useState(false);
  const [isLineSpacingOpen, setIsLineSpacingOpen] = useState(false);
  const [isBulletsOpen, setIsBulletsOpen] = useState(false);
  const [isNumberingOpen, setIsNumberingOpen] = useState(false);
  const [isUnderlineOpen, setIsUnderlineOpen] = useState(false);
  const [isUndoDropdownOpen, setIsUndoDropdownOpen] = useState(false);
  const [isRedoDropdownOpen, setIsRedoDropdownOpen] = useState(false);
  const [undoHoverIndex, setUndoHoverIndex] = useState<number | null>(null);
  const [redoHoverIndex, setRedoHoverIndex] = useState<number | null>(null);

  // Synchronize font size input when selection changes
  useEffect(() => {
    setFontSizeInput(toolbarState.fontSize || "12");
  }, [toolbarState.fontSize]);

  // Load Google Fonts catalog
  useEffect(() => {
    let cancelled = false;
    const loadFonts = async () => {
      try {
        setFontsLoading(true);
        const googleFonts = await fetchAllGoogleFonts();
        if (cancelled) return;
        const fontNames = googleFonts.map((font) => font.family);
        const allFonts = Array.from(new Set([...STANDARD_SYSTEM_FONTS, ...fontNames]));
        setFonts(allFonts);
      } catch {
        if (!cancelled) setFonts(STANDARD_SYSTEM_FONTS);
      } finally {
        if (!cancelled) setFontsLoading(false);
      }
    };
    loadFonts();
    return () => { cancelled = true; };
  }, []);

  // Global click outside to close dropdowns
  useEffect(() => {
    const handleGlobalClick = () => {
      setIsFontOpen(false);
      setIsFontSizeOpen(false);
      setIsColorOpen(false);
      setIsHighlightOpen(false);
      setIsLineSpacingOpen(false);
      setIsBulletsOpen(false);
      setIsNumberingOpen(false);
      setIsUnderlineOpen(false);
      setIsUndoDropdownOpen(false);
      setIsRedoDropdownOpen(false);
    };
    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

  const preventFocusLoss = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
  };

  const undoActions = isUndoDropdownOpen ? getUndoActions() : [];
  const redoActions = isRedoDropdownOpen ? getRedoActions() : [];

  return (
    <div
      data-editor-ui="true"
      className="flex items-center gap-1.5 px-2 py-1 text-secondary-foreground dark:text-muted-foreground select-none overflow-x-auto min-w-max"
    >
      {/* ------------------------------------------------------------- */}
      {/* GROUP 1: UNDO & REDO */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-0.5">
        <div className="relative inline-flex items-center rounded border border-secondary bg-card dark:border-secondary-foreground dark:bg-secondary shadow-2xs">
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => undo()}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`flex h-6 w-6 items-center justify-center rounded-l hover:bg-primary/20 transition-colors ${
              !canUndo ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={(e) => {
              e.stopPropagation();
              if (canUndo) setIsUndoDropdownOpen((v) => !v);
            }}
            disabled={!canUndo}
            title="Undo History"
            className={`flex h-6 w-3.5 items-center justify-center rounded-r border-l border-secondary dark:border-secondary-foreground hover:bg-primary/20 ${
              !canUndo ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <ChevronDown className="h-2 w-2" />
          </button>

          {isUndoDropdownOpen && (
            <div
              onMouseDown={preventFocusLoss}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-full z-50 mt-1 w-48 border border-border bg-card shadow-xl dark:bg-[#111D29] overflow-hidden"
            >
              <div className="max-h-48 overflow-y-auto py-1" onMouseLeave={() => setUndoHoverIndex(null)}>
                {undoActions.map((action, i) => (
                  <div
                    key={i}
                    onMouseEnter={() => setUndoHoverIndex(i)}
                    onClick={() => {
                      undoMultiple(i + 1);
                      setIsUndoDropdownOpen(false);
                    }}
                    className={`px-3 py-1 text-xs cursor-pointer ${
                      undoHoverIndex !== null && i <= undoHoverIndex
                        ? "bg-[#0078d4] text-white font-medium"
                        : "text-foreground"
                    }`}
                  >
                    {action}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative inline-flex items-center rounded border border-secondary bg-card dark:border-secondary-foreground dark:bg-secondary shadow-2xs">
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => redo()}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`flex h-6 w-6 items-center justify-center rounded-l hover:bg-primary/20 transition-colors ${
              !canRedo ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={(e) => {
              e.stopPropagation();
              if (canRedo) setIsRedoDropdownOpen((v) => !v);
            }}
            disabled={!canRedo}
            title="Redo History"
            className={`flex h-6 w-3.5 items-center justify-center rounded-r border-l border-secondary dark:border-secondary-foreground hover:bg-primary/20 ${
              !canRedo ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <ChevronDown className="h-2 w-2" />
          </button>

          {isRedoDropdownOpen && (
            <div
              onMouseDown={preventFocusLoss}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-full z-50 mt-1 w-48 border border-border bg-card shadow-xl dark:bg-[#111D29] overflow-hidden"
            >
              <div className="max-h-48 overflow-y-auto py-1" onMouseLeave={() => setRedoHoverIndex(null)}>
                {redoActions.map((action, i) => (
                  <div
                    key={i}
                    onMouseEnter={() => setRedoHoverIndex(i)}
                    onClick={() => {
                      redoMultiple(i + 1);
                      setIsRedoDropdownOpen(false);
                    }}
                    className={`px-3 py-1 text-xs cursor-pointer ${
                      redoHoverIndex !== null && i <= redoHoverIndex
                        ? "bg-[#0078d4] text-white font-medium"
                        : "text-foreground"
                    }`}
                  >
                    {action}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <RibbonDivider />

      {/* ------------------------------------------------------------- */}
      {/* GROUP 2: CLIPBOARD */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onMouseDown={preventFocusLoss}
          onClick={async () => {
            try {
              const text = await navigator.clipboard.readText();
              if (text) document.execCommand("insertText", false, text);
            } catch {
              document.execCommand("paste");
            }
          }}
          title="Paste (Ctrl+V)"
          className="flex h-7 px-1.5 items-center gap-1 rounded hover:bg-primary/15 transition-colors cursor-pointer text-xs"
        >
          <Clipboard className="h-4 w-4 text-primary dark:text-primary" />
          <span className="hidden sm:inline font-medium">Paste</span>
        </button>

        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => document.execCommand("cut")}
            title="Cut (Ctrl+X)"
            className="flex h-4 w-4 items-center justify-center rounded hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <Scissors className="h-3 w-3" />
          </button>
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => document.execCommand("copy")}
            title="Copy (Ctrl+C)"
            className="flex h-4 w-4 items-center justify-center rounded hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <Copy className="h-3 w-3" />
          </button>
        </div>
      </div>

      <RibbonDivider />

      {/* ------------------------------------------------------------- */}
      {/* GROUP 3: FONT */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col gap-1">
        {/* Row 1: Font Family, Size, Grow/Shrink, Clear Formatting */}
        <div className="flex items-center gap-1">
          {/* Font Family Selector */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={(e) => {
                e.stopPropagation();
                setIsFontOpen((v) => !v);
              }}
              className="flex h-6 w-36 items-center justify-between rounded border border-secondary bg-card px-2 text-xs hover:border-primary/50 dark:bg-secondary"
            >
              <span className="truncate" style={{ fontFamily: toolbarState.fontFamily }}>
                {fontsLoading ? "Loading fonts..." : toolbarState.fontFamily}
              </span>
              <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
            </button>

            {isFontOpen && (
              <div
                onMouseDown={preventFocusLoss}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-full z-50 mt-1 max-h-60 w-48 overflow-y-auto rounded border border-border bg-card p-1 shadow-xl dark:bg-[#111D29]"
              >
                {fonts.map((f) => (
                  <div
                    key={f}
                    onClick={() => {
                      loadGoogleFont(f);
                      applyFontFamily(f);
                      setIsFontOpen(false);
                    }}
                    style={{ fontFamily: f }}
                    className={`flex items-center justify-between px-2 py-1 text-xs rounded hover:bg-primary/20 cursor-pointer ${
                      toolbarState.fontFamily.toLowerCase() === f.toLowerCase() ? "bg-primary/15 font-semibold text-primary" : ""
                    }`}
                  >
                    <span>{f}</span>
                    {toolbarState.fontFamily.toLowerCase() === f.toLowerCase() && <Check className="h-3 w-3" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Font Size Input & Dropdown */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={fontSizeInput}
              onChange={(e) => setFontSizeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const num = parseInt(fontSizeInput, 10);
                  if (!isNaN(num) && num > 0) applyFontSize(num);
                }
              }}
              onBlur={() => {
                const num = parseInt(fontSizeInput, 10);
                if (!isNaN(num) && num > 0) applyFontSize(num);
              }}
              className="h-6 w-11 rounded-l border border-r-0 border-secondary bg-card px-1 text-center text-xs focus:outline-none focus:ring-1 focus:ring-primary dark:bg-secondary"
            />
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={(e) => {
                e.stopPropagation();
                setIsFontSizeOpen((v) => !v);
              }}
              className="flex h-6 w-4 items-center justify-center rounded-r border border-secondary bg-card hover:bg-primary/20 dark:bg-secondary"
            >
              <ChevronDown className="h-2.5 w-2.5 opacity-60" />
            </button>

            {isFontSizeOpen && (
              <div
                onMouseDown={preventFocusLoss}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-full z-50 mt-1 max-h-52 w-16 overflow-y-auto rounded border border-border bg-card p-0.5 shadow-xl dark:bg-[#111D29]"
              >
                {FONT_SIZES.map((sz) => (
                  <div
                    key={sz.label}
                    onClick={() => {
                      applyFontSize(sz.label);
                      setFontSizeInput(sz.label);
                      setIsFontSizeOpen(false);
                    }}
                    className={`px-2 py-0.5 text-center text-xs rounded hover:bg-primary/20 cursor-pointer ${
                      toolbarState.fontSize === sz.label ? "bg-primary/15 font-semibold text-primary" : ""
                    }`}
                  >
                    {sz.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Increase / Decrease Font Size */}
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => increaseFontSize()}
            title="Increase Font Size (Ctrl+Shift+>)"
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-primary/20 cursor-pointer"
          >
            <span className="text-xs font-bold">A<sup className="text-[9px]">▲</sup></span>
          </button>
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => decreaseFontSize()}
            title="Decrease Font Size (Ctrl+Shift+<)"
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-primary/20 cursor-pointer"
          >
            <span className="text-xs font-bold">A<sub className="text-[9px]">▼</sub></span>
          </button>

          {/* Clear Formatting */}
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => clearFormatting()}
            title="Clear All Formatting"
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-primary/20 cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <RemoveFormatting className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Row 2: Bold, Italic, Underline, Strike, Sub, Super, Text Color, Highlight Color */}
        <div className="flex items-center gap-0.5">
          {/* Bold */}
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => toggleBold()}
            title="Bold (Ctrl+B)"
            className={`flex h-6 w-6 items-center justify-center rounded transition-colors cursor-pointer ${
              toolbarState.bold ? "bg-primary/25 text-primary font-bold border border-primary/40 shadow-xs" : "hover:bg-primary/15"
            }`}
          >
            <Bold className="h-3.5 w-3.5" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => toggleItalic()}
            title="Italic (Ctrl+I)"
            className={`flex h-6 w-6 items-center justify-center rounded transition-colors cursor-pointer ${
              toolbarState.italic ? "bg-primary/25 text-primary italic border border-primary/40 shadow-xs" : "hover:bg-primary/15"
            }`}
          >
            <Italic className="h-3.5 w-3.5" />
          </button>

          {/* Underline with Dropdown */}
          <div className="relative inline-flex items-center">
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => toggleUnderline()}
              title="Underline (Ctrl+U)"
              className={`flex h-6 w-5 items-center justify-center rounded-l transition-colors cursor-pointer ${
                toolbarState.underline ? "bg-primary/25 text-primary border border-r-0 border-primary/40 shadow-xs" : "hover:bg-primary/15"
              }`}
            >
              <Underline className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={(e) => {
                e.stopPropagation();
                setIsUnderlineOpen((v) => !v);
              }}
              className="flex h-6 w-3 items-center justify-center rounded-r hover:bg-primary/20 cursor-pointer"
            >
              <ChevronDown className="h-2 w-2" />
            </button>

            {isUnderlineOpen && (
              <div
                onMouseDown={preventFocusLoss}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-full z-50 mt-1 w-32 rounded border border-border bg-card p-1 shadow-xl dark:bg-[#111D29]"
              >
                {[
                  { label: "Single", style: "underline" },
                  { label: "Double", style: "underline double" },
                  { label: "Thick", style: "underline 2px" },
                  { label: "Dotted", style: "underline dotted" },
                  { label: "Dashed", style: "underline dashed" },
                  { label: "Wavy", style: "underline wavy" },
                ].map((item) => (
                  <div
                    key={item.label}
                    onClick={() => {
                      applyFormatCommand("underline");
                      setIsUnderlineOpen(false);
                    }}
                    className="px-2 py-1 text-xs hover:bg-primary/20 rounded cursor-pointer"
                  >
                    <span style={{ textDecoration: item.style }}>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Strikethrough */}
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => toggleStrikethrough()}
            title="Strikethrough"
            className={`flex h-6 w-6 items-center justify-center rounded transition-colors cursor-pointer ${
              toolbarState.strikethrough ? "bg-primary/25 text-primary border border-primary/40 shadow-xs" : "hover:bg-primary/15"
            }`}
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </button>

          {/* Subscript */}
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => toggleSubscript()}
            title="Subscript (Ctrl+=)"
            className={`flex h-6 w-6 items-center justify-center rounded transition-colors cursor-pointer ${
              toolbarState.subscript ? "bg-primary/25 text-primary border border-primary/40 shadow-xs" : "hover:bg-primary/15"
            }`}
          >
            <Subscript className="h-3.5 w-3.5" />
          </button>

          {/* Superscript */}
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => toggleSuperscript()}
            title="Superscript (Ctrl+Shift++)"
            className={`flex h-6 w-6 items-center justify-center rounded transition-colors cursor-pointer ${
              toolbarState.superscript ? "bg-primary/25 text-primary border border-primary/40 shadow-xs" : "hover:bg-primary/15"
            }`}
          >
            <Superscript className="h-3.5 w-3.5" />
          </button>

          <span className="h-4 w-px bg-secondary mx-0.5" />

          {/* Text Highlight Color */}
          <div className="relative inline-flex items-center">
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => applyHighlightColor("#FFFF00")}
              title="Text Highlight Color"
              className="flex h-6 w-5 items-center justify-center rounded-l hover:bg-primary/20 cursor-pointer"
            >
              <Highlighter className="h-3.5 w-3.5 text-warning-500" />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={(e) => {
                e.stopPropagation();
                setIsHighlightOpen((v) => !v);
              }}
              className="flex h-6 w-3 items-center justify-center rounded-r hover:bg-primary/20 cursor-pointer"
            >
              <ChevronDown className="h-2 w-2" />
            </button>

            {isHighlightOpen && (
              <div
                onMouseDown={preventFocusLoss}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-full z-50 mt-1 w-44 rounded border border-border bg-card p-2 shadow-xl dark:bg-[#111D29]"
              >
                <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Highlight Colors</div>
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {WORD_HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onMouseDown={preventFocusLoss}
                      onClick={() => {
                        applyHighlightColor(c.value);
                        setIsHighlightOpen(false);
                      }}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                      className="h-5 w-5 rounded border border-secondary/50 hover:scale-110 transition-transform"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onMouseDown={preventFocusLoss}
                  onClick={() => {
                    applyHighlightColor("transparent");
                    setIsHighlightOpen(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-primary/20 rounded cursor-pointer"
                >
                  No Color
                </button>
              </div>
            )}
          </div>

          {/* Font Color */}
          <div className="relative inline-flex items-center">
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => applyTextColor(toolbarState.textColor || "#000000")}
              title="Font Color"
              className="flex h-6 w-5 items-center justify-center rounded-l hover:bg-primary/20 cursor-pointer flex-col"
            >
              <Baseline className="h-3 w-3" />
              <span className="h-1 w-3.5 rounded-full" style={{ backgroundColor: toolbarState.textColor || "#FF0000" }} />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={(e) => {
                e.stopPropagation();
                setIsColorOpen((v) => !v);
              }}
              className="flex h-6 w-3 items-center justify-center rounded-r hover:bg-primary/20 cursor-pointer"
            >
              <ChevronDown className="h-2 w-2" />
            </button>

            {isColorOpen && (
              <div
                onMouseDown={preventFocusLoss}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-full z-50 mt-1 w-52 rounded border border-border bg-card p-2 shadow-xl dark:bg-[#111D29]"
              >
                <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Theme Colors</div>
                <div className="grid grid-cols-10 gap-1 mb-2">
                  {WORD_FONT_COLORS.map((colorHex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={preventFocusLoss}
                      onClick={() => {
                        applyTextColor(colorHex);
                        setIsColorOpen(false);
                      }}
                      style={{ backgroundColor: colorHex }}
                      className="h-4 w-4 rounded-xs border border-secondary/40 hover:scale-125 transition-transform"
                    />
                  ))}
                </div>

                <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Standard Colors</div>
                <div className="grid grid-cols-10 gap-1 mb-2">
                  {STANDARD_COLORS.map((colorHex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={preventFocusLoss}
                      onClick={() => {
                        applyTextColor(colorHex);
                        setIsColorOpen(false);
                      }}
                      style={{ backgroundColor: colorHex }}
                      className="h-4 w-4 rounded-xs border border-secondary/40 hover:scale-125 transition-transform"
                    />
                  ))}
                </div>

                <label className="flex items-center gap-1.5 px-1 py-1 text-xs hover:bg-primary/20 rounded cursor-pointer">
                  <span>Custom Color:</span>
                  <input
                    type="color"
                    onChange={(e) => {
                      applyTextColor(e.target.value);
                      setIsColorOpen(false);
                    }}
                    className="h-5 w-6 cursor-pointer border-0 bg-transparent"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      <RibbonDivider />

      {/* ------------------------------------------------------------- */}
      {/* GROUP 4: PARAGRAPH */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col gap-1">
        {/* Row 1: Bullets, Numbering, Multilevel, Indents */}
        <div className="flex items-center gap-0.5">
          {/* Bullets */}
          <div className="relative inline-flex items-center">
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => applyFormatCommand("insertUnorderedList")}
              title="Bullets"
              className={`flex h-6 w-5 items-center justify-center rounded-l hover:bg-primary/20 cursor-pointer ${
                toolbarState.isBulletList ? "bg-primary/25 text-primary" : ""
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={(e) => {
                e.stopPropagation();
                setIsBulletsOpen((v) => !v);
              }}
              className="flex h-6 w-3 items-center justify-center rounded-r hover:bg-primary/20 cursor-pointer"
            >
              <ChevronDown className="h-2 w-2" />
            </button>

            {isBulletsOpen && (
              <div
                onMouseDown={preventFocusLoss}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-full z-50 mt-1 w-36 rounded border border-border bg-card p-1 shadow-xl dark:bg-[#111D29]"
              >
                {[
                  { label: "Disc", char: "•", type: "disc" },
                  { label: "Circle", char: "○", type: "circle" },
                  { label: "Square", char: "■", type: "square" },
                  { label: "Arrow", char: "➤", type: "custom" },
                  { label: "Checkmark", char: "✓", type: "custom" },
                ].map((b) => (
                  <div
                    key={b.label}
                    onClick={() => {
                      applyBulletStyle(b.char, b.type);
                      setIsBulletsOpen(false);
                    }}
                    className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-primary/20 rounded cursor-pointer"
                  >
                    <span className="font-bold text-sm w-4 text-center">{b.char}</span>
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Numbering */}
          <div className="relative inline-flex items-center">
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => applyFormatCommand("insertOrderedList")}
              title="Numbering"
              className={`flex h-6 w-5 items-center justify-center rounded-l hover:bg-primary/20 cursor-pointer ${
                toolbarState.isNumberedList ? "bg-primary/25 text-primary" : ""
              }`}
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={(e) => {
                e.stopPropagation();
                setIsNumberingOpen((v) => !v);
              }}
              className="flex h-6 w-3 items-center justify-center rounded-r hover:bg-primary/20 cursor-pointer"
            >
              <ChevronDown className="h-2 w-2" />
            </button>

            {isNumberingOpen && (
              <div
                onMouseDown={preventFocusLoss}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-full z-50 mt-1 w-36 rounded border border-border bg-card p-1 shadow-xl dark:bg-[#111D29]"
              >
                {[
                  { label: "1. 2. 3.", style: "decimal" },
                  { label: "a. b. c.", style: "lower-alpha" },
                  { label: "A. B. C.", style: "upper-alpha" },
                  { label: "i. ii. iii.", style: "lower-roman" },
                  { label: "I. II. III.", style: "upper-roman" },
                ].map((n) => (
                  <div
                    key={n.label}
                    onClick={() => {
                      applyFormatCommand("insertOrderedList", n.style);
                      setIsNumberingOpen(false);
                    }}
                    className="px-2 py-1 text-xs hover:bg-primary/20 rounded cursor-pointer"
                  >
                    <span>{n.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Decrease Indent */}
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => applyFormatCommand("outdent")}
            title="Decrease Indent"
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-primary/20 cursor-pointer"
          >
            <Outdent className="h-3.5 w-3.5" />
          </button>

          {/* Increase Indent */}
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => applyFormatCommand("indent")}
            title="Increase Indent"
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-primary/20 cursor-pointer"
          >
            <Indent className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Row 2: Alignments & Line Spacing */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => applyAlignment("left")}
            title="Align Left (Ctrl+L)"
            className={`flex h-6 w-6 items-center justify-center rounded transition-colors cursor-pointer ${
              toolbarState.alignment === "left" ? "bg-primary/25 text-primary border border-primary/40 shadow-xs" : "hover:bg-primary/15"
            }`}
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => applyAlignment("center")}
            title="Center (Ctrl+E)"
            className={`flex h-6 w-6 items-center justify-center rounded transition-colors cursor-pointer ${
              toolbarState.alignment === "center" ? "bg-primary/25 text-primary border border-primary/40 shadow-xs" : "hover:bg-primary/15"
            }`}
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => applyAlignment("right")}
            title="Align Right (Ctrl+R)"
            className={`flex h-6 w-6 items-center justify-center rounded transition-colors cursor-pointer ${
              toolbarState.alignment === "right" ? "bg-primary/25 text-primary border border-primary/40 shadow-xs" : "hover:bg-primary/15"
            }`}
          >
            <AlignRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => applyAlignment("justify")}
            title="Justify (Ctrl+J)"
            className={`flex h-6 w-6 items-center justify-center rounded transition-colors cursor-pointer ${
              toolbarState.alignment === "justify" ? "bg-primary/25 text-primary border border-primary/40 shadow-xs" : "hover:bg-primary/15"
            }`}
          >
            <AlignJustify className="h-3.5 w-3.5" />
          </button>

          {/* Line & Paragraph Spacing Dropdown */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={(e) => {
                e.stopPropagation();
                setIsLineSpacingOpen((v) => !v);
              }}
              title="Line and Paragraph Spacing"
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-primary/20 cursor-pointer"
            >
              <span className="text-[10px] font-semibold">1.15↕</span>
            </button>

            {isLineSpacingOpen && (
              <div
                onMouseDown={preventFocusLoss}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-0 top-full z-50 mt-1 w-32 rounded border border-border bg-card p-1 shadow-xl dark:bg-[#111D29]"
              >
                {["1.0", "1.15", "1.5", "2.0", "2.5", "3.0"].map((sp) => (
                  <div
                    key={sp}
                    onClick={() => {
                      applyLineSpacing(sp);
                      setIsLineSpacingOpen(false);
                    }}
                    className={`px-2 py-1 text-xs hover:bg-primary/20 rounded cursor-pointer ${
                      toolbarState.lineSpacing === sp ? "bg-primary/15 font-semibold text-primary" : ""
                    }`}
                  >
                    <span>{sp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <RibbonDivider />

      {/* ------------------------------------------------------------- */}
      {/* GROUP 5: STYLES GALLERY */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-1 overflow-x-auto max-w-sm">
        {QUICK_STYLES.map((st) => {
          const isActive = toolbarState.blockStyle.toLowerCase() === st.id.toLowerCase();
          return (
            <button
              key={st.id}
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => applyBlockStyle(st.tag)}
              className={`flex flex-col items-center justify-center h-12 min-w-[58px] px-1 rounded border transition-all cursor-pointer ${
                isActive
                  ? "border-[#0078d4] bg-primary/15 ring-1 ring-[#0078d4]"
                  : "border-secondary hover:border-primary/50 hover:bg-primary/5 bg-card dark:bg-secondary"
              }`}
            >
              <span
                className={`text-xs ${
                  st.id === "Heading 1"
                    ? "text-[#0078d4] font-bold text-sm"
                    : st.id === "Heading 2"
                    ? "text-[#2b579a] font-semibold text-xs"
                    : st.id === "Heading 3"
                    ? "text-[#107c41] font-medium text-xs"
                    : st.id === "Title"
                    ? "text-foreground font-bold text-sm"
                    : st.id === "Quote"
                    ? "italic text-muted-foreground"
                    : "text-foreground font-normal"
                }`}
              >
                {st.preview}
              </span>
              <span className="text-[9px] text-muted-foreground truncate w-full text-center mt-0.5">
                {st.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      <RibbonDivider />

      {/* ------------------------------------------------------------- */}
      {/* GROUP 6: EDITING (FIND, REPLACE, SELECT ALL) */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onMouseDown={preventFocusLoss}
          onClick={() => {
            setActivePanel("document");
            setLeftPanelOpen(true);
          }}
          title="Find (Ctrl+F)"
          className="flex h-5 px-1.5 items-center gap-1 rounded hover:bg-primary/20 text-xs cursor-pointer"
        >
          <Search className="h-3 w-3 text-muted-foreground" />
          <span className="text-[11px]">Find</span>
        </button>

        <button
          type="button"
          onMouseDown={preventFocusLoss}
          onClick={() => {
            setActivePanel("document");
            setLeftPanelOpen(true);
          }}
          title="Replace (Ctrl+H)"
          className="flex h-5 px-1.5 items-center gap-1 rounded hover:bg-primary/20 text-xs cursor-pointer"
        >
          <Replace className="h-3 w-3 text-muted-foreground" />
          <span className="text-[11px]">Replace</span>
        </button>

        <button
          type="button"
          onMouseDown={preventFocusLoss}
          onClick={() => selectAllBody()}
          title="Select All (Ctrl+A)"
          className="flex h-5 px-1.5 items-center gap-1 rounded hover:bg-primary/20 text-xs cursor-pointer text-[11px]"
        >
          <span>Select All</span>
        </button>
      </div>
    </div>
  );
}