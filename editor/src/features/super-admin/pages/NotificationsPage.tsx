import React from "react";
import { Bell, AlertCircle } from "lucide-react";

export const NotificationsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Notifications</h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          System notifications, client subscription warnings, and security alerts.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-4 text-xs">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-rose-900">Client Subscription Warning</h4>
            <p className="text-rose-700 mt-0.5">
              Vanguard Tech Solutions subscription has been suspended due to overdue billing invoice.
            </p>
            <span className="text-[10px] text-rose-400 font-semibold mt-1 block">Today at 12:00 AM</span>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs">
          <Bell className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-blue-900">New Admin Account Provisioned</h4>
            <p className="text-blue-700 mt-0.5">
              Admin Elena Rostova was registered for Sterling Legal Documents.
            </p>
            <span className="text-[10px] text-blue-400 font-semibold mt-1 block">Aug 19, 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
};
