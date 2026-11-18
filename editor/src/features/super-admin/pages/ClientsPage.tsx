// import React from "react";
// import { useSuperAdminStore } from "../superAdminStore";
// import { Briefcase } from "lucide-react";

// export const ClientsPage: React.FC = () => {
//   const { clients } = useSuperAdminStore();

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-black tracking-tight text-slate-900">Clients</h1>
//         <p className="mt-1 text-xs text-slate-500 font-medium">
//           Registered client organizations using Document Editor platform.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
//         {clients.map((c) => (
//           <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
//             <div className="flex items-center gap-3">
//               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
//                 <Briefcase className="h-6 w-6" />
//               </div>
//               <div>
//                 <h3 className="text-base font-extrabold text-slate-900">{c.name}</h3>
//                 <span className="text-[10px] font-bold text-slate-400 uppercase">{c.code}</span>
//               </div>
//             </div>

//             <div className="mt-4 border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600 font-medium">
//               <div className="flex justify-between">
//                 <span>Admin Contact:</span>
//                 <span className="font-bold text-slate-900">{c.adminName}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Allocated Seats:</span>
//                 <span className="font-bold text-slate-900">{c.userCount} Users</span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };
