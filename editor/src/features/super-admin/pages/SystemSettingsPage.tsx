import React from "react";
import { Save } from "lucide-react";

export const SystemSettingsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">System Settings</h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Global platform parameters, default workspace quotas, and security policy configuration.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 mb-3">General Application Settings</h3>
          <div className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-700 mb-1">Platform Name</label>
              <input
                type="text"
                defaultValue="Document Editor Portal"
                className="w-full max-w-md rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">Default User Quota per Workspace</label>
              <input
                type="number"
                defaultValue={25}
                className="w-full max-w-md rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            Save Platform Settings
          </button>
        </div>
      </div>
    </div>
  );
};
