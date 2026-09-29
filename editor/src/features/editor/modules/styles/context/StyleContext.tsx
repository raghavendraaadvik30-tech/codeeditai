// import {
//   createContext,
//   useContext,
//   useMemo,
// } from "react";

// import {
//   DEFAULT_STYLE_TOKENS,
// } from "../constants/styles.constants";

// import {
//   useStyleGallery,
// } from "../hooks/useStyleGallery";

// import type {
//   StyleToken,
//   StylesContextValue,
// } from "../types/styles.types";

// interface Props {
//   children: React.ReactNode;

//   styles?: StyleToken[];

//   overrides?: Record<
//     string,
//     Partial<StyleToken>
//   >;
// }

// const StylesContext =
//   createContext<StylesContextValue | null>(
//     null,
//   );

// export function StylesProvider({
//   children,
//   styles = DEFAULT_STYLE_TOKENS,
//   overrides = {},
// }: Props) {
//   const gallery =
//     useStyleGallery(
//       styles,
//       overrides,
//     );

//   const value =
//     useMemo<StylesContextValue>(
//       () => ({
//         styles,

//         visibleStyles:
//           gallery.visibleStyles,

//         removedStyles:
//           gallery.removedStyles,

//         query:
//           gallery.query,

//         setQuery:
//           gallery.setQuery,

//         openStyle:
//           gallery.openStyle,

//         setOpenStyle:
//           gallery.setOpenStyle,

//         /*
//          * These operations are handled by
//          * StylesPanel because they require
//          * access to the editor/document model.
//          */
//         applyStyle: () => {},

//         updateToMatchSelection:
//           () => {},

//         selectAllInstances:
//           () => {},

//         clearFormatting:
//           () => {},

//         revertStyle:
//           () => {},

//         removeStyle:
//           gallery.removeStyle,

//         restoreStyle:
//           gallery.restoreStyle,

//         modifyStyle:
//           () => {},
//       }),
//       [
//         styles,
//         gallery,
//       ],
//     );

//   return (
//     <StylesContext.Provider
//       value={value}
//     >
//       {children}
//     </StylesContext.Provider>
//   );
// }

// export function useStylesContext() {
//   const context =
//     useContext(StylesContext);

//   if (!context) {
//     throw new Error(
//       "useStylesContext must be used inside StylesProvider",
//     );
//   }

//   return context;
// }

import {
  createContext,
  useContext,
  useMemo,
} from "react";

import {
  useStyles,
} from "../hooks/useStyles";

import {
  useStyleGallery,
} from "../hooks/useStyleGallery";

interface StyleContextValue {
  styles: ReturnType<
    typeof useStyles
  >["styles"];

  visibleStyles: ReturnType<
    typeof useStyleGallery
  >["visibleStyles"];

  removedStyles: ReturnType<
    typeof useStyleGallery
  >["removedStyles"];

  query: string;

  setQuery: (
    value: string,
  ) => void;

  openStyle: string | null;

  setOpenStyle: (
    value: string | null,
  ) => void;

  removeStyle: (
    name: string,
  ) => void;

  restoreStyle: (
    name: string,
  ) => void;
}

const StyleContext =
  createContext<
    StyleContextValue | undefined
  >(undefined);

export function StyleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    styles,
  } = useStyles();

  const gallery =
    useStyleGallery(styles);

  const value = useMemo(
    () => ({
      styles,

      visibleStyles:
        gallery.visibleStyles,

      removedStyles:
        gallery.removedStyles,

      query:
        gallery.query,

      setQuery:
        gallery.setQuery,

      openStyle:
        gallery.openStyle,

      setOpenStyle:
        gallery.setOpenStyle,

      removeStyle:
        gallery.removeStyle,

      restoreStyle:
        gallery.restoreStyle,
    }),
    [styles, gallery],
  );

  return (
    <StyleContext.Provider
      value={value}
    >
      {children}
    </StyleContext.Provider>
  );
}

export function useStylesContext() {
  const context =
    useContext(StyleContext);

  if (!context) {
    throw new Error(
      "useStylesContext must be used inside StyleProvider",
    );
  }

  return context;
}