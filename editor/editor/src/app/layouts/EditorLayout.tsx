// Provides the full-screen layout container for all Editor routes and renders their nested pages through <Outlet />.
import { Outlet } from "react-router-dom";

export function EditorLayout() {
  return (
    <div
      className="
        h-screen
        w-full
        overflow-hidden
        bg-[#EEF4FA]
        dark:bg-[#02080F]
      "
    >
      <Outlet />
    </div>
  );
}