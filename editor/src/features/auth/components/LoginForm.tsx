/**
 * Login Page
 * -----------
 * Provides the user login interface for the application.
 *
 * Responsibilities:
 * - Collects Workspace, Email, and Password from the user.
 * - Performs basic client-side validation before login.
 * - Displays validation and authentication errors.
 * - Allows the user to show/hide the password.
 * - Provides navigation to the Forgot Password page.
 * - Calls `useAuth().login()` to authenticate the user.
 * - Redirects the user based on their role after successful login.
 *
 * Authentication Flow:
 * Login UI
 *    ↓
 * Form Validation
 *    ↓
 * useAuth().login()
 *    ↓
 * AuthProvider
 *    ↓
 * AuthService / Repository
 *    ↓
 * Backend API
 *    ↓
 * User + Token
 *    ↓
 * Role Check
 *    ↓
 * Admin Dashboard / Editor
 *
 * Backend:
 * This component does not directly communicate with the backend.
 * Authentication is handled through `useAuth()`.
 * When the backend is connected, the login service/repository
 * should handle the actual API request and return the authenticated
 * user and session/token information.
 */import { useState } from "react";
import { useNavigate } from "react-router-dom";


import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Mail,
  Lock,
  Server,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";

import { ROUTE_PATHS } from "@/app/router/routePaths";
import { Role } from "@/app/config/roles";

export default function LoginUI() {
  const navigate = useNavigate();

  const { login, isLoading, error } = useAuth();

  const [workspace, setWorkspace] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [workspaceError, setWorkspaceError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateForm = () => {
    let valid = true;

    setWorkspaceError("");
    setEmailError("");
    setPasswordError("");

    // Workspace Validation
    if (!workspace.trim()) {
      setWorkspaceError("Workspace is required.");
      valid = false;
    }

    // Email Validation
    if (!email.trim()) {
      setEmailError("Email is required.");
      valid = false;
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)
    ) {
      setEmailError("Enter a valid email address.");
      valid = false;
    }

    // Password Validation
    if (!password.trim()) {
      setPasswordError("Password is required.");
      valid = false;
    }

    return valid;
  };

const handleLogin = async () => {
  if (!validateForm()) return;

  const success = await login({
    workspace,
    email,
    password,
  });

  if (!success) return;

  // Get logged in user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) return;

  switch (user.role) {
    case Role.Admin:
      navigate(ROUTE_PATHS.DASHBOARD, {replace:true});
      break;

    case Role.Author:
           
      navigate(ROUTE_PATHS.EDITOR, {replace: true});
      break;

    default:
      navigate(ROUTE_PATHS.LOGIN, {replace:true});
      break;
  }
};
    return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">

      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg">
            <ShieldCheck className="h-7 w-7" />
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-wide text-foreground">
            LOGIN
          </h1>

          <p className="text-sm text-muted-foreground">
            Welcome back! Please sign in to continue.
          </p>

        </div>

        <Card className="rounded-2xl border border-secondary shadow-xl">

          <CardHeader>
            <CardTitle className="text-center text-xl">
              Sign In
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">

            {/* Global Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Workspace */}
            <div className="space-y-2">

              <Label htmlFor="workspace">
                Workspace
              </Label>

              <div className="relative">

                <Server className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="workspace"
                  type="text"
                  placeholder="Enter Workspace"
                  value={workspace}
                  onChange={(e) => {
                    setWorkspace(e.target.value);
                    if (workspaceError) setWorkspaceError("");
                  }}
                  className="pl-10"
                />

              </div>

              {workspaceError && (
                <p className="text-xs text-destructive">
                  {workspaceError}
                </p>
              )}

            </div>

            {/* Email */}
            <div className="space-y-2">

              <Label htmlFor="email">
                Email
              </Label>

              <div className="relative">

                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  className="pl-10"
                />

              </div>

              {emailError && (
                <p className="text-xs text-destructive">
                  {emailError}
                </p>
              )}

            </div>

            {/* Password */}
            <div className="space-y-2">

              <div className="flex items-center justify-between">

                <Label htmlFor="password">
                  Password
                </Label>

                <button
                  type="button"
                  onClick={() => navigate(ROUTE_PATHS.FORGOT_PASSWORD)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot Password?
                </button>

              </div>

              <div className="relative">

                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  className="pl-10 pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

              </div>

              {passwordError && (
                <p className="text-xs text-destructive">
                  {passwordError}
                </p>
              )}

            </div>

            {/* Login Button */}
            <Button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Login"
              )}
            </Button>

          </CardContent>

        </Card>

      </div>

    </div>
  );
}