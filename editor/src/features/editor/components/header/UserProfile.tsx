/*Purpose:
Displays the logged-in user's profile information and provides a logout dropdown.

Responsibilities:
- Displays user avatar, name, and role.
- Toggles the profile dropdown.
- Handles logout using useAuth().
- Redirects to the Login page after logout.
- Uses centralized ROUTE_PATHS.
- Supports light/dark mode.
- No direct backend/API logic.
*/

import { LogOut } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ROUTE_PATHS } from "@/app/router/routePaths";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate(ROUTE_PATHS.LOGIN, {
      replace: true,
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const userName = user?.name || "Bhumika C";
  const userRole = user?.role || "Medical Writer";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "BC";

  return (
    <div ref={dropdownRef} className="relative">
      {/* Profile Button */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="
          flex
          items-center
          gap-2
          rounded-full
          border
          border-[#B8CBE4]/80
          dark:border-[#33465F]
          bg-white
          dark:bg-[#111D29]
          px-2
          py-0.5
          shadow-2xs
          hover:bg-slate-50
          dark:hover:bg-muted
          transition-colors
          cursor-pointer
        "
      >
        <div
          className="
            flex
            h-6.5
            w-6.5
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[#D3E3FD]
            text-[#102A43]
            font-bold
            text-[10px]
          "
        >
          {initials}
        </div>

        <div className="hidden md:flex flex-col leading-none text-left">
          <span className="text-11px font-bold text-[#102A43] dark:text-white">
            {userName}
          </span>
          <span className="text-[9px] text-[#64748B] dark:text-muted-foreground mt-0.5">
            {userRole}
          </span>
        </div>
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
            border-secondary
            dark:border-secondary-foreground
            bg-card
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
              text-destructive
              dark:text-destructive
              hover:bg-destructive/10
              dark:hover:bg-destructive/30
              transition-colors
              cursor-pointer
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
