# scroll-area

2026-10-07, leftover sweep (wrapper was already on `@base-ui/react/scroll-area` with `Scrollbar`/`Thumb` renames; fixed the last build error in the file), migrated cleanly.

## Changed

- `src/shared/components/ui/scroll-area.tsx:1`: removed unused `import * as React from "react"` (the wrapper uses plain function components; the import tripped `TS6133` under `tsc -b` and failed the production build). No other changes; `Root`/`Viewport`/`Scrollbar`/`Thumb`/`Corner` anatomy and classes unchanged. Leftover scan clean: `grep -n "radix-ui\|@radix-ui"` on this file returns no matches.

## Left alone

- No `type`/`scrollHideDelay`/`dir`/`nonce` props at call sites (Base UI drops them; visibility is CSS-driven via `[data-hovering]`/`[data-scrolling]`). Nothing to remove.
- cmdk/vaul/sonner/input-otp/react-day-picker/recharts untouched (not radix).

## Behavior changes

- None. Import-only change; no runtime effect.

## Verify by hand

- Scroll any scrollable panel (ribbon overflow, gallery lists); scrollbar appears on hover/scroll as before, thumb drags, corner renders where both axes overflow.
