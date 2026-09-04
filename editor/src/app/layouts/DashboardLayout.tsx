// ============================================================
// DashboardLayout.tsx
// ============================================================
// PURPOSE:
// Provides the common authenticated dashboard layout.
//
// RESPONSIBILITIES:
// 1. Display sidebar navigation.
// 2. Display logged-in user information.
// 3. Handle logout.
// 4. Filter navigation by user role.
// 5. Handle desktop/mobile sidebar behavior.
// 6. Render the current child route using <Outlet />.
// 7. Keep the application layout inside the viewport.
//
// IMPORTANT:
// This component does NOT directly call the backend.
// Authentication data and logout functionality come from
// useAuth().
//
// LAYOUT / SCROLL:
// The outer layout uses h-screen + overflow-hidden.
// The main content uses min-h-0 so the flex container can
// correctly calculate remaining height.
//
// If a specific child page needs its own scrolling, that
// child page should manage overflow internally rather than
// allowing the entire application layout to grow.
// ============================================================

import React, { useState } from "react";

import {
  Link,
  useLocation,
  Outlet,
} from "react-router-dom";

import { useAuth } from "@/features/auth/index";

import { navigationItems } from "../config/navigation";

import { Role } from "../config/roles";

import {
  LogOut,
  ShieldAlert,
  Menu,
  UserCheck as UserIcon,
} from "lucide-react";


