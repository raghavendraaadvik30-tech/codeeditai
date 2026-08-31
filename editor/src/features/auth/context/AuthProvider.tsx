/*

Purpose: AuthProvider manages the application's authentication state and makes it available to all child components through AuthContext. It handles login, logout, authentication persistence using localStorage, loading/error states, and communication with AuthService.

What each part does
useState – Stores the current user, authentication token, loading state, and error message.
useEffect – Runs when the provider starts and checks localStorage for a previously saved user so the login state can be restored after a page refresh.
user – Contains the currently authenticated user's information.
token – Stores the authentication token retrieved from localStorage or after successful login.
isAuthenticated – Calculated from the token. If a token exists, it is considered authenticated.
isLoading – Indicates that a login request is currently being processed.
error – Stores login/authentication error messages.
login() – Sends the user's credentials to AuthService.login(). On success, it updates the authentication state and saves the user/token to localStorage.
logout() – Removes the stored user and token and resets the authentication state.
clearError() – Clears the current authentication error.
AuthContext.Provider – Makes all authentication state and functions available to components using useAuth().


When the backend is connected, the main responsibility of this provider remains the same: 
receive the authentication response, store the user/session information, update React state, 
and expose it to the rest of the application.*/

import { useState, useEffect, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { User, LoginRequest } from "../../auth/types/authTypes";
import AuthService from "../services/authService";

interface Props {
  children: ReactNode;
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!token;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = async (
    credentials: LoginRequest
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await AuthService.login(credentials);

      // Login failed / no response
      if (!response) {
        setError("Invalid email or password");
        return false;
      }

      // Save authenticated user
      setUser(response.user);
      setToken(response.token);

      // Persist authentication
      localStorage.setItem("token", response.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      // IMPORTANT:
      // AuthContext expects Promise<boolean>
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed"
      );

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setToken(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}