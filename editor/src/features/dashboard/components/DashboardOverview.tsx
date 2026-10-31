/*
Purpose:
DashboardOverview.tsx displays the main administrative dashboard overview matching Screenshot 2.
It reads user information from useUsersStore() and calculates user statistics dynamically.
*/
import { useUsersStore } from "@/shared/stores/usersStore";
import {
  Users,
  ShieldCheck,
  FileText,
  Pencil,
} from "lucide-react";


export default function DashboardOverview() {
  const { users } = useUsersStore();

  const totalUsers = users.length;

  const adminUsers = users.filter(
    (u) => u.role === "Admin"
  ).length;

  const authorUsers = users.filter(
    (u) => u.role === "Author"
  ).length;

  const adminPct = totalUsers > 0 ? Math.round((adminUsers / totalUsers) * 100) : 0;
  const authorPct = totalUsers > 0 ? Math.round((authorUsers / totalUsers) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Eyebrow and Page Heading */}
      <div>


        <h1 className="text-2xl md:text-3xl font-extrabold text-[#172033] dark:text-white  text-foreground tracking-tight">
          System Administration Overview
        </h1>


      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Total Registered Users */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#DCE7F2] bg-white p-6 shadow-xs hover:shadow-sm transition-shadow dark:border-[#294564] dark:bg-[#17263D]">
          <div>
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400">
                Total Registered Users
              </span>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#BAE6FD] bg-[#EBF7FD] text-[#0284C7] dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <h2 className="text-4xl font-extrabold text-[#172033] dark:text-white my-1">
              {totalUsers}
            </h2>
            <p className="text-11px text-[#64748B] dark:text-slate-400">
              All registered users in the system
            </p>
          </div>
        </div>

        {/* Card 2: Admin Accounts */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#DCE7F2] bg-white p-6 shadow-xs hover:shadow-sm transition-shadow dark:border-[#294564] dark:bg-[#17263D]">
          <div>
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400">
                Admin Accounts
              </span>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#FDE68A] bg-[#FFFBEB] text-[#D97706] dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <h2 className="text-4xl font-extrabold text-[#172033] dark:text-white my-1">
              {adminUsers}
            </h2>
            <p className="text-11px text-[#64748B] dark:text-slate-400">
              Full system management
            </p>
          </div>
        </div>

        {/* Card 3: Author Accounts */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#DCE7F2] bg-white p-6 shadow-xs hover:shadow-sm transition-shadow dark:border-[#294564] dark:bg-[#17263D]">
          <div>
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400">
                Author Accounts
              </span>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#FECDD3] bg-[#FFF1F2] text-[#E11D48] dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                <FileText className="h-5 w-5" />
              </div>
            </div>

            <h2 className="text-4xl font-extrabold text-[#172033] dark:text-white my-1">
              {authorUsers}
            </h2>
            <p className="text-11px text-[#64748B] dark:text-slate-400">
              Document access and contribution
            </p>
          </div>
        </div>
      </div>

      {/* User Role Distribution Card */}
      <div className="rounded-2xl border border-[#DCE7F2] bg-white p-6 md:p-8 shadow-xs dark:border-[#294564] dark:bg-[#17263D]">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#172033] dark:text-white">
            User Role Distribution
          </h3>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
            User access by role
          </p>
        </div>

        {/* Roles Progress Bars & Active/Inactive Box */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          {/* Progress Rows Container */}
          <div className="flex-1 space-y-3">
            {/* Admins Row */}
            <div className="flex items-center gap-4 rounded-2xl border border-[#E0E7EF] bg-[#F8FAFC]/60 px-4 py-3 dark:border-[#294564] dark:bg-[#111D29]/50">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E0F2FE] text-[#0284C7] dark:bg-sky-950/80 dark:text-sky-300">
                <Users className="h-4 w-4" />
              </div>

              <span className="w-18 shrink-0 text-xs font-bold text-[#172033] dark:text-white">
                Admins
              </span>

              <div className="flex-1 h-2 rounded-full bg-[#E2E8F0] dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#8ADFF3] transition-all duration-500"
                  style={{ width: `${adminPct}%` }}
                />
              </div>

              <div className="flex items-center gap-2 shrink-0 text-xs font-bold">
                <span className="text-[#172033] dark:text-white">{adminUsers}</span>
                <span className="text-[#CBD5E1] dark:text-slate-600 font-normal">|</span>
                <span className="text-[#38BDF8]">{adminPct}%</span>
              </div>
            </div>

            {/* Authors Row */}
            <div className="flex items-center gap-4 rounded-2xl border border-[#E0E7EF] bg-[#F8FAFC]/60 px-4 py-3 dark:border-[#294564] dark:bg-[#111D29]/50">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E0F2FE] text-[#0284C7] dark:bg-indigo-950/80 dark:text-indigo-300">
                <Pencil className="h-4 w-4" />
              </div>

              <span className="w-18 shrink-0 text-xs font-bold text-[#172033] dark:text-white">
                Authors
              </span>

              <div className="flex-1 h-2 rounded-full bg-[#E2E8F0] dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#BFDBFE] dark:bg-indigo-400 transition-all duration-500"
                  style={{ width: `${authorPct}%` }}
                />
              </div>

              <div className="flex items-center gap-2 shrink-0 text-xs font-bold">
                <span className="text-[#172033] dark:text-white">{authorUsers}</span>
                <span className="text-[#CBD5E1] dark:text-slate-600 font-normal">|</span>
                <span className="text-[#64748B] dark:text-slate-400">{authorPct}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