export const DashboardLayout: React.FC = () => {

  // ==========================================================
  // AUTHENTICATION
  // ==========================================================
  //
  // user  -> currently authenticated user
  // logout -> clears the current authentication/session
  //
  const { user, logout } = useAuth();


  // ==========================================================
  // CURRENT ROUTE
  // ==========================================================
  //
  // Used to highlight the active sidebar navigation item.
  //
  const location = useLocation();


  // ==========================================================
  // DESKTOP SIDEBAR STATE
  // ==========================================================
  //
  // Saved in localStorage so the user's sidebar preference
  // remains after a page refresh.
  //
  const [sidebarExpanded, setSidebarExpanded] =
    useState(() => {
      return (
        localStorage.getItem("sidebarExpanded") === "true"
      );
    });


  // ==========================================================
  // MOBILE SIDEBAR STATE
  // ==========================================================
  //
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);


  // ==========================================================
  // SIDEBAR DISPLAY STATE
  // ==========================================================
  //
  // Sidebar is considered expanded when:
  // - desktop sidebar is expanded
  // OR
  // - mobile menu is open
  //
  const isExpanded =
    sidebarExpanded || mobileMenuOpen;


  // ==========================================================
  // SIDEBAR TOGGLE
  // ==========================================================

  const handleToggle = () => {

    // Mobile/tablet behavior
    if (window.innerWidth < 1024) {

      setMobileMenuOpen(
        !mobileMenuOpen
      );

      return;
    }


    // Desktop behavior
    const nextState =
      !sidebarExpanded;

    setSidebarExpanded(
      nextState
    );


    // Persist sidebar preference locally.
    localStorage.setItem(
      "sidebarExpanded",
      String(nextState)
    );
  };


  // ==========================================================
  // USER ROLE
  // ==========================================================
  //
  // Fallback is Author when no role is available.
  //
  const userRole =
    (user?.role || Role.Author) as Role;


  // ==========================================================
  // ROLE-BASED NAVIGATION
  // ==========================================================
  //
  // Only navigation items allowed for the current role
  // will be displayed.
  //
  const filteredNavItems =
    navigationItems.filter(
      (item) =>
        !item.roles ||
        item.roles.includes(userRole)
    );


  return (

    // ========================================================
    // APPLICATION ROOT
    // ========================================================
    //
    // IMPORTANT FOR SCROLL:
    // h-screen       -> exactly viewport height
    // overflow-hidden -> prevent outer page scrolling
    //
    <div
      className="
        h-screen
        overflow-hidden
        flex
        bg-[#F3F4F6]
        text-slate-800
        font-sans
      "
    >


      {/* ======================================================
          SIDEBAR
          ====================================================== */}

      <aside
        className={`
          fixed
          inset-y-0
          left-0
          z-40
          h-screen
          bg-white
          border-r
          border-[#E5E7EB]
          flex
          flex-col
          justify-between
          transition-all
          duration-300
          overflow-hidden

          ${
            sidebarExpanded
              ? "w-64"
              : "w-[76px]"
          }

          ${
            mobileMenuOpen
              ? "translate-x-0 w-64"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >

        {/* ====================================================
            SIDEBAR TOP
            ==================================================== */}

        <div>

          {/* ==================================================
              LOGO
              ================================================== */}

          <div
            className={`
              h-16
              shrink-0
              flex
              items-center
              border-b
              border-slate-100

              ${
                isExpanded
                  ? "justify-between px-6"
                  : "justify-center"
              }
            `}
          >

            <div className="flex items-center gap-2.5">

              {/* Application icon */}

              <div
                className="
                  h-8
                  w-8
                  rounded-lg
                  bg-blue-600
                  flex
                  items-center
                  justify-center
                  p-1.5
                  shadow-md
                  shrink-0
                "
              >
                <ShieldAlert
                  className="
                    h-5
                    w-5
                    text-white
                  "
                />
              </div>


              {/* Application name */}

              {isExpanded && (
                <div>

                  <span
                    className="
                      font-extrabold
                      text-sm
                    "
                  >
                    SYSTEM
                  </span>

                  <span
                    className="
                      block
                      text-[9px]
                      text-blue-600
                      font-bold
                      uppercase
                      tracking-wider
                    "
                  >
                    ADMIN PORTAL
                  </span>

                </div>
              )}

            </div>

          </div>


          {/* ==================================================
              NAVIGATION
              ================================================== */}

          <nav
            className="
              p-4
              space-y-1.5
            "
          >

            {filteredNavItems.map((item) => {

              // Navigation icon
              const Icon = item.icon;


              // Active route
              const isActive =
                location.pathname ===
                item.path;


              return (
                <Link
                  key={item.path}
                  to={item.path}

                  // Close mobile menu after navigation.
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }

                  className={`
                    w-full
                    flex
                    items-center

                    ${
                      isExpanded
                        ? "justify-between px-3.5 py-2.5"
                        : "justify-center py-2.5"
                    }

                    rounded-xl
                    text-sm
                    font-bold
                    transition-all

                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }
                  `}
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >

                    <Icon
                      className="
                        h-5
                        w-5
                        shrink-0
                      "
                    />

                    {isExpanded && (
                      <span>
                        {item.title}
                      </span>
                    )}

                  </div>

                </Link>
              );
            })}

          </nav>

        </div>


        {/* ======================================================
            USER SECTION
            ====================================================== */}

        <div
          className="
            shrink-0
            p-4
            border-t
            border-slate-100
            bg-slate-50/70
            space-y-3
          "
        >

          {/* User information */}

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                h-9
                w-9
                rounded-full
                bg-blue-50
                border
                border-blue-200
                flex
                items-center
                justify-center
                text-blue-600
                shrink-0
              "
            >

              <UserIcon
                className="
                  h-4.5
                  w-4.5
                "
              />

            </div>


            {isExpanded && (
              <div
                className="
                  overflow-hidden
                  min-w-0
                "
              >

                <p
                  className="
                    text-xs
                    font-extrabold
                    truncate
                  "
                >
                  {user?.name}
                </p>

                <p
                  className="
                    text-[10px]
                    text-slate-500
                    truncate
                  "
                >
                  {user?.email}
                </p>

              </div>
            )}

          </div>


          {/* Logout */}

          <button
            type="button"
            onClick={logout}
            className="
              w-full
              flex
              items-center
              justify-center
              py-2.5
              rounded-xl
              border
              border-rose-200
              text-xs
              font-bold
              text-rose-600
              hover:bg-rose-50
              transition-colors
            "
          >

            <LogOut
              className="
                h-4
                w-4
                mr-2
              "
            />

            {isExpanded && "Logout"}

          </button>

        </div>

      </aside>


      {/* ======================================================
          MAIN APPLICATION AREA
          ====================================================== */}
      
      <div
        className={`
          flex-1
          h-screen
          min-h-0
          flex
          flex-col
          overflow-hidden
          transition-all
          duration-300

          ${
            sidebarExpanded
              ? "lg:pl-64"
              : "lg:pl-[76px]"
          }
        `}
      >


        {/* ====================================================
            HEADER
            ==================================================== */}

        <header
          className="
            sticky
            top-0
            z-10
            h-16
            shrink-0
            bg-white
            border-b
            border-[#E5E7EB]
            px-6
            flex
            items-center
          "
        >

          <div
            className="
              flex
              items-center
              gap-6
            "
          >

            {/* Sidebar toggle */}

            <button
              type="button"
              onClick={handleToggle}
              className="
                p-2
                rounded-xl
                border
                border-slate-200
                hover:bg-slate-50
                transition-colors
              "
              aria-label="Toggle sidebar"
            >

              <Menu
                className="
                  h-5
                  w-5
                "
              />

            </button>


            {/* Application title */}

            <h1
              className="
                text-lg
                font-extrabold
                tracking-wide
                uppercase
              "
            >
              SYSTEM ADMIN PORTAL
            </h1>

          </div>

        </header>


        

        <main
          className="
            flex-1
            min-h-0
            overflow-hidden
            p-4
            md:p-8
          "
        >

          <Outlet />

        </main>

      </div>

    </div>
  );
};