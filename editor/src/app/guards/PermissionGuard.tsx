/**
 * PermissionGuard:
 * Controls access to pages/components based on user permissions.
 * Checks authentication, identifies the user's role, and verifies
 * whether the required permission is assigned to that role.
 * Redirects unauthenticated users to Login and shows Access Denied
 * when the required permission is missing.
 *
 * Roles and permissions are managed in roles.ts and permissions.ts.
 * Authentication/user data comes from useAuth().
 * Backend must also validate permissions for actual security.
 */
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/index";
//import { useAuthStore } from "../../store/authStore"; 
import { Permission, RolePermissions } from "../config/permissions";
import { Role } from "../config/roles";

interface PermissionGuardProps {
  requiredPermission: Permission;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  requiredPermission,
  children,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/portal/login" replace />;
  }

  const userRole = user.role as Role;
  const permissions = RolePermissions[userRole] || [];

  if (!permissions.includes(requiredPermission)) {
    return (
      <div className="flex h-screen w-full items-center justify-center p-6 bg-muted">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0-8V5m0 16a9 9 0 110-18 9 9 0 010 18z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-foreground">Access Denied</h2>
          <p className="text-sm text-muted-foreground">You lack permission: {requiredPermission}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
