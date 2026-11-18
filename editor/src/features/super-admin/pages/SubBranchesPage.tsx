// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import { useSuperAdminStore } from "../superAdminStore";
// import {
//   MapPinned,
//   Plus,
//   Trash2,
//   Building2,
//   Search,
//   CheckCircle2,
//   Briefcase,
//   X,
//   Sparkles,
//   Copy,
//   Check,
//   UserPlus,
//   ArrowRight,
// } from "lucide-react";

// export const SubBranchesPage: React.FC = () => {
//   const {
//     branches,
//     clients,
//     subBranchesList,
//     addWorkspaceSubBranch,
//     deleteWorkspaceSubBranch,
//     fetchBranches,
//   } = useSuperAdminStore();

//   useEffect(() => {
//     fetchBranches();
//   }, [fetchBranches]);

//   // Form State
//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [selectedBranchId, setSelectedBranchId] = useState("");
//   const [selectedWorkspaceId, setSelectedWorkspaceId] = useState("");
//   const [subBranchAddress, setSubBranchAddress] = useState("");
//   const [workspaceCode, setWorkspaceCode] = useState("");
//   const [formError, setFormError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const [copiedCode, setCopiedCode] = useState<string | null>(null);

//   // Filters State
//   const [searchQuery, setSearchQuery] = useState("");
//   const [workspaceFilter, setWorkspaceFilter] = useState("ALL");
//   const [branchFilter, setBranchFilter] = useState("ALL");

//   // Default selection when branches/clients load
//   useEffect(() => {
//     if (!selectedBranchId && branches.length > 0) {
//       setSelectedBranchId(branches[0].id);
//     }
//   }, [branches, selectedBranchId]);

//   useEffect(() => {
//     if (!selectedWorkspaceId && clients.length > 0) {
//       setSelectedWorkspaceId(clients[0].id);
//     }
//   }, [clients, selectedWorkspaceId]);

//   // Auto-generate workspace code helper
//   const generateCode = (branchIdVal?: string, wsIdVal?: string) => {
//     const bId = branchIdVal || selectedBranchId;
//     const wId = wsIdVal || selectedWorkspaceId;
//     const branch = branches.find((b) => b.id === bId) || branches[0];
//     const ws = clients.find((c) => c.id === wId) || clients[0];

//     const branchPart = (branch?.code || branch?.name?.slice(0, 3) || "HQ")
//       .replace(/[^A-Za-z0-9]/g, "")
//       .toUpperCase();
//     const wsPart = (ws?.code || ws?.name?.slice(0, 3) || "WS")
//       .replace(/[^A-Za-z0-9]/g, "")
//       .toUpperCase();

//     const randomSuffix = Math.floor(10 + Math.random() * 90);
//     return `${branchPart}-${wsPart}-${randomSuffix}`;
//   };

//   // When branch or workspace changes, auto-propose code if empty
//   const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const newBId = e.target.value;
//     setSelectedBranchId(newBId);
//     setWorkspaceCode(generateCode(newBId, selectedWorkspaceId));
//   };

//   const handleWorkspaceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const newWsId = e.target.value;
//     setSelectedWorkspaceId(newWsId);
//     setWorkspaceCode(generateCode(selectedBranchId, newWsId));
//   };

//   const handleRegenerateCode = () => {
//     setWorkspaceCode(generateCode());
//   };

//   const handleCopyCode = (code: string) => {
//     navigator.clipboard.writeText(code);
//     setCopiedCode(code);
//     setTimeout(() => setCopiedCode(null), 2000);
//   };

//   const handleSaveSubBranch = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setFormError("");
//     setSuccessMessage("");

//     if (!subBranchAddress.trim()) {
//       setFormError("Sub-branch address or location details are required.");
//       return;
//     }

//     const targetBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];
//     if (!targetBranch) {
//       setFormError("Please select a branch. Add a branch first if none exist.");
//       return;
//     }

//     const targetWs = clients.find((c) => c.id === selectedWorkspaceId) || clients[0];
//     if (!targetWs) {
//       setFormError("Please select a workspace. Add a workspace first if none exist.");
//       return;
//     }

