export type WritingCommand =
  | "bold"
  | "italic"
  | "underline"
  | "strikeThrough"
  | "subscript"
  | "superscript"
  | "justifyLeft"
  | "justifyCenter"
  | "justifyRight"
  | "justifyFull"
  | "foreColor"
  | "hiliteColor"
  | "insertUnorderedList"
  | "insertOrderedList";

export interface WritingTool {
  name: string;
  tags: string[];
}

export interface CaseAction {
  label: string;
  tags: string[];
  transform: (value: string) => string;
}

export interface FormattingTool {
  name: string;
  cmd: WritingCommand;
  shortcut?: string;
  tags: string[];
}

export interface AlignmentTool {
  name: string;
  cmd:
    | "justifyLeft"
    | "justifyCenter"
    | "justifyRight"
    | "justifyFull";
  tags: string[];
}

export interface ListTool {
  name: string;
  cmd?: "insertUnorderedList" | "insertOrderedList";
  type: "bullets" | "numbering" | "multilevel";
  tags: string[];
}

export interface WritingColor {
  name: string;
  value: string;
}

export interface WritingSearchState {
  query: string;
}

export type ActiveDropdown =
  | "bullets"
  | "numbering"
  | "multilevel"
  | null;

export interface WritingState {
  searchQuery: string;
  activeDropdown: ActiveDropdown;
  showShortcutsModal: boolean;
}