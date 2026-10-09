# tabs

2026-10-07, transformation engine (hand transform per disclosure.md + class-mapping.md; part structure cross-checked against golden src/components/ui/tabs.tsx; shared styling preserved, not restyled), migrated cleanly.

## Changed

- `src/shared/components/ui/tabs.tsx`: rewired import `* as TabsPrimitive from "@radix-ui/react-tabs"` -> `import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"`. Replaced all three `React.forwardRef` wrappers with plain function components typed `TabsPrimitive.List.Props` / `Tab.Props` / `Panel.Props` (removed now-unused React import). `TabsPrimitive.Trigger` -> `TabsPrimitive.Tab`, `TabsPrimitive.Content` -> `TabsPrimitive.Panel`; public wrapper names (`Tabs/TabsList/TabsTrigger/TabsContent`) unchanged. `data-[state=active]:` (x3 on trigger) -> `data-active:` per class-mapping.md. Added `aria-disabled:pointer-events-none aria-disabled:opacity-50` alongside the existing `disabled:*` classes since Base UI Tab surfaces disabled state as `aria-disabled`. All other classNames unchanged. Leftover scan clean: `grep -n "radix-ui\|@radix-ui"` on this file returns no matches.

## Left alone

- Golden `src/components/ui/tabs.tsx` untouched (reference only; its line-variant Indicator/cva styling deliberately not copied).
- `orientation`/`activationMode` props not present on this wrapper, so no List `activateOnFocus` forwarding was needed.

## Behavior changes

- Base UI tabs default to manual activation (Radix default is automatic); arrow-key navigation moves focus without selecting until Enter/Space. Flagged, not patched (matches base registry behavior).
- Active-tab styling now keys on `data-active` presence; hidden panels carry `data-hidden` (inverted polarity vs Radix `data-state="active"` on content).

## Verify by hand

- Click each tab; confirm active tab gets background/shadow styling and panel switches.
- Keyboard: arrow keys move focus; Enter/Space activates (manual-activation behavior).
- Disabled tab: confirm it is non-interactive and visually dimmed.
