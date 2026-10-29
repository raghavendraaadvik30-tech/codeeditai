 /*  ThemeProvider.tsx
   PURPOSE:
   This file manages the application's visual theme.

   Supported themes:
   - light
   - dark
   - system

   RESPONSIBILITIES:
   1. Store the current theme.
   2. Read the saved theme from localStorage.
   3. Apply the theme to the <html> element.
   4. Support system OS theme preference.
   5. Automatically react when OS theme changes.
   6. Prevent ugly transition effects while switching themes.
   7. Persist theme selection across page refreshes.
   8. Sync theme changes between browser tabs.
   9. Provide theme state through React Context.
   10. Provide useTheme() hook for components.

   BACKEND:
   This file has NO backend/API logic.
   Theme is purely frontend UI state.

   When backend is connected, this file normally does NOT
   need to change.

  */


/*
  ESLint rule:
  This disables the React Refresh warning about exporting both
  a component and a non-component (useTheme) from this file.
  React Fast Refresh normally prefers component-only exports.
*/
 /* eslint-disable react-refresh/only-export-components */



import * as React from "react"


/* Theme type
  Defines the three values the application supports:
   "dark"
   "light"
   "system"

   "system" means:  Use the operating system/browser preference.
*/
type Theme = "dark" | "light" | "system"


/*
  ResolvedTheme represents the actual theme that gets applied.
  "system" is not included here because after checking the OS,
  "system" is resolved to either "dark" or "light".
*/
type ResolvedTheme = "dark" | "light"


/* ThemeProvider Props -> Defines what ThemeProvider accepts.
*/
type ThemeProviderProps = {

  // Components/pages that will be wrapped by ThemeProvider.
  children: React.ReactNode

  // Theme used when no saved theme exists.
  defaultTheme?: Theme

  // localStorage key used to save the theme.
  storageKey?: string

  // Whether to temporarily disable CSS transitions
  disableTransitionOnChange?: boolean
}


/* ThemeProvider State
   This is the data/functions exposed to child components.
*/
type ThemeProviderState = {

  // Current selected theme.
  theme: Theme

  // Function used by components to change the theme.
  setTheme: (theme: Theme) => void
}

/* CONSTANTS 
 Media query used to detect whether the operating system
  prefers dark mode.
*/
const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)"


/*Allowed theme values.
  Used for validation when reading theme data from localStorage.
*/
const THEME_VALUES: Theme[] = ["dark", "light", "system"]


/* REACT CONTEXT
   Stores theme state globally so components can access it
   without passing props manually.
*/
const ThemeProviderContext = React.createContext<
  ThemeProviderState | undefined
>(undefined)


/* isTheme()
   PURPOSE:
   Checks whether a value from localStorage is a valid theme.
   Example:
   "dark"   -> true
   "light"  -> true
   "system" -> true
   "hello"  -> false
   null     -> false
*/
function isTheme(value: string | null): value is Theme {

  // localStorage may return null if the key does not exist.
  if (value === null) {
    return false
  }

  // Check whether the value exists in the allowed theme list.
  return THEME_VALUES.includes(value as Theme)
}


/* getSystemTheme()
   PURPOSE:
   Determines the user's operating-system theme preference.

   If OS/browser prefers dark mode:
       return "dark"

   Otherwise:
       return "light"
*/
function getSystemTheme(): ResolvedTheme {

  // matchMedia checks the browser's preferred color scheme.
  if (window.matchMedia(COLOR_SCHEME_QUERY).matches) {
    return "dark"
  }

  return "light"
}


/* disableTransitionsTemporarily()
   PURPOSE:
   Prevents visible CSS animations/transitions while the theme
   changes.

   Without this, buttons/cards/etc. may visibly animate from
   one color to another during theme switching.
*/
function disableTransitionsTemporarily() {

  // Create a temporary <style> element.
  const style = document.createElement("style")

  // Add CSS that disables all transitions temporarily.
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}"
    )
  )

  // Add the temporary style to the document.
  document.head.appendChild(style)

  // Return a cleanup function.
  return () => {

    /*Force the browser to calculate current styles.
      This helps ensure the theme change is applied before
      transitions are restored.
    */
    window.getComputedStyle(document.body)

    // Wait for browser rendering frames before removing
    // the temporary transition-blocking style.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        style.remove()
      })
    })
  }
}


/* isEditableTarget()
   PURPOSE:
   Determines whether the keyboard event happened inside an editable field.

   This is important because the application uses the "D" key as a theme shortcut.

   We do NOT want typing "d" inside an input/text area to
   accidentally change the application theme.
*/
function isEditableTarget(target: EventTarget | null) {

  // Make sure the target is an HTML element.
  if (!(target instanceof HTMLElement)) {
    return false
  }


  // If the element itself is content editable,
  // treat it as an editable area.
  if (target.isContentEditable) {
    return true
  }


  // Search for an editable parent:
  
  // input
  // textarea
  // select
  // contenteditable element
  const editableParent = target.closest(
    "input, textarea, select, [contenteditable='true']"
  )


  // If an editable parent exists, return true.
  if (editableParent) {
    return true
  }


  // Otherwise, the target is not editable.
  return false
}


