// ============================================================
// features/auth/index.ts
// ============================================================
// PURPOSE:
// Public entry point for the Authentication feature.
//
// Other parts of the application should import authentication
// functionality from "@/features/auth" instead of accessing
// internal folders directly.
// ============================================================


// ------------------------------------------------------------
// Pages
// ------------------------------------------------------------

export { Login } from "./pages/Login";

export { default as ForgotPassword }
  from "./pages/ForgotPassword";

export { default as ResetPassword }
  from "./components/ResetPassword";


// ------------------------------------------------------------
// Components
// ------------------------------------------------------------

export { default as LoginForm }
  from "./components/LoginForm";

export { default as ForgotPasswordForm }
  from "./components/ForgotPasswordForm";


// ------------------------------------------------------------
// Hooks
// ------------------------------------------------------------

export { useAuth }
  from "./hooks/useAuth";


// ------------------------------------------------------------
// Context
// ------------------------------------------------------------

export { AuthProvider }
  from "./context/AuthProvider";

export { AuthContext }
  from "./context/AuthContext";

export type {
  AuthContextType,
} from "./context/AuthContext";


// ------------------------------------------------------------
// Services
// ------------------------------------------------------------

export {
  default as AuthService,
} from "./services/authService";


// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export type {
  User,
  LoginRequest,
  LoginResponse,
} from "./types/authTypes";


// ------------------------------------------------------------
// Validation
// ------------------------------------------------------------

export {
  loginSchema,
} from "./schemas/login.schema";

export type {
  LoginFormData,
} from "./schemas/login.schema";

export {
  forgotPasswordSchema,
} from "./schemas/forgotPassword.schema";

export type {
  ForgotPasswordFormData,
} from "./schemas/forgotPassword.schema";
