# 03. EDITOR MODULE DOCUMENTATION
## CoEdit.ai – Document Authoring & Editorial Suite

---

## 1. EDITOR MODULE OVERVIEW

### 1.1 Purpose & Role
The **Editor Module** provides a professional, browser-based WYSIWYG document preparation and authoring environment designed for regulatory submissions, clinical documentation, and enterprise publication. It replicates Microsoft Word's foundational authoring paradigms, offering a multi-page canvas, an Office-style Ribbon, a specialized vertical tool rail with collapsible drawers, and a built-in AI writing assistant.

### 1.2 Architectural Foundation
- **Route URL:** `/editor`
- **Page Component:** `EditorPage.tsx` (`editor/src/features/editor/pages/EditorPage.tsx`).
- **Layout Component:** `EditorLayout.tsx` (`editor/src/features/editor/layouts/EditorLayout.tsx`).
- **Access Guard:** `AuthGuard`, `RoleGuard([Role.Admin, Role.Author])`.
- **Canvas Rendering Engine:** `Workspace.tsx` (`editor/src/features/editor/components/workspace/Workspace.tsx`).
- **Document State Engine:** `documentModel.tsx` (`editor/src/features/editor/store/documentModel.tsx`).

### 1.3 Provider Hierarchy in `EditorPage.tsx`
The editor view orchestrates multiple nested React contexts to isolate state concerns:

```text
EditorPage
└── DocumentModelProvider       (Multi-page document model, sections, saved docs, undo/redo)
    └── AuditProvider           (Audit logging and user change attribution)
        └── EditorProvider      (UI panel visibility, left drawer width, active tool selection)
            └── TrackChangesProvider (Revision tracking engine, diff calculations, accept/reject)
                └── HeaderFooterProvider (Header/footer activation, section margins, distances)
                    └── TableProvider    (Smart table state, active table, cell selections)
                        └── FigureProvider   (Figure uploads, image positioning)
                            └── ChartProvider    (Recharts data, chart templates)
                                └── SmartArtProvider (SmartArt diagram hierarchy)
                                    └── ReferencesProvider (Citations, bibliography, sources)
                                        └── EditorLayout (Main UI container)
```

### 1.4 Master Layout Structure (`EditorLayout.tsx`)
```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ EditorHeader (Logo, Title, Save, Save As, Upload, Print, Export, UserProfile)          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ RibbonToolbar (Home | Insert | Layout | Review | [Contextual Header & Footer])         │
├───────┬───────────────────────┬──────────────────────────────────────────┬─────────────┤
│ Icon  │ LeftOverlay Drawer    │ Document Workspace Canvas                │ AI Panel    │
│ Rail  │ (Resizable 240px-760px│ (Virtualized A4/Letter multi-page DOM,   │ (Drawer:    │
│ (13.5)│  Document, Links,     │  headers, footers, margins, columns,     │  Chat,      │
│       │  Writing, Styles,     │  watermarks, borders, zoom transform)    │  Quick      │
│       │  Tables, Figures...)  │                                          │  Actions)   │
├───────┴───────────────────────┴──────────────────────────────────────────┴─────────────┤
│ EditorStatusBar (Page X of Y | Word Count | Read Mode Spread | Zoom Slider 50%-200%)   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. CORE SUB-MODULE DOCUMENTATION

### 2.1 Document Module (`modules/document`)

#### 2.1.1 Overview & Purpose
Provides document management, multi-document switching, document creation, deletion, search, section break insertion, and document statistics. Rendered in the left overlay drawer when clicking the **Document** icon in the sidebar rail.

#### 2.1.2 Features & User Interactions
1. **Document Manager & Document Listing:**
   - Displays all documents stored in `savedDocuments` (up to a maximum threshold of 10 documents).
   - Each document item renders:
     - Document Title (e.g., `"Clinical Protocol Amendment 1"`).
     - Page count badge (e.g., `"5 pages"`).
     - Saved time formatted with AM/PM (e.g., `"10:45 AM"`).
     - Unsaved change indicator badge (`"Unsaved"` in amber) if modified since last save.
     - Active document highlight (light-blue border with active pill).
   - Clicking a document switches the active document in the canvas via `loadDocument(doc.id)`.
2. **New Document Creation:**
   - `+ New` button in panel header.
   - Triggers `createNewDocument()`, initializing a fresh document model with a single blank page and default section formatting.
   - Enforces a 10-document quota: if author already has 10 documents, an alert modal warns that older documents must be removed before creating new ones.
3. **Document Deletion:**
   - Trash icon button on document item opens `DeleteDocumentDialog`.
   - Confirms deletion with a danger button (`"Delete Document"`) and cancel button.
   - Removes document from `savedDocuments` and resets active model if deleted document was active.
4. **Document Search:**
   - Real-time search input with `Search` icon. Filters the document list by title.
5. **Breaks Accordion:**
   - `Page Break`: Inserts a visual dashed page break (`.page-break`) causing following text to start on a new page.
   - `Line Break`: Inserts a soft break `<br/>` without creating a new paragraph.
   - `Column Break`: In multi-column sections, forces subsequent content into the next column (`break-after: column`).
6. **Navigation Accordion (Find & Replace):**
   - Detailed in Section 4.
7. **Document Utilities Accordion:**
   - Word count modal trigger: displays live document statistics (total words, characters with/without spaces, paragraphs, and reading time estimation).
   - Document Permissions dialog: Displays document access controls.

---

### 2.2 Writings Module (`modules/writing`)

#### 2.2.1 Overview & Purpose
Provides comprehensive paragraph and typography styling tools. Accessible via the **Writing** icon on the sidebar rail (`WritingPanel.tsx`).

#### 2.2.2 Available Writing Tools
1. **Search Writing Tools (`WritingSearch.tsx`):**
   - Search bar filtering the tools displayed in the Writing panel by keyword.
2. **Text Casing Section (`CaseSection.tsx`):**
   - `UPPERCASE`: Converts selected text to uppercase.
   - `lowercase`: Converts selected text to lowercase.
   - `Title Case`: Capitalizes the first letter of each major word in selection.
   - `Sentence Case`: Capitalizes only the first letter of each sentence.
3. **Formatting Section (`FormattingSection.tsx`):**
   - `Bold` (`Ctrl+B`): Applies `font-weight: 700` (`<b>` / `<strong>`).
   - `Italic` (`Ctrl+I`): Applies `font-style: italic` (`<i>` / `<em>`).
   - `Underline` (`Ctrl+U`): Applies `text-decoration: underline` (`<u>`).
   - `Strikethrough`: Applies `text-decoration: line-through` (`<s>`).
   - `Superscript`: Converts text to superscript (`<sup>`).
   - `Subscript`: Converts text to subscript (`<sub>`).
4. **Font Color Section (`FontColorSection.tsx`):**
   - Color swatches displaying black, brand navy, red, green, blue, purple, and custom hex codes.
   - Applies inline CSS `color` to selection; preserves user selection.
5. **Highlight Section (`HighlightSection.tsx`):**
   - Swatches: Yellow (`#fef08a`), Green (`#bbf7d0`), Cyan (`#a5f3fc`), Pink (`#fbcfe8`), Orange (`#fed7aa`).
   - `Remove` button: Clears background highlight from selected text.
