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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[660px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-8 py-7">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Admin Profile &amp; Security
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                System Administrator Settings
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex gap-3 px-8 pt-5">
          <button
            type="button"
            onClick={() => {
              setActiveTab("profile");
              setError("");
              setSuccess(false);
            }}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              activeTab === "profile"
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Profile Overview
          </button>

          <button
            type="button"
            onClick={openPasswordTab}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              activeTab === "password"
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <KeyRound className="h-4 w-4" />
            Change Password
          </button>
        </div>

        <div className="px-8 pb-8 pt-7">
          {activeTab === "profile" ? (
            <div>
              <div className="space-y-7">
                <div className="flex items-center justify-between gap-6">
                  <span className="text-sm font-medium text-slate-500">
                    Administrator Email
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {email}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-6">
                  <span className="text-sm font-medium text-slate-500">
                    Account Role
                  </span>
                  <span className="text-sm font-bold uppercase text-blue-600">
                    {role}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-6">
                  <span className="text-sm font-medium text-slate-500">
                    Account Status
                  </span>
                  <span className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    ACTIVE SESSION
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={openPasswordTab}
                className="mt-9 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
              >
                <KeyRound className="h-5 w-5" />
                Change Admin Password
              </button>
            </div>
          ) : (
            <div>
              {success && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  Admin password updated successfully!
                </div>
              )}

              {error && (
                <div className="mb-6 rounded-2xl bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-600">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-800">
                    Account Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm text-slate-500 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-800">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 pr-12 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((value) => !value)}
                      aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-800">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full rounded-2xl border border-slate-200 px-5 py-3.5 pr-12 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("profile");
                    setError("");
                    setSuccess(false);
                  }}
                  className="rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePassword}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
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
    <div className="flex h-screen overflow-hidden bg-[#F3F4F6] font-sans text-slate-800">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col justify-between overflow-hidden border-r border-[#E5E7EB] bg-white transition-all duration-300 ${
          sidebarExpanded ? "w-64" : "w-[76px]"
        } ${
          mobileMenuOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          <div
            className={`flex h-16 shrink-0 items-center border-b border-slate-100 ${
              isExpanded ? "justify-between px-6" : "justify-center"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 p-1.5 shadow-md">
                <ShieldAlert className="h-5 w-5 text-white" />
              </div>

              {isExpanded && (
                <div>
                  <span className="text-sm font-extrabold">SYSTEM</span>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-blue-600">
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
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
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

        <div className="shrink-0 space-y-3 border-t border-slate-100 bg-slate-50/70 p-4">
          <button
            type="button"
            onClick={() => setShowAdminProfile(true)}
            className={`w-full rounded-xl text-left transition-colors hover:bg-white ${
              isExpanded ? "px-2 py-2" : "flex justify-center p-1"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600">
                <UserIcon className="h-4.5 w-4.5" />
              </div>

              {isExpanded && (
                <div className="min-w-0 overflow-hidden">
                  <p className="truncate text-xs font-extrabold">
                    {user?.name || "Administrator"}
                  </p>
                  <p className="truncate text-[10px] text-slate-500">
                    {user?.email || "admin@gmail.com"}
                  </p>
                </div>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center rounded-xl border border-rose-200 py-2.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50"
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
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b border-[#E5E7EB] bg-white px-6">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={handleToggle}
              className="rounded-xl border border-slate-200 p-2 transition-colors hover:bg-slate-50"
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
