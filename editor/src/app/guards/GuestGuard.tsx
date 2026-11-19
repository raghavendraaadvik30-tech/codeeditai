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
import { useAuth } from "@/features/auth/index";
import { Role, isSuperAdmin, normalizeRole } from "../config/roles";
import { ROUTE_PATHS } from "../router/routePaths";

interface GuestGuardProps {
  children: React.ReactNode;
}

export const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    const role = normalizeRole(user?.role);
    // The Super Admin portal is currently disabled (its routes are commented
    // out), so there is nowhere to send a Super Admin. Show the login page
    // instead of redirecting, which would loop back here via "/".
    if (role === Role.SuperAdmin || isSuperAdmin(user?.role)) {
      return <>{children}</>;
    }
    if (role === Role.Admin) {
      return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />;
    }
    return <Navigate to={ROUTE_PATHS.EDITOR} replace />;
  }

  return <>{children}</>;
};
