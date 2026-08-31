/*Purpose:
Defines the icon mapping for workspace modules. It connects each ModuleId with its corresponding Lucide icon.

What each part does:

ModuleId – Ensures only valid workspace module names can be used.
WORKSPACE_ICONS – Maps each module to an icon.
Record<ModuleId, ...> – Provides TypeScript type safety so every workspace module must have an icon.
ComponentType – Allows the mapped icons to be used as React components.
Lucide icons – Provides the visual icons for modules such as Document, Writing, Tables, References, Templates, and Settings.

In short:
workspaceIcons.ts is a central icon configuration file. 
It keeps the module-to-icon mapping in one place so workspace components can dynamically display the correct icon without hardcoding icons repeatedly.
*/

import type { ComponentType } from "react";

import {
  FileText,
  Link2,
  PenLine,
  Palette,
  Table2,
  Image,
  BookOpen,
  Sigma,
  Files,
  FileDiff,
  LayoutTemplate,
  Settings,
} from "lucide-react";

import type { ModuleId } from "../../data/workspaceModules";

export const WORKSPACE_ICONS: Record<
  ModuleId,
  ComponentType<{ className?: string }>
> = {
  document: FileText,
  links: Link2,
  writing: PenLine,
  styles: Palette,
  tables: Table2,
  figures: Image,
  references: BookOpen,
  symbols: Sigma,
  appendices: Files,
  trackChanges: FileDiff,
  templates: LayoutTemplate,
  settings: Settings,
};