/*This file defines the **TypeScript types used to manage the editor's UI state**. It specifies which Ribbon tabs and left-side panels are available and describes the structure of the overall `EditorState`.

**Main purpose:**
It acts as a **type definition/contract file** for the editor, ensuring that components can only use valid Ribbon tabs, panels, and state properties.

* **`RibbonTab`** — defines the available Ribbon tabs: Home, Insert, Layout, References, Review, and View.
* **`LeftPanel`** — defines the available workspace panels such as Document, Writing, Tables, Figures, References, Symbols, Templates, and Settings.
* **`EditorState`** — defines the current editor state, including the active Ribbon, active panel, zoom level, left-panel visibility, and AI-panel visibility.

**In simple words:**
`editor.types.ts` tells the application **what the editor state should look like**, but it does not contain the actual UI or state-changing logic.

*/


export type RibbonTab =
  | "home"
  | "insert"
  | "layout"
  | "references"
  | "review"
  | "view";

export type LeftPanel =
  | "document"
  | "writing"
  | "tables"
  | "figures"
  | "references"
  |"symbols"
  | "templates"
  | "settings";

export interface EditorState {
  activeRibbon: RibbonTab;

  activePanel: LeftPanel;

  zoom: number;

  leftPanelOpen: boolean;

  aiPanelOpen: boolean;
}



































