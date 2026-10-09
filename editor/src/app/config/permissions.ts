import { Role } from "./roles";
// Maps each Role to the permissions that role is allowed to have.
// This is the central place to maintain role-based access rules.
export enum Permission {
  ManageUsers = "MANAGE_USERS",
  ViewDashboard = "VIEW_DASHBOARD",
  EditDocuments = "EDIT_DOCUMENTS",
}
// Admin → Can manage users, access dashboard and edit documents.
// Author → Can access dashboard and edit documents.  --> Cannot manage users.

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.Admin]: [Permission.ManageUsers, Permission.ViewDashboard, Permission.EditDocuments],
  [Role.Author]: [Permission.EditDocuments, Permission.ViewDashboard],
  [Role.Reviewer]: [Permission.ViewDashboard],
};