6. **Paragraph Alignment Section (`AlignmentSection.tsx`):**
   - Four alignment controls: `Left`, `Center`, `Right`, and `Justify`.
   - Modifies text alignment on the enclosing block/paragraph element.
7. **Line Spacing Section (`LineSpacingSection.tsx`):**
   - Interactive dropdown offering: `1.0`, `1.15`, `1.5`, `2.0`, `2.5`, `3.0`.
   - Directly updates `line-height` of the active paragraph; active spacing displays a blue checkmark.
8. **Lists & Indentation (`ListSection.tsx`):**
   - `Bullets`: Unordered list with bullet shape styles (disc, circle, square).
   - `Numbering`: Ordered list with numbering formats (1. 2. 3., a. b. c., i. ii. iii.).
   - `Indent / Outdent`: Modifies paragraph indentation padding.

---

### 2.3 Styles Module (`modules/styles`)

#### 2.3.1 Overview & Purpose
Maintains standardized paragraph and heading styles ensuring visual consistency across enterprise documents. Rendered via `StylesPanel.tsx`.

#### 2.3.2 Implemented Capabilities
1. **Style Gallery & Cards (`StyleGallery.tsx`, `StyleCard.tsx`):**
   - Displays predefined style tokens: `Normal`, `Heading 1`, `Heading 2`, `Heading 3`, `Title`, `Subtitle`, `Quote`, `Code`.
   - Each card displays a typography preview rendered with the style's font, size, weight, and color.
2. **Style Application & Selection Preservation:**
   - Clicking a style card applies the style token to the active paragraph or selection.
   - **Selection Retention:** Utilizes `restoreEditorSelection()` ensuring the author's text selection is not dropped upon clicking the style button.
3. **Style Context Menu (`StyleContextMenu.tsx`):**
   - Right-clicking (or clicking action dots on) a style card reveals:
     - `Apply Style`: Immediately formats active selection.
     - `Modify...`: Opens `StyleModifyModal`.
     - `Update [Style] to Match Selection`: Samples formatting from active selection and updates the global style token.
     - `Remove from Gallery`: Hides style from visible panel.
     - `Revert to Default`: Restores default preset tokens.
