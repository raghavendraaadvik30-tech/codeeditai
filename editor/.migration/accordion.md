# accordion

2026-10-07, transformation engine (hand transform per disclosure.md + class-mapping.md + wrapper-shapes.md; part structure cross-checked against golden src/components/ui/accordion.tsx; shared styling preserved, not restyled), migrated cleanly.

## Changed

- `src/shared/components/ui/accordion.tsx`: rewired import `* as AccordionPrimitive from "@radix-ui/react-accordion"` -> `import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"`. Replaced all three `React.forwardRef` wrappers with plain function components typed `AccordionPrimitive.Item.Props` / `Trigger.Props` / `Panel.Props` (ref flows via React 19 props spread; removed now-unused React import). `AccordionPrimitive.Content` -> `AccordionPrimitive.Panel` with `AccordionPrimitive.Panel.Props` type. Trigger icon-rotation selector `[&[data-state=open]>svg]:rotate-180` -> `[&[data-panel-open]>svg]:rotate-180` (per disclosure.md, Base UI Trigger uses `data-panel-open`, not `data-open`). Panel animation classes mechanically renamed to `data-open:animate-accordion-down data-closed:animate-accordion-up` (kept, per preserve-styling rule); inner div gained `h-(--accordion-panel-height) data-starting-style:h-0 data-ending-style:h-0` per wrapper-shapes.md so the height transition works on the Base UI transition model. All other classNames unchanged. Leftover scan clean: `grep -n "radix-ui\|@radix-ui"` on this file returns no matches.

## Left alone

- Golden `src/components/ui/accordion.tsx` untouched (reference only; mira styling deliberately not copied).
- No other files import or wrap the shared accordion parts in ways needing call-site changes (wrapper API names `Accordion/AccordionItem/AccordionTrigger/AccordionContent` unchanged; value/onValueChange array-model caveat applies only to consumers using controlled state — none found in scope).

## Behavior changes

- Trigger open styling now keys on `data-panel-open` (presence) instead of `data-state="open"`; closed state is the absence of `data-open` on Panel (Base UI accordion emits no `data-closed`, so the kept `data-closed:animate-accordion-up` class is inert until restated with `data-ending-style`).
- Base UI single mode is always collapsible and `value` is always an array; controlled consumers must adapt (`value="a"` -> `value={["a"]}`, ignore empty-array updates to forbid closing). Orientation/roving-focus props dropped (no-op).
- Open/close animation now depends on the `data-starting-style`/`data-ending-style` transition hooks rather than Radix mount/unmount keyframes.

## Verify by hand

- Expand/collapse each item with mouse; chevron rotates 180deg when open.
- Keyboard: Tab to trigger, Enter/Space toggles; confirm focus stays visible.
- Confirm panel height animates smoothly (no snap) on open and close.
