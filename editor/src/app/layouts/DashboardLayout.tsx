import React, { useState } from "react";



import { Link, useLocation, Outlet } from "react-router-dom";

import { useAuth } from "@/features/auth/index";

import { navigationItems } from "../config/navigation";

import { Role } from "../config/roles";



import {

  ShieldAlert,

  Menu,

  UserCheck as UserIcon,

  LogOut,

  X,

  ShieldCheck,

  KeyRound,

  CheckCircle2,

  Eye,

  EyeOff,

} from "lucide-react";



interface AdminProfileSecurityProps {

  user: {

    name?: string;

    email?: string;

    role?: string;

  } | null | undefined;

  onClose: () => void;

}



function AdminProfileSecurity({ user, onClose }: AdminProfileSecurityProps) {

  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [success, setSuccess] = useState(false);

  const [error, setError] = useState("");



  const email = user?.email || "admin@gmail.com";

  const role = user?.role || "Admin";



  const openPasswordTab = () => {

    setActiveTab("password");

    setError("");

    setSuccess(false);

  };



  const handleSavePassword = () => {

    setError("");

    setSuccess(false);



    if (newPassword.length < 6) {

      setError("Password must be at least 6 characters.");

      return;

    }



    if (newPassword !== confirmPassword) {

      setError("Passwords do not match.");

      return;

    }



    // Connect the real authentication/password API here when available.

    setSuccess(true);

    setNewPassword("");

    setConfirmPassword("");

  };



  return (

    <div

      className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-[2px]"

      onMouseDown={(event) => {

        if (event.target === event.currentTarget) onClose();

      }}

    >

      <div className="w-full max-w-[360px] overflow-hidden rounded-2xl border border-secondary bg-card shadow-2xl">

        <div className="flex items-start justify-between border-b border-muted px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">

              <ShieldCheck className="h-5 w-5" />

            </div>

            <div>

              <h2 className="text-base font-extrabold text-foreground">

                Admin Profile &amp; Security

              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">

                System Administrator Settings

              </p>

            </div>

          </div>



          <button

            type="button"

            onClick={onClose}

            aria-label="Close"

            className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"

          >

            <X className="h-4 w-4" />

          </button>

        </div>



        <div className="flex gap-2 px-5 pt-4">

          <button

            type="button"

            onClick={() => {

              setActiveTab("profile");

              setError("");

              setSuccess(false);

            }}

            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${

              activeTab === "profile"

                ? "bg-primary text-primary-foreground shadow-sm"

                : "border border-secondary bg-card text-secondary-foreground hover:bg-muted"

            }`}

          >

            Profile Overview

          </button>



{/*           <button

            type="button"

            onClick={openPasswordTab}

            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${

              activeTab === "password"

                ? "bg-primary text-primary-foreground shadow-sm"

                : "border border-secondary bg-card text-secondary-foreground hover:bg-muted"

            }`}

          >

            <KeyRound className="h-3.5 w-3.5" />

            Change Password

          </button> */}

        </div>



        <div className="px-5 pb-5 pt-4">

          {activeTab === "profile" ? (

            <div>

              <div className="space-y-4">

                <div className="flex items-center justify-between gap-4">

                  <span className="text-xs font-medium text-muted-foreground">

                    Administrator Email

                  </span>

                  <span className="text-xs font-bold text-foreground">

                    {email}

                  </span>

                </div>



                <div className="flex items-center justify-between gap-4">

                  <span className="text-xs font-medium text-muted-foreground">

                    Account Role

                  </span>

                  <span className="text-xs font-bold uppercase text-primary">

                    {role}

                  </span>

                </div>



                <div className="flex items-center justify-between gap-4">

                  <span className="text-xs font-medium text-muted-foreground">

                    Account Status

                  </span>

                  <span className="flex items-center gap-1.5 text-xs font-bold text-success-600">

                    <span className="h-2 w-2 rounded-full bg-success-500" />

                    ACTIVE SESSION

                  </span>

                </div>

              </div>



              <button

                type="button"

                onClick={openPasswordTab}

                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"

              >

                <KeyRound className="h-4 w-4" />

                Change Admin Password

              </button>

            </div>

          ) : (

            <div>

              {success && (

                <div className="mb-4 flex items-center gap-2 rounded-xl bg-success-50 px-4 py-3 text-xs font-semibold text-success-700">

                  <CheckCircle2 className="h-4 w-4 shrink-0" />

                  Admin password updated successfully!

                </div>

              )}



              {error && (

                <div className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-xs font-semibold text-destructive">

                  {error}

                </div>

              )}



              <div className="space-y-4">

                <div>

                  <label className="mb-1.5 block text-xs font-bold text-foreground">

                    Account Email

                  </label>

                  <input

                    type="email"

                    value={email}

                    readOnly

                    className="w-full rounded-xl border border-secondary bg-muted px-4 py-2.5 text-xs text-muted-foreground outline-none"

                  />

                </div>



                <div>

                  <label className="mb-1.5 block text-xs font-bold text-foreground">

                    New Password

                  </label>

                  <div className="relative">
  <input
    type={showNewPassword ? "text" : "password"}
    value={newPassword}
    onChange={(event) => setNewPassword(event.target.value)}
    placeholder="At least 6 characters"
    className="w-full rounded-xl border border-secondary px-4 py-2.5 pr-10 text-xs text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
  />

  <button
    type="button"
    onClick={() => setShowNewPassword((value) => !value)}
    aria-label={
      showNewPassword
        ? "Hide new password"
        : "Show new password"
    }
    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary-foreground"
  >
    {showNewPassword ? (
      <Eye className="h-4 w-4" />
    ) : (
      <EyeOff className="h-4 w-4" />
    )}
  </button>
</div>
                </div>



                <div>
  <label className="mb-1.5 block text-xs font-bold text-foreground">
    Confirm New Password
  </label>

  <div className="relative">
    <input
      type={showConfirmPassword ? "text" : "password"}
      value={confirmPassword}
      onChange={(event) => setConfirmPassword(event.target.value)}
      placeholder="Re-enter new password"
      className="w-full rounded-xl border border-secondary px-4 py-2.5 pr-10 text-xs text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
    />

    <button
      type="button"
      onClick={() =>
        setShowConfirmPassword((value) => !value)
      }
      aria-label={
        showConfirmPassword
          ? "Hide confirm password"
          : "Show confirm password"
      }
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary-foreground"
    >
      {showConfirmPassword ? (
        <Eye className="h-4 w-4" />
      ) : (
        <EyeOff className="h-4 w-4" />
      )}
    </button>
  </div>
</div>

              </div>



              <div className="mt-5 flex items-center justify-end gap-3">

                <button

                  type="button"

                  onClick={() => {

                    setActiveTab("profile");

                    setError("");

                    setSuccess(false);

                  }}

                  className="rounded-lg px-4 py-2 text-xs font-semibold text-secondary-foreground transition hover:bg-muted"

                >

                  Cancel

                </button>

                <button

                  type="button"

                  onClick={handleSavePassword}

                  className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"

                >

                  Save New Password

                </button>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>

  );

}



