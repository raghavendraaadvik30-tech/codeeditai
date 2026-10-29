
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/index";
import {
  Key,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { ROUTE_PATHS } from "@/app/router/routePaths";

const SuperAdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();

  const [workspace] = useState("superadmin");
  const [email, setEmail] = useState("superadmin@gmail.com");
  const [password, setPassword] = useState("superadmin123");
  const [localError, setLocalError] = useState("");

  const handleSuperAdminLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLocalError("");

    if (!email.trim() || !password.trim()) {
      setLocalError("Email and password are required.");
      return;
    }

    try {
      const success = await login({
        workspace,
        email,
        password,
      });

      if (success) {
        navigate(ROUTE_PATHS.SUPER_ADMIN_DASHBOARD, {
          replace: true,
        });
      }
    } catch {
      setLocalError("Unable to sign in. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-900 px-4 font-sans text-slate-800">
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-xl">
        {/* Logo Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
            <Key className="h-7 w-7" />
          </div>

          <h1 className="mt-4 text-xl font-black uppercase tracking-wider text-white">
            Super Admin Portal
          </h1>

          <p className="mt-1 text-xs font-medium text-slate-400">
            Platform Administrator Access &amp; Authentication
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSuperAdminLogin}
          className="mt-8 space-y-4"
        >
          {(error || localError) && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs font-bold text-rose-400"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="superadmin-email"
              className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-slate-300"
            >
              Platform Email
            </label>

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                id="superadmin-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@gmail.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-3 pl-10 pr-4 text-xs font-bold text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="superadmin-password"
              className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-slate-300"
            >
              Master Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                id="superadmin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-3 pl-10 pr-4 text-xs font-bold text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              "Authenticate Super Admin"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
