import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSuperAdminStore } from "../superAdminStore";
import type { SuperAdminUser } from "../types";
import { Users, UserPlus, Mail, Phone, Building, ShieldCheck, MapPin } from "lucide-react";

export const AdminsPage: React.FC = () => {
  const { users, subBranchesList, clients, fetchUsers, fetchBranches } = useSuperAdminStore();
  
  useEffect(() => {
    fetchUsers();
    fetchBranches();
  }, [fetchUsers, fetchBranches]);

  const adminUsers = users.filter((u) => u.role === "ADMIN");

  const getWorkspaceDetails = (wsIdentifier?: string, admin?: SuperAdminUser) => {
    const clean = (wsIdentifier || admin?.clientWorkspace || admin?.workspaceCode || "").trim().toLowerCase();
    const sbByCode = subBranchesList.find((sb) => sb.code.toLowerCase() === clean || sb.id === clean);
    if (sbByCode) {
      return {
        name: admin?.workspaceName || sbByCode.workspaceName,
        code: admin?.workspaceCode || sbByCode.code,
        branchName: admin?.branchName || sbByCode.branchName || "Main Branch HQ",
        subBranch: admin?.subBranch || sbByCode.address || "Main Sub-Branch",
      };
    }
    const sbByName = subBranchesList.find((sb) => sb.workspaceName.toLowerCase() === clean);
    if (sbByName) {
      return {
        name: sbByName.workspaceName,
        code: admin?.workspaceCode || sbByName.code,
        branchName: admin?.branchName || sbByName.branchName || "Main Branch HQ",
        subBranch: admin?.subBranch || sbByName.address || "Main Sub-Branch",
      };
    }
    if (admin?.workspaceName || admin?.branchName || admin?.subBranch) {
      return {
        name: admin.workspaceName || wsIdentifier || "General Workspace",
        code: admin.workspaceCode || wsIdentifier || "GEN-01",
        branchName: admin.branchName || "Main Branch HQ",
        subBranch: admin.subBranch || "Main Sub-Branch",
      };
    }
    const clientByCode = clients.find((c) => c.code.toLowerCase() === clean);
    if (clientByCode) {
      return {
        name: clientByCode.name,
        code: clientByCode.code,
        branchName: admin?.branchName || clientByCode.branchName || "Main Branch HQ",
        subBranch: admin?.subBranch || "Main Sub-Branch",
      };
    }
    return {
      name: admin?.workspaceName || wsIdentifier || "General Workspace",
      code: admin?.workspaceCode || wsIdentifier || "GEN-01",
      branchName: admin?.branchName || "Downtown Business Bay HQ",
      subBranch: admin?.subBranch || "Floor 4, North Tech Park",
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Admin Directory</h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            List of registered client organization administrators and their assigned branch & workspace hierarchies.
          </p>
        </div>

        <Link
          to="/super-admin/admins/register"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition"
        >
          <UserPlus className="h-4 w-4" />
          Register Admin
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {adminUsers.map((admin) => {
          const wsDetails = getWorkspaceDetails(admin.clientWorkspace, admin);
          const managedUsers = users.filter(
            (u) =>
              u.role !== "ADMIN" &&
              (u.assignedAdminEmail?.toLowerCase() === admin.email.toLowerCase() ||
                u.assignedAdmin?.toLowerCase().includes(admin.name.toLowerCase()))
          );

          return (
            <div
              key={admin.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 font-black">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">{admin.name}</h3>
                      <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-black uppercase text-blue-600">
                        {admin.role} (Main Admin)
                      </span>
                    </div>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                    Super Admin HQ
                  </span>
                </div>

                <div className="mt-5 space-y-2 text-xs font-semibold text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{admin.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{admin.phone}</span>
                  </div>

                  {/* Branch & Sub-Branch */}
                  <div className="rounded-xl bg-slate-50 p-2.5 space-y-1 text-[11px] border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                      <Building className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span>{wsDetails.branchName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{wsDetails.subBranch}</span>
                    </div>
                  </div>

                  {/* Workspace & Code */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-bold text-[10px] uppercase">Workspace:</span>
                      <span className="font-bold text-slate-800">{wsDetails.name}</span>
                    </div>
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-mono font-black uppercase text-blue-700 border border-blue-100">
                      {wsDetails.code}
                    </span>
                  </div>

                  {/* Managed users under this admin */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1 font-medium">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      Users Mapped Under:
                    </span>
                    <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[10px]">
                      {managedUsers.length} Users
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
                <span className="font-bold text-slate-400">Status: {admin.status}</span>
                <span className="font-semibold text-slate-500">Added: {admin.createdDate}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
