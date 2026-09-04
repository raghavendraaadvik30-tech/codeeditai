/**
 * GuestGuard protects public/guest pages such as Login and Register.
 * If the user is already authenticated, redirects them to the appropriate
 * dashboard based on their role. Unauthenticated users can access the page.
 *
 * Role-based authorization is handled separately.
 * Backend integration should update the auth/session source (useAuth);
 * this component should normally remain unchanged.
 */
import React from "react";
import { Navigate } from "react-router-dom";
import  {useAuth} from "@/features/auth/index";



interface GuestGuardProps {
  children: React.ReactNode;
}

export const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    if (user?.role === "admin") { 
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/editor" replace />;
  }

  return <>{children}</>;
};