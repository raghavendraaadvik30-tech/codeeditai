# toggle-group

2026-10-07, transformation engine (hand transform per disclosure.md + class-mapping.md; composition shape cross-checked against golden src/components/ui/toggle-group.tsx; shared context/variant logic and classNames preserved), migrated cleanly.

## Changed

- `src/shared/components/ui/toggle-group.tsx`: rewired import `* as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"` -> `import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"` plus `import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"`. `ToggleGroupPrimitive.Root` (callable) -> `<ToggleGroupPrimitive>`; `ToggleGroupPrimitive.Item` -> `<TogglePrimitive>` (Base UI reuses the Toggle primitive as group items, per disclosure.md). Replaced both `React.forwardRef` wrappers with plain function components typed `ToggleGroupPrimitive.Props & VariantProps<...>` and `TogglePrimitive.Props & VariantProps<...>` (React import kept for the context). `ToggleGroupContext` provider logic, `toggleVariants` resolution (`context.variant || variant`), and all classNames unchanged; relative `import { toggleVariants } from "./toggle"` preserved. Leftover scan clean: `grep -n "radix-ui\|@radix-ui"` on this file returns no matches.

## Left alone

- Golden `src/components/ui/toggle-group.tsx` untouched (reference only; its spacing/orientation data-attribute API deliberately not copied).
- No `rovingFocus`/`loop`/`dir` props were used on this wrapper, so dropped-prop handling was a no-op.

## Behavior changes

- Group `value`/`defaultValue`/`onValueChange` are now always arrays (`Value[]`); single-mode empty selection reports `[]` (Radix reported `""`). Controlled consumers must adapt. Roving focus is always on in Base UI (`rovingFocus={false}` has no equivalent).
- Item pressed styling keys on `data-pressed` (via the shared toggleVariants classes, already migrated in `toggle.md`).

## Verify by hand

- Click items in single and multiple groups; confirm selection styling follows.
- Keyboard: arrow keys move between items, Space/Enter toggles.
- Confirm group-level variant/size props still propagate to items via context.