export const DashboardLayout: React.FC = () => {

  const { user, logout } = useAuth();

  const location = useLocation();



  const [sidebarExpanded, setSidebarExpanded] = useState(() => {

    return localStorage.getItem("sidebarExpanded") === "true";

  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showAdminProfile, setShowAdminProfile] = useState(false);



  const isExpanded = sidebarExpanded || mobileMenuOpen;



  const handleToggle = () => {

    if (window.innerWidth < 1024) {

      setMobileMenuOpen((value) => !value);

      return;

    }



    const nextState = !sidebarExpanded;

    setSidebarExpanded(nextState);

    localStorage.setItem("sidebarExpanded", String(nextState));

  };



  const userRole = (user?.role || Role.Author) as Role;

  const filteredNavItems = navigationItems.filter(

    (item) => !item.roles || item.roles.includes(userRole)

  );



  return (

    <div className="flex h-screen overflow-hidden bg-muted font-sans text-foreground">

      <aside

        className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col justify-between overflow-hidden border-r border-secondary bg-card transition-all duration-300 ${

          sidebarExpanded ? "w-64" : "w-[76px]"

        } ${

          mobileMenuOpen

            ? "translate-x-0 w-64"

            : "-translate-x-full lg:translate-x-0"

        }`}

      >

        <div>

          <div

            className={`flex h-16 shrink-0 items-center border-b border-muted ${

              isExpanded ? "justify-between px-6" : "justify-center"

            }`}

          >

            <div className="flex items-center gap-2.5">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary p-1.5 shadow-md">

                <ShieldAlert className="h-5 w-5 text-primary-foreground" />

              </div>



              {isExpanded && (

                <div>

                  <span className="text-sm font-extrabold">SYSTEM</span>

                  <span className="block text-[9px] font-bold uppercase tracking-wider text-primary">

                    ADMIN PORTAL

                  </span>

                </div>

              )}

            </div>

          </div>



          <nav className="space-y-1.5 p-4">

            {filteredNavItems.map((item) => {

              const Icon = item.icon;

              const isActive = location.pathname === item.path;



              return (

                <Link

                  key={item.path}

                  to={item.path}

                  onClick={() => setMobileMenuOpen(false)}

                  className={`flex w-full items-center rounded-xl text-sm font-bold transition-all ${

                    isExpanded

                      ? "justify-between px-3.5 py-2.5"

                      : "justify-center py-2.5"

                  } ${

                    isActive

                      ? "bg-primary text-primary-foreground shadow-sm"

                      : "text-muted-foreground hover:bg-muted hover:text-foreground"

                  }`}

                >

                  <div className="flex items-center gap-3">

                    <Icon className="h-5 w-5 shrink-0" />

                    {isExpanded && <span>{item.title}</span>}

                  </div>

                </Link>

              );

            })}

          </nav>

        </div>



        <div className="shrink-0 space-y-3 border-t border-muted bg-muted/70 p-4">

          <button

            type="button"

            onClick={() => setShowAdminProfile(true)}

            className={`w-full rounded-xl text-left transition-colors hover:bg-card ${

              isExpanded ? "px-2 py-2" : "flex justify-center p-1"

            }`}

          >

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">

                <UserIcon className="h-4.5 w-4.5" />

              </div>



              {isExpanded && (

                <div className="min-w-0 overflow-hidden">

                  <p className="truncate text-xs font-extrabold">

                    {user?.name || "Administrator"}

                  </p>

                  <p className="truncate text-[10px] text-muted-foreground">

                    {user?.email || "admin@gmail.com"}

                  </p>

                </div>

              )}

            </div>

          </button>



          <button

            type="button"

            onClick={logout}

            className="flex w-full items-center justify-center rounded-xl border border-destructive/20 py-2.5 text-xs font-bold text-destructive transition-colors hover:bg-destructive/10"

          >

            <LogOut className="mr-2 h-4 w-4" />

            {isExpanded && <span>Logout</span>}

          </button>

        </div>

      </aside>



      <div

        className={`flex h-screen min-h-0 flex-1 flex-col overflow-hidden transition-all duration-300 ${

          sidebarExpanded ? "lg:pl-64" : "lg:pl-[76px]"

        }`}

      >

        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b border-secondary bg-card px-6">

          <div className="flex items-center gap-6">

            <button

              type="button"

              onClick={handleToggle}

              className="rounded-xl border border-secondary p-2 transition-colors hover:bg-muted"

              aria-label="Toggle sidebar"

            >

              <Menu className="h-5 w-5" />

            </button>



            <h1 className="text-lg font-extrabold uppercase tracking-wide">

              SYSTEM ADMIN PORTAL

            </h1>

          </div>

        </header>



        <main className="flex-1 min-h-0 overflow-hidden p-4 md:p-8">

          <Outlet />

        </main>

      </div>



      {showAdminProfile && (

        <AdminProfileSecurity

          user={user}

          onClose={() => setShowAdminProfile(false)}

        />

      )}

    </div>

  );

};