//     const finalCode = workspaceCode.trim() || generateCode();

//     await addWorkspaceSubBranch({
//       branchId: targetBranch.id,
//       branchName: targetBranch.name,
//       workspaceId: targetWs.id,
//       workspaceName: targetWs.name,
//       address: subBranchAddress.trim(),
//       code: finalCode,
//     });

//     setSuccessMessage(
//       `Sub-branch created! Workspace code "${finalCode}" is ready to be given to an Organization Admin.`
//     );
//     setSubBranchAddress("");
//     setWorkspaceCode("");
//     setIsFormOpen(false);

//     setTimeout(() => {
//       setSuccessMessage("");
//     }, 4000);
//   };

//   const filteredSubBranches = subBranchesList.filter((sb) => {
//     const matchesSearch =
//       sb.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       sb.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       sb.workspaceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (sb.branchName && sb.branchName.toLowerCase().includes(searchQuery.toLowerCase()));

//     const matchesWs =
//       workspaceFilter === "ALL" ||
//       sb.workspaceId === workspaceFilter ||
//       sb.workspaceName.toLowerCase() === workspaceFilter.toLowerCase();

//     const matchesBranch =
//       branchFilter === "ALL" ||
//       (sb.branchName && sb.branchName.toLowerCase() === branchFilter.toLowerCase()) ||
//       sb.branchId === branchFilter;

//     return matchesSearch && matchesWs && matchesBranch;
//   });

//   const selectedBranch = branches.find((b) => b.id === selectedBranchId);
//   const selectedWs = clients.find((c) => c.id === selectedWorkspaceId);

//   return (
//     <div className="space-y-6">
//       {/* HEADER */}
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-black tracking-tight text-slate-900">Sub-Branches & Workspace Codes</h1>
//           <p className="mt-1 text-xs font-medium text-slate-500">
//             Select a branch and workspace, enter sub-branch details, and generate the unique Workspace Code to give to the Admin.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={() => {
//             if (!isFormOpen) {
//               setWorkspaceCode(generateCode());
//             }
//             setIsFormOpen(!isFormOpen);
//           }}
//           className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-emerald-500/25 transition hover:bg-emerald-700 active:scale-95"
//         >
//           <Plus className="h-4 w-4" />
//           {isFormOpen ? "Close Entry Form" : "+ Add Sub Branch & Generate Code"}
//         </button>
//       </div>

//       {successMessage && (
//         <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 border border-emerald-200">
//           <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
//           <span>{successMessage}</span>
//         </div>
//       )}

//       {/* CREATE SUB-BRANCH FORM / ENTRY PANEL */}
//       {isFormOpen && (
//         <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition">
//           <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
//             <div className="flex items-center gap-3">
//               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold">
//                 <MapPinned className="h-5 w-5" />
//               </div>
//               <div>
//                 <h2 className="text-sm font-extrabold text-slate-900">
//                   Step 3: Pair Branch & Workspace, Generate Workspace Code
//                 </h2>
//                 <p className="text-xs text-slate-500 font-medium">
//                   Select your branch, select workspace name, enter sub-branch location, then generate the code for the Admin.
//                 </p>
//               </div>
//             </div>

//             <button
//               type="button"
//               onClick={() => setIsFormOpen(false)}
//               className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>

//           <form onSubmit={handleSaveSubBranch} className="space-y-5">
//             {formError && (
//               <div className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-600">
//                 {formError}
//               </div>
//             )}

//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//               {/* 1. SELECT BRANCH */}
//               <div>
//                 <label className="mb-1 block text-xs font-extrabold text-slate-700 uppercase">
//                   1. SELECT BRANCH <span className="text-rose-500">*</span>
//                 </label>
//                 <select
//                   value={selectedBranchId}
//                   onChange={handleBranchChange}
//                   className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
//                 >
//                   {branches.map((b) => (
//                     <option key={b.id} value={b.id}>
//                       {b.name} ({b.city || b.country}) [{b.code}]
//                     </option>
//                   ))}
//                   {branches.length === 0 && (
//                     <option value="">No branches found (Create in Branches first)</option>
//                   )}
//                 </select>
//                 <span className="mt-1 block text-[10px] text-slate-400 font-medium">
//                   The primary regional branch office.
//                 </span>
//               </div>

