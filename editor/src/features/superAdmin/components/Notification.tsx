import React from "react";
import {
  Bell,
  AlertCircle,
} from "lucide-react";

const Notifications: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Notifications
        </h1>

        <p className="mt-1 text-xs font-medium text-slate-500">
          System notifications, client subscription warnings, and security
          alerts.
        </p>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {/* Subscription Warning */}
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-4 text-xs">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />

          <div>
            <h4 className="font-extrabold text-rose-900">
              Client Subscription Warning
            </h4>

            <p className="mt-0.5 text-rose-700">
              Vanguard Tech Solutions subscription has been suspended due to
              overdue billing invoice.
            </p>

            <span className="mt-1 block text-[10px] font-semibold text-rose-400">
              Today at 12:00 AM
            </span>
          </div>
        </div>

        {/* New Admin Notification */}
        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs">
          <Bell className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

          <div>
            <h4 className="font-extrabold text-blue-900">
              New Admin Account Provisioned
            </h4>

            <p className="mt-0.5 text-blue-700">
              Admin Elena Rostova was registered for Sterling Legal Documents.
            </p>

            <span className="mt-1 block text-[10px] font-semibold text-blue-400">
              Aug 19, 2025
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;