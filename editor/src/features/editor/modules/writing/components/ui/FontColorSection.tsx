import { Palette, Check } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { THEME_COLORS } from "../../constants/writing.constants"

interface FontColorSectionProps {
  onApply: (color: string) => void
}

const HIDE_ATTR = "data-hide-selection"

const MODIFIER_KEYS = new Set(["Shift", "Control", "Alt", "Meta", "CapsLock"])
const NAVIGATION_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "PageUp",
  "PageDown",
  "Escape",
])

let teardown: (() => void) | null = null

function getEditorElement(node: Node | null): Element | null {
  const el = node instanceof Element ? node : (node?.parentElement ?? null)
  return el?.closest('[contenteditable="true"]') ?? null
}

function collapseEditorSelectionToEnd() {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return

  // Only touch the selection if it is inside the editor
  if (!getEditorElement(sel.anchorNode)) return

  sel.collapseToEnd()
}

function endSession(collapse: boolean) {
  if (collapse) collapseEditorSelectionToEnd()
  document.documentElement.removeAttribute(HIDE_ATTR)
  teardown?.()
  teardown = null
}

/**
 * Hides the selection highlight (via the CSS rule in editor.css) after a font
 * color is applied, like Word does. The selection itself is untouched, so
 * more colors can be applied to the same text. The session ends on:
 * - a click outside the color section (new selection, no collapse)
 * - a shortcut or navigation key (selection kept)
 * - any typing key such as Enter (cursor moves to the end of the colored
 *   text first, so the selection is not replaced)
 */
function startSession() {
  document.documentElement.setAttribute(HIDE_ATTR, "true")

  if (teardown) return // listeners already attached

  const onMouseDown = (event: MouseEvent) => {
    const target = event.target as HTMLElement | null
    if (target?.closest("[data-font-color-section]")) return
    endSession(false)
  }

  // Capture phase: runs before the editor handles the key
  const onKeyDown = (event: KeyboardEvent) => {
    if (MODIFIER_KEYS.has(event.key)) return // Shift+letter should still work

    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      NAVIGATION_KEYS.has(event.key)
    ) {
      endSession(false)
      return
    }

    endSession(true)
  }

  document.addEventListener("mousedown", onMouseDown, true)
  document.addEventListener("keydown", onKeyDown, true)

  teardown = () => {
    document.removeEventListener("mousedown", onMouseDown, true)
    document.removeEventListener("keydown", onKeyDown, true)
  }
}

export default function FontColorSection({ onApply }: FontColorSectionProps) {
  const [activeColor, setActiveColor] = useState<string | null>(null)
  const colorInputRef = useRef<HTMLInputElement>(null)
  const savedRangeRef = useRef<Range | null>(null)

  const handleApply = useCallback(
    (color: string) => {
      setActiveColor(color)
      onApply(color)
      startSession()
    },
    [onApply]
  )

  // Remember the editor selection before the native color dialog opens,
  // since the dialog can take focus away from the editor.
  const saveEditorSelection = () => {
    const sel = window.getSelection()
    if (
      sel &&
      sel.rangeCount > 0 &&
      !sel.isCollapsed &&
      getEditorElement(sel.anchorNode)
    ) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange()
    } else {
      savedRangeRef.current = null
    }
  }

  const restoreEditorSelection = () => {
    const range = savedRangeRef.current
    if (!range) return

    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  }

  // React's onChange maps to the native `input` event, which fires
  // continuously while dragging in the picker. The native `change` event
  // fires once when the user commits, so listen for that instead.
  useEffect(() => {
    const input = colorInputRef.current
    if (!input) return

    const onCommit = () => {
      restoreEditorSelection()
      handleApply(input.value)
    }

    input.addEventListener("change", onCommit)
    return () => input.removeEventListener("change", onCommit)
  }, [handleApply])

  return (
    <section className="mb-6" data-font-color-section>
      <h3 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Font Color
      </h3>

      <div className="flex flex-wrap items-center gap-2">
        {THEME_COLORS.map((color) => {
          const isActive = activeColor === color.value

          return (
            <button
              key={color.value}
              type="button"
              onMouseDown={(event) => {
                /*
                 * Prevent the color palette button from
                 * stealing the editor selection.
                 */
                event.preventDefault()
              }}
              onClick={() => handleApply(color.value)}
              title={color.name}
              aria-label={`Apply ${color.name} font color`}
              aria-pressed={isActive}
              className={`relative h-7 w-7 rounded border transition-all hover:scale-105 hover:border-muted-foreground ${
                isActive
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-secondary"
              } `}
              style={{
                backgroundColor: color.value,
              }}
            >
              {isActive && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Check
                    size={14}
                    strokeWidth={3}
                    className="text-primary-foreground drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]"
                  />
                </span>
              )}
            </button>
          )
        })}

        {/* CUSTOM COLOR */}
        <label
          title="Custom font color"
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded border border-secondary text-muted-foreground transition hover:bg-muted"
          onMouseDown={(event) => {
            event.preventDefault()
            saveEditorSelection()
          }}
        >
          <Palette size={15} />

          <input ref={colorInputRef} type="color" className="sr-only" />
        </label>
      </div>
    </section>
  )
}
