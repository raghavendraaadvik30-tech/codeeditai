 /*
 Purpose: Defines the authentication context contract for the application. It specifies the authentication state (user, token, loading, and error status) and exposes authentication actions such as login, logout, and clearError so components can access them through AuthProvider without directly handling authentication logic.

What each part does
createContext – Creates the React Context used to share authentication data across components.
User, LoginRequest – Imports the TypeScript types that define the logged-in user and login credentials.
AuthContextType – Defines the complete structure of the authentication context.
user – Stores the currently logged-in user, or null when no user is logged in.
token – Stores the authentication token, or null when unavailable.
isAuthenticated – Indicates whether the user is currently authenticated.
isLoading – Indicates whether an authentication operation is in progress.
error – Stores an authentication error message, if any.
login() – Accepts LoginRequest credentials and returns a Promise<boolean> indicating whether login succeeded.
logout() – Clears the current authentication session.
clearError() – Clears the current authentication error.
AuthContext – Creates the context with null as its initial value. The actual values are supplied by AuthProvider.


No backend/API call is made in this file.*/

import { createContext } from "react";
import type {
  User,
  LoginRequest,
} from "../types/authTypes";

export interface AuthContextType {
  // State
  user: User | null;
  token: string | null;

  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Authentication
  login: (
    credentials: LoginRequest
  ) => Promise<boolean>;

  logout: () => void;

  // Helpers
  clearError: () => void;
}

export const AuthContext =
  createContext<AuthContextType | null>(null);