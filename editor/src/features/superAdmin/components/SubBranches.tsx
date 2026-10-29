import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSuperAdminStore } from "../superAdminStore";
import {
  MapPinned,
  Plus,
  Trash2,
  Building2,
  Search,
  CheckCircle2,
  Briefcase,
  X,
  Sparkles,
  Copy,
  Check,
  UserPlus,
  ArrowRight,
} from "lucide-react";

const SubBranches: React.FC = () => {
  const {
    branches,
    clients,
    subBranchesList,
    addWorkspaceSubBranch,
    deleteWorkspaceSubBranch,
    fetchBranches,
  } = useSuperAdminStore();

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
  const [subBranchAddress, setSubBranchAddress] = useState("");
  const [workspaceCode, setWorkspaceCode] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [workspaceFilter, setWorkspaceFilter] = useState("ALL");
  const [branchFilter, setBranchFilter] = useState("ALL");

  // Default selections
  useEffect(() => {
    if (!selectedBranchId && branches.length > 0) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches, selectedBranchId]);

  useEffect(() => {
    if (!selectedWorkspaceId && clients.length > 0) {
      setSelectedWorkspaceId(clients[0].id);
    }
  }, [clients, selectedWorkspaceId]);

  // Generate workspace code
  const generateCode = (branchIdVal?: string, wsIdVal?: string) => {
    const bId = branchIdVal || selectedBranchId;
    const wId = wsIdVal || selectedWorkspaceId;

    const branch = branches.find((b) => b.id === bId) || branches[0];
    const workspace = clients.find((c) => c.id === wId) || clients[0];

    const branchPart = (
      branch?.code ||
      branch?.name?.slice(0, 3) ||
      "HQ"
    )
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase();

    const workspacePart = (
      workspace?.code ||
      workspace?.name?.slice(0, 3) ||
      "WS"
    )
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase();

    const randomSuffix = Math.floor(10 + Math.random() * 90);

    return `${branchPart}-${workspacePart}-${randomSuffix}`;
  };

  const handleBranchChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newBranchId = e.target.value;
    setSelectedBranchId(newBranchId);
    setWorkspaceCode(generateCode(newBranchId, selectedWorkspaceId));
  };

  const handleWorkspaceChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newWorkspaceId = e.target.value;
    setSelectedWorkspaceId(newWorkspaceId);
    setWorkspaceCode(generateCode(selectedBranchId, newWorkspaceId));
  };

  const handleRegenerateCode = () => {
    setWorkspaceCode(generateCode());
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      setFormError("Unable to copy code. Please copy it manually.");
    }
  };

  const handleSaveSubBranch = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!subBranchAddress.trim()) {
      setFormError("Sub-branch address or location details are required.");
      return;
    }

    const targetBranch = branches.find(
      (b) => b.id === selectedBranchId
    );

    if (!targetBranch) {
      setFormError(
        "Please select a branch. Add a branch first if none exist."
      );
      return;
    }

    const targetWorkspace = clients.find(
      (c) => c.id === selectedWorkspaceId
    );

    if (!targetWorkspace) {
      setFormError(
        "Please select a workspace. Add a workspace first if none exist."
      );
      return;
    }

    const finalCode = workspaceCode.trim() || generateCode();

    try {
      await addWorkspaceSubBranch({
        branchId: targetBranch.id,
        branchName: targetBranch.name,
        workspaceId: targetWorkspace.id,
        workspaceName: targetWorkspace.name,
        address: subBranchAddress.trim(),
        code: finalCode,
      });

      setSuccessMessage(
        `Sub-branch created! Workspace code "${finalCode}" is ready to be given to an Organization Admin.`
      );

      setSubBranchAddress("");
      setWorkspaceCode("");
      setIsFormOpen(false);
    } catch (error: unknown) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to create sub-branch. Please try again."
      );
    }
  };

  // Search and filter
  const filteredSubBranches = subBranchesList.filter((sb) => {
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      sb.address.toLowerCase().includes(query) ||
      sb.code.toLowerCase().includes(query) ||
      sb.workspaceName.toLowerCase().includes(query) ||
      (sb.branchName?.toLowerCase().includes(query) ?? false);

    const matchesWorkspace =
      workspaceFilter === "ALL" ||
      sb.workspaceId === workspaceFilter ||
      sb.workspaceName.toLowerCase() === workspaceFilter.toLowerCase();

    const matchesBranch =
      branchFilter === "ALL" ||
      sb.branchName?.toLowerCase() === branchFilter.toLowerCase() ||
      sb.branchId === branchFilter;

    return matchesSearch && matchesWorkspace && matchesBranch;
  });

  const selectedBranch = branches.find(
    (b) => b.id === selectedBranchId
  );

  const selectedWorkspace = clients.find(
    (c) => c.id === selectedWorkspaceId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Sub-Branches &amp; Workspace Codes
          </h1>

          <p className="mt-1 text-xs font-medium text-slate-500">
            Select a branch and workspace, enter sub-branch details, and
            generate the unique Workspace Code to give to the Admin.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isFormOpen) {
              setFormError("");
              setWorkspaceCode(generateCode());
            }
            setIsFormOpen(!isFormOpen);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          {isFormOpen ? "Close Entry Form" : "Add Sub Branch & Generate Code"}
        </button>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Create sub-branch form */}
      {isFormOpen && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                <MapPinned className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  Step 3: Pair Branch &amp; Workspace
                </h2>
                <p className="text-xs font-medium text-slate-500">
                  Select your branch and workspace, enter the location, and
                  generate the code for the Admin.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSaveSubBranch} className="space-y-5">
            {formError && (
              <div className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase text-slate-700">
                  1. Select Branch *
                </label>

                <select
                  required
                  value={selectedBranchId}
                  onChange={handleBranchChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                >
                  <option value="">Select branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} ({branch.city || branch.country}) [
                      {branch.code}]
                    </option>
                  ))}
                </select>

                <span className="mt-1 block text-[10px] font-medium text-slate-400">
                  The primary regional branch office.
                </span>
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase text-slate-700">
                  2. Select Workspace *
                </label>

                <select
                  required
                  value={selectedWorkspaceId}
                  onChange={handleWorkspaceChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                >
                  <option value="">Select workspace</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.code})
                    </option>
                  ))}
                </select>

                <span className="mt-1 block text-[10px] font-medium text-slate-400">
                  The client organization workspace.
                </span>
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase text-slate-700">
                  3. Sub-Branch Location *
                </label>

                <input
                  type="text"
                  required
                  value={subBranchAddress}
                  onChange={(e) => setSubBranchAddress(e.target.value)}
                  placeholder="Building B, Level 3, Bangalore"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                />

                <span className="mt-1 block text-[10px] font-medium text-slate-400">
                  Physical office, address, or team division.
                </span>
              </div>
            </div>

            {/* Workspace code generation */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-emerald-900">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    Workspace Code for Admin
                  </div>

                  <p className="mt-0.5 text-[11px] font-medium text-emerald-700">
                    Uniquely links the Branch, Workspace, and Sub-Branch.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={workspaceCode}
                    onChange={(e) => setWorkspaceCode(e.target.value)}
                    placeholder="APEX-HQ-01"
                    aria-label="Workspace code"
                    className="w-48 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-black uppercase text-emerald-900 shadow-sm outline-none focus:border-emerald-500"
                  />

                  <button
                    type="button"
                    onClick={handleRegenerateCode}
                    className="rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-extrabold text-emerald-700 transition hover:bg-emerald-50"
                  >
                    Generate New
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-emerald-200/70 pt-3 text-xs font-bold text-slate-700">
                <div>
                  <span className="block text-[10px] font-semibold uppercase text-slate-400">
                    Branch
                  </span>
                  <span>{selectedBranch?.name || "Selected Branch"}</span>
                </div>

                <div>
                  <span className="block text-[10px] font-semibold uppercase text-slate-400">
                    Workspace
                  </span>
                  <span>{selectedWorkspace?.name || "Selected Workspace"}</span>
                </div>

                <div>
                  <span className="block text-[10px] font-semibold uppercase text-slate-400">
                    Generated Code
                  </span>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-black text-emerald-800">
                    {workspaceCode || "PENDING"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-6 py-2 text-xs font-black text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-700"
              >
                Save Sub-Branch &amp; Lock Workspace Code
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, address, branch..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={workspaceFilter}
            onChange={(e) => setWorkspaceFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Workspaces</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Branches</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing:{" "}
          <strong className="text-slate-900">
            {filteredSubBranches.length}
          </strong>{" "}
          Configured Codes
        </div>
      </div>

      {/* Sub-branches table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[950px] text-left text-xs">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-black uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-6 py-4">Workspace Code</th>
              <th className="px-6 py-4">Workspace Name</th>
              <th className="px-6 py-4">Branch Name</th>
              <th className="px-6 py-4">Sub-Branch Location</th>
              <th className="px-6 py-4 text-center">Admin Registration</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredSubBranches.map((sb) => (
              <tr
                key={sb.id}
                className="transition hover:bg-slate-50/60"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-block rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black uppercase text-emerald-800 shadow-sm">
                      {sb.code}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(sb.code)}
                      className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      title="Copy Workspace Code"
                      aria-label={`Copy ${sb.code}`}
                    >
                      {copiedCode === sb.code ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-100 bg-indigo-50 font-bold text-indigo-700">
                      <Briefcase className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {sb.workspaceName}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>{sb.branchName || "General Hub"}</span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex max-w-xs items-start gap-1.5 font-bold text-slate-800">
                    <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{sb.address}</span>
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <Link
                    to={`/super-admin/register-admin?workspace=${encodeURIComponent(
                      sb.code
                    )}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-black text-blue-700 transition hover:bg-blue-100"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-blue-600" />
                    Register Admin
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete sub-branch "${sb.address}" and workspace code "${sb.code}"?`
                        )
                      ) {
                        deleteWorkspaceSubBranch(sb.id);
                      }
                    }}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    title="Delete Sub Branch"
                    aria-label={`Delete sub-branch ${sb.address}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}

            {filteredSubBranches.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center font-semibold text-slate-400"
                >
                  No sub-branch workspace codes found. Add a sub-branch or
                  adjust your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubBranches;