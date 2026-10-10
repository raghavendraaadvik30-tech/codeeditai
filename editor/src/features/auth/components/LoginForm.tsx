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
        backgroundColor: "#EEF5FF",
        backgroundImage: `
          linear-gradient(to right, #DCE8F8 1px, transparent 1px),
          linear-gradient(to bottom, #DCE8F8 1px, transparent 1px)
        `,
        backgroundSize: "44px 44px",
      }}
    >
      {/* Soft blue radial ambient lighting */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 50%, rgba(211, 227, 252, 0.65) 0%, rgba(238, 245, 255, 0.2) 65%, transparent 100%),
            radial-gradient(circle at 80% 30%, rgba(186, 215, 252, 0.4) 0%, transparent 55%),
            radial-gradient(circle at 20% 70%, rgba(186, 215, 252, 0.3) 0%, transparent 55%)
          `,
        }}
      />

      {/* Centered Login Card */}
      <div className="relative z-10 w-full max-w-[470px] rounded-[28px] border border-[#E2EAF4]/90 bg-white p-7 sm:p-9 shadow-[0_12px_45px_rgba(50,68,128,0.08)]">
        {/* Card Header */}
        <div className="text-center">
          <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D3E3FC] text-[#324480] shadow-xs">
            <ShieldCheck className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-black tracking-wide text-[#172B45]">
            LOGIN
          </h1>

          <p className="mt-1 text-xs text-[#718096] mb-6">
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
              className="block text-xs font-semibold text-[#172B45]"
            >
              Email
            </label>

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#69CBE8]" />

              <input
                id="email"
                type="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                className="h-11 w-full rounded-xl border border-[#D6E5F5] bg-[#F5F9FF] pl-10 pr-4 text-xs font-medium text-[#172B45] placeholder:text-[#A0AEC0] outline-none transition-colors focus:border-[#69CBE8] focus:bg-white"
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
              className="block text-xs font-semibold text-[#172B45]"
            >
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#69CBE8]" />

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                className="h-11 w-full rounded-xl border border-[#D6E5F5] bg-[#F5F9FF] pl-10 pr-10 text-xs font-medium text-[#172B45] placeholder:text-[#A0AEC0] outline-none transition-colors focus:border-[#69CBE8] focus:bg-white"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#172B45] transition-colors cursor-pointer"
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
                className="h-4 w-4 rounded border-[#D6E5F5] text-[#324480] accent-[#324480] cursor-pointer"
              />
              <span className="text-xs font-medium text-[#718096]">
                Remember me
              </span>
            </label>

            <button
              type="button"
              onClick={() => navigate(ROUTE_PATHS.FORGOT_PASSWORD)}
              className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-[#C2D8FC] bg-[#D3E3FC] text-xs font-bold text-[#172B45] shadow-xs transition-colors hover:bg-[#C2D8FC] hover:shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#172B45]" />
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
    </div>
  );
}
