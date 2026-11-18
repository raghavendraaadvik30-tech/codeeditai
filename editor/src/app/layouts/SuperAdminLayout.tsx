// import React, { useState } from "react";
// import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
// import { useAuth } from "@/features/auth/index";
// import {
//   Key,
//   LayoutGrid,
//   Users,
//   UserCheck,
//   Activity,
//   CreditCard,
//   Briefcase,
//   ShieldCheck,
//   Bell,
//   FileSpreadsheet,
//   Settings,
//   ChevronDown,
//   ChevronRight,
//   LogOut,
//   Sun,
//   X,
//   Menu,
// } from "lucide-react";

// export const SuperAdminLayout: React.FC = () => {
//   const { user, logout } = useAuth();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [sidebarExpanded, setSidebarExpanded] = useState(true);
//   const [adminMenuOpen, setAdminMenuOpen] = useState(true);
//   const [showProfileModal, setShowProfileModal] = useState(false);

//   // Profile modal state
//   const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

//   const isAdminSubRouteActive = location.pathname.startsWith("/super-admin/admins");

//   const currentPathName = () => {
//     if (location.pathname.includes("/workspaces")) return "Workspaces";
//     if (location.pathname.includes("/sub-branches")) return "Sub-Branches";
//     if (location.pathname.includes("/branches")) return "Branches";
//     if (location.pathname.includes("/admins/register")) return "Register Admin";
//     if (location.pathname.includes("/admins")) return "Admin Directory";
//     if (location.pathname.includes("/users")) return "User Management";
//     if (location.pathname.includes("/activity")) return "Activity & Audit Logs";
//     if (location.pathname.includes("/subscriptions")) return "Subscription & Billing";
//     if (location.pathname.includes("/clients")) return "Clients";
//     if (location.pathname.includes("/security")) return "Security & Sessions";
//     if (location.pathname.includes("/notifications")) return "Notifications";
//     if (location.pathname.includes("/reports")) return "Reports";
//     if (location.pathname.includes("/settings")) return "System Settings";
//     return "Dashboard";
//   };

//   return (
//     <div className="flex h-screen overflow-hidden bg-[#F8FAFC] font-sans text-slate-800">
//       {/* SIDEBAR */}
//       <aside
//         className={`fixed inset-y-0 left-0 z-40 flex h-screen flex-col justify-between overflow-y-auto border-r border-slate-200 bg-white transition-all duration-300 ${
//           sidebarExpanded ? "w-64" : "w-20"
//         }`}
//       >
//         <div>
//           {/* LOGO HEADER */}
//           <div className="flex h-16 shrink-0 items-center border-b border-slate-100 px-5">
//             <Link to="/super-admin/dashboard" className="flex items-center gap-3">
//               <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
//                 <Key className="h-5 w-5" />
//               </div>

//               {sidebarExpanded && (
//                 <div>
//                   <h1 className="text-xs font-black tracking-tight text-slate-900 uppercase">
//                     DOCUMENT EDITOR
//                   </h1>
//                   <span className="block text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
//                     SUPER ADMIN
//                   </span>
//                 </div>
//               )}
//             </Link>
//           </div>

//           {/* NAV MENU */}
//           <nav className="space-y-1 p-3">
//             {/* Dashboard */}
//             <Link
//               to="/super-admin/dashboard"
//               className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
//                 location.pathname === "/super-admin/dashboard" || location.pathname === "/super-admin"
//                   ? "bg-blue-50 text-blue-600 shadow-sm"
//                   : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//               }`}
//             >
//               <LayoutGrid className="h-4.5 w-4.5 shrink-0" />
//               {sidebarExpanded && <span>Dashboard</span>}
//             </Link>

//             {/* Admin Management Accordion */}
//             <div>
//               <button
//                 type="button"
//                 onClick={() => setAdminMenuOpen(!adminMenuOpen)}
//                 className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
//                   isAdminSubRouteActive
//                     ? "text-blue-600 font-extrabold"
//                     : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//                 }`}
//               >
//                 <div className="flex items-center gap-3">
//                   <Users className="h-4.5 w-4.5 shrink-0" />
//                   {sidebarExpanded && <span>Admin Management</span>}
//                 </div>
//                 {sidebarExpanded && (
//                   <div>
//                     {adminMenuOpen ? (
//                       <ChevronDown className="h-4 w-4 text-slate-400" />
//                     ) : (
//                       <ChevronRight className="h-4 w-4 text-slate-400" />
//                     )}
//                   </div>
//                 )}
//               </button>

