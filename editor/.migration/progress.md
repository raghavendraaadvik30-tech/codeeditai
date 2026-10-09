# progress

2026-10-07, transformation engine (hand transform per display-misc.md; Track/Indicator anatomy cross-checked against golden src/components/ui/progress.tsx; shared classNames preserved, not restyled), migrated cleanly.

## Changed

- `src/shared/components/ui/progress.tsx`: rewired import `* as ProgressPrimitive from "@radix-ui/react-progress"` -> `import { Progress as ProgressPrimitive } from "@base-ui/react/progress"`. Replaced `React.forwardRef` wrapper with a plain function component typed `ProgressPrimitive.Root.Props` (removed now-unused React import). Added the new required `ProgressPrimitive.Track` wrapper around `ProgressPrimitive.Indicator`. Deleted the manual `style={{ transform: translateX(-(100 - value)%) }}` on Indicator (the Base UI primitive computes fill width itself). `value` is now passed explicitly to `ProgressPrimitive.Root` (`value={value}`; previously consumed only for the manual transform, leaving Root uncontrolled). Root and Indicator classNames unchanged. Leftover scan clean: `grep -n "radix-ui\|@radix-ui"` on this file returns no matches.

## Left alone

- Golden `src/components/ui/progress.tsx` untouched (reference only; its Label/Value/children-composition API deliberately not copied — shared single-bar shape kept).
- No `getValueLabel` prop was used on this wrapper, so the `getAriaValueText` rename was a no-op.

## Behavior changes

- Fill width is now primitive-computed (inline style from Base UI) rather than the manual translateX; indeterminate state is `value={null}`. State attributes are now `data-progressing`/`data-complete`/`data-indeterminate` presence hooks (Radix `data-state="loading|complete|indeterminate"` gone); `data-value`/`data-max` dropped.

## Verify by hand

- Render with value 0/50/100; confirm bar fills left-to-right proportionally with smooth `transition-all`.
- Render with `value={null}`; confirm indeterminate rendering (no crash, no full-bar flash).
