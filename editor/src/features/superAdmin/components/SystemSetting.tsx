
import React, { useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";

const SystemSettings: React.FC = () => {
  const [platformName, setPlatformName] = useState(
    "Document Editor Portal"
  );
  const [userQuota, setUserQuota] = useState(25);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // This updates the local UI only.
    // Connect your backend/API to persist settings permanently.
    setSaved(true);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          System Settings
        </h1>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Global platform parameters, default workspace quotas, and security
          policy configuration.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div>
          <h3 className="mb-3 text-sm font-extrabold text-slate-900">
            General Application Settings
          </h3>

          <div className="space-y-4 text-xs font-semibold">
            <div>
              <label
                htmlFor="platformName"
                className="mb-1 block text-slate-700"
              >
                Platform Name
              </label>
              <input
                id="platformName"
                type="text"
                required
                value={platformName}
                onChange={(e) => {
                  setPlatformName(e.target.value);
                  setSaved(false);
                }}
                className="w-full max-w-md rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="userQuota"
                className="mb-1 block text-slate-700"
              >
                Default User Quota per Workspace
              </label>
              <input
                id="userQuota"
                type="number"
                min={1}
                required
                value={userQuota}
                onChange={(e) => {
                  setUserQuota(Number(e.target.value));
                  setSaved(false);
                }}
                className="w-full max-w-md rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          {saved ? (
            <span className="flex items-center gap-2 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Settings updated in this session
            </span>
          ) : (
            <span className="text-xs text-slate-400">
              Changes are not persisted to the backend yet.
            </span>
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            Save Platform Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;
