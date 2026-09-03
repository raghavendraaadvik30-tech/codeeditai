// src/features/editor/index.ts

// ============================================================
// EDITOR COMPONENTS
// ============================================================

// Header
export * from "./components/header/DocumentInfo";
export * from "./components/header/EditorHeader";
export * from "./components/header/HeaderActions";
export * from "./components/header/HeaderLogo";
export * from "./components/header/UserProfile";

// AI
export * from "./components/ai/AIPanel";

// Overlay
export * from "./components/overlay/LeftOverlay";
export * from "./components/overlay/panelData";

// Ribbon
export * from "./components/ribbon/RibbonToolbar";

// Ribbon Controls
export * from "./components/ribbon/controls/RibbonButton";
export * from "./components/ribbon/controls/RibbonDivider";
export * from "./components/ribbon/controls/RibbonIconButton";
export * from "./components/ribbon/controls/RibbonSelect";

// Ribbon Tabs
export * from "./components/ribbon/tabs/HomeTab";
export * from "./components/ribbon/tabs/InsertTab";
export * from "./components/ribbon/tabs/LayoutTab";
export * from "./components/ribbon/tabs/ReviewTab";

// Sidebar
export * from "./components/sidebar/IconSidebar";
export * from "./components/sidebar/SidebarItem";

// Workspace
export * from "./components/workspace/Workspace";
export * from "./components/workspace/Panel";
export * from "./components/workspace/WorkspacePanel";
export * from "./components/workspace/WorkspacePanelHeader";
export * from "./components/workspace/WorkspaceSidebar";
export * from "./components/workspace/WorkspaceToolbar";


// ============================================================
// RIBBON CONSTANTS
// ============================================================

// IMPORTANT:
// RibbonTab is already exported from this file.
// Therefore DO NOT export RibbonTab again from editor.types.ts.
export * from "./components/ribbon/constant";


// ============================================================
// EDITOR CONSTANTS
// ============================================================

export * from "./constants/editor.constants";


// ============================================================
// CONTEXT
// ============================================================

export * from "./context/EditorContext";


// ============================================================
// DATA
// ============================================================

export * from "./data/workspaceModules";


// ============================================================
// HOOKS
// ============================================================

export * from "./hooks/useEditor";
export * from "./hooks/useWorkspacePanel";


// ============================================================
// LAYOUTS
// ============================================================

export * from "./layouts/EditorLayout";


// ============================================================
// PAGES
// ============================================================

export { default as EditorPage } from "./pages/EditorPage";

// ============================================================
// SERVICES
// ============================================================

export * from "./services/documentService";


// ============================================================
// STORE
// ============================================================

export * from "./store/documentModel";


// ============================================================
// TYPES
// ============================================================

// Do NOT use:
// export * from "./types/editor.types";
//
// because editor.types.ts also exports RibbonTab,
// which is already exported above from:
// ./components/ribbon/constant

export type {
  EditorState,
  LeftPanel,
} from "./types/editor.types";