//               {/* Accordion Sub-items */}
//               {adminMenuOpen && sidebarExpanded && (
//                 <div className="ml-7 mt-1 space-y-1 border-l-2 border-slate-100 pl-3">
//                   <Link
//                     to="/super-admin/admins"
//                     className={`block rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
//                       location.pathname === "/super-admin/admins"
//                         ? "text-blue-600 bg-blue-50 font-bold"
//                         : "text-slate-500 hover:text-slate-800"
//                     }`}
//                   >
//                     Admins
//                   </Link>
//                   <Link
//                     to="/super-admin/admins/workspaces"
//                     className={`block rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
//                       location.pathname === "/super-admin/admins/workspaces"
//                         ? "text-blue-600 bg-blue-50 font-bold"
//                         : "text-slate-500 hover:text-slate-800"
//                     }`}
//                   >
//                     Workspaces
//                   </Link>
//                   <Link
//                     to="/super-admin/admins/sub-branches"
//                     className={`block rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
//                       location.pathname === "/super-admin/admins/sub-branches"
//                         ? "text-blue-600 bg-blue-50 font-bold"
//                         : "text-slate-500 hover:text-slate-800"
//                     }`}
//                   >
//                     Sub-Branches
//                   </Link>
//                   <Link
//                     to="/super-admin/admins/branches"
//                     className={`block rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
//                       location.pathname === "/super-admin/admins/branches"
//                         ? "text-blue-600 bg-blue-50 font-bold"
//                         : "text-slate-500 hover:text-slate-800"
//                     }`}
//                   >
//                     Branches
//                   </Link>
//                   <Link
//                     to="/super-admin/admins/register"
//                     className={`block rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
//                       location.pathname === "/super-admin/admins/register"
//                         ? "text-blue-600 bg-blue-50 font-bold"
//                         : "text-slate-500 hover:text-slate-800"
//                     }`}
//                   >
//                     Register Admin
//                   </Link>
//                 </div>
//               )}
//             </div>

//             {/* User Management */}
//             <Link
//               to="/super-admin/users"
//               className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
//                 location.pathname === "/super-admin/users"
//                   ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
//                   : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//               }`}
//             >
//               <UserCheck className="h-4.5 w-4.5 shrink-0" />
//               {sidebarExpanded && <span>User Management</span>}
//             </Link>

//             {/* Activity Tracking */}
//             <Link
//               to="/super-admin/activity"
//               className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
//                 location.pathname === "/super-admin/activity"
//                   ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
//                   : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//               }`}
//             >
//               <Activity className="h-4.5 w-4.5 shrink-0" />
//               {sidebarExpanded && <span>Activity Tracking</span>}
//             </Link>

//             {/* Subscription & Billing */}
//             <Link
//               to="/super-admin/subscriptions"
//               className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
//                 location.pathname === "/super-admin/subscriptions"
//                   ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
//                   : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//               }`}
//             >
//               <div className="flex items-center gap-3">
//                 <CreditCard className="h-4.5 w-4.5 shrink-0" />
//                 {sidebarExpanded && <span>Subscription & Billing</span>}
//               </div>
//               {sidebarExpanded && (
//                 <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white">
//                   1
//                 </span>
//               )}
//             </Link>

//             {/* Clients */}
//             <Link
//               to="/super-admin/clients"
//               className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
//                 location.pathname === "/super-admin/clients"
//                   ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
//                   : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//               }`}
//             >
//               <div className="flex items-center gap-3">
//                 <Briefcase className="h-4.5 w-4.5 shrink-0" />
//                 {sidebarExpanded && <span>Clients</span>}
//               </div>
//               {sidebarExpanded && (
//                 <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white">
//                   1
//                 </span>
//               )}
//             </Link>

//             {/* Security & Sessions */}
//             <Link
//               to="/super-admin/security"
//               className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
//                 location.pathname === "/super-admin/security"
//                   ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
//                   : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//               }`}
//             >
//               <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
//               {sidebarExpanded && <span>Security & Sessions</span>}
//             </Link>

//             {/* Notifications */}
//             <Link
//               to="/super-admin/notifications"
//               className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
//                 location.pathname === "/super-admin/notifications"
//                   ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
//                   : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//               }`}
//             >
//               <div className="flex items-center gap-3">
//                 <Bell className="h-4.5 w-4.5 shrink-0" />
//                 {sidebarExpanded && <span>Notifications</span>}
//               </div>
//               {sidebarExpanded && (
//                 <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-extrabold text-white">
//                   2
//                 </span>
//               )}
//             </Link>

//             {/* Reports */}
//             <Link
//               to="/super-admin/reports"
//               className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
//                 location.pathname === "/super-admin/reports"
//                   ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
//                   : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//               }`}
//             >
//               <FileSpreadsheet className="h-4.5 w-4.5 shrink-0" />
//               {sidebarExpanded && <span>Reports</span>}
//             </Link>

//             {/* System Settings */}
//             <Link
//               to="/super-admin/settings"
//               className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
//                 location.pathname === "/super-admin/settings"
//                   ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
//                   : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
//               }`}
//             >
//               <Settings className="h-4.5 w-4.5 shrink-0" />
//               {sidebarExpanded && <span>System Settings</span>}
//             </Link>
//           </nav>
//         </div>

