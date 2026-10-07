# toggle

2026-10-07, transformation engine (hand transform per disclosure.md + class-mapping.md; callable-primitive shape cross-checked against golden src/components/ui/toggle.tsx; shared cva variants preserved, not restyled), migrated cleanly.

## Changed

- `src/shared/components/ui/toggle.tsx`: rewired import `* as TogglePrimitive from "@radix-ui/react-toggle"` -> `import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"`. `TogglePrimitive.Root` (callable single-part) -> `<TogglePrimitive>` directly. Replaced `React.forwardRef` wrapper with a plain function component typed `TogglePrimitive.Props & VariantProps<typeof toggleVariants>` (removed now-unused React import). `data-[state=on]:bg-accent data-[state=on]:text-accent-foreground` -> `data-pressed:bg-accent data-pressed:text-accent-foreground` per class-mapping.md. `toggleVariants` cva definition otherwise byte-identical. Leftover scan clean: `grep -n "radix-ui\|@radix-ui"` on this file returns no matches.

## Left alone

- Golden `src/components/ui/toggle.tsx` untouched (reference only; its size/group styling deliberately not copied).
- `src/shared/components/ui/toggle-group.tsx` item migration covered in `toggle-group.md`; this file's `toggleVariants` export contract unchanged so the group file keeps importing from `./toggle`.

## Behavior changes

- Pressed styling now keys on `data-pressed` presence (off = absence); no `data-state="off"` attribute exists. Any external CSS on the old selector must be updated (none found in scope).

## Verify by hand

- Click toggle; confirm accent background applies when pressed and clears when unpressed.
- Keyboard: Tab to focus, Space toggles; focus ring visible.
- Disabled toggle: non-interactive and dimmed.
