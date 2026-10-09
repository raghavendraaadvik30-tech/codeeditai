import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { StyleToken } from "../types/styles.types";

import { StyleGallery } from "./ui/StyleGallery";
import { StyleSearch } from "./ui/StyleSearch";
import { StyleModifyModal } from "./ui/StyleModifyModal";

import { useEditor } from "@/features/editor/context/EditorContext";
import { useDocumentModel } from "@/features/editor/store/documentModel";

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

  const {
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

  const overrides = model.styleOverrides ?? {};

  const [modifyTarget, setModifyTarget] =
    useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);

  /*
   * ---------------------------------------------------------
   * RESOLVED STYLES
   * ---------------------------------------------------------
   *
   * Default style + user override
   */
  const resolvedStyles = useMemo(() => {
    return styles.map((style) => ({
      ...style,
      ...(overrides[style.name] ?? {}),
    }));
  }, [styles, overrides]);

  /*
   * ---------------------------------------------------------
   * TARGET STYLE FOR MODIFY MODAL
   * ---------------------------------------------------------
   */
  const target = useMemo(() => {
    if (!modifyTarget) {
      return null;
    }

    return (
      [...resolvedStyles, ...removedStyles].find(
        (style) => style.name === modifyTarget,
      ) ?? null
    );
  }, [
    modifyTarget,
    resolvedStyles,
    removedStyles,
  ]);

  /*
   * ---------------------------------------------------------
   * ESC + OUTSIDE CLICK
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (!openStyle) {
      return;
    }

    const onEscape = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setOpenStyle(null);
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
        setOpenStyle(null);
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
    openStyle,
    setOpenStyle,
  ]);

  /*
   * ---------------------------------------------------------
   * APPLY STYLE
   * ---------------------------------------------------------
   */
  const applyStyle = useCallback(
    (style: StyleToken) => {
      applyStyleToken?.(style);

      setOpenStyle(null);
    },
    [
      applyStyleToken,
      setOpenStyle,
    ],
  );

  /*
   * ---------------------------------------------------------
   * UPDATE STYLE TO MATCH CURRENT SELECTION
   * ---------------------------------------------------------
   */
  const updateToMatch = useCallback(
    (styleName: string) => {
      const selection =
        window.getSelection();

      if (
        !selection ||
        selection.rangeCount === 0 ||
        selection.isCollapsed
      ) {
        alert(
          "Please select formatted text in the editor first.",
        );

        return;
      }

      const range =
        selection.getRangeAt(0);

      const node =
        range.commonAncestorContainer;

      const element =
        node.nodeType === Node.TEXT_NODE
          ? node.parentElement
          : (node as HTMLElement);

      if (!element) {
        return;
      }

      const computed =
        window.getComputedStyle(
          element,
        );

      /*
       * Font
       */
      const font =
        computed.fontFamily
          .split(",")[0]
          .replace(/['"]/g, "")
          .trim() || "Calibri";

      /*
       * Browser px -> points
       *
       * 1pt ≈ 1.333px
       */
      const size =
        Math.round(
          parseFloat(
            computed.fontSize,
          ) * 0.75,
        ) || 11;

      /*
       * Font weight
       */
      const weight =
        parseInt(
          computed.fontWeight,
          10,
        ) || 400;

      /*
       * Italic
       */
      const italic =
        computed.fontStyle ===
        "italic";

      /*
       * Alignment
       */
      const textAlign =
        computed.textAlign ===
        "start"
          ? "left"
          : computed.textAlign ===
              "end"
            ? "right"
            : computed.textAlign;

      const align = [
        "left",
        "center",
        "right",
        "justify",
      ].includes(textAlign)
        ? textAlign
        : "left";

      /*
       * Build override
       */
      const update: Partial<StyleToken> =
        {
          family:font,
          size,
          weight,
          italic,
          alignment: align as StyleToken["alignment"],
        };

      /*
       * Space before
       */
      if (computed.marginTop) {
        update.spaceBefore =
          Math.round(
            parseFloat(
              computed.marginTop,
            ) * 0.75,
          );
      }

      /*
       * Space after
       */
      if (computed.marginBottom) {
        update.spaceAfter =
          Math.round(
            parseFloat(
              computed.marginBottom,
            ) * 0.75,
          );
      }

      /*
       * Left indent
       */
      if (computed.paddingLeft) {
        update.leftIndent =
          Math.round(
            parseFloat(
              computed.paddingLeft,
            ) * 0.75,
          );
      }

      /*
       * Right indent
       */
      if (computed.paddingRight) {
        update.rightIndent =
          Math.round(
            parseFloat(
              computed.paddingRight,
            ) * 0.75,
          );
      }

      updateStyleOverride(
        styleName,
        update,
      );

      setOpenStyle(null);
    },
    [
      updateStyleOverride,
      setOpenStyle,
    ],
  );

  /*
   * ---------------------------------------------------------
   * SELECT ALL INSTANCES
   * ---------------------------------------------------------
   */
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

        pages.forEach(
          (page) => {
            elements =
              elements.concat(
                Array.from(
                  page.querySelectorAll<HTMLElement>(
                    `[data-style="${CSS.escape(
                      name,
                    )}"]`,
                  ),
                ),
              );
          },
        );

        if (!elements.length) {
          alert(
            `No instances of "${name}" found in the document.`,
          );

          return;
        }

        /*
         * Highlight all instances
         */
        elements.forEach(
          (element) => {
            element.style.outline =
              "2px solid hsl(var(--primary))";

            element.style.outlineOffset =
              "2px";

            element.style.backgroundColor =
              "rgba(59, 130, 246, 0.1)";
          },
        );

        /*
         * Scroll first matching element
         * into view.
         */
        elements[0].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        /*
         * Focus editor page if possible.
         */
        const pageContainer =
          elements[0].closest(
            "[data-page-id]",
          ) as HTMLElement | null;

        if (pageContainer) {
          const page =
            pageContainer.querySelector(
              ".prose-doc",
            ) as HTMLElement | null;

          page?.focus();
        }

        /*
         * Remove highlight after 3 sec.
         */
        window.setTimeout(() => {
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

  /*
   * ---------------------------------------------------------
   * CLEAR FORMATTING
   * ---------------------------------------------------------
   */
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
                `[data-style="${CSS.escape(
                  name,
                )}"]`,
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

        /*
         * Update active editor DOM.
         */
        editorRef.current
          ?.querySelectorAll<HTMLElement>(
            `[data-style="${CSS.escape(
              name,
            )}"]`,
          )
          .forEach(
            (element) => {
              element.removeAttribute(
                "style",
              );
            },
          );

        setOpenStyle(null);
      },
      [
        model.pageHtml,
        editorRef,
        setPageHtml,
        setOpenStyle,
      ],
    );

  /*
   * ---------------------------------------------------------
   * REVERT STYLE
   * ---------------------------------------------------------
   */
  const revertStyle =
    useCallback(
      (name: string) => {
        revertStyleOverride(name);

        setOpenStyle(null);
      },
      [
        revertStyleOverride,
        setOpenStyle,
      ],
    );

  /*
   * ---------------------------------------------------------
   * REMOVE STYLE
   * ---------------------------------------------------------
   */
  const handleRemove =
    useCallback(
      (name: string) => {
        removeStyle(name);
        setOpenStyle(null);
      },
      [
        removeStyle,
        setOpenStyle,
      ],
    );

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */
  return (
    <div
      className="
        flex
        h-full
        min-h-0
        flex-col
        p-3
      "
    >
      {/* ------------------------------------------------ */}
      {/* SEARCH - FIXED AT TOP                            */}
      {/* ------------------------------------------------ */}

      <div className="shrink-0">
        <StyleSearch
          value={query}
          onChange={setQuery}
        />
      </div>

      {/* ------------------------------------------------ */}
      {/* SCROLLABLE STYLE GALLERY                        */}
      {/* ------------------------------------------------ */}

      <div
        ref={listRef}
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overflow-x-hidden
          space-y-0.5
          pr-1
          scrollbar-thin
        "
      >
        <StyleGallery
          styles={visibleStyles}
          openStyle={openStyle}
          overrides={overrides}
          onApply={applyStyle}
          onToggle={setOpenStyle}
          onMatch={updateToMatch}
          onModify={setModifyTarget}
          onSelect={selectAllInstances}
          onClear={clearFormatting}
          onRevert={revertStyle}
          onRemove={handleRemove}
        />

        {/* -------------------------------------------- */}
        {/* NO SEARCH RESULTS                             */}
        {/* -------------------------------------------- */}

        {!visibleStyles.length &&
          query && (
            <p
              className="
                px-1
                py-2
                text-11px
                italic
                text-muted-foreground
              "
            >
              No styles match
              &ldquo;
              {query}
              &rdquo;
            </p>
          )}

        {/* -------------------------------------------- */}
        {/* REMOVED STYLES                               */}
        {/* -------------------------------------------- */}

        {removedStyles.length >
          0 && (
          <div className="pt-3">
            <div
              className="
                mb-2
                px-1
                text-10px
                font-semibold
                uppercase
                tracking-wider
                text-muted-foreground
              "
            >
              Removed from Gallery
            </div>

            <div className="space-y-0.5">
              {removedStyles.map(
                (style) => (
                  <div
                    key={style.name}
                    className="
                      flex
                      items-center
                      justify-between
                      rounded-md
                      border
                      border-dashed
                      border-border
                      bg-surface-muted
                      px-2.5
                      py-1.5
                    "
                  >
                    <span
                      className="
                        text-xs
                        text-muted-foreground
                      "
                    >
                      {style.name}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        restoreStyle(
                          style.name,
                        )
                      }
                      className="
                        text-10px
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

        {/* Bottom breathing space */}
        <div className="h-3" />
      </div>

      {/* ------------------------------------------------ */}
      {/* MODIFY MODAL                                    */}
      {/* ------------------------------------------------ */}

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
