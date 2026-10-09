# collapsible

2026-10-07, transformation engine (hand transform per disclosure.md; part structure cross-checked against golden src/components/ui/collapsible.tsx), migrated cleanly.

## Changed

- `src/shared/components/ui/collapsible.tsx`: rewired import `* as CollapsiblePrimitive from "@radix-ui/react-collapsible"` -> `import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"`. `CollapsiblePrimitive.CollapsibleTrigger` -> `CollapsiblePrimitive.Trigger`, `CollapsiblePrimitive.CollapsibleContent` -> `CollapsiblePrimitive.Panel` (Content->Panel rename). Bare re-export shape and public names (`Collapsible/CollapsibleTrigger/CollapsibleContent`) unchanged, so no consumer changes needed. Leftover scan clean: `grep -n "radix-ui\|@radix-ui"` on this file returns no matches.

## Left alone

- Golden `src/components/ui/collapsible.tsx` untouched (reference only).
- No classNames existed on this file, so no class-mapping work applied.

## Behavior changes

- Trigger open marker is now `data-panel-open` (not `data-state="open"`); Panel carries `data-open`/`data-closed` presence attributes. Any app CSS keyed on the old Radix selectors must be updated (none found in scope).
- CSS var `--radix-collapsible-content-height` -> `--collapsible-panel-height` for height animations (none used in scope).

## Verify by hand

- Toggle a collapsible via its trigger with mouse and keyboard (Enter/Space).
- Confirm panel mounts/unmounts and any height animation runs smoothly.
