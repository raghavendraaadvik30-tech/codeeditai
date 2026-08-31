/*Purpose:
Displays the logged-in user's profile information and provides a logout dropdown.

Responsibilities:

Current hardcoded
Displays user avatar, name, and role.
Toggles the profile dropdown.
Handles logout using useAuth().
Redirects to the Login page after logout.
Uses centralized ROUTE_PATHS.
Supports light/dark mode.
No direct backend/API logic.
*/


import {
  Avatar,
  AvatarFallback,
} from "@/shared/components/ui/avatar";

import {
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROUTE_PATHS } from "@/app/router/routePaths";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
 logout();

  navigate(ROUTE_PATHS.LOGIN, {
    replace: true,
  });
};
   

  return (
    <div className="relative">

      {/* Profile Button */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="
          flex
          items-center
          gap-2
          rounded-lg
          border
          border-gray-200
          dark:border-slate-700
          bg-white
          dark:bg-[#111D29]
          px-2.5
          py-1
          shadow-sm
          hover:bg-gray-50
          dark:hover:bg-slate-800
          transition-colors
        "
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback
            className="
              bg-blue-100
              text-blue-700
              dark:bg-blue-900/40
              dark:text-blue-300
              font-semibold
            "
          >
            BC
          </AvatarFallback>
        </Avatar>

        <div className="hidden md:flex flex-col leading-tight text-left">
          <span className="text-xs font-medium text-gray-900 dark:text-white">
            Bhumika C
          </span>

          <span className="text-xs text-muted-foreground">
            Medical Writer
          </span>
        </div>

        <ChevronDown
          className={`
            h-4
            w-4
            text-muted-foreground
            transition-transform
            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute
            right-0
            top-full
            z-50
            mt-2
            w-48
            rounded-lg
            border
            border-gray-200
            dark:border-slate-700
            bg-white
            dark:bg-[#111D29]
            shadow-lg
            p-1
          "
        >
          <button
            type="button"
            onClick={handleLogout}
            className="
              flex
              w-full
              items-center
              gap-2
              rounded-md
              px-3
              py-2
              text-sm
              text-red-600
              dark:text-red-400
              hover:bg-red-50
              dark:hover:bg-red-950/30
              transition-colors
            "
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      )}

    </div>
  );
}