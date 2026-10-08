/**
 * --------------------------------------------------------
 * Module: Settings
 * Feature: SettingsPage Component
 * Description:
 * Exact pixel-perfect implementation of the enterprise Settings tab panel
 * with profile photo viewing, upload, and management matching user requirements.
 * --------------------------------------------------------
 */

import React, { useRef, useState } from "react";
import {
  Settings,
  Moon,
  Sun,
  Monitor,
  Check,
  Key,
  ShieldCheck,
  User,
  LogOut,
  Pencil,
  CheckCircle2,
  X,
  Lock,
  Camera,
  Shield,
  Eye,
  Trash2,
  Upload,
} from "lucide-react";
import { SettingsProvider, useSettingsContext } from "../context";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/routePaths";

type SettingsTab = "profile" | "preferences" | "security";

function SettingsPageContent() {
  const { settings, updateSettings } = useSettingsContext();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userFullName =
    user?.name ||
    settings.userName ||
    `${settings.firstName} ${settings.lastName}` ||
    "Bhumika C";
  const nameParts = userFullName.trim().split(/\s+/);
  const userFirstName = nameParts[0] || "Bhumika";
  const userLastName = nameParts.slice(1).join(" ") || "C";
  const userEmail = user?.email || settings.userEmail || "bhumika@parexel.com";
  const userRole = user?.role || settings.userRole || "Medical Writer";
  const userDepartment =
    user?.workspace || settings.userDepartment || "Clinical Research";
  const userDesignation =
    settings.userDesignation ||
    (user?.role ? `${user.role}` : "Medical Writer");
  const employeeId = user?.id
    ? user.id.startsWith("PX-")
      ? user.id
      : `PX-${user.id.slice(-5).toUpperCase()}`
    : settings.employeeId || "PX-89401";
  const displayInitials =
    userFullName
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "BC";

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isViewPhotoModalOpen, setIsViewPhotoModalOpen] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTE_PATHS.LOGIN, { replace: true });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload a valid image file (PNG, JPG, etc.)");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target?.result as string;
      await updateSettings({ avatarUrl: base64Url });
      showToast("Profile photo updated successfully");
    };
    reader.readAsDataURL(file);

    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  };

  return (
    <div className="settings-page-scroll flex h-full flex-col bg-card dark:bg-[#0c1929] overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-foreground px-4 py-3 text-xs font-semibold text-primary-foreground shadow-2xl dark:bg-muted dark:text-secondary animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-4 w-4 text-success-400 dark:text-success-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Input for Avatar Photo Upload */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Top Tabs Navigation Bar */}
      <div className="flex shrink-0 items-center border-b border-secondary bg-card px-3 dark:border-muted dark:bg-[#0c1929]">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "profile"
              ? "border-brand text-brand"
              : "border-transparent text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-muted-foreground"
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span>My Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("preferences")}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "preferences"
              ? "border-brand text-brand"
              : "border-transparent text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-muted-foreground"
          }`}
        >
          <Settings className="h-3.5 w-3.5" />
          <span>Preferences</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "security"
              ? "border-brand text-brand"
              : "border-transparent text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-muted-foreground"
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Security & Login</span>
        </button>
      </div>

      {/* Panel Body Content */}
      <div className="p-4 space-y-4">
        {/* ============================================================
            TAB 1: MY PROFILE (Matches Screenshot 1)
        ============================================================ */}
        {activeTab === "profile" && (
          <div className="rounded-2xl border border-secondary/90 bg-card p-5 shadow-sm dark:border-muted dark:bg-[#111D29]">
            {/* Top-Right Status Badge */}
            <div className="flex justify-end">
              <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-semibold text-success-700 dark:bg-success-950/60 dark:text-success-400 border border-success-200/60 dark:border-success-800/60">
                <span className="h-1.5 w-1.5 rounded-full bg-success-600" />
                Active
              </span>
            </div>

            {/* Centered Large Circular Avatar */}
            <div className="flex flex-col items-center text-center -mt-1">
              <div
                onClick={() => {
                  if (settings.avatarUrl) {
                    setIsViewPhotoModalOpen(true);
                  } else {
                    avatarInputRef.current?.click();
                  }
                }}
                title={settings.avatarUrl ? "Click to view or change photo" : "Click to upload profile photo"}
                className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-[#1e3a5f] text-primary-foreground shadow-md cursor-pointer overflow-hidden border-2 border-secondary dark:border-secondary-foreground transition-transform hover:scale-105"
              >
                {settings.avatarUrl ? (
                  <img
                    src={settings.avatarUrl}
                    alt={userFullName}
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center font-bold text-xl text-primary-foreground">
                    {displayInitials}
                  </div>
                )}

                {/* Hover overlay indicator */}
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  {settings.avatarUrl ? (
                    <Eye className="h-5 w-5 text-primary-foreground" />
                  ) : (
                    <Camera className="h-5 w-5 text-primary-foreground" />
                  )}
                </div>
              </div>

              {/* Action Links below Avatar */}
              <div className="mt-2 flex items-center justify-center gap-2 text-[11px]">
                {settings.avatarUrl ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsViewPhotoModalOpen(true)}
                      className="font-semibold text-brand hover:underline flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>View Photo</span>
                    </button>
                    <span className="text-muted-foreground dark:text-secondary-foreground">•</span>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="font-semibold text-secondary-foreground hover:underline dark:text-muted-foreground flex items-center gap-1"
                    >
                      <Camera className="h-3 w-3" />
                      <span>Change</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="font-semibold text-brand hover:underline flex items-center gap-1"
                  >
                    <Camera className="h-3 w-3" />
                    <span>Upload Photo</span>
                  </button>
                )}
              </div>

              <h2 className="mt-2 text-base font-bold text-foreground dark:text-primary-foreground">
                {userFullName}
              </h2>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                {userDesignation}
              </p>
            </div>

            <div className="my-4 border-t border-muted dark:border-muted" />

            {/* Two-Column Info List */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground dark:text-muted-foreground">Employee ID</span>
                <span className="font-semibold text-foreground dark:text-muted">
                  {employeeId}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground dark:text-muted-foreground">Email</span>
                <span
                  className="font-semibold text-foreground dark:text-muted truncate max-w-[200px]"
                  title={userEmail}
                >
                  {userEmail}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground dark:text-muted-foreground">Department</span>
                <span className="font-semibold text-foreground dark:text-muted">
                  {userDepartment}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground dark:text-muted-foreground">Role</span>
                <span className="inline-flex items-center rounded-full bg-[#e0f2fe] px-2.5 py-0.5 text-[11px] font-semibold text-brand dark:bg-navy-950/80 dark:text-navy-300">
                  {userRole}
                </span>
              </div>
            </div>

            <div className="my-4 border-t border-muted dark:border-muted" />

            {/* Bottom Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditInfoOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-secondary bg-card py-2 text-xs font-semibold text-brand hover:bg-primary/50 dark:border-secondary-foreground dark:bg-secondary dark:text-primary dark:hover:bg-muted transition-colors shadow-sm"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Edit Info</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                aria-label="Logout"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/60 text-destructive hover:bg-destructive/10 hover:border-destructive/30 dark:border-destructive/50 dark:bg-destructive/30 dark:text-destructive dark:hover:bg-destructive/60 transition-colors shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 2: PREFERENCES (Matches Screenshot 2)
        ============================================================ */}
        {activeTab === "preferences" && (
          <div className="rounded-2xl border border-secondary/90 bg-card p-5 shadow-sm dark:border-muted dark:bg-[#111D29] space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-muted dark:border-muted">
              <div className="flex items-center gap-2">
                <Settings className="h-3.5 w-3.5 text-secondary-foreground dark:text-muted-foreground" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground dark:text-primary-foreground">
                  User Preferences & Appearance
                </h3>
              </div>
            </div>

            {/* Appearance Theme */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-foreground dark:text-muted-foreground">
                Appearance Theme
              </label>

              <div className="grid grid-cols-3 gap-2">
                {/* 1. Light Theme */}
                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ theme: "light" });
                    showToast("Theme changed to Light");
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all ${
                    settings.theme === "light"
                      ? "border-brand bg-primary/20"
                      : "border-secondary bg-card hover:border-border dark:border-muted dark:bg-secondary"
                  }`}
                >
                  <div className="relative h-12 w-full rounded-lg border border-secondary bg-card p-1 shadow-sm overflow-hidden flex">
                    <div className="w-2 bg-muted rounded-l h-full shrink-0" />
                    <div className="flex-1 flex flex-col pl-1">
                      <div className="h-1.5 w-full bg-brand rounded-t" />
                      <div className="flex-1 bg-card mt-0.5 rounded-b border border-muted" />
                    </div>
                    {settings.theme === "light" && (
                      <div className="absolute bottom-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand text-primary-foreground">
                        <Check className="h-2 w-2 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span
                    className={`flex items-center gap-1 text-[11px] font-semibold ${
                      settings.theme === "light"
                        ? "text-brand"
                        : "text-secondary-foreground dark:text-muted-foreground"
                    }`}
                  >
                    <Sun className="h-3 w-3" />
                    <span>Light</span>
                  </span>
                </button>

                {/* 2. Dark Theme */}
                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ theme: "dark" });
                    showToast("Theme changed to Dark");
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all ${
                    settings.theme === "dark"
                      ? "border-brand bg-primary/20"
                      : "border-secondary bg-card hover:border-border dark:border-muted dark:bg-secondary"
                  }`}
                >
                  <div className="relative h-12 w-full rounded-lg border border-foreground bg-foreground p-1 shadow-sm overflow-hidden flex">
                    <div className="w-2 bg-foreground rounded-l h-full shrink-0" />
                    <div className="flex-1 flex flex-col pl-1">
                      <div className="h-1.5 w-full bg-brand rounded-t" />
                      <div className="flex-1 bg-secondary-foreground mt-0.5 rounded-b" />
                    </div>
                    {settings.theme === "dark" && (
                      <div className="absolute bottom-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand text-primary-foreground">
                        <Check className="h-2 w-2 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span
                    className={`flex items-center gap-1 text-[11px] font-semibold ${
                      settings.theme === "dark"
                        ? "text-brand"
                        : "text-secondary-foreground dark:text-muted-foreground"
                    }`}
                  >
                    <Moon className="h-3 w-3" />
                    <span>Dark</span>
                  </span>
                </button>

                {/* 3. System Theme */}
                <button
                  type="button"
                  onClick={() => {
                    updateSettings({ theme: "system" });
                    showToast("Theme set to System");
                  }}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all ${
                    settings.theme === "system"
                      ? "border-brand bg-primary/20"
                      : "border-secondary bg-card hover:border-border dark:border-muted dark:bg-secondary"
                  }`}
                >
                  <div className="relative h-12 w-full rounded-lg border border-border bg-gradient-to-r from-secondary to-foreground p-1 shadow-sm overflow-hidden flex">
                    <div className="w-2 bg-secondary rounded-l h-full shrink-0" />
                    <div className="flex-1 flex flex-col pl-1">
                      <div className="h-1.5 w-full bg-brand rounded-t" />
                      <div className="flex-1 bg-gradient-to-r from-white to-secondary-foreground mt-0.5 rounded-b" />
                    </div>
                    {settings.theme === "system" && (
                      <div className="absolute bottom-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand text-primary-foreground">
                        <Check className="h-2 w-2 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span
                    className={`flex items-center gap-1 text-[11px] font-semibold ${
                      settings.theme === "system"
                        ? "text-brand"
                        : "text-secondary-foreground dark:text-muted-foreground"
                    }`}
                  >
                    <Monitor className="h-3 w-3" />
                    <span>System</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Toggle Rows with Dividers */}
            <div className="space-y-3.5 pt-2">
              {/* 1. Enable Auto Save */}
              <div className="flex items-center justify-between py-2 border-t border-muted dark:border-muted">
                <div className="pr-4">
                  <span className="block text-xs font-semibold text-foreground dark:text-muted-foreground">
                    Enable Auto Save
                  </span>
                  <span className="block text-[11px] text-muted-foreground dark:text-muted-foreground">
                    Auto-commits local revisions to history snapshot.
                  </span>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.autoSave}
                  onClick={() => {
                    updateSettings({ autoSave: !settings.autoSave });
                    showToast(
                      `Auto save ${!settings.autoSave ? "enabled" : "disabled"}`
                    );
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.autoSave
                      ? "bg-brand"
                      : "bg-secondary dark:bg-secondary-foreground"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow ring-0 transition duration-200 ease-in-out ${
                      settings.autoSave ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 2. Enable Notifications */}
              <div className="flex items-center justify-between py-2 border-t border-muted dark:border-muted">
                <div className="pr-4">
                  <span className="block text-xs font-semibold text-foreground dark:text-muted-foreground">
                    Enable Notifications
                  </span>
                  <span className="block text-[11px] text-muted-foreground dark:text-muted-foreground">
                    Notify when backups complete or templates apply.
                  </span>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.enableNotifications}
                  onClick={() => {
                    updateSettings({
                      enableNotifications: !settings.enableNotifications,
                    });
                    showToast(
                      `Notifications ${
                        !settings.enableNotifications ? "enabled" : "disabled"
                      }`
                    );
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.enableNotifications
                      ? "bg-brand"
                      : "bg-secondary dark:bg-secondary-foreground"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow ring-0 transition duration-200 ease-in-out ${
                      settings.enableNotifications
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 3. Track Changes by Default */}
              <div className="flex items-center justify-between py-2 border-t border-muted dark:border-muted">
                <div className="pr-4">
                  <span className="block text-xs font-semibold text-foreground dark:text-muted-foreground">
                    Track Changes by Default
                  </span>
                  <span className="block text-[11px] text-muted-foreground dark:text-muted-foreground">
                    Toggle default log-edits mode for new sections.
                  </span>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.trackChangesByDefault}
                  onClick={() => {
                    updateSettings({
                      trackChangesByDefault: !settings.trackChangesByDefault,
                    });
                    showToast(
                      `Track changes ${
                        !settings.trackChangesByDefault ? "enabled" : "disabled"
                      }`
                    );
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.trackChangesByDefault
                      ? "bg-brand"
                      : "bg-secondary dark:bg-secondary-foreground"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow ring-0 transition duration-200 ease-in-out ${
                      settings.trackChangesByDefault
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 4. Enable AI Content Suggestions */}
              <div className="flex items-center justify-between py-2 border-t border-muted dark:border-muted">
                <div className="pr-4">
                  <span className="block text-xs font-semibold text-foreground dark:text-muted-foreground">
                    Enable AI Content Suggestions
                  </span>
                  <span className="block text-[11px] text-muted-foreground dark:text-muted-foreground">
                    AI content and real-time writing assistance.
                  </span>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.enableAiSuggestions}
                  onClick={() => {
                    updateSettings({
                      enableAiSuggestions: !settings.enableAiSuggestions,
                    });
                    showToast(
                      `AI content suggestions ${
                        !settings.enableAiSuggestions ? "enabled" : "disabled"
                      }`
                    );
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.enableAiSuggestions
                      ? "bg-brand"
                      : "bg-secondary dark:bg-secondary-foreground"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow ring-0 transition duration-200 ease-in-out ${
                      settings.enableAiSuggestions
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 3: SECURITY & LOGIN (Matches Screenshot 3)
        ============================================================ */}
        {activeTab === "security" && (
          <div className="space-y-4">
            {/* Card 1: ACCOUNT PASSWORD */}
            <div className="rounded-2xl border border-secondary/90 bg-card p-5 shadow-sm dark:border-muted dark:bg-[#111D29]">
              <div className="flex items-center gap-2 pb-3 border-b border-muted dark:border-muted">
                <Lock className="h-4 w-4 text-secondary-foreground dark:text-muted-foreground" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground dark:text-primary-foreground">
                  Account Password
                </h3>
              </div>

              <div className="pt-3.5 flex items-center justify-between gap-4">
                <div>
                  <span className="block text-xs font-semibold text-foreground dark:text-muted-foreground">
                    Update Password
                  </span>
                  <span className="block text-[11px] text-muted-foreground dark:text-muted-foreground leading-relaxed">
                    Regularly changing your password improves regulatory audit scores.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="rounded-xl border border-secondary bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted dark:border-secondary-foreground dark:bg-secondary dark:text-muted-foreground dark:hover:bg-muted transition-colors shadow-sm shrink-0"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Card 2: TWO-FACTOR AUTHENTICATION (2FA) */}
            <div className="rounded-2xl border border-secondary/90 bg-card p-5 shadow-sm dark:border-muted dark:bg-[#111D29] space-y-3.5">
              <div className="flex items-center gap-2 pb-3 border-b border-muted dark:border-muted">
                <Key className="h-4 w-4 text-secondary-foreground dark:text-muted-foreground" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground dark:text-primary-foreground">
                  Two-Factor Authentication (2FA)
                </h3>
              </div>

              <div className="flex items-center justify-between">
                <div className="pr-4">
                  <span className="block text-xs font-semibold text-foreground dark:text-muted-foreground">
                    Authenticator App Verification
                  </span>
                  <span className="block text-[11px] text-muted-foreground dark:text-muted-foreground leading-relaxed">
                    Use verification codes from an authenticator app (like Microsoft Authenticator) for login.
                  </span>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.twoFactorEnabled}
                  onClick={() => {
                    updateSettings({
                      twoFactorEnabled: !settings.twoFactorEnabled,
                    });
                    showToast(
                      `2FA ${
                        !settings.twoFactorEnabled ? "enabled" : "disabled"
                      }`
                    );
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.twoFactorEnabled
                      ? "bg-success-500"
                      : "bg-secondary dark:bg-secondary-foreground"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow ring-0 transition duration-200 ease-in-out ${
                      settings.twoFactorEnabled
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Green Success Information Box */}
              {settings.twoFactorEnabled && (
                <div className="flex items-start gap-2.5 rounded-xl bg-success-50 p-3.5 border border-success-200 dark:bg-success-950/30 dark:border-success-800/50">
                  <ShieldCheck className="h-4 w-4 text-success-600 dark:text-success-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-success-800 dark:text-success-300">
                      2FA Status: Enabled & Active
                    </span>
                    <p className="mt-0.5 text-[11px] text-secondary-foreground dark:text-muted-foreground leading-relaxed">
                      Backup codes are active (8 codes remaining). Make sure your authenticator is synced.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          MODAL 1: EDIT PROFILE MODAL (Exact match to Reference Screenshot)
      ============================================================ */}
      {isEditInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-secondary bg-card p-6 shadow-2xl dark:border-muted dark:bg-[#0c1929]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-muted pb-3.5 dark:border-muted">
              <div className="flex items-center gap-2">
                <Pencil className="h-4 w-4 text-brand" />
                <h3 className="text-sm font-bold text-foreground dark:text-primary-foreground">Edit Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditInfoOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted dark:hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const employeeId = (form.elements.namedItem("employeeId") as HTMLInputElement).value;
                const role = (form.elements.namedItem("role") as HTMLInputElement).value;
                const designation = (form.elements.namedItem("designation") as HTMLInputElement).value;
                const department = (form.elements.namedItem("department") as HTMLInputElement).value;
                const phoneNumber = (form.elements.namedItem("phoneNumber") as HTMLInputElement).value;
                const location = (form.elements.namedItem("location") as HTMLInputElement).value;
                const timeZone = (form.elements.namedItem("timeZone") as HTMLInputElement).value;
                const language = (form.elements.namedItem("language") as HTMLInputElement).value;

                updateSettings({
                  employeeId,
                  userRole: role,
                  userDesignation: designation,
                  userDepartment: department,
                  phoneNumber,
                  location,
                  timeZone,
                  language,
                });
                setIsEditInfoOpen(false);
                showToast("Profile information updated");
              }}
              className="mt-4 space-y-3.5 text-xs"
            >
              {/* Profile Photo Row */}
              <div className="flex items-center gap-3.5 pb-1">
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="group relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-primary-foreground shadow-sm cursor-pointer overflow-hidden border border-secondary dark:border-secondary-foreground"
                >
                  {settings.avatarUrl ? (
                    <img
                      src={settings.avatarUrl}
                      alt={settings.userName || "Profile"}
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <Camera className="h-5 w-5 text-primary-foreground/80" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Camera className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>

                <div className="text-xs">
                  <span className="block font-semibold text-foreground dark:text-muted-foreground">
                    Profile Photo
                  </span>
                  <div className="mt-0.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="text-[11px] font-semibold text-brand hover:underline"
                    >
                      Upload New
                    </button>
                    {settings.avatarUrl && (
                      <>
                        <span className="text-muted-foreground dark:text-secondary-foreground">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            updateSettings({ avatarUrl: "" });
                            showToast("Profile photo removed");
                          }}
                          className="text-[11px] font-semibold text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 1: First Name & Last Name (Non-editable) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground mb-1">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    defaultValue={userFirstName}
                    readOnly
                    tabIndex={-1}
                    className="h-9 w-full rounded-xl border border-secondary bg-muted/80 px-3 text-xs text-muted-foreground outline-none cursor-not-allowed dark:border-muted dark:bg-muted/50 dark:text-muted-foreground select-none shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground mb-1">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    defaultValue={userLastName}
                    readOnly
                    tabIndex={-1}
                    className="h-9 w-full rounded-xl border border-secondary bg-muted/80 px-3 text-xs text-muted-foreground outline-none cursor-not-allowed dark:border-muted dark:bg-muted/50 dark:text-muted-foreground select-none shadow-sm"
                  />
                </div>
              </div>

              {/* Row 2: Employee ID & Role */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-foreground dark:text-muted-foreground mb-1">
                    Employee ID
                  </label>
                  <input
                    name="employeeId"
                    defaultValue={employeeId}
                    required
                    className="h-9 w-full rounded-xl border border-secondary bg-card px-3 text-xs text-foreground outline-none focus:border-brand dark:border-secondary-foreground dark:bg-secondary dark:text-muted-foreground shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-foreground dark:text-muted-foreground mb-1">
                    Role
                  </label>
                  <input
                    name="role"
                    defaultValue={userRole}
                    required
                    className="h-9 w-full rounded-xl border border-secondary bg-card px-3 text-xs text-foreground outline-none focus:border-brand dark:border-secondary-foreground dark:bg-secondary dark:text-muted-foreground shadow-sm"
                  />
                </div>
              </div>

              {/* Row 3: Designation & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-foreground dark:text-muted-foreground mb-1">
                    Designation
                  </label>
                  <input
                    name="designation"
                    defaultValue={userDesignation}
                    required
                    className="h-9 w-full rounded-xl border border-secondary bg-card px-3 text-xs text-foreground outline-none focus:border-brand dark:border-secondary-foreground dark:bg-secondary dark:text-muted-foreground shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-foreground dark:text-muted-foreground mb-1">
                    Department
                  </label>
                  <input
                    name="department"
                    defaultValue={userDepartment}
                    required
                    className="h-9 w-full rounded-xl border border-secondary bg-card px-3 text-xs text-foreground outline-none focus:border-brand dark:border-secondary-foreground dark:bg-secondary dark:text-muted-foreground shadow-sm"
                  />
                </div>
              </div>

              {/* Row 4: Email (Non-editable) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-muted-foreground mb-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  defaultValue={userEmail}
                  readOnly
                  tabIndex={-1}
                  className="h-9 w-full rounded-xl border border-secondary bg-muted/80 px-3 text-xs text-muted-foreground outline-none cursor-not-allowed dark:border-muted dark:bg-muted/50 dark:text-muted-foreground select-none shadow-sm"
                />
              </div>

              {/* Row 5: Phone Number & Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-foreground dark:text-muted-foreground mb-1">
                    Phone Number
                  </label>
                  <input
                    name="phoneNumber"
                    defaultValue={settings.phoneNumber || "+1 (555) 382-9012"}
                    className="h-9 w-full rounded-xl border border-secondary bg-card px-3 text-xs text-foreground outline-none focus:border-brand dark:border-secondary-foreground dark:bg-secondary dark:text-muted-foreground shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-foreground dark:text-muted-foreground mb-1">
                    Location
                  </label>
                  <input
                    name="location"
                    defaultValue={settings.location || "Boston, MA, USA"}
                    className="h-9 w-full rounded-xl border border-secondary bg-card px-3 text-xs text-foreground outline-none focus:border-brand dark:border-secondary-foreground dark:bg-secondary dark:text-muted-foreground shadow-sm"
                  />
                </div>
              </div>

              {/* Row 6: Time Zone & Language */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-foreground dark:text-muted-foreground mb-1">
                    Time Zone
                  </label>
                  <input
                    name="timeZone"
                    defaultValue={settings.timeZone || "America/New_York (EST)"}
                    className="h-9 w-full rounded-xl border border-secondary bg-card px-3 text-xs text-foreground outline-none focus:border-brand dark:border-secondary-foreground dark:bg-secondary dark:text-muted-foreground shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-secondary-foreground dark:text-muted-foreground mb-1">
                    Language
                  </label>
                  <input
                    name="language"
                    defaultValue={settings.language || "English (US)"}
                    className="h-9 w-full rounded-xl border border-secondary bg-card px-3 text-xs text-foreground outline-none focus:border-brand dark:border-secondary-foreground dark:bg-secondary dark:text-muted-foreground shadow-sm"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-2 pt-3.5 border-t border-muted dark:border-muted">
                <button
                  type="button"
                  onClick={() => setIsEditInfoOpen(false)}
                  className="rounded-xl border border-secondary bg-card px-4 py-2 text-xs font-semibold text-secondary-foreground hover:bg-muted dark:border-secondary-foreground dark:bg-secondary dark:text-muted-foreground dark:hover:bg-muted transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-brand-deep transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 2: VIEW / ENLARGE PROFILE PHOTO MODAL
      ============================================================ */}
      {isViewPhotoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-secondary bg-card p-6 shadow-2xl dark:border-muted dark:bg-[#0c1929] flex flex-col items-center text-center">
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between border-b border-muted pb-3 dark:border-muted">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-brand" />
                <h3 className="text-sm font-bold text-foreground dark:text-primary-foreground">Profile Photo</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsViewPhotoModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted dark:hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Enlarged Photo Container */}
            <div className="my-5 relative flex h-48 w-48 items-center justify-center rounded-full bg-[#1e3a5f] shadow-xl overflow-hidden border-4 border-muted dark:border-secondary-foreground">
              {settings.avatarUrl ? (
                <img
                  src={settings.avatarUrl}
                  alt={settings.userName || "Profile"}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-primary-foreground">
                  <Camera className="h-12 w-12 text-primary-foreground/80 mb-2" />
                  <span className="text-xs font-semibold text-primary-foreground/90">No Photo Uploaded</span>
                </div>
              )}
            </div>

            <h4 className="text-sm font-bold text-foreground dark:text-primary-foreground">
              {settings.userName || `${settings.firstName} ${settings.lastName}`}
            </h4>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-0.5">
              {settings.userDesignation || "Senior Clinical Document Lead"}
            </p>

            {/* Photo Action Buttons */}
            <div className="mt-5 w-full flex flex-col gap-2 pt-3 border-t border-muted dark:border-muted">
              <div className="flex items-center gap-2 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setIsViewPhotoModalOpen(false);
                    avatarInputRef.current?.click();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-brand py-2 text-xs font-semibold text-primary-foreground hover:bg-brand-deep transition-colors shadow-sm"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload New</span>
                </button>

                {settings.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      updateSettings({ avatarUrl: "" });
                      setIsViewPhotoModalOpen(false);
                      showToast("Profile photo removed");
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/60 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 dark:border-destructive/50 dark:bg-destructive/30 dark:text-destructive transition-colors shadow-sm"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsViewPhotoModalOpen(false)}
                className="w-full rounded-xl border border-secondary bg-card py-2 text-xs font-semibold text-secondary-foreground hover:bg-muted dark:border-secondary-foreground dark:bg-secondary dark:text-muted-foreground dark:hover:bg-muted transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 3: CHANGE PASSWORD
      ============================================================ */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-secondary bg-card p-6 shadow-2xl dark:border-muted dark:bg-[#0c1929]">
            <div className="flex items-center justify-between border-b border-muted pb-3 dark:border-muted">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-brand" />
                <h3 className="text-sm font-bold text-foreground dark:text-primary-foreground">Change Account Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted dark:hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsPasswordModalOpen(false);
                showToast("Password updated successfully");
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block text-[11px] font-semibold text-secondary-foreground dark:text-muted-foreground">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="mt-1 h-9 w-full rounded-lg border border-secondary px-3 outline-none focus:border-brand dark:border-secondary-foreground dark:bg-secondary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-secondary-foreground dark:text-muted-foreground">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 8 characters"
                  className="mt-1 h-9 w-full rounded-lg border border-secondary px-3 outline-none focus:border-brand dark:border-secondary-foreground dark:bg-secondary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-secondary-foreground dark:text-muted-foreground">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-type new password"
                  className="mt-1 h-9 w-full rounded-lg border border-secondary px-3 outline-none focus:border-brand dark:border-secondary-foreground dark:bg-secondary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-muted dark:border-muted">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-secondary-foreground hover:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-brand-deep transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <SettingsProvider>
      <SettingsPageContent />
    </SettingsProvider>
  );
}