4. **Style Modify Modal (`StyleModifyModal.tsx`):**
   - Provides granular controls for: Font family, Font size (pt), Bold, Italic, Color picker, Line spacing, Paragraph alignment, Space Before / Space After.
   - Live sample preview box updates dynamically before saving.

---

### 2.4 Symbols Module (`modules/symbols`)

#### 2.4.1 Overview & Purpose
Enables one-click insertion of specialized typographical symbols, mathematical notations, Greek characters, and regulatory marks. Rendered in `SymbolsPanel.tsx`.

#### 2.4.2 Implemented Symbol Categories (`symbols.constants.ts`)
1. **Frequent:** `±`, `+`, `-`, `=`, `<`, `>`, `≤`, `≥`, `≠`, `≈`, `×`, `÷`, `°`, `∞`, `√`, `∑`, `π`, `→`, `←`, `✓`, `©`, `®`, `™`.
2. **Greek Alphabet:** `α`, `β`, `γ`, `δ`, `ε`, `ζ`, `η`, `θ`, `ι`, `κ`, `λ`, `μ`, `ν`, `ξ`, `ο`, `π`, `ρ`, `σ`, `τ`, `υ`, `φ`, `χ`, `ψ`, `ω`.
3. **Mathematical Operators:** `∀`, `∂`, `∃`, `∅`, `∇`, `∈`, `∉`, `∋`, `∏`, `∑`, `−`, `∕`, `∗`, `∙`, `∝`, `∠`, `∧`, `∨`, `∩`, `∪`, `∫`, `∴`, `∼`, `≅`.
4. **Arrows:** `←`, `↑`, `→`, `↓`, `↔`, `↕`, `↖`, `↗`, `↘`, `↙`, `⇐`, `⇑`, `⇒`, `⇓`, `⇔`.
5. **Currency:** `$`, `€`, `£`, `¥`, `₹`, `₩`, `₽`, `¢`, `¤`.
6. **Regulatory & Trademarks:** `©`, `®`, `™`, `§`, `¶`, `†`, `‡`, `№`.

#### 2.4.3 Interaction & Behavior
- **Search Bar:** Real-time search matching symbol character or descriptive name (e.g., typing `"alpha"` filters to `α`).
- **Insertion Behavior:** Clicking any symbol button inserts the character at the active document cursor position via `insertSymbol()` and restores cursor focus to the canvas immediately.
- **Empty Search:** Displays `"No symbols found."` when query has no matches.

---

### 2.5 Tables Module (`modules/tables`)

#### 2.5.1 Overview & Purpose
Enables insertion and manipulation of structured data tables (`TablesPage.tsx`).
- **Table Grid Selector:** Visual $10 \times 10$ hover grid allowing author to drag and click desired rows and columns.
- **Table Formatting Templates:** Standard, Light Blue Header, Banded Rows, Minimalist, Elegant Borders.
- **Floating Format Toolbar:** Automatically appears above active table on click, offering:
  - Add Row Above / Add Row Below.
  - Add Column Left / Add Column Right.
  - Delete Row / Delete Column / Delete Entire Table.
  - Cell background color and cell border customizer.

---

### 2.6 Figures & Charts Module (`modules/figures`)

#### 2.6.1 Overview & Purpose
Manages graphical assets, image uploads, charts, and SmartArt diagrams (`FiguresPage.tsx`).
- **Image Upload:** Uploads local images (`.png`, `.jpg`, `.svg`); supports image resizing, alignment (Left, Center, Right), and captioning.
- **Charts Integration (`Recharts`):** Supports Bar Charts, Line Charts, and Pie Charts. Offers an inline data table editor to update chart series values directly.
- **SmartArt Diagrams:** Predefined organizational, process, and hierarchical flow diagrams.

---

### 2.7 Links & References Module (`modules/links`)

#### 2.7.1 Overview & Purpose
Manages internal, external, and email hyperlinks (`LinksPage.tsx` and `InternalRefColumn.tsx`).
- **Web URL Tab (`WebUrlTab.tsx`):**
  - Inputs: Link Text, Web Address (URL).
  - Checkbox: `"Open link in new browser tab"` (`target="_blank"`).
  - Primary button: `"Insert Link ->"` styled in light blue (`bg-[#D9E8FF] hover:bg-[#C8DEFF] text-[#1E3A8A] font-semibold`).
- **Email Tab (`EmailTab.tsx`):**
  - Inputs: Recipient Email (with `*` required mark), Subject, Message textarea.
  - Primary button: `"Send to Gmail"` (`bg-[#2A437E] text-white`). Generates mailto hyperlink.
- **Bare Links Converter:** Automatically scans document for raw URLs and converts them to clickable anchor tags.
- **Bookmarks & Cross-References:** Links headings or marked locations across document pages.
- **Links History:** Maintains chronological list of inserted links with single-click remove and refresh controls.

---

### 2.8 Review & Track Changes Module (`modules/trackChanges`)