//               {/* 2. SELECT WORKSPACE NAME */}
//               <div>
//                 <label className="mb-1 block text-xs font-extrabold text-slate-700 uppercase">
//                   2. SELECT WORKSPACE NAME <span className="text-rose-500">*</span>
//                 </label>
//                 <select
//                   value={selectedWorkspaceId}
//                   onChange={handleWorkspaceChange}
//                   className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
//                 >
//                   {clients.map((c) => (
//                     <option key={c.id} value={c.id}>
//                       {c.name} ({c.code})
//                     </option>
//                   ))}
//                   {clients.length === 0 && (
//                     <option value="">No workspaces found (Create in Workspaces first)</option>
//                   )}
//                 </select>
//                 <span className="mt-1 block text-[10px] text-slate-400 font-medium">
//                   The client organization workspace.
//                 </span>
//               </div>

//               {/* 3. SUB-BRANCH DETAILS / LOCATION */}
//               <div>
//                 <label className="mb-1 block text-xs font-extrabold text-slate-700 uppercase">
//                   3. SUB-BRANCH DETAILS / LOCATION <span className="text-rose-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={subBranchAddress}
//                   onChange={(e) => setSubBranchAddress(e.target.value)}
//                   placeholder="e.g. Building B, Level 3 Desk, Bangalore"
//                   className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
//                 />
//                 <span className="mt-1 block text-[10px] text-slate-400 font-medium">
//                   Physical office room, address, or team division.
//                 </span>
//               </div>
//             </div>

//             {/* 4. WORKSPACE CODE GENERATION PANEL */}
//             <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//                 <div>
//                   <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 uppercase tracking-wide">
//                     <Sparkles className="h-4 w-4 text-emerald-600" />
//                     Generated Workspace Code to Give to Admin
//                   </div>
//                   <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
//                     This code uniquely links this Branch, Workspace, and Sub-Branch together.
//                   </p>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <input
//                     type="text"
//                     value={workspaceCode}
//                     onChange={(e) => setWorkspaceCode(e.target.value)}
//                     placeholder="e.g. APEX-HQ-01"
//                     className="w-48 rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-black uppercase text-emerald-900 shadow-sm outline-none focus:border-emerald-500"
//                   />
//                   <button
//                     type="button"
//                     onClick={handleRegenerateCode}
//                     className="rounded-xl border border-emerald-300 bg-white px-3 py-2 text-xs font-extrabold text-emerald-700 shadow-sm hover:bg-emerald-50 transition"
//                   >
//                     Generate New
//                   </button>
//                 </div>
//               </div>

//               {/* Dynamic Preview Summary */}
//               <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700 border-t border-emerald-200/70 pt-3">
//                 <div>
//                   <span className="text-slate-400 font-semibold text-[10px] uppercase block">Branch:</span>
//                   🏢 {selectedBranch?.name || "Selected Branch"}
//                 </div>
//                 <div>
//                   <span className="text-slate-400 font-semibold text-[10px] uppercase block">Workspace:</span>
//                   💼 {selectedWs?.name || "Selected Workspace"}
//                 </div>
//                 <div>
//                   <span className="text-slate-400 font-semibold text-[10px] uppercase block">Code Generated:</span>
//                   <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-black text-emerald-800">
//                     {workspaceCode || "PENDING"}
//                   </span>
//                 </div>
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
//                 className="rounded-xl bg-emerald-600 px-6 py-2 text-xs font-black text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-700 transition"
//               >
//                 Save Sub-Branch & Lock Workspace Code
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* FILTER CONTROLS */}
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-slate-200">
//         <div className="flex flex-wrap items-center gap-3">
//           <div className="relative w-full sm:w-64">
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               placeholder="Search code, address, branch..."
//               className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
//             />
//           </div>

