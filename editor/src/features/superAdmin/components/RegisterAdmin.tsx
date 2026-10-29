import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSuperAdminStore } from "../superAdminStore";
import { UserPlus, CheckCircle2, Building } from "lucide-react";

const RegisterAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    addUser,
    logActivity,
    clients,
    subBranchesList,
    fetchBranches,
  } = useSuperAdminStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [clientWorkspace, setClientWorkspace] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createdCredentials, setCreatedCredentials] = useState<{
    workspace: string;
    email: string;
    password: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    const codeParam =
      searchParams.get("code") || searchParams.get("workspace");

    if (codeParam) {
      setClientWorkspace(codeParam);
    } else if (!clientWorkspace && subBranchesList.length > 0) {
      setClientWorkspace(subBranchesList[0].code);
    }
  }, [searchParams, subBranchesList, clientWorkspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (
      !fullName.trim() ||
      !email.trim() ||
      !clientWorkspace.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setErrorMsg(
        "Full name, email, workspace, password, and confirm password are required."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(
        "Passwords do not match. Please verify your initial password."
      );
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    try {
      setIsSubmitting(true);

      const matchedSb = subBranchesList.find(
        (sb) => sb.code === clientWorkspace.trim()
      );

      await addUser({
        name: fullName.trim(),
        phone: phone.trim() || "+1 (555) 000-0000",
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
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          "Failed to register admin in backend database. Please check details."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Register Admin
        </h1>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Provision a new Organization Administrator with access to manage
          authors, reviewers, and document workflows.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        {createdCredentials && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-xs text-emerald-900 shadow-sm">
            <div className="mb-2 flex items-center gap-2 text-sm font-black text-emerald-800">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Company Admin Registered Successfully in Backend Database!
            </div>

            <p className="mb-3 font-medium text-slate-600">
              Provide these login credentials to the client company
              administrator. The workspace name will be locked and constant
              for their account:
            </p>

            <div className="grid grid-cols-1 gap-2 rounded-xl border border-emerald-100 bg-white p-3 font-mono text-[11px] sm:grid-cols-2">
              <div>
                <span className="font-bold text-slate-400">Workspace: </span>
                <strong className="text-blue-700">
                  {createdCredentials.workspace}
                </strong>
              </div>
              <div>
                <span className="font-bold text-slate-400">Email: </span>
                <strong className="text-slate-900">
                  {createdCredentials.email}
                </strong>
              </div>
              <div>
                <span className="font-bold text-slate-400">Password: </span>
                <strong className="text-slate-900">
                  {createdCredentials.password}
                </strong>
              </div>
              <div>
                <span className="font-bold text-slate-400">Admin Name: </span>
                <strong className="text-slate-900">
                  {createdCredentials.name}
                </strong>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Workspace: ${createdCredentials.workspace}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`
                  );
                  alert("Credentials copied to clipboard!");
                }}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-[11px] font-black text-white shadow-sm transition hover:bg-emerald-700"
              >
                Copy Client Credentials
              </button>

              <button
                type="button"
                onClick={() => navigate("/super-admin/users")}
                className="rounded-lg bg-slate-100 px-4 py-2 text-[11px] font-bold text-slate-700 transition hover:bg-slate-200"
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
          <div>
            <h2 className="mb-4 text-xs font-black uppercase tracking-wider text-slate-400">
              1. Administrator Personal Details
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase text-slate-700">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase text-slate-700">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. e.rostova@company.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase text-slate-700">
                  Contact Number
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
                <label className="mb-1 block text-xs font-extrabold uppercase text-slate-700">
                  Initial Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold uppercase text-slate-700">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter initial password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h2 className="mb-4 text-xs font-black uppercase tracking-wider text-slate-400">
              2. Workspace Assignment
            </h2>

            <div>
              <label className="mb-1 block text-xs font-extrabold uppercase text-slate-700">
                Workspace Code <span className="text-rose-500">*</span>
              </label>

              <select
                required
                value={clientWorkspace}
                onChange={(e) => setClientWorkspace(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="">Select workspace code</option>

                {subBranchesList.map((sb) => (
                  <option key={sb.id} value={sb.code}>
                    {sb.code} — {sb.workspaceName} (
                    {sb.branchName || "Main Branch"} ·{" "}
                    {sb.address || "Sub-Branch"})
                  </option>
                ))}

                {subBranchesList.length === 0 &&
                  clients.map((c) => (
                    <option key={c.id} value={c.code || c.name}>
                      {c.code || c.name} ({c.name})
                    </option>
                  ))}
              </select>

              <span className="mt-1 block text-[10px] font-medium text-slate-400">
                Workspace code generated from Sub-Branches tying Branch,
                Workspace, and Sub-Branch location together.
              </span>

              {(() => {
                const matchedSb = subBranchesList.find(
                  (sb) =>
                    sb.code.toLowerCase() ===
                    clientWorkspace.trim().toLowerCase()
                );

                if (!matchedSb) return null;

                return (
                  <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs">
                    <div className="mb-2 flex items-center gap-2 font-extrabold text-blue-900">
                      <Building className="h-4 w-4 text-blue-600" />
                      Workspace & Organization Mapping Details
                    </div>

                    <div className="grid grid-cols-1 gap-3 rounded-xl border border-blue-100/80 bg-white p-3.5 text-[11px] font-medium text-slate-700 sm:grid-cols-2">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400">
                          BRANCH:
                        </span>
                        <strong className="text-slate-900">
                          {matchedSb.branchName || "Main Branch HQ"}
                        </strong>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold text-slate-400">
                          WORKSPACE NAME:
                        </span>
                        <strong className="font-bold text-blue-950">
                          {matchedSb.workspaceName}
                        </strong>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold text-slate-400">
                          SUB-BRANCH LOCATION:
                        </span>
                        <strong className="text-slate-900">
                          {matchedSb.address}
                        </strong>
                      </div>

                      <div>
                        <span className="block text-[10px] font-bold text-slate-400">
                          WORKSPACE CODE:
                        </span>
                        <strong className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-blue-700">
                          {matchedSb.code}
                        </strong>
                      </div>
                    </div>

                    <p className="mt-2.5 text-[11px] font-semibold text-blue-800">
                      🛡️ Note: All authors, reviewers, or sub-admins created
                      by this Admin will automatically inherit this Branch,
                      Workspace, and Sub-Branch, mapped directly under this
                      Admin.
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-xs font-black text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              {isSubmitting
                ? "Registering in Database..."
                : "Register Admin Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterAdmin;