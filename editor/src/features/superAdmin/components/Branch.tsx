
import React, { useState, useEffect } from "react";
import { useSuperAdminStore } from "../superAdminStore";
import {
  Building2,
  Plus,
  Trash2,
  X,
  Building,
  Globe,
  MapPin,
  Briefcase,
  MapPinned,
} from "lucide-react";

const Branches: React.FC = () => {
  const {
    branches,
    addBranch,
    deleteBranch,
    fetchBranches,
    clients,
    addWorkspace,
    deleteWorkspace,
    subBranchesList,
    addWorkspaceSubBranch,
    deleteWorkspaceSubBranch,
  } = useSuperAdminStore();

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Modal states
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isSubBranchModalOpen, setIsSubBranchModalOpen] = useState(false);

  // Branch form
  const [country, setCountry] = useState("India");
  const [city, setCity] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [branchName, setBranchName] = useState("");
  const [branchError, setBranchError] = useState("");

  // Workspace form
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceCode, setWorkspaceCode] = useState("");
  const [workspaceBranch, setWorkspaceBranch] = useState(
    branches[0]?.name || ""
  );
  const [workspaceError, setWorkspaceError] = useState("");

  // Sub-branch form
  const [subBranchWsId, setSubBranchWsId] = useState(
    clients[0]?.id || ""
  );
  const [subBranchAddress, setSubBranchAddress] = useState("");
  const [subBranchCode, setSubBranchCode] = useState("");
  const [subBranchError, setSubBranchError] = useState("");

  useEffect(() => {
    if (!workspaceBranch && branches.length > 0) {
      setWorkspaceBranch(branches[0].name);
    }
  }, [branches, workspaceBranch]);

  useEffect(() => {
    if (!subBranchWsId && clients.length > 0) {
      setSubBranchWsId(clients[0].id);
    }
  }, [clients, subBranchWsId]);

  // Save branch
  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    setBranchError("");

    if (!city.trim() || !branchName.trim()) {
      setBranchError("City and Branch Name are required fields.");
      return;
    }

    const generatedCode =
      branchCode.trim() ||
      `BR-${Math.floor(100 + Math.random() * 900)}`;

    addBranch({
      name: branchName.trim(),
      code: generatedCode,
      country,
      city: stateRegion
        ? `${city.trim()} (${stateRegion.trim()})`
        : city.trim(),
      state: stateRegion.trim(),
      subBranches: 0,
    });

    setCity("");
    setStateRegion("");
    setBranchCode("");
    setBranchName("");
    setIsBranchModalOpen(false);
  };

  // Save workspace
  const handleSaveWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    setWorkspaceError("");

    if (!workspaceName.trim()) {
      setWorkspaceError("Workspace name is required.");
      return;
    }

    const generatedCode =
      workspaceCode.trim() ||
      `${workspaceName.trim().slice(0, 3).toUpperCase()}-${Math.floor(
        10 + Math.random() * 90
      )}`;

    addWorkspace({
      name: workspaceName.trim(),
      code: generatedCode,
      branchName: workspaceBranch || undefined,
    });

    setWorkspaceName("");
    setWorkspaceCode("");
    setIsWorkspaceModalOpen(false);
  };

  // Save sub-branch
  const handleSaveSubBranch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubBranchError("");

    if (!subBranchAddress.trim()) {
      setSubBranchError(
        "Sub-branch address or area name is required."
      );
      return;
    }

    const targetWs =
      clients.find((c) => c.id === subBranchWsId) || clients[0];

    if (!targetWs) {
      setSubBranchError("Please create a workspace first.");
      return;
    }

    const generatedCode =
      subBranchCode.trim() ||
      `${targetWs.code || "SB"}-${Math.floor(
        100 + Math.random() * 900
      )}`;

    addWorkspaceSubBranch({
      workspaceId: targetWs.id,
      workspaceName: targetWs.name,
      address: subBranchAddress.trim(),
      code: generatedCode,
      branchName: targetWs.branchName,
    });

    setSubBranchAddress("");
    setSubBranchCode("");
    setIsSubBranchModalOpen(false);
  };

  return (
    <div className="space-y-10 pb-12">
      {/* 1. BRANCHES */}
      <section className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-black text-blue-700">
                1
              </span>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Branches
              </h1>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Manage your organization's regional branches across cities
              and territories.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsBranchModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add New Branch
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {branches.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
                    <Building2 className="h-6 w-6" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-extrabold text-slate-900">
                        {b.name}
                      </h2>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase text-slate-600">
                        {b.code}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5 text-slate-400" />
                        {b.country}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {b.city}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteBranch(b.id)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                  title="Delete Branch"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {branches.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs font-semibold text-slate-400">
              No regional branches configured. Click "+ Add New Branch"
              to create one.
            </div>
          )}
        </div>
      </section>

      {/* 2. WORKSPACES */}
      <section className="space-y-5 border-t border-slate-200 pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-xs font-black text-indigo-700">
                2
              </span>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Workspaces
              </h2>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Create client company workspaces and assign workspace codes
              under branches.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsWorkspaceModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add New Workspace
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((ws) => {
            const subBranchesCount = subBranchesList.filter(
              (sb) => sb.workspaceId === ws.id
            ).length;

            return (
              <div
                key={ws.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        {ws.name}
                      </h3>
                      <span className="inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-black uppercase text-indigo-600">
                        {ws.code}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteWorkspace(ws.id)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    title="Delete Workspace"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600">
                  {ws.branchName && (
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-slate-400">Assigned Branch:</span>
                      <span className="text-right font-bold text-slate-800">
                        {ws.branchName}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-slate-400">Sub-Branches Added:</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-700">
                      {subBranchesCount}{" "}
                      {subBranchesCount === 1 ? "Location" : "Locations"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {clients.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs font-semibold text-slate-400">
              No workspaces created yet. Click "+ Add New Workspace"
              to create one.
            </div>
          )}
        </div>
      </section>

      {/* 3. WORKSPACE SUB-BRANCHES */}
      <section className="space-y-5 border-t border-slate-200 pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-xs font-black text-emerald-700">
                3
              </span>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Workspace Sub-Branches &amp; Addresses
              </h2>
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Select a workspace and add sub-branch address details and codes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsSubBranchModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Add Sub Branch
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subBranchesList.map((sb) => (
            <div
              key={sb.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-700">
                      Workspace: {sb.workspaceName}
                    </span>
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-black text-slate-600">
                      {sb.code}
                    </span>
                  </div>

                  <h4 className="mt-2 flex items-start gap-1.5 text-xs font-bold leading-snug text-slate-800">
                    <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{sb.address}</span>
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => deleteWorkspaceSubBranch(sb.id)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                  title="Delete Sub Branch"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {sb.branchName && (
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-[10px] font-semibold text-slate-400">
                  <span>Regional Branch:</span>
                  <span className="text-right font-bold text-slate-600">
                    {sb.branchName}
                  </span>
                </div>
              )}
            </div>
          ))}

          {subBranchesList.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-8 text-center text-xs font-semibold text-slate-400">
              No sub-branches added yet. Click "+ Add Sub Branch" to
              register an address.
            </div>
          )}
        </div>
      </section>

      {/* ADD BRANCH MODAL */}
      {isBranchModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setIsBranchModalOpen(false);
            }
          }}
        >
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Add Regional Branch
                  </h2>
                  <p className="text-xs font-medium text-slate-500">
                    Define country, city, and branch code.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBranchModalOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-4 p-6">
              {branchError && (
                <div className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600">
                  {branchError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-extrabold uppercase text-slate-700">
                    Country *
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Singapore">Singapore</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-extrabold uppercase text-slate-700">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru, Mumbai, Dubai"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-extrabold uppercase text-slate-700">
                    State / Region
                  </label>
                  <input
                    type="text"
                    value={stateRegion}
                    onChange={(e) => setStateRegion(e.target.value)}
                    placeholder="e.g. Karnataka, Maharashtra"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-extrabold uppercase text-slate-700">
                    Branch Code
                  </label>
                  <input
                    type="text"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    placeholder="e.g. BLR-01, MUM-01"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase text-slate-700">
                  Branch Name *
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g. Bengaluru Regional HQ"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-black text-white hover:bg-blue-700"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD WORKSPACE MODAL */}
      {isWorkspaceModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setIsWorkspaceModalOpen(false);
            }
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Add New Workspace
                  </h2>
                  <p className="text-xs font-medium text-slate-500">
                    Enter workspace name, code, and branch.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsWorkspaceModalOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorkspace} className="space-y-4 p-6">
              {workspaceError && (
                <div className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600">
                  {workspaceError}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase text-slate-700">
                  Workspace Name *
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Infosys, TCS, CodeOrigin"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase text-slate-700">
                  Workspace Code
                </label>
                <input
                  type="text"
                  value={workspaceCode}
                  onChange={(e) => setWorkspaceCode(e.target.value)}
                  placeholder="e.g. INF-01, TCS-01, CO-01"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                />
                <span className="mt-1 block text-[10px] font-medium text-slate-400">
                  Auto-generated if left blank.
                </span>
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase text-slate-700">
                  Assign to Regional Branch
                </label>
                <select
                  value={workspaceBranch}
                  onChange={(e) => setWorkspaceBranch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                  {branches.length === 0 && (
                    <option value="">No branches created yet</option>
                  )}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsWorkspaceModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-black text-white hover:bg-indigo-700"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SUB-BRANCH MODAL */}
      {isSubBranchModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setIsSubBranchModalOpen(false);
            }
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                  <MapPinned className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Add Sub-Branch / Location
                  </h2>
                  <p className="text-xs font-medium text-slate-500">
                    Select a workspace and configure its address and code.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSubBranchModalOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubBranch} className="space-y-4 p-6">
              {subBranchError && (
                <div className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600">
                  {subBranchError}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase text-slate-700">
                  Select Workspace *
                </label>
                <select
                  value={subBranchWsId}
                  onChange={(e) => setSubBranchWsId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                  {clients.length === 0 && (
                    <option value="">
                      No workspaces available (Create workspace first)
                    </option>
                  )}
                </select>
                <span className="mt-1 block text-[10px] font-medium text-slate-400">
                  The sub-branch will be linked to the selected workspace.
                </span>
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase text-slate-700">
                  Sub-Branch Address / Area *
                </label>
                <textarea
                  rows={3}
                  value={subBranchAddress}
                  onChange={(e) => setSubBranchAddress(e.target.value)}
                  placeholder="e.g. Electronic City Phase 1, Hosur Road, Bangalore - 560100"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase text-slate-700">
                  Workspace Code
                </label>
                <input
                  type="text"
                  value={subBranchCode}
                  onChange={(e) => setSubBranchCode(e.target.value)}
                  placeholder="e.g. APEX-HQ-01, EC-01, CAMPUS-A"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                />
                <span className="mt-1 block text-[10px] font-medium text-slate-400">
                  Auto-generated if left blank.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSubBranchModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-black text-white hover:bg-emerald-700"
                >
                  Save Sub Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
