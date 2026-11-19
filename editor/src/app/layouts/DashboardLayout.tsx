import React, { useState } from "react"

import docupilotLogo from "../../assets/images/docupilot-logo.png"

import { Link, useLocation, Outlet } from "react-router-dom"

import { useAuth } from "@/features/auth/index"

import { navigationItems } from "../config/navigation"

import { Role } from "../config/roles"

import {
  Menu,
  LogOut,
  X,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff,
  Moon,
  Sun,
} from "lucide-react"

import { useTheme } from "@/shared/components/theme/themeToggle"

import { useUsersStore } from "@/shared/stores/usersStore"

interface AdminProfileSecurityProps {
  user:
    | {
        id: string
        name?: string
        email?: string
        role?: string
      }
    | null
    | undefined

  onClose: () => void
}

function AdminProfileSecurity({ user, onClose }: AdminProfileSecurityProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile")

  const [newPassword, setNewPassword] = useState("")

  const [confirmPassword, setConfirmPassword] = useState("")

  const [showNewPassword, setShowNewPassword] = useState(false)

  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [success, setSuccess] = useState(false)

  const [error, setError] = useState("")

  const email = user?.email || "admin@gmail.com"

  const role = user?.role || "Admin"

  const { changeUserPassword } = useUsersStore()

  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const openPasswordTab = () => {
    setActiveTab("password")

    setError("")

    setSuccess(false)
  }

  const handleSavePassword = async () => {
    setError("")
    setSuccess(false)

    if (!user?.id) {
      setError("Unable to identify the administrator.")
      return
    }

    // Password validation
    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters.")
      return
    }

    if (new TextEncoder().encode(newPassword).length > 72) {
      setError("Password must not exceed 72 bytes.")
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError("Password must contain at least one uppercase letter.")
      return
    }

    if (!/[a-z]/.test(newPassword)) {
      setError("Password must contain at least one lowercase letter.")
      return
    }

    if (!/[0-9]/.test(newPassword)) {
      setError("Password must contain at least one number.")
      return
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setError("Password must contain at least one special character.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsChangingPassword(true)

    try {
      await changeUserPassword(user.id, newPassword)

      setSuccess(true)
      setNewPassword("")
      setConfirmPassword("")
      setShowNewPassword(false)
      setShowConfirmPassword(false)
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            message?: string
            detail?: string
          }
        }
        message?: string
      }

      setError(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          "Failed to change password."
      )
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-2xs"

      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-90 overflow-hidden rounded-2xl border border-secondary bg-card shadow-2xl">
        <div className="flex items-start justify-between border-b border-muted px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img
                src={docupilotLogo}
                alt="DocuPilot Logo"
                className="h-12 w-12 shrink-0 object-contain"
              />
            </div>

            <div>
              <h2 className="text-base font-extrabold text-foreground">
                Admin Profile &amp; Security
              </h2>
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
              setActiveTab("profile")

              setError("")

              setSuccess(false)
            }}

            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeTab === "profile"
                ? "bg-button-primary text-button-primary-foreground shadow-sm"
                : "border border-secondary bg-card text-secondary-foreground hover:bg-muted"
            }`}
          >
            Profile Overview
          </button>
        </div>

        <div className="px-5 pt-4 pb-5">
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

                  <span className="text-xs font-bold text-primary uppercase">
                    {role}
                  </span>
                </div>
              </div>

              <button
                type="button"

                onClick={openPasswordTab}

                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-button-primary px-4 py-2.5 text-xs font-bold text-button-primary-foreground shadow-sm transition hover:bg-button-primary-hover"
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
                    Email
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
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-secondary bg-muted px-4 py-2.5 pr-10 text-xs text-foreground transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />

                    <button
                      type="button"
                      onClick={() => setShowNewPassword((value) => !value)}
                      aria-label={
                        showNewPassword
                          ? "Hide new password"
                          : "Show new password"
                      }
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
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
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Re-enter new password"
                      className="w-full rounded-xl border border-secondary bg-muted px-4 py-2.5 pr-10 text-xs text-foreground transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-secondary-foreground"
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
                    setActiveTab("profile")

                    setError("")

                    setSuccess(false)
                  }}

                  className="rounded-lg px-4 py-2 text-xs font-semibold text-secondary-foreground transition hover:bg-muted"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSavePassword}
                  disabled={isChangingPassword}
                  className="rounded-lg bg-button-primary px-5 py-2 text-xs font-bold text-button-primary-foreground shadow-sm transition hover:bg-button-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isChangingPassword ? "Updating..." : "Save New Password"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [theme, setTheme] = useTheme()

  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    return localStorage.getItem("sidebarExpanded") === "true"
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showAdminProfile, setShowAdminProfile] = useState(false)

  const isExpanded = sidebarExpanded || mobileMenuOpen

  const handleToggle = () => {
    if (window.innerWidth < 1024) {
      setMobileMenuOpen((value) => !value)
      return
    }

    const nextState = !sidebarExpanded
    setSidebarExpanded(nextState)
    localStorage.setItem("sidebarExpanded", String(nextState))
  }

  const userRole = (user?.role || Role.Author) as Role
  const filteredNavItems = navigationItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#EEF7FF] font-sans text-[#172033] dark:bg-[#0B1426] dark:text-white">
      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col pt-[var(--safe-top)] pb-[var(--safe-bottom)] pl-[var(--safe-left)] justify-between overflow-hidden border-r border-[#DCE7F2] bg-[#D3E3FC] transition-all duration-300 dark:border-[#294564] dark:bg-[#0D213D] ${
          sidebarExpanded ? "w-[188px]" : "w-16"
        } ${
          mobileMenuOpen
            ? "w-[188px] translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Logo & Title */}
          <div
            className={`flex h-14 shrink-0 items-center border-b border-[#DCE7F2] dark:border-[#294564] ${
              isExpanded ? "justify-between px-3.5" : "justify-center"
            }`}
          >
            <div className="flex items-center gap-2">
              <img
                src={docupilotLogo}
                alt="DocuPilot Logo"
                className="h-12 w-12 shrink-0 object-contain"
              />

              {isExpanded && (
                <div className="leading-tight">
                  <span className="block text-xl font-black tracking-tight text-[#172033] dark:text-white">
                    Docu Pilot
                  </span>

                  <span className="block text-[8px] font-semibold tracking-wide text-[#64748B] dark:text-slate-400">
                    Doc. Prep. Reimagined!
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5 p-3">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex w-full items-center rounded-xl text-xs font-bold transition-all ${
                    isExpanded ? "px-3 py-2" : "justify-center py-2"
                  } ${
                    isActive
                      ? "bg-white text-[#324480] shadow-xs dark:bg-[#132742] dark:text-[#38BDF8]"
                      : "text-[#64748B] hover:bg-white/60 hover:text-[#172033] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    {isExpanded && <span>{item.title}</span>}
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Bottom Profile and Sign Out */}
        <div className="shrink-0 space-y-2 border-t border-[#DCE7F2] p-3 dark:border-[#294564]">
          <button
            type="button"
            onClick={() => setShowAdminProfile(true)}
            className={`w-full cursor-pointer rounded-xl text-left transition-colors hover:bg-white/40 dark:hover:bg-white/10 ${
              isExpanded ? "p-1.5" : "flex justify-center p-1"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#DCE7F2] bg-white text-xs font-bold text-[#172033] shadow-xs dark:border-[#294564] dark:bg-[#132742] dark:text-white">
                {/* {user?.name ? user.name[0].toUpperCase() : "S"} */}
                <span className="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full border border-white bg-[#10B981] dark:border-[#132742]" />
              </div>

              {isExpanded && (
                <div className="min-w-0 overflow-hidden leading-tight">
                  <h5 className="truncate text-[12px] text-[#94A3B8] dark:text-slate-500">
                    Workspace
                  </h5>
                </div>
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={logout}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-[#DCE7F2] bg-white py-1.5 text-xs font-bold text-[#172033] shadow-xs transition-colors hover:bg-slate-50 dark:border-[#294564] dark:bg-[#132742] dark:text-white dark:hover:bg-[#1C3659]"
          >
            <LogOut className="h-3.5 w-3.5 text-[#64748B] dark:text-slate-400" />
            {isExpanded && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER BACKDROP */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* MAIN CONTAINER */}
      <div
        className={`flex h-screen min-h-0 flex-1 flex-col overflow-hidden transition-all duration-300 ${
          sidebarExpanded ? "lg:pl-[188px]" : "lg:pl-16"
        }`}
      >
        {/* TOP HEADER */}
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-[#DCE7F2] bg-[#D3E3FC] px-4 md:px-6 dark:border-[#294564] dark:bg-[#0D213D]">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={handleToggle}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#DCE7F2] bg-white text-[#324480] shadow-xs transition-colors hover:bg-slate-50 dark:border-[#294564] dark:bg-[#132742] dark:text-[#38BDF8] dark:hover:bg-[#1C3659]"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>

            <h1 className="truncate text-xs font-extrabold tracking-wider text-[#172033] uppercase md:text-sm dark:text-white">
              SYSTEM ADMIN PORTAL
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#DCE7F2] bg-white text-[#324480] shadow-xs transition-colors hover:bg-slate-50 dark:border-[#294564] dark:bg-[#132742] dark:text-[#38BDF8] dark:hover:bg-[#1C3659]"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT */}
        <main className="min-h-0 flex-1 overflow-y-auto bg-[#EEF7FF] p-4 sm:p-6 md:p-8 dark:bg-[#0B1426]">
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
  )
}
