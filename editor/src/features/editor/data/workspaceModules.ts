/*Purpose:**
Defines the **workspace modules available in the document editor** and provides their basic metadata.

**Responsibilities:**

* Defines the `ModuleId` type containing all supported workspace sections.
* Stores module IDs, display labels, and descriptions in `WORKSPACE_MODULES`.
* Provides a centralized list for the workspace toolbar and panel navigation.
* Ensures consistent module naming across the editor.

**In short:**

> `workspaceModules.ts` acts as the **central registry of editor workspace modules**, defining which sections are available and how they are identified and described.
*/

export type ModuleId =
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
  | "settings";

export const WORKSPACE_MODULES = [
  {
    id: "document",
    label: "Document",
    description: "Document structure and pages",
  },
  {
    id: "links",
    label: "Links",
    description: "Internal, external & cross references",
  },
  {
    id: "writing",
    label: "Writing",
    description: "Writing and editing tools",
  },
  {
    id: "styles",
    label: "Styles",
    description: "Document styles and formatting",
  },
  {
    id: "tables",
    label: "Tables",
    description: "Create and manage tables",
  },
  {
    id: "figures",
    label: "Figures",
    description: "Images and figures",
  },
  {
    id: "references",
    label: "References",
    description: "References and citations",
  },
  {
    id: "symbols",
    label: "Symbols",
    description: "Symbols and special characters",
  },
  {
    id: "appendices",
    label: "Appendices",
    description: "Manage document appendices",
  },
  {
    id: "trackChanges",
    label: "Track Changes",
    description: "Review document changes",
  },
  {
    id: "settings",
    label: "Settings",
    description: "Workspace settings",
  },
] as const;

