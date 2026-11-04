import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSuperAdminStore } from "../superAdminStore";
import { UserPlus, CheckCircle2, Building } from "lucide-react";

export const RegisterAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addUser, logActivity, clients, subBranchesList, fetchBranches } = useSuperAdminStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [clientWorkspace, setClientWorkspace] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [createdCredentials, setCreatedCredentials] = useState<{
    workspace: string;
    email: string;
    password: string;
    name: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    const codeParam = searchParams.get("code") || searchParams.get("workspace");
    if (codeParam) {
      setClientWorkspace(codeParam);
    } else if (!clientWorkspace && subBranchesList.length > 0) {
      setClientWorkspace(subBranchesList[0].code);
    }
  }, [searchParams, subBranchesList, clientWorkspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName.trim() || !email.trim() || !clientWorkspace.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMsg("Full name, email, workspace, password, and confirm password are required.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify your initial password.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    try {
      setIsSubmitting(true);
      const matchedSb = subBranchesList.find((sb) => sb.code === clientWorkspace.trim());
      await addUser({
        name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        clientWorkspace: clientWorkspace.trim(),
        assignedAdmin: "Super Admin",
        role: "ADMIN",
        status: "Active",
        password: password.trim(),
        branchName: matchedSb?.branchName,
        subBranch: matchedSb?.address,
      });

      logActivity({
        performedBy: "Super Admin",
        performedByRole: "Super Admin",
        activity: "ADMIN_REGISTERED",
        activityDescription: `Super Admin registered new Admin ${fullName} for ${clientWorkspace.trim()}`,
        affectedUser: fullName,
        affectedTarget: `Admin (${clientWorkspace.trim()})`,
        dateTime: new Date().toLocaleString(),
        status: "Successful",
        category: "Admin Activity",
      });

      setCreatedCredentials({
        workspace: clientWorkspace.trim(),
        email: email.trim(),
        password: password.trim(),
        name: fullName.trim(),
      });
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error?.message || "Failed to register admin. Please check details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Register Admin</h1>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Provision a new Organization Administrator with access to manage authors, reviewers, and document workflows.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        {createdCredentials && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-xs text-emerald-900 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2 font-black text-emerald-800 text-sm mb-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Company Admin Registered Successfully!
            </div>
            <p className="text-slate-600 mb-3 font-medium">
              Provide these login credentials to the client company administrator. The workspace name will be locked and constant for their account:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white rounded-xl p-3 border border-emerald-100 font-mono text-[11px]">
              <div><span className="text-slate-400 font-sans font-bold">Workspace:</span> <strong className="text-blue-700">{createdCredentials.workspace}</strong></div>
              <div><span className="text-slate-400 font-sans font-bold">Email:</span> <strong className="text-slate-900">{createdCredentials.email}</strong></div>
              <div><span className="text-slate-400 font-sans font-bold">Password:</span> <strong className="text-slate-900">{createdCredentials.password}</strong></div>
              <div><span className="text-slate-400 font-sans font-bold">Admin Name:</span> <strong className="text-slate-900">{createdCredentials.name}</strong></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`Workspace: ${createdCredentials.workspace}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`);
                  alert("Credentials copied to clipboard!");
                }}
                className="rounded-lg bg-emerald-600 text-white px-4 py-2 font-black text-[11px] shadow-sm hover:bg-emerald-700 transition"
              >
                Copy Client Credentials
              </button>
              <button
                type="button"
                onClick={() => navigate("/super-admin/users")}
                className="rounded-lg bg-slate-100 text-slate-700 px-4 py-2 font-bold text-[11px] hover:bg-slate-200 transition"
              >
                Go to User Directory
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-600">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PERSONAL INFO SECTION */}
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
              1. Administrator Personal Details
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-700 uppercase">
                  FULL NAME <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-700 uppercase">
                  EMAIL ADDRESS <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. e.rostova@company.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
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
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-700 uppercase">
                  INITIAL PASSWORD <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-700 uppercase">
                  CONFIRM PASSWORD <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter initial password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* WORKSPACE ASSIGNMENT SECTION */}
          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
              2. Workspace Assignment
            </h2>
            <div>
              <label className="mb-1 block text-xs font-extrabold text-slate-700 uppercase">
                WORKSPACE CODE <span className="text-rose-500">*</span>
              </label>
              <select
                value={clientWorkspace}
                onChange={(e) => setClientWorkspace(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="">Select workspace code</option>
                {subBranchesList.map((sb) => (
                  <option key={sb.id} value={sb.code}>
                    {sb.code} — {sb.workspaceName} ({sb.branchName || "Main Branch"} · {sb.address || "Sub-Branch"})
                  </option>
                ))}
                {subBranchesList.length === 0 &&
                  clients.map((c) => (
                    <option key={c.id} value={c.code || c.name}>
                      {c.code || c.name} ({c.name})
                    </option>
                  ))}
              </select>
              <span className="mt-1 block text-[10px] text-slate-400 font-medium">
                Workspace code generated from Sub-Branches tying Branch, Workspace, and Sub-Branch location together.
              </span>

              {/* Hierarchy Preview Card */}
              {(() => {
                const matchedSb = subBranchesList.find(
                  (sb) => sb.code.toLowerCase() === clientWorkspace.trim().toLowerCase()
                );
                if (!matchedSb) return null;
                return (
                  <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs">
                    <div className="font-extrabold text-blue-900 mb-2 flex items-center gap-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      Workspace & Organization Mapping Details
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-700 font-medium bg-white p-3.5 rounded-xl border border-blue-100/80">
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px]">BRANCH:</span>
                        <strong className="text-slate-900">{matchedSb.branchName || "Main Branch HQ"}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px]">WORKSPACE NAME:</span>
                        <strong className="text-blue-950 font-bold">{matchedSb.workspaceName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px]">SUB-BRANCH LOCATION:</span>
                        <strong className="text-slate-900">{matchedSb.address}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block text-[10px]">WORKSPACE CODE:</span>
                        <strong className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {matchedSb.code}
                        </strong>
                      </div>
                    </div>
                    <p className="mt-2.5 text-[11px] font-semibold text-blue-800">
                      🛡️ Note: All authors, reviewers, or sub-admins created by this Admin will automatically inherit this Branch, Workspace, and Sub-Branch, mapped directly under this Admin.
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-xs font-black text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition"
            >
              <UserPlus className="h-4 w-4" />
              {isSubmitting ? "Registering..." : "Register Admin Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