//           <select
//             value={workspaceFilter}
//             onChange={(e) => setWorkspaceFilter(e.target.value)}
//             className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
//           >
//             <option value="ALL">All Workspaces</option>
//             {clients.map((c) => (
//               <option key={c.id} value={c.id}>
//                 {c.name}
//               </option>
//             ))}
//           </select>

//           <select
//             value={branchFilter}
//             onChange={(e) => setBranchFilter(e.target.value)}
//             className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
//           >
//             <option value="ALL">All Branches</option>
//             {branches.map((b) => (
//               <option key={b.id} value={b.name}>
//                 {b.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="text-xs font-semibold text-slate-500">
//           Showing: <strong className="text-slate-900">{filteredSubBranches.length}</strong> Configured Codes
//         </div>
//       </div>

//       {/* SUB-BRANCHES DATA TABLE */}
//       <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
//         <table className="w-full text-left text-xs">
//           <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-black uppercase tracking-wider text-slate-400">
//             <tr>
//               <th className="px-6 py-4">Workspace Code (Give to Admin)</th>
//               <th className="px-6 py-4">Workspace Name</th>
//               <th className="px-6 py-4">Branch Name</th>
//               <th className="px-6 py-4">Sub-Branch Location / Details</th>
//               <th className="px-6 py-4 text-center">Admin Registration</th>
//               <th className="px-6 py-4 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100">
//             {filteredSubBranches.map((sb) => (
//               <tr key={sb.id} className="hover:bg-slate-50/60 transition">
//                 {/* WORKSPACE CODE WITH COPY */}
//                 <td className="px-6 py-4">
//                   <div className="flex items-center gap-2">
//                     <span className="inline-block rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-black uppercase text-emerald-800 border border-emerald-200 shadow-sm">
//                       {sb.code}
//                     </span>
//                     <button
//                       type="button"
//                       onClick={() => handleCopyCode(sb.code)}
//                       className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
//                       title="Copy Workspace Code"
//                     >
//                       {copiedCode === sb.code ? (
//                         <Check className="h-3.5 w-3.5 text-emerald-600" />
//                       ) : (
//                         <Copy className="h-3.5 w-3.5" />
//                       )}
//                     </button>
//                   </div>
//                 </td>

//                 {/* WORKSPACE NAME */}
//                 <td className="px-6 py-4">
//                   <div className="flex items-center gap-2">
//                     <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
//                       <Briefcase className="h-3.5 w-3.5" />
//                     </span>
//                     <span className="font-extrabold text-slate-900">{sb.workspaceName}</span>
//                   </div>
//                 </td>

//                 {/* BRANCH NAME */}
//                 <td className="px-6 py-4">
//                   <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
//                     <Building2 className="h-3.5 w-3.5 text-slate-400" />
//                     <span>{sb.branchName || "General Hub"}</span>
//                   </div>
//                 </td>

//                 {/* SUB-BRANCH DETAILS / ADDRESS */}
//                 <td className="px-6 py-4">
//                   <div className="flex items-start gap-1.5 text-slate-800 font-bold max-w-xs">
//                     <MapPinned className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
//                     <span>{sb.address}</span>
//                   </div>
//                 </td>

//                 {/* QUICK ACTION: REGISTER ADMIN WITH THIS CODE */}
//                 <td className="px-6 py-4 text-center">
//                   <Link
//                     to={`/super-admin/register-admin?workspace=${encodeURIComponent(sb.code)}`}
//                     className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-[11px] font-black text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
//                   >
//                     <UserPlus className="h-3.5 w-3.5 text-blue-600" />
//                     Register Admin
//                     <ArrowRight className="h-3 w-3" />
//                   </Link>
//                 </td>

//                 {/* DELETE */}
//                 <td className="px-6 py-4 text-right">
//                   <button
//                     type="button"
//                     onClick={() => deleteWorkspaceSubBranch(sb.id)}
//                     className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
//                     title="Delete Sub Branch"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </button>
//                 </td>
//               </tr>
//             ))}

//             {filteredSubBranches.length === 0 && (
//               <tr>
//                 <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
//                   No sub-branch workspace codes generated yet. Click "+ Add Sub Branch & Generate Code" above.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };
