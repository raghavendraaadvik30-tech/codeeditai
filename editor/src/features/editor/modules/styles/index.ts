// ============================================================
// STYLES PAGE
// ============================================================

export {
  default as StylesPage,
} from "./pages/StylesPage";

export * from "./types/styles.types";

// ============================================================
// STYLES COMPONENTS
// ============================================================

export {
  StylesPanel,
} from "./components/StylesPanel";

export {
  StyleGallery,
} from "./components/ui/StyleGallery";

export {
  StyleCard,
} from "./components/ui/StyleCard";

export {
  StyleContextMenu,
} from "./components/ui/StyleContextMenu";

export {
  StyleModifyModal,
} from "./components/ui/StyleModifyModal";

export {
  StyleSearch,
} from "./components/ui/StyleSearch";

export {
  StylePreview,
} from "./components/ui/StylePreview";

export {
  NumericInput,
} from "./components/ui/NumericInput";

export {
  StyleFormRow,
} from "./components/ui/StyleFormRow";

// ============================================================
// CONTEXT
// ============================================================

export {
  StylesProvider,
  useStylesContext,
} from "./context/StyleContext";

// ============================================================
// HOOKS
// ============================================================

export {
  useStyles,
} from "./hooks/useStyles";

export {
  useStyleGallery,
} from "./hooks/useStyleGallery";

export {
  useStyleEditor,
} from "./hooks/useStyleEditor";

// ============================================================
// SERVICES
// ============================================================

export {
  StylesService,
  stylesService,
} from "./services/StylesService";

// ============================================================
// REPOSITORY
// ============================================================

export {
  StylesRepository,
  stylesRepository,
} from "./repository/StyleRepository";

// ============================================================
// API
// ============================================================

export {
  stylesApi,
} from "./api/stylesApi";

// ============================================================
// TYPES
// ============================================================

export type {
  StyleToken,
  StyleOverride,
  StyleOverrides,
  StylesState,
  StylesContextValue,
  ModifyStyleValues,
  StyleAlignment,
  LineSpacingType,
  SpecialIndent,
} from "./types/styles.types";

// ============================================================
// CONSTANTS
// ============================================================

export {
  DEFAULT_STYLE_TOKENS,
  STYLE_FONTS,
  STYLE_WEIGHTS,
  STYLE_ALIGNMENTS,
  LINE_SPACING_OPTIONS,
  SPECIAL_INDENT_OPTIONS,
} from "./constants/styles.constants";

// ============================================================
// UTILS
// ============================================================

export {
  buildStyleString,
  mergeStyle,
  styleToModifyValues,
  previewFontSize,
  getPreviewFontSize,
} from "./utils/styleUtil";

export {
  validateStyle,
} from "./utils/styleValidation";