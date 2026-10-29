
import { Role } from "./roles";

// Central place to maintain role-based access rules.
export enum Permission {
  ManageUsers = "MANAGE_USERS",
  ViewDashboard = "VIEW_DASHBOARD",
  EditDocuments = "EDIT_DOCUMENTS",
}

// Admin can manage users, view the dashboard, and edit documents.
// Author can view the dashboard and edit documents.
// SuperAdmin has all permissions defined here.
export const RolePermissions: Record<Role, Permission[]> = {
  [Role.SuperAdmin]: [
    Permission.ManageUsers,
    Permission.ViewDashboard,
    Permission.EditDocuments,
  ],

  [Role.Admin]: [
    Permission.ManageUsers,
    Permission.ViewDashboard,
    Permission.EditDocuments,
  ],

  [Role.Author]: [
    Permission.ViewDashboard,
    Permission.EditDocuments,
  ],
};
