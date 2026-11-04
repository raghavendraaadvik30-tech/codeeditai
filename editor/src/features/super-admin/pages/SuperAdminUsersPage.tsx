import React, { useState, useEffect } from "react";
import { useSuperAdminStore } from "../superAdminStore";
import type { UserRole, SuperAdminUser } from "../types";
import {
  Plus,
  Search,
  MoreVertical,
  X,
  Building,
  Shield,
  Trash2,
  Lock,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react";

export const SuperAdminUsersPage: React.FC = () => {
  const {
    users,
    addUser,
    deleteUser,
    toggleUserStatus,
    fetchUsers,
    fetchBranches,
    clients,
    subBranchesList,
  } = useSuperAdminStore();

  useEffect(() => {
    fetchUsers();
    fetchBranches();
  }, [fetchUsers, fetchBranches]);

  // Resolve Workspace Name, Code, Branch, and Sub-Branch Details
  const getWorkspaceDetails = (wsIdentifier?: string, user?: SuperAdminUser) => {
    const clean = (wsIdentifier || user?.clientWorkspace || user?.workspaceCode || "").trim().toLowerCase();

    // 1. Check Sub-Branches by Code or ID
    const sbByCode = subBranchesList.find((sb) => sb.code.toLowerCase() === clean || sb.id === clean);
    if (sbByCode) {
      return {
        name: user?.workspaceName || sbByCode.workspaceName,
        code: user?.workspaceCode || sbByCode.code,
        branchName: user?.branchName || sbByCode.branchName || "Main Branch HQ",
        subBranch: user?.subBranch || sbByCode.address || "Main Sub-Branch",
      };
    }

    // 2. Check Sub-Branches by Name
    const sbByName = subBranchesList.find((sb) => sb.workspaceName.toLowerCase() === clean);
    if (sbByName) {
      return {
        name: sbByName.workspaceName,
        code: user?.workspaceCode || sbByName.code,
        branchName: user?.branchName || sbByName.branchName || "Main Branch HQ",
        subBranch: user?.subBranch || sbByName.address || "Main Sub-Branch",
      };
    }

    // 3. Direct user fields if available from backend
    if (user?.workspaceName || user?.branchName || user?.subBranch) {
      return {
        name: user.workspaceName || wsIdentifier || "General Workspace",
        code: user.workspaceCode || wsIdentifier || "GEN-01",
        branchName: user.branchName || "Main Branch HQ",
        subBranch: user.subBranch || "Main Sub-Branch",
      };
    }

    // 4. Fallback checks on clients
    const clientByCode = clients.find((c) => c.code.toLowerCase() === clean);
    if (clientByCode) {
      return {
        name: clientByCode.name,
        code: clientByCode.code,
        branchName: user?.branchName || clientByCode.branchName || "Main Branch HQ",
        subBranch: user?.subBranch || "Main Sub-Branch",
      };
    }

    return {
      name: user?.workspaceName || wsIdentifier || "General Workspace",
      code: user?.workspaceCode || wsIdentifier || "GEN-01",
      branchName: user?.branchName || "Downtown Business Bay HQ",
      subBranch: user?.subBranch || "Floor 4, North Tech Park",
    };
  };

  // Filters State
  const [activeTab, setActiveTab] = useState<"all" | "AUTHOR" | "ADMIN" | "suspended">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [workspaceFilter, setWorkspaceFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Form State for Add User
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [clientWorkspace, setClientWorkspace] = useState(
    subBranchesList[0]?.code || clients[0]?.code || "APEX-HQ-01"
  );
  const [assignedAdmin, setAssignedAdmin] = useState("John Smith");
  const [role, setRole] = useState<UserRole>("AUTHOR");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  // Counts
  const authorCount = users.filter((u) => u.role === "AUTHOR").length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const suspendedCount = users.filter((u) => u.status === "Suspended").length;

  // Filtered list
  const filteredUsers = users.filter((u) => {
    // Role / Suspended tab
    if (activeTab === "AUTHOR" && u.role !== "AUTHOR") return false;
    if (activeTab === "ADMIN" && u.role !== "ADMIN") return false;
    if (activeTab === "suspended" && u.status !== "Suspended") return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const details = getWorkspaceDetails(u.clientWorkspace, u);
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchClient = u.clientWorkspace.toLowerCase().includes(q);
      const matchCode = details.code.toLowerCase().includes(q);
      const matchDetailsName = details.name.toLowerCase().includes(q);
      const matchBranch = details.branchName.toLowerCase().includes(q);
      const matchSubBranch = details.subBranch.toLowerCase().includes(q);
      const matchAdmin = (u.assignedAdmin || "").toLowerCase().includes(q);
      if (
        !matchName &&
        !matchEmail &&
        !matchClient &&
        !matchCode &&
        !matchDetailsName &&
        !matchBranch &&
        !matchSubBranch &&
        !matchAdmin
      )
        return false;
    }

    // Workspace filter
    if (workspaceFilter !== "All") {
      const details = getWorkspaceDetails(u.clientWorkspace, u);
      const filterClean = workspaceFilter.toLowerCase();
      if (
        u.clientWorkspace.toLowerCase() !== filterClean &&
        details.code.toLowerCase() !== filterClean &&
        details.name.toLowerCase() !== filterClean
      ) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== "All" && u.status !== statusFilter) return false;

    return true;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setFormError("Full name, email, and initial password are required.");
      return;
    }

    addUser({
      name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      password: password.trim(),
      clientWorkspace,
      assignedAdmin,
      role,
      status: "Active",
    });

    // Reset Form
    setFullName("");
    setPhone("");
    setEmail("");
    setPassword("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">User Management</h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Global directory of Authors &amp; Admins across all client organizations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* FILTER TABS & SEARCH BAR ROW */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${
              activeTab === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Roles ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("AUTHOR")}
            className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${
              activeTab === "AUTHOR"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Authors ({authorCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ADMIN")}
            className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${
              activeTab === "ADMIN"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Admins ({adminCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("suspended")}
            className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${
              activeTab === "suspended"
                ? "bg-rose-50 text-rose-600 border border-rose-200"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Suspended ({suspendedCount})
          </button>
        </div>

        {/* SEARCH & SELECT FILTERS */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user, email, client..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={workspaceFilter}
              onChange={(e) => setWorkspaceFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="All">Workspace: All</option>
              {subBranchesList.map((sb) => (
                <option key={sb.id} value={sb.code}>
                  {sb.code} ({sb.workspaceName})
                </option>
              ))}
              {clients.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="All">Status: All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">USER NAME</th>
                <th className="px-6 py-4">EMAIL</th>
                <th className="px-6 py-4">BRANCH & SUB-BRANCH</th>
                <th className="px-6 py-4">WORKSPACE NAME</th>
                <th className="px-6 py-4">WORKSPACE CODE</th>
                <th className="px-6 py-4">MAIN ADMIN</th>
                <th className="px-6 py-4">ROLE</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4">CREATED DATE</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredUsers.map((u) => {
                const wsDetails = getWorkspaceDetails(u.clientWorkspace, u);
                return (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* USER NAME & PHONE */}
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-slate-900">{u.name}</div>
                    <div className="text-[11px] text-slate-400 font-semibold">{u.phone}</div>
                  </td>

                  {/* EMAIL */}
                  <td className="px-6 py-4 font-semibold text-slate-600">{u.email}</td>

                  {/* BRANCH & SUB-BRANCH */}
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span>{wsDetails.branchName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1" title={wsDetails.subBranch}>
                      {wsDetails.subBranch}
                    </div>
                  </td>

                  {/* CLIENT WORKSPACE */}
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-slate-800">{wsDetails.name}</div>
                    {u.workspaceStatus && (
                      <div className="text-[10px] font-bold text-rose-500">{u.workspaceStatus}</div>
                    )}
                  </td>

                  {/* WORKSPACE CODE */}
                  <td className="px-6 py-4">
                    <span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-black uppercase text-blue-700 border border-blue-100 font-mono">
                      {wsDetails.code}
                    </span>
                  </td>

                  {/* MAIN ADMIN */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                      {u.role === "ADMIN" ? (
                        <span className="text-blue-700 font-bold">Super Admin HQ</span>
                      ) : (
                        <span>{u.assignedAdmin || "Client Admin"}</span>
                      )}
                    </div>
                    {u.assignedAdminEmail && u.role !== "ADMIN" && (
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {u.assignedAdminEmail}
                      </div>
                    )}
                  </td>

                  {/* ROLE BADGE */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                        u.role === "AUTHOR"
                          ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                          : u.role === "ADMIN"
                          ? "bg-blue-50 text-blue-600 border border-blue-100"
                          : u.role === "REVIEWER"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-purple-50 text-purple-600 border border-purple-100"
                      }`}
                    >
                      • {u.role}
                    </span>
                  </td>

                  {/* STATUS BADGE */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                        u.status === "Active"
                          ? "bg-emerald-50 text-emerald-600"
                          : u.status === "Inactive"
                          ? "bg-slate-100 text-slate-500"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          u.status === "Active"
                            ? "bg-emerald-500"
                            : u.status === "Inactive"
                            ? "bg-slate-400"
                            : "bg-rose-500"
                        }`}
                      />
                      {u.status}
                    </span>
                  </td>

                  {/* LAST LOGIN */}
                  <td className="px-6 py-4 font-semibold text-slate-500">{u.lastLogin}</td>

                  {/* CREATED DATE */}
                  <td className="px-6 py-4 font-semibold text-slate-500">{u.createdDate}</td>

                  {/* ACTIONS MENU */}
                  <td className="px-6 py-4 text-right relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenActionMenuId(openActionMenuId === u.id ? null : u.id)
                      }
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {openActionMenuId === u.id && (
                      <div className="absolute right-6 top-10 z-30 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl text-left">
                        <button
                          type="button"
                          onClick={() => {
                            toggleUserStatus(u.id);
                            setOpenActionMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Lock className="h-3.5 w-3.5 text-slate-400" />
                          {u.status === "Active" ? "Suspend User" : "Activate User"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteUser(u.id);
                            setOpenActionMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete User
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-xs font-semibold text-slate-400">
                    No users found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD USER MODAL */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Add New User Access</h2>
                  <p className="text-xs text-slate-500">Create access for Admin, Author, or Reviewer</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FORM BODY */}
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {formError && (
                <div className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600">
                  {formError}
                </div>
              )}

              {/* FULL NAME */}
              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-700 uppercase">
                  FULL NAME <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              {/* PHONE & EMAIL GRID */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-extrabold text-slate-700 uppercase">
                    EMAIL ADDRESS <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. s.jenkins@company.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-extrabold text-slate-700 uppercase">
                    CONTACT NUMBER
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* WORKSPACE & ASSIGNED ADMIN */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-extrabold text-slate-700 uppercase">
                    WORKSPACE
                  </label>
                  <input
                    type="text"
                    value={clientWorkspace}
                    onChange={(e) => setClientWorkspace(e.target.value)}
                    placeholder="e.g. Apex Global Publishing"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-extrabold text-slate-700 uppercase">
                    ASSIGNED ADMIN
                  </label>
                  <input
                    type="text"
                    value={assignedAdmin}
                    onChange={(e) => setAssignedAdmin(e.target.value)}
                    placeholder="John Smith"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ROLE SELECTION */}
              <div>
                <label className="mb-1.5 block text-xs font-extrabold text-slate-700 uppercase">
                  USER ROLE <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["ADMIN", "AUTHOR", "REVIEWER"] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`rounded-xl border py-2.5 text-center text-xs font-extrabold transition ${
                        role === r
                          ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* INITIAL PASSWORD */}
              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-700 uppercase">
                  INITIAL PASSWORD <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700"
                >
                  Create User Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
