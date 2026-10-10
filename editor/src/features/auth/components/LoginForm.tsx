/*
Purpose:
LoginForm provides the main authentication interface matching the exact light-blue reference design.
Features:
- Centered white card with rounded-[28px] corners and subtle shadow.
- Light-blue shield header icon with LOGIN title and subtitle.
- Pale-blue input fields with cyan envelope and lock icons.
- Remember me checkbox and Forgot Password link row.
- Light-blue login button with right arrow.
- Full viewport pale-blue background with grid lines and ambient glow.
*/
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "@/app/router/routePaths";
import { Role } from "@/app/config/roles";

export default function LoginUI() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("rememberMe") === "true";
  });

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateForm = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setEmailError("Enter a valid email address.");
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required.");
      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberMe");
    }

    const success = await login({
      email,
      password,
    });

    if (!success) return;

    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return;

    switch (user.role) {
      case Role.Admin:
        navigate(ROUTE_PATHS.DASHBOARD, { replace: true });
        break;

      case Role.Author:
        navigate(ROUTE_PATHS.EDITOR, { replace: true });
        break;

      default:
        navigate(ROUTE_PATHS.LOGIN, { replace: true });
        break;
    }
  };

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center p-4 overflow-hidden select-none"
      style={{
        background: "radial-gradient(ellipse at 50% 40%, #FFFFFF 0%, #EEF5FF 45%, #DCE8FA 100%)",
      }}
    >
      {/* Soft ambient radial lighting */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, rgba(211, 227, 253, 0.6) 0%, rgba(238, 245, 255, 0.2) 60%, transparent 100%),
            radial-gradient(circle at 80% 20%, rgba(194, 217, 247, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(194, 217, 247, 0.35) 0%, transparent 50%)
          `,
        }}
      />

      {/* Centered Login Card */}
      <div className="relative z-10 w-full max-w-[420px] rounded-[28px] border border-white/80 bg-white p-8 sm:p-9 shadow-[0_20px_60px_rgba(50,68,128,0.08)]">
        {/* Card Header */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D3E3FD] text-[#1E3A5F] shadow-xs">
            <ShieldCheck className="h-6 w-6 text-[#1E3A5F]" />
          </div>

          <h1 className="text-xl font-bold tracking-wide text-[#1E3A5F]">
            LOGIN
          </h1>

          <p className="mt-1 text-xs text-slate-500 mb-6">
            Welcome back! Please sign in to continue.
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-4"
        >
          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-slate-700"
            >
              Email
            </label>

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#38BDF8]" />

              <input
                id="email"
                type="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                className="h-11 w-full rounded-xl border border-[#D3E3FD] bg-[#EAF2FD] pl-10 pr-4 text-xs font-medium text-[#1E3A5F] placeholder:text-slate-400 outline-none transition-colors focus:border-[#60A5FA] focus:bg-white"
              />
            </div>

            {emailError && (
              <p className="text-[11px] text-destructive">
                {emailError}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-700"
            >
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#38BDF8]" />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                className="h-11 w-full rounded-xl border border-[#D3E3FD] bg-[#EAF2FD] pl-10 pr-10 text-xs font-medium text-[#1E3A5F] placeholder:text-slate-400 outline-none transition-colors focus:border-[#60A5FA] focus:bg-white"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </button>
            </div>

            {passwordError && (
              <p className="text-[11px] text-destructive">
                {passwordError}
              </p>
            )}
          </div>

          {/* Remember Me and Forgot Password Row */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-[#D3E3FD] text-[#2563EB] accent-[#2563EB] cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-600">
                Remember me
              </span>
            </label>

            <button
              type="button"
              onClick={() => navigate(ROUTE_PATHS.FORGOT_PASSWORD)}
              className="text-xs font-semibold text-[#0284C7] hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-button-primary text-xs font-semibold text-button-primary-foreground shadow-xs transition-colors hover:bg-button-primary-hover active:bg-button-primary-active cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#1E3A5F]" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>

          {/* Or continue with divider */}
          <div className="relative my-5 flex items-center justify-center pt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-medium text-slate-400">
              Or continue with
            </span>
          </div>

          {/* Social Logins */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setEmail("admin@gmail.com");
                setPassword("admin123");
              }}
              className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail("admin@gmail.com");
                setPassword("admin123");
              }}
              className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
              </svg>
              <span>Microsoft</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
