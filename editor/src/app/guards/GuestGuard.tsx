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
    if (role === Role.SuperAdmin || isSuperAdmin(user?.role)) {
      return <Navigate to={ROUTE_PATHS.SUPER_ADMIN_DASHBOARD} replace />;
    }
    if (role === Role.Admin) {
      return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />;
    }
    return <Navigate to={ROUTE_PATHS.EDITOR} replace />;
  }

  return <>{children}</>;
};
