import React from "react";
import { useSuperAdminStore } from "../superAdminStore";

const Subscriptions: React.FC = () => {
  const { clients } = useSuperAdminStore();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Subscription &amp; Billing
        </h1>

        <p className="mt-1 text-xs font-medium text-slate-500">
          Manage corporate licenses, subscription plans, and billing status
          for client organizations.
        </p>
      </div>

      {/* Subscription Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {clients.map((client) => (
          <div
            key={client.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Organization and Status */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-slate-900">
                  {client.name}
                </h3>

                <span className="text-xs font-semibold text-slate-400">
                  {client.code}
                </span>
              </div>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                  client.status === "Active"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {client.status}
              </span>
            </div>

            {/* Subscription Details */}
            <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Current Plan:</span>

                <span className="font-extrabold text-blue-600">
                  {client.plan}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Active Seats:</span>

                <span className="font-bold text-slate-800">
                  {client.userCount} Allocated Seats
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Account Admin:</span>

                <span className="text-right font-bold text-slate-800">
                  {client.adminName}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {clients.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h3 className="text-sm font-bold text-slate-800">
              No subscriptions found
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Client subscription details will appear here when organizations
              are registered.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;