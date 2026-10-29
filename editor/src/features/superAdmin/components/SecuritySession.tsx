import React from "react";
import { Laptop } from "lucide-react";

const SecuritySessions: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Security &amp; Sessions
        </h1>

        <p className="mt-1 text-xs font-medium text-slate-500">
          Global platform security parameters, active user sessions, and 2FA
          authentication policies.
        </p>
      </div>

      {/* Active Sessions */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
          <Laptop className="h-4 w-4 text-blue-600" />
          Active Super Admin Sessions
        </h3>

        <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs sm:flex-row sm:items-center">
          <div>
            <div className="font-extrabold text-slate-900">
              Current Web Session (Windows Chrome)
            </div>

            <div className="mt-1 font-medium text-slate-400">
              IP: 192.168.1.100 • Last Active: Just now
            </div>
          </div>

          <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600">
            <span className="mr-1">•</span>
            ACTIVE NOW
          </span>
        </div>
      </div>
    </div>
  );
};

export default SecuritySessions;