# popover

2026-10-07, consumer sweep (call-site migration per consumer-props.md; wrapper `src/shared/components/ui/popover.tsx` was already on `@base-ui/react/popover` with `Portal > Positioner > Popup` and positioning props forwarded to Positioner, verified untouched), migrated cleanly.

## Changed

- `src/features/editor/components/ribbon/tabs/LayoutTab.tsx:557`: `<PopoverTrigger asChild><button …>…</button></PopoverTrigger>` -> `<PopoverTrigger render={<button …>…</button>} />` (Orientation popover; controlled via `open`/`onOpenChange`, unchanged). Button props/children/classes byte-identical inside `render`.
- `src/features/editor/modules/figures/modules/chart/components/ChartHydration.tsx:358-362`: outside-click guard `!target.closest('[data-radix-popper-content-wrapper]')` -> explicit Base UI guards (`[data-slot="dropdown-menu-content"]`, `[data-slot="popover-content"]`, `[role="menu"]`, `[role="listbox"]`). Radix popper wrapper attr no longer exists in the DOM; the old selector was dead code that let popover/menu clicks deselect the chart.
- `src/features/editor/modules/figures/modules/smartart/components/SmartArtHydration.tsx:419-424`: same selector replacement (kept existing `[role="dialog"]`/`[role="toolbar"]` guards). Leftover scan clean: `grep -n "radix-ui\|@radix-ui"` on the wrapper and `grep -n "data-radix"` on src return no matches.

## Left alone

- `src/shared/components/ui/popover.tsx`: already idiomatic Base UI (Anchor dropped, Title/Description as real parts, `isolate z-50` Positioner); no changes needed.
- No `openDelay`/`closeDelay`-on-Root, `onOpenAutoFocus`/`onCloseAutoFocus`, or escape/outside-press handlers found at popover call sites; nothing else to relocate to Trigger/`initialFocus`/`finalFocus`/`onOpenChange`.

## Behavior changes

- Orientation popover trigger keeps native `<button>` semantics via `render`; no `nativeButton={false}` needed. Open/close, focus return, and outside-press dismissal unchanged.
- Chart/SmartArt deselect guards now match real Base UI popup DOM instead of a nonexistent Radix attr; clicks inside open menus/popovers no longer deselect the figure (previously they did, since the selector never matched).

## Verify by hand

- Orientation popover in LayoutTab opens from its trigger, cards select portrait/landscape, Esc/outside click closes and returns focus.
- With a chart (or SmartArt) selected, open any ribbon dropdown/popover and click inside it: the figure must stay selected; clicking blank workspace still deselects.
