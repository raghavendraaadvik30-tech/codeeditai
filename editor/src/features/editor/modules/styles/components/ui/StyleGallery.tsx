import type { StyleToken } from "../../types/styles.types";
import { StyleCard } from "./StyleCard";

interface Props {
  styles: StyleToken[];
  openStyle: string | null;
  overrides: Record<
    string,
    Partial<StyleToken>
  >;

  onApply: (
    style: StyleToken,
  ) => void;

  onToggle: (
    name: string,
  ) => void;

  onMatch: (
    name: string,
  ) => void;

  onModify: (
    name: string,
  ) => void;

  onSelect: (
    name: string,
  ) => void;

  onClear: (
    name: string,
  ) => void;

  onRevert: (
    name: string,
  ) => void;

  onRemove: (
    name: string,
  ) => void;
}

export function StyleGallery({
  styles,
  openStyle,
  overrides,
  onApply,
  onToggle,
  onMatch,
  onModify,
  onSelect,
  onClear,
  onRevert,
  onRemove,
}: Props) {
  return (
    <div className="space-y-0.5">
      {styles.map((style) => (
        <StyleCard
          key={style.name}
          token={style}
          open={
            openStyle === style.name
          }
          hasOverrides={
            Boolean(
              overrides[style.name],
            )
          }
          onApply={() =>
            onApply(style)
          }
          onToggle={() =>
            onToggle(style.name)
          }
          onMatch={() =>
            onMatch(style.name)
          }
          onModify={() =>
            onModify(style.name)
          }
          onSelect={() =>
            onSelect(style.name)
          }
          onClear={() =>
            onClear(style.name)
          }
          onRevert={() =>
            onRevert(style.name)
          }
          onRemove={() =>
            onRemove(style.name)
          }
        />
      ))}
    </div>
  );
}
