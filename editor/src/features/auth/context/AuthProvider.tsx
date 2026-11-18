
import { useState, useEffect, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { User, LoginRequest } from "../../auth/types/authTypes";
import AuthService from "../services/authService";
import { getErrorMessage } from "@/shared/utils/getErrorMessage";

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

      if (!response) {
        setError("Invalid email or password. Please try again.");
        return false;
      }

      // Save authenticated user
      setUser(response.user);
      setToken(response.token);

      // Persist authentication
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
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
