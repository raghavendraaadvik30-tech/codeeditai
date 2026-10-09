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
