
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  FileBarChart,
} from "lucide-react";
import "@/styles/superAdmin.css"

const navigation = [
  {
    label: "Dashboard",
    path: "/super-admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    path: "/super-admin/users",
    icon: Users,
  },
  {
    label: "Workspaces",
    path: "/super-admin/workspaces",
    icon: Building2,
  },
  {
    label: "Reports",
    path: "/super-admin/reports",
    icon: FileBarChart,
  },
  {
    label: "Settings",
    path: "/super-admin/settings",
    icon: Settings,
  },
];

const SuperAdminLayout: React.FC = () => {
  return (
    <div className="super-admin min-h-screen bg-slate-50">
      <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
        <div>
          <h1 className="text-lg font-black text-slate-900">
            Super Admin
          </h1>
          <p className="text-xs text-slate-500">
            Platform Management
          </p>
        </div>

        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
          Administrator
        </span>
      </header>

      <nav className="flex flex-wrap gap-2 border-b border-slate-200 bg-white px-6 py-3">
        {navigation.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <main className="min-w-0 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default SuperAdminLayout;
