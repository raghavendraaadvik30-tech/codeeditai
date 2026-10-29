
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSuperAdminStore } from "../superAdminStore";
import type { SuperAdminUser } from "../types";
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Building,
  ShieldCheck,
  MapPin,
} from "lucide-react";

const Admins: React.FC = () => {
  const {
    users,
    subBranchesList,
    clients,
    fetchUsers,
    fetchBranches,
  } = useSuperAdminStore();

  useEffect(() => {
    fetchUsers();
    fetchBranches();
  }, [fetchUsers, fetchBranches]);

  const adminUsers = users.filter((user) => user.role === "ADMIN");

  const getWorkspaceDetails = (
    wsIdentifier?: string,
    admin?: SuperAdminUser
  ) => {
    const clean = (
      wsIdentifier ||
      admin?.clientWorkspace ||
      admin?.workspaceCode ||
      ""
    )
      .trim()
      .toLowerCase();

    const sbByCode = subBranchesList.find(
      (sb) => sb.code.toLowerCase() === clean || sb.id === clean
    );

    if (sbByCode) {
      return {
        name: admin?.workspaceName || sbByCode.workspaceName,
        code: admin?.workspaceCode || sbByCode.code,
        branchName:
          admin?.branchName || sbByCode.branchName || "Main Branch HQ",
        subBranch:
          admin?.subBranch || sbByCode.address || "Main Sub-Branch",
      };
    }

    const sbByName = subBranchesList.find(
      (sb) => sb.workspaceName.toLowerCase() === clean
    );

    if (sbByName) {
      return {
        name: sbByName.workspaceName,
        code: admin?.workspaceCode || sbByName.code,
        branchName:
          admin?.branchName || sbByName.branchName || "Main Branch HQ",
        subBranch:
          admin?.subBranch || sbByName.address || "Main Sub-Branch",
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

    const clientByCode = clients.find(
      (client) => client.code.toLowerCase() === clean
    );

    if (clientByCode) {
      return {
        name: clientByCode.name,
        code: clientByCode.code,
        branchName:
          admin?.branchName || clientByCode.branchName || "Main Branch HQ",
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
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Admin Directory
          </h1>

          <p className="mt-1 text-xs font-medium text-slate-500">
            List of registered client organization administrators and their
            assigned branch and workspace hierarchies.
          </p>
        </div>

        <Link
          to="/super-admin/admins/register"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" />
          Register Admin
        </Link>
      </div>

      {/* Admin cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {adminUsers.map((admin) => {
          const wsDetails = getWorkspaceDetails(
            admin.clientWorkspace,
            admin
          );

          const managedUsers = users.filter(
            (user) =>
              user.role !== "ADMIN" &&
              (user.assignedAdminEmail?.toLowerCase() ===
                admin.email.toLowerCase() ||
                user.assignedAdmin
                  ?.toLowerCase()
                  .includes(admin.name.toLowerCase()))
          );

          return (
            <div
              key={admin.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div>
                {/* Admin identity */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 font-black text-blue-600">
                      <ShieldCheck className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-base font-extrabold text-slate-900">
                        {admin.name}
                      </h3>

                      <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-black uppercase text-blue-600">
                        {admin.role} (Main Admin)
                      </span>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                    Super Admin HQ
                  </span>
                </div>

                {/* Contact and organization details */}
                <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{admin.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>{admin.phone}</span>
                  </div>

                  {/* Branch and sub-branch */}
                  <div className="space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800">
                      <Building className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                      <span>{wsDetails.branchName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-medium text-slate-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="line-clamp-1">
                        {wsDetails.subBranch}
                      </span>
                    </div>
                  </div>

                  {/* Workspace and code */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        Workspace:
                      </span>

                      <span className="font-bold text-slate-800">
                        {wsDetails.name}
                      </span>
                    </div>

                    <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-black uppercase text-blue-700">
                      {wsDetails.code}
                    </span>
                  </div>

                  {/* Managed users */}
                  <div className="flex items-center justify-between gap-2 border-t border-slate-100/80 pt-2 text-[11px]">
                    <span className="flex items-center gap-1 font-medium text-slate-500">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      Users Mapped Under:
                    </span>

                    <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-600">
                      {managedUsers.length} Users
                    </span>
                  </div>
                </div>
              </div>

              {/* Admin status */}
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px]">
                <span className="font-bold text-slate-400">
                  Status: {admin.status}
                </span>

                <span className="font-semibold text-slate-500">
                  Added: {admin.createdDate}
                </span>
              </div>
            </div>
          );
        })}

        {adminUsers.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <Users className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <h3 className="text-sm font-bold text-slate-700">
              No administrators found
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Registered administrators will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admins;
