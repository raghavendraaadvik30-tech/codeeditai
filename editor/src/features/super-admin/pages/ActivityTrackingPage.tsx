// import React, { useState, useEffect } from "react";
// import { useSuperAdminStore } from "../superAdminStore";
// import type { ActivityLog } from "../types";
// import {
//   Download,
//   Search,
//   Eye,
//   X,
// } from "lucide-react";

// export const ActivityTrackingPage: React.FC = () => {
//   const { activityLogs, fetchActivityLogs } = useSuperAdminStore();

//   useEffect(() => {
//     fetchActivityLogs();
//   }, [fetchActivityLogs]);

//   const [activeTab, setActiveTab] = useState<string>("All Activity");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [workspaceFilter, setWorkspaceFilter] = useState("All");
//   const [actorFilter, setActorFilter] = useState("All");
//   const [resultFilter, setResultFilter] = useState("All");

//   const [inspectLog, setInspectLog] = useState<ActivityLog | null>(null);

//   const categories = [
//     `All Activity (${activityLogs.length})`,
//     "Admin Activity",
//     "User Operations",
//     "Subscription & Billing",
//     "Security & Auth",
//   ];

//   const filteredLogs = activityLogs.filter((log) => {
//     // Category tab
//     if (activeTab.startsWith("Admin Activity") && log.category !== "Admin Activity") return false;
//     if (activeTab.startsWith("User Operations") && log.category !== "User Operations") return false;
//     if (activeTab.startsWith("Subscription & Billing") && log.category !== "Subscription & Billing") return false;
//     if (activeTab.startsWith("Security & Auth") && log.category !== "Security & Auth") return false;

//     // Search query
//     if (searchQuery.trim()) {
//       const q = searchQuery.toLowerCase();
//       const matchActor = log.performedBy.toLowerCase().includes(q);
//       const matchAct = log.activity.toLowerCase().includes(q);
//       const matchTarget = log.affectedUser.toLowerCase().includes(q);
//       const matchDesc = log.activityDescription.toLowerCase().includes(q);
//       if (!matchActor && !matchAct && !matchTarget && !matchDesc) return false;
//     }

//     // Actor filter
//     if (actorFilter !== "All" && log.performedByRole !== actorFilter) return false;

//     // Result filter
//     if (resultFilter !== "All" && log.status !== resultFilter) return false;

//     return true;
//   });

//   const exportCSV = () => {
//     const headers = ["ID", "PERFORMED BY", "ROLE", "ACTIVITY", "DESCRIPTION", "TARGET", "DATE TIME", "STATUS"];
//     const rows = filteredLogs.map((l) => [
//       l.id,
//       l.performedBy,
//       l.performedByRole,
//       l.activity,
//       `"${l.activityDescription.replace(/"/g, '""')}"`,
//       `"${l.affectedTarget.replace(/"/g, '""')}"`,
//       l.dateTime,
//       l.status,
//     ]);

//     const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
//     const encodedUri = encodeURI(csvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", `Audit_Logs_${new Date().toISOString().split("T")[0]}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div className="space-y-6">
//       {/* PAGE HEADER */}
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-black tracking-tight text-slate-900">Activity &amp; Audit Logs</h1>
//           <p className="mt-1 text-xs text-slate-500 font-medium">
//             Tamper-evident record of all administrative modifications, user operations, and security events.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={exportCSV}
//           className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
//         >
//           <Download className="h-4 w-4 text-slate-500" />
//           Export Audit Log (CSV)
//         </button>
//       </div>

//       {/* TABS */}
//       <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
//         {categories.map((cat) => {
//           const isActive = activeTab === cat || (cat.startsWith("All Activity") && activeTab.startsWith("All Activity"));
//           return (
//             <button
//               key={cat}
//               type="button"
//               onClick={() => setActiveTab(cat)}
//               className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-extrabold transition ${
//                 isActive
//                   ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm"
//                   : "text-slate-600 hover:bg-slate-100"
//               }`}
//             >
//               {cat}
//             </button>
//           );
//         })}
//       </div>

//       {/* FILTER CONTROLS ROW */}
//       <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//         <div className="relative flex-1 max-w-md">
//           <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Search WHO, WHAT, TO WHOM or description..."
//             className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//           />
//         </div>

//         <div className="flex items-center gap-3">
//           <select
//             value={workspaceFilter}
//             onChange={(e) => setWorkspaceFilter(e.target.value)}
//             className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
//           >
//             <option value="All">Workspace: All</option>
//             <option value="Apex Global Publishing">Apex Global Publishing</option>
//             <option value="Horizon Media Group">Horizon Media Group</option>
//             <option value="Vanguard Tech Solutions">Vanguard Tech Solutions</option>
//           </select>

