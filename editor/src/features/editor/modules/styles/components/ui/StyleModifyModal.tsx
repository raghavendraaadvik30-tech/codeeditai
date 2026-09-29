// import type {
//   StyleToken,
//   StyleOverride,
//   StyleAlignment,

// } from "../../types/styles.types";

// interface StyleModifyModalProps {
//   token: StyleToken;
//   onSave: (update: StyleOverride) => void;
//   onCancel: () => void;
// }

// export function StyleModifyModal({
//   token,
//   onSave,
//   onCancel,
// }: StyleModifyModalProps) {
//   const update: StyleOverride = {
//     font: token.font,
//     size: token.size,
//     weight: token.weight,
//     italic: token.italic,
//     underline: token.underline,
//     align: token.align,
//     lineHeight: token.lineHeight,
//     leftIndent: token.leftIndent,
//     rightIndent: token.rightIndent,
//     specialIndent: token.specialIndent,
//     specialIndentBy: token.specialIndentBy,
//     spaceBefore: token.spaceBefore,
//     spaceAfter: token.spaceAfter,
//     lineSpacingType: token.lineSpacingType,
//     lineSpacingAt: token.lineSpacingAt,
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
//       <div className="w-[420px] rounded-xl border bg-background p-5 shadow-xl">
//         <div className="mb-4">
//           <h2 className="text-base font-semibold">
//             Modify Style
//           </h2>

//           <p className="mt-1 text-xs text-muted-foreground">
//             {token.name}
//           </p>
//         </div>

//         <div className="space-y-3">
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="text-xs font-medium">
//                 Font
//               </label>

//               <input
//                 defaultValue={token.font}
//                 className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
//                 onChange={(e) => {
//                   update.font = e.target.value;
//                 }}
//               />
//             </div>

//             <div>
//               <label className="text-xs font-medium">
//                 Size
//               </label>

//               <input
//                 type="number"
//                 defaultValue={token.size}
//                 className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
//                 onChange={(e) => {
//                   update.size = Number(e.target.value);
//                 }}
//               />
//             </div>
//           </div>

//           <div>
//             <label className="text-xs font-medium">
//               Alignment
//             </label>

//             <select
//               defaultValue={token.align ?? "left"}
//               className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
//               onChange={(e) => {
//                 update.align =
//                   e.target.value as StyleAlignment;
//               }}
//             >
//               <option value="left">Left</option>
//               <option value="center">Center</option>
//               <option value="right">Right</option>
//               <option value="justify">Justify</option>
//             </select>
//           </div>

//           <div className="flex gap-4">
//             <label className="flex items-center gap-2 text-sm">
//               <input
//                 type="checkbox"
//                 defaultChecked={token.weight >= 700}
//                 onChange={(e) => {
//                   update.weight = e.target.checked
//                     ? 700
//                     : 400;
//                 }}
//               />
//               Bold
//             </label>

//             <label className="flex items-center gap-2 text-sm">
//               <input
//                 type="checkbox"
//                 defaultChecked={token.italic}
//                 onChange={(e) => {
//                   update.italic = e.target.checked;
//                 }}
//               />
//               Italic
//             </label>

//             <label className="flex items-center gap-2 text-sm">
//               <input
//                 type="checkbox"
//                 defaultChecked={token.underline}
//                 onChange={(e) => {
//                   update.underline = e.target.checked;
//                 }}
//               />
//               Underline
//             </label>
//           </div>
//         </div>

//         <div className="mt-6 flex justify-end gap-2">
//           <button
//             type="button"
//             onClick={onCancel}
//             className="rounded-md border px-4 py-2 text-sm"
//           >
//             Cancel
//           </button>

//           <button
//             type="button"
//             onClick={() => onSave(update)}
//             className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
//           >
//             Save
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


import {
  useState,
} from "react";

import type {
  StyleOverride,
  StyleToken,
} from "../../types/styles.types";

import {
  NumericInput,
} from "./NumericInput";

import {
  StyleFormRow,
} from "./StyleFormRow";

import {
  StylePreview,
} from "./StylePreview";

interface Props {
  token: StyleToken;

  onSave: (
    update: StyleOverride,
  ) => void;

  onCancel: () => void;
}

