
import React, { useEffect, useState } from "react";
import { useSuperAdminStore } from "../superAdminStore";
import type { ActivityLog } from "../types";
import {
  Download,
  Search,
  Eye,
  X,
} from "lucide-react";

const ActivityTracking: React.FC = () => {
  const { activityLogs, fetchActivityLogs } = useSuperAdminStore();

  const [activeTab, setActiveTab] = useState("All Activity");
  const [searchQuery, setSearchQuery] = useState("");
  const [workspaceFilter, setWorkspaceFilter] = useState("All");
  const [actorFilter, setActorFilter] = useState("All");
  const [resultFilter, setResultFilter] = useState("All");
  const [inspectLog, setInspectLog] = useState<ActivityLog | null>(null);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  const categories = [
    `All Activity (${activityLogs.length})`,
    "Admin Activity",
    "User Operations",
    "Subscription & Billing",
    "Security & Auth",
  ];

  const filteredLogs = activityLogs.filter((log) => {
    if (
      activeTab.startsWith("Admin Activity") &&
      log.category !== "Admin Activity"
    ) return false;

    if (
      activeTab.startsWith("User Operations") &&
      log.category !== "User Operations"
    ) return false;

    if (
      activeTab.startsWith("Subscription & Billing") &&
      log.category !== "Subscription & Billing"
    ) return false;

    if (
      activeTab.startsWith("Security & Auth") &&
      log.category !== "Security & Auth"
    ) return false;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      const matches =
        log.performedBy.toLowerCase().includes(query) ||
        log.activity.toLowerCase().includes(query) ||
        log.affectedUser.toLowerCase().includes(query) ||
        log.activityDescription.toLowerCase().includes(query);

      if (!matches) return false;
    }

    if (
      workspaceFilter !== "All" &&
      (log as ActivityLog & { workspace?: string }).workspace !== workspaceFilter
    ) return false;

    if (
      actorFilter !== "All" &&
      log.performedByRole !== actorFilter
    ) return false;

    if (
      resultFilter !== "All" &&
      log.status !== resultFilter
    ) return false;

    return true;
  });

  const exportCSV = () => {
    const headers = [
      "ID",
      "PERFORMED BY",
      "ROLE",
      "ACTIVITY",
      "DESCRIPTION",
      "TARGET",
      "DATE TIME",
      "STATUS",
    ];

    const escapeCSV = (value: unknown) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = filteredLogs.map((log) => [
      log.id,
      log.performedBy,
      log.performedByRole,
      log.activity,
      log.activityDescription,
      log.affectedTarget,
      log.dateTime,
      log.status,
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `Audit_Logs_${
      new Date().toISOString().split("T")[0]
    }.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Activity &amp; Audit Logs
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Tamper-evident record of administrative modifications, user
            operations, and security events.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
        >
          <Download className="h-4 w-4 text-slate-500" />
          Export Audit Log (CSV)
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        {categories.map((category) => {
          const isAll = category.startsWith("All Activity");
          const isActive = isAll
            ? activeTab.startsWith("All Activity")
            : activeTab === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveTab(category)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                isActive
                  ? "border border-blue-200 bg-blue-50 text-blue-600 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search actor, activity, target or description..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={workspaceFilter}
            onChange={(event) => setWorkspaceFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="All">Workspace: All</option>
            <option value="Apex Global Publishing">
              Apex Global Publishing
            </option>
            <option value="Horizon Media Group">Horizon Media Group</option>
            <option value="Vanguard Tech Solutions">
              Vanguard Tech Solutions
            </option>
          </select>

          <select
            value={actorFilter}
            onChange={(event) => setActorFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="All">Actor: All</option>
            <option value="Admin">Admin</option>
            <option value="Super Admin">Super Admin</option>
          </select>

          <select
            value={resultFilter}
            onChange={(event) => setResultFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="All">Result: All</option>
            <option value="Successful">Successful</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Audit log table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Performed By</th>
                <th className="px-6 py-4">Activity</th>
                <th className="px-6 py-4">Affected User / Target</th>
                <th className="px-6 py-4">Date &amp; Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-slate-900">
                      {log.performedBy}
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400">
                      {log.performedByRole}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-[11px] font-extrabold uppercase tracking-wide text-blue-600">
                      {log.activity}
                    </span>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">
                      {log.activityDescription}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <div className="font-extrabold text-slate-800">
                      {log.affectedUser}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400">
                      {log.affectedTarget}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-500">
                    {log.dateTime}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase ${
                        log.status === "Successful"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          log.status === "Successful"
                            ? "bg-emerald-500"
                            : "bg-red-500"
                        }`}
                      />
                      {log.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setInspectLog(log)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-xs font-semibold text-slate-400"
                  >
                    No activity logs found for current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit inspection modal */}
      {inspectLog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setInspectLog(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="audit-modal-title"
            className="w-full max-w-md space-y-4 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2
                id="audit-modal-title"
                className="text-base font-extrabold text-slate-900"
              >
                Audit Record Inspection
              </h2>

              <button
                type="button"
                aria-label="Close inspection"
                onClick={() => setInspectLog(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <Detail label="Log ID" value={inspectLog.id} />

              <Detail
                label="Activity Type"
                value={inspectLog.activity}
                valueClass="font-extrabold uppercase text-blue-600"
              />

              <Detail
                label="Performed By"
                value={`${inspectLog.performedBy} (${inspectLog.performedByRole})`}
              />

              <Detail
                label="Target / Affected"
                value={inspectLog.affectedTarget}
              />

              <Detail label="Timestamp" value={inspectLog.dateTime} />

              <Detail label="Category" value={inspectLog.category} />

              <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="mb-1 block text-[10px] font-black uppercase text-slate-400">
                  Description
                </span>
                <p className="font-semibold leading-relaxed text-slate-800">
                  {inspectLog.activityDescription}
                </p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setInspectLog(null)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

type DetailProps = {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
};

const Detail: React.FC<DetailProps> = ({
  label,
  value,
  valueClass = "font-bold text-slate-800",
}) => (
  <div className="flex items-start justify-between gap-4">
    <span className="shrink-0 font-semibold text-slate-400">{label}:</span>
    <span className={`text-right ${valueClass}`}>{value}</span>
  </div>
);

export default ActivityTracking;
