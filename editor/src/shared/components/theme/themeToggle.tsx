/* eslint-disable react-refresh/only-export-components */
/*This file provides a frontend-only light/dark theme system: 
useTheme() loads and persists the user's theme and applies the dark class to the HTML root, while ThemeToggle provides the UI button for switching modes; 
it does not use the backend and normally requires no backend changes.*/


import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "parexel.theme";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
    document.documentElement.classList.toggle(
        "dark",
        theme === "dark"
    );
}

export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem(KEY) ;

      const systemTheme: Theme = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches
        ? "dark"
        : "light";

      const initialTheme =
        stored === "dark" || stored === "light"
          ? stored
          : systemTheme;

      setTheme(initialTheme);
      applyTheme(initialTheme);
    }, []);

  const updateTheme = (nextTheme: Theme) => {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem(KEY,nextTheme);
  };

    return [theme, updateTheme];
}

export function ThemeToggle() {
  const [theme, setTheme] = useTheme();

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      title={`Switch to ${nextTheme} mode`}
      aria-label={`Switch to ${nextTheme} mode`}
      className="
        size-9
        grid
        place-items-center
        rounded-md
        border
        border-transparent
        text-muted-foreground
        transition-colors
        dark:border-slate-700
        "        
    >
      {theme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </button>
  );
}

export default ThemeToggle;