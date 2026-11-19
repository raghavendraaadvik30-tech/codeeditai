// touch.ts
// iOS (iPhone and iPad, app and Safari) never fires the "contextmenu" event
// on long-press, so right-click menus in the editor (tables, charts, shapes,
// icons, SmartArt) can't be opened. Android fires it natively.
//
// This turns a 550ms still long-press into a synthetic "contextmenu" event on
// the pressed element, so the existing onContextMenu handlers just work.

const LONG_PRESS_MS = 550
const MOVE_TOLERANCE_PX = 10

function isIOS(): boolean {
  const ua = navigator.userAgent
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ reports itself as a Mac
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  )
}

export function installLongPressContextMenu(): void {
  if (!isIOS()) return

  let timer: ReturnType<typeof setTimeout> | null = null
  let startX = 0
  let startY = 0
  let suppressNextClick = false

  const cancel = () => {
    if (timer) clearTimeout(timer)
    timer = null
  }

  document.addEventListener(
    "touchstart",
    (event) => {
      cancel()
      // iOS often sends no click after a long-press; never swallow a new tap.
      suppressNextClick = false
      if (event.touches.length !== 1) return
      const touch = event.touches[0]
      const target = event.target as Element | null
      if (!target) return

      startX = touch.clientX
      startY = touch.clientY

      timer = setTimeout(() => {
        timer = null
        const contextEvent = new MouseEvent("contextmenu", {
          bubbles: true,
          cancelable: true,
          composed: true,
          view: window,
          button: 2,
          buttons: 2,
          clientX: touch.clientX,
          clientY: touch.clientY,
          screenX: touch.screenX,
          screenY: touch.screenY,
        })
        target.dispatchEvent(contextEvent)
        // A handler opened a custom menu: don't let the finger lift "click"
        // the item that now sits under it.
        if (contextEvent.defaultPrevented) suppressNextClick = true
      }, LONG_PRESS_MS)
    },
    { passive: true }
  )

  document.addEventListener(
    "touchmove",
    (event) => {
      if (!timer) return
      const touch = event.touches[0]
      if (
        !touch ||
        Math.abs(touch.clientX - startX) > MOVE_TOLERANCE_PX ||
        Math.abs(touch.clientY - startY) > MOVE_TOLERANCE_PX
      ) {
        cancel()
      }
    },
    { passive: true }
  )

  document.addEventListener("touchend", cancel, { passive: true })
  document.addEventListener("touchcancel", cancel, { passive: true })

  document.addEventListener(
    "click",
    (event) => {
      if (!suppressNextClick) return
      suppressNextClick = false
      event.preventDefault()
      event.stopPropagation()
    },
    true
  )
}
