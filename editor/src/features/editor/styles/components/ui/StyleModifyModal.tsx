import type {
  StyleToken,
  StyleOverride,
  StyleAlignment,

} from "../../types/styles.types";

interface StyleModifyModalProps {
  token: StyleToken;
  onSave: (update: StyleOverride) => void;
  onCancel: () => void;
}

export function StyleModifyModal({
  token,
  onSave,
  onCancel,
}: StyleModifyModalProps) {
  const update: StyleOverride = {
    font: token.font,
    size: token.size,
    weight: token.weight,
    italic: token.italic,
    underline: token.underline,
    align: token.align,
    lineHeight: token.lineHeight,
    leftIndent: token.leftIndent,
    rightIndent: token.rightIndent,
    specialIndent: token.specialIndent,
    specialIndentBy: token.specialIndentBy,
    spaceBefore: token.spaceBefore,
    spaceAfter: token.spaceAfter,
    lineSpacingType: token.lineSpacingType,
    lineSpacingAt: token.lineSpacingAt,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[420px] rounded-xl border bg-background p-5 shadow-xl">
        <div className="mb-4">
          <h2 className="text-base font-semibold">
            Modify Style
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            {token.name}
          </p>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium">
                Font
              </label>

              <input
                defaultValue={token.font}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                onChange={(e) => {
                  update.font = e.target.value;
                }}
              />
            </div>

            <div>
              <label className="text-xs font-medium">
                Size
              </label>

              <input
                type="number"
                defaultValue={token.size}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                onChange={(e) => {
                  update.size = Number(e.target.value);
                }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium">
              Alignment
            </label>

            <select
              defaultValue={token.align ?? "left"}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              onChange={(e) => {
                update.align =
                  e.target.value as StyleAlignment;
              }}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                defaultChecked={token.weight >= 700}
                onChange={(e) => {
                  update.weight = e.target.checked
                    ? 700
                    : 400;
                }}
              />
              Bold
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                defaultChecked={token.italic}
                onChange={(e) => {
                  update.italic = e.target.checked;
                }}
              />
              Italic
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                defaultChecked={token.underline}
                onChange={(e) => {
                  update.underline = e.target.checked;
                }}
              />
              Underline
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onSave(update)}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}