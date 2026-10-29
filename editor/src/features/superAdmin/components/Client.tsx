import React from "react";
import { useSuperAdminStore } from "../superAdminStore";
import { Briefcase } from "lucide-react";

const Clients: React.FC = () => {
  const { clients } = useSuperAdminStore();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Clients
        </h1>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Registered client organizations using Document Editor platform.
        </p>
      </div>

      {/* Client Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {clients.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Client Information */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600">
                <Briefcase className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-base font-extrabold text-slate-900">
                  {c.name}
                </h3>
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  {c.code}
                </span>
              </div>
            </div>

            {/* Client Details */}
            <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs font-medium text-slate-600">
              <div className="flex items-center justify-between gap-3">
                <span>Admin Contact:</span>
                <span className="text-right font-bold text-slate-900">
                  {c.adminName}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span>Allocated Seats:</span>
                <span className="font-bold text-slate-900">
                  {c.userCount} Users
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {clients.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 text-sm font-bold text-slate-800">
              No clients found
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Registered client organizations will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;