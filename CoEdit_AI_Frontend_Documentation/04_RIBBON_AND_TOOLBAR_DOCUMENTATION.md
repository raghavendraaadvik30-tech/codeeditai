# 04. RIBBON & TOOLBAR DOCUMENTATION
## CoEdit.ai – Ribbon Control System Specification

---

## 1. RIBBON ARCHITECTURE & STRUCTURE

### 1.1 Overview
The Ribbon Toolbar is the primary top-level command surface for formatting, inserting objects, adjusting page layout, and reviewing document changes. Rendered by `RibbonToolbar.tsx` (`editor/src/features/editor/components/ribbon/RibbonToolbar.tsx`), it adheres to the modern Microsoft Office Ribbon design language, featuring tabbed categorization, comboboxes, icon buttons, dropdown menus, and contextual tabs.

### 1.2 Implemented Ribbon Tabs
The ribbon defines four standard base tabs and three contextual tabs:
1. **Home Tab (`HomeTab.tsx`):** Core typography selection (Font Family, Font Size) and Undo/Redo historical action management.
2. **Insert Tab (`InsertTab.tsx`):** Page operations (Add Page, Delete Page) and Page Number configuration (Top of Page, Bottom of Page, Format Page Numbers).
3. **Layout Tab (`LayoutTab.tsx`):** Geometric layout controls (Margins, Orientation, Paper Size, Columns, Watermarks, Page Color, Page Borders).
4. **Review Tab (`ReviewTab.tsx`):** Collaborative revision tracking (Track Changes toggle, Next/Prev Change, Accept/Reject, Mass Resolution, Markup Toggles).
5. **Contextual Header & Footer Tab (`HeaderFooterTab.tsx`):** Automatically appears when a page header or footer is active; provides gallery templates, section linkage, and vertical distance settings.
6. **Contextual Chart Design & Format Tabs (`ChartDesignTab.tsx`, `ChartFormatTab.tsx`):** Automatically activates when a chart element is selected in the canvas.

### 1.3 Tab Switching Mechanics
- Standard tabs switch via single click on their respective tab headers.
- Active tab displays a solid `#324480` text color with a 2px bottom border (`border-b-2 border-[#324480]`) in light mode, or `#38BDF8` in dark mode.
- When an author double-clicks a page header or footer, `useHeaderFooter().isHeaderFooterActive` becomes `true`. The ribbon automatically switches to `"Header & Footer"`. Upon clicking "Close Header and Footer" or clicking back into document body text, the ribbon reverts to the previously active tab (`previousTabRef.current`).

---

## 2. HOME TAB (`HomeTab.tsx`)

The Home Tab provides immediate access to document typography and undo/redo stacks.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [ Calibri           ▼ ]  [ 11  ▼ ]  │  [ ↶ Undo ▼ ]  [ ↷ Redo ▼ ]                      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Font Family Combobox (`RibbonSelect.tsx`)
- **UI Location:** Home Ribbon, first control from left (`width: 190px`).
- **Control Type:** Microsoft Word–style editable combobox with search and dropdown.
- **Data Source:** Combines standard system fonts (`Calibri`, `Arial`, `Times New Roman`, `Georgia`, `Verdana`, `Courier New`, etc.) with asynchronous catalog fetching from the Google Fonts API (`fetchAllGoogleFonts()`).
- **Selection Synchronization:**
  - When cursor is collapsed in text, the combobox automatically displays the font family of that text node.
  - When selection spans a word or sentence formatted in a single font, the combobox displays that font name.
  - **Heterogeneous Formatting Handling:** When the text selection spans multiple different font families (e.g., Arial and Calibri), the combobox displays an **empty / placeholder state** (`""` with placeholder `"Font family"`), matching Microsoft Word.
- **User Interactions:**
  - *Click dropdown arrow:* Opens scrollable font list with live typography preview.
  - *Type custom font name:* Filters font list in real time; pressing `Enter` applies font to selection.
  - *Escape:* Cancels typing and restores previous selection.
- **Selection Preservation:** Applies font using `applyFontFamily()` and immediately restores the active range via `restoreEditorSelection()`.

### 2.2 Font Size Combobox (`RibbonSelect.tsx`)
- **UI Location:** Home Ribbon, second control (`width: 68px`).
- **Control Type:** Word-style editable numerical combobox with dropdown presets.
- **Preset Options:** `8`, `9`, `10`, `11`, `12`, `14`, `16`, `18`, `20`, `24`, `28`, `36`, `48`, `72` pt.
- **Custom Value Validation:** Allows manual entry of any integer or half-point size between 1 and 500 pt (e.g., `10.5`, `13`, `15`).
- **Selection Synchronization:**
  - Reads inline CSS `font-size` or computed font size (`px * 0.75`), rounded to the nearest half-point.
  - **Heterogeneous Formatting Handling:** When selection spans multiple font sizes (e.g., a heading with 18pt and body text with 11pt), the combobox displays an **empty / placeholder state** (`""` with placeholder `"Size"`).