/* ThemeProvider Component
  This is the main provider component.
  It makes theme state available to all child components.
*/
export function ThemeProvider({

  // Components wrapped by this provider.
  children,

  // If no saved theme exists, use system preference.
  defaultTheme = "system",

  // localStorage key.
  storageKey = "theme",

  // Prevent transitions while changing themes.
  disableTransitionOnChange = true,

  // Any additional props are collected here.
  ...props

}: ThemeProviderProps) {


  /*THEME STATE
    Initializes the current theme.
  */
  const [theme, setThemeState] = React.useState<Theme>(() => {

    // Try to read previously saved theme.
    const storedTheme = localStorage.getItem(storageKey)


    // If saved value is valid, use it.
    if (isTheme(storedTheme)) {
      return storedTheme
    }


    // Otherwise use the configured default theme.
    return defaultTheme
  })


  /*setTheme()
     Public function used by components to change the theme.
  */
  const setTheme = React.useCallback(

    (nextTheme: Theme) => {

      // Save theme to browser storage.
      localStorage.setItem(storageKey, nextTheme)

      // Update React state.
      setThemeState(nextTheme)
    },

    // Re-create callback only when storageKey changes.
    [storageKey]
  )


  /* applyTheme()
     Converts the selected theme into an actual theme
     ("dark" or "light") and applies it to <html>.
  */
  const applyTheme = React.useCallback(

    (nextTheme: Theme) => {

      // Get the root <html> element.
      const root = document.documentElement


      // If selected theme is "system", determine the actual
      // OS preference.
    
      // system + dark OS  -> dark
      // system + light OS -> light
      
      // If user explicitly selected dark/light, use that value.
      const resolvedTheme =
        nextTheme === "system"
          ? getSystemTheme()
          : nextTheme


      // Optionally disable CSS transitions while switching.
      const restoreTransitions = disableTransitionOnChange
        ? disableTransitionsTemporarily()
        : null


      // Remove previous theme classes.
      root.classList.remove("light", "dark")


      // Add the newly resolved theme class.
      // Result:<html class="dark">  or  <html class="light">
      root.classList.add(resolvedTheme)
      root.setAttribute("data-theme", resolvedTheme)


      // Restore normal CSS transitions if they were disabled.
      if (restoreTransitions) {
        restoreTransitions()
      }
    },

    // Re-create callback only if this configuration changes.
    [disableTransitionOnChange]
  )


  /* EFFECT 1: APPLY THEME
     Runs whenever the selected theme changes.
     Also listens for OS theme changes when "system" is selected.
  */
  React.useEffect(() => {

    // Apply current theme.
    applyTheme(theme)


    // If user explicitly selected dark/light,OS changes should not affect the application.
    if (theme !== "system") {
      return undefined
    }


    // Listen to OS/browser theme changes.
    const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY)


    // Re-apply system theme whenever OS preference changes.
    const handleChange = () => {
      applyTheme("system")
    }


    // Start listening.
    mediaQuery.addEventListener("change", handleChange)


    // Remove listener when component unmounts.
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }

  }, [theme, applyTheme])


  /* EFFECT 2: KEYBOARD SHORTCUT
     Press "D" to toggle between light and dark themes.

     Important:
     It does NOT activate while typing in:
     - input
     - textarea
     - select
     - contenteditable
  */
  React.useEffect(() => {


    // Keyboard event handler.
    const handleKeyDown = (event: KeyboardEvent) => {

      // Ignore repeated key events when key is held down.
      if (event.repeat) {
        return
      }


      // Ignore shortcuts using Ctrl/Cmd/Alt.
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }


      // Ignore events inside editable fields.
      if (isEditableTarget(event.target)) {
        return
      }


      // Only respond to "D".
      if (event.key.toLowerCase() !== "d") {
        return
      }


      // Update theme based on current value.
      setThemeState((currentTheme) => {

        // dark → light
        // light → dark
        // system → switch opposite of current OS theme
        const nextTheme =
          currentTheme === "dark"
            ? "light"
            : currentTheme === "light"
              ? "dark"
              : getSystemTheme() === "dark"
                ? "light"
                : "dark"


        // Save new theme.
        localStorage.setItem(storageKey, nextTheme)


        // Return the new state.
        return nextTheme
      })
    }


    // Start listening to keyboard events.
    window.addEventListener("keydown", handleKeyDown)


    // Clean up event listener when component unmounts.
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }

  }, [storageKey])


  /* EFFECT 3: MULTI-TAB THEME SYNC
     localStorage changes in another browser tab/window trigger the "storage" event.
     This keeps theme selection synchronized across tabs.
  */
  React.useEffect(() => {


    const handleStorageChange = (event: StorageEvent) => {

      // Ignore changes from a storage area other than localStorage.
      if (event.storageArea !== localStorage) {
        return
      }


      // Ignore changes to unrelated localStorage keys.
      if (event.key !== storageKey) {
        return
      }


      // If the new value is a valid theme, update the React state.
      if (isTheme(event.newValue)) {
        setThemeState(event.newValue)
        return
      }


      // If value was removed/invalid, return to default theme.
      setThemeState(defaultTheme)
    }


    // Listen for storage changes.
    window.addEventListener("storage", handleStorageChange)


    // Clean up listener when provider unmounts.
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }

  }, [defaultTheme, storageKey])


  /*CONTEXT VALUE
    Creates the value exposed through ThemeProviderContext.
    Child components will receive:
     theme
     setTheme
  */
  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme, setTheme]
  )


  /* PROVIDER
   Makes theme state available to all child components.
  */
  return (
    <ThemeProviderContext.Provider
      {...props}
      value={value}
    >

      {/* Render the application/components inside provider. */}
      {children}

    </ThemeProviderContext.Provider>
  )
}


/* useTheme()
   Custom hook used by components to access theme information.
   Example:
   const { theme, setTheme } = useTheme();
   setTheme("dark");
*/
export const useTheme = () => {

  // Read theme context.
  const context = React.useContext(ThemeProviderContext)


  // Prevent using useTheme() outside ThemeProvider.
  if (context === undefined) {
    throw new Error(
      "useTheme must be used within a ThemeProvider"
    )
  }


  // Return theme and setTheme.
  return context
}