//           <select
//             value={actorFilter}
//             onChange={(e) => setActorFilter(e.target.value)}
//             className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
//           >
//             <option value="All">Actor: All</option>
//             <option value="Admin">Admin</option>
//             <option value="Super Admin">Super Admin</option>
//           </select>

//           <select
//             value={resultFilter}
//             onChange={(e) => setResultFilter(e.target.value)}
//             className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500"
//           >
//             <option value="All">Result: All</option>
//             <option value="Successful">Successful</option>
//             <option value="Failed">Failed</option>
//           </select>
//         </div>
//       </div>

//       {/* AUDIT LOG TABLE */}
//       <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-black uppercase tracking-wider text-slate-500">
//                 <th className="px-6 py-4">PERFORMED BY</th>
//                 <th className="px-6 py-4">ACTIVITY</th>
//                 <th className="px-6 py-4">AFFECTED USER / TARGET</th>
//                 <th className="px-6 py-4">DATE &amp; TIME</th>
//                 <th className="px-6 py-4">STATUS</th>
//                 <th className="px-6 py-4 text-right">DETAILS</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
//               {filteredLogs.map((log) => (
//                 <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
//                   {/* PERFORMED BY */}
//                   <td className="px-6 py-4">
//                     <div className="font-extrabold text-slate-900">{log.performedBy}</div>
//                     <div className="text-[10px] font-semibold text-slate-400">{log.performedByRole}</div>
//                   </td>

//                   {/* ACTIVITY */}
//                   <td className="px-6 py-4">
//                     <span className="font-extrabold text-blue-600 tracking-wide uppercase text-[11px]">
//                       {log.activity}
//                     </span>
//                     <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
//                       {log.activityDescription}
//                     </p>
//                   </td>

//                   {/* AFFECTED TARGET */}
//                   <td className="px-6 py-4">
//                     <div className="font-extrabold text-slate-800">{log.affectedUser}</div>
//                     <div className="text-[10px] font-medium text-slate-400">{log.affectedTarget}</div>
//                   </td>

//                   {/* DATE & TIME */}
//                   <td className="px-6 py-4 font-semibold text-slate-500">{log.dateTime}</td>

//                   {/* STATUS */}
//                   <td className="px-6 py-4">
//                     <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-extrabold uppercase text-emerald-600">
//                       <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
//                       {log.status}
//                     </span>
//                   </td>

//                   {/* DETAILS */}
//                   <td className="px-6 py-4 text-right">
//                     <button
//                       type="button"
//                       onClick={() => setInspectLog(log)}
//                       className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
//                     >
//                       <Eye className="h-3.5 w-3.5 text-slate-400" />
//                       Inspect
//                     </button>
//                   </td>
//                 </tr>
//               ))}

//               {filteredLogs.length === 0 && (
//                 <tr>
//                   <td colSpan={6} className="px-6 py-12 text-center text-xs font-semibold text-slate-400">
//                     No activity logs found for current filters.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* INSPECT LOG MODAL */}
//       {inspectLog && (
//         <div
//           className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
//           onMouseDown={(e) => {
//             if (e.target === e.currentTarget) setInspectLog(null);
//           }}
//         >
//           <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
//             <div className="flex items-center justify-between border-b border-slate-100 pb-4">
//               <h3 className="text-base font-extrabold text-slate-900">Audit Record Inspection</h3>
//               <button
//                 type="button"
//                 onClick={() => setInspectLog(null)}
//                 className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <div className="space-y-3 text-xs">
//               <div className="flex justify-between">
//                 <span className="font-semibold text-slate-400">Log ID:</span>
//                 <span className="font-bold text-slate-800">{inspectLog.id}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="font-semibold text-slate-400">Activity Type:</span>
//                 <span className="font-extrabold text-blue-600 uppercase">{inspectLog.activity}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="font-semibold text-slate-400">Performed By:</span>
//                 <span className="font-bold text-slate-900">{inspectLog.performedBy} ({inspectLog.performedByRole})</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="font-semibold text-slate-400">Target / Affected:</span>
//                 <span className="font-bold text-slate-800">{inspectLog.affectedTarget}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="font-semibold text-slate-400">Timestamp:</span>
//                 <span className="font-bold text-slate-600">{inspectLog.dateTime}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="font-semibold text-slate-400">Category:</span>
//                 <span className="font-bold text-slate-700">{inspectLog.category}</span>
//               </div>

//               <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 mt-2">
//                 <span className="block text-[10px] font-black uppercase text-slate-400 mb-1">Description</span>
//                 <p className="text-slate-800 font-semibold leading-relaxed">{inspectLog.activityDescription}</p>
//               </div>
//             </div>

//             <div className="pt-2 text-right">
//               <button
//                 type="button"
//                 onClick={() => setInspectLog(null)}
//                 className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
