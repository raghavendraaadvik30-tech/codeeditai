import React from "react";
import { Laptop } from "lucide-react";

export const SecuritySessionsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Security &amp; Sessions</h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Global platform security parameters, active user sessions, and 2FA authentication policies.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Laptop className="h-4 w-4 text-blue-600" />
          Active Super Admin Sessions
        </h3>
        <div className="flex justify-between items-center p-4 border border-slate-100 bg-slate-50 rounded-xl text-xs">
          <div>
            <div className="font-extrabold text-slate-900">Current Web Session (Windows Chrome)</div>
            <div className="text-slate-400 font-medium">IP: 192.168.1.100 • Last Active: Just now</div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600">
            • ACTIVE NOW
          </span>
        </div>
      </div>
    </div>
  );
};
