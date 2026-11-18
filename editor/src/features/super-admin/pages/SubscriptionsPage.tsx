// import React from "react";
// import { useSuperAdminStore } from "../superAdminStore";

// export const SubscriptionsPage: React.FC = () => {
//   const { clients } = useSuperAdminStore();

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-2xl font-black tracking-tight text-slate-900">Subscription &amp; Billing</h1>
//         <p className="mt-1 text-xs text-slate-500 font-medium">
//           Manage corporate licenses, subscription plans, and billing status for client organizations.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
//         {clients.map((c) => (
//           <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
//             <div className="flex justify-between items-start">
//               <div>
//                 <h3 className="text-base font-extrabold text-slate-900">{c.name}</h3>
//                 <span className="text-xs text-slate-400 font-semibold">{c.code}</span>
//               </div>
//               <span
//                 className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
//                   c.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
//                 }`}
//               >
//                 {c.status}
//               </span>
//             </div>

//             <div className="mt-4 space-y-2 text-xs font-semibold text-slate-600 border-t border-slate-100 pt-4">
//               <div className="flex justify-between">
//                 <span className="text-slate-400">Current Plan:</span>
//                 <span className="font-extrabold text-blue-600">{c.plan}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-slate-400">Active Seats:</span>
//                 <span className="font-bold text-slate-800">{c.userCount} Allocated Seats</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-slate-400">Account Admin:</span>
//                 <span className="font-bold text-slate-800">{c.adminName}</span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };
