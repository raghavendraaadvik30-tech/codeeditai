# dropdown-menu

2026-10-07, consumer sweep (call-site migration per consumer-props.md; wrapper `src/shared/components/ui/dropdown-menu.tsx` was already on `@base-ui/react/menu` from the base-mira shadcn init, verified untouched), migrated cleanly.

## Changed

- `src/features/editor/components/ribbon/tabs/ChartDesignTab.tsx:67,226,260`: `<DropdownMenuTrigger asChild><button …>…</button></DropdownMenuTrigger>` -> `<DropdownMenuTrigger render={<button …>…</button>} />` (3 sites). Button element, props, children, and classes byte-identical inside `render`.
- `src/features/editor/components/ribbon/tabs/ChartFormatTab.tsx:47,87`: same `asChild` -> `render` transform (2 sites).
- `src/features/editor/components/ribbon/tabs/HeaderFooterTab.tsx:464,557,788`: same transform (3 sites; page-number trigger included).
- `src/features/editor/components/ribbon/tabs/LayoutTab.tsx:458,752,815,899,1007`: same transform (5 sites).
- `src/features/editor/components/ribbon/tabs/InsertTab.tsx:232`: same transform (1 site).
- `src/features/editor/modules/figures/modules/chart/components/ChartSection.tsx:73`, `.../icons/components/IconsSection.tsx:43`, `.../shapes/components/ShapesSection.tsx:43`, `.../pictures/components/PicturesSection.tsx:129`, `.../smartart/components/SmartArtSection.tsx:56`: same transform (1 site each).
- `src/features/editor/modules/document/components/HeaderFooterGallery.tsx:25-34,77-103,155-233`: `customTrigger?: React.ReactNode` with `{customTrigger ? customTrigger : <button/>}` child of `asChild` trigger -> `customTrigger?: React.ReactElement` with `render={customTrigger ?? (<button …>…</button>)}` self-closing trigger (Header + Footer galleries). All callers pass a `<button>` element, so the type narrowing is behavior-preserving. Leftover scan clean: `grep -n "radix-ui\|@radix-ui"` on the wrapper and `grep -n "asChild"` on consumers return no migration-relevant matches (one `hasChildNodes` false positive in Workspace.tsx:999).

## Left alone

- `src/shared/components/ui/dropdown-menu.tsx`: already idiomatic Base UI (`Menu.Root/Trigger/Portal>Positioner>Popup`, `GroupLabel`, `CheckboxItemIndicator`/`RadioItemIndicator`, `SubmenuRoot`/`SubmenuTrigger`, SubContent composed from Content with `align="start" alignOffset={-3} side="right" sideOffset={0}`); no changes needed.
- cmdk/vaul/sonner/input-otp/react-day-picker/recharts wrappers untouched (not radix, per hard rule).
- `package-lock.json` `@radix-ui/*` entries are transitives of untouched third-party libs (cmdk pulls `@radix-ui/react-dialog`); no direct radix dependency exists in `package.json`.

## Behavior changes

- None intended. `render` with a `<button>` element keeps `nativeButton` semantics; open/close, hover-switching, and focus behavior unchanged. CheckboxItem/RadioItem `closeOnClick` defaults to `false` in Base UI (Radix closed on select): flagged, not patched — item `onClick` handlers in these consumers perform the action and rely on default dismissal flow as before.

## Verify by hand

- Open each ribbon dropdown (Add Element, chart style/layout menus, Margins, Header/Footer galleries, picture/shape/icon/smartart inserts); confirm the trigger button looks identical and opens on click.
- Keyboard: Tab to a trigger, Enter/Space opens; arrows move between items; Esc closes and returns focus to the trigger.
- Submenus (Chart Title, Axis Titles, Legend) open on hover/click to the right with the same alignment as before.
