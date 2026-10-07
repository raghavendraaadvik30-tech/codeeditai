# project — Radix UI -> Base UI whole-project migration

2026-10-07, whole-project mode. Baseline: `tsc --noEmit` passed, `tsc -b && vite build` failed (23 `asChild`-on-Base-UI-Trigger type errors + 1 unused-import error), `eslint .` reported 11110 errors (10920 = U+00A0 NBSP indentation in 2 files). Final: typecheck passes, production build succeeds, lint down to 105 pre-existing non-Radix errors. Zero Radix imports, deps, or DOM selectors remain in `src`.

## Dependency swap

- `package.json` already had `@base-ui/react ^1.6.0` + `@shadcn/react` and zero `@radix-ui/*` / `radix-ui` direct dependencies; `components.json` style is `base-mira`. No install/removal needed.
- `package-lock.json` still lists `@radix-ui/*` entries, but only as transitives of intentionally-untouched third-party libs (e.g. cmdk -> `@radix-ui/react-dialog`). Per the hard rule, cmdk, vaul, sonner, input-otp, react-day-picker, and recharts were never touched.
- `src/shared/components/ui/*` wrappers verified all-Base-UI: accordion, alert-dialog, avatar, button (`@base-ui/react/button`, not a useRender wrapper), checkbox, collapsible, context-menu, dialog, drawer (`@base-ui/react/drawer`, vaul already gone), dropdown-menu, hover-card (PreviewCard), menubar, navigation-menu, popover, progress, radio-group (+radio), scroll-area, select, separator (callable), sheet, slider, switch, tabs, toast, toggle (+toggle-group), tooltip, combobox/input (Base-only), direction (`direction` prop), aspect-ratio (CSS `aspect-ratio` div), label (native `<label>`). Leftover sweep clean: `grep -n "radix-ui\|@radix-ui\|IconPlaceholder"` on `src/shared/components/ui` returns no matches.

## Wrapper work this run

- No wrapper rewrites needed: every wrapper was already idiomatic Base UI (either from the base-mira shadcn init or the prior session's 7 reports: accordion, collapsible, progress, separator, tabs, toggle, toggle-group — those files untouched this run).
- `scroll-area.tsx`: removed unused React import (was failing `tsc -b`). See `.migration/scroll-area.md`.

## App-code sweep (consumer-props.md)

- `asChild` -> `render` on all 22 trigger call sites (DropdownMenuTrigger x21, PopoverTrigger x1) across 11 files; `HeaderFooterGallery` conditional trigger restructured to `render={customTrigger ?? <button/>}` with `customTrigger` narrowed to `ReactElement`. See `.migration/dropdown-menu.md`, `.migration/popover.md`.
- Swept all other LHS tokens (`delayDuration`, `position=`, `activationMode`, `decorative`, `type="single"`, `onValueCommit`, `onOpenAutoFocus`, etc.): no occurrences in app code (sidebar `collapsible` hits are the sidebar's own API, not accordion).
- Replaced dead `[data-radix-popper-content-wrapper]` outside-click guards in ChartHydration/SmartArtHydration with Base UI selectors. See `.migration/popover.md`.

## Ancillary lint fixes (behavior-preserving, required to get lint meaningful)

- Replaced 14,014 U+00A0 NBSP chars with regular spaces in `DashboardLayout.tsx` + `UserManagement.tsx` (indentation only).
- `eslint --fix` + parallel mechanical passes: `no-useless-escape`/`no-misleading-character-class`/`no-control-regex` (regex notation only), unused-var/useless-assignment initializers (verified read-after-write preserved), `no-explicit-any` (precise types), `react-refresh/only-export-components` disables on canonical shadcn ui wrappers only.

## Final verification

- `npm run typecheck` (`tsc --noEmit`): passes, 0 errors.
- `npm run build` (`tsc -b && vite build`): succeeds, `dist/` emitted (`✓ built`). Only pre-existing Vite warnings (INEFFECTIVE_DYNAMIC_IMPORT chunking note, >500kB chunk size advisory).
- `npm run lint`: 11110 -> 105 errors (21 warnings are `exhaustive-deps` advisories). All 105 remaining are pre-existing and non-Radix: ~79 React Compiler strictness findings (`set-state-in-effect`, `refs-during-render`, `mutating-hook-args` in Workspace/EditorContext/hydration/table code), 25 `react-refresh/only-export-components` in non-ui context/store files, 1 conditional `useDocumentModel` in `EditorContext.tsx:1197`. None reference Radix; none were introduced by this migration. Refactoring them would change editor runtime behavior and is out of scope — flagged for a separate cleanup pass.
- Radix-freedom proofs: `grep "@radix-ui|from \"radix-ui\""` over `src` = 0 code matches; `grep "asChild"` over `src` = 0 component matches (one `hasChildNodes` substring false positive); `grep "data-radix"` over `src` = 0; `package.json` has no `radix` dependency keys.

## Behavior deltas carried over (flagged, not patched)

- Tabs default to manual activation (no `activateOnFocus` added); accordion single-mode always collapsible with array `value`; menu CheckboxItem/RadioItem `closeOnClick` defaults false; navigation hover-delay 200ms -> 50ms feel. See per-component reports.
