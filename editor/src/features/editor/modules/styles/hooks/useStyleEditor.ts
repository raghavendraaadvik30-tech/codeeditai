import {
  useCallback,
} from "react";

import type {
  StyleToken,
} from "../types/styles.types";

export function useStyleEditor() {
  const selectAllInstances =
    useCallback(
      (name: string) => {
        const pages =
          Array.from(
            document.querySelectorAll<HTMLElement>(
              ".prose-doc",
            ),
          );

        let elements: HTMLElement[] = [];

        pages.forEach((page) => {
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
        });

        if (!elements.length) {
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

        window.setTimeout(() => {
          elements.forEach((element) => {
            element.style.outline = "";
            element.style.outlineOffset = "";
            element.style.backgroundColor = "";
          });
        }, 3000);
      },
      [],
    );

  const clearFormatting =
    useCallback(
      (
        name: string,
        editorRef: React.RefObject<HTMLElement | null>,
      ) => {
        editorRef.current
          ?.querySelectorAll<HTMLElement>(
            `[data-style="${CSS.escape(
              name,
            )}"]`,
          )
          .forEach((element) => {
            element.removeAttribute("style");
          });
      },
      [],
    );

  const applyStyle =
    useCallback(
      (
        style: StyleToken,
        editorRef: React.RefObject<HTMLElement | null>,
      ) => {
        editorRef.current
          ?.querySelectorAll<HTMLElement>(
            `[data-style="${CSS.escape(
              style.name,
            )}"]`,
          )
          .forEach((element) => {
            element.style.fontFamily =
              style.family;

            element.style.fontSize =
              `${style.size}pt`;

            element.style.fontWeight =
              String(style.weight);

            element.style.fontStyle =
              style.italic
                ? "italic"
                : "normal";

            element.style.textDecoration =
              style.underline
                ? "underline"
                : "none";
          });
      },
      [],
    );

  return {
    selectAllInstances,
    clearFormatting,
    applyStyle,
  };
}