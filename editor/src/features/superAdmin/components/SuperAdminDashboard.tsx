import React from "react";
import { Link } from "react-router-dom";
import { useSuperAdminStore } from "../superAdminStore";
import {
  Users,
  Building2,
  Briefcase,
  Activity,
  UserPlus,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";

const SuperAdminDashboard: React.FC = () => {
  const { users, branches, activityLogs, clients } = useSuperAdminStore();

  const authorCount = users.filter((u) => u.role === "AUTHOR").length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const activeClientsCount = clients.filter(
    (c) => c.status === "Active"
  ).length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-8 text-white shadow-xl">
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-blue-300" />
            Global Control Center
          </span>

          <h1 className="text-3xl font-black tracking-tight">
            Super Admin Dashboard
          </h1>

          <p className="max-w-2xl text-xs font-medium leading-relaxed text-blue-100">
            Manage organization branches, register admins, provision login
            access for Authors &amp; Reviewers across client workspaces, and
            monitor audit logs.
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Total Users
            </span>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {users.length}
            </span>

            <span className="flex items-center text-xs font-semibold text-emerald-600">
              <TrendingUp className="mr-0.5 h-3 w-3" />
              {users.length} Active
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500">
            <span>{adminCount} Admins</span>
            <span>•</span>
            <span>{authorCount} Authors</span>
          </div>
        </div>

        {/* Client Organizations */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Client Organizations
            </span>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {clients.length}
            </span>

            <span className="text-xs font-semibold text-emerald-600">
              {activeClientsCount} Active
            </span>
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500">
            1 Workspace Action Required
          </div>
        </div>

        {/* Global Branches */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Global Branches
            </span>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Building2 className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {branches.length}
            </span>

            <span className="text-xs font-semibold text-slate-400">
              HQ Locations
            </span>
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500">
            {branches.reduce(
              (total, branch) => total + (branch.subBranches ?? 0),
              0
            )}{" "}
            Sub-Branches
          </div>
        </div>

        {/* Audit Events */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Audit Events
            </span>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Activity className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {activityLogs.length}
            </span>

            <span className="text-xs font-semibold text-emerald-600">
              Logged
            </span>
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500">
            100% Tamper-Evident
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Link
          to="/super-admin/admins/register"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-500 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
              <UserPlus className="h-5 w-5" />
            </div>

            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
          </div>

          <h3 className="mt-4 text-sm font-extrabold text-slate-900">
            Register New Admin
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Create an administrator account assigned to a client workspace and
            branch.
          </p>
        </Link>

        <Link
          to="/super-admin/users"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-500 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
              <Users className="h-5 w-5" />
            </div>

            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
          </div>

          <h3 className="mt-4 text-sm font-extrabold text-slate-900">
            User Management
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Manage global access, roles, and status for Authors, Admins, and
            Reviewers.
          </p>
        </Link>

        <Link
          to="/super-admin/admins/branches"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-500 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
              <Building2 className="h-5 w-5" />
            </div>

            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
          </div>

          <h3 className="mt-4 text-sm font-extrabold text-slate-900">
            Branches Directory
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Configure regional HQ locations, cities, states, and internal
            sub-branches.
          </p>
        </Link>
      </div>

      {/* Recent Audit Logs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-extrabold text-slate-900">
              Recent Audit Logs
            </h3>
          </div>

          <Link
            to="/super-admin/activity"
            className="text-xs font-extrabold text-blue-600 hover:underline"
          >
            View All Activity &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-black uppercase text-slate-500">
                <th className="px-4 py-3">Performed By</th>
                <th className="px-4 py-3">Activity</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Date &amp; Time</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {activityLogs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-extrabold text-slate-900">
                    {log.performedBy}
                  </td>

                  <td className="px-4 py-3 font-bold uppercase text-blue-600">
                    {log.activity}
                  </td>

                  <td className="px-4 py-3 text-slate-600">
                    {log.affectedTarget}
                  </td>

                  <td className="px-4 py-3 text-slate-400">
                    {log.dateTime}
                  </td>
                </tr>
              ))}

              {activityLogs.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    No audit logs available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;