//         {/* BOTTOM USER PROFILE CARD */}
//         <div className="shrink-0 border-t border-slate-100 p-3 bg-slate-50/50">
//           <button
//             type="button"
//             onClick={() => setShowProfileModal(true)}
//             className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 text-left transition hover:border-slate-300 shadow-sm"
//           >
//             <div className="flex items-center gap-3">
//               <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
//                 <ShieldCheck className="h-5 w-5 text-blue-600" />
//               </div>
//               {sidebarExpanded && (
//                 <div className="min-w-0">
//                   <p className="truncate text-xs font-black text-slate-900">
//                     Super Admin
//                   </p>
//                   <p className="truncate text-[10px] font-semibold text-slate-500">
//                     Super Admin
//                   </p>
//                 </div>
//               )}
//             </div>
//             {sidebarExpanded && <ChevronRight className="h-4 w-4 text-slate-400" />}
//           </button>
//         </div>
//       </aside>

//       {/* MAIN CONTENT CONTAINER */}
//       <div
//         className={`flex h-screen flex-1 flex-col overflow-hidden transition-all duration-300 ${
//           sidebarExpanded ? "pl-64" : "pl-20"
//         }`}
//       >
//         {/* TOP HEADER BAR */}
//         <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8">
//           <div className="flex items-center gap-4">
//             <button
//               type="button"
//               onClick={() => setSidebarExpanded(!sidebarExpanded)}
//               className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 transition"
//               title="Toggle Sidebar"
//             >
//               <Menu className="h-5 w-5" />
//             </button>
//             <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
//               <span>Document Editor</span>
//               <span>/</span>
//               <span className="font-bold text-slate-700">{currentPathName()}</span>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <button
//               type="button"
//               className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
//               title="Toggle Theme"
//             >
//               <Sun className="h-4.5 w-4.5" />
//             </button>
//             <button
//               type="button"
//               className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
//               title="Notifications"
//             >
//               <Bell className="h-4.5 w-4.5" />
//               <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
//             </button>
//           </div>
//         </header>

//         {/* OUTLET MAIN CONTENT */}
//         <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8">
//           <Outlet />
//         </main>
//       </div>

//       {/* SUPER ADMIN PROFILE & SECURITY MODAL */}
//       {showProfileModal && (
//         <div
//           className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
//           onMouseDown={(e) => {
//             if (e.target === e.currentTarget) setShowProfileModal(false);
//           }}
//         >
//           <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
//             <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
//               <div className="flex items-center gap-3">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//                   <ShieldCheck className="h-5 w-5" />
//                 </div>
//                 <div>
//                   <h3 className="text-base font-extrabold text-slate-900">
//                     Super Admin Profile &amp; Security
//                   </h3>
//                   <p className="text-xs text-slate-500">System Administrator Settings</p>
//                 </div>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setShowProfileModal(false)}
//                 className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <div className="flex gap-2 px-6 pt-4">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setActiveTab("profile");
//                 }}
//                 className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
//                   activeTab === "profile"
//                     ? "bg-blue-600 text-white shadow-sm"
//                     : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
//                 }`}
//               >
//                 Profile Overview
//               </button>
//             </div>

//             <div className="p-6">
//               {activeTab === "profile" ? (
//                 <div className="space-y-4">
//                   <div className="flex justify-between border-b border-slate-100 pb-3 text-xs">
//                     <span className="font-semibold text-slate-500">Administrator Email</span>
//                     <span className="font-bold text-slate-900">
//                       {user?.email || "superadmin@gmail.com"}
//                     </span>
//                   </div>
//                   <div className="flex justify-between border-b border-slate-100 pb-3 text-xs">
//                     <span className="font-semibold text-slate-500">Account Role</span>
//                     <span className="font-extrabold text-blue-600 uppercase">SUPER ADMIN</span>
//                   </div>
//                   <div className="flex justify-between border-b border-slate-100 pb-3 text-xs">
//                     <span className="font-semibold text-slate-500">Account Status</span>
//                     <span className="flex items-center gap-1.5 font-bold text-emerald-600">
//                       <span className="h-2 w-2 rounded-full bg-emerald-500" />
//                       ACTIVE SESSION
//                     </span>
//                   </div>

//                   <div className="pt-4 flex items-center justify-between">
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setShowProfileModal(false);
//                         logout();
//                         navigate("/login");
//                       }}
//                       className="flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
//                     >
//                       <LogOut className="h-4 w-4" />
//                       Logout
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => setShowProfileModal(false)}
//                       className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
//                     >
//                       Close
//                     </button>
//                   </div>
//                 </div>
//               ) : null}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SuperAdminLayout;
