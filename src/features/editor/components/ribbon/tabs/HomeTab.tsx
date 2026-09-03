/*
Purpose:
Provides font, font-size, Undo, and Redo controls in the editor Home ribbon.

Responsibilities:

Changes font and font size.
Tracks selected text formatting.
Handles Undo/Redo.
Uses EditorContext for the editor reference.

Hardcoded? Partially — font options are defined in constant.ts.

Backend needed? ❌ No. These features work on the frontend.

Backend needed for: Saving, auto-save, document history, collaboration, and document synchronization.*/

import { useEffect, useState } from "react";

import {
  Undo2,
  Redo2,
} from "lucide-react";
import {
  FONTS,
  FONT_SIZES,
} from "../constant";

import RibbonSelect from "../controls/RibbonSelect";
import RibbonDivider from "../controls/RibbonDivider";
import RibbonIconButton from "../controls/RibbonIconButton";

import { useEditor } from "../../../context/EditorContext";

export default function HomeTab() {
  const { editorRef } = useEditor();

  const [fontName, setFontName] =
    useState("Calibri");

  const [fontSize, setFontSize] =
    useState("12");

 

  /* =====================================================
     Execute browser command
  ====================================================== */

  const exec = (
    command: string,
    value?: string 
  ) => {
    editorRef.current?.focus();

    document.execCommand(
      command,
      false,
      value
    );
  };

  /* =====================================================
     Read current selection formatting
  ====================================================== */

  useEffect(() => {
    const updateToolbar = () => {
      const font =
        document.queryCommandValue("fontName");

      if (font) {
        setFontName(
          font.replace(/['"]/g, "")
        );
      }

      const size =
        document.queryCommandValue("fontSize");

      if (size) {
        const match =
          FONT_SIZES.find(
            (item) =>
              item.command === size
          );

        if (match) {
          setFontSize(match.label);
        }
      }
    };

    document.addEventListener(
      "selectionchange",
      updateToolbar
    );

    return () => {
      document.removeEventListener(
        "selectionchange",
        updateToolbar
      );
    };
  }, []);

  return (
    <div
      className="
        flex
        items-center
        gap-2

        text-slate-700

        dark:text-slate-200
      "
    >

      {/* =====================================================
          Font
      ====================================================== */}

      <RibbonSelect
        width={170}
        label={fontName}
        options={FONTS.map((font) => ({
          label: font,

          onSelect: () => {
            setFontName(font);

            exec(
              "fontName",
              font
            );
          },
        }))}
      />


      {/* =====================================================
          Font Size
      ====================================================== */}

      <RibbonSelect
        width={70}
        label={fontSize}
        options={FONT_SIZES.map(
          (size) => ({
            label: size.label,

            onSelect: () => {
              setFontSize(
                size.label
              );

              exec(
                "fontSize",
                size.command
              );
            },
          })
        )}
      />

      <RibbonDivider />

      {/* =====================================================
          Undo / Redo
      ====================================================== */}

      <RibbonIconButton
        title="Undo"
        icon={<Undo2 className="h-4 w-4"/>}
        
        onClick={() =>
          exec("undo")
        }
      />

      <RibbonIconButton
        title="Redo"
        icon={ <Redo2 className="h-4 w-4" />}
      
        onClick={() =>
          exec("redo")
        }
      />

    </div>
  );
}