export { default as WritingPage } from "./pages/WritingPage";
export { default as WritingPanel } from "./components/WritingPanel";

export {
  WritingProvider,
  useWritingContext,
} from "./context/WritingContext";

export { useWriting } from "./hooks/useWriting";
export { useWritingTools } from "./hooks/useWritingTools";

export type {
  WritingCommand,
  WritingTool,
  CaseAction,
  FormattingTool,
  AlignmentTool,
  ListTool,
  WritingColor,
  WritingSearchState,
  ActiveDropdown,
  WritingState,
} from "./types/writing.types";