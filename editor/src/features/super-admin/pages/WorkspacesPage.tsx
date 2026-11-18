// import React, { useState } from "react";
// import { useSuperAdminStore } from "../superAdminStore";
// import {
//   Briefcase,
//   Plus,
//   Trash2,
//   Search,
//   CheckCircle2,
// } from "lucide-react";

// export const WorkspacesPage: React.FC = () => {
//   const { clients, addWorkspace, deleteWorkspace } = useSuperAdminStore();

//   // Form State
//   const [workspaceName, setWorkspaceName] = useState("");
//   const [workspaceCode, setWorkspaceCode] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [formError, setFormError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const [isFormOpen, setIsFormOpen] = useState(false);

//   const handleAddWorkspace = (e: React.FormEvent) => {
//     e.preventDefault();
//     setFormError("");
//     setSuccessMessage("");

//     if (!workspaceName.trim()) {
//       setFormError("Workspace name is required.");
//       return;
//     }

//     const code =
//       workspaceCode.trim() ||
//       `${workspaceName.trim().slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

//     addWorkspace({
//       name: workspaceName.trim(),
//       code,
//     });

//     setSuccessMessage(`Workspace "${workspaceName.trim()}" added successfully!`);
//     setWorkspaceName("");
//     setWorkspaceCode("");
//     setIsFormOpen(false);

//     setTimeout(() => {
//       setSuccessMessage("");
//     }, 3000);
//   };

//   const filteredWorkspaces = clients.filter((ws) => {
//     const query = searchQuery.toLowerCase();
//     return (
//       ws.name.toLowerCase().includes(query) ||
//       ws.code.toLowerCase().includes(query)
//     );
//   });

//   return (
//     <div className="space-y-6">
//       {/* HEADER */}
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-black tracking-tight text-slate-900">Workspaces</h1>
//           <p className="mt-1 text-xs font-medium text-slate-500">
//             Create client company workspaces and assign codes.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={() => setIsFormOpen(!isFormOpen)}
//           className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700 active:scale-95"
//         >
//           <Plus className="h-4 w-4" />
//           {isFormOpen ? "Close Form" : "Add Workspace"}
//         </button>
//       </div>

//       {successMessage && (
//         <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-700 border border-emerald-200">
//           <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
//           {successMessage}
//         </div>
//       )}

//       {/* CREATE WORKSPACE CARD / FORM */}
//       {isFormOpen && (
//         <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition">
//           <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
//             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 font-bold">
//               <Briefcase className="h-5 w-5" />
//             </div>
//             <div>
//               <h2 className="text-sm font-extrabold text-slate-900">Create New Workspace</h2>
//               <p className="text-xs text-slate-500 font-medium">
//                 Specify the workspace details.
//               </p>
//             </div>
//           </div>

//           <form onSubmit={handleAddWorkspace} className="space-y-4">
//             {formError && (
//               <div className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600">
//                 {formError}
//               </div>
//             )}

//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//               {/* WORKSPACE NAME */}
//               <div>
//                 <label className="mb-1 block text-xs font-extrabold text-slate-700 uppercase">
//                   WORKSPACE NAME <span className="text-rose-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={workspaceName}
//                   onChange={(e) => setWorkspaceName(e.target.value)}
//                   placeholder="e.g. Infosys, TCS, CodeOrigin"
//                   className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
//                 />
//               </div>

//               {/* WORKSPACE CODE */}
//               <div>
//                 <label className="mb-1 block text-xs font-extrabold text-slate-700 uppercase">
//                   WORKSPACE CODE
//                 </label>
//                 <input
//                   type="text"
//                   value={workspaceCode}
//                   onChange={(e) => setWorkspaceCode(e.target.value)}
//                   placeholder="e.g. INF-01, TCS-01, CO-01"
//                   className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
//                 />
//                 <span className="mt-1 block text-[10px] text-slate-400 font-medium">
//                   Auto-generated if left blank.
//                 </span>
//               </div>
//             </div>

//             <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
//               <button
//                 type="button"
//                 onClick={() => setIsFormOpen(false)}
//                 className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="rounded-xl bg-blue-600 px-6 py-2 text-xs font-black text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition"
//               >
//                 + Add Workspace
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* SEARCH BAR & SUMMARY */}
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//         <div className="relative w-full max-w-xs">
//           <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Search workspaces by name or code..."
//             className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
//           />
//         </div>

//         <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
//           <span>Total Workspaces: <strong className="text-slate-900">{clients.length}</strong></span>
//         </div>
//       </div>

//       {/* WORKSPACES DATA TABLE */}
//       <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//         <table className="w-full text-left text-xs">
//           <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-black uppercase tracking-wider text-slate-400">
//             <tr>
//               <th className="px-6 py-4">Workspace Name</th>
//               <th className="px-6 py-4">Workspace Code</th>
//               <th className="px-6 py-4 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100">
//             {filteredWorkspaces.map((ws) => (
//               <tr key={ws.id} className="hover:bg-slate-50/60 transition">
//                 <td className="px-6 py-4">
//                   <div className="flex items-center gap-3">
//                     <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold border border-blue-100">
//                       <Briefcase className="h-4 w-4" />
//                     </div>
//                     <span className="font-extrabold text-slate-900">{ws.name}</span>
//                   </div>
//                 </td>
//                 <td className="px-6 py-4">
//                   <span className="inline-block rounded-md bg-blue-50 px-2 py-1 text-[11px] font-black uppercase text-blue-700">
//                     {ws.code}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 text-right">
//                   <button
//                     type="button"
//                     onClick={() => deleteWorkspace(ws.id)}
//                     className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
//                     title="Delete Workspace"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </button>
//                 </td>
//               </tr>
//             ))}

//             {filteredWorkspaces.length === 0 && (
//               <tr>
//                 <td colSpan={3} className="py-10 text-center text-slate-400 font-semibold">
//                   No workspaces found. Click "+ Add Workspace" above to create one.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };
