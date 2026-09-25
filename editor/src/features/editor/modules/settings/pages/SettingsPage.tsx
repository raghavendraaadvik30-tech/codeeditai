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
    <div className="flex h-full flex-col bg-white dark:bg-[#0c1929] overflow-y-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-2xl dark:bg-slate-100 dark:text-slate-900 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
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
      <div className="flex shrink-0 items-center border-b border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-[#0c1929]">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "profile"
              ? "border-[#0078d4] text-[#0078d4]"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
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
              ? "border-[#0078d4] text-[#0078d4]"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
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
              ? "border-[#0078d4] text-[#0078d4]"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
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
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111D29]">
            {/* Top-Right Status Badge */}
            <div className="flex justify-end">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
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
                className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-[#1e3a5f] text-white shadow-md cursor-pointer overflow-hidden border-2 border-slate-200 dark:border-slate-700 transition-transform hover:scale-105"
              >
                {settings.avatarUrl ? (
                  <img
                    src={settings.avatarUrl}
                    alt={userFullName}
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center font-bold text-xl text-white">
                    {displayInitials}
                  </div>
                )}

                {/* Hover overlay indicator */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  {settings.avatarUrl ? (
                    <Eye className="h-5 w-5 text-white" />
                  ) : (
                    <Camera className="h-5 w-5 text-white" />
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
                      className="font-semibold text-[#0078d4] hover:underline flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>View Photo</span>
                    </button>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="font-semibold text-slate-600 hover:underline dark:text-slate-400 flex items-center gap-1"
                    >
                      <Camera className="h-3 w-3" />
                      <span>Change</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="font-semibold text-[#0078d4] hover:underline flex items-center gap-1"
                  >
                    <Camera className="h-3 w-3" />
                    <span>Upload Photo</span>
                  </button>
                )}
              </div>

              <h2 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                {userFullName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {userDesignation}
              </p>
            </div>

            <div className="my-4 border-t border-slate-100 dark:border-slate-800" />

            {/* Two-Column Info List */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Employee ID</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {employeeId}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Email</span>
                <span
                  className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px]"
                  title={userEmail}
                >
                  {userEmail}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Department</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {userDepartment}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Role</span>
                <span className="inline-flex items-center rounded-full bg-[#e0f2fe] px-2.5 py-0.5 text-[11px] font-semibold text-[#0078d4] dark:bg-blue-950/80 dark:text-blue-300">
                  {userRole}
                </span>
              </div>
            </div>

            <div className="my-4 border-t border-slate-100 dark:border-slate-800" />

            {/* Bottom Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditInfoOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-[#0078d4] hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-400 dark:hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Edit Info</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                aria-label="Logout"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50/60 text-red-600 hover:bg-red-100 hover:border-red-300 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/60 transition-colors shrink-0"
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
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111D29] space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  User Preferences & Appearance
                </h3>
              </div>
            </div>

            {/* Appearance Theme */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
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
                      ? "border-[#0078d4] bg-blue-50/20"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <div className="relative h-12 w-full rounded-lg border border-slate-200 bg-white p-1 shadow-sm overflow-hidden flex">
                    <div className="w-2 bg-slate-100 rounded-l h-full shrink-0" />
                    <div className="flex-1 flex flex-col pl-1">
                      <div className="h-1.5 w-full bg-[#0078d4] rounded-t" />
                      <div className="flex-1 bg-white mt-0.5 rounded-b border border-slate-100" />
                    </div>
                    {settings.theme === "light" && (
                      <div className="absolute bottom-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#0078d4] text-white">
                        <Check className="h-2 w-2 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span
                    className={`flex items-center gap-1 text-[11px] font-semibold ${
                      settings.theme === "light"
                        ? "text-[#0078d4]"
                        : "text-slate-600 dark:text-slate-300"
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
                      ? "border-[#0078d4] bg-blue-50/20"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <div className="relative h-12 w-full rounded-lg border border-slate-800 bg-[#1e293b] p-1 shadow-sm overflow-hidden flex">
                    <div className="w-2 bg-[#0f172a] rounded-l h-full shrink-0" />
                    <div className="flex-1 flex flex-col pl-1">
                      <div className="h-1.5 w-full bg-[#0078d4] rounded-t" />
                      <div className="flex-1 bg-[#334155] mt-0.5 rounded-b" />
                    </div>
                    {settings.theme === "dark" && (
                      <div className="absolute bottom-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#0078d4] text-white">
                        <Check className="h-2 w-2 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span
                    className={`flex items-center gap-1 text-[11px] font-semibold ${
                      settings.theme === "dark"
                        ? "text-[#0078d4]"
                        : "text-slate-600 dark:text-slate-300"
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
                      ? "border-[#0078d4] bg-blue-50/20"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <div className="relative h-12 w-full rounded-lg border border-slate-300 bg-gradient-to-r from-slate-200 to-[#1e293b] p-1 shadow-sm overflow-hidden flex">
                    <div className="w-2 bg-slate-300 rounded-l h-full shrink-0" />
                    <div className="flex-1 flex flex-col pl-1">
                      <div className="h-1.5 w-full bg-[#0078d4] rounded-t" />
                      <div className="flex-1 bg-gradient-to-r from-white to-[#334155] mt-0.5 rounded-b" />
                    </div>
                    {settings.theme === "system" && (
                      <div className="absolute bottom-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#0078d4] text-white">
                        <Check className="h-2 w-2 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span
                    className={`flex items-center gap-1 text-[11px] font-semibold ${
                      settings.theme === "system"
                        ? "text-[#0078d4]"
                        : "text-slate-600 dark:text-slate-300"
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
              <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
                <div className="pr-4">
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Enable Auto Save
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">
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
                      ? "bg-[#0078d4]"
                      : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.autoSave ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 2. Enable Notifications */}
              <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
                <div className="pr-4">
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Enable Notifications
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">
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
                      ? "bg-[#0078d4]"
                      : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.enableNotifications
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 3. Track Changes by Default */}
              <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
                <div className="pr-4">
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Track Changes by Default
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">
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
                      ? "bg-[#0078d4]"
                      : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.trackChangesByDefault
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* 4. Enable AI Content Suggestions */}
              <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
                <div className="pr-4">
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Enable AI Content Suggestions
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">
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
                      ? "bg-[#0078d4]"
                      : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
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
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111D29]">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Lock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Account Password
                </h3>
              </div>

              <div className="pt-3.5 flex items-center justify-between gap-4">
                <div>
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Update Password
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Regularly changing your password improves regulatory audit scores.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm shrink-0"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Card 2: TWO-FACTOR AUTHENTICATION (2FA) */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#111D29] space-y-3.5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Key className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Two-Factor Authentication (2FA)
                </h3>
              </div>

              <div className="flex items-center justify-between">
                <div className="pr-4">
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Authenticator App Verification
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
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
                      ? "bg-[#10b981]"
                      : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.twoFactorEnabled
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Green Success Information Box */}
              {settings.twoFactorEnabled && (
                <div className="flex items-start gap-2.5 rounded-xl bg-[#ecfdf5] p-3.5 border border-[#a7f3d0] dark:bg-emerald-950/30 dark:border-emerald-800/50">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">
                      2FA Status: Enabled & Active
                    </span>
                    <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#0c1929]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Pencil className="h-4 w-4 text-[#0078d4]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditInfoOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                  className="group relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1e3a5f] text-white shadow-sm cursor-pointer overflow-hidden border border-slate-200 dark:border-slate-700"
                >
                  {settings.avatarUrl ? (
                    <img
                      src={settings.avatarUrl}
                      alt={settings.userName || "Profile"}
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <Camera className="h-5 w-5 text-white/80" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Camera className="h-4 w-4 text-white" />
                  </div>
                </div>

                <div className="text-xs">
                  <span className="block font-semibold text-slate-800 dark:text-slate-200">
                    Profile Photo
                  </span>
                  <div className="mt-0.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="text-[11px] font-semibold text-[#0078d4] hover:underline"
                    >
                      Upload New
                    </button>
                    {settings.avatarUrl && (
                      <>
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            updateSettings({ avatarUrl: "" });
                            showToast("Profile photo removed");
                          }}
                          className="text-[11px] font-semibold text-red-500 hover:underline"
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
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    First Name
                  </label>
                  <input
                    name="firstName"
                    defaultValue={userFirstName}
                    readOnly
                    tabIndex={-1}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs text-slate-500 outline-none cursor-not-allowed dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 select-none shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Last Name
                  </label>
                  <input
                    name="lastName"
                    defaultValue={userLastName}
                    readOnly
                    tabIndex={-1}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs text-slate-500 outline-none cursor-not-allowed dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 select-none shadow-sm"
                  />
                </div>
              </div>

              {/* Row 2: Employee ID & Role */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Employee ID
                  </label>
                  <input
                    name="employeeId"
                    defaultValue={employeeId}
                    required
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-[#0078d4] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Role
                  </label>
                  <input
                    name="role"
                    defaultValue={userRole}
                    required
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-[#0078d4] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 shadow-sm"
                  />
                </div>
              </div>

              {/* Row 3: Designation & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Designation
                  </label>
                  <input
                    name="designation"
                    defaultValue={userDesignation}
                    required
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-[#0078d4] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    name="department"
                    defaultValue={userDepartment}
                    required
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-[#0078d4] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 shadow-sm"
                  />
                </div>
              </div>

              {/* Row 4: Email (Non-editable) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  defaultValue={userEmail}
                  readOnly
                  tabIndex={-1}
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs text-slate-500 outline-none cursor-not-allowed dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 select-none shadow-sm"
                />
              </div>

              {/* Row 5: Phone Number & Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    name="phoneNumber"
                    defaultValue={settings.phoneNumber || "+1 (555) 382-9012"}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-[#0078d4] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    name="location"
                    defaultValue={settings.location || "Boston, MA, USA"}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-[#0078d4] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 shadow-sm"
                  />
                </div>
              </div>

              {/* Row 6: Time Zone & Language */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Time Zone
                  </label>
                  <input
                    name="timeZone"
                    defaultValue={settings.timeZone || "America/New_York (EST)"}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-[#0078d4] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Language
                  </label>
                  <input
                    name="language"
                    defaultValue={settings.language || "English (US)"}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-[#0078d4] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 shadow-sm"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-2 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditInfoOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0078d4] px-5 py-2 text-xs font-semibold text-white hover:bg-[#005a9e] transition-colors shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#0c1929] flex flex-col items-center text-center">
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-[#0078d4]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profile Photo</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsViewPhotoModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Enlarged Photo Container */}
            <div className="my-5 relative flex h-48 w-48 items-center justify-center rounded-full bg-[#1e3a5f] shadow-xl overflow-hidden border-4 border-slate-100 dark:border-slate-700">
              {settings.avatarUrl ? (
                <img
                  src={settings.avatarUrl}
                  alt={settings.userName || "Profile"}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-white">
                  <Camera className="h-12 w-12 text-white/80 mb-2" />
                  <span className="text-xs font-semibold text-white/90">No Photo Uploaded</span>
                </div>
              )}
            </div>

            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {settings.userName || `${settings.firstName} ${settings.lastName}`}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {settings.userDesignation || "Senior Clinical Document Lead"}
            </p>

            {/* Photo Action Buttons */}
            <div className="mt-5 w-full flex flex-col gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setIsViewPhotoModalOpen(false);
                    avatarInputRef.current?.click();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#0078d4] py-2 text-xs font-semibold text-white hover:bg-[#005a9e] transition-colors shadow-sm"
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
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 transition-colors shadow-sm"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsViewPhotoModalOpen(false)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#0c1929]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#0078d4]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Change Account Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-[#0078d4] dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 8 characters"
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-[#0078d4] dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-type new password"
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-[#0078d4] dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0078d4] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#005a9e] transition-colors"
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
