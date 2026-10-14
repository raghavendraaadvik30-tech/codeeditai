import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import docupilotLogo from "../../../assets/images/docupilot-logo.png";

import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "@/app/router/routePaths";
import { Role } from "@/app/config/roles";

export default function LoginUI() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    () => localStorage.getItem("rememberMe") === "true",
  );
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

    const success = await login({ email, password });
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
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden select-none p-4"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #FFFFFF 0%, #EEF5FF 45%, #DCE8FA 100%)",
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

      <div className="relative z-10 w-full max-w-[480px] rounded-[28px] border border-white/80 bg-white p-6 shadow-[0_20px_60px_rgba(50,68,128,0.08)] sm:p-8">

        {/* DocuPilot Logo and Tagline */}
        <div className="mb-5 flex flex-col items-center">
          <img
            src={docupilotLogo}
            alt="DocuPilot Logo"
            className="h-auto w-[140px] object-contain"
          />

          <h4 className="-mt-1 text-center text-sm font-medium tracking-wide text-[#1E3A5F]">
            Doc. Prep. Reimagined!
          </h4>
        </div>

        {/* Login Header */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold tracking-wide text-[#1E3A5F]">
            LOGIN
          </h1>

          <p className="mt-2 text-xs text-slate-500">
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

        {/* Keep your existing email field, password field,
      remember-me checkbox, forgot-password link,
      and login button here unchanged. */}




        {/* Login Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleLogin();
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
                autoComplete="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                aria-invalid={Boolean(emailError)}
                className="h-11 w-full rounded-xl border border-[#D3E3FD] bg-[#EAF2FD] pl-10 pr-4 text-xs font-medium text-[#1E3A5F] outline-none transition-colors placeholder:text-slate-400 focus:border-[#60A5FA] focus:bg-white"
              />
            </div>
            {emailError && (
              <p className="text-[11px] text-destructive">{emailError}</p>
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
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                aria-invalid={Boolean(passwordError)}
                className="h-11 w-full rounded-xl border border-[#D3E3FD] bg-[#EAF2FD] pl-10 pr-10 text-xs font-medium text-[#1E3A5F] outline-none transition-colors placeholder:text-slate-400 focus:border-[#60A5FA] focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition-colors hover:text-slate-600"
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
              <p className="text-[11px] text-destructive">{passwordError}</p>
            )}
          </div>

          {/* Remember Me and Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex cursor-pointer select-none items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-[#D3E3FD] accent-[#2563EB]"
              />
              <span className="text-xs font-medium text-slate-600">
                Remember me
              </span>
            </label>
            <button
              type="button"
              onClick={() => navigate(ROUTE_PATHS.FORGOT_PASSWORD)}
              className="cursor-pointer text-xs font-semibold text-[#0284C7] hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-button-primary text-xs font-semibold text-button-primary-foreground shadow-xs transition-colors hover:bg-button-primary-hover active:bg-button-primary-active disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div >

  );
}