- **Selection Preservation:** Re-applies focus and retains active DOM highlight range after size update.

### 2.3 Undo / Redo Split-Buttons
- **UI Location:** Home Ribbon, right of vertical divider.
- **Control Structure:** Dual split-buttons with main action button and secondary history dropdown caret.
- **Undo (`Ctrl+Z`):**
  - Clicking icon button undoes the last recorded user action immediately.
  - Disabled state: Opacity reduced to 35% when `canUndo` is false (`cursor-not-allowed`).
  - Clicking caret reveals historical action dropdown list (e.g., `"Typing"`, `"Font Size: 14pt"`, `"Insert Table"`).
  - Hovering over historical items highlights multiple steps for **batch multi-action undo**.
- **Redo (`Ctrl+Y`):**
  - Clicking icon button re-executes the last undone action.
  - Caret opens historical redo stack for batch re-application.

---

## 3. INSERT TAB (`InsertTab.tsx`)

The Insert Tab controls document structure, page addition/deletion, and page numbering.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [ ➕ Add Page ]  [ 🗑 Delete Page ]  │  [ # Page Number ▼ ]                            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Pages Group
1. **Add Page Button (`RibbonButton.tsx`):**
   - Icon: `FilePlus` in purple (`text-purple-600`).
   - Click action: Invokes `addPage()`, appending a new page to the active document section.
2. **Delete Page Button (`RibbonButton.tsx`):**
   - Icon: `Trash2` in red destructive styling (`text-destructive`).
   - Click action: Invokes `removePage(activePage)`.
   - Disabled state: Automatically disabled (`disabled={model.pages.length <= 1}`) when document has only 1 page to prevent creating an empty document.

### 3.2 Page Number Dropdown Menu
- **Control Structure:** Main dropdown with nested submenus:
  1. **Top of Page Submenu (`DropdownMenuSub`):**
     - Items: `Left`, `Center`, `Right`.
     - Click action: Sets `pageNumberPosition: "header"` with the chosen alignment; sets `showPageNumbers: true`.
     - Active indicator: Displays blue checkmark (`Check`) beside currently active alignment.
  2. **Bottom of Page Submenu (`DropdownMenuSub`):**
     - Items: `Left`, `Center`, `Right`.
     - Click action: Sets `pageNumberPosition: "footer"` with the chosen alignment; sets `showPageNumbers: true`.
     - Active indicator: Displays blue checkmark beside active alignment.
  3. **Separator (`DropdownMenuSeparator`).**
  4. **Format Page Numbers... (`DropdownMenuItem`):**
     - Click action: Opens the **Format Page Numbers Modal Dialog**.
     - Modal Controls:
       - *Number format select:* `1, 2, 3...`, `a, b, c...`, `A, B, C...`, `i, ii, iii...`, `I, II, III...`.
       - *Page numbering radio:* "Continue from previous section" vs. "Start at: [numeric input]".
       - *Save & Cancel buttons.*
  5. **Remove Page Numbers (`DropdownMenuItem`):**
     - Styled in destructive red text (`text-destructive`).
     - Click action: Clears page numbers by setting `showPageNumbers: false` and `pageNumberPosition: undefined`.

---

## 4. LAYOUT TAB (`LayoutTab.tsx`)

The Layout Tab configures geometric and aesthetic page parameters across sections.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [ Margins ▼ ] [ Orientation ▼ ] [ Size ▼ ] [ Columns ▼ ] │ [ Watermark ▼ ] [ Color ▼ ] │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Margins Dropdown
- **Presets Available:**
  - `Normal`: Top: 96px (1 in), Bottom: 96px, Left: 96px, Right: 96px.
  - `Narrow`: Top: 48px (0.5 in), Bottom: 48px, Left: 48px, Right: 48px.
  - `Moderate`: Top: 96px, Bottom: 96px, Left: 72px, Right: 72px.
  - `Wide`: Top: 96px, Bottom: 96px, Left: 192px (2 in), Right: 192px.
- **Custom Margins... Modal:**
  - Inputs for Top, Bottom, Left, and Right margins in inches or pixels.
  - Live margin preview visualizer.

### 4.2 Orientation Popover
- Options: `Portrait` (standard vertical aspect ratio) and `Landscape` (horizontal layout).
- Dynamically transposes page canvas width and height properties in real time.

### 4.3 Paper Size Dropdown
- Presets: `Letter` ($8.5 \times 11\text{ in}$), `Legal` ($8.5 \times 14\text{ in}$), `A4` ($210 \times 297\text{ mm}$), `Executive`, `A5`.
- Custom Paper Size Dialog: Allows specifying custom millimeter/pixel dimensions.

### 4.4 Columns Dropdown
- Presets: `One` (standard), `Two` (equal split), `Three`, `Left` (narrow left rail), `Right` (narrow right rail).
- More Columns Dialog: Controls column count (1 to 4), column gap spacing (e.g., 32px), and vertical divider line toggle.

### 4.5 Watermark Dropdown
- Presets: `CONFIDENTIAL`, `DO NOT COPY`, `DRAFT`, `SAMPLE`.
- Custom Text Watermark Dialog: Text input, font selector, size, color, diagonal vs. horizontal angle.
- `Remove Watermark`: Clears watermark overlay from active section.

### 4.6 Page Color Dropdown
- Interactive palette offering theme swatches, standard colors, and a `"No Color"` button to clear background styling.

### 4.7 Page Borders Dialog
- Setting selection: `None`, `Box`, `Shadow`, `3D`, `Custom`.
- Style options: Solid, Dashed, Dotted, Double, Triple.
- Point Width: $1/4\text{ pt}$ to $6\text{ pt}$.
- Interactive preview box with clickable toggle buttons for Top, Bottom, Left, and Right borders.

---

## 5. REVIEW TAB (`ReviewTab.tsx`)

The Review Tab manages collaborative editing and revision tracking.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [ Track Changes (ON) ➌ ] │ [ ◀ Prev ] [ Next ▶ ] │ [ ✓ Accept ] [ ✗ Reject ] │ [ All ] │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Track Changes Toggle Button
- Toggles tracking state on and off (`Ctrl+Shift+E`).
- Active state: Highlights with blue tinted background (`bg-primary/10 text-brand border border-primary/30`).
- Badge counter: Displays pending revision count (e.g., `3`) in an amber badge.

### 5.2 Navigation Buttons
- `Prev`: Jumps focus and smoothly scrolls to the preceding tracked change. Disabled when pending changes is 0.
- `Next`: Jumps focus and scrolls to the succeeding tracked change. Disabled when pending changes is 0.

### 5.3 Resolution Buttons
- `Accept`: Accepts the currently focused revision, removing markup and merging the text permanently.
- `Reject`: Rejects the currently focused revision and reverts the DOM node.
- `Accept All`: Batch accepts all pending insertions and deletions across all pages in the document.
- `Reject All`: Batch rejects and discards all pending revisions in one operation.

### 5.4 Visual Markup Toggles
- `Show Markup`: Renders all green insertion underlines and red strikethrough tags.
- `Hide Markup`: Displays clean document preview as if all revisions were accepted.

---

## 6. CONTEXTUAL HEADER & FOOTER TAB (`HeaderFooterTab.tsx`)

Activates exclusively when an author double-clicks a page header or footer area.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [ Header ▼ ] [ Footer ▼ ] │ [ Diff First Page ☑ ] [ Link to Prev ] │ [ Close ✕ ]      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.1 Gallery Presets
- Pre-styled header and footer templates: Plain, Accent Bar, Modern Two-Column, and Confidential.

### 6.2 Section Options
- `Different First Page` Checkbox: Unlinks the first page's header/footer from subsequent pages.
- `Different Odd & Even Pages` Checkbox: Enables separate headers and footers for alternate sides (booklet layout).
- `Link to Previous`: Toggles whether this section's header/footer inherits content from the prior section.

### 6.3 Position & Dismissal
- `Header from Top`: Numeric distance input in points/pixels.
- `Footer from Bottom`: Numeric distance input in points/pixels.
- `Close Header and Footer` Button: Exits header/footer editing mode, restores canvas body text opacity to 100%, and switches ribbon back to the preceding tab.

---

## 7. CONTEXTUAL CHART DESIGN & FORMAT TABS

Activated when clicking an embedded chart figure in the document:
1. **Chart Design Tab (`ChartDesignTab.tsx`):**
   - Chart Type Switcher: Bar, Line, Pie, Area.
   - Data Table Editor: Inline grid editing data series values.
   - Chart Styles: Color scheme presets, legend orientation (Top, Bottom, Left, Right).
2. **Chart Format Tab (`ChartFormatTab.tsx`):**
   - Outline border styling, background fill colors, padding, and text label typography.
