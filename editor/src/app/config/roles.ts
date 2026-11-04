/**
 * Centralized application roles.
 * Used for role-based navigation, permissions, and access control.
 * Backend authorization should also validate the user's role.
 */
export enum Role {
  Admin = "admin",
  Author = "author",
  SuperAdmin = "super_admin",
}

export function isSuperAdmin(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase().replace(/[-_ ]/g, "");
  return normalized === "superadmin";
}

export function normalizeRole(role?: string | null): Role {
  if (!role) return Role.Author;
  const normalized = role.toLowerCase().replace(/[-_ ]/g, "");
  if (normalized === "superadmin") return Role.SuperAdmin;
  if (normalized === "admin") return Role.Admin;
  return Role.Author;
}
