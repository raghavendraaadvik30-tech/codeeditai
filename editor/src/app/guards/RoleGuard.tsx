/**
 * RoleGuard
 * ----------
 * Protects frontend routes/components based on the user's role.
 *
 * Responsibilities:
 * - Checks whether the user is authenticated.
 * - Allows access only when the user's role exists in `allowedRoles`.
 * - Redirects unauthenticated users to Login.
 * - Redirects unauthorized users to Dashboard.
 *
 * Backend integration:
 * - No major changes are required when the backend is connected.
 * - `useAuth()` must receive the real authenticated user and role from the backend/session.
 * - Backend APIs must also enforce authorization; this guard only protects the frontend UI/routes.
 *
 * Usage:
 * <RoleGuard allowedRoles={[Role.Admin]}>
 *   <AdminPage />
 * </RoleGuard>
 */
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/index";
import { Role, normalizeRole } from "../config/roles";
import { ROUTE_PATHS } from "../router/routePaths";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
  }

  if (!user) {
    return null;
  }

  const userRole = normalizeRole(user.role);
  const isAllowed = allowedRoles.some((r) => normalizeRole(r) === userRole);

  if (!isAllowed) {
    return <Navigate to={ROUTE_PATHS.EDITOR} replace />;
  }

  return <>{children}</>;
};
