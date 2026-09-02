import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { StyleToken, } from "../types/styles.types";


import {
  StyleGallery,
} from "./ui/StyleGallery";

import {
  StyleSearch,
} from "./ui/StyleSearch";

import {
  StyleModifyModal,
} from "./ui/StyleModifyModal";


import {
  useEditor,
} from "@/features/editor/context/EditorContext";

import {
  useDocumentModel,
} from "@/features/editor/store/documentModel";

import { useStylesContext } from "../context/StyleContext";

export function StylesPanel() {
  const {
    editorRef,
    applyStyleToken,
  } = useEditor();

  const {
    model,
    updateStyleOverride,
    revertStyleOverride,
    setPageHtml,
  } = useDocumentModel();

  const{
    styles,
    visibleStyles,
    removedStyles,
    query,
    setQuery,
    openStyle,
    setOpenStyle,
    removeStyle,
    restoreStyle,
  } = useStylesContext();

  const overrides =
    model.styleOverrides ?? {};

   const gallery = {
    styles,
    visibleStyles,
    removedStyles,
    query,
    setQuery,
    openStyle,
    setOpenStyle,
    removeStyle,
    restoreStyle,
   };
   

  const [
    modifyTarget,
    setModifyTarget,
  ] = useState<string | null>(null);

  const listRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gallery.openStyle) {
      return;
    }

    const onEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        gallery.setOpenStyle(null);
      }
    };

    const onOutside = (
      event: MouseEvent,
    ) => {
      if (
        listRef.current &&
        !listRef.current.contains(
          event.target as Node,
        )
      ) {
        gallery.setOpenStyle(null);
      }
    };

    document.addEventListener(
      "keydown",
      onEscape,
    );

    document.addEventListener(
      "mousedown",
      onOutside,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        onEscape,
      );

      document.removeEventListener(
        "mousedown",
        onOutside,
      );
    };
  }, [
    gallery.openStyle,
    gallery.setOpenStyle,
  ]);

  const applyStyle = useCallback(
    (style: StyleToken) => {
      applyStyleToken?.(style);
      gallery.setOpenStyle(null);
    },
    [
      applyStyleToken,
      gallery.setOpenStyle,
    ],
  );

  const selectAllInstances =
    useCallback(
      (name: string) => {
        const pages =
          Array.from(
            document.querySelectorAll<HTMLElement>(
              ".prose-doc",
            ),
          );

        let elements: HTMLElement[] =
          [];

        pages.forEach((page) => {
          elements = elements.concat(
            Array.from(
              page.querySelectorAll<HTMLElement>(
                `[data-style="${CSS.escape(name)}"]`,
              ),
            ),
          );
        });

        if (!elements.length) {
          alert(
            `No instances of "${name}" found in the document.`,
          );
          return;
        }

        elements.forEach((element) => {
          element.style.outline =
            "2px solid hsl(var(--primary))";

          element.style.outlineOffset =
            "2px";

          element.style.backgroundColor =
            "rgba(59, 130, 246, 0.1)";
        });

        elements[0].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        setTimeout(() => {
          elements.forEach(
            (element) => {
              element.style.outline =
                "";

              element.style.outlineOffset =
                "";

              element.style.backgroundColor =
                "";
            },
          );
        }, 3000);
      },
      [],
    );

  const clearFormatting =
    useCallback(
      (name: string) => {
        Object.entries(
          model.pageHtml,
        ).forEach(
          ([pageId, html]) => {
            const parser =
              new DOMParser();

            const doc =
              parser.parseFromString(
                html,
                "text/html",
              );

            doc
              .querySelectorAll(
                `[data-style="${CSS.escape(name)}"]`,
              )
              .forEach(
                (element) => {
                  element.removeAttribute(
                    "style",
                  );
                },
              );

            setPageHtml(
              pageId,
              doc.body.innerHTML,
            );
          },
        );

        editorRef.current
          ?.querySelectorAll<HTMLElement>(
            `[data-style="${CSS.escape(name)}"]`,
          )
          .forEach(
            (element) => {
              element.removeAttribute(
                "style",
              );
            },
          );
      },
      [
        model.pageHtml,
        editorRef,
        setPageHtml,
      ],
    );

  const target =
    modifyTarget
      ? [
        ...visibleStyles,
        ...removedStyles,
      ].find(
        (style)=>
          style.name === modifyTarget,
      ) ?? null
      : null;

  return (
    <div className="p-3 space-y-3">

      <StyleSearch
        value={gallery.query}
        onChange={
          gallery.setQuery
        }
      />

      <div
        ref={listRef}
        className="space-y-0.5"
      >
        <StyleGallery
          styles={
            gallery.visibleStyles
          }
          openStyle={
            gallery.openStyle
          }
          overrides={overrides}
          onApply={applyStyle}
          onToggle={
            gallery.setOpenStyle
          }
          onMatch={() => {}}
          onModify={
            setModifyTarget
          }
          onSelect={
            selectAllInstances
          }
          onClear={
            clearFormatting
          }
          onRevert={
            (name) => {
              revertStyleOverride(
                name,
              );
              gallery.setOpenStyle(
                null,
              );
            }
          }
          onRemove={
            gallery.removeStyle
          }
        />

        {!gallery.visibleStyles.length &&
          gallery.query && (
            <p className="
              text-[11px]
              text-muted-foreground
              italic
              px-1
              py-2
            ">
              No styles match
              &ldquo;{gallery.query}&rdquo;
            </p>
          )}
      </div>

      {gallery.removedStyles.length >
        0 && (
        <div>
          <div className="
            text-[10px]
            font-semibold
            uppercase
            tracking-wider
            text-muted-foreground
            mb-2
          ">
            Removed from Gallery
          </div>

          <div className="space-y-0.5">
            {gallery.removedStyles.map(
              (style) => (
                <div
                  key={style.name}
                  className="
                    flex
                    items-center
                    justify-between
                    px-2.5
                    py-1.5
                    rounded-md
                    border
                    border-dashed
                    border-border
                    bg-surface-muted
                  "
                >
                  <span className="
                    text-xs
                    text-muted-foreground
                  ">
                    {style.name}
                  </span>

                  <button
                    onClick={() =>
                      gallery.restoreStyle(
                        style.name,
                      )
                    }
                    className="
                      text-[10px]
                      text-primary
                      hover:underline
                    "
                  >
                    Add back
                  </button>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {target && (
        <StyleModifyModal
          token={target}
          onSave={(update) => {
            updateStyleOverride(
              target.name,
              update,
            );

            setModifyTarget(null);
          }}
          onCancel={() =>
            setModifyTarget(null)
          }
        />
      )}
    </div>
  );
}