export function StyleModifyModal({
  token,
  onSave,
  onCancel,
}: Props) {
  const [form, setForm] =
    useState<StyleToken>({
      ...token,
    });

  const update =
    <K extends keyof StyleToken>(
      key: K,
      value: StyleToken[K],
    ) => {
      setForm((current) => ({
        ...current,
        [key]: value,
      }));
    };

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/40
        p-4
      "
    >
      <div
        className="
          flex
          max-h-[90vh]
          w-full
          max-w-[600px]
          flex-col
          overflow-hidden
          rounded-xl
          bg-background
          shadow-2xl
        "
      >
        {/* HEADER */}

        <div
          className="
            shrink-0
            border-b
            border-border
            px-5
            py-4
          "
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Modify Style
              </h2>

              <p className="text-sm text-muted-foreground">
                {token.name}
              </p>
            </div>

            <button
              onClick={onCancel}
              className="
                text-xl
                text-muted-foreground
                hover:text-foreground
              "
            >
              ×
            </button>
          </div>
        </div>

        {/* SCROLLING CONTENT */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-5
            py-5
          "
        >
          <div className="space-y-6">
            {/* FONT */}

            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Font
              </h3>

              <StyleFormRow label="Family">
                <select
                  value={form.family}
                  onChange={(event) =>
                    update(
                      "family",
                      event.target.value,
                    )
                  }
                  className="
                    h-9
                    w-full
                    rounded-md
                    border
                    border-border
                    bg-background
                    px-3
                  "
                >
                  <option>
                    Calibri
                  </option>

                  <option>
                    Arial
                  </option>

                  <option>
                    Times New Roman
                  </option>

                  <option>
                    Georgia
                  </option>

                  <option>
                    Verdana
                  </option>
                </select>
              </StyleFormRow>

              <StyleFormRow label="Size (pt)">
                <NumericInput
                  value={form.size}
                  min={1}
                  max={200}
                  onChange={(value) =>
                    update(
                      "size",
                      value,
                    )
                  }
                />
              </StyleFormRow>

              <StyleFormRow label="Weight">
                <select
                  value={form.weight}
                  onChange={(event) =>
                    update(
                      "weight",
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                  className="
                    h-9
                    w-full
                    rounded-md
                    border
                    border-border
                    bg-background
                    px-3
                  "
                >
                  <option value={400}>
                    400
                  </option>

                  <option value={500}>
                    500
                  </option>

                  <option value={600}>
                    600
                  </option>

                  <option value={700}>
                    700
                  </option>

                  <option value={800}>
                    800
                  </option>
                </select>
              </StyleFormRow>

              <StyleFormRow label="Style">
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      update(
                        "weight",
                        form.weight ===
                          700
                          ? 400
                          : 700,
                      )
                    }
                    className="
                      h-9
                      w-9
                      rounded-md
                      border
                      font-bold
                    "
                  >
                    B
                  </button>

                  <button
                    onClick={() =>
                      update(
                        "italic",
                        !form.italic,
                      )
                    }
                    className="
                      h-9
                      w-9
                      rounded-md
                      border
                      italic
                    "
                  >
                    I
                  </button>

                  <button
                    onClick={() =>
                      update(
                        "underline",
                        !form.underline,
                      )
                    }
                    className="
                      h-9
                      w-9
                      rounded-md
                      border
                      underline
                    "
                  >
                    U
                  </button>
                </div>
              </StyleFormRow>
            </section>

            <hr />

            {/* PARAGRAPH */}

            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Paragraph
              </h3>

              <StyleFormRow label="Alignment">
                <div className="flex gap-1">
                  {[
                    "left",
                    "center",
                    "right",
                    "justify",
                  ].map((alignment) => (
                    <button
                      key={alignment}
                      onClick={() =>
                        update(
                          "alignment",
                          alignment as StyleToken["alignment"],
                        )
                      }
                      className={`
                        rounded-md
                        border
                        px-3
                        py-2
                        text-xs
                        ${
                          form.alignment ===
                          alignment
                            ? "border-primary bg-primary/10 text-primary"
                            : ""
                        }
                      `}
                    >
                      {alignment
                        .charAt(0)
                        .toUpperCase() +
                        alignment.slice(
                          1,
                        )}
                    </button>
                  ))}
                </div>
              </StyleFormRow>

              <StyleFormRow label="Line Height">
                <NumericInput
                  value={
                    form.lineHeight ??
                    1.25
                  }
                  min={0.5}
                  max={5}
                  step={0.05}
                  onChange={(value) =>
                    update(
                      "lineHeight",
                      value,
                    )
                  }
                />
              </StyleFormRow>
            </section>

            <hr />

            {/* INDENTATION */}

            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Indentation
              </h3>

              <StyleFormRow
                label="Left Indent"
                suffix="pt"
              >
                <NumericInput
                  value={
                    form.leftIndent ?? 0
                  }
                  onChange={(value) =>
                    update(
                      "leftIndent",
                      value,
                    )
                  }
                />
              </StyleFormRow>

              <StyleFormRow
                label="Right Indent"
                suffix="pt"
              >
                <NumericInput
                  value={
                    form.rightIndent ?? 0
                  }
                  onChange={(value) =>
                    update(
                      "rightIndent",
                      value,
                    )
                  }
                />
              </StyleFormRow>

              <StyleFormRow label="Special">
                <select
                  value={
                    form.specialIndent ??
                    "none"
                  }
                  onChange={(event) =>
                    update(
                      "specialIndent",
                      event.target
                        .value as StyleToken["specialIndent"],
                    )
                  }
                  className="
                    h-9
                    w-full
                    rounded-md
                    border
                    border-border
                    bg-background
                    px-3
                  "
                >
                  <option value="none">
                    None
                  </option>

                  <option value="firstLine">
                    First line
                  </option>

                  <option value="hanging">
                    Hanging
                  </option>
                </select>
              </StyleFormRow>

              <StyleFormRow
                label="By"
                suffix="pt"
              >
                <NumericInput
                  value={
                    form.specialIndentBy ??
                    0
                  }
                  onChange={(value) =>
                    update(
                      "specialIndentBy",
                      value,
                    )
                  }
                />
              </StyleFormRow>
            </section>

            <hr />

            {/* SPACING */}

            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Spacing
              </h3>

              <StyleFormRow
                label="Space Before"
                suffix="pt"
              >
                <NumericInput
                  value={
                    form.spaceBefore ??
                    0
                  }
                  onChange={(value) =>
                    update(
                      "spaceBefore",
                      value,
                    )
                  }
                />
              </StyleFormRow>

              <StyleFormRow
                label="Space After"
                suffix="pt"
              >
                <NumericInput
                  value={
                    form.spaceAfter ??
                    0
                  }
                  onChange={(value) =>
                    update(
                      "spaceAfter",
                      value,
                    )
                  }
                />
              </StyleFormRow>

              <StyleFormRow label="Line Spacing">
                <select
                  value={
                    form.lineSpacing ??
                    "multiple"
                  }
                  onChange={(event) =>
                    update(
                      "lineSpacing",
                      event.target
                        .value as StyleToken["lineSpacing"],
                    )
                  }
                  className="
                    h-9
                    w-full
                    rounded-md
                    border
                    border-border
                    bg-background
                    px-3
                  "
                >
                  <option value="single">
                    Single
                  </option>

                  <option value="multiple">
                    Multiple
                  </option>

                  <option value="exact">
                    Exactly
                  </option>
                </select>
              </StyleFormRow>

              <StyleFormRow
                label="At"
                suffix="lines"
              >
                <NumericInput
                  value={
                    form.lineSpacingAt ??
                    1.25
                  }
                  min={0.5}
                  max={5}
                  step={0.05}
                  onChange={(value) =>
                    update(
                      "lineSpacingAt",
                      value,
                    )
                  }
                />
              </StyleFormRow>
            </section>

            <hr />

            {/* PREVIEW */}

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Preview
              </h3>

              <StylePreview token={form} />
            </section>
          </div>
        </div>

        {/* FOOTER */}

        <div
          className="
            shrink-0
            flex
            justify-end
            gap-3
            border-t
            border-border
            bg-background
            px-5
            py-3
          "
        >
          <button
            onClick={onCancel}
            className="
              rounded-md
              border
              px-4
              py-2
              text-sm
            "
          >
            Cancel
          </button>

          <button
            onClick={() =>
              onSave(form)
            }
            className="
              rounded-md
              bg-primary
              px-5
              py-2
              text-sm
              text-primary-foreground
            "
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}