#### 2.8.1 Overview & Purpose
Delivers full revision control conforming to editorial workflows (`TrackChangesPage.tsx` and `TrackChangesContext.tsx`).
- **Live Revision Tracking (`Ctrl+Shift+E`):**
  - Intercepts canvas insertions and wraps them in `<span data-tc-type="insert" class="tc-insert">` (green underline).
  - Intercepts deletions and wraps them in `<span data-tc-type="delete" class="tc-delete">` (red strikethrough).
  - Records author identity and timestamp metadata.
- **Accept / Reject Review Panel:**
  - Displays chronological cards for every pending modification.
  - Provides individual "Accept" and "Reject" buttons.
  - Side-by-side diff comparison viewing card.
- **Markup Visibility Toggles:** Toggle between showing all markup tags or clean document preview.

---

### 2.9 Status Bar & View Modes (`EditorStatusBar.tsx`)

#### 2.9.1 Overview & Purpose
Fixed bottom rail providing authoring metrics, view mode switching, and canvas zoom scaling.
- **Page Counter:** Displays `"Page X of Y"` updating dynamically based on scroll position.
- **Live Word & Character Count:** Recalculates words and characters on document input.
- **Track Changes Indicator:** Displays active tracking status and pending revision count.
- **Read Mode (Full-Screen Book Spread):**
  - Covers the entire window with an overlay (`ReadModeView`).
  - Renders pages side-by-side in a 2-page horizontal spread.
  - Keyboard navigation: Left/Right arrows, `PageUp`/`PageDown`, `Space`, `Home`, `End`.
  - Exits on `Escape` or Close button click.
- **Zoom Slider:** Word-style custom slider ranging from 50% to 200%. Updates CSS `transform: scale(zoom)` on document pages.

---

## 3. DOCUMENT CANVAS & MULTI-PAGE ENGINE (`Workspace.tsx`)

### 3.1 Pagination & Layout Model
The document canvas is managed via `documentModel.tsx` and rendered in `Workspace.tsx`:
- **Virtualized Pages:** Each page is rendered as an isolated container `<div data-page-id="..." data-editor-page="..." contenteditable="true">`.
- **Dimensions:** Renders standard dimensions (e.g., A4: $794\text{px} \times 1123\text{px}$ at 96 DPI).
- **Default Base Styling:**
  - Base document text color strictly defaults to `#000000` (black) in light mode and `#ffffff` (white) in dark mode.
  - User-applied text colors override base styling via inline styles.
- **Clean Default Footers & Page Numbers:**
  - Newly created documents and sections initialize with empty footers (`footer: ""`).
  - Automatic page numbers are disabled by default (`showPageNumbers: false`, `pageNumberPosition: undefined`) until explicitly inserted via Insert tab.
- **Headers & Footers Editing:**
  - Double-clicking header or footer activates edit mode, switches the ribbon to `Header & Footer` tab, and dims document body text.
- **Multi-Column Engine:** Supports multi-column layouts (`column-count: 2`, `column-gap: 32px`) with automated top-to-bottom column filling.
- **Page Borders:** Renders customized CSS borders (solid, dashed, dotted, double, 3D, shadow) according to section border configuration.

---

## 4. NAVIGATION & FIND/REPLACE (`DocumentPage.tsx` & `FindReplace.tsx`)

### 4.1 UI Layout & Controls
Located in `modules/document/pages/DocumentPage.tsx` under the **Navigation** accordion:
- Tabs: **Find** and **Replace**.
- Find Input: Enter search text; displays placeholder `"Find text..."`.
- Replace Input: Enter replacement text; displays placeholder `"Replace with..."`.
- Pop-out button: Opens enlarged floating `FindReplace` dialog.
- Action Buttons:
  - `Replace`: Replaces the currently focused match and advances to next.
  - `Replace All`: Replaces all occurrences across all pages in one operation.
  - `Find Next`: Advances highlight to the next matching occurrence.
  - `Cancel`: Clears highlights and closes search mode.

### 4.2 In-DOM Highlighting & Search Mechanics
1. **DOM TreeWalker Scanning:** When search query is entered, scans all editable page nodes.
2. **Highlight Marking:** Wraps matching text in `<mark data-find-highlight="true">` with soft yellow background (`#fef08a`).
3. **Active Match Emphasis:** The active focused match is styled with bright yellow (`#facc15`) and a 2px outline (`outline: 2px solid #ca8a04`).
4. **Auto-Scroll:** Automatically scrolls the active match into center view (`scrollIntoView({ behavior: "smooth", block: "center" })`).
5. **Status Counter:** Updates counter label: `"Match X of Y"` or `"No matches found for '...'"` when query has zero occurrences.
6. **Cleanup:** Canceling search removes all `<mark>` tags and restores normalized text nodes.
