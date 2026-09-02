/*
Purpose:
WorkspacePanel component that delegates to Panel component for rendering module and tool panels.
Maintained for backwards compatibility.
*/
import Panel from "./Panel";
import type { PanelProps } from "./Panel";

export type WorkspacePanelProps = PanelProps;

export default Panel;

export * from "./Panel";