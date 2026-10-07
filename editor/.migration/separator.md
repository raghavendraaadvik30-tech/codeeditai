# separator

2026-10-07, transformation engine (hand transform per display-misc.md; callable shape cross-checked against golden src/components/ui/separator.tsx; shared classNames preserved), migrated cleanly.

## Changed

- `src/shared/components/ui/separator.tsx`: rewired import `* as SeparatorPrimitive from "@radix-ui/react-separator"` -> `import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"`. `SeparatorPrimitive.Root` (callable single-part) -> `<SeparatorPrimitive>` directly. Replaced `React.forwardRef` wrapper with a plain function component typed `SeparatorPrimitive.Props` (removed now-unused React import). Dropped the `decorative` prop (Base UI separator is always semantic `role="separator"`; per display-misc.md use a plain div or CSS border for purely visual rules). `orientation` prop and the conditional `h-[1px] w-full` / `h-full w-[1px]` classes unchanged. Leftover scan clean: `grep -n "radix-ui\|@radix-ui"` on this file returns no matches.

## Left alone

- Golden `src/components/ui/separator.tsx` untouched (reference only; its `data-horizontal:`/`data-vertical:` variants deliberately not copied — shared orientation-conditional classes kept).
- No non-radix libraries involved.

## Behavior changes

- Separator is now always exposed to assistive technology (`role="separator"`); consumers that passed `decorative={true}` for a purely visual rule lose the `aria-hidden` treatment. Flagged: if any call site needs a decorative rule, replace with a plain `<div aria-hidden="true">` or border utility.

## Verify by hand

- Render horizontal and vertical separators; confirm 1px line, correct axis sizing, and `bg-border` color in both themes.
